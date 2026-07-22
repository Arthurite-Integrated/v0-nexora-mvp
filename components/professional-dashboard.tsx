"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Star, Settings, TrendingUp, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { ProfileCompletionBanner } from "@/components/profile-completion-banner"

interface ProfessionalDashboardProps {
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
  duration: number
  status: string
  consultationType: string
  fee: number
  notes?: string
  caregiverId?: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
}

export function ProfessionalDashboard({ user }: ProfessionalDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings?limit=20")
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const upcoming = bookings.filter((b) => b.status === "confirmed")
  const pending = bookings.filter((b) => b.status === "pending")
  const completed = bookings.filter((b) => b.status === "completed")
  const totalEarnings = completed.reduce((s, b) => s + b.fee, 0)

  const updateBookingStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        if (status === "confirmed") toast.success("Appointment confirmed")
        else if (status === "cancelled") toast.success("Appointment declined")
      } else {
        toast.error("Failed to update appointment")
      }
      fetchBookings()
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <ProfileCompletionBanner />
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/70 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
        <p className="text-primary-foreground/80 mb-4">
          You have {upcoming.length} confirmed appointment{upcoming.length !== 1 ? "s" : ""} and {pending.length} pending
          request{pending.length !== 1 ? "s" : ""}.
        </p>
        <div className="flex gap-4">
          <Button variant="secondary" asChild>
            <Link href="/bookings">
              <Calendar className="w-4 h-4 mr-2" />
              View All Bookings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{upcoming.length}</div>
                <div className="text-gray-600">Confirmed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pending.length}</div>
                <div className="text-gray-600">Pending</div>
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
                <div className="text-2xl font-bold text-gray-900">{completed.length}</div>
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
                <div className="text-2xl font-bold text-gray-900">₦{(totalEarnings / 1000).toFixed(0)}k</div>
                <div className="text-gray-600">Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="requests">
                Pending ({pending.length})
                {pending.length > 0 && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {isLoading ? (
                    <div className="text-center py-6 text-gray-500 text-sm">Loading...</div>
                  ) : upcoming.length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No upcoming appointments</p>
                    </div>
                  ) : (
                    upcoming.map((b) => (
                      <div key={b._id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{b.caregiverId?.name || "Caregiver"}</h4>
                            <Badge variant="default" className="text-xs">confirmed</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{b.caregiverId?.email}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(b.date).toLocaleString("en-US", {
                                month: "short", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                            <span>{b.duration} min</span>
                            <span className="capitalize">{b.consultationType}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {pending.length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No pending requests</p>
                    </div>
                  ) : (
                    pending.map((b) => (
                      <div key={b._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{b.caregiverId?.name || "Caregiver"}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(b.date).toLocaleString("en-US", {
                                month: "short", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })} · {b.duration} min · {b.consultationType}
                            </p>
                            {b.notes && <p className="text-sm text-gray-700 mt-2">{b.notes}</p>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={updatingId === b._id}
                            onClick={() => updateBookingStatus(b._id, "confirmed")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 bg-transparent"
                            disabled={updatingId === b._id}
                            onClick={() => updateBookingStatus(b._id, "cancelled")}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                <Link href="/bookings">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View All Bookings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
