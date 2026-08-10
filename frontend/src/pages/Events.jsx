import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, CalendarDays } from "lucide-react";
import moment from "moment";
import { useLanguage } from "@/lib/i18n";

const categoryColors = {
  Social: "bg-pastel-lavender",
  Academic: "bg-pastel-blue",
  Sports: "bg-pastel-mint",
  Cultural: "bg-pastel-peach",
  Career: "bg-pastel-coral",
  Workshop: "bg-pastel-sand",
};

const categories = ["All", "Social", "Academic", "Sports", "Cultural", "Career", "Workshop"];

export default function Events() {
  const { t } = useLanguage();
  const categoryLabels = {
    All: t("dashboard.events.all"),
    Social: t("dashboard.events.social"),
    Academic: t("dashboard.events.academic"),
    Sports: t("dashboard.events.sports"),
    Cultural: t("dashboard.events.cultural"),
    Career: t("dashboard.events.career"),
    Workshop: t("dashboard.events.workshop"),
  };
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api.entities.CampusEvent.list("-event_date", 50).then(setEvents).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All" ? events : events.filter((e) => e.category === activeCategory);

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
        <h1 className="font-display text-2xl font-bold text-navy">{t("dashboard.events.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("dashboard.events.subtitle")}</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-200 ${
              activeCategory === cat ? "bg-navy text-white" : "bg-white text-muted-foreground hover:bg-pastel-lavender/40 hover:text-navy"
            }`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_12px_rgba(26,31,46,0.03)]">
          <div className="w-20 h-20 bg-pastel-lavender/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={32} className="text-navy/40" />
          </div>
          <h3 className="font-display text-lg font-semibold text-navy mb-1">{t("dashboard.events.noEventsFound")}</h3>
          <p className="text-sm text-muted-foreground">{t("dashboard.events.checkBackSoon")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((event, i) => {
            const eventDate = moment(event.event_date);
            const isPast = eventDate.isBefore(moment());
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                className={`bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(26,31,46,0.03)] ${isPast ? "opacity-60" : ""}`}
              >
                <div className="flex gap-4">
                  <div className={`${categoryColors[event.category] || "bg-pastel-lavender"} rounded-2xl p-4 flex flex-col items-center justify-center min-w-[72px] flex-shrink-0`}>
                    <span className="text-xs font-semibold text-navy/50 uppercase">{eventDate.format("MMM")}</span>
                    <span className="font-display text-2xl font-bold text-navy">{eventDate.format("D")}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${categoryColors[event.category] || "bg-pastel-lavender"} text-navy/60`}>
                        {categoryLabels[event.category] || event.category}
                      </span>
                      {event.is_free && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{t("dashboard.events.free")}</span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-pastel-canvas px-2.5 py-0.5 rounded-full">{t("dashboard.events.past")}</span>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-semibold text-navy mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} /> {eventDate.format("h:mm A")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} /> {event.location}
                      </span>
                      {event.organizer && (
                        <span className="flex items-center gap-1.5">
                          <Users size={12} /> {event.organizer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
