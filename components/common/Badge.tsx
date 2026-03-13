import React, { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "success" | "danger" | "warning" | "info" | "gray";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
}

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  rounded = false,
}: BadgeProps) {
  const variants = {
    primary: "bg-[#e6f0e8] text-[#1a3f22]",
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-green-50 text-[#2e6b3a]",
    gray: "bg-gray-100 text-gray-600",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-block font-medium ${variants[variant]} ${sizes[size]} ${rounded ? "rounded-full" : "rounded"
        }`}
    >
      {children}
    </span>
  );
}
