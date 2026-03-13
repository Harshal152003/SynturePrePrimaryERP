import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import { verifyToken } from "@/lib/auth";

// 🔥 FIX: Student Type
interface IStudent {
  _id: string;
  parents?: { parentId: string, email?: string }[];
  [key: string]: any;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : req.cookies.get("token")?.value;
    const user = verifyToken(token);

    if (!user || user.role !== "parent") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const student = await Student.findById(id).populate("classId", "name").lean<any>();

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const studentIdFromUser = (user as any).studentId || user.id;
    const userEmail = (user as any).email;

    const isDirectLogin = String(student._id) === String(studentIdFromUser);
    const isParentIdMatch = (student.parents || []).some(
      (p: any) => String(p.parentId) === String(user.id)
    );
    const isParentEmailMatch = userEmail && (student.parents || []).some(
      (p: any) => p.email === userEmail
    );

    if (!isDirectLogin && !isParentIdMatch && !isParentEmailMatch) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (student.classId && typeof student.classId === 'object') {
      student.className = student.classId.name;
      student.classId = student.classId._id;
    }

    student.name = `${student.firstName} ${student.lastName || ''}`.trim();

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error("Error in parent child detail API:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
