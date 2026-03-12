import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import { sendOTPRef } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email: rawEmail } = await req.json();
    const email = rawEmail?.trim();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectDB();

    // 1. Try finding in User model (admin/parent role)
    let user = await User.findOne({ email });

    // 2. Try Teacher model
    if (!user) {
      user = await Teacher.findOne({ email });
    }

    // 3. Try Student model (acts as parent login too)
    if (!user) {
      user = await Student.findOne({ email });
    }

    if (!user) {
      // Return 400 instead of 404 to clarify it's a validation error
      return NextResponse.json({ message: "No account found with this email in the database." }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOTP = otp;
    user.resetOTPExpires = otpExpires;

    console.log(`[forgot-password] Setting OTP for user: ${email} in model: ${user.constructor.modelName}`);
    await user.save();

    await sendOTPRef(email, otp);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal server error: " + error.message }, { status: 500 });
  }
}

// Keep GET for testing if needed
export async function GET() {
  return NextResponse.json({ message: "Forgot Password API is ready" });
}
