import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  TrendingUp,
  Rocket,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Lock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/api/apiClient";
import { useLanguage } from "@/lib/i18n";

const initialForm = {
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  city: "",
  category: "",
  website: "",
  message: "",
  password: "",
};

export default function BecomePartner() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [categories, setCategories] = useState([]);
  const { toast } = useToast();
  const { t } = useLanguage();

  const benefits = [
    { icon: Users, title: t("becomePartner.benefit1Title"), description: t("becomePartner.benefit1Desc") },
    { icon: TrendingUp, title: t("becomePartner.benefit2Title"), description: t("becomePartner.benefit2Desc") },
    { icon: Rocket, title: t("becomePartner.benefit3Title"), description: t("becomePartner.benefit3Desc") },
  ];

  useEffect(() => {
    api.entities.Category.list()
      .then(setCategories)
      .catch(() => toast({ title: t("becomePartner.categoriesError"), variant: "destructive" }));
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.contactName || !form.email || !form.category || !form.password) {
      toast({ title: t("becomePartner.missingFields"), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await api.entities.Partner.create(form);
      setSubmitted(true);
      toast({ title: t("becomePartner.sentTitle"), description: t("becomePartner.sentDescription") });
    } catch (err) {
      toast({ title: t("becomePartner.submitError"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#070a59]">{t("becomePartner.thanks", { name: form.contactName })}</h1>
        <p className="text-gray-500 mt-3">
          {t("becomePartner.receivedApplication", {
            business: form.businessName,
            email: form.email,
          })}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            to="/business/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors h-11 px-4 bg-navy text-white hover:bg-navy/90"
          >
            {t("becomePartner.goToDashboard")}
          </Link>
          <Button variant="outline" onClick={() => { setForm(initialForm); setSubmitted(false); }}>
            {t("becomePartner.submitAnother")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#070a59]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Briefcase size={14} />
              {t("becomePartner.badge")}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {t("becomePartner.title")}
            </h1>
            <p className="text-white/70 text-base sm:text-lg mt-4 max-w-2xl mx-auto">
              {t("becomePartner.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-border/60 p-6">
              <div className="w-11 h-11 rounded-xl bg-[#FFF8E0] text-[#070a59] flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-[#070a59]">{title}</h3>
              <p className="text-sm text-gray-500 mt-2">{description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-[#070a59]">{t("becomePartner.formTitle")}</h2>
            <p className="text-gray-500 mt-2">{t("becomePartner.formSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-border/60 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">{t("becomePartner.businessName")}</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="businessName"
                    placeholder={t("becomePartner.businessNamePlaceholder")}
                    value={form.businessName}
                    onChange={update("businessName")}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">{t("becomePartner.contactName")}</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contactName"
                    placeholder={t("becomePartner.contactNamePlaceholder")}
                    value={form.contactName}
                    onChange={update("contactName")}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("becomePartner.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@business.com"
                    value={form.email}
                    onChange={update("email")}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("becomePartner.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={form.phone}
                    onChange={update("phone")}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t("becomePartner.city")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="city"
                    placeholder={t("becomePartner.cityPlaceholder")}
                    value={form.city}
                    onChange={update("city")}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("becomePartner.category")}</Label>
                <Select value={form.category} onValueChange={(value) => setForm((f) => ({ ...f, category: value }))}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder={t("becomePartner.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{t("becomePartner.website")}</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  placeholder="https://yourbusiness.com"
                  value={form.website}
                  onChange={update("website")}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{t("becomePartner.message")}</Label>
              <Textarea
                id="message"
                placeholder={t("becomePartner.messagePlaceholder")}
                value={form.message}
                onChange={update("message")}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("becomePartner.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t("becomePartner.passwordPlaceholder")}
                  value={form.password}
                  onChange={update("password")}
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">{t("becomePartner.passwordHint")}</p>
            </div>

            <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("becomePartner.submitting")}
                </>
              ) : (
                t("becomePartner.submit")
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              {t("becomePartner.alreadyPartner")}{" "}
              <Link to="/business/login" className="text-[#070a59] font-medium hover:underline">
                {t("becomePartner.logIn")}
              </Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
