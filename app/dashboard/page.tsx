"use client"
import { CaregiverDashboard } from "@/components/caregiver-dashboard"
import { ProfessionalDashboard } from "@/components/professional-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Not Authenticated</h2>
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === "caregiver" && <CaregiverDashboard user={{ id: user._id, name: user.name, email: user.email, role: user.role }} />}
        {user.role === "professional" && <ProfessionalDashboard user={{ id: user._id, name: user.name, email: user.email, role: user.role }} />}
        {user.role === "admin" && <AdminDashboard user={{ id: user._id, name: user.name, email: user.email, role: user.role }} />}
        {!user.role && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">No role assigned to your account.</p>
            <p className="text-gray-600">Please contact support for assistance.</p>
          </div>
        )}
      </div>
    </div>
  )
}