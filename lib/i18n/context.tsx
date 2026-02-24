"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { Language, translations, TranslationKey, LANGUAGES } from "./translations"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  languages: typeof LANGUAGES
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = "hov_language"

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en"
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null
    return saved && saved in translations ? saved : "en"
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    // Update HTML lang attribute
    document.documentElement.lang = lang
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}

// Language selector component
export function LanguageSelector() {
  const { language, setLanguage, languages } = useI18n()

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-8 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
        aria-label="Display language"
      >
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <option key={code} value={code} className="bg-[#0d0d12] text-white">
            {flag} {name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-white/60">
        ▼
      </div>
    </div>
  )
}
