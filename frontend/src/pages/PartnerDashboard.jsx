import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, PhoneCall, CheckCircle2, XCircle, Tag, Building2, Users, Ticket, TrendingUp, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
import { api } from "@/api/apiClient";
import { useLanguage } from "@/lib/i18n";
import StatCard from "@/components/dashboard/StatCard";

const BAR_COLORS = ["#DDD8F0", "#CFE0F0", "#C9E8D8", "#F5DCC8", "#EBD5E2"];

const STATUS_META = {
  pending: { icon: Clock, badge: "bg-pastel-sand text-navy/60" },
  contacted: { icon: PhoneCall, badge: "bg-pastel-blue text-navy/70" },
  approved: { icon: CheckCircle2, badge: "bg-emerald-50 text-emerald-600" },
  rejected: { icon: XCircle, badge: "bg-red-50 text-red-500" },
};

export default function PartnerDashboard() {
  const [partner, setPartner] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    api.entities.Partner.me()
      .then(setPartner)
      .finally(() => setLoading(false));
    api.entities.Partner.stats().then(setStats).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner) return null;

  const meta = STATUS_META[partner.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-navy">
          {t("partnerDashboard.welcomeBack", { name: partner.contact_name })}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{partner.business_name}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("partnerDashboard.status")}
          </span>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${meta.badge}`}>
            <StatusIcon size={14} />
            {t(`partnerDashboard.status${partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}`)}
          </span>
        </div>
        <p className="text-sm text-navy/70">
          {t(`partnerDashboard.status${partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}Desc`)}
        </p>
      </motion.div>

      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              label={t("partnerDashboard.stats.studentsReached")}
              value={stats.students_count}
              icon={Users}
              color="bg-pastel-lavender"
              delay={100}
            />
            <StatCard
              label={t("partnerDashboard.stats.discountsClaimed")}
              value={stats.claims_count}
              icon={Ticket}
              color="bg-pastel-mint"
              delay={200}
            />
            <StatCard
              label={t("partnerDashboard.stats.totalSales")}
              value={stats.total_sales}
              prefix="UZS "
              icon={TrendingUp}
              color="bg-pastel-peach"
              delay={300}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)]"
            >
              <h3 className="font-heading text-sm font-semibold text-navy mb-6">{t("partnerDashboard.stats.claimsTrend")}</h3>
              {stats.claims_count === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  {t("partnerDashboard.stats.noClaimsYet")}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.daily_claims}>
                    <defs>
                      <linearGradient id="claimsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C9E8D8" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#C9E8D8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                      tickFormatter={(d) => moment(d).format("MMM D")}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} width={30} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", fontSize: 12 }}
                      labelFormatter={(d) => moment(d).format("MMM D")}
                      formatter={(val) => [val, t("partnerDashboard.stats.discountsClaimed")]}
                    />
                    <Area type="monotone" dataKey="count" stroke="#1A1F2E" strokeWidth={2} fill="url(#claimsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)]"
            >
              <h3 className="font-heading text-sm font-semibold text-navy mb-6">{t("partnerDashboard.stats.topDiscounts")}</h3>
              {stats.by_discount.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  {t("partnerDashboard.stats.noClaimsYet")}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.by_discount.map((row, i) => {
                    const max = stats.by_discount[0].count || 1;
                    return (
                      <div key={row.title} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-navy truncate">{row.title}</span>
                            <span className="text-xs font-semibold text-navy">{row.count}</span>
                          </div>
                          <div className="w-full h-2.5 bg-pastel-canvas rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(row.count / max) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/partner-dashboard/profile"
            className="block bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)] hover:-translate-y-0.5 transition-transform"
          >
            <div className="w-11 h-11 bg-pastel-lavender/50 rounded-2xl flex items-center justify-center mb-4">
              <Building2 size={20} className="text-navy" />
            </div>
            <h3 className="font-heading text-sm font-semibold text-navy">{t("partnerDashboard.nav.profile")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("partnerDashboard.applicationDetails")}</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/partner-dashboard/discounts"
            className="block bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)] hover:-translate-y-0.5 transition-transform"
          >
            <div className="w-11 h-11 bg-pastel-peach/60 rounded-2xl flex items-center justify-center mb-4">
              <Tag size={20} className="text-navy" />
            </div>
            <h3 className="font-heading text-sm font-semibold text-navy">{t("partnerDashboard.nav.discounts")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{partner.place_name || t("partnerDashboard.discounts.noPlace")}</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/partner-dashboard/scan"
            className="block bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)] hover:-translate-y-0.5 transition-transform"
          >
            <div className="w-11 h-11 bg-pastel-mint/60 rounded-2xl flex items-center justify-center mb-4">
              <ScanLine size={20} className="text-navy" />
            </div>
            <h3 className="font-heading text-sm font-semibold text-navy">{t("partnerDashboard.nav.scan")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("partnerDashboard.scan.cardDesc")}</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
