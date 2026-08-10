import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { motion } from "framer-motion";
import { ScanLine, CheckCircle2, XCircle, Tag, Camera } from "lucide-react";
import { api } from "@/api/apiClient";
import { useLanguage } from "@/lib/i18n";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function extractToken(text) {
  try {
    const url = new URL(text);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || text;
  } catch {
    return text.trim();
  }
}

export default function PartnerScan() {
  const { t } = useLanguage();
  const [partner, setPartner] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [result, setResult] = useState(null);
  const [claiming, setClaiming] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    api.entities.Partner.me()
      .then((p) => {
        setPartner(p);
        if (p.place) {
          return api.entities.Discount.filter({ restaurant_id: p.place, is_active: true }).then((list) => {
            setDiscounts(list);
            if (list.length > 0) setSelectedId(String(list[0].id));
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const stopCamera = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => () => stopCamera(), []);

  const tick = () => {
    const video = videoRef.current;
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      frameRef.current = requestAnimationFrame(tick);
      return;
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data && !busyRef.current) {
      handleDetected(code.data);
      return;
    }
    frameRef.current = requestAnimationFrame(tick);
  };

  const startCamera = async () => {
    setCameraError("");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      frameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setCameraError(t("partnerDashboard.scan.cameraError"));
    }
  };

  const handleDetected = async (rawText) => {
    busyRef.current = true;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const token = extractToken(rawText);
    setClaiming(true);
    try {
      const res = await api.entities.Discount.claim(selectedId, token);
      setResult({ ok: true, message: res.message, student_name: res.student_name });
    } catch (err) {
      setResult({ ok: false, message: err.message || t("partnerDashboard.scan.claimError") });
    } finally {
      setClaiming(false);
      busyRef.current = false;
      stopCamera();
    }
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
          <h1 className="font-display text-2xl font-bold text-navy">{t("partnerDashboard.nav.scan")}</h1>
        </motion.div>
        <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_12px_rgba(26,31,46,0.03)]">
          <div className="w-16 h-16 bg-pastel-lavender/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <ScanLine size={24} className="text-navy/40" />
          </div>
          <p className="text-sm text-muted-foreground">{t("partnerDashboard.discounts.noPlaceDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-navy">{t("partnerDashboard.nav.scan")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("partnerDashboard.scan.subtitle")}</p>
      </motion.div>

      {discounts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_12px_rgba(26,31,46,0.03)]">
          <div className="w-16 h-16 bg-pastel-lavender/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag size={24} className="text-navy/40" />
          </div>
          <p className="text-sm text-muted-foreground">{t("partnerDashboard.scan.noActiveDiscounts")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(26,31,46,0.03)] space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">{t("partnerDashboard.scan.selectDiscount")}</label>
            <Select value={selectedId} onValueChange={setSelectedId} disabled={scanning || claiming}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {discounts.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.title} ({d.discount_percent}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-navy/95 aspect-square max-w-sm mx-auto flex items-center justify-center">
            {scanning ? (
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/50 p-6 text-center">
                <Camera size={32} />
                <p className="text-xs">{t("partnerDashboard.scan.cameraIdle")}</p>
              </div>
            )}
            {scanning && (
              <div className="absolute inset-6 border-2 border-white/70 rounded-2xl pointer-events-none" />
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{cameraError}</div>
          )}

          {result && (
            <div
              className={`p-4 rounded-2xl text-sm text-center flex flex-col items-center gap-2 ${
                result.ok ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"
              }`}
            >
              {result.ok ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
              <div>
                {result.ok && result.student_name && (
                  <p className="font-semibold">{result.student_name}</p>
                )}
                <p>{result.message}</p>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            {!scanning ? (
              <Button onClick={startCamera} disabled={claiming} className="rounded-2xl gap-2 h-11 px-6">
                <ScanLine size={16} />
                {result ? t("partnerDashboard.scan.scanNext") : t("partnerDashboard.scan.startScanning")}
              </Button>
            ) : (
              <Button variant="outline" onClick={stopCamera} className="rounded-2xl gap-2 h-11 px-6">
                {t("partnerDashboard.scan.stopScanning")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
