import React, { createContext, useContext, useState, useCallback } from "react";
import en from "@/locales/en";
import ru from "@/locales/ru";
import uz from "@/locales/uz";

const dictionaries = { en, ru, uz };
const LANG_KEY = "studentpass_lang";

const LanguageContext = createContext(null);

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem(LANG_KEY);
    return stored && dictionaries[stored] ? stored : "uz";
  });

  const setLanguage = useCallback((lang) => {
    if (!dictionaries[lang]) return;
    localStorage.setItem(LANG_KEY, lang);
    setLanguageState(lang);
  }, []);

  const t = useCallback((key, vars) => {
    const value = getPath(dictionaries[language], key) ?? getPath(dictionaries.en, key) ?? key;
    if (!vars) return value;
    return Object.entries(vars).reduce((str, [k, v]) => str.replaceAll(`{${k}}`, v), value);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: Object.keys(dictionaries) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
