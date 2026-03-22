"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  Footprints,
} from "lucide-react";

export default function Navbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const showSearch = pathname === "/dashboard" || pathname === "/teacher-dashboard" || pathname === "/student-dashboard" || pathname === "/parent-dashboard";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    if (showSearchResults || dropdownOpen || notificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSearchResults, dropdownOpen, notificationOpen]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    try {
      const studentsRes = await fetch(`/api/students?q=${encodeURIComponent(value)}&limit=3`);
      const studentsData = studentsRes.ok ? await studentsRes.json() : { data: [] };
      const teachersRes = await fetch(`/api/teachers?q=${encodeURIComponent(value)}&limit=3`);
      const teachersData = teachersRes.ok ? await teachersRes.json() : { data: [] };
      const classesRes = await fetch(`/api/classes?q=${encodeURIComponent(value)}&limit=3`);
      const classesData = classesRes.ok ? await classesRes.json() : { data: [] };
      const combined = [
        ...(studentsData.data || []).map((student: any) => ({ ...student, type: "student", displayName: `${student.firstName} ${student.lastName || ""}` })),
        ...(teachersData.data || []).map((teacher: any) => ({ ...teacher, type: "teacher", displayName: teacher.name })),
        ...(classesData.classes || classesData.data || []).map((cls: any) => ({ ...cls, type: "class", displayName: `${cls.name} - ${cls.section}` })),
      ];
      setSearchResults(combined);
      setShowSearchResults(combined.length > 0);
    } catch (error) {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (result: any) => {
    setSearchTerm("");
    setShowSearchResults(false);
    setSearchResults([]);
    const basePath = pathname?.startsWith("/teacher-dashboard") ? "/teacher-dashboard"
      : pathname?.startsWith("/student-dashboard") ? "/student-dashboard"
        : pathname?.startsWith("/parent-dashboard") ? "/parent-dashboard"
          : "/dashboard";
    if (result.type === "student") router.push(`${basePath}/students/${result._id}`);
    else if (result.type === "teacher") router.push(`${basePath}/teachers/${result._id}`);
    else if (result.type === "class") router.push(`${basePath}/classes/${result._id}`);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-3.5 flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-[#1a3f22]" />
          </button>

          {showSearch && (
            <div className="relative flex-1" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students, teachers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm && setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ "--tw-ring-color": "#1a3f22" } as any}
              />

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.some((r) => r.type === "student") && (
                    <>
                      <div className="px-4 py-2 bg-green-50 border-b border-gray-100 text-xs font-semibold text-[#1a3f22]">Students</div>
                      {searchResults.filter((r) => r.type === "student").map((result) => (
                        <button key={result._id} onClick={() => handleSearchResultClick(result)} className="w-full text-left px-4 py-2.5 hover:bg-green-50/50 border-b border-gray-100 last:border-b-0 transition-colors">
                          <p className="text-sm font-medium text-gray-800">{result.displayName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{result.admissionNo && `Admission: ${result.admissionNo}`}</p>
                        </button>
                      ))}
                    </>
                  )}
                  {searchResults.some((r) => r.type === "teacher") && (
                    <>
                      <div className="px-4 py-2 bg-green-50 border-b border-gray-100 text-xs font-semibold text-[#1a3f22]">Teachers</div>
                      {searchResults.filter((r) => r.type === "teacher").map((result) => (
                        <button key={result._id} onClick={() => handleSearchResultClick(result)} className="w-full text-left px-4 py-2.5 hover:bg-green-50/50 border-b border-gray-100 last:border-b-0 transition-colors">
                          <p className="text-sm font-medium text-gray-800">{result.displayName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{result.email}</p>
                        </button>
                      ))}
                    </>
                  )}
                  {searchResults.some((r) => r.type === "class") && (
                    <>
                      <div className="px-4 py-2 bg-green-50 border-b border-gray-100 text-xs font-semibold text-[#1a3f22]">Classes</div>
                      {searchResults.filter((r) => r.type === "class").map((result) => (
                        <button key={result._id} onClick={() => handleSearchResultClick(result)} className="w-full text-left px-4 py-2.5 hover:bg-green-50/50 border-b border-gray-100 last:border-b-0 transition-colors">
                          <p className="text-sm font-medium text-gray-800">{result.displayName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Room: {result.roomNumber || "N/A"}</p>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          {user?.role !== "admin" && user?.role !== "teacher" && (
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setNotificationOpen(!notificationOpen); }}
                className="relative p-2 hover:bg-green-50 rounded-xl transition-colors group"
              >
                <Bell className="w-5 h-5 text-gray-500 group-hover:text-[#1a3f22] transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white -translate-y-1 translate-x-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200" style={{ background: "linear-gradient(135deg, #1a3f22, #2e6b3a)" }}>
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <p className="text-xs text-green-200 mt-0.5">
                      {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`px-4 py-3 hover:bg-green-50/50 cursor-pointer border-b border-gray-100 transition-colors ${!notif.isRead ? "bg-green-50/30" : ""}`}
                        onClick={() => { router.push("/dashboard/notifications"); setNotificationOpen(false); }}
                      >
                        <div className="flex justify-between items-start">
                          <p className={`text-xs font-semibold ${!notif.isRead ? "text-[#1a3f22]" : "text-gray-800"}`}>{notif.title}</p>
                          {!notif.isRead && <div className="w-2 h-2 bg-[#8DC63F] rounded-full"></div>}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1 line-clamp-6 whitespace-pre-wrap">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                      </div>
                    )) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex justify-center">
                    <Link
                      href="/dashboard/notifications"
                      className="text-xs font-medium text-[#1a3f22] hover:text-[#2e6b3a]"
                      onClick={() => setNotificationOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}



          <div className="w-px h-8 bg-gray-100"></div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-green-50 rounded-xl transition-all group"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm border-2"
                style={{ background: "linear-gradient(135deg, #1a3f22, #2e6b3a)", borderColor: "#8DC63F" }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || "Role"}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-gray-200" style={{ background: "linear-gradient(135deg, #1a3f22, #2e6b3a)" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2"
                      style={{ background: "#4a9c5d", borderColor: "#8DC63F" }}
                    >
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user?.name || "User"}</p>
                      <p className="text-xs text-green-200">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-[#8DC63F] capitalize">{user?.role || "Role"}</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#1a3f22]" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-[#2e6b3a]" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}