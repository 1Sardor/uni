import React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-navy text-white hover:bg-navy/90",
  outline: "border border-border bg-white text-navy hover:bg-pastel-canvas",
  ghost: "hover:bg-pastel-canvas text-navy",
};

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
    const sizeClasses = size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4";
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          sizeClasses,
          variantClasses[variant] || variantClasses.default,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
