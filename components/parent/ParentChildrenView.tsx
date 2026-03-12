"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, GraduationCap, CalendarCheck, ChevronRight,
  BookOpen, Bus, Bell, Image, CreditCard, Clock, Phone,
  Lock, Mail, Building2
} from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PageHeader from "@/components/common/PageHeader";

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

export default function ParentChildrenView() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/parent/students");
      const data = await res.json();
      if (data.success) {
        setChildren(data.students || []);
      }
    } catch (err) {
      console.error("Failed to fetch children:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  };

  const avatarColors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "My Children" }]} />

      {/* Header */}
      <div className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Children</h1>
            <p className="text-gray-500 text-sm mt-0.5">Monitor your children's progress and details</p>
          </div>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Children Found</h3>
          <p className="text-gray-500 text-sm">No children are linked to your account yet. Please contact the school.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <div
              key={child._id}
              onClick={() => router.push(`/parent-dashboard/children/${child._id}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-violet-200 transition-all cursor-pointer group overflow-hidden"
            >
              {/* Card Top Accent */}
              <div className={`h-2 bg-gradient-to-r ${avatarColors[index % avatarColors.length]}`} />

              <div className="p-6">
                <div className="flex items-center gap-4 mb-5">
                  {/* Avatar */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <span className="text-white font-bold text-xl">{getInitials(child.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-800 truncate">{child.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Adm: {child.admissionNo || "—"}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 transition-colors flex-shrink-0" />
                </div>

                {/* Info Row */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-violet-600" />
                    </div>
                    <span>Class: <span className="font-medium text-gray-800">{child.className || "—"}</span></span>
                  </div>
                  {child.rollNumber && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>Roll No: <span className="font-medium text-gray-800">{child.rollNumber}</span></span>
                    </div>
                  )}
                  {child.gender && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span>Gender: <span className="font-medium text-gray-800 capitalize">{child.gender}</span></span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/parent-dashboard/attendance?childId=${child._id}`); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-medium transition-colors"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Attendance
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/parent-dashboard/timetable?classId=${child.classId}`); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-medium transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Timetable
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
