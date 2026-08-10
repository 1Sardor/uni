import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Save, Camera, Loader2 } from "lucide-react";
import { api } from "@/api/apiClient";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function PartnerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    api.entities.Partner.me()
      .then(setForm)
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    try {
      const { image_url } = await api.entities.Partner.uploadImage(file);
      setForm((f) => ({ ...f, place_image_url: image_url }));
      toast({ title: t("partnerDashboard.imageUpdated") });
    } catch (err) {
      toast({ title: t("partnerDashboard.imageUploadError"), variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.entities.Partner.updateMe(form);
      setForm(updated);
      setEditing(false);
      toast({ title: t("partnerDashboard.profileUpdated") });
    } catch (err) {
      toast({ title: t("partnerDashboard.couldNotUpdate"), variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-navy">{t("partnerDashboard.nav.profile")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("partnerDashboard.applicationDetails")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)]"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-sm font-semibold text-navy flex items-center gap-2">
            <Building2 size={16} />
            {t("partnerDashboard.applicationDetails")}
          </h3>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-xs rounded-xl">
              {t("partnerDashboard.edit")}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-pastel-canvas flex-shrink-0 overflow-hidden flex items-center justify-center">
              {form.place_image_url ? (
                <img src={form.place_image_url} alt={form.business_name} className="w-full h-full object-cover" />
              ) : (
                <Building2 size={24} className="text-navy/30" />
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 size={18} className="text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                <Camera size={14} />
                {t("partnerDashboard.uploadImage")}
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">{t("partnerDashboard.uploadImageHint")}</p>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("partnerDashboard.businessName")}</Label>
            <Input value={form.business_name} onChange={update("business_name")} disabled={!editing} className="mt-1 rounded-xl h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("partnerDashboard.contactName")}</Label>
              <Input value={form.contact_name} onChange={update("contact_name")} disabled={!editing} className="mt-1 rounded-xl h-11" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("partnerDashboard.phone")}</Label>
              <Input value={form.phone} onChange={update("phone")} disabled={!editing} className="mt-1 rounded-xl h-11" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("partnerDashboard.email")}</Label>
            <Input value={form.email} disabled className="mt-1 rounded-xl h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("partnerDashboard.city")}</Label>
              <Input value={form.city} onChange={update("city")} disabled={!editing} className="mt-1 rounded-xl h-11" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("partnerDashboard.category")}</Label>
              <Input value={form.category} disabled className="mt-1 rounded-xl h-11" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("partnerDashboard.website")}</Label>
            <Input value={form.website} onChange={update("website")} disabled={!editing} className="mt-1 rounded-xl h-11" />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("partnerDashboard.message")}</Label>
            <Textarea value={form.message} onChange={update("message")} disabled={!editing} className="mt-1 rounded-xl resize-none" rows={3} />
          </div>

          {editing && (
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-2xl h-12 gap-2">
              {saving ? t("partnerDashboard.saving") : <><Save size={16} /> {t("partnerDashboard.saveChanges")}</>}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
