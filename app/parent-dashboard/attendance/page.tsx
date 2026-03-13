import React, { Suspense } from "react";
import ParentAttendanceView from "@/components/parent/ParentAttendanceView";

export default function ParentAttendancePage() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3f22]" /></div>}>
      <ParentAttendanceView />
    </Suspense>
  );
}
