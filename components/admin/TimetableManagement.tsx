"use client";
import React, { useState, useEffect } from "react";
import { ReactNode } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Modal from "@/components/common/Modal";
import Table from "@/components/common/Table";
import Card from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Alert from "@/components/common/Alert";
import { showToast } from "@/lib/toast";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Filter,
  School,
  GraduationCap,
  BookOpen,
  Search,
  DoorOpen,
  Grid3x3,
} from "lucide-react";

interface Class {
  _id: string;
  name: string;
  section: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
}

interface Timetable {
  _id: string;
  classId: Class;
  day: string;
  subject: string;
  teacherId: Teacher;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown; // Added index signature
}

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableManagement() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("calendar");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Timetable | null>(null);

  const [formData, setFormData] = useState({
    classId: "",
    day: "Monday",
    subject: "",
    teacherId: "",
    startTime: "09:00",
    endTime: "09:45",
    roomNumber: "",
  });

  useEffect(() => {
    fetchTimetables();
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/timetable");
      const data = await res.json();
      setTimetables(data.timetable || []);
    } catch (error) {
      showToast.error("Failed to fetch timetables");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data.classes || []);
      if (data.classes && data.classes.length > 0) {
        setSelectedClass(data.classes[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers");
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEntry = async () => {
    if (!formData.classId || !formData.subject || !formData.teacherId) {
      showToast.error("Class, subject, and teacher are required");
      return;
    }

    try {
      const method = editingEntry ? "PUT" : "POST";
      const url = editingEntry ? `/api/timetable/${editingEntry._id}` : "/api/timetable";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        showToast.error(data.error || "Failed to save timetable entry");
        return;
      }

      showToast.success(`Timetable entry ${editingEntry ? "updated" : "created"} successfully`);
      setModalOpen(false);
      setEditingEntry(null);
      setFormData({
        classId: "",
        day: "Monday",
        subject: "",
        teacherId: "",
        startTime: "09:00",
        endTime: "09:45",
        roomNumber: "",
      });
      fetchTimetables();
    } catch (error) {
      showToast.error("Failed to save timetable entry");
    }
  };

  const handleEditEntry = (entry: Timetable) => {
    setEditingEntry(entry);
    setFormData({
      classId: entry.classId._id,
      day: entry.day,
      subject: entry.subject,
      teacherId: entry.teacherId._id,
      startTime: entry.startTime,
      endTime: entry.endTime,
      roomNumber: entry.roomNumber || "",
    });
    setModalOpen(true);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this timetable entry?")) return;
    try {
      const res = await fetch(`/api/timetable/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast.success("Timetable entry deleted successfully");
        fetchTimetables();
      }
    } catch (error) {
      showToast.error("Failed to delete timetable entry");
    }
  };

  const filteredTimetables = selectedClass
    ? timetables.filter((t) => t.classId._id === selectedClass)
    : timetables;

  const totalEntries = timetables.length;
  const uniqueSubjects = new Set(timetables.map((t) => t.subject)).size;
  const uniqueTeachers = new Set(timetables.map((t) => t.teacherId._id)).size;

  const getEntriesForDayAndClass = (day: string, classId: string) => {
    return timetables
      .filter((t) => t.day === day && t.classId._id === classId)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const columns: Column[] = [
    {
      key: "classId",
      label: "Class",
      render: (value: unknown) => {
        const classInfo = value as Class;
        return `${classInfo.name} - ${classInfo.section}`;
      },
    },
    {
      key: "day",
      label: "Day",
      render: (value: unknown) => String(value),
    },
    {
      key: "subject",
      label: "Subject",
      render: (value: unknown) => (
        <Badge variant="primary" size="sm">{String(value)}</Badge>
      ),
    },
    {
      key: "teacherId",
      label: "Teacher",
      render: (value: unknown) => {
        const teacher = value as Teacher;
        return teacher.name;
      },
    },
    {
      key: "startTime",
      label: "Time",
      render: (value: unknown, row: Record<string, unknown>) => {
        const timetable = row as Timetable;
        return (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{String(value)} - {timetable.endTime}</span>
          </div>
        );
      },
    },
    {
      key: "roomNumber",
      label: "Room",
      render: (value: unknown) => (value ? String(value) : <span className="text-gray-400">-</span>),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Timetable" }]} />

      {/* Header */}
      <div className="mt-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Timetable Management</h1>
            <p className="text-gray-600 mt-1">Manage class schedules and time slots</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Import</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-700 text-sm font-medium mb-2">Total Entries</p>
              <p className="text-4xl font-bold text-indigo-600">{totalEntries}</p>
            </div>
            <div className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-medium mb-2">Subjects</p>
              <p className="text-4xl font-bold text-purple-600">{uniqueSubjects}</p>
            </div>
            <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-700 text-sm font-medium mb-2">Teachers</p>
              <p className="text-4xl font-bold text-pink-600">{uniqueTeachers}</p>
            </div>
            <div className="w-14 h-14 bg-pink-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                  viewMode === "calendar"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Calendar</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                  viewMode === "table"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="text-sm font-medium">List</span>
              </button>
            </div>

            {viewMode === "calendar" && (
              <div>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all appearance-none bg-white"
                >
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setEditingEntry(null);
              setFormData({
                classId: "",
                day: "Monday",
                subject: "",
                teacherId: "",
                startTime: "09:00",
                endTime: "09:45",
                roomNumber: "",
              });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>

        {/* Calendar View */}
        {viewMode === "calendar" && selectedClass && (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 gap-2">
                {DAYS.map((day) => (
                  <div key={day} className="border border-gray-200 rounded-lg">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-3 rounded-t-lg">
                      <h3 className="font-semibold text-center">{day}</h3>
                    </div>
                    <div className="p-2 space-y-2 min-h-[400px] bg-gray-50">
                      {getEntriesForDayAndClass(day, selectedClass).map((entry) => (
                        <div
                          key={entry._id}
                          className="bg-white border border-indigo-200 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="primary" size="sm">{entry.subject}</Badge>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEntry(entry);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEntry(entry._id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{entry.startTime} - {entry.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              <span className="truncate">{entry.teacherId.name}</span>
                            </div>
                            {entry.roomNumber && (
                              <div className="flex items-center gap-1">
                                <DoorOpen className="w-3 h-3" />
                                <span>Room {entry.roomNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {getEntriesForDayAndClass(day, selectedClass).length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-8">
                          No classes scheduled
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div>
            <Table
              columns={columns}
              data={filteredTimetables}
              loading={loading}
              actions={(row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEntry(row as Timetable)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEntry((row as Timetable)._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        title={editingEntry ? "Edit Timetable Entry" : "Add Timetable Entry"}
        size="lg"
        footer={
          <>
            <Button
              onClick={() => {
                setModalOpen(false);
                setEditingEntry(null);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEntry} variant="primary">
              {editingEntry ? "Update" : "Add"} Entry
            </Button>
          </>
        }
      >
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center">
              {editingEntry ? (
                <Edit2 className="w-5 h-5 text-white" />
              ) : (
                <Plus className="w-5 h-5 text-white" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              {editingEntry ? "Edit Timetable Entry" : "Add Timetable Entry"}
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all appearance-none bg-white"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - Section {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day *</label>
            <div className="grid grid-cols-3 gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, day }))}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.day === day
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300"
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Subject *"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="e.g., Mathematics, English"
            fullWidth
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teacher *</label>
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all appearance-none bg-white"
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time *"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleInputChange}
              fullWidth
            />
            <Input
              label="End Time *"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleInputChange}
              fullWidth
            />
          </div>

          <Input
            label="Room Number"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleInputChange}
            placeholder="e.g., 101, A-Wing"
            fullWidth
          />
        </div>
      </Modal>
    </div>
  );
}