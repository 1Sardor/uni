import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useLanguage } from "@/lib/i18n";

export default function NewDeals() {
  const [deals, setDeals] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([api.entities.Restaurant.list(), api.entities.Discount.filter({ is_active: true })])
      .then(([restaurants, discounts]) => {
        if (!restaurants || restaurants.length === 0) return;
        const merged = restaurants.map((r) => {
          const best = discounts
            .filter((d) => d.restaurant_id === r.id)
            .sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0))[0];
          return { id: r.id, name: r.name, image_url: r.image_url, subtitle: best?.title };
        });
        setDeals(merged.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-[#070a59] py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-white text-center mb-10"
        >
          {t("newDeals.title")}
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals.map((deal, i) => (
            <Link key={deal.id} to={`/discounts/${deal.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={deal.image_url || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80"}
                    alt={deal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80"; }}
                  />
                </div>
                <div className="p-3">
                  <p className="font-heading text-sm font-bold text-[#070a59] truncate">{deal.name}</p>
                  <p className="text-xs text-gray-500 truncate">{deal.subtitle}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/discounts" className="inline-flex items-center gap-2 text-white font-semibold text-sm hover:text-[#FFD500] transition-colors">
            {t("newDeals.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
