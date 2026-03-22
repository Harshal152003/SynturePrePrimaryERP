"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Send, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp() {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { icon: "🛡️", title: "Secure Reset", desc: "Industry standard encryption for your account." },
    { icon: "⚡", title: "Fast Recovery", desc: "Get back into your account in minutes." },
    { icon: "🔒", title: "Data Protection", desc: "Your personal information is always safe." },
    { icon: "🌿", title: "Little Steps", desc: "Because every step of the journey matters." },
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white selection:bg-green-100 selection:text-green-900">
      
      {/* Left Side — Password Recovery Form */}
      <div className="w-full lg:w-5/12 bg-white flex flex-col px-6 lg:px-12 py-4 relative z-10 shadow-2xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="w-full max-w-[380px] m-auto py-4">

          {/* Back to Login Button */}
          {step < 4 && (
            <button 
              onClick={() => router.push("/login")}
              className="absolute top-6 left-6 flex items-center gap-2 text-[11px] font-bold tracking-wide text-gray-500 hover:text-green-700 transition-colors bg-gray-50 hover:bg-green-50 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Login
            </button>
          )}

          {/* Brand Logo & Header */}
          <div className={`mb-6 items-center flex flex-col sm:items-start text-center sm:text-left ${step < 4 ? 'mt-8' : ''}`}>
            <div className={`flex items-center gap-3 mb-4 flex-col sm:flex-row ${step === 4 ? 'w-full' : ''}`}>
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 flex flex-shrink-0 items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className={`flex flex-col text-center sm:text-left ${step === 4 ? 'items-center' : ''}`}>
                <h1 className="text-xl font-bold tracking-tight text-green-950 leading-tight">Little Steps</h1>
                <p className="text-[10px] font-bold tracking-wider text-green-600/70 uppercase">Pre-Primary ERP</p>
              </div>
            </div>

            {step === 1 && (
              <>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight mt-2">Forgot Password? 🔐</h2>
                <p className="text-gray-500 text-[13px] font-medium">Enter your email address to receive a recovery OTP.</p>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight mt-2">Check Your Email ✉️</h2>
                <p className="text-gray-500 text-[13px] font-medium">We've sent a 6-digit OTP to <strong className="text-gray-700">{email}</strong>.</p>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight mt-2">Create New Password ✨</h2>
                <p className="text-gray-500 text-[13px] font-medium">Your new password must be at least 6 characters long.</p>
              </>
            )}
            {step === 4 && (
              <div className="text-center pt-8 w-full flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-green-100 shadow-[0_0_30px] ring-8 ring-green-50 animate-in zoom-in duration-500">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Password Reset! 🎉</h2>
                <p className="text-gray-500 text-[13px] font-medium mb-6 leading-relaxed">Your password has been successfully updated.<br/>You can now securely log in with your new password.</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl mb-4 text-[13px] font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form Content */}
          <div className="space-y-3">
            
            {/* Step 1: Email */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-400 group-focus-within:text-green-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 hover:border-green-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-[13px] shadow-sm font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-medium"
                    placeholder="Enter your registered email"
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full mt-4 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[14px] shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #164e29, #22c55e)" }}
                >
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -ml-20 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                  {loading ? "Sending OTP..." : (
                    <>
                      Send Recovery OTP
                      <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 mt-2">
                <label className="block text-[11px] font-bold text-gray-700 mb-2 w-full text-center uppercase tracking-wider">Recovery OTP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-100 hover:border-green-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all shadow-sm text-center text-xl tracking-[0.5em] font-bold text-gray-800 placeholder:text-gray-300"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full mt-4 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[14px] shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #164e29, #22c55e)" }}
                >
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -ml-20 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                  {loading ? "Verifying..." : (
                    <>
                      Verify OTP
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <div className="text-center mt-5">
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-[11px] font-bold text-gray-400 hover:text-green-700 underline-offset-4 hover:underline transition-all uppercase tracking-wider"
                  >
                    Change Email Address
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">New Password</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-400 group-focus-within:text-green-600">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 border-2 border-gray-100 hover:border-green-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-[13px] shadow-sm font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-medium"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full mt-4 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[14px] shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #164e29, #22c55e)" }}
                >
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -ml-20 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                  {loading ? "Updating..." : (
                    <>
                      Update Password
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <button
                  onClick={() => router.push("/login")}
                  className="w-full mt-2 text-white font-bold py-3 rounded-xl transition-all text-[14px] shadow-lg shadow-green-900/20 hover:shadow-green-900/30 flex items-center justify-center gap-2 group relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #164e29, #22c55e)" }}
                >
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -ml-20 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                  Back to Login Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}

          </div>

          {step < 4 && (
            <div className="mt-5 text-center bg-gray-50/80 hover:bg-gray-100 transition-colors py-2.5 rounded-xl border border-gray-100 cursor-pointer" onClick={() => router.push("/#contact")}>
              <p className="text-gray-500 text-[11px] font-bold tracking-wide">
                Having trouble? <span className="text-green-700 hover:underline">Contact support</span>
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Right Side — Illustration / Photo Box */}
      <div
        className="hidden lg:flex flex-col lg:w-7/12 h-screen items-center justify-center p-8 lg:p-12 relative bg-green-950"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full mix-blend-screen opacity-15 blur-3xl bg-green-500"></div>
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full mix-blend-screen opacity-10 blur-3xl bg-emerald-400"></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] transform -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen opacity-10 blur-2xl bg-lime-300"></div>
        </div>

        <div className="w-full max-w-lg text-center relative z-10 flex flex-col items-center justify-center">
          
          <div className="mb-6 relative group">
            <div className="absolute inset-0 bg-green-400 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[1.8rem] bg-white flex items-center justify-center shadow-2xl p-3.5 relative transform transition-transform duration-500 group-hover:scale-105">
              <img src="/logo.png" alt="Little Steps Emblem" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 bg-lime-400 rounded-full border-4 border-green-950 shadow-lg animate-bounce" style={{ animationDuration: '3s' }}></div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight">
            Account Recovery<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-lime-300 drop-shadow-sm">made simple 🔒</span>
          </h2>
          
          <p className="text-green-100/70 text-sm mb-8 lg:mb-10 max-w-[280px] mx-auto font-medium leading-relaxed">
            Follow the steps to securely regain access to your Little Steps account without hassle.
          </p>

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