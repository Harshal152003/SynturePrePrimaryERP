import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Class from "@/models/Class";
import FeeTransaction from "@/models/FeeTransaction";
import Attendance from "@/models/Attendance";
import Admission from "@/models/Admission";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await connectDB();
        const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
        const user = verifyToken(token);

        if (!user || !["admin", "teacher"].includes(user.role || "admin")) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Run counts and aggregations in parallel on the server
        const [
            totalStudents,
            totalTeachers,
            totalClasses,
            totalAdmissions,
            pendingAdmissions,
            monthlyAttendance,
            feeResult
        ] = await Promise.all([
            Student.countDocuments(),
            Teacher.countDocuments(),
            Class.countDocuments(),
            Admission.countDocuments(),
            Admission.countDocuments({ status: { $in: ["submitted", "pending"] } }),
            Attendance.countDocuments({ date: { $gte: startOfMonth } }),
            FeeTransaction.aggregate([
                { $match: { status: "paid", createdAt: { $gte: startOfYear } } },
                { $group: { _id: null, totalCollected: { $sum: "$amountPaid" } } }
            ])
        ]);

        const totalFees = feeResult.length > 0 ? feeResult[0].totalCollected : 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalStudents,
                totalTeachers,
                totalClasses,
                totalAdmissions,
                pendingAdmissions,
                totalAttendance: monthlyAttendance,
                totalFees
            }
        });

    } catch (error) {
        console.error("Dashboard Stats API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
