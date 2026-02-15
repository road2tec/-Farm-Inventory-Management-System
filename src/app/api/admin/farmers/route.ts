import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/middlewares/db.config";
import User from "@/models/User";

dbConfig();

export async function GET(req: NextRequest) {
    try {
        // Check if requester is admin (optional, can be added with middleware)

        const farmers = await User.find({ role: "farmer" }).select("-password");

        return NextResponse.json({
            success: true,
            farmers,
        });
    } catch (error) {
        console.error("Fetch Farmers Error:", error);
        return NextResponse.json(
            { message: "Internal server error", success: false },
            { status: 500 }
        );
    }
}
