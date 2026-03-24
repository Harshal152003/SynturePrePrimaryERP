import { Suspense } from "react";
import AttendanceManagement from "@/components/admin/AttendanceManagement";

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading attendance...</div>}>
      <AttendanceManagement />
    </Suspense>
  );
}
