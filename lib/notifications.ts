import Notification from "@/models/Notification";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";

export type NotificationType = "event" | "announcement" | "fee" | "attendance" | "exam" | "transport" | "meal" | "system";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

interface NotificationOptions {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
    relatedModel?: string;
    priority?: NotificationPriority;
    actionUrl?: string;
    icon?: string;
    metadata?: any;
}

export async function createNotification(options: NotificationOptions) {
    try {
        await connectDB();
        const notification = new Notification({
            ...options,
            isRead: false,
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error);
        return null;
    }
}

export async function broadcastNotification(
    target: "all" | "parents" | "teachers" | "students",
    options: Omit<NotificationOptions, "recipientId">
) {
    try {
        await connectDB();
        let userIds: string[] = [];

        if (target === "all") {
            const all = await User.find({}, "_id");
            userIds = all.map(u => String(u._id));
        } else if (target === "parents") {
            const parents = await User.find({ role: "parent" }, "_id");
            userIds = parents.map(u => String(u._id));
        } else if (target === "teachers") {
            const teachers = await User.find({ role: "teacher" }, "_id");
            userIds = teachers.map(u => String(u._id));
        } else if (target === "students") {
            const students = await User.find({ role: "student" }, "_id");
            userIds = students.map(u => String(u._id));
        }

        const notifications = userIds.map(uid => ({
            ...options,
            recipientId: uid,
            isRead: false,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return true;
    } catch (error) {
        console.error("Failed to broadcast notification:", error);
        return false;
    }
}

export async function notifyClass(
    classId: string,
    options: Omit<NotificationOptions, "recipientId">
) {
    try {
        await connectDB();
        // 1. Get all students in the class
        const students = await Student.find({ classId }, "parents email");

        const recipientIds = new Set<string>();

        for (const student of students) {
            // 1. Add student ID (for student login & legacy parent login via student ID)
            recipientIds.add(String(student._id));

            // 2. Add student's own User record if exists
            if (student.email) {
                const studentUser = await User.findOne({ email: student.email }, "_id");
                if (studentUser) recipientIds.add(String(studentUser._id));
            }

            // 3. Add linked parents (via parentId or email)
            if (student.parents && student.parents.length > 0) {
                for (const p of student.parents) {
                    const parent = p as any;
                    if (parent.parentId) {
                        recipientIds.add(String(parent.parentId));
                    } else if (parent.email) {
                        const parentUser = await User.findOne({ email: parent.email }, "_id");
                        if (parentUser) recipientIds.add(String(parentUser._id));
                    }
                }
            }
        }

        // 4. ALSO: Find all Users with role 'parent' who have any of these studentIds linked
        // This handles cases where the link exists in the User record but not in the Student record
        const studentIdsStrings = Array.from(recipientIds);
        const externalParents = await User.find({
            role: "parent",
            $or: [
                { studentId: { $in: studentIdsStrings } },
                { children: { $in: studentIdsStrings } }
            ]
        }, "_id");
        
        for (const p of externalParents) {
            recipientIds.add(String(p._id));
        }

        const notifications = Array.from(recipientIds).map(uid => ({
            ...options,
            recipientId: uid,
            classId: classId, // Add classId so it can be filtered in parent portal
            isRead: false,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`Sent ${notifications.length} notifications to class ${classId}`);
        } else {
            console.log(`No recipients found for class ${classId} notifications`);
        }

        return true;
    } catch (error) {
        console.error("Failed to notify class:", error);
        return false;
    }
}
