"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Mail, Lock, User, MapPin, FileText } from "lucide-react"

type UserRole = "caregiver" | "professional"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic info
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "caregiver" as UserRole,

    // Professional-specific fields
    specialization: "",
    location: "",
    bio: "",
    credentials: "",
    experience: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      // Validate basic info
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long")
        return
      }
      setError("")
      setStep(2)
      return
    }

    // Final submission
    setIsLoading(true)
    setError("")

    try {
      // TODO: Implement Supabase auth
      console.log("Registration attempt:", formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect based on role
      if (formData.role === "professional") {
        window.location.href = "/dashboard?welcome=professional"
      } else {
        window.location.href = "/dashboard?welcome=caregiver"
      }
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRoleChange = (value: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/images/nexora-logo.png" alt="Nexora" width={200} height={80} className="mx-auto mb-4" />
          <p className="text-slate-600">Join our care community today</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
            <CardDescription className="text-slate-600">
              {step === 1 ? "Tell us about yourself" : "Complete your profile"}
            </CardDescription>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-teal-600" : "bg-slate-200"}`} />
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-teal-600" : "bg-slate-200"}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {step === 1 && (
                <>
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label className="text-slate-700">I am a...</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={handleRoleChange}
                      className="grid grid-cols-1 gap-3"
                    >
                      <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors">
                        <RadioGroupItem value="caregiver" id="caregiver" />
                        <div className="flex-1">
                          <Label htmlFor="caregiver" className="font-medium text-slate-900 cursor-pointer">
                            Caregiver/Family Member
                          </Label>
                          <p className="text-sm text-slate-600">
                            Looking for healthcare professionals for my loved one
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors">
                        <RadioGroupItem value="professional" id="professional" />
                        <div className="flex-1">
                          <Label htmlFor="professional" className="font-medium text-slate-900 cursor-pointer">
                            Healthcare Professional
                          </Label>
                          <p className="text-sm text-slate-600">Providing specialized care for individuals with IDDs</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && formData.role === "professional" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-slate-700">
                      Specialization
                    </Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      type="text"
                      placeholder="e.g., Speech Therapy, Behavioral Analysis"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-slate-700">
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="City, State"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="pl-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-slate-700">
                      Years of Experience
                    </Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credentials" className="text-slate-700">
                      Credentials
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="credentials"
                        name="credentials"
                        type="text"
                        placeholder="e.g., M.A., CCC-SLP, BCBA"
                        value={formData.credentials}
                        onChange={handleInputChange}
                        className="pl-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-slate-700">
                      Professional Bio
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about your experience and approach to care..."
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="border-slate-200 focus:border-teal-500 focus:ring-teal-500 min-h-[100px]"
                      required
                    />
                  </div>
                </>
              )}

              {step === 2 && formData.role === "caregiver" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">You're all set!</h3>
                  <p className="text-slate-600">
                    Click continue to complete your registration and start connecting with healthcare professionals.
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-slate-200 hover:bg-slate-50"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5"
                >
                  {isLoading ? "Creating Account..." : step === 1 ? "Continue" : "Create Account"}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-teal-600 hover:text-teal-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-teal-600 hover:text-teal-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
