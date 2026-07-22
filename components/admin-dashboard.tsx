"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, UserCheck, AlertTriangle, Calendar, Shield, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface AdminDashboardProps {
  user: { id: string; name: string; email: string; role: string }
}

interface Stats {
  totalUsers: number
  totalProfessionals: number
  verifiedProfessionals: number
  pendingVerifications: number
  totalBookings: number
  completedBookings: number
}

interface PendingPro {
  _id: string
  name: string
  specialization: string
  verificationStatus: string
  createdAt: string
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingList, setPendingList] = useState<PendingPro[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => {
        setStats(d.stats)
        setPendingList(d.pendingList || [])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary/70 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-primary-foreground/80 text-sm">Welcome back, {user.name}</p>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={<Users className="w-5 h-5 text-primary" />} bg="bg-primary/10" value={stats.totalUsers} label="Total Users" />
          <StatCard icon={<UserCheck className="w-5 h-5 text-green-600" />} bg="bg-green-100" value={stats.verifiedProfessionals} label="Verified Professionals" sub={`${stats.totalProfessionals} total`} />
          <StatCard icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />} bg="bg-yellow-100" value={stats.pendingVerifications} label="Pending Verifications" highlight={stats.pendingVerifications > 0} />
          <StatCard icon={<Calendar className="w-5 h-5 text-primary" />} bg="bg-primary/10" value={stats.totalBookings} label="Total Bookings" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-green-600" />} bg="bg-green-100" value={stats.completedBookings} label="Completed Sessions" />
          <StatCard icon={<Shield className="w-5 h-5 text-primary" />} bg="bg-primary/10" value={stats.totalProfessionals} label="Professionals" />
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mb-3" />
            <h3 className="font-semibold mb-1">Review Verifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {stats?.pendingVerifications ?? "—"} application{stats?.pendingVerifications !== 1 ? "s" : ""} awaiting review
            </p>
            <Button size="sm" asChild className="w-full">
              <Link href="/admin/verifications">Review Now</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Manage Communities</h3>
            <p className="text-sm text-muted-foreground mb-4">Create and manage support groups</p>
            <Button size="sm" variant="outline" asChild className="w-full">
              <Link href="/admin/communities">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <Shield className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">All Professionals</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse the full professionals directory</p>
            <Button size="sm" variant="outline" asChild className="w-full">
              <Link href="/professionals">Browse</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending verifications list */}
      {pendingList.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Button size="sm" variant="outline" asChild>
              <Link href="/admin/verifications">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingList.map(pro => (
              <div key={pro._id} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{pro.name}</p>
                  <p className="text-xs text-muted-foreground">{pro.specialization}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-xs ${pro.verificationStatus === "under_review" ? "text-blue-600 border-blue-200 bg-blue-50" : "text-yellow-600 border-yellow-200 bg-yellow-50"}`}
                  >
                    {pro.verificationStatus.replace("_", " ")}
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
                    <Link href={`/admin/verifications/${pro._id}`}>Review</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ icon, bg, value, label, sub, highlight }: {
  icon: React.ReactNode
  bg: string
  value: number
  label: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? "border-yellow-300" : ""}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
            {sub && <div className="text-xs text-muted-foreground/60">{sub}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
