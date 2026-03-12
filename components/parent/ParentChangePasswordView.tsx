"use client";
import React, { useState } from "react";
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { showToast } from "@/lib/toast";

export default function ParentChangePasswordView() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!oldPassword) { showToast.error("Please enter your current password"); return false; }
    if (!newPassword || newPassword.length < 8) { showToast.error("New password must be at least 8 characters"); return false; }
    if (newPassword !== confirmPassword) { showToast.error("New password and confirm password do not match"); return false; }
    if (newPassword === oldPassword) { showToast.error("New password must be different from old password"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && (data.success || data.message?.includes("success"))) {
        setSuccess(true);
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
        showToast.success("Password changed successfully!");
      } else {
        showToast.error(data.message || data.error || "Failed to change password");
      }
    } catch (err) {
      showToast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strengthChecks = [
    { label: "At least 8 characters", pass: newPassword.length >= 8 },
    { label: "Contains number", pass: /\d/.test(newPassword) },
    { label: "Contains letter", pass: /[a-zA-Z]/.test(newPassword) },
    { label: "Matches confirm field", pass: confirmPassword !== "" && newPassword === confirmPassword },
  ];

  const strengthScore = strengthChecks.filter(c => c.pass).length;

  const PasswordField = ({
    label, value, show, toggleShow, onChange, placeholder
  }: {
    label: string; value: string; show: boolean; toggleShow: () => void;
    onChange: (v: string) => void; placeholder: string;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent text-gray-800 bg-gray-50 text-sm"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "Change Password" }]} />

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Change Password</h1>
        <p className="text-gray-500 text-sm mt-1">Update your account password to keep it secure</p>
      </div>

      <div className="max-w-lg">
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800">Password Changed Successfully!</p>
              <p className="text-sm text-emerald-600 mt-0.5">Your new password is now active.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Icon Header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
            <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800">Update Password</p>
              <p className="text-xs text-gray-400">Enter your current & new password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              label="Current Password"
              value={oldPassword}
              show={showOld}
              toggleShow={() => setShowOld(!showOld)}
              onChange={setOldPassword}
              placeholder="Enter your current password"
            />

            <PasswordField
              label="New Password"
              value={newPassword}
              show={showNew}
              toggleShow={() => setShowNew(!showNew)}
              onChange={setNewPassword}
              placeholder="Enter your new password"
            />

            {/* Strength Meter */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i <= strengthScore
                          ? strengthScore <= 1 ? "bg-red-500"
                          : strengthScore <= 2 ? "bg-amber-500"
                          : strengthScore <= 3 ? "bg-blue-500"
                          : "bg-emerald-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {strengthChecks.map(check => (
                    <div key={check.label} className="flex items-center gap-1.5 text-xs">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${check.pass ? "bg-emerald-500" : "bg-gray-200"}`}>
                        {check.pass && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={check.pass ? "text-emerald-700" : "text-gray-400"}>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              show={showConfirm}
              toggleShow={() => setShowConfirm(!showConfirm)}
              onChange={setConfirmPassword}
              placeholder="Re-enter your new password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Updating...</>
              ) : (
                <><Lock className="w-5 h-5" /> Update Password</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
