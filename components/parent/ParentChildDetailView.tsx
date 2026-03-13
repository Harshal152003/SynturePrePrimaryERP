"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, GraduationCap, Calendar, Phone,
  Mail, MapPin, Users, BookOpen, CalendarCheck, Clock, ChevronRight
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
      <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-violet-400 opacity-20"></div>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Child Not Found</h2>
        <p className="text-gray-500 mb-6 text-center max-w-sm">We couldn't find the details for this child. They may have been removed or you lack permissions.</p>
        <button
          onClick={() => router.push("/parent-dashboard/children")}
          className="px-6 py-2.5 bg-violet-600 text-white font-medium rounded-full hover:bg-violet-700 transition-colors shadow-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const quickActions = [
    {
      label: "Attendance",
      icon: CalendarCheck,
      colors: {
        bgHover: "hover:border-violet-300 hover:shadow-violet-500/10",
        gradient: "from-violet-50/50",
        iconBg: "bg-violet-100/50",
        iconBgHover: "group-hover:bg-violet-100",
        iconText: "text-violet-600",
        arrowHover: "group-hover:text-violet-600"
      },
      href: `/parent-dashboard/attendance?childId=${child._id}`
    },
    {
      label: "Timetable",
      icon: Clock,
      colors: {
        bgHover: "hover:border-indigo-300 hover:shadow-indigo-500/10",
        gradient: "from-indigo-50/50",
        iconBg: "bg-indigo-100/50",
        iconBgHover: "group-hover:bg-indigo-100",
        iconText: "text-indigo-600",
        arrowHover: "group-hover:text-indigo-600"
      },
      href: `/parent-dashboard/timetable?classId=${child.classId}`
    }
  ];

  const infoGroups = [
    {
      title: "Academic Profile",
      items: [
        { label: "Admission No", value: child.admissionNo, icon: GraduationCap },
        { label: "Roll Number", value: child.rollNumber, icon: Users },
      ].filter(item => item.value)
    },
    {
      title: "Personal Information",
      items: [
        { label: "Date of Birth", value: child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString("en-IN") : null, icon: Calendar },
        { label: "Gender", value: child.gender, icon: User },
      ].filter(item => item.value)
    },
    {
      title: "Contact & Family",
      items: [
        { label: "Phone", value: child.phone, icon: Phone },
        { label: "Email", value: child.email, icon: Mail },
        { label: "Father's Name", value: child.fatherName, icon: User },
        { label: "Mother's Name", value: child.motherName, icon: User },
        { label: "Address", value: child.address, icon: MapPin },
      ].filter(item => item.value)
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/parent-dashboard/children")}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200/80 rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:text-violet-700 transition-all duration-300 group shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Children
          </button>
        </div>

        {/* Main Profile Header */}
        <div className="relative bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100/80">
          {/* Banner */}
          <div className="h-48 sm:h-56 relative overflow-hidden bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-600">
            {/* Abstract glass shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl translate-y-1/4"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          </div>

          <div className="px-6 sm:px-12 pb-10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-8 -mt-24 mb-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-36 h-36 rounded-[2rem] bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden transform transition-all group-hover:scale-[1.02] duration-300">
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent"></div>
                  <span className="text-violet-700 font-black text-5xl tracking-tight relative z-10 drop-shadow-sm">{getInitials(child.name)}</span>
                </div>
                {/* Status indicator */}
                <div className="absolute bottom-3 right-3 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-md"></div>
              </div>

              {/* Name & Basic Info */}
              <div className="flex-1 pb-3">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3 drop-shadow-sm">{child.name}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-100/80 text-violet-800 text-sm font-bold border border-violet-200/60 shadow-sm backdrop-blur-sm">
                    <GraduationCap className="w-4 h-4" strokeWidth={2.5} />
                    {child.className || "Unassigned"}
                  </span>
                  {child.rollNumber && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 text-indigo-700 text-sm font-bold border border-indigo-100 shadow-sm">
                      <Users className="w-4 h-4" strokeWidth={2.5} />
                      Roll: {child.rollNumber}
                    </span>
                  )}
                  {child.admissionNo && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 text-blue-700 text-sm font-bold border border-blue-100 shadow-sm">
                      <BookOpen className="w-4 h-4" strokeWidth={2.5} />
                      Adm: {child.admissionNo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* Left Column: Actions */}
          <div className="xl:col-span-1 space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className={`group relative flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100/80 ${action.colors.bgHover} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.colors.gradient} to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out`}></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-xl ${action.colors.iconBg} flex items-center justify-center ${action.colors.iconText} group-hover:scale-110 ${action.colors.iconBgHover} transition-all duration-300`}>
                      <action.icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors uppercase tracking-wide text-xs">{action.label}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all relative z-10 text-gray-400 ${action.colors.arrowHover}`}>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Info Bento Box */}
          <div className="xl:col-span-3">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2 mb-4">Complete Profile</h3>

            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100/80">

                {infoGroups.map((group, groupIdx) => (
                  <div key={group.title} className={`p-8 sm:p-10 ${groupIdx === 2 ? 'md:col-span-2 border-t border-gray-100/80 bg-gray-50/30' : ''}`}>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-violet-200/60"></span>
                      {group.title}
                    </h4>

                    <div className={`grid grid-cols-1 ${groupIdx === 2 ? 'sm:grid-cols-2 lg:grid-cols-3' : ''} gap-x-8 gap-y-8`}>
                      {group.items.map((item, index) => (
                        <div key={item.label} className="group relative flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-200 group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <item.icon className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 transition-colors">{item.label}</p>
                            <p className="text-sm font-semibold text-gray-800 break-words leading-relaxed group-hover:text-violet-900 transition-colors">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
