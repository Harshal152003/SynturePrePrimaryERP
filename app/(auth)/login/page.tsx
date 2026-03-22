"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, BookOpen, Users, GraduationCap, Eye, EyeOff, Footprints, ChevronDown, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("admin");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, role }),
      });
      const contentType = res.headers.get("content-type") || "";
      let data: any = null;
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        setError(`Server error: received non-JSON response (status ${res.status}).`);
        setLoading(false);
        return;
      }
      try {
        data = await res.json();
      } catch (err) {
        setError("Failed to parse server response");
        setLoading(false);
        return;
      }
      if (!data.success) {
        setError(data.error || "Invalid login details");
        setLoading(false);
        return;
      }
      if (login) login(data.user || data);
      const userRole = data.user?.role || role;
      const rolePathMap: Record<string, string> = {
        admin: "/dashboard",
        teacher: "/teacher-dashboard",
        parent: "/parent-dashboard",
        student: "/student-dashboard",
      };
      await router.push(rolePathMap[userRole] || "/dashboard");
    } catch (err: unknown) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const roleIcons = {
    admin: <GraduationCap className="w-4 h-4" />,
    teacher: <BookOpen className="w-4 h-4" />,
    parent: <Users className="w-4 h-4" />,
    student: <Footprints className="w-4 h-4" />,
  };

  const features = [
    { icon: "👣", title: "Child-First", desc: "Track every step of development" },
    { icon: "📊", title: "Real-Time", desc: "Instant updates & reports" },
    { icon: "💬", title: "Connect", desc: "Parent-teacher communication" },
    { icon: "🌿", title: "Growth", desc: "Monitor all milestones together" },
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white selection:bg-green-100 selection:text-green-900">
      
      {/* Left Side — Login Form */}
      <div className="w-full lg:w-5/12 bg-white flex flex-col px-6 lg:px-12 py-4 relative z-10 shadow-2xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="w-full max-w-[380px] m-auto py-4">
          
          {/* Brand Logo & Header */}
          <div className="mb-6 items-center flex flex-col sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 flex flex-shrink-0 items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col text-left">
                <h1 className="text-xl font-bold tracking-tight text-green-950 leading-tight">Little Steps</h1>
                <p className="text-[10px] font-bold tracking-wider text-green-600/70 uppercase">Pre-Primary ERP</p>
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Welcome back! 👋</h2>
            <p className="text-gray-500 text-[13px] font-medium">Sign in to access your secure dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl mb-4 text-[13px] font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            
            {/* Role Select */}
            <div className="relative z-30">
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Select Role</label>
              <div className="relative group">
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors duration-300 ${isRoleDropdownOpen ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'}`}>
                  {roleIcons[role as keyof typeof roleIcons]}
                </div>
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsRoleDropdownOpen(false), 200)}
                  className={`w-full text-left pl-10 pr-3 py-2.5 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white shadow-sm flex items-center justify-between group-hover:border-green-300 ${
                    isRoleDropdownOpen ? "border-green-500 ring-4 ring-green-500/10 shadow-md" : "border-gray-100"
                  }`}
                >
                  <div className="flex flex-col truncate">
                    <span className="text-[13px] font-bold text-gray-800 tracking-tight">
                      {role === "admin" && "School Administrator"}
                      {role === "teacher" && "Teacher"}
                      {role === "parent" && "Parent / Guardian"}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 mt-0.5 tracking-wide truncate">
                      {role === "admin" && "Total system management"}
                      {role === "teacher" && "Manage classes & students"}
                      {role === "parent" && "Track child's progress"}
                    </span>
                  </div>
                  <div className={`flex flex-shrink-0 items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${isRoleDropdownOpen ? "bg-green-100 text-green-600" : "bg-gray-50 text-gray-400 group-hover:bg-green-50 group-hover:text-green-600"}`}>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>
              </div>

              {/* Custom Dropdown Menu */}
              <div 
                className={`absolute z-40 w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-200 origin-top transform ${
                  isRoleDropdownOpen ? "opacity-100 scale-100 visible translate-y-0" : "opacity-0 scale-95 invisible -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="p-1.5 space-y-0.5">
                  {[
                    { id: "admin", label: "School Administrator", desc: "Total system management", icon: roleIcons.admin },
                    { id: "teacher", label: "Teacher", desc: "Manage classes & students", icon: roleIcons.teacher },
                    { id: "parent", label: "Parent / Guardian", desc: "Track child's progress", icon: roleIcons.parent },
                  ].map((item: any) => (
                    <div
                      key={item.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setRole(item.id);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                        role === item.id 
                          ? "bg-green-50/80 text-green-900 shadow-[inset_0_1px_0_white]" 
                          : "hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${role === item.id ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400 group-hover:text-green-500"}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-[12px] tracking-tight font-bold truncate transition-colors ${role === item.id ? "text-green-900" : "text-gray-700"}`}>{item.label}</span>
                        <span className={`block text-[10px] tracking-wide font-medium truncate mt-0.5 transition-colors ${role === item.id ? "text-green-700" : "text-gray-400"}`}>{item.desc}</span>
                      </div>
                      {role === item.id && (
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center bg-green-500 text-white rounded-full shadow-sm">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-400 group-focus-within:text-green-600">
                  <User className="w-4 h-4" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 hover:border-green-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-[13px] shadow-sm font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-400 group-focus-within:text-green-600">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3 border-2 border-gray-100 hover:border-green-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-[13px] shadow-sm font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm border-gray-300 text-green-600 focus:ring-green-500 transition-transform group-hover:scale-110"
                />
                <span className="text-[12px] font-bold text-gray-500">Stay signed in</span>
              </label>
              <a href="/forgot-password" className="text-[12px] font-bold tracking-wide transition-all text-green-700 hover:text-green-800 hover:underline underline-offset-4">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-3 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[14px] shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #164e29, #22c55e)" }}
            >
              <div className="absolute inset-0 bg-white/20 skew-x-12 -ml-20 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
              {loading ? "Signing in securely..." : "Sign In to Little Steps"}
            </button>
          </div>

          <div className="mt-5 text-center bg-gray-50/80 hover:bg-gray-100 transition-colors py-2.5 rounded-xl border border-gray-100 cursor-pointer" onClick={() => router.push("/#contact")}>
            <p className="text-gray-500 text-[11px] font-bold tracking-wide">
              Need an account? <span className="text-green-700">Contact Admin</span>
            </p>
          </div>

        </div>
      </div>

      {/* Right Side — Illustration / Photo Box */}
      {/* Defined exact sizes for objects so it natively scales to h-screen perfectly constraints */}
      <div
        className="hidden lg:flex flex-col lg:w-7/12 h-screen items-center justify-center p-8 lg:p-12 relative bg-green-950"
      >
        {/* Soft Background Gradient Textures */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full mix-blend-screen opacity-15 blur-3xl bg-green-500"></div>
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full mix-blend-screen opacity-10 blur-3xl bg-emerald-400"></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] transform -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen opacity-10 blur-2xl bg-lime-300"></div>
        </div>

        <div className="w-full max-w-lg text-center relative z-10 flex flex-col items-center justify-center">
          
          {/* Beautiful Main Icon/Photo Box Container */}
          <div className="mb-6 relative group">
            <div className="absolute inset-0 bg-green-400 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[1.8rem] bg-white flex items-center justify-center shadow-2xl p-3.5 relative transform transition-transform duration-500 group-hover:scale-105">
              <img src="/logo.png" alt="Little Steps Emblem" className="w-full h-full object-contain" />
            </div>
            {/* Small decorative floating circle */}
            <div className="absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 bg-lime-400 rounded-full border-4 border-green-950 shadow-lg animate-bounce" style={{ animationDuration: '3s' }}></div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight">
            Nurturing every<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-lime-300 drop-shadow-sm">child's journey 🌿</span>
          </h2>
          
          <p className="text-green-100/70 text-sm mb-8 lg:mb-10 max-w-[280px] mx-auto font-medium leading-relaxed">
            A secure, delightful, and comprehensive ERP made entirely for pre-primary schools.
          </p>

          {/* Carefully sized features grid layout to prevent tall stack overflow */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-xl p-3 lg:p-3.5 text-left border border-white/10 backdrop-blur-md bg-white/5 shadow-xl transition-all hover:bg-white/10 hover:-translate-y-1 cursor-default"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 lg:w-7 lg:h-7 bg-white/10 rounded-[6px] flex items-center justify-center shadow-inner text-white">
                    {f.icon}
                  </div>
                  <h3 className="text-white font-bold text-[12px] lg:text-[13px] tracking-wide">{f.title}</h3>
                </div>
                <p className="text-green-50/60 text-[10px] lg:text-[11px] font-medium leading-snug pl-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-green-500/40 text-[10px] font-bold tracking-[0.2em] uppercase mt-10 mb-2">
            Little Steps © 2026
          </p>
        </div>
      </div>
    </div>
  );
}