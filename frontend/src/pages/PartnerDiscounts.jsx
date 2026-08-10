import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, Trash2, Loader2 } from "lucide-react";
import { api } from "@/api/apiClient";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const DEAL_TYPES = ["regular", "hourly", "daily", "weekly", "one_time"];
const ENABLED_DEAL_TYPES = ["regular", "one_time"];

const initialForm = {
  title: "",
  description: "",
  discount_percent: "",
  deal_type: "regular",
  original_price: "",
  offer_price: "",
  expires_at: "",
};

export default function PartnerDiscounts() {
  const [partner, setPartner] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const loadDiscounts = (placeId) => {
    api.entities.Discount.filter({ restaurant_id: placeId }).then(setDiscounts);
  };

  useEffect(() => {
    api.entities.Partner.me()
      .then((p) => {
        setPartner(p);
        if (p.place) loadDiscounts(p.place);
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.discount_percent) {
      toast({ title: t("partnerDashboard.discounts.missingFields"), variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      await api.entities.Discount.create({
        ...form,
        restaurant_id: partner.place,
        discount_percent: parseInt(form.discount_percent, 10) || 0,
        original_price: form.original_price || null,
        offer_price: form.offer_price || null,
        expires_at: form.expires_at || null,
      });
      loadDiscounts(partner.place);
      setForm(initialForm);
      setShowForm(false);
      toast({ title: t("partnerDashboard.discounts.created") });
    } catch (err) {
      toast({ title: t("partnerDashboard.discounts.createError"), variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (discount) => {
    const updated = await api.entities.Discount.update(discount.id, { is_active: !discount.is_active });
    setDiscounts((list) => list.map((d) => (d.id === discount.id ? updated : d)));
  };

  const removeDiscount = async (discount) => {
    await api.entities.Discount.delete(discount.id);
    setDiscounts((list) => list.filter((d) => d.id !== discount.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner?.place) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-2xl font-bold text-navy">{t("partnerDashboard.nav.discounts")}</h1>
        </motion.div>
        <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_12px_rgba(26,31,46,0.03)]">
          <div className="w-16 h-16 bg-pastel-lavender/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag size={24} className="text-navy/40" />
          </div>
          <p className="text-sm text-muted-foreground">{t("partnerDashboard.discounts.noPlaceDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-2xl font-bold text-navy">{t("partnerDashboard.nav.discounts")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{partner.place_name}</p>
        </motion.div>
        <Button onClick={() => setShowForm((v) => !v)} className="rounded-2xl gap-2 h-11 px-5">
          <Plus size={16} /> {t("partnerDashboard.discounts.addDiscount")}
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)] space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">{t("partnerDashboard.discounts.titleField")}</Label>
            <Input id="title" value={form.title} onChange={update("title")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("partnerDashboard.discounts.description")}</Label>
            <Textarea id="description" value={form.description} onChange={update("description")} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="discount_percent">{t("partnerDashboard.discounts.discountPercent")}</Label>
              <Input id="discount_percent" type="number" min="0" max="100" value={form.discount_percent} onChange={update("discount_percent")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal_type">{t("partnerDashboard.discounts.dealType")}</Label>
              <Select value={form.deal_type} onValueChange={(v) => setForm((f) => ({ ...f, deal_type: v }))}>
                <SelectTrigger id="deal_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type} disabled={!ENABLED_DEAL_TYPES.includes(type)}>
                      {t(`partnerDashboard.discounts.dealTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="original_price">{t("partnerDashboard.discounts.originalPrice")}</Label>
              <Input id="original_price" type="number" min="0" step="0.01" value={form.original_price} onChange={update("original_price")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer_price">{t("partnerDashboard.discounts.offerPrice")}</Label>
              <Input id="offer_price" type="number" min="0" step="0.01" value={form.offer_price} onChange={update("offer_price")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires_at">{t("partnerDashboard.discounts.expiresAt")}</Label>
            <Input id="expires_at" type="datetime-local" value={form.expires_at} onChange={update("expires_at")} />
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={creating}>
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("partnerDashboard.discounts.create")}
          </Button>
        </motion.form>
      )}

      {discounts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_12px_rgba(26,31,46,0.03)]">
          <div className="w-16 h-16 bg-pastel-lavender/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag size={24} className="text-navy/40" />
          </div>
          <p className="text-sm text-muted-foreground">{t("partnerDashboard.discounts.noDiscounts")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discounts.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(26,31,46,0.03)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pastel-peach/60 flex items-center justify-center flex-shrink-0">
                <Tag size={18} className="text-navy/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy truncate">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {d.discount_percent}% · {t(`partnerDashboard.discounts.dealTypes.${d.deal_type}`)}
                </p>
              </div>
              <button
                onClick={() => toggleActive(d)}
                className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
                  d.is_active ? "bg-emerald-50 text-emerald-600" : "bg-pastel-canvas text-navy/40"
                }`}
              >
                {d.is_active ? t("partnerDashboard.discounts.active") : t("partnerDashboard.discounts.inactive")}
              </button>
              <button onClick={() => removeDiscount(d)} className="text-muted-foreground hover:text-red-600 transition-colors flex-shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
