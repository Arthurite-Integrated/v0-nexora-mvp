"use client"

import type React from "react"
import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { LocationPicker, locationToString, type LocationValue } from "@/components/location-picker"
import { PasswordStrength, isPasswordValid } from "@/components/password-strength"
import { useAuth } from "@/contexts/AuthContext"

type UserRole = "caregiver" | "professional"
type Step = "form" | "otp" | "photo"

const EMPTY_LOCATION: LocationValue = { country: "", countryName: "", state: "", stateName: "", city: "" }

export default function RegisterPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState<Step>("form")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const [isSavingPhoto, setIsSavingPhoto] = useState(false)

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "caregiver" as UserRole,
  })

  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION)

  const passwordRef = useRef("")

  // ── Step 1: Sign up ───────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid(formData.password)) {
      setError("Password does not meet the requirements below")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.")
        return
      }
      passwordRef.current = formData.password
      setStep("otp")
    } catch {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(""))
      otpRefs.current[5]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join("")
    if (code.length < 6) {
      setError("Please enter the full 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")
    try {
      const locString = locationToString(location)
      const res = await fetch("/api/auth/confirm-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code,
          password: passwordRef.current,
          // Pass these so confirm-signup saves them and writes the sheet correctly
          location: locString || undefined,
          locationData: location.country ? location : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.")
        return
      }

      await refreshUser()
      setStep("photo")
    } catch {
      setError("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    setError("")
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Failed to resend code")
    } catch {
      setError("Failed to resend code")
    } finally {
      setIsResending(false)
    }
  }

  // ── Step 3: Photo → route ─────────────────────────────────────────────────
  const handleFinish = async () => {
    if (profileImage) {
      setIsSavingPhoto(true)
      try {
        await fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileImage }),
        })
        await refreshUser()
      } catch {
        // non-fatal
      } finally {
        setIsSavingPhoto(false)
      }
    }

    if (formData.role === "professional") {
      router.push("/onboarding")
    } else if (formData.role === "caregiver") {
      router.push("/caregiver-onboarding")
    } else {
      router.push("/dashboard")
    }
  }

  const stepIndex = step === "form" ? 0 : step === "otp" ? 1 : 2
  const totalSteps = formData.role === "professional" ? 4 : 3

  const titles: Record<Step, string> = {
    form: "Create Account",
    otp: "Verify Your Email",
    photo: "Add a Profile Photo",
  }
  const subtitles: Record<Step, string> = {
    form: "Tell us about yourself",
    otp: `Enter the 6-digit code sent to ${formData.email}`,
    photo: "Help others recognise you",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Image src="/images/nexora-logo.png" alt="Nexora" width={200} height={80} className="mx-auto mb-4" />
          <p className="text-muted-foreground">Join our care community today</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{titles[step]}</CardTitle>
            <CardDescription>{subtitles[step]}</CardDescription>

            <div className="flex justify-center gap-2 pt-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i <= stepIndex ? "bg-primary w-6" : "bg-muted w-2"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <p className="flex items-start gap-2 text-sm text-destructive mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </p>
            )}

            {/* ── Step 1: Form ───────────────────────────────────────────── */}
            {step === "form" && (
              <form onSubmit={handleSignUp} className="space-y-5">
                {/* Role selection */}
                <div className="space-y-3">
                  <Label>I am a...</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(v) => setFormData((p) => ({ ...p, role: v as UserRole }))}
                    className="grid grid-cols-1 gap-2"
                  >
                    <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${formData.role === "caregiver" ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"}`}>
                      <RadioGroupItem value="caregiver" id="caregiver" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="caregiver" className="font-medium cursor-pointer">
                          Caregiver / Family Member
                        </Label>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Looking for healthcare professionals for a loved one or myself
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${formData.role === "professional" ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"}`}>
                      <RadioGroupItem value="professional" id="professional" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="professional" className="font-medium cursor-pointer">
                          Healthcare Professional
                        </Label>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Providing specialised care for individuals with IDDs
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>


                {/* Basic info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="name" name="name" type="text" placeholder="Your full name"
                        value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="email" name="email" type="email" placeholder="your@email.com"
                        value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="password" name="password" type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters" value={formData.password}
                        onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                        className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={formData.password} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"}
                        placeholder="Repeat your password" value={formData.confirmPassword}
                        onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                      <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {/* Location */}
                  <LocationPicker value={location} onChange={setLocation} />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5">
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : "Create Account"}
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  By signing up you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </div>
              </form>
            )}

            {/* ── Step 2: OTP ────────────────────────────────────────────── */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-14 text-center text-xl font-bold border-2 rounded-lg border-border focus:border-primary focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <Button type="submit" disabled={isLoading || otp.join("").length < 6}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5">
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Verify Email"}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Didn't receive a code?</p>
                  <button type="button" onClick={handleResendOtp} disabled={isResending}
                    className="text-sm text-primary hover:underline disabled:opacity-50">
                    {isResending ? "Sending..." : "Resend code"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 3: Photo ──────────────────────────────────────────── */}
            {step === "photo" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 py-2">
                  <ImageUpload
                    value={profileImage}
                    onChange={setProfileImage}
                    folder="profiles"
                    size={112}
                    label="Upload photo"
                  />
                  {profileImage && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Photo ready
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleFinish}
                  disabled={isSavingPhoto}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5"
                >
                  {isSavingPhoto
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    : formData.role === "professional"
                    ? "Continue to Professional Setup"
                    : "Go to Dashboard"}
                </Button>

                {!profileImage && (
                  <button type="button" onClick={handleFinish}
                    className="w-full text-sm text-muted-foreground hover:text-foreground">
                    Skip for now
                  </button>
                )}
              </div>
            )}

            {step === "form" && (
              <div className="mt-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
