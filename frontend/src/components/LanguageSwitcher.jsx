import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const LANGUAGE_META = {
  en: { flag: "🇬🇧", short: "EN" },
  ru: { flag: "🇷🇺", short: "RU" },
  uz: { flag: "🇺🇿", short: "UZ" },
};

export default function LanguageSwitcher({ dark = false }) {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const { language, setLanguage, languages } = useLanguage();

  useEffect(() => {
    function handleClick(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    }
    if (langOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langOpen]);

  const textColor = dark ? "text-white" : "text-navy";
  const hoverColor = dark ? "text-white/80" : "text-navy/60";

  return (
    <div className="relative" ref={langRef}>
      <button
        onClick={() => setLangOpen(!langOpen)}
        className={`flex items-center gap-1 text-sm font-medium ${hoverColor} hover:${textColor} transition-colors`}
      >
        <span>{LANGUAGE_META[language]?.flag}</span>
        {LANGUAGE_META[language]?.short ?? language}
        <ChevronDown size={14} />
      </button>
      {langOpen && (
        <div className="absolute right-0 mt-2 w-24 rounded-xl border border-border bg-white shadow-lg overflow-hidden z-10">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => { setLanguage(lang); setLangOpen(false); }}
              className="w-full flex items-center gap-1.5 px-3 py-2.5 text-sm text-navy hover:bg-pastel-canvas text-left"
            >
              <span>{LANGUAGE_META[lang]?.flag}</span>
              <span className="flex-1">{LANGUAGE_META[lang]?.short ?? lang}</span>
              {lang === language && <Check size={14} className="text-navy" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
