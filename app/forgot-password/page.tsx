"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { PasswordStrength, isPasswordValid } from "@/components/password-strength"

type Step = "email" | "code" | "done"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send reset code")
        return
      }

      setStep("code")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isPasswordValid(newPassword)) {
      setError("Password does not meet the requirements")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/confirm-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to reset password")
        return
      }

      setStep("done")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/images/nexora-logo.png" alt="Nexora" width={200} height={80} className="mx-auto mb-4" />
          <p className="text-slate-600">Reset your password</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {step === "email" && "Forgot Password"}
              {step === "code" && "Enter Reset Code"}
              {step === "done" && "Password Reset!"}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {step === "email" && "Enter your email and we'll send you a reset code"}
              {step === "code" && `We sent a code to ${email}`}
              {step === "done" && "Your password has been updated successfully"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "email" && (
              <form onSubmit={handleSendCode} className="space-y-4">
                {error && (
                  <p className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary text-white">
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
                <div className="text-center">
                  <Link href="/login" className="text-sm text-primary hover:text-primary">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <p className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-slate-700">Verification Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter the 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-primary"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-700">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 border-slate-200 focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={newPassword} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary text-white">
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setError("") }}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            )}

            {step === "done" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <p className="text-slate-600">You can now sign in with your new password.</p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-primary hover:bg-primary text-white"
                >
                  Go to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
