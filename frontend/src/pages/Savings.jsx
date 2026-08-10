import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
import { useLanguage } from "@/lib/i18n";

const categoryColors = {
  "Food & Drinks": "#F5DCC8",
  "Electronics": "#CFE0F0",
  "Fitness": "#C9E8D8",
  "Fashion": "#EBD5E2",
  "Entertainment": "#DDD8F0",
  "Education": "#F5E6CC",
  "Travel": "#CFE0F0",
  "Health": "#C9E8D8",
};

export default function Savings() {
  const { t } = useLanguage();
  const [claimed, setClaimed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.ClaimedDiscount.list("-created_date", 200).then(setClaimed).finally(() => setLoading(false));
  }, []);

  const totalSaved = claimed.reduce((s, c) => s + (c.amount_saved || 0), 0);

  const monthlyData = useMemo(() => {
    const months = {};
    for (let i = 5; i >= 0; i--) {
      const m = moment().subtract(i, "months");
      months[m.format("MMM")] = { month: m.format("MMM"), saved: 0 };
    }
    claimed.forEach((c) => {
      const m = moment(c.claimed_date || c.created_date).format("MMM");
      if (months[m]) months[m].saved += c.amount_saved || 0;
    });
    return Object.values(months);
  }, [claimed]);

  const categoryData = useMemo(() => {
    const cats = {};
    claimed.forEach((c) => {
      if (!cats[c.category]) cats[c.category] = { category: c.category, saved: 0, count: 0 };
      cats[c.category].saved += c.amount_saved || 0;
      cats[c.category].count += 1;
    });
    return Object.values(cats).sort((a, b) => b.saved - a.saved);
  }, [claimed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold text-navy">{t("dashboard.savingsPage.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("dashboard.savingsPage.subtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-pastel-lavender rounded-3xl p-8 text-center"
      >
        <p className="text-navy/50 text-xs uppercase tracking-wider mb-2">{t("dashboard.savingsPage.totalLifetime")}</p>
        <p className="font-display text-6xl lg:text-7xl font-extrabold text-navy animate-count-up">
          <span className="text-2xl">UZS </span>{totalSaved}
        </p>
        <div className="flex items-center justify-center gap-1 mt-3 text-sm text-navy/60">
          <ArrowUpRight size={16} />
          {t("dashboard.savingsPage.acrossOffers", { count: claimed.length })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)]"
        >
          <h3 className="font-heading text-sm font-semibold text-navy mb-6">{t("dashboard.savingsPage.monthlyTrend")}</h3>
          {claimed.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              {t("dashboard.savingsPage.claimToSeeTrend")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DDD8F0" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#DDD8F0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", fontSize: 12 }}
                  formatter={(val) => [`UZS ${val}`, "Saved"]}
                />
                <Area type="monotone" dataKey="saved" stroke="#1A1F2E" strokeWidth={2} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)]"
        >
          <h3 className="font-heading text-sm font-semibold text-navy mb-6">{t("dashboard.savingsPage.byCategory")}</h3>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              {t("dashboard.savingsPage.noCategoryData")}
            </div>
          ) : (
            <div className="space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-navy">{cat.category}</span>
                      <span className="text-xs font-semibold text-navy">UZS {cat.saved}</span>
                    </div>
                    <div className="w-full h-2.5 bg-pastel-canvas rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalSaved > 0 ? (cat.saved / totalSaved) * 100 : 0}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: categoryColors[cat.category] || "#DDD8F0" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)]"
      >
        <h3 className="font-heading text-sm font-semibold text-navy mb-4">{t("dashboard.savingsPage.recentSavings")}</h3>
        {claimed.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("dashboard.savingsPage.noClaimedOffers")}</p>
        ) : (
          <div className="space-y-2">
            {claimed.slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-pastel-canvas last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: categoryColors[c.category] || "#DDD8F0" }}>
                    <TrendingUp size={14} className="text-navy/50" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy">{c.brand_name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.category} · {moment(c.claimed_date || c.created_date).format("MMM D")}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-emerald-600">+${c.amount_saved}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
