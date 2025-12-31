import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ClassModel from "@/models/Class";
import { verifyToken } from "@/lib/auth";
import { ClassCreateZ } from "@/lib/validations/classSchema";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
export async function GET(req: Request) {
  await connectDB();

  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const user = verifyToken(token);

  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // Admin + Teacher can fetch classes
  if (!["admin", "teacher"].includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const classes = await ClassModel.find().populate("teachers").populate("students").lean();

  return NextResponse.json({ success: true, classes });
}

export async function POST(req: Request) {
  await connectDB();

  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const user = verifyToken(token);

  if (!user || user.role !== "admin")
    return NextResponse.json({ success: false, error: "Only admin can create classes" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = ClassCreateZ.parse(body);

    const created = await ClassModel.create(parsed);

    return NextResponse.json({ success: true, class: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
