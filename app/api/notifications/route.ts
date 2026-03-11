import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import Student from "@/models/Student";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
    const user = verifyToken(token);

    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "20")));
    const unreadOnly = url.searchParams.get("unread") === "true";

    const filter: any = { recipientId: user.id };

    if (unreadOnly) filter.isRead = false;

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("recipientId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
    const user = verifyToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { recipientId, type, title, message, priority, actionUrl, icon } = body;

    if (!recipientId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const notification = new Notification({
      recipientId,
      type,
      title,
      message,
      priority,
      actionUrl,
      icon,
    });

    await notification.save();
    await notification.populate("recipientId", "name email");

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/notifications]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, isRead, markAllRead } = body;

    // "Mark All Read" logic
    if (markAllRead) {
      await Notification.updateMany({ recipientId: user.id, isRead: false }, { isRead: true, readAt: new Date() });
      return NextResponse.json({ success: true, message: "Marked all as read" });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (isRead !== undefined) {
      updateData.isRead = isRead;
      if (isRead) updateData.readAt = new Date();
    }

    const notification = await Notification.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("recipientId", "name email");

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("[PUT /api/notifications]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      await Notification.deleteMany({ recipientId: user.id });
      return NextResponse.json({ success: true, message: "All notifications cleared" });
    }

    // Try reading from body as a fallback if not in query params
    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {
        // Body might not exist
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 });
    }

    // Try finding it first to differentiate between not found vs unauthorized
    const existing = await Notification.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Notification not found in database" }, { status: 404 });
    }

    // Check ownership
    if (String(existing.recipientId) !== String(user.id)) {
      return NextResponse.json({ success: false, error: "Unauthorized to delete this notification" }, { status: 403 });
    }

    await Notification.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/notifications]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
