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
import { Loader2, Trash2, Plus, X, Upload, FileText, ExternalLink, BadgeCheck } from "lucide-react"
import { CredentialBadge } from "@/components/credential-badge"
import { toast } from "sonner"

const EMPTY_LOCATION: LocationValue = { country: "", countryName: "", state: "", stateName: "", city: "" }

const LANGUAGES = ["English", "Yoruba", "Hausa", "Igbo", "French", "Arabic", "Pidgin"]

interface CredentialDoc {
  _id: string
  url: string
  filename: string
  fileType: string
  status: "pending" | "approved" | "rejected" | "more_info"
  adminNote?: string
  uploadedAt: string
}

interface ProfessionalProfile {
  _id?: string
  specialization: string
  bio: string
  credentials: string[]
  consultationFee: number
  languages: string[]
  availability: { day: string; startTime: string; endTime: string }[]
  credentialDocs: CredentialDoc[]
  credentialVerified: boolean
}

export default function SettingsPage() {
  const { user, loading, refreshUser, deleteAccount } = useAuth()
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
    credentialDocs: [], credentialVerified: false,
  })
  const [credentialInput, setCredentialInput] = useState("")
  const [languageInput, setLanguageInput] = useState("")
  const [proLoading, setProLoading] = useState(false)
  const [proInitialized, setProInitialized] = useState(false)
  const [isSavingPro, setIsSavingPro] = useState(false)
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)
  const [docError, setDocError] = useState("")
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
              credentialDocs: d.professional.credentialDocs || [],
              credentialVerified: d.professional.credentialVerified || false,
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
      // Refresh AuthContext so completion banner re-evaluates immediately
      await refreshUser()
      toast.success("Profile saved")
      router.push("/dashboard")
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

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !proProfile._id) return
    setDocError("")
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) { setDocError("Only PDF, JPEG, PNG and WebP files allowed"); return }
    if (file.size > 10 * 1024 * 1024) { setDocError("File must be under 10 MB"); return }
    setIsUploadingDoc(true)
    try {
      // Get presigned URL
      const presignRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, folder: "credentials" }),
      })
      if (!presignRes.ok) throw new Error("Failed to get upload URL")
      const { uploadUrl, publicUrl, key } = await presignRes.json()
      // Upload to S3
      const uploadRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file })
      if (!uploadRes.ok) throw new Error("Upload to S3 failed")
      // Save doc reference to professional profile
      const saveRes = await fetch(`/api/professionals/${proProfile._id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: publicUrl, filename: file.name, fileType: file.type, s3Key: key }),
      })
      if (!saveRes.ok) { const d = await saveRes.json(); throw new Error(d.error || "Failed to save document") }
      const d = await saveRes.json()
      setProProfile(p => ({ ...p, credentialDocs: d.professional?.credentialDocs || p.credentialDocs }))
      toast.success("Document uploaded — pending admin review")
    } catch (err: unknown) {
      setDocError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploadingDoc(false)
      e.target.value = ""
    }
  }

  const handleDeleteDoc = async (docId: string) => {
    if (!proProfile._id) return
    try {
      const res = await fetch(`/api/professionals/${proProfile._id}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId }),
      })
      if (res.ok) {
        setProProfile(p => ({ ...p, credentialDocs: p.credentialDocs.filter((d: { _id: string }) => d._id !== docId) }))
        toast.success("Document removed")
      } else toast.error("Failed to remove document")
    } catch { toast.error("Something went wrong") }
  }

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
                  <>
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

                  {/* Credential Documents */}
                  <Card className="mt-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />Credential Documents
                          {proProfile.credentialVerified && <CredentialBadge size={16} />}
                        </CardTitle>
                        <Label
                          htmlFor="doc-upload"
                          className={`flex items-center gap-1.5 text-xs cursor-pointer px-3 py-1.5 rounded-md border border-border hover:bg-muted/50 transition-colors ${isUploadingDoc ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          {isUploadingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          Upload
                          <input
                            id="doc-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            className="hidden"
                            onChange={handleDocUpload}
                            disabled={isUploadingDoc}
                          />
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload your degrees, licences, or certifications (PDF or image, max 10 MB each).
                        Admin will review and award a verified badge once approved.
                      </p>
                      {docError && <p className="text-xs text-destructive mt-1">{docError}</p>}
                    </CardHeader>
                    <CardContent>
                      {proProfile.credentialDocs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {proProfile.credentialDocs.map((doc) => (
                            <div key={doc._id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{doc.filename}</p>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${
                                      doc.status === "approved" ? "bg-green-50 text-green-700" :
                                      doc.status === "rejected" ? "bg-red-50 text-red-700" :
                                      doc.status === "more_info" ? "bg-yellow-50 text-yellow-700" :
                                      "bg-muted text-muted-foreground"
                                    }`}>
                                      {doc.status === "more_info" ? "More info needed" : doc.status}
                                    </span>
                                    {doc.adminNote && <span className="text-xs text-muted-foreground italic truncate">{doc.adminNote}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                                  className="p-1.5 rounded hover:bg-muted transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                </a>
                                {doc.status !== "approved" && (
                                  <button onClick={() => handleDeleteDoc(doc._id)}
                                    className="p-1.5 rounded hover:bg-muted transition-colors">
                                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  </>
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
