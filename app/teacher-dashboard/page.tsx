"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Alert from "@/components/common/Alert";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  BookOpen,
  Users,
  CheckCircle2,
  ClipboardCheck,
  Calendar,
  Clock,
  Bell,
  TrendingUp,
  AlertCircle,
  FileText,
  School,
  UserCheck
} from "lucide-react";

interface TeacherStats {
  myClasses: number;
  myStudents: number;
  todayAttendance: number;
  upcomingExams: number;
  pendingTasks: number;
}

interface Class {
  _id: string;
  name: string;
  section: string;
  studentCount: number;
}

interface RecentActivity {
  type: string;
  message: string;
  timestamp: Date;
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [stats, setStats] = useState<TeacherStats>({
    myClasses: 0,
    myStudents: 0,
    todayAttendance: 0,
    upcomingExams: 0,
    pendingTasks: 0,
  });
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);

      // Fetch current teacher info
      const userRes = await fetch("/api/auth/profile");
      if (!userRes.ok) throw new Error(`userRes failed: ${await userRes.text()}`);
      const userData = await userRes.json();
      setTeacherInfo(userData.user);

      if (!userData.user || userData.user.role !== "teacher") {
        setAlert({ type: "error", message: "Unauthorized access" });
        return;
      }

      const teacherId = userData.user.id;

      // Fetch teacher's classes (classes where this teacher is assigned)
      const classRes = await fetch(`/api/classes?teacherId=${teacherId}`);
      if (!classRes.ok) throw new Error(`classRes failed: ${await classRes.text()}`);
      const classData = await classRes.json();
      const teacherClasses = classData.classes || [];
      setMyClasses(teacherClasses);

      // Get class IDs for filtering
      const classIds = teacherClasses.map((c: Class) => c._id);

      let myStudents = [];
      let todayAttendanceRecords = [];
      let upcomingExams = [];
      let pendingTasksCount = 0;

      if (classIds.length > 0) {
        // Fetch students in teacher's classes
        const studentRes = await fetch(`/api/students?classIds=${classIds.join(",")}&limit=1000`);
        if (!studentRes.ok) throw new Error(`studentRes failed: ${await studentRes.text()}`);
        const studentData = await studentRes.json();
        myStudents = studentData.students || studentData.data || [];

        // Fetch today's attendance for teacher's classes
        const today = new Date().toISOString().split("T")[0];
        const attendanceRes = await fetch(`/api/attendance?date=${today}&classIds=${classIds.join(",")}&limit=1000`);
        if (!attendanceRes.ok) throw new Error(`attendanceRes failed: ${await attendanceRes.text()}`);
        const attendanceData = await attendanceRes.json();
        todayAttendanceRecords = attendanceData.data || [];

        // Fetch upcoming exams for teacher's classes
        const examRes = await fetch(`/api/exams?classIds=${classIds.join(",")}&limit=1000`);
        if (!examRes.ok) throw new Error(`examRes failed: ${await examRes.text()}`);
        const examData = await examRes.json();
        const allExams = examData.exams || [];
        upcomingExams = allExams.filter((e: any) =>
          new Date(e.startDate) > new Date() && e.status === "scheduled"
        );

        // Determine if attendance should be marked today for each class, if no attendance data is found for a class it implies a pending task.
        const markedClassIds = new Set(todayAttendanceRecords.map((att: any) => att.classId?._id || att.classId));
        const classesNeedingAttendance = classIds.filter((id: string) => !markedClassIds.has(id));

        // Sum total pending tasks (Upcoming exams + Unmarked Attendance)
        pendingTasksCount = upcomingExams.length + classesNeedingAttendance.length;
      }

      // Calculate stats
      setStats({
        myClasses: teacherClasses.length,
        myStudents: myStudents.length,
        todayAttendance: todayAttendanceRecords.filter((a: any) => a.status === "present").length,
        upcomingExams: upcomingExams.length,
        pendingTasks: pendingTasksCount,
      });

      // Mock recent activities (you can fetch actual activities from API)
      setRecentActivities([
        {
          type: "attendance",
          message: "Marked attendance for Class 1A",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          type: "exam",
          message: "Created new exam for Mathematics",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
      ]);

    } catch (error: any) {
      console.error("Failed to fetch teacher data:", error);
      setAlert({ type: "error", message: error.message || "Failed to load dashboard data" });
    } finally {
      setLoading(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "attendance":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "exam":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "assignment":
        return <ClipboardCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      {/* Header */}
      <div className="mt-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {getTimeGreeting()}, {teacherInfo?.name || "Teacher"}!
            </h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your classes today</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <Alert variant={alert.type as any} closable onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-[#e6f0e8] to-[#c8ddc9] border border-[#1a3f22]/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#1a3f22] text-sm font-medium mb-2">My Classes</p>
              <p className="text-4xl font-bold text-[#1a3f22]">{stats.myClasses}</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "#1a3f22" }}>
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#edf4ee] to-[#d4e8d5] border border-[#2e6b3a]/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#2e6b3a] text-sm font-medium mb-2">My Students</p>
              <p className="text-4xl font-bold text-[#2e6b3a]">{stats.myStudents}</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "#2e6b3a" }}>
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#f0f5e9] to-[#daeac0] border border-[#477023]/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#477023] text-sm font-medium mb-2">Today's Attendance</p>
              <p className="text-4xl font-bold text-[#477023]">{stats.todayAttendance}</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "#477023" }}>
              <UserCheck className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#f5f9ec] to-[#e4efc9] border border-[#8DA750]/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#537B2F] text-sm font-medium mb-2">Upcoming Exams</p>
              <p className="text-4xl font-bold text-[#537B2F]">{stats.upcomingExams}</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "#8DA750" }}>
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Classes */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <School className="w-5 h-5 text-[#2e6b3a]" />
                My Classes
              </h2>
              <Link href="/teacher-dashboard/classes" className="text-sm text-[#2e6b3a] hover:text-[#1a3f22] font-medium">
                View All
              </Link>
            </div>

            {myClasses.length > 0 ? (
              <div className="space-y-3">
                {myClasses.slice(0, 5).map((cls) => (
                  <div
                    key={cls._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e6f0e8] rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-[#1a3f22]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {cls.name} - Section {cls.section}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {cls.studentCount || 0} students
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href="/teacher-dashboard/attendance"
                          className="px-3 py-1.5 border text-white rounded-lg text-sm font-medium transition-all text-center block"
                          style={{ background: "linear-gradient(135deg, #1a3f22, #2e6b3a)", borderColor: "#1a3f22" }}
                        >
                          Mark Attendance
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No classes assigned yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Contact administrator to get assigned to classes
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1a3f22]" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/teacher-dashboard/attendance" className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#2e6b3a] hover:bg-[#e6f0e8] transition-all">
                <div className="w-12 h-12 bg-[#e6f0e8] rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[#1a3f22]" />
                </div>
                <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
              </Link>

              <Link href="/teacher-dashboard/exams" className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#2e6b3a] hover:bg-[#e6f0e8] transition-all">
                <div className="w-12 h-12 bg-[#edf4ee] rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#2e6b3a]" />
                </div>
                <span className="text-sm font-medium text-gray-700">View Exams</span>
              </Link>

              <Link href="/teacher-dashboard/students" className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#477023] hover:bg-[#f0f5e9] transition-all">
                <div className="w-12 h-12 bg-[#f0f5e9] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#477023]" />
                </div>
                <span className="text-sm font-medium text-gray-700">View Students</span>
              </Link>

              <Link href="/teacher-dashboard/timetable" className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#537B2F] hover:bg-[#f5f9ec] transition-all">
                <div className="w-12 h-12 bg-[#f5f9ec] rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#537B2F]" />
                </div>
                <span className="text-sm font-medium text-gray-700">View Timetable</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar - Recent Activity & Notifications */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Recent Activity
            </h2>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
            )}
          </div>

          {/* Pending Tasks */}
          <div className="bg-gradient-to-br from-[#fcf5e3] to-[#f4e2b8] border border-[#d6ad45]/40 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-[#b08728]" />
              <h3 className="font-semibold text-[#8c691b]">Pending Tasks</h3>
            </div>
            <p className="text-2xl font-bold text-[#b08728] mb-2">{stats.pendingTasks}</p>
            <p className="text-sm text-[#8c691b]">
              {stats.pendingTasks === 0
                ? "You're all caught up!"
                : "Tasks require your attention"}
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-[#e6f0e8] to-[#c8ddc9] border border-[#1a3f22]/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-[#1a3f22]" />
              <h3 className="font-semibold text-[#1a3f22]">Welcome!</h3>
            </div>
            <p className="text-sm text-[#2e6b3a]">
              Use the sidebar to navigate through your classes, attendance, and student management tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}