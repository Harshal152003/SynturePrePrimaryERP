import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { verifyToken } from "@/lib/auth";
import { logAdminActivity } from "@/lib/logAdminActivity";
import { broadcastNotification, notifyClass } from "@/lib/notifications";

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
    const user = verifyToken(token);

    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "10")));
    const status = url.searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("classIds", "name section")
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/events]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
    const user = verifyToken(token);

    if (!user || !["admin", "teacher"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    let { title, description, eventType, startDate, endDate, startTime, endTime, location, image, attachments, targetAudience, classIds, status, notify } = body;

    // Sanitize attachments and image
    attachments = (attachments || []).filter((a: any) => a.url && typeof a.url === "string" && a.url.trim() !== "");
    if (typeof image === "string" && image.trim() === "") image = undefined;

    if (!title || !startDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = new Event({
      title,
      description,
      eventType,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      startTime,
      endTime,
      location,
      image,
      attachments,
      targetAudience,
      classIds,
      status: status || "draft",
      notify,
    });

    await event.save();
    await event.populate("classIds", "name section");

    // Log activity only for admin
    if (user.role === "admin") {
      await logAdminActivity({
        actorId: String(user.id),
        actorRole: user.role,
        action: "create:event",
        message: `Event created: ${event.title}`,
        metadata: {
          eventId: event._id,
          title: event.title,
          eventType: event.eventType,
          status: event.status,
        },
      });
    }

    // Trigger notifications if published
    if (event.status === "published") {
      try {
        const notifOptions = {
          type: "event",
          title: "New Event: " + event.title,
          message: event.description || `A new ${event.eventType} has been scheduled.`,
          metadata: {
            startDate: new Date(startDate).toLocaleDateString(),
            endDate: endDate ? new Date(endDate).toLocaleDateString() : undefined,
            date: new Date(startDate).toLocaleDateString(),
            time: startTime && endTime ? `${startTime} - ${endTime}` : (startTime || ""),
            startTime: startTime,
            endTime: endTime,
            location: event.location,
            image: image || (attachments && attachments.length > 0 ? attachments[0].url : undefined),
            audience: event.targetAudience === 'all' ? 'All' : event.targetAudience.charAt(0).toUpperCase() + event.targetAudience.slice(1),
            attachments: attachments,
          },
          relatedId: event._id,
          relatedModel: "Event",
          icon: "calendar",
        } as any;

        if (event.targetAudience === "all" || !event.classIds || event.classIds.length === 0) {
          await broadcastNotification("all", notifOptions);
        } else if (event.classIds && event.classIds.length > 0) {
          for (const cid of event.classIds) {
            await notifyClass(String(cid._id || cid), notifOptions);
          }
        }
      } catch (notifyError) {
        console.error("Failed to send event notifications:", notifyError);
      }
    }

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/events]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
    const user = verifyToken(token);

    if (!user || !["admin", "teacher"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    let { id, ...updateData } = body;

    // Sanitize attachments and image if they exist in updateData
    if (updateData.attachments) {
      updateData.attachments = updateData.attachments.filter((a: any) => a.url && typeof a.url === "string" && a.url.trim() !== "");
    }
    if (typeof updateData.image === "string" && updateData.image.trim() === "") {
      updateData.image = undefined;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const oldEvent = await Event.findById(id);
    const event = await Event.findByIdAndUpdate(id, updateData, { new: true }).populate(
      "classIds",
      "name section"
    );

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Trigger notifications if status changed to published
    if (updateData.status === "published" && oldEvent.status !== "published") {
      try {
        const notifOptions = {
          type: "event" as any,
          title: "Event Update: " + event.title,
          message: event.description || `The event '${event.title}' has been updated.`,
          metadata: {
            startDate: new Date(event.startDate).toLocaleDateString(),
            endDate: event.endDate ? new Date(event.endDate).toLocaleDateString() : undefined,
            date: new Date(event.startDate).toLocaleDateString(),
            time: event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : (event.startTime || ""),
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            image: event.image || (event.attachments && event.attachments.length > 0 ? event.attachments[0].url : undefined),
            audience: event.targetAudience === 'all' ? 'All' : event.targetAudience.charAt(0).toUpperCase() + event.targetAudience.slice(1),
            attachments: event.attachments,
          },
          relatedId: event._id,
          relatedModel: "Event",
          icon: "calendar",
        } as any;

        if (event.targetAudience === "all" || !event.classIds || event.classIds.length === 0) {
          await broadcastNotification("all", notifOptions);
        } else if (event.classIds && event.classIds.length > 0) {
          for (const cid of event.classIds) {
            await notifyClass(String((cid as any)._id || cid), notifOptions);
          }
        }
      } catch (notifyError) {
        console.error("Failed to send event notifications on update:", notifyError);
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("[PUT /api/events]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
    const user = verifyToken(token);

    if (!user || !["admin", "teacher"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/events]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
