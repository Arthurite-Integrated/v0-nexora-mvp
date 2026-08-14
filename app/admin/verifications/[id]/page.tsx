"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, X, MapPin, Clock, Languages, ArrowLeft, Loader2, Award } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Professional {
  _id: string
  name: string
  email: string
  specialization: string
  location: string
  experience: number
  bio: string
  credentials: string[]
  consultationFee: number
  languages: string[]
  verificationStatus: "pending" | "under_review" | "verified" | "rejected"
  isVerified: boolean
  credentialVerified: boolean
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  under_review: "bg-blue-50 text-blue-700 border-blue-200",
  verified: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
}

export default function VerificationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/dashboard")
  }, [user, loading, router])

  useEffect(() => {
    if (!id) return
    fetch(`/api/professionals/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setProfessional(d.professional))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [id])

  const handleUpdateStatus = async (verificationStatus: string) => {
    if (verificationStatus === "verified" && professional && !professional.credentialVerified) {
      const shouldContinue = window.confirm(
        "This professional has no approved credential documents yet. Approving now will mark their profile as platform reviewed only, not credentials verified."
      )
      if (!shouldContinue) return
    }

    setUpdatingStatus(verificationStatus)
    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || "Failed to update"); return }
      setProfessional(d.professional)
      const labels: Record<string, string> = {
        verified: "Profile approved",
        rejected: "Application rejected",
        under_review: "Moved to Under Review",
        pending: "Reset to Pending",
      }
      toast.success(labels[verificationStatus] || "Status updated")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-medium mb-2">Professional not found</p>
          <Button variant="outline" asChild><Link href="/admin/verifications">Back to Verifications</Link></Button>
        </div>
      </div>
    )
  }

  const canApprove = professional.verificationStatus !== "verified"
  const canReject = professional.verificationStatus !== "rejected"
  const canReview = professional.verificationStatus === "pending"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/verifications"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{professional.name}</h1>
            <p className="text-muted-foreground text-sm">{professional.email}</p>
          </div>
          <Badge variant="outline" className={STATUS_STYLES[professional.verificationStatus]}>
            {professional.verificationStatus.replace("_", " ")}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Profile */}
            <Card>
              <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Specialization</p>
                    <p className="font-medium">{professional.specialization}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Experience</p>
                    <p className="font-medium">{professional.experience} years</p>
                  </div>
                  {professional.location && (
                    <div>
                      <p className="text-muted-foreground mb-1">Location</p>
                      <p className="font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{professional.location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-1">Consultation Fee</p>
                    <p className="font-medium">₦{professional.consultationFee?.toLocaleString() || "—"}</p>
                  </div>
                  {professional.languages?.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-1">Languages</p>
                      <p className="font-medium flex items-center gap-1"><Languages className="w-3.5 h-3.5" />{professional.languages.join(", ")}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-1">Applied</p>
                    <p className="font-medium">{new Date(professional.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>

                {professional.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Professional Bio</p>
                      <p className="text-sm text-foreground leading-relaxed">{professional.bio}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Credentials */}
            {professional.credentials?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Award className="w-4 h-4" />Credentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {professional.credentials.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Review Decision</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {canReview && (
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200"
                    disabled={!!updatingStatus}
                    onClick={() => handleUpdateStatus("under_review")}
                  >
                    {updatingStatus === "under_review" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Mark Under Review
                  </Button>
                )}
                {canApprove && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={!!updatingStatus}
                    onClick={() => handleUpdateStatus("verified")}
                  >
                    {updatingStatus === "verified" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Approve Profile
                  </Button>
                )}
                {canReject && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={!!updatingStatus}
                    onClick={() => handleUpdateStatus("rejected")}
                  >
                    {updatingStatus === "rejected" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                    Reject
                  </Button>
                )}
                {!canApprove && !canReject && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!!updatingStatus}
                    onClick={() => handleUpdateStatus("pending")}
                  >
                    Re-open for Review
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
