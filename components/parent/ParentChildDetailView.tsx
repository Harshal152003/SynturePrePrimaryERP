"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, GraduationCap, Calendar, Phone,
  Mail, MapPin, Users, BookOpen, CalendarCheck, Clock, CreditCard
} from "lucide-react";

interface Child {
  _id: string;
  name: string;
  admissionNo: string;
  className?: string;
  classId?: string;
  rollNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
}

export default function ParentChildDetailView() {
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchChildDetail(params.id as string);
    }
  }, [params?.id]);

  const fetchChildDetail = async (childId: string) => {
    try {
      const res = await fetch(`/api/parent/students/${childId}`);
      const data = await res.json();
      if (data.success) {
        setChild(data.student || data.data);
      }
    } catch (err) {
      console.error("Failed to fetch child detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="p-6 text-center text-gray-500">Child not found.</div>
    );
  }

  const quickActions = [
    { label: "Attendance", icon: CalendarCheck, color: "violet", href: `/parent-dashboard/attendance?childId=${child._id}` },
    { label: "Timetable", icon: Clock, color: "blue", href: `/parent-dashboard/timetable?classId=${child.classId}` }
  ];

  const infoItems = [
    { label: "Admission No", value: child.admissionNo, icon: GraduationCap },
    { label: "Class", value: child.className, icon: BookOpen },
    { label: "Roll Number", value: child.rollNumber, icon: Users },
    { label: "Date of Birth", value: child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString("en-IN") : null, icon: Calendar },
    { label: "Gender", value: child.gender, icon: User },
    { label: "Phone", value: child.phone, icon: Phone },
    { label: "Email", value: child.email, icon: Mail },
    { label: "Father's Name", value: child.fatherName, icon: User },
    { label: "Mother's Name", value: child.motherName, icon: User },
    { label: "Address", value: child.address, icon: MapPin },
  ].filter(item => item.value);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back button */}
      <button
        onClick={() => router.push("/parent-dashboard/children")}
        className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Children</span>
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)" }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg border-4 border-white">
              <span className="text-white font-bold text-2xl">{getInitials(child.name)}</span>
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-gray-800">{child.name}</h1>
              <p className="text-sm text-gray-500">Class: {child.className || "—"} {child.rollNumber ? `• Roll: ${child.rollNumber}` : ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-6 max-w-sm">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={`flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-${action.color}-200 hover:shadow-md transition-all group`}
          >
            <div className={`w-10 h-10 rounded-xl bg-${action.color}-50 flex items-center justify-center group-hover:bg-${action.color}-100 transition-colors`}>
              <action.icon className={`w-5 h-5 text-${action.color}-600`} />
            </div>
            <span className="text-xs font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-500" />
          Student Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-violet-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <item.icon className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
