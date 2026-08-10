import React, { useRef, useState } from "react";
import { api } from "@/api/apiClient";
import { UploadCloud, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n";

export default function CompleteProfileModal({ open, onOpenChange, profile, onSaved }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    major: profile?.major || "",
    year_of_study: profile?.year_of_study || "",
    student_id_number: profile?.student_id_number || "",
  });
  const [cardFile, setCardFile] = useState(null);
  const [cardPreview, setCardPreview] = useState(profile?.student_card_image || null);

  const handleCardChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCardFile(file);
    setCardPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.major || !form.year_of_study || !form.student_id_number || (!cardFile && !profile?.student_card_image)) {
      toast({ title: t("dashboard.completeProfile.fillRequired"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, ...(cardFile ? { student_card_image: cardFile } : {}) };
      const saved = profile
        ? await api.entities.StudentProfile.update(profile.id, payload)
        : await api.entities.StudentProfile.create(payload);
      toast({ title: t("dashboard.completeProfile.saved") });
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e) {
      toast({ title: t("dashboard.completeProfile.couldNotSave"), variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.completeProfile.title")}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{t("dashboard.completeProfile.subtitle")}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.firstName")}</Label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="mt-1 rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.lastName")}</Label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="mt-1 rounded-xl h-11"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.major")}</Label>
            <Input
              value={form.major}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
              className="mt-1 rounded-xl h-11"
              placeholder="e.g. Computer Science"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.yearOfStudy")}</Label>
            <Select value={form.year_of_study} onValueChange={(v) => setForm({ ...form, year_of_study: v })}>
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

          <div>
            <Label className="text-xs font-medium text-muted-foreground">{t("dashboard.studentId.studentIdNumber")}</Label>
            <Input
              value={form.student_id_number}
              onChange={(e) => setForm({ ...form, student_id_number: e.target.value })}
              className="mt-1 rounded-xl h-11"
              placeholder="e.g. STU-2024-001"
            />
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
              <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud size={14} />
                {cardPreview ? t("dashboard.studentId.changeCard") : t("dashboard.studentId.uploadCard")}
              </Button>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full rounded-2xl h-12">
            {saving ? t("dashboard.completeProfile.submitting") : t("dashboard.completeProfile.submit")}
          </Button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full text-center text-xs text-muted-foreground hover:text-navy transition-colors"
          >
            {t("dashboard.completeProfile.skip")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
