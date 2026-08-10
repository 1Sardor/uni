import React, { useState, useEffect } from "react";
import { Clock, Zap, Calendar, Flame, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const dealTypeConfig = {
  hourly: { icon: Zap, labelKey: "flashDeal", color: "bg-red-500 text-white" },
  daily: { icon: Flame, labelKey: "dailyDeal", color: "bg-orange-500 text-white" },
  weekly: { icon: Calendar, labelKey: "weeklyDeal", color: "bg-[#070a59] text-white" },
  one_time: { icon: Sparkles, labelKey: "oneTimeDeal", color: "bg-purple-600 text-white" },
  regular: { icon: Clock, labelKey: "offer", color: "bg-gray-500 text-white" },
};

export default function DealTimer({ dealType, expiresAt }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!expiresAt) return;

    const update = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setExpired(true);
        return;
      }

      setUrgent(diff < 3600000);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const days = Math.floor(hours / 24);

      if (days > 0) setTimeLeft(`${days}d ${hours % 24}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m`);
      else if (minutes > 0) setTimeLeft(`${minutes}m ${seconds}s`);
      else setTimeLeft(`${seconds}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!dealType || dealType === "regular") return null;

  const config = dealTypeConfig[dealType] || dealTypeConfig.regular;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1.5">
      <span className={`${config.color} flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold`}>
        <Icon size={10} />
        {t(`dealTimer.${config.labelKey}`)}
      </span>
      {expiresAt && !expired && timeLeft && (
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${urgent ? "bg-red-50 text-red-600 animate-pulse" : "bg-white/90 text-[#070a59]"}`}>
          <Clock size={10} />
          {timeLeft}
        </span>
      )}
    </div>
  );
}
