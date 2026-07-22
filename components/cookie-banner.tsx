"use client"

import { useState } from "react"
import { useCookieConsent } from "@/contexts/CookieConsentContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Cookie, Shield, BarChart2, ChevronRight, X } from "lucide-react"

export function CookieBanner() {
  const { preferences, isLoaded, acceptAll, rejectNonEssential, savePreferences } = useCookieConsent()
  const [showPreferences, setShowPreferences] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)

  // Don't render until localStorage is read, and don't render if already decided
  if (!isLoaded || preferences !== null) return null

  const handleSavePreferences = () => {
    savePreferences({ analytics: analyticsEnabled })
    setShowPreferences(false)
  }

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-border rounded-xl shadow-xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                <Cookie className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm mb-1">We use cookies</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We use essential cookies to keep you signed in, and optional analytics cookies to understand how our platform
                  is used so we can improve it. You can manage your preferences at any time.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-5">
              <Button
                size="sm"
                onClick={acceptAll}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Accept all
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={rejectNonEssential}
              >
                Reject non-essential
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground sm:ml-auto"
                onClick={() => setShowPreferences(true)}
              >
                Manage preferences
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences dialog */}
      <CookiePreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
        analyticsEnabled={analyticsEnabled}
        onAnalyticsChange={setAnalyticsEnabled}
        onSave={handleSavePreferences}
      />
    </>
  )
}

interface PreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analyticsEnabled: boolean
  onAnalyticsChange: (v: boolean) => void
  onSave: () => void
}

function CookiePreferencesDialog({ open, onOpenChange, analyticsEnabled, onAnalyticsChange, onSave }: PreferencesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Choose which cookies you allow Nexora to use. You can update these preferences at any time from the footer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Necessary */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/40 border border-border">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-foreground">Necessary</p>
                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                  Always on
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Required for authentication and basic platform functionality. These cannot be disabled.
                Includes: session tokens, login state.
              </p>
            </div>
          </div>

          <Separator />

          {/* Analytics */}
          <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-foreground">Analytics</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analyticsEnabled}
                  onClick={() => onAnalyticsChange(!analyticsEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    analyticsEnabled ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      analyticsEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Helps us understand how visitors use Nexora so we can improve the experience. No personal data is
                sold. Powered by Vercel Analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={onSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            Save preferences
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Separate component for reopening from footer
export function CookiePreferencesButton() {
  const { preferences, savePreferences } = useCookieConsent()
  const [open, setOpen] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(preferences?.analytics ?? true)

  const handleSave = () => {
    savePreferences({ analytics: analyticsEnabled })
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAnalyticsEnabled(preferences?.analytics ?? true)
          setOpen(true)
        }}
        className="hover:text-white transition-colors text-gray-400"
      >
        Cookie Preferences
      </button>

      <CookiePreferencesDialog
        open={open}
        onOpenChange={setOpen}
        analyticsEnabled={analyticsEnabled}
        onAnalyticsChange={setAnalyticsEnabled}
        onSave={handleSave}
      />
    </>
  )
}
