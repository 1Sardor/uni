import React, { createContext, useContext, useRef } from "react";
import { cn } from "@/lib/utils";

const OtpContext = createContext();

export function InputOTP({ maxLength = 6, value, onChange, autoFocus, autoComplete, className, children }) {
  const refs = useRef([]);

  const setDigit = (index, digit) => {
    const chars = value.split("");
    chars[index] = digit;
    const next = chars.join("").slice(0, maxLength);
    onChange(next);
    if (digit && index < maxLength - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <OtpContext.Provider value={{ value, maxLength, setDigit, handleKeyDown, refs, autoFocus, autoComplete }}>
      <div className={cn("flex gap-2", className)}>{children}</div>
    </OtpContext.Provider>
  );
}

export function InputOTPGroup({ children, className }) {
  return <div className={cn("flex gap-2", className)}>{children}</div>;
}

export function InputOTPSlot({ index }) {
  const { value, setDigit, handleKeyDown, refs, autoFocus, autoComplete } = useContext(OtpContext);
  return (
    <input
      ref={(el) => (refs.current[index] = el)}
      autoFocus={autoFocus && index === 0}
      autoComplete={autoComplete}
      value={value[index] || ""}
      onChange={(e) => setDigit(index, e.target.value.replace(/\D/g, "").slice(-1))}
      onKeyDown={(e) => handleKeyDown(index, e)}
      maxLength={1}
      inputMode="numeric"
      className="w-11 h-12 text-center text-lg font-semibold rounded-xl border border-input bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}
