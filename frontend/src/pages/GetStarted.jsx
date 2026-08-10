import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function GetStarted() {
  const { t } = useLanguage();

  const cards = [
    {
      icon: GraduationCap,
      title: t("getStarted.studentTitle"),
      description: t("getStarted.studentDesc"),
      cta: t("getStarted.studentCta"),
      to: "/login",
      accent: "bg-pastel-lavender/50",
    },
    {
      icon: Briefcase,
      title: t("getStarted.partnerTitle"),
      description: t("getStarted.partnerDesc"),
      cta: t("getStarted.partnerCta"),
      to: "/business/login",
      accent: "bg-pastel-peach/60",
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-pastel-canvas px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">{t("getStarted.title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">{t("getStarted.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map(({ icon: Icon, title, description, cta, to, accent }) => (
            <Link
              key={to}
              to={to}
              className="group bg-card rounded-3xl shadow-[0_4px_24px_rgba(26,31,46,0.06)] p-8 flex flex-col hover:-translate-y-1 transition-transform duration-200"
            >
              <div className={`w-12 h-12 ${accent} rounded-2xl flex items-center justify-center mb-5`}>
                <Icon size={22} className="text-navy" />
              </div>
              <h2 className="font-display text-xl font-bold text-navy">{title}</h2>
              <p className="text-sm text-muted-foreground mt-2 flex-1">{description}</p>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-navy mt-6 group-hover:gap-2.5 transition-all">
                {cta}
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
