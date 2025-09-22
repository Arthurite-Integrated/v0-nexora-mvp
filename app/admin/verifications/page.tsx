import { Header } from "@/components/header"
import { VerificationCard } from "@/components/verification-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, AlertTriangle, CheckCircle, Clock, X } from "lucide-react"

// Mock data - in real app this would come from Supabase
const mockVerifications = [
  {
    id: "1",
    name: "Dr. Adebayo Ogundimu",
    email: "adebayo.ogundimu@email.com",
    specialization: "Behavioral Therapy",
    location: "Lagos, Nigeria",
    yearsExperience: 8,
    submittedDate: "2024-01-20",
    status: "pending" as const,
    credentials: [
      {
        type: "Degree",
        title: "PhD in Psychology",
        institution: "University of Lagos",
        year: "2015",
        verified: false,
      },
      {
        type: "License",
        title: "Licensed Clinical Psychologist",
        institution: "Psychology Board of Nigeria",
        year: "2016",
        verified: false,
      },
      {
        type: "Certification",
        title: "Applied Behavior Analysis (ABA) Certification",
        institution: "Behavior Analyst Certification Board",
        year: "2018",
        verified: false,
      },
    ],
    documents: [
      { type: "CV", url: "/documents/cv-adebayo.pdf", uploaded: "2024-01-20" },
      { type: "Degree Certificate", url: "/documents/degree-adebayo.pdf", uploaded: "2024-01-20" },
      { type: "License", url: "/documents/license-adebayo.pdf", uploaded: "2024-01-20" },
    ],
    bio: "Experienced behavioral therapist specializing in Applied Behavior Analysis for children and adults with autism spectrum disorders and other developmental disabilities.",
    consultationFee: 18000,
    languages: ["English", "Yoruba"],
  },
  {
    id: "2",
    name: "Dr. Kemi Adeleke",
    email: "kemi.adeleke@email.com",
    specialization: "Speech Therapy",
    location: "Abuja, Nigeria",
    yearsExperience: 12,
    submittedDate: "2024-01-18",
    status: "under_review" as const,
    credentials: [
      {
        type: "Degree",
        title: "Masters in Speech-Language Pathology",
        institution: "University of Ibadan",
        year: "2012",
        verified: true,
      },
      {
        type: "Certification",
        title: "ASHA Certification",
        institution: "American Speech-Language-Hearing Association",
        year: "2013",
        verified: true,
      },
    ],
    documents: [
      { type: "CV", url: "/documents/cv-kemi.pdf", uploaded: "2024-01-18" },
      { type: "Degree Certificate", url: "/documents/degree-kemi.pdf", uploaded: "2024-01-18" },
      { type: "ASHA Certificate", url: "/documents/asha-kemi.pdf", uploaded: "2024-01-18" },
    ],
    bio: "Speech-language pathologist with extensive experience in treating communication disorders in children with developmental disabilities.",
    consultationFee: 20000,
    languages: ["English", "Hausa"],
  },
  {
    id: "3",
    name: "Dr. Ibrahim Yusuf",
    email: "ibrahim.yusuf@email.com",
    specialization: "Occupational Therapy",
    location: "Kano, Nigeria",
    yearsExperience: 6,
    submittedDate: "2024-01-22",
    status: "pending" as const,
    credentials: [
      {
        type: "Degree",
        title: "Masters in Occupational Therapy",
        institution: "Ahmadu Bello University",
        year: "2018",
        verified: false,
      },
      {
        type: "Certification",
        title: "NBCOT Certification",
        institution: "National Board for Certification in Occupational Therapy",
        year: "2019",
        verified: false,
      },
    ],
    documents: [
      { type: "CV", url: "/documents/cv-ibrahim.pdf", uploaded: "2024-01-22" },
      { type: "Degree Certificate", url: "/documents/degree-ibrahim.pdf", uploaded: "2024-01-22" },
      { type: "NBCOT Certificate", url: "/documents/nbcot-ibrahim.pdf", uploaded: "2024-01-22" },
    ],
    bio: "Occupational therapist focused on helping individuals with developmental disabilities achieve independence in daily living activities.",
    consultationFee: 22000,
    languages: ["English", "Hausa"],
  },
]

export default function AdminVerificationsPage() {
  const pendingVerifications = mockVerifications.filter((v) => v.status === "pending")
  const underReviewVerifications = mockVerifications.filter((v) => v.status === "under_review")
  const totalPending = pendingVerifications.length + underReviewVerifications.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Verifications</h1>
            <p className="text-lg text-gray-600">Review and verify healthcare professional applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{pendingVerifications.length}</div>
                    <div className="text-gray-600">Pending Review</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{underReviewVerifications.length}</div>
                    <div className="text-gray-600">Under Review</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">67</div>
                    <div className="text-gray-600">Verified</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">12</div>
                    <div className="text-gray-600">Rejected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input placeholder="Search by name, email, or specialization..." className="pl-10" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Filter className="w-4 h-4" />
                    Filter by Status
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Filter className="w-4 h-4" />
                    Filter by Specialization
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Tabs */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingVerifications.length})
                {pendingVerifications.length > 0 && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>}
              </TabsTrigger>
              <TabsTrigger value="review">Under Review ({underReviewVerifications.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingVerifications.length > 0 ? (
                <div className="space-y-4">
                  {pendingVerifications.map((verification) => (
                    <VerificationCard key={verification.id} verification={verification} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending verifications</h3>
                    <p className="text-gray-600">All professional applications have been reviewed</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              {underReviewVerifications.length > 0 ? (
                <div className="space-y-4">
                  {underReviewVerifications.map((verification) => (
                    <VerificationCard key={verification.id} verification={verification} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications under review</h3>
                    <p className="text-gray-600">Applications currently being reviewed will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Completed verifications</h3>
                  <p className="text-gray-600">View history of approved and rejected applications</p>
                  <Button className="mt-4">View History</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
