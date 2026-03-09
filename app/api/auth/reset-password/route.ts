import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email: rawEmail, otp, newPassword: rawPassword } = await req.json();
        const email = rawEmail?.trim();
        const newPassword = rawPassword?.trim();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        console.log(`[reset-password] Attempting reset for email: ${email}`);

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

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log(`[reset-password] Found user in model: ${user.constructor.modelName}. Updating email: ${email}`);
        console.log(`[reset-password] Salt created. Hashing password of length: ${newPassword.length}`);
        user.password = hashedPassword;
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();
        console.log(`[reset-password] Password successfully updated and saved for: ${email}. New hash starts with: ${hashedPassword.substring(0, 10)}`);

        return NextResponse.json({ message: "Password reset successful" });
    } catch (error: any) {
        console.error("Reset password error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
