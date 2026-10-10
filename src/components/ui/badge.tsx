import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "purple" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors";

  const variants = {
    primary: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    secondary: "bg-slate-800 text-slate-300 border border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
    outline: "bg-transparent text-slate-300 border border-slate-600",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
