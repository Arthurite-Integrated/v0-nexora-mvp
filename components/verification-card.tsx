import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, Eye, FileText, MapPin, Clock, DollarSign, Languages, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Credential {
  type: string
  title: string
  institution: string
  year: string
  verified: boolean
}

interface Document {
  type: string
  url: string
  uploaded: string
}

interface Verification {
  id: string
  name: string
  email: string
  specialization: string
  location: string
  yearsExperience: number
  submittedDate: string
  status: "pending" | "under_review" | "approved" | "rejected"
  credentials: Credential[]
  documents: Document[]
  bio: string
  consultationFee: number
  languages: string[]
}

interface VerificationCardProps {
  verification: Verification
}

export function VerificationCard({ verification }: VerificationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "under_review":
        return <AlertTriangle className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <X className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const verifiedCredentials = verification.credentials.filter((c) => c.verified).length
  const totalCredentials = verification.credentials.length

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Professional Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{verification.name}</h3>
                <p className="text-gray-600 mb-2">{verification.email}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{verification.specialization}</Badge>
                  <Badge variant="outline" className={getStatusColor(verification.status)}>
                    {getStatusIcon(verification.status)}
                    <span className="ml-1">{verification.status.replace("_", " ")}</span>
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {verification.location}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  {verification.yearsExperience} years experience
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />₦{verification.consultationFee.toLocaleString()} per session
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Languages className="w-4 h-4" />
                  {verification.languages.join(", ")}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="text-gray-600">
                  <strong>Submitted:</strong> {formatDate(verification.submittedDate)}
                </div>
                <div className="text-gray-600">
                  <strong>Credentials:</strong> {verifiedCredentials}/{totalCredentials} verified
                </div>
                <div className="text-gray-600">
                  <strong>Documents:</strong> {verification.documents.length} uploaded
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Bio:</h4>
              <p className="text-sm text-gray-700 line-clamp-3">{verification.bio}</p>
            </div>

            {/* Credentials Preview */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Credentials:</h4>
              <div className="space-y-2">
                {verification.credentials.slice(0, 2).map((credential, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium">{credential.title}</span>
                      <p className="text-xs text-gray-600">
                        {credential.institution} • {credential.year}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={credential.verified ? "default" : "secondary"} className="text-xs">
                        {credential.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {verification.credentials.length > 2 && (
                  <p className="text-xs text-gray-500">+{verification.credentials.length - 2} more credentials</p>
                )}
              </div>
            </div>

            {/* Documents Preview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Documents:</h4>
              <div className="flex flex-wrap gap-2">
                {verification.documents.map((document, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    {document.type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:w-48 flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href={`/admin/verifications/${verification.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Review Details
              </Link>
            </Button>

            {verification.status === "pending" && (
              <>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Quick Approve
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Start Review
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}

            {verification.status === "under_review" && (
              <>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
