import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, GraduationCap } from "lucide-react";
import { api } from "@/api/apiClient";
import { useLanguage } from "@/lib/i18n";

export default function VerifyStudent() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    api.entities.StudentProfile.verify(token)
      .then((data) => setResult(data))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-pastel-canvas px-4 py-12">
        <div className="w-7 h-7 border-3 border-pastel-lavender border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-pastel-canvas px-4 py-12">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-[0_4px_24px_rgba(26,31,46,0.06)] p-8 text-center">
        {result?.valid ? (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="font-display text-xl font-bold text-navy">{t("verify.validTitle")}</h1>
            <div className="mt-6 text-left space-y-3 bg-pastel-canvas rounded-2xl p-4">
              <div className="flex items-center gap-2 text-navy">
                <GraduationCap size={16} className="text-navy/50 flex-shrink-0" />
                <span className="font-semibold text-sm">{result.student_name}</span>
              </div>
              {result.university && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("verify.university")}</p>
                  <p className="text-sm text-navy">{result.university}</p>
                </div>
              )}
              {result.major && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("verify.major")}</p>
                  <p className="text-sm text-navy">{result.major}</p>
                </div>
              )}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${result.id_verified ? "bg-emerald-100 text-emerald-700" : "bg-pastel-sand text-navy/60"}`}>
                {result.id_verified ? t("verify.idVerified") : t("verify.idPending")}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <XCircle size={28} />
            </div>
            <h1 className="font-display text-xl font-bold text-navy">{t("verify.invalidTitle")}</h1>
            <p className="text-sm text-muted-foreground mt-2">{t("verify.invalidDesc")}</p>
          </>
        )}
      </div>
    </div>
  );
}
