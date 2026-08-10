import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Coffee, UtensilsCrossed, Scissors, Dumbbell, Stethoscope, Clapperboard } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const categories = [
  { key: "cafes", icon: Coffee, color: "#c28c6e", category: "Food & Drinks" },
  { key: "restaurants", icon: UtensilsCrossed, color: "#e61a2b", category: "Food & Drinks" },
  { key: "selfCare", icon: Scissors, color: "#28a0e0", category: "Fashion" },
  { key: "fitness", icon: Dumbbell, color: "#1a3375", category: "Fitness" },
  { key: "healthcare", icon: Stethoscope, color: "#008060", category: "Health" },
  { key: "entertainment", icon: Clapperboard, color: "#ff8c00", category: "Entertainment" },
];

export default function CategoryGrid() {
  const { t } = useLanguage();
  return (
    <section className="bg-[#070a59] pb-16 lg:pb-24 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-white text-center mb-10"
        >
          {t("categoryGrid.title")}
        </motion.h2>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-3xl mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.05 }}
            >
              <Link to={`/discounts?category=${encodeURIComponent(cat.category)}`} className="flex flex-col items-center gap-3 cursor-pointer">
                <div
                  className="w-full aspect-square rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: cat.color }}
                >
                  <cat.icon size={28} className="text-white" />
                </div>
                <span className="text-white text-xs font-medium">{t(`categoryGrid.${cat.key}`)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
