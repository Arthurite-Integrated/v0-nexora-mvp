import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  X,
  FileText,
  Download,
  MapPin,
  Clock,
  DollarSign,
  Languages,
  ArrowLeft,
  AlertTriangle,
  User,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

// Mock data - in real app this would come from Supabase
const mockVerification = {
  id: "1",
  name: "Dr. Adebayo Ogundimu",
  email: "adebayo.ogundimu@email.com",
  phone: "+234 803 123 4567",
  specialization: "Behavioral Therapy",
  location: "Lagos, Nigeria",
  yearsExperience: 8,
  submittedDate: "2024-01-20",
  status: "pending" as const,
  bio: "Experienced behavioral therapist specializing in Applied Behavior Analysis for children and adults with autism spectrum disorders and other developmental disabilities. I have worked extensively with families to develop individualized treatment plans that promote skill acquisition and reduce challenging behaviors. My approach is evidence-based and family-centered, ensuring that interventions are practical and sustainable in home and community settings.",
  consultationFee: 18000,
  languages: ["English", "Yoruba"],
  credentials: [
    {
      type: "Degree",
      title: "PhD in Psychology",
      institution: "University of Lagos",
      year: "2015",
      verified: false,
      details: "Specialized in Clinical Psychology with focus on developmental disabilities",
    },
    {
      type: "License",
      title: "Licensed Clinical Psychologist",
      institution: "Psychology Board of Nigeria",
      year: "2016",
      verified: false,
      details: "License #PSY-2016-0234, Valid until 2026",
    },
    {
      type: "Certification",
      title: "Applied Behavior Analysis (ABA) Certification",
      institution: "Behavior Analyst Certification Board",
      year: "2018",
      verified: false,
      details: "Board Certified Behavior Analyst (BCBA) #1-18-12345",
    },
    {
      type: "Certification",
      title: "Autism Spectrum Disorders Certificate",
      institution: "International Association for Autism Research",
      year: "2019",
      verified: false,
      details: "Advanced certification in autism intervention strategies",
    },
  ],
  documents: [
    {
      type: "CV/Resume",
      url: "/documents/cv-adebayo.pdf",
      uploaded: "2024-01-20",
      size: "2.3 MB",
      status: "uploaded",
    },
    {
      type: "PhD Certificate",
      url: "/documents/phd-adebayo.pdf",
      uploaded: "2024-01-20",
      size: "1.8 MB",
      status: "uploaded",
    },
    {
      type: "Psychology License",
      url: "/documents/license-adebayo.pdf",
      uploaded: "2024-01-20",
      size: "1.2 MB",
      status: "uploaded",
    },
    {
      type: "BCBA Certificate",
      url: "/documents/bcba-adebayo.pdf",
      uploaded: "2024-01-20",
      size: "0.9 MB",
      status: "uploaded",
    },
    {
      type: "Professional References",
      url: "/documents/references-adebayo.pdf",
      uploaded: "2024-01-20",
      size: "0.7 MB",
      status: "uploaded",
    },
  ],
  workExperience: [
    {
      position: "Senior Behavioral Therapist",
      organization: "Lagos Autism Center",
      duration: "2018 - Present",
      description:
        "Lead behavioral interventions for children with autism spectrum disorders. Supervise junior therapists and coordinate with multidisciplinary teams.",
    },
    {
      position: "Clinical Psychologist",
      organization: "Federal Neuropsychiatric Hospital, Lagos",
      duration: "2016 - 2018",
      description:
        "Provided psychological assessments and interventions for individuals with developmental disabilities and their families.",
    },
    {
      position: "Research Assistant",
      organization: "University of Lagos Psychology Department",
      duration: "2013 - 2016",
      description: "Conducted research on early intervention strategies for children with developmental delays.",
    },
  ],
  specialties: [
    "Autism Spectrum Disorders",
    "Applied Behavior Analysis (ABA)",
    "Early Intervention",
    "Behavioral Assessments",
    "Parent Training",
    "Social Skills Training",
    "Challenging Behavior Management",
  ],
  reviewNotes: "",
}

interface VerificationDetailPageProps {
  params: {
    id: string
  }
}

export default function VerificationDetailPage({ params }: VerificationDetailPageProps) {
  // In real app, fetch verification data based on params.id
  if (params.id !== "1") {
    notFound()
  }

  const verification = mockVerification

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

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

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/verifications">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Verifications
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Professional Verification Review</h1>
              <p className="text-gray-600">Detailed review of {verification.name}'s application</p>
            </div>
            <Badge variant="outline" className={getStatusColor(verification.status)}>
              {verification.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{verification.name}</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <strong>Email:</strong> {verification.email}
                        </p>
                        <p className="text-gray-600">
                          <strong>Phone:</strong> {verification.phone}
                        </p>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {verification.location}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {verification.yearsExperience} years experience
                        </div>
                      </div>
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-3">
                        {verification.specialization}
                      </Badge>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />₦{verification.consultationFee.toLocaleString()} per session
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Languages className="w-4 h-4" />
                          {verification.languages.join(", ")}
                        </div>
                        <p className="text-gray-600">
                          <strong>Submitted:</strong> {formatDate(verification.submittedDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Professional Bio:</h4>
                    <p className="text-gray-700 leading-relaxed">{verification.bio}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Areas of Expertise:</h4>
                    <div className="flex flex-wrap gap-2">
                      {verification.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Work Experience */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {verification.workExperience.map((experience, index) => (
                    <div key={index} className="border-l-4 border-primary/20 pl-4">
                      <h4 className="font-semibold text-gray-900">{experience.position}</h4>
                      <p className="text-primary font-medium">{experience.organization}</p>
                      <p className="text-sm text-gray-600 mb-2">{experience.duration}</p>
                      <p className="text-sm text-gray-700">{experience.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle>Credentials & Certifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {verification.credentials.map((credential, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{credential.title}</h4>
                          <p className="text-gray-600">
                            {credential.institution} • {credential.year}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{credential.details}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={credential.verified ? "default" : "secondary"}>
                            {credential.verified ? "Verified" : "Pending"}
                          </Badge>
                          <Button size="sm" variant="outline">
                            {credential.verified ? "Verified" : "Verify"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Uploaded Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {verification.documents.map((document, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">{document.type}</h4>
                          <p className="text-sm text-gray-600">
                            {document.size} • Uploaded {formatDate(document.uploaded)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {document.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Verification Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Request Additional Information
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                    <X className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </CardContent>
              </Card>

              {/* Review Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add your review notes here..."
                      rows={6}
                      value={verification.reviewNotes}
                    />
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Save Notes
                  </Button>
                </CardContent>
              </Card>

              {/* Verification Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Profile information complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">All documents uploaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Credentials verification pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Professional references check</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Credentials:</span>
                    <span className="font-medium">
                      {verification.credentials.filter((c) => c.verified).length}/{verification.credentials.length}{" "}
                      verified
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Documents:</span>
                    <span className="font-medium">{verification.documents.length} uploaded</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{verification.yearsExperience} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Specialties:</span>
                    <span className="font-medium">{verification.specialties.length} areas</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
