import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-900/80 border ${
            error ? "border-rose-500 focus:ring-rose-500/50" : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30"
          } text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all duration-150 ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-400">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
