"use client"

import { Analytics } from "@vercel/analytics/react"
import { useCookieConsent } from "@/contexts/CookieConsentContext"

export function ConditionalAnalytics() {
  const { preferences, isLoaded } = useCookieConsent()

  // Wait until consent state is loaded from localStorage
  if (!isLoaded) return null

  // Only render Analytics if analytics consent has been explicitly given
  if (!preferences?.analytics) return null

  return <Analytics />
}
