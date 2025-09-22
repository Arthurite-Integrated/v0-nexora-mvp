import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  MessageCircle,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface ProfessionalDashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

// Mock data - in real app this would come from Supabase
const mockData = {
  stats: {
    totalBookings: 127,
    thisMonthBookings: 18,
    totalEarnings: 2750000,
    thisMonthEarnings: 450000,
    averageRating: 4.9,
    totalReviews: 89,
  },
  upcomingAppointments: [
    {
      id: "1",
      patientName: "John D.",
      caregiverName: "Mary Doe",
      date: "2024-01-25",
      time: "10:00 AM",
      duration: 60,
      type: "Initial Assessment",
      status: "confirmed",
    },
    {
      id: "2",
      patientName: "Jane S.",
      caregiverName: "Robert Smith",
      date: "2024-01-25",
      time: "2:00 PM",
      duration: 60,
      type: "Follow-up",
      status: "confirmed",
    },
    {
      id: "3",
      patientName: "Alex J.",
      caregiverName: "Linda Johnson",
      date: "2024-01-26",
      time: "11:00 AM",
      duration: 60,
      type: "Therapy Session",
      status: "pending",
    },
  ],
  pendingRequests: [
    {
      id: "1",
      patientName: "Sarah W.",
      caregiverName: "David Wilson",
      requestedDate: "2024-01-28",
      requestedTime: "3:00 PM",
      reason: "Speech therapy evaluation for 4-year-old with delayed speech development",
      urgency: "routine",
    },
    {
      id: "2",
      patientName: "Michael R.",
      caregiverName: "Jennifer Rodriguez",
      requestedDate: "2024-01-29",
      requestedTime: "10:00 AM",
      reason: "Behavioral assessment and intervention planning",
      urgency: "urgent",
    },
  ],
  recentMessages: [
    {
      id: "1",
      from: "Mary Doe",
      message: "Thank you for the session yesterday. John showed great improvement!",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: "2",
      from: "Robert Smith",
      message: "Could we reschedule tomorrow's appointment to 3 PM?",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: "3",
      from: "Linda Johnson",
      message: "The resources you shared were very helpful. Thank you!",
      time: "1 day ago",
      unread: false,
    },
  ],
  weeklySchedule: [
    { day: "Monday", slots: 6, booked: 4 },
    { day: "Tuesday", slots: 6, booked: 5 },
    { day: "Wednesday", slots: 4, booked: 3 },
    { day: "Thursday", slots: 6, booked: 6 },
    { day: "Friday", slots: 4, booked: 2 },
  ],
}

export function ProfessionalDashboard({ user }: ProfessionalDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Good morning, Dr. {user.name.split(" ").pop()}!</h1>
        <p className="text-primary-foreground/80 mb-4">
          You have {mockData.upcomingAppointments.length} appointments today and {mockData.pendingRequests.length} new
          booking requests.
        </p>
        <div className="flex gap-4">
          <Button variant="secondary">
            <Calendar className="w-4 h-4 mr-2" />
            View Schedule
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Availability
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockData.stats.thisMonthBookings}</div>
                <div className="text-gray-600">This Month</div>
                <div className="text-xs text-gray-500">Total: {mockData.stats.totalBookings}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ₦{(mockData.stats.thisMonthEarnings / 1000).toFixed(0)}k
                </div>
                <div className="text-gray-600">This Month</div>
                <div className="text-xs text-gray-500">Total: ₦{(mockData.stats.totalEarnings / 1000).toFixed(0)}k</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockData.stats.averageRating}</div>
                <div className="text-gray-600">Average Rating</div>
                <div className="text-xs text-gray-500">{mockData.stats.totalReviews} reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">85%</div>
                <div className="text-gray-600">Utilization</div>
                <div className="text-xs text-gray-500">This week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointments & Requests */}
          <Tabs defaultValue="appointments" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments">
                Today's Appointments ({mockData.upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="requests">
                Pending Requests ({mockData.pendingRequests.length})
                {mockData.pendingRequests.length > 0 && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {mockData.upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {/* User icon */}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{appointment.patientName}</h4>
                          <Badge
                            variant={appointment.status === "confirmed" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Caregiver: {appointment.caregiverName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {appointment.time} ({appointment.duration} min)
                          </span>
                          <span>{appointment.type}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {mockData.pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{request.patientName}</h4>
                            <Badge
                              variant={request.urgency === "urgent" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {request.urgency === "urgent" ? (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              {request.urgency}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Caregiver: {request.caregiverName}</p>
                          <p className="text-sm text-gray-500">
                            Requested: {new Date(request.requestedDate).toLocaleDateString()} at {request.requestedTime}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">{request.reason}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button size="sm" variant="outline">
                          Suggest Alternative
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Messages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Recent Messages
              </CardTitle>
              <Badge variant="secondary">{mockData.recentMessages.filter((m) => m.unread).length} new</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.recentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    message.unread ? "bg-primary/5 border border-primary/20" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{message.from}</h4>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View All Messages
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Schedule Overview */}
          <Card>
            <CardHeader>
              <CardTitle>This Week's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.weeklySchedule.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">
                      {day.booked}/{day.slots}
                    </div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(day.booked / day.slots) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Manage Availability
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Block Time Slots
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
