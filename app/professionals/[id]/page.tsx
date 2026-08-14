"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, Clock, CheckCircle, Languages, Calendar, Award, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { BackButton } from "@/components/back-button"
import { ProfessionalSchema } from "@/components/structured-data"
import { useAuth } from "@/contexts/AuthContext"
import { CredentialBadge } from "@/components/credential-badge"
import { UserAvatar } from "@/components/user-avatar"

interface Review {
  _id: string
  rating: number
  comment: string
  createdAt: string
  caregiverId?: { name: string; profileImage?: string }
}

interface Professional {
  _id: string
  name: string
  specialization: string
  location: string
  bio: string
  averageRating: number
  reviewCount: number
  isVerified: boolean
  credentialVerified?: boolean
  experience: number
  consultationFee: number
  languages: string[]
  profileImage?: string
  credentials: string[]
  availability: { day: string; startTime: string; endTime: string }[]
}

export default function ProfessionalProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const canBook = user?.role === "caregiver"
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/professionals/${id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(d => {
        if (d) {
          setProfessional(d.professional)
          setReviews(d.reviews || [])
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-4 w-24 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
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
          <p className="font-medium text-foreground mb-2">Professional not found</p>
          <Button variant="outline" onClick={() => router.push("/professionals")}>Browse Professionals</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalSchema
        name={professional.name}
        specialization={professional.specialization}
        location={professional.location}
        bio={professional.bio}
        profileUrl={`https://nexoracare.com/professionals/${professional._id}`}
        imageUrl={professional.profileImage}
        rating={professional.averageRating}
        reviewCount={professional.reviewCount}
        consultationFee={professional.consultationFee}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/professionals" label="Find Professionals" className="mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-5">
                  <UserAvatar
                    src={professional.profileImage}
                    name={professional.name}
                    role="professional"
                    size={128}
                    className="rounded-lg hidden sm:block"
                  />
                  <UserAvatar
                    src={professional.profileImage}
                    name={professional.name}
                    role="professional"
                    size={96}
                    className="rounded-lg sm:hidden"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{professional.name}</h1>
                      {professional.isVerified && <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-1" />}
                      {professional.credentialVerified && <CredentialBadge size={20} className="mt-1" />}
                    </div>
                    <Badge variant="secondary" className="mb-3">{professional.specialization}</Badge>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      {professional.location && (
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{professional.location}</span>
                      )}
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{professional.experience} yrs experience</span>
                      {professional.languages?.length > 0 && (
                        <span className="flex items-center gap-1.5"><Languages className="w-4 h-4" />{professional.languages.join(", ")}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {professional.reviewCount > 0 && (
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">{professional.averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({professional.reviewCount} reviews)</span>
                        </span>
                      )}
                      {professional.isVerified && (
                        <Badge variant="outline" className="border-primary text-primary text-xs">Platform reviewed</Badge>
                      )}
                      {professional.credentialVerified && (
                        <Badge variant="outline" className="border-primary text-primary text-xs">Credentials verified</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {professional.bio && (
              <Card>
                <CardHeader><CardTitle>About</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{professional.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Credentials */}
            {professional.credentials?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" />Credentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {professional.credentials.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{c}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />Reviews ({professional.reviewCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review, i) => (
                    <div key={review._id}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-primary font-semibold text-sm">
                            {(review.caregiverId?.name || "A")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{review.caregiverId?.name || "Anonymous"}</span>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, j) => (
                                <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                      {i < reviews.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {reviews.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  No reviews yet for this professional.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4" />Book Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2">
                  <div className="text-3xl font-bold text-primary">₦{professional.consultationFee.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">per 60-min session</p>
                </div>
                {canBook ? (
                  <Button size="lg" className="w-full bg-primary text-primary-foreground" asChild>
                    <Link href={`/book/${professional._id}`}>Book Appointment</Link>
                  </Button>
                ) : user && !canBook ? (
                  <p className="text-xs text-muted-foreground text-center">
                    Only caregivers can book appointments.
                  </p>
                ) : (
                  <Button size="lg" className="w-full bg-primary text-primary-foreground" asChild>
                    <Link href="/register">Sign up to Book</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {professional.availability?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Availability</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {professional.availability.map((slot, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground">{slot.day}</span>
                      <span className="text-muted-foreground">{slot.startTime} – {slot.endTime}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
