import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, Clock, CheckCircle, Languages, Calendar, Award, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

// Mock data - in real app this would come from Supabase
const mockProfessional = {
  id: "1",
  name: "Dr. Sarah Johnson",
  specialization: "Developmental Pediatrics",
  location: "Lagos, Nigeria",
  bio: "Dr. Sarah Johnson is a board-certified developmental pediatrician with over 15 years of experience working with children and families affected by Intellectual and Developmental Disabilities. She specializes in early intervention, developmental assessments, and creating comprehensive care plans that support both the individual and their family.",
  rating: 4.9,
  reviewCount: 127,
  verified: true,
  yearsExperience: 15,
  consultationFee: 25000,
  languages: ["English", "Yoruba"],
  image: "/professional-doctor-woman.jpg",
  credentials: [
    "MD, University of Lagos",
    "Residency in Pediatrics, Lagos University Teaching Hospital",
    "Fellowship in Developmental Pediatrics, Great Ormond Street Hospital, London",
    "Board Certified in Developmental-Behavioral Pediatrics",
  ],
  specialties: [
    "Autism Spectrum Disorders",
    "ADHD and Learning Disabilities",
    "Cerebral Palsy",
    "Down Syndrome",
    "Early Intervention",
    "Developmental Assessments",
  ],
  availability: [
    { day: "Monday", times: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"] },
    { day: "Tuesday", times: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"] },
    { day: "Wednesday", times: ["9:00 AM - 12:00 PM"] },
    { day: "Thursday", times: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"] },
    { day: "Friday", times: ["9:00 AM - 12:00 PM"] },
  ],
  reviews: [
    {
      id: "1",
      caregiverName: "Adunni M.",
      rating: 5,
      comment:
        "Dr. Johnson was incredibly patient and thorough with my son's assessment. She took the time to explain everything and provided excellent resources for our family.",
      date: "2024-01-15",
    },
    {
      id: "2",
      caregiverName: "Kemi O.",
      rating: 5,
      comment:
        "Outstanding professional. Her expertise in autism spectrum disorders is evident, and she made both my daughter and our family feel comfortable throughout the process.",
      date: "2024-01-10",
    },
    {
      id: "3",
      caregiverName: "Tunde A.",
      rating: 4,
      comment:
        "Very knowledgeable and caring. The consultation was comprehensive and she provided practical strategies we could implement immediately.",
      date: "2024-01-05",
    },
  ],
}

interface ProfessionalProfilePageProps {
  params: {
    id: string
  }
}

export default function ProfessionalProfilePage({ params }: ProfessionalProfilePageProps) {
  // In real app, fetch professional data based on params.id
  if (params.id !== "1") {
    notFound()
  }

  const professional = mockProfessional

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={professional.image || "/placeholder.svg"}
                      alt={professional.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h1 className="text-3xl font-bold text-gray-900">{professional.name}</h1>
                          {professional.verified && <CheckCircle className="w-6 h-6 text-primary" />}
                        </div>
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          {professional.specialization}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {professional.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {professional.yearsExperience} years experience
                      </div>
                      <div className="flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        {professional.languages.join(", ")}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-lg">{professional.rating}</span>
                        <span className="text-gray-500">({professional.reviewCount} reviews)</span>
                      </div>
                      {professional.verified && (
                        <Badge variant="outline" className="border-primary text-primary">
                          Verified Professional
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About Dr. {professional.name.split(" ").pop()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{professional.bio}</p>
              </CardContent>
            </Card>

            {/* Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Credentials & Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {professional.credentials.map((credential, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{credential}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Areas of Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {professional.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Patient Reviews ({professional.reviewCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {professional.reviews.map((review, index) => (
                  <div key={review.id}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">{review.caregiverName.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.caregiverName}</span>
                          <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="text-gray-500 text-sm">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                    {index < professional.reviews.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Book Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    ₦{professional.consultationFee.toLocaleString()}
                  </div>
                  <div className="text-gray-500">per consultation</div>
                </div>

                <Button size="lg" className="w-full" asChild>
                  <Link href={`/book/${professional.id}`}>Book Appointment</Link>
                </Button>

                <Button variant="outline" size="lg" className="w-full bg-transparent">
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {professional.availability.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <span className="font-medium text-gray-900">{schedule.day}</span>
                    <div className="text-right text-sm text-gray-600">
                      {schedule.times.map((time, timeIndex) => (
                        <div key={timeIndex}>{time}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
