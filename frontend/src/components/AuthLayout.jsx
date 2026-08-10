import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, children, footer }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-pastel-canvas px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-[0_4px_24px_rgba(26,31,46,0.06)] p-8">
          <div className="text-center mb-6">
            {Icon && (
              <div className="w-12 h-12 bg-pastel-lavender/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-navy" />
              </div>
            )}
            <h1 className="font-display text-2xl font-bold text-navy">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
          </div>
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}
