import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

export default function DigitalIDCard({ profile, userName }) {
  const { t } = useLanguage();
  const name = profile?.student_name || userName || "Student";
  const uni = profile?.university || t("dashboard.studentId.yourUniversity");
  const idNum = profile?.student_id_number || "—";
  const major = profile?.major || t("dashboard.digitalIdCard.notSet");
  const year = profile?.year_of_study || "—";
  const verified = profile?.id_verified || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to="/student-id" className="block">
        <div className="relative bg-navy rounded-3xl p-6 text-white overflow-hidden cursor-pointer group">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-pastel-lavender blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-pastel-blue blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{t("dashboard.digitalIdCard.title")}</p>
                <h3 className="font-display text-lg font-bold mt-1">{name}</h3>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${verified ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/60"}`}>
                {verified ? <BadgeCheck size={14} /> : <ShieldCheck size={14} />}
                {verified ? t("dashboard.digitalIdCard.verified") : t("dashboard.digitalIdCard.verify")}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">{t("dashboard.digitalIdCard.idNumber")}</p>
                <p className="text-sm font-semibold mt-0.5">{idNum}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">{t("dashboard.digitalIdCard.major")}</p>
                <p className="text-sm font-semibold mt-0.5 truncate">{major}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">{t("dashboard.digitalIdCard.year")}</p>
                <p className="text-sm font-semibold mt-0.5">{year}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/50 text-xs">{uni}</p>
            </div>
          </div>

          <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-3xl" />
        </div>
      </Link>
    </motion.div>
  );
}
