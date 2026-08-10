import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { Gift, Send, Coffee, Clapperboard, UtensilsCrossed, ShoppingBag, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n";

const voucherTypes = [
  { value: "Coffee", icon: Coffee, color: "bg-pastel-peach" },
  { value: "Cinema", icon: Clapperboard, color: "bg-pastel-lavender" },
  { value: "Food", icon: UtensilsCrossed, color: "bg-pastel-mint" },
  { value: "Shopping", icon: ShoppingBag, color: "bg-pastel-blue" },
  { value: "Fitness", icon: Dumbbell, color: "bg-pastel-coral" },
];

export default function Gifting() {
  const { t } = useLanguage();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ voucher_type: "", amount: "", recipient_name: "", recipient_email: "", message: "" });
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const u = await api.auth.me();
        setUser(u);
        const v = await api.entities.GiftVoucher.list("-created_date", 50);
        setVouchers(v);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleSend = async () => {
    if (!form.voucher_type || !form.amount || !form.recipient_name || !form.recipient_email) {
      toast({ title: t("dashboard.gifting.fillRequiredFields"), variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await api.entities.GiftVoucher.create({
        ...form,
        amount: parseFloat(form.amount),
        sender_name: user?.full_name || "A friend",
      });
      const v = await api.entities.GiftVoucher.list("-created_date", 50);
      setVouchers(v);
      setForm({ voucher_type: "", amount: "", recipient_name: "", recipient_email: "", message: "" });
      setOpen(false);
      toast({ title: t("dashboard.gifting.giftSent"), description: t("dashboard.gifting.giftSentDesc", { name: form.recipient_name }) });
    } catch (e) {
      toast({ title: t("dashboard.gifting.couldNotSendGift"), variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const getTypeInfo = (type) => voucherTypes.find((v) => v.value === type) || voucherTypes[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-start justify-between">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-2xl font-bold text-navy">{t("dashboard.gifting.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("dashboard.gifting.subtitle")}</p>
        </motion.div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl gap-2 h-11 px-5" onClick={() => setOpen(true)}>
              <Gift size={16} /> {t("dashboard.gifting.sendGift")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{t("dashboard.gifting.sendAVoucher")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">{t("dashboard.gifting.chooseType")}</Label>
                <div className="grid grid-cols-5 gap-2">
                  {voucherTypes.map((vt) => (
                    <button
                      key={vt.value}
                      onClick={() => setForm({ ...form, voucher_type: vt.value })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                        form.voucher_type === vt.value ? `${vt.color} ring-2 ring-navy/20` : "bg-pastel-canvas hover:bg-white"
                      }`}
                    >
                      <vt.icon size={18} className="text-navy/70" />
                      <span className="text-[10px] font-medium text-navy/60">{vt.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.gifting.amount")}</Label>
                <Input type="number" placeholder="25" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1 rounded-xl h-11" />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.gifting.recipientName")}</Label>
                <Input placeholder="Ahmed" value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} className="mt-1 rounded-xl h-11" />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.gifting.recipientEmail")}</Label>
                <Input type="email" placeholder="ahmed@university.edu" value={form.recipient_email} onChange={(e) => setForm({ ...form, recipient_email: e.target.value })} className="mt-1 rounded-xl h-11" />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.gifting.personalMessage")}</Label>
                <Textarea placeholder="Enjoy your coffee!" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 rounded-xl resize-none" rows={2} />
              </div>

              <Button onClick={handleSend} disabled={sending} className="w-full rounded-2xl h-12 gap-2">
                {sending ? t("dashboard.gifting.sending") : <><Send size={16} /> {t("dashboard.gifting.sendGift")}</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {voucherTypes.map((vt, i) => (
          <motion.button
            key={vt.value}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4, scale: 1.03 }}
            onClick={() => { setForm({ ...form, voucher_type: vt.value }); setOpen(true); }}
            className={`${vt.color} rounded-3xl p-5 text-center`}
          >
            <vt.icon size={28} className="text-navy/70 mx-auto mb-2" />
            <p className="text-sm font-semibold text-navy">{vt.value}</p>
          </motion.button>
        ))}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-navy mb-4">{t("dashboard.gifting.sentGifts")}</h2>
        {vouchers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_12px_rgba(26,31,46,0.03)]">
            <div className="w-20 h-20 bg-pastel-lavender/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift size={32} className="text-navy/40" />
            </div>
            <h3 className="font-display text-lg font-semibold text-navy mb-1">{t("dashboard.gifting.noGifts")}</h3>
            <p className="text-sm text-muted-foreground">{t("dashboard.gifting.surpriseFriend")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vouchers.map((v, i) => {
              const info = getTypeInfo(v.voucher_type);
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(26,31,46,0.03)] flex items-center gap-4"
                >
                  <div className={`${info.color} w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <info.icon size={20} className="text-navy/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy">{v.voucher_type} Voucher</p>
                    <p className="text-xs text-muted-foreground truncate">{t("dashboard.gifting.to")} {v.recipient_name} · {v.recipient_email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-navy">UZS {v.amount}</p>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      v.status === "claimed" ? "bg-emerald-50 text-emerald-600" :
                      v.status === "expired" ? "bg-red-50 text-red-500" :
                      "bg-pastel-sand text-navy/50"
                    }`}>
                      {v.status || t("dashboard.gifting.sent")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
