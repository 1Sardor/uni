import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-[#FFF8E0] text-[#070a59] text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#FFD500] rounded-full animate-pulse" />
              {t("hero.badge")}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#070a59] leading-[1.1] tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-lg text-gray-500 mt-6 max-w-lg mx-auto lg:mx-0">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start">
              <Link
                to="/login"
                className="bg-[#070a59] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#070a59]/90 transition-colors flex items-center justify-center gap-2"
              >
                {t("hero.ctaPrimary")}
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/discounts"
                className="bg-gray-100 text-[#070a59] font-semibold px-8 py-4 rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="absolute w-80 h-80 lg:w-96 lg:h-96 bg-[#FFD500] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-56 h-96 bg-white rounded-[2.5rem] shadow-2xl border-4 border-[#070a59] overflow-hidden rotate-[-6deg]"
            >
              <div className="bg-[#070a59] h-32 p-4 text-white">
                <p className="text-[8px] text-white/60 uppercase tracking-wider">{t("hero.totalSaved")}</p>
                <p className="font-display text-3xl font-bold">UZS 1,250,000</p>
                <div className="mt-3 h-2 bg-white/20 rounded-full">
                  <div className="h-full w-3/4 bg-[#FFD500] rounded-full" />
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="bg-[#F4F4F8] rounded-xl p-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F5DCC8] rounded-lg" />
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                    <div className="h-1.5 bg-gray-100 rounded w-1/2 mt-1" />
                  </div>
                  <span className="text-[10px] font-bold text-[#070a59]">25%</span>
                </div>
                <div className="bg-[#F4F4F8] rounded-xl p-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#DDD8F0] rounded-lg" />
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded w-2/3" />
                    <div className="h-1.5 bg-gray-100 rounded w-1/2 mt-1" />
                  </div>
                  <span className="text-[10px] font-bold text-[#070a59]">40%</span>
                </div>
                <div className="bg-[#F4F4F8] rounded-xl p-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#C9E8D8] rounded-lg" />
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                    <div className="h-1.5 bg-gray-100 rounded w-1/2 mt-1" />
                  </div>
                  <span className="text-[10px] font-bold text-[#070a59]">15%</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute z-20 right-0 top-8 w-44 h-72 bg-white rounded-[2rem] shadow-2xl border-4 border-[#070a59] overflow-hidden rotate-[8deg] hidden sm:block"
            >
              <div className="bg-gradient-to-br from-[#DDD8F0] to-[#CFE0F0] h-full p-3 flex flex-col justify-center items-center text-center gap-2">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                  <GraduationCap size={22} className="text-[#070a59]" />
                </div>
                <p className="font-display text-sm font-bold text-[#070a59]">{t("hero.studentId")}</p>
                <div className="w-full space-y-1">
                  <div className="h-1.5 bg-white/60 rounded-full" />
                  <div className="h-1.5 bg-white/60 rounded-full w-3/4" />
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-[8px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Check size={10} /> {t("hero.verified")}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
