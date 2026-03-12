"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarCheck, CheckCircle2, XCircle, Clock,
  AlertCircle, ChevronLeft, ChevronRight, Filter, Users
} from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";

interface AttendanceRecord {
  date: string;
  status: string;
  subject?: string;
}

interface Child {
  _id: string;
  name: string;
  admissionNo: string;
  className?: string;
  classId?: string;
}

export default function ParentAttendanceView() {
  const searchParams = useSearchParams();
  const preselectedChildId = searchParams.get("childId");

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Month Navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => { fetchChildren(); }, []);

  useEffect(() => {
    if (selectedChildId) fetchAttendance(selectedChildId);
  }, [selectedChildId, currentMonth]);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/parent/students");
      const data = await res.json();
      if (data.success) {
        const list = data.students || [];
        setChildren(list);
        const initial = preselectedChildId || (list[0]?._id ?? "");
        setSelectedChildId(initial);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (childId: string) => {
    setAttendanceLoading(true);
    try {
      const res = await fetch(`/api/parent/attendance/${childId}`);
      const data = await res.json();
      if (data.success) {
        setAttendance(data.attendance || []);
      } else {
        setAttendance([]);
      }
    } catch (err) {
      console.error(err);
      setAttendance([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "present" || s === "p") return { label: "Present", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" };
    if (s === "absent" || s === "a") return { label: "Absent", icon: XCircle, color: "text-red-500", bg: "bg-red-50", dot: "bg-red-500" };
    if (s === "late" || s === "l") return { label: "Late", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" };
    return { label: "Excused", icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-50", dot: "bg-blue-400" };
  };

  const monthStr = currentMonth.toISOString().slice(0, 7);
  const monthAttendance = attendance.filter(a => a.date?.startsWith(monthStr));

  const presentCount = monthAttendance.filter(a => ["present", "p"].includes(a.status?.toLowerCase())).length;
  const absentCount = monthAttendance.filter(a => ["absent", "a"].includes(a.status?.toLowerCase())).length;
  const lateCount = monthAttendance.filter(a => ["late", "l"].includes(a.status?.toLowerCase())).length;
  const total = monthAttendance.length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const monthLabel = currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  // Build calendar days
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const getAttendanceForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return attendance.find(a => a.date?.startsWith(dateStr));
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "Attendance" }]} />

      <div className="mt-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Track your child's daily attendance</p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <select
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white font-medium"
            >
              {children.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.className || "—"})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Present", value: presentCount, color: "emerald", dot: "bg-emerald-500" },
          { label: "Absent", value: absentCount, color: "red", dot: "bg-red-500" },
          { label: "Late", value: lateCount, color: "amber", dot: "bg-amber-500" },
          { label: "Attendance %", value: `${percentage}%`, color: "violet", dot: "bg-violet-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
              <span className="text-xs text-gray-500 font-medium">{s.label}</span>
            </div>
            <p className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{monthLabel}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h3 className="font-bold text-gray-800 text-lg">{monthLabel}</h3>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          {attendanceLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const rec = getAttendanceForDay(day);
                const today = new Date();
                const isToday = today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
                
                let cellStyle = "bg-gray-50 text-gray-400";
                let dotColor = "";
                if (rec) {
                  const cfg = getStatusConfig(rec.status);
                  if (cfg.dot === "bg-emerald-500") { cellStyle = "bg-emerald-50 text-emerald-700"; dotColor = "bg-emerald-500"; }
                  else if (cfg.dot === "bg-red-500") { cellStyle = "bg-red-50 text-red-700"; dotColor = "bg-red-500"; }
                  else if (cfg.dot === "bg-amber-500") { cellStyle = "bg-amber-50 text-amber-700"; dotColor = "bg-amber-500"; }
                  else { cellStyle = "bg-blue-50 text-blue-700"; dotColor = "bg-blue-400"; }
                }

                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all ${cellStyle} ${isToday ? "ring-2 ring-violet-500 ring-offset-1" : ""}`}
                  >
                    <span className={isToday ? "font-bold text-violet-700" : ""}>{day}</span>
                    {dotColor && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dotColor}`} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100">
            {[
              { label: "Present", dot: "bg-emerald-500" },
              { label: "Absent", dot: "bg-red-500" },
              { label: "Late", dot: "bg-amber-500" },
              { label: "Excused", dot: "bg-blue-400" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className={`w-2.5 h-2.5 rounded-full ${l.dot}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Records */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-violet-500" />
            Recent Records
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {monthAttendance.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No attendance records for this month
              </div>
            ) : (
              [...monthAttendance].reverse().slice(0, 15).map((rec, i) => {
                const cfg = getStatusConfig(rec.status);
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg}`}>
                    <Icon className={`w-5 h-5 ${cfg.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(rec.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg bg-white ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
