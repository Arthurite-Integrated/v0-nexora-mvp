"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Heart, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import {
  CARE_RELATIONSHIPS, CARE_RELATIONSHIP_LABELS,
  PATIENT_AGE_GROUPS, PATIENT_AGE_GROUP_LABELS,
  DIAGNOSIS_STATUSES, DIAGNOSIS_STATUS_LABELS,
} from "@/lib/models/User"

type Relationship = typeof CARE_RELATIONSHIPS[number]
type AgeGroup = typeof PATIENT_AGE_GROUPS[number]
type DiagnosisStatus = typeof DIAGNOSIS_STATUSES[number]

export default function CaregiverOnboardingPage() {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()

  const [relationship, setRelationship] = useState<Relationship | "">("")
  const [patientAgeGroup, setPatientAgeGroup] = useState<AgeGroup | "">("")
  const [diagnosisStatus, setDiagnosisStatus] = useState<DiagnosisStatus | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
    // If already completed, skip to dashboard
    if (user?.careProfile?.relationship) router.push("/dashboard")
  }, [user, loading, router])

  const isSelf = relationship === "self"
  const canProceed = relationship && patientAgeGroup && diagnosisStatus

  const handleSubmit = async () => {
    if (!canProceed) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careProfile: { relationship, patientAgeGroup, diagnosisStatus },
          // Derive isSelfAdvocate for backwards compat
          isSelfAdvocate: relationship === "self",
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error || "Failed to save. Please try again.")
        return
      }
      await refreshUser()
      router.push("/dashboard")
    } catch {
      toast.error("Something went wrong. Please try again.")
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Image src="/images/nexora-logo.png" alt="Nexora" width={160} height={64} className="mx-auto mb-4" />
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">About who you're seeking care for</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
            This helps us personalise your experience and improve care across Nigeria.
            Your answers are kept private and used only for research.
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6 space-y-6">

            {/* Question 1 — Relationship */}
            <div className="space-y-3">
              <p className="font-medium text-foreground text-sm">
                Who are you seeking care for?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {CARE_RELATIONSHIPS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRelationship(r)}
                    className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      relationship === r
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border text-foreground hover:border-primary/30"
                    }`}
                  >
                    {CARE_RELATIONSHIP_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 — Age group (adapts label based on relationship) */}
            {relationship && (
              <div className="space-y-3">
                <p className="font-medium text-foreground text-sm">
                  {isSelf ? "What is your age group?" : "What is their age group?"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PATIENT_AGE_GROUPS.map(ag => (
                    <button
                      key={ag}
                      type="button"
                      onClick={() => setPatientAgeGroup(ag)}
                      className={`px-3 py-2.5 rounded-lg border text-sm text-center transition-colors ${
                        patientAgeGroup === ag
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border text-foreground hover:border-primary/30"
                      }`}
                    >
                      {PATIENT_AGE_GROUP_LABELS[ag]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3 — Diagnosis status */}
            {patientAgeGroup && (
              <div className="space-y-3">
                <p className="font-medium text-foreground text-sm">
                  {isSelf ? "Do you have a diagnosis?" : "Has a diagnosis been made?"}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {DIAGNOSIS_STATUSES.map(ds => (
                    <button
                      key={ds}
                      type="button"
                      onClick={() => setDiagnosisStatus(ds)}
                      className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                        diagnosisStatus === ds
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border text-foreground hover:border-primary/30"
                      }`}
                    >
                      {DIAGNOSIS_STATUS_LABELS[ds]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            {canProceed && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  : <>Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
