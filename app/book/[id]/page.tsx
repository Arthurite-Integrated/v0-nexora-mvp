import { Header } from "@/components/header"
import { BookingForm } from "@/components/booking-form"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, DollarSign, CheckCircle } from "lucide-react"
import { notFound } from "next/navigation"

// Mock data - in real app this would come from Supabase
const mockProfessional = {
  id: "1",
  name: "Dr. Sarah Johnson",
  specialization: "Developmental Pediatrics",
  location: "Lagos, Nigeria",
  rating: 4.9,
  reviewCount: 127,
  verified: true,
  yearsExperience: 15,
  consultationFee: 25000,
  image: "/professional-doctor-woman.jpg",
  availability: [
    {
      date: "2024-01-22",
      slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
    },
    {
      date: "2024-01-23",
      slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
    },
    {
      date: "2024-01-24",
      slots: ["9:00 AM", "10:00 AM", "11:00 AM"],
    },
    {
      date: "2024-01-25",
      slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
    },
    {
      date: "2024-01-26",
      slots: ["9:00 AM", "10:00 AM", "11:00 AM"],
    },
  ],
}

interface BookingPageProps {
  params: {
    id: string
  }
}

export default function BookingPage({ params }: BookingPageProps) {
  // In real app, fetch professional data based on params.id
  if (params.id !== "1") {
    notFound()
  }

  const professional = mockProfessional

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Consultation</h1>
            <p className="text-lg text-gray-600">Schedule your appointment with {professional.name}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Professional Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4">
                      <img
                        src={professional.image || "/placeholder.svg"}
                        alt={professional.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{professional.name}</h3>
                      {professional.verified && <CheckCircle className="w-5 h-5 text-primary" />}
                    </div>
                    <Badge variant="secondary" className="mb-3">
                      {professional.specialization}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {professional.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {professional.yearsExperience} years experience
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>
                        {professional.rating} ({professional.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />₦{professional.consultationFee.toLocaleString()} per session
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-primary mb-2">Consultation Fee</h4>
                    <div className="text-2xl font-bold text-primary">
                      ₦{professional.consultationFee.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">60-minute consultation session</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <BookingForm professional={professional} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
