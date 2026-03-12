"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, FileText, AlertCircle, Clock, ChevronRight } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";

interface AdmissionStep {
  id: number;
  title: string;
  date: string;
  status: string;
}

interface Admission {
  _id: string;
  studentName: string;
  className: string;
  status: string;
  currentStep?: number;
  steps?: AdmissionStep[];
  documents?: Array<{ name: string; verified: boolean }>;
  adminNote?: string;
  createdAt: string;
}

export default function ParentAdmissionStatusView() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAdmissions(); }, []);

  const fetchAdmissions = async () => {
    try {
      const res = await fetch("/api/parent/admissions");
      const data = await res.json();
      if (data.success) {
        setAdmissions(data.admissions || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Fallback dummy data if no admissions found
  const dummyAdmissions = [{
    _id: "dummy1",
    studentName: "John Doe",
    className: "Lower Kindergarten (LKG)",
    status: "Processing",
    currentStep: 3,
    steps: [
      { id: 1, title: 'Application Submitted', date: '01 Oct 2023', status: 'Completed' },
      { id: 2, title: 'Document Verification', date: '05 Oct 2023', status: 'Completed' },
      { id: 3, title: 'Principal Approval', date: '10 Oct 2023', status: 'Approved' },
      { id: 4, title: 'Fee Payment & Enrollment', date: '-', status: 'Pending Payment' },
    ],
    documents: [
      { name: 'Birth Certificate', verified: true },
      { name: 'Previous School TC', verified: true },
      { name: 'Address Proof', verified: true },
      { name: 'Medical Certificate', verified: false },
    ],
    adminNote: 'Please submit the pending medical certificate within 15 days of admission.',
    createdAt: new Date().toISOString()
  }];

  const displayAdmissions = admissions.length > 0 ? admissions : dummyAdmissions;

  if (loading) return <div className="p-6 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "Admission Status" }]} />

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admission Status</h1>
        <p className="text-gray-500 text-sm mt-1">Track your pending admission applications</p>
      </div>

      <div className="space-y-8 max-w-4xl">
        {displayAdmissions.map((admission) => (
          <div key={admission._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-8 bg-gradient-to-r from-violet-600 to-indigo-700 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{admission.studentName}</h2>
                  <p className="text-violet-100 opacity-90">Class: {admission.className}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-center min-w-[120px]">
                  <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">Application ID</p>
                  <p className="font-mono text-sm">{admission._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Steps */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-violet-600" />
                    Application Progress
                  </h3>
                  <div className="space-y-0">
                    {(admission.steps || dummyAdmissions[0].steps).map((step, idx, arr) => {
                      const currentStep = admission.currentStep || dummyAdmissions[0].currentStep || 1;
                      const isCompleted = step.id < currentStep;
                      const isCurrent = step.id === currentStep;
                      const isLast = idx === arr.length - 1;

                      return (
                        <div key={step.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted ? "bg-emerald-500" : isCurrent ? "bg-violet-600 ring-4 ring-violet-100" : "bg-gray-100"}`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : <div className={`w-2 h-2 rounded-full ${isCurrent ? "bg-white" : "bg-gray-300"}`} />}
                            </div>
                            {!isLast && <div className={`w-0.5 h-12 ${isCompleted ? "bg-emerald-500" : "bg-gray-200"}`} />}
                          </div>
                          <div className="flex-1 pb-8">
                            <p className={`font-bold transition-colors ${isCurrent ? "text-violet-700" : isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                              {step.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">{step.date}</span>
                              {step.status && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${isCurrent ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"}`}>• {step.status}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Docs & Notes */}
                <div className="space-y-8">
                  {/* Documents */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Required Documents
                    </h3>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      {(admission.documents || dummyAdmissions[0].documents).map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <FileText className={`w-4 h-4 ${doc.verified ? "text-emerald-500" : "text-gray-400"}`} />
                            <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                          </div>
                          {doc.verified ? (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg uppercase">Verified</span>
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg uppercase">Pending</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Note */}
                  {admission.adminNote && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4">
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-amber-800 text-sm">Admin Message</p>
                        <p className="text-sm text-amber-700 mt-1 leading-relaxed">{admission.adminNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {displayAdmissions.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Applications Found</h3>
            <p className="text-gray-500">You haven't submitted any new admission applications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
