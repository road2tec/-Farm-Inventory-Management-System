import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/middlewares/db.config";
import User from "@/models/User";
import jwt from "jsonwebtoken";

dbConfig();

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        // Only admin can access this
        if (decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden - Admin only", success: false }, { status: 403 });
        }

        // Fetch all users
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
    }
}
