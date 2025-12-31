// lib/admissionNumber.ts
import Admission from "@/models/Admission";

export async function generateAdmissionNo(prefix = "ADM") {
  // Example: ADM-2025-00012
  const year = new Date().getFullYear();
  const count = await Admission.countDocuments({ createdAt: { $gte: new Date(`${year}-01-01`) } });
  const seq = String(count + 1).padStart(5, "0");
  return `${prefix}-${year}-${seq}`;
}
