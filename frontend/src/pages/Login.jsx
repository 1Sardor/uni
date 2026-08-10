import React, { useEffect, useRef, useState } from "react";
import { api } from "@/api/apiClient";
import { KeyRound, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
const BOT_URL = BOT_USERNAME ? `https://t.me/${BOT_USERNAME}` : null;
const CODE_LENGTH = 6;

export default function Login() {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const submit = async (code) => {
    setError("");
    setLoading(true);
    try {
      await api.auth.loginWithTelegram(code);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Invalid or expired code");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (char && index === CODE_LENGTH - 1 && next.every(Boolean)) {
      submit(next.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
    if (pasted.length === CODE_LENGTH) submit(pasted);
  };

  return (
    <AuthLayout
      icon={KeyRound}
      title="Enter the code"
      subtitle={
        BOT_URL ? (
          <>
            Log in to the{" "}
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              @{BOT_USERNAME}
            </a>{" "}
            Telegram bot and get your login code.
          </>
        ) : (
          "Log in to our Telegram bot and get your login code."
        )
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={loading}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
        </div>
      )}

      {BOT_URL && (
        <a
          href={BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full mt-6 text-sm text-primary hover:underline text-center"
        >
          Open the Telegram bot
        </a>
      )}
    </AuthLayout>
  );
}
