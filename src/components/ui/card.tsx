import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = false,
  hoverEffect = false,
  className = "",
  ...props
}) => {
  const base = "rounded-xl border p-6 transition-all duration-200";
  const styling = glass
    ? "bg-slate-900/60 backdrop-blur-md border-slate-800/80 shadow-xl shadow-black/40 text-slate-100"
    : "bg-slate-900/90 border-slate-800 shadow-lg text-slate-100";
  const hover = hoverEffect
    ? "hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:translate-y-[-2px]"
    : "";

  return (
    <div className={`${base} ${styling} ${hover} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => <div className={`mb-4 flex flex-col gap-1 ${className}`} {...props}>{children}</div>;

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`text-lg font-bold text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p className={`text-sm text-slate-400 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => <div className={`${className}`} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
