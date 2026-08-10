import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ShieldCheck, TrendingUp, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

export default function Membership() {
  const { t } = useLanguage();

  const features = [
    { icon: Sparkles, text: t("membership.feature1") },
    { icon: ShieldCheck, text: t("membership.feature2") },
    { icon: TrendingUp, text: t("membership.feature3") },
    { icon: Gift, text: t("membership.feature4") },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#070a59] tracking-tight">
            {t("membership.title")}
          </h1>
          <p className="text-gray-500 mt-4 max-w-md mx-auto">
            {t("membership.subtitle")}
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-[#070a59] rounded-3xl p-8 shadow-xl"
          >
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-[#070a59]">{t("membership.planName")}</h2>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-5xl font-extrabold text-[#070a59]">{t("membership.free")}</span>
                <span className="text-gray-400 text-sm">{t("membership.forever")}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 bg-[#F4F5F8] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-[#070a59]" />
                  </div>
                  <div className="flex items-start gap-2">
                    <feature.icon size={16} className="text-[#070a59]/60 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{feature.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/login"
              className="block w-full border-2 border-[#070a59] text-[#070a59] font-semibold py-3.5 rounded-2xl text-center hover:bg-[#070a59] hover:text-white transition-colors"
            >
              {t("membership.createAccount")}
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} />
              <span className="text-sm">{t("membership.offersStat")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <span className="text-sm">{t("membership.countriesStat")}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              <span className="text-sm">{t("membership.savedStat")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
