import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Ticket, ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import DigitalIDCard from "@/components/dashboard/DigitalIDCard";
import StatCard from "@/components/dashboard/StatCard";
import EventPreviewCard from "@/components/dashboard/EventPreviewCard";
import CompleteProfileModal from "@/components/dashboard/CompleteProfileModal";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [claimed, setClaimed] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await api.auth.me();
        setUser(u);
        const profiles = await api.entities.StudentProfile.filter({ created_by_id: u.id });
        const loadedProfile = profiles.length > 0 ? profiles[0] : null;
        if (loadedProfile) setProfile(loadedProfile);
        const promptKey = `unilink_profile_prompt_seen_${u.id}`;
        if (!loadedProfile && !localStorage.getItem(promptKey)) {
          localStorage.setItem(promptKey, "1");
          setShowProfileModal(true);
        }
        const c = await api.entities.ClaimedDiscount.list("-created_date", 50);
        setClaimed(c);
        const e = await api.entities.CampusEvent.list("-event_date", 3);
        setEvents(e);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  const totalSaved = claimed.reduce((s, c) => s + (c.amount_saved || 0), 0);
  const totalOffers = claimed.length;
  const firstName = user?.full_name?.split(" ")[0] || "Student";
  const thisMonth = claimed.filter((c) => {
    const d = new Date(c.claimed_date || c.created_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlySaved = thisMonth.reduce((s, c) => s + (c.amount_saved || 0), 0);

  return (
    <div className="py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-navy">{t("dashboard.home.welcomeBack", { name: firstName })}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {monthlySaved > 0
            ? t("dashboard.home.savedThisMonth", { amount: monthlySaved, count: thisMonth.length })
            : t("dashboard.home.startClaiming")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DigitalIDCard profile={profile} userName={user?.full_name} />
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={t("dashboard.home.totalSaved")} value={totalSaved} prefix="UZS " icon={TrendingUp} color="bg-pastel-lavender" delay={100} />
          <StatCard label={t("dashboard.home.offersUsed")} value={totalOffers} icon={ShoppingBag} color="bg-pastel-blue" delay={200} />
          <StatCard label={t("dashboard.home.thisMonth")} value={monthlySaved} prefix="UZS " icon={Ticket} color="bg-pastel-mint" delay={300} />
          <Link to="/discounts">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-pastel-peach rounded-3xl p-5 h-full flex flex-col justify-between cursor-pointer"
            >
              <span className="text-navy/50 text-xs font-medium uppercase tracking-wider">{t("dashboard.home.explore")}</span>
              <div className="flex items-end justify-between">
                <p className="font-display text-lg font-bold text-navy">{t("dashboard.home.browseDeals")}</p>
                <ArrowRight size={18} className="text-navy/40" />
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-navy">{t("dashboard.home.upcomingEvents")}</h2>
          <Link to="/events" className="text-xs font-medium text-muted-foreground hover:text-navy transition-colors flex items-center gap-1">
            {t("dashboard.home.viewAll")} <ArrowRight size={12} />
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-[0_2px_12px_rgba(26,31,46,0.03)]">
            <div className="w-16 h-16 bg-pastel-lavender/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={24} className="text-navy/40" />
            </div>
            <p className="text-sm text-muted-foreground">{t("dashboard.home.noEventsYet")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => (
              <EventPreviewCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>

      <CompleteProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        profile={profile}
        onSaved={setProfile}
      />
    </div>
  );
}
