import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/middlewares/db.config";
import Order from "@/models/Order";
import Product from "@/models/Product";
import InventoryLog from "@/models/InventoryLog";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

dbConfig();

export async function POST(req: NextRequest) {
    try {
        const { cart, deliveryAddress } = await req.json();
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized", success: false },
                { status: 401 }
            );
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        // Validate cart
        if (!cart || cart.length === 0) {
            return NextResponse.json(
                { message: "Cart is empty", success: false },
                { status: 400 }
            );
        }

        // Validate delivery address
        if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.address ||
            !deliveryAddress.district || !deliveryAddress.state || !deliveryAddress.pincode) {
            return NextResponse.json(
                { message: "All delivery address fields are required", success: false },
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
                console.log("Transaction started for COD order");
            } else {
                console.log("Standalone MongoDB detected, proceeding without transaction");
            }
        } catch (e) {
            console.warn("Failed to initialize session/transaction:", e);
            session = null;
        }

        try {
            const firstProduct = cart[0].productId;

            if (!firstProduct) {
                if (session) await session.abortTransaction();
                return NextResponse.json(
                    { message: "Invalid product data in cart", success: false },
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
                    { message: "Product owner information missing", success: false },
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

            // Create COD order
            const newOrder = new Order({
                userId: decoded.id,
                farmerId: farmerId,
                products: orderProducts,
                totalPrice,
                deliveryAddress,
                paymentMethod: "cod",
                paymentStatus: "pending",
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
                    if (session) await session.abortTransaction();
                    return NextResponse.json(
                        { message: `Product not found: ${item.productId.name}`, success: false },
                        { status: 404 }
                    );
                }

                if (product.stock < item.quantity) {
                    if (session) await session.abortTransaction();
                    return NextResponse.json(
                        { message: `Insufficient stock for ${product.name}`, success: false },
                        { status: 400 }
                    );
                }

                const previousStock = product.stock;
                const newStock = previousStock - item.quantity;

                // Atomic stock update with check
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
                    if (session) await session.abortTransaction();
                    return NextResponse.json(
                        { message: `Failed to update stock for ${product.name}. Stock may have changed.`, success: false },
                        { status: 400 }
                    );
                }

                // Create inventory log
                const inventoryLog = new InventoryLog({
                    productId: product._id,
                    farmerId: farmerId,
                    type: "ORDER_PLACED",
                    quantity: item.quantity,
                    previousStock: previousStock,
                    newStock: newStock,
                    orderId: newOrder._id,
                    reason: `Order placed (COD) - Order ID: ${newOrder._id}`
                });

                if (session) {
                    await inventoryLog.save({ session });
                } else {
                    await inventoryLog.save();
                }
            }

            if (session) {
                try {
                    await session.commitTransaction();
                } catch (commitError) {
                    console.error("Failed to commit transaction:", commitError);
                }
            }

            return NextResponse.json({
                success: true,
                message: "COD order placed successfully",
                orderId: newOrder._id,
            });
        } catch (error) {
            if (session) {
                try {
                    await session.abortTransaction();
                } catch (abortError) {
                    console.error("Failed to abort transaction:", abortError);
                }
            }
            throw error;
        } finally {
            if (session) {
                try {
                    await session.endSession();
                } catch (endError) {
                    console.error("Failed to end session:", endError);
                }
            }
        }
    } catch (error: any) {
        console.error("COD Order Error:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error", success: false },
            { status: 500 }
        );
    }
}
