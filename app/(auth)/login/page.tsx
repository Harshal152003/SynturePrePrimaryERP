"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, BookOpen, Users, GraduationCap, Eye, EyeOff, Footprints } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("admin");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    { icon: "👣", title: "Child-First Approach", desc: "Track every little step of your child's development" },
    { icon: "📊", title: "Real-Time Reports", desc: "Instant updates on attendance, progress and more" },
    { icon: "💬", title: "Parent Connect", desc: "Direct communication between parents and teachers" },
    { icon: "🌿", title: "Holistic Growth", desc: "Monitor academic and personal milestones together" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#F4F8F5" }}>
      {/* Left Side — Login Form */}
      <div className="w-full lg:w-5/12 bg-white flex items-center justify-center p-8 lg:p-12 shadow-xl">
        <div className="w-full max-w-md">

          {/* Brand Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm overflow-hidden p-1.5 border border-gray-100">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: "#1a3f22" }}>Little Steps</h1>
                <p className="text-xs text-gray-400 font-medium tracking-wide">PRE-PRIMARY SCHOOL ERP</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">Welcome back! 👋</h2>
            <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Login As</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {roleIcons[role as keyof typeof roleIcons]}
                </div>
                <select
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white text-sm"
                  style={{ "--tw-ring-color": "#1a3f22" } as any}
                >
                  <option value="admin">School Administrator (Admin)</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent / Guardian</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-300" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
                  style={{ "--tw-ring-color": "#1a3f22" } as any}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-300" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
                  style={{ "--tw-ring-color": "#1a3f22" } as any}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                  style={{ accentColor: "#1a3f22" }}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm font-medium transition-colors" style={{ color: "#1a3f22" }}>
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #1a3f22, #2e6b3a)" }}
            >
              {loading ? "Signing in..." : "Sign In to Little Steps"}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              Need access?{" "}
              <a href="/#contact" className="font-medium transition-colors" style={{ color: "#1a3f22" }}>
                Contact the school admin
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side — Illustration */}
      <div
        className="hidden lg:flex lg:w-7/12 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a3f22 0%, #112a17 50%, #1a3f22 100%)" }}
      >
        {/* Floating blobs */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10" style={{ background: "#8DC63F" }}></div>
        <div className="absolute bottom-32 left-20 w-48 h-48 rounded-full opacity-5" style={{ background: "#8DC63F" }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full opacity-10" style={{ background: "#6dbf7e" }}></div>

        <div className="max-w-lg text-center relative z-10">
          {/* Logo footprint */}
          <div className="mb-10 flex justify-center">
            <div
              className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl p-4"
              style={{ background: "#ffffff" }}
            >
              <img src="/logo.png" alt="Little Steps Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Every child's journey<br />
            <span style={{ color: "#8DC63F" }}>starts here 🌿</span>
          </h2>
          <p className="text-green-100/70 text-lg mb-12 leading-relaxed">
            Little Steps makes school management simple, beautiful, and focused on what matters — your children.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 text-left border border-white/8"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
                <p className="text-green-200/60 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-green-200/30 text-xs mt-10">© 2026 Little Steps School ERP</p>
        </div>
      </div>
    </div>
  );
}