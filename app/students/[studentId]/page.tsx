import React from "react";
import StudentDetailClient from "../_client/StudentDetailClient";

type Props = { params: { studentId: string } };

export default function StudentDetailPage({ params }: Props) {
  return <StudentDetailClient studentId={params.studentId} />;
}
