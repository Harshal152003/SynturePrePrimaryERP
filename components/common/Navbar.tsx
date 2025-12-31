"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User,
  ChevronDown,
  Menu
} from "lucide-react";

export default function Navbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-3.5 flex justify-between items-center">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
  onClick={onMenuClick}
  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
>
  <Menu className="w-5 h-5 text-gray-600" />
</button>

          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students, teachers, classes..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">Notifications</p>
                  <p className="text-xs text-gray-600 mt-0.5">You have 3 unread notifications</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-800">New student enrollment</p>
                    <p className="text-xs text-gray-600 mt-1">Sarah Johnson enrolled in Class A</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-800">Fee payment received</p>
                    <p className="text-xs text-gray-600 mt-1">Payment of $500 received from John Doe</p>
                    <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-xs font-medium text-gray-800">Event reminder</p>
                    <p className="text-xs text-gray-600 mt-1">Annual Day celebration tomorrow</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50">
                  <button className="text-xs font-medium text-orange-600 hover:text-orange-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings */}
          <Link
            href="/dashboard/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <Settings className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" />
          </Link>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200"></div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-all group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm border-2 border-white">
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
                <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-600">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center px-2 py-1 bg-white rounded-md">
                    <span className="text-xs font-medium text-orange-600 capitalize">{user?.role || "Role"}</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-blue-600" />
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