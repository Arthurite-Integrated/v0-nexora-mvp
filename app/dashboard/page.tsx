import { CaregiverDashboard } from "@/components/caregiver-dashboard"
import { ProfessionalDashboard } from "@/components/professional-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { redirect } from "next/navigation"

// Mock user data - in real app this would come from Supabase auth
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: "caregiver" as const, // Change this to test different roles: 'caregiver' | 'professional' | 'admin'
}

export default function DashboardPage() {
  // In real app, get user from Supabase auth
  if (!mockUser) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mockUser.role === "caregiver" && <CaregiverDashboard user={mockUser} />}
        {mockUser.role === "professional" && <ProfessionalDashboard user={mockUser} />}
        {mockUser.role === "admin" && <AdminDashboard user={mockUser} />}
      </div>
    </div>
  )
}
