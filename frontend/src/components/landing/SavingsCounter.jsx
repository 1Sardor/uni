import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function SavingsCounter({ value = 2640955, currency = "UZS " }) {
  const [displayValue, setDisplayValue] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const duration = 2500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  const formatted = displayValue.toLocaleString("en-US");

  return (
    <section className="bg-[#F4F5F8] py-16 lg:py-24 relative overflow-hidden">
      {[
        { x: "5%", y: "20%", delay: 0, size: 32 },
        { x: "15%", y: "70%", delay: 0.5, size: 24 },
        { x: "85%", y: "25%", delay: 1, size: 28 },
        { x: "92%", y: "65%", delay: 1.5, size: 36 },
        { x: "45%", y: "15%", delay: 0.3, size: 20 },
        { x: "70%", y: "80%", delay: 0.8, size: 26 },
        { x: "25%", y: "40%", delay: 1.2, size: 22 },
        { x: "80%", y: "45%", delay: 0.6, size: 30 },
      ].map((icon, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], y: [20, -10, -20, -30] }}
          transition={{ duration: 4, delay: icon.delay, repeat: Infinity, repeatDelay: 2 }}
          className="absolute"
          style={{ left: icon.x, top: icon.y }}
        >
          <div className="bg-emerald-400/20 text-emerald-600 rounded-lg p-2 flex items-center justify-center" style={{ width: icon.size, height: icon.size }}>
            <span className="text-[8px] font-bold">UZS</span>
          </div>
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-xl sm:text-2xl font-semibold text-[#070a59]/60 mb-4"
        >
          {t("savings.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold text-[#070a59] tracking-tight"
        >
          <span className="text-2xl sm:text-3xl text-[#070a59]/60">{currency}</span>{formatted}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-500 mt-6 max-w-md mx-auto"
        >
          {t("savings.subtitle")}
        </motion.p>
      </div>
    </section>
  );
}
