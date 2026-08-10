import React, { useEffect, useState } from "react";
import { Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/api/apiClient";
import { useLanguage } from "@/lib/i18n";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const initialApplyForm = {
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

export default function BusinessLogin() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [applyForm, setApplyForm] = useState(initialApplyForm);
  const [categories, setCategories] = useState([]);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applied, setApplied] = useState(false);

  const { t } = useLanguage();

  useEffect(() => {
    api.entities.Category.list().then(setCategories).catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.businessLogin(email, password);
      window.location.href = "/partner-dashboard";
    } catch (err) {
      setError(err.message || t("businessLogin.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const updateApply = (field) => (e) => setApplyForm((f) => ({ ...f, [field]: e.target.value }));

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError("");
    if (!applyForm.businessName || !applyForm.contactName || !applyForm.email || !applyForm.category || !applyForm.password) {
      setApplyError(t("becomePartner.missingFields"));
      return;
    }
    setApplying(true);
    try {
      await api.entities.Partner.create(applyForm);
      setApplied(true);
    } catch (err) {
      setApplyError(err.message || t("becomePartner.submitError"));
    } finally {
      setApplying(false);
    }
  };

  if (mode === "apply" && applied) {
    return (
      <AuthLayout icon={CheckCircle2} title={t("becomePartner.sentTitle")} subtitle={t("becomePartner.sentDescription")}>
        <Button
          className="w-full h-12 font-medium"
          onClick={() => {
            setEmail(applyForm.email);
            setApplyForm(initialApplyForm);
            setApplied(false);
            setMode("login");
          }}
        >
          {t("businessLogin.submit")}
        </Button>
      </AuthLayout>
    );
  }

  if (mode === "apply") {
    return (
      <AuthLayout icon={Briefcase} title={t("becomePartner.formTitle")} subtitle={t("becomePartner.formSubtitle")}>
        {applyError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {applyError}
          </div>
        )}

        <form onSubmit={handleApply} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">{t("becomePartner.businessName")}</Label>
            <Input
              id="businessName"
              placeholder={t("becomePartner.businessNamePlaceholder")}
              value={applyForm.businessName}
              onChange={updateApply("businessName")}
              disabled={applying}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactName">{t("becomePartner.contactName")}</Label>
            <Input
              id="contactName"
              placeholder={t("becomePartner.contactNamePlaceholder")}
              value={applyForm.contactName}
              onChange={updateApply("contactName")}
              disabled={applying}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applyEmail">{t("becomePartner.email")}</Label>
            <Input
              id="applyEmail"
              type="email"
              placeholder="you@business.com"
              value={applyForm.email}
              onChange={updateApply("email")}
              disabled={applying}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("becomePartner.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 890"
              value={applyForm.phone}
              onChange={updateApply("phone")}
              disabled={applying}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("becomePartner.city")}</Label>
            <Input
              id="city"
              placeholder={t("becomePartner.cityPlaceholder")}
              value={applyForm.city}
              onChange={updateApply("city")}
              disabled={applying}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t("becomePartner.category")}</Label>
            <Select value={applyForm.category} onValueChange={(value) => setApplyForm((f) => ({ ...f, category: value }))} disabled={applying}>
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
          <div className="space-y-2">
            <Label htmlFor="website">{t("becomePartner.website")}</Label>
            <Input
              id="website"
              placeholder="https://yourbusiness.com"
              value={applyForm.website}
              onChange={updateApply("website")}
              disabled={applying}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("becomePartner.message")}</Label>
            <Textarea
              id="message"
              placeholder={t("becomePartner.messagePlaceholder")}
              value={applyForm.message}
              onChange={updateApply("message")}
              disabled={applying}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applyPassword">{t("becomePartner.password")}</Label>
            <Input
              id="applyPassword"
              type="password"
              placeholder={t("becomePartner.passwordPlaceholder")}
              value={applyForm.password}
              onChange={updateApply("password")}
              disabled={applying}
              minLength={6}
              required
            />
            <p className="text-xs text-muted-foreground">{t("becomePartner.passwordHint")}</p>
          </div>

          <Button type="submit" className="w-full h-12 font-medium" disabled={applying}>
            {applying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("becomePartner.submitting")}
              </>
            ) : (
              t("becomePartner.submit")
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("becomePartner.alreadyPartner")}{" "}
          <button type="button" onClick={() => setMode("login")} className="text-primary font-medium hover:underline">
            {t("becomePartner.logIn")}
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Briefcase} title={t("businessLogin.title")} subtitle={t("businessLogin.subtitle")}>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("businessLogin.email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("businessLogin.password")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("businessLogin.submitting")}
            </>
          ) : (
            t("businessLogin.submit")
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t("businessLogin.noAccount")}{" "}
        <button type="button" onClick={() => setMode("apply")} className="text-primary font-medium hover:underline">
          {t("businessLogin.applyHere")}
        </button>
      </p>
    </AuthLayout>
  );
}
