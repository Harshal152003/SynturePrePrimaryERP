"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, CalendarCheck, CreditCard, Bell, 
  ChevronRight, BookOpen, Clock, Phone, 
  ShieldCheck, ArrowUpRight, Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    children: 0,
    attendance: 0,
    announcements: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, notificationsRes] = await Promise.all([
          fetch("/api/parent/students"),
          fetch("/api/notifications"),
        ]);

        const studentsData = await studentsRes.json();
        const notificationsData = await notificationsRes.json();

        const students = studentsData.students || [];
        setStats({
          children: students.length,
          attendance: 94, // Mocked for summary, real data per-child in views
          announcements: notificationsData.notifications?.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch parent stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    { label: "My Children", icon: Users, href: "/parent-dashboard/children", color: "blue" },
    { label: "Attendance", icon: CalendarCheck, href: "/parent-dashboard/attendance", color: "emerald" },
    { label: "Gallery", icon: ImageIcon, href: "/parent-dashboard/gallery", color: "violet" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-8 md:p-12 mb-8 shadow-2xl shadow-indigo-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
              Hello, {user?.name || "Parent"}! 👋
            </h1>
            <p className="text-indigo-100 text-lg md:text-xl opacity-90 font-medium">
              Keep track of your child&apos;s educational journey.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-white font-bold">Verified Account</p>
              <p className="text-indigo-200 text-xs">Access all parent features</p>
            </div>
          </div>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {[
          { label: "Children", value: stats.children, icon: Users, color: "blue" },
          { label: "Attendance", value: `${stats.attendance}%`, icon: CalendarCheck, color: "emerald" },
          { label: "Updates", value: stats.announcements, icon: Bell, color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-gray-500 text-sm font-semibold">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600" />
            Quick Access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100 transition-all text-center cursor-pointer h-full flex flex-col items-center justify-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl bg-${action.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-7 h-7 text-${action.color}-600`} />
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-violet-700 transition-colors text-sm">{action.label}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Latest Update */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm overflow-hidden relative group">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Support</h2>
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                <Phone className="w-4 h-4 text-pink-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Have questions or need assistance? Our support team is here to help you.
            </p>
            <Link href="/parent-dashboard/contact-school">
              <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-violet-600 transition-colors">
                Contact School <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Banner/Ad-like card */}
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-100">
            <h3 className="font-bold text-lg mb-2">Academic Calendar</h3>
            <p className="text-emerald-50 text-sm opacity-90 mb-4">
              Download the 2025-26 academic calendar and stay ahead of events.
            </p>
            <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-xl font-bold text-sm border border-white/30 hover:bg-white/30 transition-colors">
              View Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
