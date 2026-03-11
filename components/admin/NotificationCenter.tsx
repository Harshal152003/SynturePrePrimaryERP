"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import Badge from "@/components/common/Badge";
import Alert from "@/components/common/Alert";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { showToast } from "@/lib/toast";
import {
  Bell,
  Plus,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Info,
  Mail,
  Clock,
  Search,
  X,
  MapPin,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  BookOpen,
  ExternalLink,
  FileText,
} from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
  [key: string]: any;
}

const NOTIFICATION_TYPES = [
  { value: "event", label: "Event" },
  { value: "announcement", label: "Announcement" },
  { value: "fee", label: "Fee" },
  { value: "attendance", label: "Attendance" },
  { value: "exam", label: "Exam" },
  { value: "transport", label: "Transport" },
  { value: "meal", label: "Meal" },
  { value: "system", label: "System" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const [formData, setFormData] = useState({
    recipientId: "",
    type: "announcement",
    title: "",
    message: "",
    priority: "normal",
  });

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (unreadOnly) params.append("unread", "true");

      const res = await fetch(`/api/notifications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || data.data || []);
      }
    } catch (err) {
      showToast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: true }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);

      await Promise.all(
        unreadIds.map((id) =>
          fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, isRead: true }),
          })
        )
      );

      fetchNotifications();
      showToast.success("All notifications marked as read");
    } catch (err) {
      showToast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;

    try {
      const response = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });

      if (response.ok) {
        showToast.success("Notification deleted");
        fetchNotifications();
      } else {
        showToast.error("Failed to delete");
      }
    } catch (err) {
      showToast.error("Error deleting notification");
    }
  };

  const handleSend = async () => {
    if (!formData.recipientId || !formData.title || !formData.message) {
      showToast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast.success("Notification sent successfully");
        setShowModal(false);
        setFormData({
          recipientId: "",
          type: "announcement",
          title: "",
          message: "",
          priority: "normal",
        });
        fetchNotifications();
      } else {
        showToast.error("Failed to send notification");
      }
    } catch (err) {
      showToast.error("Error sending notification");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesType = filterType === "all" || n.type === filterType;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalCount = notifications.length;

  const getPriorityColor = (
    priority: string
  ): "success" | "warning" | "danger" | "info" => {
    const colors: Record<string, "success" | "warning" | "danger" | "info"> = {
      low: "info",
      normal: "success",
      high: "warning",
      urgent: "danger",
    };
    return colors[priority] || "info";
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="w-4 h-4" />;
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "normal":
        return <Info className="w-4 h-4" />;
      case "low":
        return <Info className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]} />

      {/* Header */}
      <div className="mt-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notification Center</h1>
            <p className="text-gray-600 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Mark All Read</span>
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Send Notification
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 text-sm font-medium mb-2">Total Notifications</p>
              <p className="text-4xl font-bold text-orange-600">{totalCount}</p>
            </div>
            <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
              <Bell className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-700 text-sm font-medium mb-2">Unread</p>
              <p className="text-4xl font-bold text-pink-600">{unreadCount}</p>
            </div>
            <div className="w-14 h-14 bg-pink-500 rounded-xl flex items-center justify-center">
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none bg-white"
          >
            <option value="all">All Types</option>
            {NOTIFICATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-400"
            />
            <span className="text-sm font-medium text-gray-700">Unread only</span>
          </label>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                className={`border rounded-xl p-4 transition-all cursor-pointer group ${!notif.isRead
                    ? "border-l-4 border-l-orange-500 bg-orange-50/50 hover:bg-orange-100/70"
                    : "border-gray-200 hover:bg-gray-50 bg-white"
                  }`}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                      <h3 className="font-semibold text-gray-800 truncate">{notif.title}</h3>
                      <Badge variant={getPriorityColor(notif.priority)} size="sm">
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(notif.priority)}
                          <span className="capitalize">{notif.priority}</span>
                        </div>
                      </Badge>
                      <Badge variant="info" size="sm">
                        <span className="capitalize">{notif.type}</span>
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{notif.message}</p>

                    {/* Metadata Section with Professional Icons */}
                    {notif.metadata && typeof notif.metadata === 'object' && Object.keys(notif.metadata).length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3 bg-white/80 p-3 rounded-lg border border-orange-100/50 shadow-sm transition-all group-hover:bg-white">
                        {(notif.metadata as any).date && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-700">
                            <CalendarIcon className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-gray-900">Date:</span> {(notif.metadata as any).date}
                          </div>
                        )}
                        {(notif.metadata as any).time && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-700">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-gray-900">Time:</span> {(notif.metadata as any).time}
                          </div>
                        )}
                        {(notif.metadata as any).location && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-700">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-gray-900">Spot:</span> {(notif.metadata as any).location}
                          </div>
                        )}
                        {(notif.metadata as any).audience && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-700">
                            <UsersIcon className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-gray-900">Audience:</span> {(notif.metadata as any).audience}
                          </div>
                        )}
                        {(notif.metadata as any).subjects && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-700">
                            <BookOpen className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-gray-900">Subjects:</span> {(notif.metadata as any).subjects}
                          </div>
                        )}
                        {(notif.metadata as any).marks && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-gray-900">Total Marks:</span> {(notif.metadata as any).marks}
                          </div>
                        )}
                        
                        {/* Attachments Display */}
                        {(notif.metadata as any).attachments && Array.isArray((notif.metadata as any).attachments) && (notif.metadata as any).attachments.length > 0 && (
                          <div className="col-span-1 sm:col-span-2 mt-2 pt-2 border-t border-orange-100 flex flex-wrap gap-2">
                            <p className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Attachments</p>
                            {(notif.metadata as any).attachments.slice(0, 3).map((file: any, fidx: number) => (
                              <a
                                key={fidx}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-lg transition-all group/file max-w-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {file.url && (file.url.endsWith('.jpg') || file.url.endsWith('.jpeg') || file.url.endsWith('.png') || file.url.includes('cloudinary')) ? (
                                  <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-orange-600" />
                                  </div>
                                )}
                                <div className="flex flex-col min-w-0 pr-1">
                                  <span className="text-[11px] font-bold text-gray-700 truncate">{file.name || 'Attachment'}</span>
                                  <span className="text-[9px] text-gray-400 flex items-center gap-1">
                                    View File <ExternalLink className="w-2 h-2" />
                                  </span>
                                </div>
                              </a>
                            ))}
                            {(notif.metadata as any).attachments.length > 3 && (
                              <div className="flex items-center justify-center p-2 text-[9px] font-bold text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                                +{(notif.metadata as any).attachments.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-all text-sm font-medium whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notif._id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No notifications found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Send Notification"
        size="md"
        footer={
          <>
            <Button onClick={() => setShowModal(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSend} variant="primary">
              Send Notification
            </Button>
          </>
        }
      >
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Send Notification</h2>
          </div>
          <Input
            label="Recipient ID *"
            name="recipientId"
            placeholder="Enter user ID"
            value={formData.recipientId}
            onChange={handleInputChange}
            fullWidth
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none bg-white"
            >
              {NOTIFICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Title *"
            name="title"
            placeholder="Notification title"
            value={formData.title}
            onChange={handleInputChange}
            fullWidth
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              placeholder="Notification message..."
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none bg-white"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}