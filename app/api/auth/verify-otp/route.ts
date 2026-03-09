import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";

export async function POST(req: Request) {
    try {
        const { email: rawEmail, otp } = await req.json();
        const email = rawEmail?.trim();

        if (!email || !otp) {
            return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
        }

        await connectDB();

        const query = {
            email,
            resetOTP: otp,
            resetOTPExpires: { $gt: new Date() }
        }

        let user = await User.findOne(query);

        if (!user) {
            user = await Teacher.findOne(query);
        }

        if (!user) {
            user = await Student.findOne(query);
        }

        if (!user) {
            return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
        }

        return NextResponse.json({ message: "OTP verified correctly" });
    } catch (error: any) {
        console.error("Verify OTP error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
