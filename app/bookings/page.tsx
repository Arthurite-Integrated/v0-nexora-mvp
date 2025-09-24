import { BookingCard } from "@/components/booking-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Plus } from "lucide-react"
import Link from "next/link"

// Mock data - in real app this would come from Supabase
const mockBookings = [
  {
    id: "1",
    professionalName: "Dr. Sarah Johnson",
    professionalSpecialization: "Developmental Pediatrics",
    professionalImage: "/professional-doctor-woman.jpg",
    date: "2024-01-25",
    time: "10:00 AM",
    duration: 60,
    status: "confirmed" as const,
    patientName: "John Doe",
    fee: 25000,
    notes: "Initial developmental assessment for 5-year-old with speech delays",
  },
  {
    id: "2",
    professionalName: "Dr. Michael Adebayo",
    professionalSpecialization: "Speech Therapy",
    professionalImage: "/professional-doctor-man.jpg",
    date: "2024-01-28",
    time: "2:00 PM",
    duration: 60,
    status: "pending" as const,
    patientName: "Jane Smith",
    fee: 20000,
    notes: "Follow-up session for speech therapy progress evaluation",
  },
  {
    id: "3",
    professionalName: "Dr. Fatima Hassan",
    professionalSpecialization: "Occupational Therapy",
    professionalImage: "/professional-therapist-woman.png",
    date: "2024-01-15",
    time: "11:00 AM",
    duration: 60,
    status: "completed" as const,
    patientName: "Alex Johnson",
    fee: 22000,
    notes: "Occupational therapy assessment and treatment planning",
  },
  {
    id: "4",
    professionalName: "Dr. Ahmed Musa",
    professionalSpecialization: "Behavioral Therapy",
    professionalImage: "/professional-therapist-man.jpg",
    date: "2024-01-10",
    time: "3:00 PM",
    duration: 60,
    status: "cancelled" as const,
    patientName: "Sarah Wilson",
    fee: 18000,
    notes: "Behavioral intervention consultation - cancelled due to illness",
  },
]

export default function BookingsPage() {
  const upcomingBookings = mockBookings.filter((b) => b.status === "confirmed" || b.status === "pending")
  const pastBookings = mockBookings.filter((b) => b.status === "completed" || b.status === "cancelled")

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
              <p className="text-lg text-gray-600">Manage your appointments and consultation history</p>
            </div>
            <Button asChild>
              <Link href="/professionals" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Book New Appointment
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</div>
                    <div className="text-gray-600">Upcoming</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {mockBookings.filter((b) => b.status === "completed").length}
                    </div>
                    <div className="text-gray-600">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <span className="text-accent font-bold text-lg">₦</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₦
                      {mockBookings
                        .filter((b) => b.status === "completed")
                        .reduce((sum, b) => sum + b.fee, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-gray-600">Total Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Tabs */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                    <p className="text-gray-600 mb-4">
                      Book your first consultation with one of our verified professionals
                    </p>
                    <Button asChild>
                      <Link href="/professionals">Find a Professional</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No past appointments</h3>
                    <p className="text-gray-600">Your completed and cancelled appointments will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
