import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConfig from "@/middlewares/db.config";
import Order from "@/models/Order";
import Product from "@/models/Product";
import InventoryLog from "@/models/InventoryLog";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

dbConfig();

export async function POST(req: NextRequest) {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            cart,
            deliveryAddress,
        } = await req.json();

        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized", success: false },
                { status: 401 }
            );
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        // Verify Razorpay signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (generatedSignature !== razorpaySignature) {
            return NextResponse.json(
                { message: "Payment verification failed", success: false },
                { status: 400 }
            );
        }

        // Start a MongoDB session for atomic operations
        let session: any = null;
        try {
            // Check if environment supports transactions (Replica Set required)
            const isReplicaSet = await mongoose.connection.db.admin().command({ isMaster: 1 })
                .then(res => !!res.setName || !!res.isreplicaset)
                .catch(() => false);

            if (isReplicaSet) {
                session = await mongoose.startSession();
                session.startTransaction();
                console.log("Transaction started for payment verification");
            } else {
                console.log("Standalone MongoDB detected, proceeding without transaction");
            }
        } catch (e) {
            console.warn("Failed to initialize session/transaction:", e);
            session = null;
        }

        try {
            // Validate cart
            if (!cart || cart.length === 0) {
                if (session) await session.abortTransaction();
                return NextResponse.json(
                    { message: "Cart is empty", success: false },
                    { status: 400 }
                );
            }

            // Validate delivery address
            if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.address ||
                !deliveryAddress.district || !deliveryAddress.state || !deliveryAddress.pincode) {
                if (session) await session.abortTransaction();
                return NextResponse.json(
                    { message: "All delivery address fields are required", success: false },
                    { status: 400 }
                );
            }

            // Payment verified, create order
            const firstProduct = cart[0].productId;

            if (!firstProduct) {
                if (session) await session.abortTransaction();
                return NextResponse.json(
                    { message: "Invalid product data in cart: missing productId", success: false },
                    { status: 400 }
                );
            }

            // Handle both populated (object) and non-populated (string) ownerId
            const farmerId = typeof firstProduct.ownerId === 'object' && firstProduct.ownerId !== null
                ? firstProduct.ownerId._id || firstProduct.ownerId
                : firstProduct.ownerId;

            if (!farmerId) {
                if (session) await session.abortTransaction();
                return NextResponse.json(
                    { message: "Product owner information (farmerId) missing", success: false },
                    { status: 400 }
                );
            }

            let totalPrice = 0;
            const orderProducts = cart.map((item: any) => {
                totalPrice += item.productId.price * item.quantity;
                return {
                    product: item.productId._id,
                    quantity: item.quantity,
                };
            });

            const newOrder = new Order({
                userId: decoded.id,
                farmerId: farmerId,
                products: orderProducts,
                totalPrice,
                deliveryAddress,
                paymentMethod: "online",
                paymentStatus: "completed",
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
            });

            if (session) {
                await newOrder.save({ session });
            } else {
                await newOrder.save();
            }

            // Update stock and create inventory logs
            for (const item of cart) {
                const product = session
                    ? await Product.findById(item.productId._id).session(session)
                    : await Product.findById(item.productId._id);

                if (!product) {
                    throw new Error(`Product ${item.productId.name || item.productId._id} not found`);
                }

                // Check if sufficient stock is available
                if (product.stock < item.quantity) {
                    throw new Error(
                        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                    );
                }

                const previousStock = product.stock;
                const newStock = previousStock - item.quantity;

                // Atomically update stock
                let updatedProduct;
                if (session) {
                    updatedProduct = await Product.findOneAndUpdate(
                        {
                            _id: item.productId._id,
                            stock: { $gte: item.quantity },
                        },
                        {
                            $inc: { stock: -item.quantity },
                        },
                        { new: true, session }
                    );
                } else {
                    updatedProduct = await Product.findOneAndUpdate(
                        {
                            _id: item.productId._id,
                            stock: { $gte: item.quantity },
                        },
                        {
                            $inc: { stock: -item.quantity },
                        },
                        { new: true }
                    );
                }

                if (!updatedProduct) {
                    throw new Error(
                        `Failed to update stock for ${product.name}. Stock may have changed.`
                    );
                }

                // Create inventory log
                const logData = {
                    productId: item.productId._id,
                    farmerId: farmerId,
                    type: "ORDER_PLACED",
                    quantity: item.quantity,
                    previousStock: previousStock,
                    newStock: newStock,
                    orderId: newOrder._id,
                    reason: `Order placed by customer. Order ID: ${newOrder._id}`,
                };

                if (session) {
                    await InventoryLog.create([logData], { session });
                } else {
                    await InventoryLog.create(logData);
                }
            }

            // Commit the transaction
            if (session) {
                try {
                    await session.commitTransaction();
                } catch (commitError) {
                    console.error("Failed to commit transaction:", commitError);
                }
            }

            return NextResponse.json({
                success: true,
                message: "Payment verified and order created successfully",
                order: newOrder,
            });
        } catch (error: any) {
            // Rollback transaction on error
            if (session) {
                try {
                    await session.abortTransaction();
                } catch (abortError) {
                    console.error("Failed to abort transaction:", abortError);
                }
            }
            console.error("Transaction Error:", error);

            return NextResponse.json(
                {
                    message: `Internal processing error: ${error.message || "Failed to process order"}`,
                    success: false,
                },
                { status: 400 }
            );
        } finally {
            if (session) {
                try {
                    await session.endSession();
                } catch (endError) {
                    console.error("Failed to end session:", endError);
                }
            }
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json(
            { message: "Payment verification failed", success: false },
            { status: 500 }
        );
    }
}
