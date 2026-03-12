import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await connectDB();
        
        // Extract token from Cookie header
        const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
        
        if (!token) {
            console.log("[change-password] No token found in cookies");
            return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            console.log("[change-password] Token verification failed");
            return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { oldPassword, newPassword } = body;

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ message: "Old and new password are required" }, { status: 400 });
        }

        console.log(`[change-password] Attempting password change for user ID: ${decoded.id}, Role: ${decoded.role}`);

        let userModel: any = User;
        if (decoded.role === "teacher") userModel = Teacher;
        if (decoded.role === "student") userModel = Student;

        let user = await userModel.findById(decoded.id);

        // Fallback for parents who might be in Student model (as per login logic)
        if (!user && decoded.role === "parent") {
            user = await Student.findById(decoded.id);
        }

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if user has a password field (should have one)
        if (!user.password) {
            // This might happen for users imported without passwords or using social login
            // But for this app, they should have passwords.
            console.error(`[change-password] User ${decoded.id} has no password set in database`);
            return NextResponse.json({ message: "Account configuration error. Please contact support." }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            console.log(`[change-password] Password mismatch for user ID: ${decoded.id}`);
            return NextResponse.json({ message: "Incorrect old password" }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);
        
        user.password = hashedPassword;
        await user.save();

        console.log(`[change-password] Password successfully updated for user ID: ${decoded.id}`);

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
        console.error("Change password error:", error);
        return NextResponse.json({ message: "Internal server error: " + error.message }, { status: 500 });
    }
}
