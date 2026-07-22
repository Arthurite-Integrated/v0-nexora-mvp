"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/image-upload"
import { LocationPicker, locationToString, stringToLocation, type LocationValue } from "@/components/location-picker"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { BackButton } from "@/components/back-button"
import { Loader2, Trash2, Plus, X } from "lucide-react"
import { toast } from "sonner"

const EMPTY_LOCATION: LocationValue = { country: "", countryName: "", state: "", stateName: "", city: "" }

const LANGUAGES = ["English", "Yoruba", "Hausa", "Igbo", "French", "Arabic", "Pidgin"]

interface ProfessionalProfile {
  _id?: string
  specialization: string
  bio: string
  credentials: string[]
  consultationFee: number
  languages: string[]
  availability: { day: string; startTime: string; endTime: string }[]
}

export default function SettingsPage() {
  const { user, loading, deleteAccount } = useAuth()
  const router = useRouter()

  // ── Account fields ────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ name: "", phone: "" })
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION)
  const [profileImage, setProfileImage] = useState("")
  const [initialized, setInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // ── Professional profile fields ───────────────────────────────────────────
  const [proProfile, setProProfile] = useState<ProfessionalProfile>({
    specialization: "", bio: "", credentials: [], consultationFee: 0, languages: [], availability: [],
  })
  const [credentialInput, setCredentialInput] = useState("")
  const [languageInput, setLanguageInput] = useState("")
  const [proLoading, setProLoading] = useState(false)
  const [proInitialized, setProInitialized] = useState(false)
  const [isSavingPro, setIsSavingPro] = useState(false)
  const [hasProfessionalProfile, setHasProfessionalProfile] = useState(false)

  // ── Danger zone ───────────────────────────────────────────────────────────
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  // Seed account fields
  useEffect(() => {
    if (user && !initialized) {
      setFormData({ name: user.name || "", phone: user.phone || "" })
      if (user.locationData?.country) {
        setLocation(user.locationData as LocationValue)
      } else if (user.location) {
        setLocation(stringToLocation(user.location))
      }
      setProfileImage(user.profileImage || "")
      setInitialized(true)
    }
  }, [user, initialized])

  // Fetch professional profile
  useEffect(() => {
    if (user?.role === "professional" && !proInitialized) {
      setProLoading(true)
      fetch("/api/professionals/mine")
        .then(r => r.json())
        .then(d => {
          if (d.professional) {
            setProProfile({
              _id: d.professional._id,
              specialization: d.professional.specialization || "",
              bio: d.professional.bio || "",
              credentials: d.professional.credentials || [],
              consultationFee: d.professional.consultationFee || 0,
              languages: d.professional.languages || [],
              availability: d.professional.availability || [],
            })
            setHasProfessionalProfile(true)
          }
          setProInitialized(true)
        })
        .catch(() => setProInitialized(true))
        .finally(() => setProLoading(false))
    }
  }, [user, proInitialized])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const locString = locationToString(location)
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || undefined,
          location: locString || undefined,
          locationData: location.country ? location : undefined,
          profileImage: profileImage || undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || `Save failed (${res.status})`)
      if (d.user) {
        setFormData({ name: d.user.name || "", phone: d.user.phone || "" })
        if (d.user.locationData?.country) setLocation(d.user.locationData)
        setProfileImage(d.user.profileImage || "")
      }
      toast.success("Account saved")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasProfessionalProfile) {
      toast.error("No professional profile to update. Please complete onboarding first.")
      router.push("/onboarding")
      return
    }
    setIsSavingPro(true)
    try {
      const res = await fetch("/api/professionals/mine", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialization: proProfile.specialization,
          bio: proProfile.bio,
          credentials: proProfile.credentials,
          consultationFee: proProfile.consultationFee,
          languages: proProfile.languages,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed to save")
      toast.success("Professional profile saved")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSavingPro(false)
    }
  }

  const addCredential = () => {
    const val = credentialInput.trim()
    if (val && !proProfile.credentials.includes(val)) {
      setProProfile(p => ({ ...p, credentials: [...p.credentials, val] }))
      setCredentialInput("")
    }
  }

  const removeCredential = (c: string) =>
    setProProfile(p => ({ ...p, credentials: p.credentials.filter(x => x !== c) }))

  const toggleLanguage = (lang: string) =>
    setProProfile(p => ({
      ...p,
      languages: p.languages.includes(lang)
        ? p.languages.filter(l => l !== lang)
        : [...p.languages, lang],
    }))

  const addLanguage = () => {
    const val = languageInput.trim()
    if (val && !proProfile.languages.includes(val)) {
      setProProfile(p => ({ ...p, languages: [...p.languages, val] }))
      setLanguageInput("")
    }
  }

  const removeCustomLanguage = (lang: string) =>
    setProProfile(p => ({ ...p, languages: p.languages.filter(l => l !== lang) }))

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account")
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const showSkeleton = loading || !initialized
  const isProfessional = user?.role === "professional"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <BackButton fallback="/dashboard" label="Dashboard" className="mb-2" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Settings</h1>
            <p className="text-muted-foreground">Manage your account and profile information</p>
          </div>

          <Tabs defaultValue="account">
            <TabsList className={`grid w-full ${isProfessional ? "grid-cols-2" : "grid-cols-1"}`}>
              <TabsTrigger value="account">Account</TabsTrigger>
              {isProfessional && <TabsTrigger value="professional">Professional Profile</TabsTrigger>}
            </TabsList>

            {/* ── Account tab ──────────────────────────────────────── */}
            <TabsContent value="account" className="space-y-6 mt-6">
              <Card>
                <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
                <CardContent>
                  {showSkeleton ? (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                        <Skeleton className="w-24 h-24 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-36" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-9 w-full rounded-md" />
                          </div>
                        ))}
                      </div>
                      <Skeleton className="h-9 w-28 rounded-md" />
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAccount} className="space-y-6">
                      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                        <ImageUpload value={profileImage} onChange={setProfileImage} folder="profiles" size={96} label="Change photo" />
                        <div className="flex-1 space-y-1 text-center sm:text-left pt-1">
                          <p className="font-semibold text-foreground">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                          <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+234 800 000 0000" />
                        </div>
                        <LocationPicker value={location} onChange={setLocation} />
                      </div>
                      <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                    </div>
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={showSkeleton} className="shrink-0">
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Professional Profile tab ──────────────────────────── */}
            {isProfessional && (
              <TabsContent value="professional" className="space-y-6 mt-6">
                {proLoading ? (
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-9 w-full rounded-md" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : !hasProfessionalProfile ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-foreground font-medium mb-2">No professional profile yet</p>
                      <p className="text-muted-foreground text-sm mb-5">Complete the professional setup to make your profile visible to caregivers.</p>
                      <Button onClick={() => router.push("/onboarding")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Complete Setup
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <form onSubmit={handleSaveProfessional} className="space-y-6">
                    <Card>
                      <CardHeader><CardTitle>Practice Details</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Specialization</Label>
                          <Input
                            value={proProfile.specialization}
                            onChange={e => setProProfile(p => ({ ...p, specialization: e.target.value }))}
                            placeholder="e.g. Speech-Language Pathology"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Professional Bio</Label>
                          <Textarea
                            value={proProfile.bio}
                            onChange={e => setProProfile(p => ({ ...p, bio: e.target.value }))}
                            placeholder="Describe your experience and approach..."
                            className="min-h-[120px]"
                          />
                          <p className={`text-xs text-right ${proProfile.bio.length < 20 ? "text-muted-foreground" : "text-primary"}`}>
                            {proProfile.bio.length} chars {proProfile.bio.length < 20 && "(min 20)"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Consultation Fee (₦) <span className="text-muted-foreground font-normal">— per 60 min session</span></Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₦</span>
                            <Input
                              type="number"
                              min="0"
                              value={proProfile.consultationFee || ""}
                              onChange={e => setProProfile(p => ({ ...p, consultationFee: parseFloat(e.target.value) || 0 }))}
                              placeholder="e.g. 20000"
                              className="pl-7"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle>Credentials</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. BCBA, CCC-SLP, Licensed Psychologist"
                            value={credentialInput}
                            onChange={e => setCredentialInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCredential() } }}
                          />
                          <Button type="button" variant="outline" size="icon" onClick={addCredential}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {proProfile.credentials.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {proProfile.credentials.map(c => (
                              <Badge key={c} variant="secondary" className="flex items-center gap-1 pr-1">
                                {c}
                                <button type="button" onClick={() => removeCredential(c)} className="ml-1 hover:text-destructive">
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle>Languages Spoken</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {LANGUAGES.map(lang => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => toggleLanguage(lang)}
                              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                proProfile.languages.includes(lang)
                                  ? "bg-primary border-primary text-white"
                                  : "border-border text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                        {proProfile.languages.filter(l => !LANGUAGES.includes(l)).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {proProfile.languages.filter(l => !LANGUAGES.includes(l)).map(lang => (
                              <span key={lang} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-primary text-white">
                                {lang}
                                <button type="button" onClick={() => removeCustomLanguage(lang)} className="ml-0.5 hover:opacity-70">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add another language…"
                            value={languageInput}
                            onChange={e => setLanguageInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLanguage() } }}
                          />
                          <Button type="button" variant="outline" size="icon" onClick={addLanguage}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Button type="submit" disabled={isSavingPro} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      {isSavingPro ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Professional Profile"}
                    </Button>
                  </form>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete your account?"
        description="This will permanently delete your Nexora account, profile, and all associated bookings. This action cannot be undone."
        confirmLabel="Yes, delete my account"
        variant="destructive"
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
    </div>
  )
}
