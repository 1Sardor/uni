import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Tag, LogOut, ScanLine } from "lucide-react";
import { api } from "@/api/apiClient";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import logo from "@/assets/logo.png";

export default function PartnerLayout() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: LayoutDashboard, label: t("partnerDashboard.nav.dashboard"), path: "/partner-dashboard" },
    { icon: Building2, label: t("partnerDashboard.nav.profile"), path: "/partner-dashboard/profile" },
    { icon: Tag, label: t("partnerDashboard.nav.discounts"), path: "/partner-dashboard/discounts" },
    { icon: ScanLine, label: t("partnerDashboard.nav.scan"), path: "/partner-dashboard/scan" },
  ];

  const handleLogout = () => {
    api.auth.logout("/business/login");
  };

  return (
    <div className="h-screen bg-pastel-canvas flex">
      <aside className="hidden lg:flex flex-col w-64 p-4">
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(26,31,46,0.04)] flex flex-col h-full p-5">
          <div className="mb-8 px-2 flex items-center gap-2">
            <img src={logo} alt="UniLink" className="w-9 h-9 object-contain flex-shrink-0" />
            <div>
              <h1 className="font-display text-lg font-bold text-navy tracking-tight leading-tight">UniLink</h1>
              <p className="text-xs text-muted-foreground leading-tight">{t("partnerDashboard.tagline")}</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${active ? "bg-pastel-lavender/60 text-navy" : "text-muted-foreground hover:bg-pastel-canvas hover:text-navy"}`}
                >
                  <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-1 mt-2">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-200">
              <LogOut size={18} strokeWidth={1.8} />
              {t("partnerDashboard.logout")}
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-border/50 px-2 pb-[env(safe-area-inset-bottom)]">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all ${active ? "text-navy" : "text-muted-foreground"}`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-pastel-lavender/60" : ""}`}>
                  <item.icon size={18} strokeWidth={active ? 2.2 : 1.6} />
                </div>
                {item.label}
              </Link>
            );
          })}
          <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium text-muted-foreground">
            <div className="p-1.5 rounded-xl">
              <LogOut size={18} strokeWidth={1.6} />
            </div>
            {t("partnerDashboard.logout")}
          </button>
        </nav>
      </div>

      <main className="flex-1 overflow-auto pb-24 lg:pb-6 lg:pr-4 lg:py-4">
        <div className="max-w-5xl mx-auto px-4 lg:px-0">
          <div className="flex justify-end pt-4 lg:pt-0 mb-2">
            <LanguageSwitcher />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
