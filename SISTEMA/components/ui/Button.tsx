"use client";

import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "subtle";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] transition-all duration-fast ease-luxury",
        variant === "primary" &&
          "bg-charcoal text-ivory hover:bg-charcoal/90 active:bg-charcoal/80",
        variant === "subtle" &&
          "border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal/5",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
