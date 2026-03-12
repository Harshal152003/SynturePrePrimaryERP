import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import Student from "@/models/Student";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  await connectDB();

  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const parent = verifyToken(token);

  if (!parent || parent.role !== "parent")
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });

  // return notifications for parent personally
  const notifications = await Notification.find({
    recipientId: parent.id
  })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, notifications });
}
