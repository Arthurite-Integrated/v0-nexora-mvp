"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Stethoscope, MapPin, FileText, Clock, DollarSign,
  Languages, Plus, X, CheckCircle, Loader2, ChevronRight, ChevronLeft,
} from "lucide-react"
import { LocationPicker, locationToString, type LocationValue } from "@/components/location-picker"
import { toast } from "sonner"

const EMPTY_LOCATION: LocationValue = { country: "", countryName: "", state: "", stateName: "", city: "" }

type OnboardingStep = "specialization" | "credentials" | "availability" | "fees" | "review"

const STEPS: { key: OnboardingStep; label: string; icon: React.ReactNode }[] = [
  { key: "specialization", label: "Specialization", icon: <Stethoscope className="w-4 h-4" /> },
  { key: "credentials", label: "Credentials", icon: <FileText className="w-4 h-4" /> },
  { key: "availability", label: "Availability", icon: <Clock className="w-4 h-4" /> },
  { key: "fees", label: "Fees & Languages", icon: <DollarSign className="w-4 h-4" /> },
  { key: "review", label: "Review", icon: <CheckCircle className="w-4 h-4" /> },
]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const SPECIALIZATIONS = [
  // Therapy & Behaviour
  "Applied Behavior Analysis (ABA)",
  "Behavioral Therapy",
  "Occupational Therapy",
  "Physical Therapy",
  "Speech-Language Pathology",
  // Medical & Developmental
  "Developmental Pediatrics",
  "Developmental Dentistry",
  "Pediatric Dentistry",
  "Pediatric Neurology",
  "Child & Adolescent Psychiatry",
  "Psychiatry",
  "Psychology",
  "Genetics & Metabolic Disorders",
  "Community Medicine",
  // Education & Social
  "Special Education",
  "Social Work",
  "Rehabilitation Medicine",
  "Nutrition & Dietetics",
  "Nursing (IDD Care)",
]

const LANGUAGES = ["English", "Yoruba", "Hausa", "Igbo", "French", "Arabic", "Pidgin"]

