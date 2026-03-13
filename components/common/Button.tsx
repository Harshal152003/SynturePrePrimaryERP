import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "outline" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const baseStyles = "font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2";

  const variants = {
    primary: "text-white hover:opacity-90 disabled:opacity-60",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-50 border border-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400",
    warning: "bg-amber-500 text-white hover:bg-amber-600 disabled:bg-amber-400",
    outline: "border-2 text-[#1a3f22] hover:bg-green-50 disabled:opacity-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className} ${disabled || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      style={
        variant === "primary" ? { background: "linear-gradient(135deg, #1a3f22, #2e6b3a)" } :
          variant === "outline" ? { borderColor: "#1a3f22" } :
            undefined
      }
    >
      {loading && <span className="inline-block animate-spin">⟳</span>}
      {children}
    </button>
  );
}
