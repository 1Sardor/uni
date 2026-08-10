import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Check, Instagram, IdCard, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import DealTimer from "@/components/discounts/DealTimer";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isBusiness = String(user?.role) === "2";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.entities.Restaurant.get(id),
      api.entities.Discount.filter({ restaurant_id: id, is_active: true }),
    ]).then(([r, d]) => {
      setRestaurant(r);
      setOffers(d);
      setLoading(false);
    });
  }, [id]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-xl font-bold text-navy mb-2">{t("restaurantDetail.placeNotFound")}</h2>
        <Link to="/discounts" className="text-sm text-primary font-medium hover:underline">
          {t("restaurantDetail.backToDiscounts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-64px)]">
      <div className="relative bg-gray-100 h-72 sm:h-96 lg:h-auto">
        <img
          src={restaurant.image_url || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80"; }}
        />
      </div>

      <div className="px-6 sm:px-10 lg:px-12 py-6 lg:py-8 max-w-xl">
        <Link to="/discounts" className="text-xs font-medium text-muted-foreground hover:text-navy transition-colors">
          {t("restaurantDetail.back")}
        </Link>

        <h1 className="font-display text-3xl font-bold text-navy mt-4">{restaurant.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pastel-lavender text-navy/60">
            {restaurant.category}
          </span>
          {restaurant.is_local && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin size={10} /> {t("restaurantDetail.local")}
            </span>
          )}
        </div>
        {restaurant.location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-3">
            <MapPin size={14} className="text-navy/40" />
            {restaurant.location}
          </div>
        )}

        <hr className="my-5 border-border/60" />

        <h2 className="font-heading text-sm font-semibold text-navy mb-3">{t("restaurantDetail.offers")}</h2>
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("restaurantDetail.noOffers")}</p>
        ) : (
          <div className="space-y-2">
            {offers.map((offer, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={offer.id} className="border border-border/60 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="text-sm font-semibold text-navy">{offer.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-[#070a59]">{offer.discount_percent}% OFF</span>
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {offer.description && (
                            <p className="text-sm text-muted-foreground">{offer.description}</p>
                          )}

                          {offer.deal_type && offer.deal_type !== "regular" && (
                            <DealTimer dealType={offer.deal_type} expiresAt={offer.expires_at} />
                          )}

                          {(offer.original_price || offer.offer_price) && (
                            <div className="flex items-center gap-3 bg-pastel-canvas rounded-xl p-3">
                              {offer.original_price && (
                                <span className="text-gray-400 line-through text-sm">UZS {offer.original_price}</span>
                              )}
                              {offer.offer_price && (
                                <span className="font-display text-lg font-bold text-navy">UZS {offer.offer_price}</span>
                              )}
                            </div>
                          )}

                          {offer.promo_code && (
                            <div className="flex items-center gap-2 bg-pastel-canvas rounded-xl p-3">
                              <code className="flex-1 text-center font-mono text-sm font-semibold text-navy tracking-widest">
                                {offer.promo_code}
                              </code>
                              <button onClick={() => copyCode(offer.promo_code)} className="p-2 rounded-lg hover:bg-white transition-colors">
                                {copiedCode === offer.promo_code ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-muted-foreground" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        <hr className="my-5 border-border/60" />

        <h2 className="font-heading text-sm font-semibold text-navy mb-3">{t("restaurantDetail.about")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{restaurant.description}</p>

        {restaurant.instagram && (
          <>
            <hr className="my-5 border-border/60" />
            <h2 className="font-heading text-sm font-semibold text-navy mb-3">{t("restaurantDetail.social")}</h2>
            <a
              href={restaurant.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border/60 hover:bg-pastel-canvas transition-colors"
            >
              <Instagram size={18} className="text-navy/70" />
            </a>
          </>
        )}

        {!isBusiness && (
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => navigate(isAuthenticated ? "/student-id" : "/login")}
              className="rounded-2xl h-12 px-6 gap-2 bg-[#070a59] hover:bg-[#070a59]/90"
            >
              <IdCard size={16} />
              {t("restaurantDetail.showStudentId")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
