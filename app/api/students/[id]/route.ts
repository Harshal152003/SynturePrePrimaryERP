import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import User from "@/models/User";
import { StudentCreateZ } from "@/lib/validations/studentSchema";
import { verifyToken } from "@/lib/auth";
import { logAdminActivity } from "@/lib/logAdminActivity";
import bcryptjs from "bcryptjs";

// ---- FIX: Define Student type ----
interface IStudent {
  _id: string;
  parents?: { parentId?: string; email?: string; phone?: string }[];
  [key: string]: any;
}

// --------------------- GET ---------------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  const token = req.cookies.get("token")?.value;
  const user = verifyToken(token);

  const student =
    (await Student.findById(id).lean<IStudent>()) as IStudent | null;  // ✅ FIX

  if (!student)
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  if (user?.role === "parent") {
    const allowed =
      (student.parents || []).some(
        (p: any) => p.email === user.id || p.phone === user.id
      );

    if (!allowed)
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ success: true, student });
}

// --------------------- PUT ---------------------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await context.params;

  const token = req.cookies.get("token")?.value;
  const user = verifyToken(token);

  if (!user || !["admin", "teacher"].includes(user.role || "admin")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Sanitize: convert empty strings to undefined so optional Zod fields
    // (like email, phone) don't fail validation when form inputs are empty.
    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== "object") return obj;
      const copy: any = Array.isArray(obj) ? [] : {};
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === "string") {
          copy[key] = val.trim() === "" ? undefined : val;
        } else if (Array.isArray(val)) {
          copy[key] = val.map((v) =>
            typeof v === "string" && v.trim() === "" ? undefined : sanitize(v)
          );
        } else if (val && typeof val === "object") {
          copy[key] = sanitize(val);
        } else {
          copy[key] = val;
        }
      }
      return copy;
    };

    const cleanBody = sanitize(body);
    if (Array.isArray(cleanBody.parents)) {
      cleanBody.parents = cleanBody.parents.map((p: any) => {
        if (p && typeof p === "object") {
          if (p.email === "" || p.email === undefined) delete p.email;
          if (p.phone === "" || p.phone === undefined) delete p.phone;
        }
        return p;
      }).filter((p: any) => p && (p.name || p.phone || p.email || p.relation));
    }

    const parsed = StudentCreateZ.partial().parse(cleanBody);

    // Hash password if provided
    if (parsed.password && parsed.password.trim() !== "") {
      parsed.password = await bcryptjs.hash(parsed.password, 10);
    } else {
      // Don't update password if empty or not provided
      delete parsed.password;
    }

    const updated = await Student.findByIdAndUpdate(
      id,
      {
        ...parsed,
        dob: parsed.dob ? new Date(parsed.dob) : undefined,
        admissionDate: parsed.admissionDate
          ? new Date(parsed.admissionDate)
          : undefined,
      },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Sync Parent Email and Password in the User collection
    if (updated.email) {
      // Find existing parent user for this student
      const parentUser = await User.findOne({ studentId: id, role: "parent" });
      if (parentUser) {
        // Update the email
        parentUser.email = updated.email;
        // Optionally update the name while we are here
        if (updated.parents && updated.parents.length > 0 && updated.parents[0].name) {
          parentUser.name = updated.parents[0].name;
        }
        // Sync password if changed
        if (parsed.password) {
          parentUser.password = parsed.password;
        }
        await parentUser.save();
      }
    }

    // Log admin activity
    await logAdminActivity({
      actorId: String(user?.id),
      actorRole: user?.role || "unknown",
      action: "update:student",
      message: `Updated student: ${updated.firstName} ${updated.lastName || ""} (ID: ${id})`,
      metadata: { studentId: id, firstName: updated.firstName, lastName: updated.lastName, admissionNo: updated.admissionNo },
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (err: any) {
    let errorMessage = err.message || "Update failed";
    
    // Handle MongoDB Duplicate Key errors explicitly
    if (errorMessage.includes("E11000 duplicate key error") || errorMessage.includes("duplicate key")) {
      if (errorMessage.includes("admissionNo")) {
        errorMessage = "This Admission Number is already assigned to another student.";
      } else if (errorMessage.includes("email")) {
        errorMessage = "This Email Address is already registered to another user.";
      } else {
        errorMessage = "Duplicate record found. Please ensure unique details.";
      }
    } else {
      // Convert stringified Zod errors into readable format
      if (err.name === "ZodError" || (typeof errorMessage === 'string' && errorMessage.startsWith('['))) {
        try {
          const parsedIssues = JSON.parse(err.message);
          errorMessage = parsedIssues.map((i: any) => {
            const fieldName = i.path.length > 0 ? Array.from(i.path).pop() : "Field";
            return `${fieldName}: ${i.message}`;
          }).join(', ');
        } catch (e) {
          // format fallback
        }
      } else if (err.issues) {
        errorMessage = err.issues.map((i: any) => {
          const fieldName = i.path.length > 0 ? Array.from(i.path).pop() : "Field";
          return `${fieldName}: ${i.message}`;
        }).join(', ');
      }
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}

// --------------------- DELETE ---------------------
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await context.params;

  const token = req.cookies.get("token")?.value;
  const user = verifyToken(token);

  if (!user || (user.role && user.role !== "admin")) {
    return NextResponse.json({ success: false, error: "Only admin can delete" }, { status: 403 });
  }

  const deleted = await Student.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  // Log admin activity
  await logAdminActivity({
    actorId: String(user?.id),
    actorRole: user?.role || "unknown",
    action: "delete:student",
    message: `Deleted student: ${deleted.firstName} ${deleted.lastName || ""} (ID: ${id})`,
    metadata: { studentId: id, firstName: deleted.firstName, lastName: deleted.lastName, admissionNo: deleted.admissionNo },
  });

  return NextResponse.json({ success: true, deletedId: id });
}
