import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  X,
  Eye,
  FileText,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AdminDashboardProps {
  user: User
}

// Mock data - in real app this would come from Supabase
const mockData = {
  stats: {
    totalUsers: 1247,
    totalProfessionals: 89,
    verifiedProfessionals: 67,
    pendingVerifications: 8,
    totalBookings: 2156,
    thisMonthBookings: 234,
    totalRevenue: 12500000,
    thisMonthRevenue: 1850000,
  },
  pendingVerifications: [
    {
      id: "1",
      name: "Dr. Adebayo Ogundimu",
      email: "adebayo.ogundimu@email.com",
      specialization: "Behavioral Therapy",
      location: "Lagos, Nigeria",
      yearsExperience: 8,
      submittedDate: "2024-01-20",
      credentials: ["PhD in Psychology", "Licensed Clinical Psychologist", "ABA Certification"],
      status: "pending",
    },
    {
      id: "2",
      name: "Dr. Kemi Adeleke",
      email: "kemi.adeleke@email.com",
      specialization: "Speech Therapy",
      location: "Abuja, Nigeria",
      yearsExperience: 12,
      submittedDate: "2024-01-18",
      credentials: ["Masters in Speech-Language Pathology", "ASHA Certification"],
      status: "pending",
    },
    {
      id: "3",
      name: "Dr. Ibrahim Yusuf",
      email: "ibrahim.yusuf@email.com",
      specialization: "Occupational Therapy",
      location: "Kano, Nigeria",
      yearsExperience: 6,
      submittedDate: "2024-01-22",
      credentials: ["Masters in Occupational Therapy", "NBCOT Certification"],
      status: "under_review",
    },
  ],
  recentActivity: [
    {
      id: "1",
      type: "verification_approved",
      message: "Dr. Sarah Johnson's verification was approved",
      time: "2 hours ago",
      user: "Admin User",
    },
    {
      id: "2",
      type: "new_registration",
      message: "New professional registration: Dr. Michael Chen",
      time: "4 hours ago",
      user: "System",
    },
    {
      id: "3",
      type: "booking_completed",
      message: "1,000th booking milestone reached",
      time: "1 day ago",
      user: "System",
    },
    {
      id: "4",
      type: "verification_rejected",
      message: "Dr. John Smith's verification was rejected",
      time: "2 days ago",
      user: "Admin User",
    },
  ],
  systemAlerts: [
    {
      id: "1",
      type: "warning",
      message: "8 professional verifications pending for more than 5 days",
      priority: "high",
    },
    {
      id: "2",
      type: "info",
      message: "Monthly booking report is ready for review",
      priority: "medium",
    },
    {
      id: "3",
      type: "success",
      message: "System backup completed successfully",
      priority: "low",
    },
  ],
  topProfessionals: [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialization: "Developmental Pediatrics",
      rating: 4.9,
      bookings: 127,
      revenue: 3175000,
    },
    {
      id: "2",
      name: "Dr. Fatima Hassan",
      specialization: "Occupational Therapy",
      rating: 5.0,
      bookings: 156,
      revenue: 3432000,
    },
    {
      id: "3",
      name: "Dr. Michael Adebayo",
      specialization: "Speech Therapy",
      rating: 4.8,
      bookings: 89,
      revenue: 1780000,
    },
  ],
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-primary-foreground/80 mb-4">
          Welcome back, {user.name}. Here's your platform overview and pending tasks.
        </p>
        <div className="flex gap-4">
          <Button variant="secondary">
            <Shield className="w-4 h-4 mr-2" />
            Review Verifications ({mockData.stats.pendingVerifications})
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockData.stats.totalUsers}</div>
                <div className="text-gray-600">Total Users</div>
                <div className="text-xs text-gray-500">{mockData.stats.totalProfessionals} professionals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockData.stats.verifiedProfessionals}</div>
                <div className="text-gray-600">Verified</div>
                <div className="text-xs text-gray-500">{mockData.stats.pendingVerifications} pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ₦{(mockData.stats.thisMonthRevenue / 1000000).toFixed(1)}M
                </div>
                <div className="text-gray-600">This Month</div>
                <div className="text-xs text-gray-500">
                  Total: ₦{(mockData.stats.totalRevenue / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verification Management */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending Verifications ({mockData.pendingVerifications.length})
                {mockData.pendingVerifications.length > 0 && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Professional Verifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockData.pendingVerifications.map((professional) => (
                    <div key={professional.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{professional.name}</h4>
                            <Badge
                              variant={professional.status === "under_review" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {professional.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{professional.email}</p>
                          <p className="text-sm text-gray-600">
                            {professional.specialization} • {professional.location}
                          </p>
                          <p className="text-sm text-gray-500">
                            {professional.yearsExperience} years experience • Submitted{" "}
                            {new Date(professional.submittedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-2">Credentials:</h5>
                        <div className="flex flex-wrap gap-2">
                          {professional.credentials.map((credential, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {credential}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Review Details
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent System Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockData.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 border-l-4 border-primary/20 bg-gray-50"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{activity.time}</span>
                          <span>•</span>
                          <span>by {activity.user}</span>
                        </div>
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
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.priority === "high"
                      ? "bg-red-50 border-red-200"
                      : alert.priority === "medium"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        alert.priority === "high"
                          ? "bg-red-500"
                          : alert.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    ></div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Professionals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Top Professionals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockData.topProfessionals.map((professional, index) => (
                <div key={professional.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{professional.name}</h4>
                    <p className="text-xs text-gray-600">{professional.specialization}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>⭐ {professional.rating}</span>
                      <span>•</span>
                      <span>{professional.bookings} bookings</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">₦{(professional.revenue / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Reports
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
