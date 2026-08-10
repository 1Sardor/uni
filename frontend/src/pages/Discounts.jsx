import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { Search, Zap, Flame, Calendar, LayoutGrid, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import DiscountCard from "@/components/discounts/DiscountCard";
import { useLanguage } from "@/lib/i18n";

export default function Discounts() {
  const { t } = useLanguage();
  const timeFilters = [
    { value: "all", label: t("discounts.allDeals"), icon: LayoutGrid },
    { value: "hourly", label: t("discounts.flashDeals"), icon: Zap },
    { value: "daily", label: t("discounts.dailyDeals"), icon: Flame },
    { value: "weekly", label: t("discounts.weeklyDeals"), icon: Calendar },
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [restaurants, setRestaurants] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(categoryParam || "All");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    if (categoryParam && categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const selectCategory = (cat) => {
    setActiveCategory(cat);
    setSearchParams(cat === "All" ? {} : { category: cat });
  };

  const loadData = async () => {
    try {
      const [r, d, c] = await Promise.all([
        api.entities.Restaurant.list(),
        api.entities.Discount.filter({ is_active: true }),
        api.entities.Category.list("name"),
      ]);
      setRestaurants(r);
      setDiscounts(d);
      setCategories(["All", ...c.map((cat) => cat.name)]);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const offersByRestaurant = (restaurantId) => discounts.filter((d) => d.restaurant_id === restaurantId);

  const filtered = restaurants.filter((r) => {
    const offers = offersByRestaurant(r.id);
    if (offers.length === 0) return false;
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || r.category === activeCategory;
    const matchTime = timeFilter === "all" || offers.some((o) => o.deal_type === timeFilter);
    return matchSearch && matchCategory && matchTime;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold text-[#070a59]">{t("discounts.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("discounts.subtitle")}</p>
      </motion.div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("discounts.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 h-12 rounded-2xl border-0 bg-white shadow-[0_2px_12px_rgba(26,31,46,0.03)] focus-visible:ring-1 focus-visible:ring-[#070a59]/20"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {timeFilters.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeFilter(tf.value)}
            className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-medium transition-all duration-200 ${
              timeFilter === tf.value ? "bg-[#070a59] text-white" : "bg-white text-muted-foreground hover:bg-pastel-lavender/40 hover:text-[#070a59]"
            }`}
          >
            <tf.icon size={18} />
            {tf.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => selectCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-200 ${
              activeCategory === cat ? "bg-[#070a59] text-white" : "bg-white text-muted-foreground hover:bg-pastel-lavender/40 hover:text-[#070a59]"
            }`}
          >
            {cat === "All" ? t("discounts.all") : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_12px_rgba(26,31,46,0.03)]">
          <div className="w-20 h-20 bg-pastel-lavender/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag size={32} className="text-navy/40" />
          </div>
          <h3 className="font-display text-lg font-semibold text-navy mb-1">{t("discounts.noOffersFound")}</h3>
          <p className="text-sm text-muted-foreground">{t("discounts.tryDifferent")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((restaurant, i) => (
            <DiscountCard
              key={restaurant.id}
              restaurant={restaurant}
              offers={offersByRestaurant(restaurant.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
