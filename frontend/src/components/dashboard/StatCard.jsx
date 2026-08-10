import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function StatCard({ label, value, prefix = "", suffix = "", icon: Icon, color = "bg-pastel-lavender", delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numValue = typeof value === "number" ? value : parseFloat(value) || 0;

  useEffect(() => {
    const duration = 800;
    const startTime = Date.now() + delay;

    const animate = () => {
      const now = Date.now();
      if (now < startTime) {
        requestAnimationFrame(animate);
        return;
      }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * numValue));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [numValue, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${color} rounded-3xl p-5 cursor-default`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-navy/50 text-xs font-medium uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={16} className="text-navy/30" />}
      </div>
      <p className="font-display text-3xl font-bold text-navy">
        <span className="text-lg">{prefix}</span>
        {displayValue}
        <span className="text-lg ml-1">{suffix}</span>
      </p>
    </motion.div>
  );
}
