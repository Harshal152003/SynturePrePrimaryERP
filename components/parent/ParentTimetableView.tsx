"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, BookOpen, User, MapPin, Users, CalendarDays } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";

interface Period {
  _id: string;
  day: string;
  subject: string;
  startTime?: string;
  endTime?: string;
  teacherId?: { name: string };
  roomNumber?: string;
}

interface Child {
  _id: string;
  name: string;
  className?: string;
  classId?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ParentTimetableView() {
  const searchParams = useSearchParams();
  const preselectedClassId = searchParams.get("classId");

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [timetable, setTimetable] = useState<Period[]>([]);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() - 1] || "Monday");
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(false);

  useEffect(() => { fetchChildren(); }, []);
  useEffect(() => {
    if (selectedChild?.classId) fetchTimetable(selectedChild.classId);
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/parent/students");
      const data = await res.json();
      if (data.success) {
        const list: Child[] = data.students || [];
        setChildren(list);
        if (list.length > 0) {
          const initial = preselectedClassId
            ? list.find(c => c.classId === preselectedClassId) || list[0]
            : list[0];
          setSelectedChild(initial);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchTimetable = async (classId: string) => {
    setPeriodLoading(true);
    try {
      const res = await fetch(`/api/parent/timetable/${classId}`);
      const data = await res.json();
      if (data.success) setTimetable(data.timetable || []);
      else setTimetable([]);
    } catch (err) { setTimetable([]); }
    finally { setPeriodLoading(false); }
  };

  const dayPeriods = timetable
    .filter(p => p.day === activeDay)
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  const subjectColors = ["emerald", "green", "teal", "amber", "cyan", "orange", "pink"];
  const getSubjectColor = (subject: string) => {
    const idx = subject?.charCodeAt(0) % subjectColors.length || 0;
    return subjectColors[idx];
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3f22]" /></div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "Timetable" }]} />

      <div className="mt-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Class Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">View your child's weekly timetable</p>
        </div>
        {children.length > 1 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <select
              value={selectedChild?._id || ""}
              onChange={e => setSelectedChild(children.find(c => c._id === e.target.value) || null)}
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3f22] bg-white font-medium"
            >
              {children.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.className || "—"})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Day Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-6 flex gap-1 overflow-x-auto">
        {DAYS.map(day => {
          const isToday = DAYS[new Date().getDay() - 1] === day;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-xl text-sm font-medium transition-all relative ${
                activeDay === day ? "bg-[#1a3f22] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {day.slice(0, 3)}
              {isToday && (
                <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${activeDay === day ? "bg-white" : "bg-[#1a3f22]"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Periods */}
      {periodLoading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3f22]" /></div>
      ) : dayPeriods.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-[#f0f5f1] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-[#1a3f22]/40" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Free Day!</h3>
          <p className="text-gray-400 text-sm">No classes scheduled for {activeDay}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayPeriods.map((period, index) => {
            const isBreak = period.subject?.toLowerCase().includes("break") || period.subject?.toLowerCase().includes("lunch");
            const color = isBreak ? "amber" : getSubjectColor(period.subject);
            return (
              <div key={period._id || index} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex`}>
                {/* Accent */}
                <div className={`w-1.5 bg-${color}-500 flex-shrink-0`} />
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{period.subject}</h3>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {(period.startTime || period.endTime) && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Clock className={`w-4 h-4 text-${color}-500`} />
                            {period.startTime} {period.endTime ? `– ${period.endTime}` : ""}
                          </div>
                        )}
                        {period.teacherId?.name && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <User className="w-4 h-4 text-gray-400" />
                            {period.teacherId.name}
                          </div>
                        )}
                        {period.roomNumber && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            Room {period.roomNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg bg-${color}-50 text-${color}-700 text-xs font-semibold`}>
                      {isBreak ? "Break" : `Period ${index + 1}`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
