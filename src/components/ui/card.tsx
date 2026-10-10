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
    ? "bg-white/90 backdrop-blur-md border-slate-200 shadow-sm text-slate-900"
    : "bg-white border-slate-200/90 shadow-sm text-slate-900";
  const hover = hoverEffect
    ? "hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 hover:translate-y-[-2px]"
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
  <h3 className={`text-lg font-bold text-slate-900 tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p className={`text-sm text-slate-600 leading-relaxed ${className}`} {...props}>
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
  <div className={`mt-4 pt-4 border-t border-slate-100 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
