import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";
import PublicFooter from "@/components/landing/PublicFooter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";

const LANGUAGE_META = {
  en: { flag: "🇬🇧", short: "EN" },
  ru: { flag: "🇷🇺", short: "RU" },
  uz: { flag: "🇺🇿", short: "UZ" },
};

export default function PublicLayout({ dark = false, hideFooter = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t, languages } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const displayName = user?.full_name || user?.phone_number || "";
  const displayInitial = displayName.slice(0, 2).toUpperCase();
  const isBusiness = isAuthenticated && String(user?.role) === "2";
  const dashboardPath = isBusiness ? "/partner-dashboard" : "/dashboard";

  const navLinks = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.discounts"), path: "/discounts" },
    { label: t("nav.membership"), path: "/membership" },
  ];

  const textColor = dark ? "text-white" : "text-navy";
  const hoverColor = dark ? "text-white/80" : "text-navy/60";

  return (
    <div className={`min-h-screen flex flex-col ${dark ? "bg-[#070a59]" : "bg-white"}`}>
      <header className={`sticky top-0 z-50 ${dark ? "bg-[#070a59]/95" : "bg-white/95"} backdrop-blur-xl border-b ${dark ? "border-white/10" : "border-border/50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#070a59] rounded-lg flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className={`font-display text-lg font-bold ${textColor}`}>StudentPass</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors ${active ? textColor : `${hoverColor} hover:${textColor}`}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher dark={dark} />
              {isAuthenticated ? (
                <Link
                  to={dashboardPath}
                  className="flex items-center bg-[#070a59] p-2 rounded-xl hover:bg-[#070a59]/90 transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-[11px] font-bold tracking-tight">
                    {displayInitial}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/get-started"
                  className="bg-[#070a59] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#070a59]/90 transition-colors"
                >
                  {t("nav.getStarted")}
                </Link>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden ${textColor}`}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className={`md:hidden border-t ${dark ? "border-white/10" : "border-border/50"} px-4 py-4 space-y-3`}>
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`block text-sm font-medium ${textColor} py-2`}>
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 py-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    lang === language ? "bg-[#070a59] text-white" : `${dark ? "bg-white/10 text-white/70" : "bg-pastel-canvas text-navy/60"}`
                  }`}
                >
                  <span>{LANGUAGE_META[lang]?.flag}</span>
                  {LANGUAGE_META[lang]?.short ?? lang}
                </button>
              ))}
            </div>
            {isAuthenticated ? (
              <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="flex items-center justify-center bg-[#070a59] py-3 rounded-xl">
                <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white text-xs font-bold tracking-tight">
                  {displayInitial}
                </span>
              </Link>
            ) : (
              <Link to="/get-started" onClick={() => setMobileOpen(false)} className="block bg-[#070a59] text-white text-sm font-semibold px-5 py-3 rounded-xl text-center">
                {t("nav.getStarted")}
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {!hideFooter && <PublicFooter />}
    </div>
  );
}
