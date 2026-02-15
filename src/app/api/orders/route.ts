import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/middlewares/db.config";
import Order from "@/models/Order";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

dbConfig();

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role") || decoded.role;

        let query = {};
        if (role === "farmer") {
            query = { farmerId: decoded.id };
        } else if (role === "user") {
            query = { userId: decoded.id };
        }
        // For admin, query remains empty to fetch all orders

        const orders = await Order.find(query)
            .populate("userId", "name email")
            .populate("farmerId", "name email")
            .populate("products.product")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { cart } = await req.json();
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        if (!cart || cart.length === 0) {
            return NextResponse.json({ message: "Cart is empty", success: false }, { status: 400 });
        }

        // group products by farmer (for simplicity, we assume one farmer per cart from the UI, but let's handle the first one)
        const firstProduct = cart[0].productId;
        const farmerId = firstProduct.ownerId; // We need to ensure ownerId is populated or provided

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
        });

        await newOrder.save();

        // Update stock (optional but good)
        for (const item of cart) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { stock: -item.quantity },
            });
        }

        return NextResponse.json({
            success: true,
            message: "Order placed successfully",
            order: newOrder,
        });

    } catch (error) {
        console.error("Place Order Error:", error);
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
    }
}
