"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Star, MessageCircle, BookOpen } from "lucide-react"
import Link from "next/link"
import { ProfileCompletionBanner } from "@/components/profile-completion-banner"

interface CaregiverDashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface Booking {
  _id: string
  date: string
  status: string
  duration: number
  fee: number
  professionalId?: {
    _id: string
    name: string
    specialization: string
    profileImage?: string
  }
}

export function CaregiverDashboard({ user }: CaregiverDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/bookings?limit=5")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "confirmed")
  const completed = bookings.filter((b) => b.status === "completed").length
  const totalSpent = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.fee, 0)

  return (
    <div className="space-y-8">
      <ProfileCompletionBanner />
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/70 text-white rounded-lg p-6">
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
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{upcoming.length}</div>
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
                <div className="text-2xl font-bold text-gray-900">{completed}</div>
                <div className="text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <span className="text-orange-500 font-bold text-lg">₦</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₦{totalSpent.toLocaleString()}</div>
                <div className="text-gray-600">Total Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/bookings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-6 text-gray-500 text-sm">Loading...</div>
              ) : upcoming.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No upcoming appointments</p>
                  <Button size="sm" asChild className="mt-3">
                    <Link href="/professionals">Find a Professional</Link>
                  </Button>
                </div>
              ) : (
                upcoming.map((booking) => (
                  <div key={booking._id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={booking.professionalId?.profileImage || "/avatar-professional.svg"}
                        alt={booking.professionalId?.name || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{booking.professionalId?.name || "Unknown"}</h4>
                      <p className="text-sm text-gray-600">{booking.professionalId?.specialization || ""}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(booking.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">View</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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
              <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                <Link href="/bookings">
                  <Calendar className="w-4 h-4 mr-2" />
                  View All Bookings
                </Link>
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                <Link href="/resources">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Resources
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
