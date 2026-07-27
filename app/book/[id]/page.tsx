"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, MapPin, Clock, CheckCircle, Loader2, Calendar, FileText } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { BookingForm } from "@/components/booking-form"

interface Professional {
  _id: string
  name: string
  specialization: string
  location: string
  averageRating: number
  reviewCount: number
  isVerified: boolean
  experience: number
  consultationFee: number
  profileImage?: string
  bio: string
  availability: { day: string; startTime: string; endTime: string }[]
  languages: string[]
}

export default function BookPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    fetch(`/api/professionals/${id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(d => d && setProfessional(d.professional))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [id])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <Skeleton className="h-4 w-24 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-xl" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !professional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground font-medium mb-2">Professional not found</p>
          <Button variant="outline" onClick={() => router.push("/professionals")}>Browse Professionals</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton fallback={`/professionals/${id}`} label="Back to Profile" className="mb-6" />
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Book Consultation</h1>
            <p className="text-muted-foreground mt-1">Schedule your appointment with {professional.name}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Professional summary sidebar */}
            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-4">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                      <img src={professional.profileImage || "/avatar-professional.svg"} alt={professional.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-foreground truncate">{professional.name}</p>
                        {professional.isVerified && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-0.5">{professional.specialization}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-5">
                    {professional.location && (
                      <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" />{professional.location}</div>
                    )}
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 shrink-0" />{professional.experience} years experience</div>
                    {professional.reviewCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current shrink-0" />
                        {professional.averageRating.toFixed(1)} ({professional.reviewCount} reviews)
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Consultation fee</p>
                    <p className="text-2xl font-bold text-primary">₦{professional.consultationFee.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">per 60-min session</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking form */}
            <div className="lg:col-span-2">
              <BookingForm professional={professional} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
