import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ClassModel from "@/models/Class";
import { verifyToken } from "@/lib/auth";
import { ClassCreateZ } from "@/lib/validations/classSchema";

export async function GET(req: Request, { params }: any) {
  await connectDB();

  const classData = await ClassModel.findById(params.id)
    .populate("teachers")
    .populate("students")
    .lean();

  if (!classData) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true, class: classData });
}

export async function PUT(req: Request, { params }: any) {
  await connectDB();

  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const user = verifyToken(token);
  if (!user || user.role !== "admin")
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = ClassCreateZ.partial().parse(body);

    const updated = await ClassModel.findByIdAndUpdate(params.id, parsed, { new: true });

    return NextResponse.json({ success: true, class: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  await connectDB();

  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const user = verifyToken(token);

  if (!user || user.role !== "admin")
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });

  const deleted = await ClassModel.findByIdAndDelete(params.id);

  if (!deleted) return NextResponse.json({ success: false, error: "Not found" });

  return NextResponse.json({ success: true, deletedId: params.id });
}
