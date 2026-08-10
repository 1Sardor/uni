import React, { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, Save, User, GraduationCap, QrCode, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n";

export default function StudentID() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    university: "",
    student_id_number: "",
    major: "",
    year_of_study: "",
  });
  const [cardFile, setCardFile] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!profile?.verification_token) {
      setQrDataUrl(null);
      return;
    }
    const verifyUrl = `${window.location.origin}/verify/${profile.verification_token}`;
    QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
  }, [profile?.verification_token]);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await api.auth.me();
        setUser(u);
        const profiles = await api.entities.StudentProfile.filter({ created_by_id: u.id });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setForm({
            first_name: profiles[0].first_name || "",
            last_name: profiles[0].last_name || "",
            university: profiles[0].university || "",
            student_id_number: profiles[0].student_id_number || "",
            major: profiles[0].major || "",
            year_of_study: profiles[0].year_of_study || "",
          });
          setCardPreview(profiles[0].student_card_image || null);
        } else {
          setEditing(true);
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleCardChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCardFile(file);
    setCardPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.university || !form.student_id_number) {
      toast({ title: t("dashboard.studentId.fillRequired"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, ...(cardFile ? { student_card_image: cardFile } : {}) };
      if (profile) {
        const updated = await api.entities.StudentProfile.update(profile.id, payload);
        setProfile({ ...profile, ...updated });
      } else {
        const created = await api.entities.StudentProfile.create(payload);
        setProfile(created);
      }
      setCardFile(null);
      setEditing(false);
      toast({ title: t("dashboard.studentId.profileSaved") });
    } catch (e) {
      toast({ title: t("dashboard.studentId.couldNotSave"), variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold text-navy">{t("dashboard.studentId.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("dashboard.studentId.subtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative bg-navy rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-pastel-lavender blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-pastel-blue blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-pastel-mint blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.2em]">UniLink</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">{t("dashboard.studentId.title")}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold ${
                profile?.id_verified ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/50"
              }`}>
                {profile?.id_verified ? <BadgeCheck size={14} /> : <ShieldCheck size={14} />}
                {profile?.id_verified ? t("dashboard.studentId.verified") : t("dashboard.studentId.pending")}
              </div>
            </div>

            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <User size={32} className="text-white/30" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">{profile?.full_name || [form.first_name, form.last_name].filter(Boolean).join(" ") || t("dashboard.studentId.yourName")}</h2>
                <p className="text-white/50 text-sm mt-0.5">{profile?.university || form.university || t("dashboard.studentId.yourUniversity")}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{t("dashboard.studentId.idNumber")}</p>
                <p className="text-sm font-semibold font-mono tracking-wider">{profile?.student_id_number || "—"}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{t("dashboard.studentId.major")}</p>
                <p className="text-sm font-semibold truncate">{profile?.major || "—"}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{t("dashboard.studentId.year")}</p>
                <p className="text-sm font-semibold">{profile?.year_of_study || "—"}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-white/30 text-xs">{user?.phone_number}</p>
              <GraduationCap size={20} className="text-white/20" />
            </div>
          </div>
        </div>
      </motion.div>

      {qrDataUrl && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)] text-center"
        >
          <h3 className="font-heading text-sm font-semibold text-navy flex items-center justify-center gap-2 mb-4">
            <QrCode size={16} />
            {t("dashboard.studentId.verificationQr")}
          </h3>
          <img src={qrDataUrl} alt="Verification QR code" className="mx-auto rounded-2xl border border-border/60" width={180} height={180} />
          <p className="text-xs text-muted-foreground mt-4 max-w-xs mx-auto">{t("dashboard.studentId.verificationQrHint")}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)]"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-sm font-semibold text-navy">{t("dashboard.studentId.profileDetails")}</h3>
          {!editing && profile && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-xs rounded-xl">
              {t("dashboard.studentId.edit")}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.firstName")}</Label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                disabled={!editing}
                className="mt-1 rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.lastName")}</Label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                disabled={!editing}
                className="mt-1 rounded-xl h-11"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.university")}</Label>
            <Input
              value={form.university}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              disabled={!editing}
              className="mt-1 rounded-xl h-11"
              placeholder="e.g. University of Dubai"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.studentIdNumber")}</Label>
            <Input
              value={form.student_id_number}
              onChange={(e) => setForm({ ...form, student_id_number: e.target.value })}
              disabled={!editing}
              className="mt-1 rounded-xl h-11"
              placeholder="e.g. STU-2024-001"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.major")}</Label>
              <Input
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                disabled={!editing}
                className="mt-1 rounded-xl h-11"
                placeholder="e.g. Computer Science"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.yearOfStudy")}</Label>
              <Select value={form.year_of_study} onValueChange={(v) => setForm({ ...form, year_of_study: v })} disabled={!editing}>
                <SelectTrigger className="mt-1 rounded-xl h-11">
                  <SelectValue placeholder={t("dashboard.studentId.selectYear")} />
                </SelectTrigger>
                <SelectContent>
                  {["year1", "year2", "year3", "year4"].map((key) => {
                    const label = t(`dashboard.studentId.years.${key}`);
                    return <SelectItem key={key} value={label}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.studentCard")}</Label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCardChange} />
            <div className="mt-1 flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-pastel-canvas flex-shrink-0 overflow-hidden flex items-center justify-center">
                {cardPreview ? (
                  <img src={cardPreview} alt="Student card" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-navy/30" />
                )}
              </div>
              {editing && (
                <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={14} />
                  {cardPreview ? t("dashboard.studentId.changeCard") : t("dashboard.studentId.uploadCard")}
                </Button>
              )}
            </div>
          </div>

          {editing && (
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-2xl h-12 gap-2">
              {saving ? t("dashboard.studentId.saving") : <><Save size={16} /> {t("dashboard.studentId.saveProfile")}</>}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
