import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function DialogTrigger({ asChild, children, ...props }) {
  return React.cloneElement(children, props);
}

export function DialogContent({ className, children }) {
  return (
    <div className={cn("relative bg-white rounded-3xl shadow-2xl w-full max-h-[90vh] overflow-y-auto p-6", className)}>
      {children}
    </div>
  );
}

export function DialogHeader({ className, children }) {
  return <div className={cn("mb-2", className)}>{children}</div>;
}

export function DialogTitle({ className, children }) {
  return <h2 className={cn("font-display text-lg font-bold text-navy", className)}>{children}</h2>;
}