interface AvailabilitySlot {
  day: string
  startTime: string
  endTime: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()
  const [step, setStep] = useState<OnboardingStep>("specialization")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION)

  const [profile, setProfile] = useState({
    specialization: "",
    otherSpecialization: "",
    isOtherSpecialization: false,
    bio: "",
    experience: "",
    credentials: [] as string[],
    credentialInput: "",
    availability: [] as AvailabilitySlot[],
    consultationFee: "",
    languages: [] as string[],
    languageInput: "",
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "professional")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addCredential = () => {
    const val = profile.credentialInput.trim()
    if (val && !profile.credentials.includes(val)) {
      setProfile(p => ({ ...p, credentials: [...p.credentials, val], credentialInput: "" }))
    }
  }

  const removeCredential = (c: string) =>
    setProfile(p => ({ ...p, credentials: p.credentials.filter(x => x !== c) }))

  const toggleDay = (day: string) => {
    const exists = profile.availability.find(a => a.day === day)
    if (exists) {
      setProfile(p => ({ ...p, availability: p.availability.filter(a => a.day !== day) }))
    } else {
      setProfile(p => ({ ...p, availability: [...p.availability, { day, startTime: "09:00", endTime: "17:00" }] }))
    }
  }

  const updateSlot = (day: string, field: "startTime" | "endTime", value: string) =>
    setProfile(p => ({
      ...p,
      availability: p.availability.map(a => a.day === day ? { ...a, [field]: value } : a),
    }))

  const toggleLanguage = (lang: string) =>
    setProfile(p => ({
      ...p,
      languages: p.languages.includes(lang)
        ? p.languages.filter(l => l !== lang)
        : [...p.languages, lang],
    }))

  const stepIndex = STEPS.findIndex(s => s.key === step)
  const goNext = () => setStep(STEPS[stepIndex + 1].key)
  const goBack = () => setStep(STEPS[stepIndex - 1].key)

  const canProceed = () => {
    if (step === "specialization") {
      const hasSpec = profile.isOtherSpecialization ? profile.otherSpecialization.trim().length > 0 : !!profile.specialization
      return hasSpec && profile.bio.length >= 20 && location.state && profile.experience
    }
    if (step === "credentials") return profile.credentials.length > 0
    if (step === "availability") return profile.availability.length > 0
    if (step === "fees") return profile.consultationFee && profile.languages.length > 0
    return true
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialization: profile.otherSpecialization || profile.specialization,
          bio: profile.bio,
          location: locationToString(location),
          experience: parseInt(profile.experience) || 0,
          credentials: profile.credentials,
          availability: profile.availability,
          consultationFee: parseFloat(profile.consultationFee) || 0,
          languages: profile.languages,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error || "Failed to save profile. Please try again."
        
        toast.error(msg)
        return
      }
      toast.success("Profile submitted for verification!")
      await refreshUser()
      router.push("/dashboard")
    } catch {
      const msg = "Something went wrong. Please try again."
      
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/images/nexora-logo.png" alt="Nexora" width={160} height={64} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Professional Setup</h1>
          <p className="text-slate-600 mt-1">Complete your profile so caregivers can find and book you</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`flex flex-col items-center gap-1 ${i <= stepIndex ? "text-primary" : "text-slate-400"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  i < stepIndex ? "bg-primary border-primary text-white"
                    : i === stepIndex ? "border-primary bg-white text-primary"
                    : "border-slate-200 bg-white"
                }`}>
                  {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : s.icon}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < stepIndex ? "bg-primary" : "bg-slate-200"}`} style={{ width: 24 }} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-8">

            {/* ── Specialization ──────────────────────────────────────── */}
            {step === "specialization" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">Your Specialization</h2>
                  <p className="text-slate-500 text-sm">Tell caregivers what you do and where you're based</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">Area of Specialization</Label>
                  <select
                    value={profile.isOtherSpecialization ? "__other__" : profile.specialization}
                    onChange={e => {
                      if (e.target.value === "__other__") {
                        setProfile(p => ({ ...p, specialization: "", otherSpecialization: "", isOtherSpecialization: true }))
                      } else {
                        setProfile(p => ({ ...p, specialization: e.target.value, otherSpecialization: "", isOtherSpecialization: false }))
                      }
                    }}
                    className="w-full border border-input bg-background rounded-md px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select your specialization</option>
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                    <option value="__other__">Other — not listed</option>
                  </select>

                  {profile.isOtherSpecialization && (
                    <Input
                      placeholder="Type your specialization"
                      value={profile.otherSpecialization}
                      onChange={e => setProfile(p => ({ ...p, otherSpecialization: e.target.value }))}
                      className="focus:border-primary"
                      autoFocus
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-700">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Describe your experience, approach to care, and what makes you a great fit for families with IDD needs..."
                    value={profile.bio}
                    onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                    className="border-slate-200 focus:border-primary min-h-[120px]"
                  />
                  <p className={`text-xs text-right ${profile.bio.length < 20 ? "text-slate-400" : "text-primary"}`}>
                    {profile.bio.length} chars {profile.bio.length < 20 && "(min 20)"}
                  </p>
                </div>

                <LocationPicker value={location} onChange={setLocation} required />

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="experience">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />Years Experience
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      placeholder="e.g. 5"
                      value={profile.experience}
                      onChange={(e) => setProfile(p => ({ ...p, experience: e.target.value }))}
                      className="border-slate-200 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Credentials ─────────────────────────────────────────── */}
            {step === "credentials" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">Credentials & Qualifications</h2>
                  <p className="text-slate-500 text-sm">Add your degrees, licences, and certifications</p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. M.A. Speech-Language Pathology, BCBA, Licensed Psychologist"
                      value={profile.credentialInput}
                      onChange={(e) => setProfile(p => ({ ...p, credentialInput: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCredential() } }}
                      className="border-slate-200 focus:border-primary"
                    />
                    <Button type="button" onClick={addCredential} variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">Press Enter or click + to add each credential</p>

                  {profile.credentials.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {profile.credentials.map((c) => (
                        <Badge key={c} variant="secondary" className="flex items-center gap-1 pr-1 py-1 text-sm">
                          <FileText className="w-3 h-3" />
                          {c}
                          <button type="button" onClick={() => removeCredential(c)}
                            className="ml-1 hover:text-red-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {profile.credentials.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm">
                      No credentials added yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Availability ────────────────────────────────────────── */}
            {step === "availability" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">Weekly Availability</h2>
                  <p className="text-slate-500 text-sm">Select the days you're available and set your hours</p>
                </div>

                <div className="space-y-2">
                  {DAYS.map((day) => {
                    const slot = profile.availability.find(a => a.day === day)
                    const active = !!slot
                    return (
                      <div
                        key={day}
                        className={`rounded-lg border transition-colors ${active ? "border-primary/30 bg-primary/5" : "border-border"}`}
                      >
                        {/* Row 1 — checkbox + day name (always visible) */}
                        <button
                          type="button"
                          onClick={() => toggleDay(day)}
                          className="w-full flex items-center gap-3 px-3 py-3 text-left"
                        >
                          <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            active ? "bg-primary border-primary" : "border-muted-foreground/40"
                          }`}>
                            {active && <CheckCircle className="w-3 h-3 text-white" />}
                          </span>
                          <span className={`font-medium text-sm flex-1 ${active ? "text-primary" : "text-foreground"}`}>
                            {day}
                          </span>
                          {active && (
                            <span className="text-xs text-muted-foreground">
                              {slot.startTime} – {slot.endTime}
                            </span>
                          )}
                        </button>

                        {/* Row 2 — time pickers, only when active */}
                        {active && (
                          <div className="flex items-center gap-2 px-3 pb-3">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateSlot(day, "startTime", e.target.value)}
                              onClick={e => e.stopPropagation()}
                              className="flex-1 min-w-0 border border-input bg-background rounded-md px-2 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <span className="text-muted-foreground text-xs shrink-0">to</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateSlot(day, "endTime", e.target.value)}
                              onClick={e => e.stopPropagation()}
                              className="flex-1 min-w-0 border border-input bg-background rounded-md px-2 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Fees & Languages ────────────────────────────────────── */}
            {step === "fees" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">Fees & Languages</h2>
                  <p className="text-slate-500 text-sm">Set your consultation rate and the languages you speak</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee" className="text-slate-700">
                    Consultation Fee (₦) <span className="text-muted-foreground font-normal">— per session</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 text-sm">₦</span>
                    <Input
                      id="fee"
                      type="number"
                      min="0"
                      placeholder="e.g. 20000"
                      value={profile.consultationFee}
                      onChange={(e) => setProfile(p => ({ ...p, consultationFee: e.target.value }))}
                      className="pl-8 border-slate-200 focus:border-primary"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Standard session is <strong>60 minutes</strong>. You can note shorter session options in your bio.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-700">
                    <Languages className="w-3.5 h-3.5 inline mr-1" />Languages Spoken
                  </Label>

                  {/* Preset language chips */}
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          profile.languages.includes(lang)
                            ? "bg-primary border-primary text-white"
                            : "border-slate-200 text-slate-600 hover:border-primary/30"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  {/* Custom languages added by the user */}
                  {profile.languages.filter(l => !LANGUAGES.includes(l)).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.languages
                        .filter(l => !LANGUAGES.includes(l))
                        .map(lang => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-primary border border-primary text-white"
                          >
                            {lang}
                            <button
                              type="button"
                              onClick={() => setProfile(p => ({ ...p, languages: p.languages.filter(l => l !== lang) }))}
                              className="ml-0.5 hover:opacity-70"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Add custom language */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add another language…"
                      value={profile.languageInput}
                      onChange={e => setProfile(p => ({ ...p, languageInput: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          const val = profile.languageInput.trim()
                          if (val && !profile.languages.includes(val)) {
                            setProfile(p => ({ ...p, languages: [...p.languages, val], languageInput: "" }))
                          }
                        }
                      }}
                      className="flex-1 border-slate-200 focus:border-primary"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const val = profile.languageInput.trim()
                        if (val && !profile.languages.includes(val)) {
                          setProfile(p => ({ ...p, languages: [...p.languages, val], languageInput: "" }))
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Press Enter or tap + to add</p>
                </div>
              </div>
            )}

            {/* ── Review ──────────────────────────────────────────────── */}
            {step === "review" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">Review Your Profile</h2>
                  <p className="text-slate-500 text-sm">Check everything looks right before submitting</p>
                </div>

                <div className="space-y-4">
                  <ReviewRow label="Specialization" value={profile.otherSpecialization || profile.specialization} />
                  <ReviewRow label="Location" value={locationToString(location)} />
                  <ReviewRow label="Experience" value={`${profile.experience} years`} />
                  <ReviewRow label="Bio" value={profile.bio} multiline />
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Credentials</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                      {profile.credentials.map(c => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Availability</span>
                    <div className="text-right">
                      {profile.availability.map(a => (
                        <div key={a.day} className="text-sm text-slate-700">
                          {a.day}: {a.startTime} – {a.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                  <ReviewRow label="Consultation Fee" value={`₦${parseInt(profile.consultationFee).toLocaleString()} / 60 min session`} />
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Languages</span>
                    <span className="text-sm text-slate-700">{profile.languages.join(", ")}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  Your profile will be submitted for verification. You can update it anytime from Settings.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {stepIndex > 0 && (
                <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-1" />Back
                </Button>
              )}
              {step !== "review" ? (
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="flex-1 bg-primary hover:bg-primary text-white"
                >
                  Continue<ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary text-white"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                    : "Submit Profile"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ReviewRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={`flex py-3 border-b border-slate-100 ${multiline ? "flex-col gap-1" : "justify-between"}`}>
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className={`text-sm text-slate-700 ${multiline ? "" : "text-right max-w-xs"}`}>{value || "—"}</span>
    </div>
  )
}
