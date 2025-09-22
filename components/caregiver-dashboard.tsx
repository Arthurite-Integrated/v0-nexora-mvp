import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Star, MessageCircle, BookOpen } from "lucide-react"
import Link from "next/link"

interface CaregiverDashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

// Mock data - in real app this would come from Supabase
const mockData = {
  upcomingBookings: [
    {
      id: "1",
      professionalName: "Dr. Sarah Johnson",
      specialization: "Developmental Pediatrics",
      date: "2024-01-25",
      time: "10:00 AM",
      patientName: "John Doe Jr.",
      image: "/professional-doctor-woman.jpg",
    },
    {
      id: "2",
      professionalName: "Dr. Michael Adebayo",
      specialization: "Speech Therapy",
      date: "2024-01-28",
      time: "2:00 PM",
      patientName: "Jane Doe",
      image: "/professional-doctor-man.jpg",
    },
  ],
  recentActivity: [
    {
      id: "1",
      type: "booking_confirmed",
      message: "Your appointment with Dr. Sarah Johnson has been confirmed",
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "review_reminder",
      message: "Please review your session with Dr. Fatima Hassan",
      time: "1 day ago",
    },
    {
      id: "3",
      type: "resource_shared",
      message: "Dr. Michael Adebayo shared new resources for speech development",
      time: "3 days ago",
    },
  ],
  favoritesProfessionals: [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialization: "Developmental Pediatrics",
      rating: 4.9,
      image: "/professional-doctor-woman.jpg",
    },
    {
      id: "2",
      name: "Dr. Fatima Hassan",
      specialization: "Occupational Therapy",
      rating: 5.0,
      image: "/professional-therapist-woman.png",
    },
  ],
  resources: [
    {
      id: "1",
      title: "Understanding Autism Spectrum Disorders",
      type: "Article",
      readTime: "5 min read",
    },
    {
      id: "2",
      title: "Early Intervention Strategies",
      type: "Video",
      readTime: "12 min watch",
    },
    {
      id: "3",
      title: "Supporting Your Child's Development",
      type: "Guide",
      readTime: "8 min read",
    },
  ],
}

export function CaregiverDashboard({ user }: CaregiverDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-primary-foreground/80 mb-4">Here's what's happening with your care journey today.</p>
        <Button variant="secondary" asChild>
          <Link href="/professionals" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockData.upcomingBookings.length}</div>
                <div className="text-gray-600">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-gray-600">Professionals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockData.favoritesProfessionals.length}</div>
                <div className="text-gray-600">Favorites</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockData.resources.length}</div>
                <div className="text-gray-600">Resources</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/bookings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockData.upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={booking.image || "/placeholder.svg"}
                      alt={booking.professionalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{booking.professionalName}</h4>
                    <p className="text-sm text-gray-600">{booking.specialization}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Plus className="w-4 h-4" />
                        {booking.patientName}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm">View</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border-l-4 border-primary/20 bg-gray-50">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Favorite Professionals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Favorite Professionals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockData.favoritesProfessionals.map((professional) => (
                <div key={professional.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={professional.image || "/placeholder.svg"}
                      alt={professional.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{professional.name}</h4>
                    <p className="text-xs text-gray-600">{professional.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs">{professional.rating}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/book/${professional.id}`}>Book</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommended Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Recommended Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.resources.map((resource) => (
                <div key={resource.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{resource.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{resource.readTime}</p>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View All Resources
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                <Link href="/professionals">
                  <Plus className="w-4 h-4 mr-2" />
                  Find New Professional
                </Link>
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message Professional
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
