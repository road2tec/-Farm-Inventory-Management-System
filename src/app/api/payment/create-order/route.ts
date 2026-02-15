import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        const { cart } = await req.json();
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized", success: false },
                { status: 401 }
            );
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        if (!cart || cart.length === 0) {
            return NextResponse.json(
                { message: "Cart is empty", success: false },
                { status: 400 }
            );
        }

        // Calculate total amount
        let totalAmount = 0;
        cart.forEach((item: any) => {
            totalAmount += item.productId.price * item.quantity;
        });

        // Create Razorpay order
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: decoded.id,
                itemCount: cart.length,
            },
        };

        const razorpayOrder = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: totalAmount,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Create Razorpay Order Error:", error);
        return NextResponse.json(
            { message: "Failed to create payment order", success: false },
            { status: 500 }
        );
    }
}
