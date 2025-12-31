import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  await connectDB();

  // Extract token from cookies
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  const user = verifyToken(token);

  // Must be logged in
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Must be PARENT
  if (user.role !== "parent") {
    return NextResponse.json({ success: false, error: "Only parents allowed" }, { status: 403 });
  }

  // Fetch all children for this parent
  const students = await Student.find({
    "parents.parentId": user.id,
  }).lean();

  return NextResponse.json({ success: true, students });
}
