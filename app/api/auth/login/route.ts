import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password, role } = await req.json();
    console.log("[api/auth/login] Login attempt for email:", email, "role:", role);
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["admin", "teacher", "student", "parent"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 }
      );
    }

    let user = null;
    let detectedRole = role || "admin";

    // Search based on the role provided
    if (role === "teacher") {
      user = await Teacher.findOne({ email });
      if (user) {
        detectedRole = "teacher";
      }
    } else if (role === "student") {
      user = await Student.findOne({ email });
      if (user) {
        detectedRole = "student";
      }
    } else if (role === "admin" || !role) {
      // Try User model first (admin/parent)
      user = await User.findOne({ email });
      if (user) {
        detectedRole = user.role || "admin";
      }
    }

    // If user not found with specified role, try other models as fallback
    if (!user) {
      // Try User model
      user = await User.findOne({ email });
      if (user) {
        detectedRole = user.role || "admin";
      }
    }

    if (!user) {
      // Try Teacher model
      user = await Teacher.findOne({ email });
      if (user) {
        detectedRole = "teacher";
      }
    }

    if (!user) {
      // Try Student model
      user = await Student.findOne({ email });
      if (user) {
        detectedRole = "student";
      }
    }

    // If still not found in any model, return error
    if (!user)
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  
    // Check if password field exists
    if (!user.password) {
      return NextResponse.json(
        { error: "User password not set" },
        { status: 400 }
      );
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });

    // Ensure JWT_SECRET is defined
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("[api/auth/login] JWT_SECRET is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = jwt.sign({ id: user._id, role: detectedRole }, jwtSecret, {
      expiresIn: "7d",
    });

    const maxAge = 60 * 60 * 24 * 7; // 7 days

    const res = NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          email: user.email,
          role: detectedRole,
          name: user.name || user.firstName,
        },
      },
      { status: 200 }
    );

    // DEBUG: log environment and token length (do not log token in production)
    try {
      console.log('[api/auth/login] setting cookie, NODE_ENV=', process.env.NODE_ENV, 'token_len=', token.length);
    } catch {
      // ignore logging errors
    }

    // Use NextResponse cookies helper to set an HttpOnly cookie (works in dev & prod)
    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Also set a Set-Cookie header string as a fallback for some clients/dev setups
    const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const cookieString = `token=${token}; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=${maxAge}`;
    res.headers.set("Set-Cookie", cookieString);

    return res;
  } catch (error) {
    console.error("[api/auth/login] Error:", error);
    return NextResponse.json(
      { error: "Internal server error during login" },
      { status: 500 }
    );
  }
}
