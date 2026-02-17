import StudentFeeDetails from "@/components/admin/StudentFeeDetails";

interface Props {
    params: {
        id: string;
    };
}

export default function StudentFeeDetailsPage({ params }: Props) {
    return <StudentFeeDetails studentId={params.id} />;
}
