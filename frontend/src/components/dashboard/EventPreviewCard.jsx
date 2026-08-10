import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
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

export default function EventPreviewCard({ event, index = 0 }) {
  const { t } = useLanguage();
  const categoryLabels = {
    Social: t("dashboard.events.social"),
    Academic: t("dashboard.events.academic"),
    Sports: t("dashboard.events.sports"),
    Cultural: t("dashboard.events.cultural"),
    Career: t("dashboard.events.career"),
    Workshop: t("dashboard.events.workshop"),
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(26,31,46,0.03)] cursor-default"
    >
      <div className="flex items-start gap-4">
        <div className={`${categoryColors[event.category] || "bg-pastel-lavender"} rounded-2xl p-3 flex-shrink-0`}>
          <Calendar size={20} className="text-navy/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColors[event.category] || "bg-pastel-lavender"} text-navy/60`}>
              {categoryLabels[event.category] || event.category}
            </span>
            {event.is_free && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{t("dashboard.events.free")}</span>
            )}
          </div>
          <h4 className="font-heading text-sm font-semibold text-navy truncate">{event.title}</h4>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {moment(event.event_date).format("MMM D, h:mm A")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {event.location}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
