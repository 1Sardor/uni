import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed, Laptop, Dumbbell, Shirt, Clapperboard, GraduationCap, Plane, HeartPulse, Tag as TagIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const categoryIcons = {
  "Food & Drinks": UtensilsCrossed,
  "Electronics": Laptop,
  "Fitness": Dumbbell,
  "Fashion": Shirt,
  "Entertainment": Clapperboard,
  "Education": GraduationCap,
  "Travel": Plane,
  "Health": HeartPulse,
};

export default function DiscountCard({ restaurant, offers = [], index = 0 }) {
  const { t } = useLanguage();
  const CategoryIcon = categoryIcons[restaurant.category] || TagIcon;
  const bestOffer = offers.reduce(
    (best, o) => (o.discount_percent > (best?.discount_percent || 0) ? o : best),
    offers[0]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(7,10,89,0.08)" }}
    >
      <Link
        to={`/discounts/${restaurant.id}`}
        className="block bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(26,31,46,0.03)] cursor-pointer group"
      >
        <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
          <img
            src={restaurant.image_url || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80"}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80`; }}
          />
          {bestOffer && (
            <div className="absolute top-3 right-3 bg-[#070a59] text-white text-sm font-display font-bold px-3 py-1.5 rounded-xl shadow-lg">
              {bestOffer.discount_percent}% OFF
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-heading text-base font-bold text-[#070a59] truncate">{restaurant.name}</h3>
            <CategoryIcon size={18} className="text-[#070a59]/50 flex-shrink-0" />
          </div>
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
            {offers.length === 1
              ? t("discountCard.offerAvailable", { count: offers.length })
              : t("discountCard.offersAvailable", { count: offers.length })}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              {restaurant.category}
            </span>
            {restaurant.is_local && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <MapPin size={10} /> {t("discountCard.local")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
