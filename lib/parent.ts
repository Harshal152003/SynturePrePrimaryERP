import Student from "@/models/Student";

// Define the Parent type for the parents array
interface Parent {
  parentId: string; // Adjust to ObjectId if needed
  [key: string]: unknown; // Allow additional fields
}

// Define the Student type for lean() result
interface StudentLean {
  _id: string;
  parents?: Parent[];
  [key: string]: unknown; // Allow additional fields
}

export async function parentOwnsStudent(studentId: string, parentId: string): Promise<StudentLean | null> {
  const student = await Student.findById(studentId).lean<StudentLean>();
  if (!student) return null;

  const isParent = (student.parents || []).some(
    (p: Parent) => String(p.parentId) === String(parentId)
  );

  return isParent ? student : null;
}