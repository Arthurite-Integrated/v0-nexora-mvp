"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

export interface CookiePreferences {
  necessary: true  // always on
  analytics: boolean
}

interface CookieConsentContextType {
  preferences: CookiePreferences | null  // null = not yet decided
  isLoaded: boolean
  acceptAll: () => void
  rejectNonEssential: () => void
  savePreferences: (prefs: Omit<CookiePreferences, "necessary">) => void
  resetConsent: () => void
}

const STORAGE_KEY = "nexora_cookie_consent"

const CookieConsentContext = createContext<CookieConsentContextType>({
  preferences: null,
  isLoaded: false,
  acceptAll: () => {},
  rejectNonEssential: () => {},
  savePreferences: () => {},
  resetConsent: () => {},
})

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPreferences(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
    setIsLoaded(true)
  }, [])

  const persist = useCallback((prefs: CookiePreferences) => {
    setPreferences(prefs)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // ignore
    }
  }, [])

  const acceptAll = useCallback(() => {
    persist({ necessary: true, analytics: true })
  }, [persist])

  const rejectNonEssential = useCallback(() => {
    persist({ necessary: true, analytics: false })
  }, [persist])

  const savePreferences = useCallback((prefs: Omit<CookiePreferences, "necessary">) => {
    persist({ necessary: true, ...prefs })
  }, [persist])

  const resetConsent = useCallback(() => {
    setPreferences(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return (
    <CookieConsentContext.Provider value={{ preferences, isLoaded, acceptAll, rejectNonEssential, savePreferences, resetConsent }}>
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  return useContext(CookieConsentContext)
}
