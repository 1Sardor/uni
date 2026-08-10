import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-xl px-4 py-3 shadow-lg text-sm bg-white border",
            t.variant === "destructive" ? "border-red-200 text-red-600" : "border-border text-navy"
          )}
        >
          {t.title && <p className="font-semibold">{t.title}</p>}
          {t.description && <p className="text-muted-foreground mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
