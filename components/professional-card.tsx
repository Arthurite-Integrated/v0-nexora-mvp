import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, DollarSign, CheckCircle, Languages } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { CredentialBadge } from "@/components/credential-badge"
import { UserAvatar } from "@/components/user-avatar"

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
  const { user } = useAuth()
  const canBook = user?.role === "caregiver"

  return (
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
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-gray-900">{professional.name}</h3>
                  {professional.verified && <CheckCircle className="w-5 h-5 text-primary" />}
                  {professional.credentialVerified && <CredentialBadge size={18} />}
                </div>
                <Badge variant="secondary" className="mb-2">
                  {professional.specialization}
                </Badge>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{professional.rating}</span>
                  <span className="text-gray-500 text-sm">({professional.reviewCount})</span>
                </div>
                {professional.verified && (
                  <Badge variant="outline" className="text-xs border-primary text-primary">
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{professional.bio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {professional.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {professional.yearsExperience} years exp.
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />₦{professional.consultationFee.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Languages className="w-4 h-4" />
                {professional.languages.join(", ")}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className={canBook ? "flex-1" : "w-full"}>
            <Link href={`/professionals/${professional.id}`}>View Profile</Link>
          </Button>
          {canBook && (
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href={`/book/${professional.id}`}>Book Consultation</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
