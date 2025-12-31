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
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { showToast } from "@/lib/toast";
import {
  ClipboardCheck,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Search,
  Calendar,
  Filter,
  Plus,
  Edit2,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";

interface Student {
  _id: string;
  firstName: string;
  lastName?: string;
  admissionNo?: string;
}

interface Class {
  _id: string;
  name: string;
  section: string;
}

interface Teacher {
  _id: string;
  firstName?: string;
  lastName?: string;
}

interface Attendance {
  _id: string;
  studentId: Student;
  classId?: Class;
  date: Date;
  status: "present" | "absent" | "late" | "excused";
  markedBy?: Teacher;
  notes?: string;
  [key: string]: unknown;
}

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

export default function AttendanceManagement() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);

  const [formData, setFormData] = useState<{
    studentId: string;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    notes: string;
  }>({
    studentId: "",
    date: dateFilter,
    status: "present",
    notes: "",
  });

  useEffect(() => {
    fetchAttendances();
    fetchStudents();
  }, []);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/attendance");
      const data = await res.json();
      setAttendances(data.data || []);
    } catch (error) {
      showToast.error("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarkAttendance = async () => {
    if (!formData.studentId) {
      showToast.error("Please select a student");
      return;
    }

    try {
        if (editingAttendance) {
        const res = await fetch("/api/attendance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingAttendance._id,
            date: formData.date,
            status: formData.status,
            notes: formData.notes,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          showToast.error(data.error || "Failed to update attendance");
          return;
        }
        showToast.success("Attendance updated successfully");
      } else {
        const res = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!data.success) {
          showToast.error(data.error || "Failed to mark attendance");
          return;
        }
        showToast.success("Attendance marked successfully");
      }

      setModalOpen(false);
      setEditingAttendance(null);
      setFormData({ studentId: "", date: dateFilter, status: "present", notes: "" });
      fetchAttendances();
    } catch (error) {
      showToast.error("Failed to save attendance");
    }
  };

  const handleEditAttendance = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setFormData({
      studentId: attendance.studentId._id,
      date: new Date(attendance.date).toISOString().split("T")[0],
      status: attendance.status,
      notes: attendance.notes || "",
    });
    setModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: "success" | "danger" | "warning" | "info" } = {
      present: "success",
      absent: "danger",
      late: "warning",
      excused: "info",
    };
    return colors[status] || "info";
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      present: <CheckCircle2 className="w-3.5 h-3.5" />,
      absent: <XCircle className="w-3.5 h-3.5" />,
      late: <Clock className="w-3.5 h-3.5" />,
      excused: <Info className="w-3.5 h-3.5" />,
    };
    return icons[status] || null;
  };

  const filteredAttendances = attendances.filter((att) => {
    const studentName = `${att.studentId.firstName} ${att.studentId.lastName || ""}`.toLowerCase();
    const admissionNo = att.studentId.admissionNo?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    return (
      (studentName.includes(searchLower) || admissionNo.includes(searchLower)) &&
      (!statusFilter || att.status === statusFilter)
    );
  });

  const totalPresent = attendances.filter((a) => a.status === "present").length;
  const totalAbsent = attendances.filter((a) => a.status === "absent").length;
  const totalLate = attendances.filter((a) => a.status === "late").length;
  const totalExcused = attendances.filter((a) => a.status === "excused").length;
  const totalRecords = attendances.length;
  const attendanceRate = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : 0;

  const columns: Column[] = [
    {
      key: "studentId",
      label: "Student Name",
      render: (value: unknown, row: Record<string, unknown>) => {
        const student = value as Student;
        return (
          <div>
            <div className="font-medium text-gray-800">
              {student.firstName} {student.lastName || ""}
            </div>
            {student.admissionNo && (
              <div className="text-xs text-gray-500">{student.admissionNo}</div>
            )}
          </div>
        );
      },
    },
    {
      key: "classId",
      label: "Class",
      render: (value: unknown, row: Record<string, unknown>) => {
        const classData = value as Class | undefined;
        return classData ? `${classData.name} - ${classData.section}` : "-";
      },
    },
    {
      key: "date",
      label: "Date",
      render: (value: unknown, row: Record<string, unknown>) => {
        const date = value as Date;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-1.5">
          {getStatusIcon(String(value))}
          <Badge variant={getStatusColor(String(value))} size="sm">
            {String(value).toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (value: unknown, row: Record<string, unknown>) =>
        value ? String(value) : <span className="text-gray-400 text-sm">-</span>,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Attendance" }]} />

      <div className="mt-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
            <p className="text-gray-600 mt-1">Mark and track student attendance records</p>
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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-700 text-sm font-medium mb-2">Attendance Rate</p>
              <p className="text-4xl font-bold text-cyan-600">{attendanceRate}%</p>
            </div>
            <div className="w-14 h-14 bg-cyan-500 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium mb-2">Present</p>
              <p className="text-4xl font-bold text-green-600">{totalPresent}</p>
            </div>
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium mb-2">Absent</p>
              <p className="text-4xl font-bold text-red-600">{totalAbsent}</p>
            </div>
            <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center">
              <UserX className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm font-medium mb-2">Late</p>
              <p className="text-4xl font-bold text-amber-600">{totalLate}</p>
            </div>
            <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium mb-2">Excused</p>
              <p className="text-4xl font-bold text-blue-600">{totalExcused}</p>
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
            <p className="text-gray-600 text-sm mt-1">
              {filteredAttendances.length} {filteredAttendances.length === 1 ? "record" : "records"} found
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAttendance(null);
              setFormData({ studentId: "", date: dateFilter, status: "present", notes: "" });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-lg font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Mark Attendance
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all appearance-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredAttendances}
          loading={loading}
          actions={(row) => (
            <div className="flex gap-2">
              <button
                onClick={() => handleEditAttendance(row as Attendance)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAttendance(null);
        }}
        title={editingAttendance ? "Edit Attendance" : "Mark Attendance"}
        size="md"
        footer={
          <>
            <Button
              onClick={() => {
                setModalOpen(false);
                setEditingAttendance(null);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleMarkAttendance} variant="primary">
              {editingAttendance ? "Update" : "Mark"} Attendance
            </Button>
          </>
        }
      >
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              {editingAttendance ? "Edit Attendance" : "Mark Attendance"}
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              disabled={!!editingAttendance}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName || ""} {student.admissionNo ? `(${student.admissionNo})` : ""}
                </option>
              ))}
            </select>
            {editingAttendance && (
              <p className="text-xs text-gray-500 mt-1">Student cannot be changed when editing</p>
            )}
          </div>

          <Input
            label="Date *"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            fullWidth
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: "present" }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.status === "present"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                }`}
              >
                <UserCheck className="w-5 h-5" />
                <span className="font-medium">Present</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: "absent" }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.status === "absent"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                }`}
              >
                <UserX className="w-5 h-5" />
                <span className="font-medium">Absent</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: "late" }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.status === "late"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-amber-300"
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Late</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: "excused" }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.status === "excused"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium">Excused</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Add optional notes..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}