import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Gallery from "@/models/Gallery";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const gallery = await Gallery.findById(id)
      .populate("images.uploadedBy", "name email")
      .populate("images.comments.userId", "name")
      .lean();

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: "Gallery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, gallery });
  } catch (error) {
    console.error("[GET /api/gallery/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery details" },
      { status: 500 }
    );
  }
}
