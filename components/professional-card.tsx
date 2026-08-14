"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Star, MapPin, Clock, DollarSign, Languages, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { UserAvatar } from "@/components/user-avatar"
import { CredentialBadge } from "@/components/credential-badge"

interface Professional {
  id: string
  name: string
  specialization: string
  location: string
  bio: string
  rating: number
  reviewCount: number
  verified: boolean
  credentialVerified?: boolean
  yearsExperience: number
  consultationFee: number
  languages: string[]
  image?: string | null
}

interface ProfessionalCardProps {
  professional: Professional
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const { user, loading } = useAuth()

  // Show booking button for caregivers, or for non-logged-in users (they'll be prompted to log in)
  // Hide only for professionals and admins viewing the directory
  const isProfessionalOrAdmin = user?.role === "professional" || user?.role === "admin"
  const showBookButton = !loading && !isProfessionalOrAdmin

  return (
    <TooltipProvider>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <UserAvatar
              src={professional.image}
              name={professional.name}
              role="professional"
              size={96}
              className="rounded-lg"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  {/* Name + verification badges */}
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <h3 className="text-xl font-semibold text-gray-900">{professional.name}</h3>

                    {professional.verified && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[200px]">
                          <p className="font-semibold mb-0.5">Platform reviewed</p>
                          <p>This professional's identity and application has been reviewed and approved by the Nexora team.</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {professional.credentialVerified && (
                      <CredentialBadge size={20} />
                    )}
                  </div>

                  <Badge variant="secondary" className="mb-2">{professional.specialization}</Badge>

                  {/* Badge legend — only shown when at least one badge is present */}
                  {(professional.verified || professional.credentialVerified) && (
                    <div className="flex items-center gap-3 flex-wrap mt-1">
                      {professional.verified && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />Platform reviewed
                        </span>
                      )}
                      {professional.credentialVerified && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CredentialBadge size={14} />Credentials verified
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="text-right shrink-0 ml-2">
                  <div className="flex items-center gap-1 mb-1 justify-end">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{professional.rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({professional.reviewCount})</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{professional.bio}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {professional.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />{professional.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />{professional.yearsExperience} yrs exp.
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />₦{professional.consultationFee.toLocaleString()}
                </div>
                {professional.languages?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Languages className="w-4 h-4" />{professional.languages.join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className={showBookButton ? "flex-1" : "w-full"}>
              <Link href={`/professionals/${professional.id}`}>View Profile</Link>
            </Button>
            {showBookButton && (
              <Button variant="outline" asChild className="flex-1 bg-transparent">
                <Link href={`/book/${professional.id}`}>Book Consultation</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
