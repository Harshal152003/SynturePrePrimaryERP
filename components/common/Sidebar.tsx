"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PERMISSIONS } from "@/utils/permissions";
import { useState, ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  DollarSign,
  Calendar,
  FileText,
  Bell,
  PartyPopper,
  Bus,
  House,
  Image,
  Settings,
  Baby,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  Phone,
  KeyRound,
  UserCheck,
  Footprints,
} from "lucide-react";

interface User {
  name?: string;
  role?: string;
}

interface MenuItem {
  name: string;
  path: string;
  module: string;
  icon: ComponentType<{ className?: string }>;
}

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const visible = isOpen;

  const getDashboardPath = () => {
    switch (user?.role) {
      case "teacher": return "/teacher-dashboard";
      case "student": return "/student-dashboard";
      case "parent": return "/parent-dashboard";
      default: return "/dashboard";
    }
  };

  const basePath = getDashboardPath();

  const menuList: MenuItem[] = [
    { name: "Dashboard", path: basePath, module: "dashboard", icon: LayoutDashboard },
    { name: "Classes", path: `${basePath}/classes`, module: "classes", icon: House },
    { name: "Students", path: `${basePath}/students`, module: "students", icon: Users },
    { name: "Teachers", path: `${basePath}/teachers`, module: "teachers", icon: GraduationCap },
    { name: "Children", path: `${basePath}/children`, module: "children", icon: UserCheck },
    { name: "Attendance", path: `${basePath}/attendance`, module: "attendance", icon: ClipboardCheck },
    { name: "Fees", path: `${basePath}/fees`, module: "fees", icon: DollarSign },
    { name: "Timetable", path: `${basePath}/timetable`, module: "timetable", icon: Calendar },
    { name: "Exams", path: `${basePath}/exams`, module: "exams", icon: FileText },
    { name: "Exam Results", path: `${basePath}/exam-results`, module: "exam-results", icon: BookOpen },
    { name: "Notifications", path: `${basePath}/notifications`, module: "notifications", icon: Bell },
    { name: "Events", path: `${basePath}/events`, module: "events", icon: PartyPopper },
    { name: "Transport", path: `${basePath}/transport/routes`, module: "transport", icon: Bus },
    { name: "Gallery", path: `${basePath}/gallery`, module: "gallery", icon: Image },
    { name: "Contact School", path: `${basePath}/contact-school`, module: "contact-school", icon: Phone },
    { name: "Change Password", path: `${basePath}/change-password`, module: "change-password", icon: KeyRound },
    { name: "Settings", path: `${basePath}/settings`, module: "settings", icon: Settings },
  ];

  const filteredMenu = menuList.filter((m) => {
    // Check permission
    const hasPermission = user?.role ? PERMISSIONS[user.role]?.includes(m.module) : false;

    // Additional case: Hide "Change Password" for parents as it is in Profile
    if (user?.role === "parent" && m.name === "Change Password") {
      return false;
    }

    return hasPermission;
  });

  return (
    <aside
      className={`
        fixed lg:static z-50
        h-screen flex flex-col
        transition-transform duration-300
        ${visible ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${isCollapsed ? "w-20" : "w-64"}
      `}
      style={{ background: "linear-gradient(180deg, #1a3f22 0%, #112a17 100%)" }}
    >
      {/* Header / Brand */}
      <div
        className={`flex items-center border-b border-white/10 ${isCollapsed ? "justify-center py-5" : "justify-between px-5 py-5"}`}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-inner overflow-hidden p-1.5 border border-white/20">
              <img src="/logo.png" alt="Little Steps" className="w-full h-full object-contain rounded-md" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">Little Steps</h1>
              <p className="text-xs text-green-300/70">School Management</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-inner overflow-hidden p-1.5 border border-white/20">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-md" />
          </div>
        )}
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-white"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* User Info */}
      {user && !isCollapsed && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border-2"
              style={{ background: "#2e6b3a", borderColor: "#8DC63F" }}
            >
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name || "User"}</p>
              <p className="text-xs text-green-300/70 capitalize truncate">{user.role || "Role"}</p>
            </div>
          </div>
        </div>
      )}

      {user && isCollapsed && (
        <div className="py-4 flex justify-center border-b border-white/10">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2"
            style={{ background: "#2e6b3a", borderColor: "#8DC63F" }}
          >
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar">
        <ul className={isCollapsed ? "space-y-1 py-4 px-2" : "space-y-0.5 px-3 py-4"}>
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path || pathname?.startsWith(item.path + "/");

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    group relative flex items-center transition-all duration-150 rounded-xl
                    ${isCollapsed ? "justify-center p-3" : "px-3 py-2.5"}
                    ${isActive
                      ? "bg-[#8DC63F]/20 border border-[#8DC63F]/30 shadow-sm"
                      : "hover:bg-white/8 border border-transparent"
                    }
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div
                    className={`
                      flex items-center justify-center rounded-lg transition-colors
                      ${isCollapsed ? "w-10 h-10" : "w-8 h-8 mr-3"}
                      ${isActive
                        ? "bg-[#8DC63F] text-[#1a3f22]"
                        : "bg-white/10 text-green-200 group-hover:bg-white/15 group-hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && (
                    <span className={`text-sm font-medium ${isActive ? "text-[#8DC63F]" : "text-green-100 group-hover:text-white"}`}>
                      {item.name}
                    </span>
                  )}

                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a3f22] border border-[#8DC63F]/30 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="py-3 border-t border-white/10">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex justify-center py-2 hover:bg-white/8 transition-colors group"
            title="Expand sidebar"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <PanelLeft className="w-5 h-5 text-green-200" />
            </div>
          </button>
        </div>
      )}

      {/* Collapse Button when expanded */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-t border-white/10">
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/8 text-green-300/70 hover:text-white transition-all text-sm"
          >
            <PanelLeftClose className="w-4 h-4" />
            <span>Collapse</span>
          </button>
        </div>
      )}

      {/* Logout Button */}
      <div className={`border-t border-white/10 ${isCollapsed ? "py-3" : "py-3 px-3"}`}>
        <button
          onClick={async () => {
            try {
              await logout();
              router.push("/login");
            } catch (err) {
              console.error("Logout failed", err);
            }
          }}
          className={`
            w-full flex items-center transition-all group rounded-xl
            hover:bg-red-900/30
            ${isCollapsed ? "justify-center py-3" : "px-3 py-2.5"}
          `}
          title={isCollapsed ? "Logout" : undefined}
        >
          <div
            className={`
              flex items-center justify-center rounded-lg bg-red-900/20 group-hover:bg-red-500/20 transition-colors
              ${isCollapsed ? "w-10 h-10" : "w-8 h-8 mr-3"}
            `}
          >
            <LogOut className="w-4 h-4 text-red-400" />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-medium text-red-400 group-hover:text-red-300">Logout</span>
          )}

          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a3f22] border border-red-500/30 text-red-400 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Logout
            </div>
          )}
        </button>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-xs text-green-300/40 text-center">
            © 2026 Little Steps
          </p>
        </div>
      )}
    </aside>
  );
}