"use client"

import { useState, useEffect, useCallback } from "react"
import { BookingCard } from "@/components/booking-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Plus, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { BackButton } from "@/components/back-button"
import { toast } from "sonner"
import { IDD_CONCERN_LABELS, IDD_CONCERNS } from "@/lib/constants/idd-concerns"

interface Booking {
  _id: string
  date: string
  duration: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  consultationType: string
  fee: number
  notes?: string
  professionalId: {
    _id: string
    name: string
    specialization: string
    profileImage?: string
    location?: string
    consultationFee: number
  }
  hasReview?: boolean
  caregiverId: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
}

export default function BookingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<{ id: string; name: string } | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [completeTarget, setCompleteTarget] = useState<string | null>(null)  // bookingId pending completion
  const [confirmedConcern, setConfirmedConcern] = useState("")

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const fetchBookings = useCallback(async () => {
    if (!user) return
    fetch("/api/bookings?limit=50")
      .then(r => r.json())
      .then(d => setBookings(d.bookings || []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const isProfessional = user?.role === "professional"

  // ── Caregiver filters ─────────────────────────────────────────────────────
  const upcoming = bookings.filter(b => b.status === "pending" || b.status === "confirmed")
  const past = bookings.filter(b => b.status === "completed" || b.status === "cancelled")

  // ── Professional filters ──────────────────────────────────────────────────
  const pendingRequests = bookings.filter(b => b.status === "pending")
  const confirmedBookings = bookings.filter(b => b.status === "confirmed")
  const completedBookings = bookings.filter(b => b.status === "completed")

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCancelBooking = async () => {
    if (!cancelTarget) return
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${cancelTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === cancelTarget.id ? { ...b, status: "cancelled" } : b))
        toast.success("Appointment cancelled")
      } else toast.error("Failed to cancel appointment")
    } finally {
      setIsCancelling(false)
      setCancelTarget(null)
    }
  }

  const handleUpdateStatus = async (id: string, status: "confirmed" | "cancelled" | "completed", concern?: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(concern ? { confirmedConcern: concern } : {}) }),
      })
      if (res.ok) {
        const labels = { confirmed: "Appointment confirmed", cancelled: "Appointment declined", completed: "Marked as completed" }
        toast.success(labels[status])
        fetchBookings()
      } else toast.error("Failed to update appointment")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleMarkComplete = (bookingId: string) => {
    setConfirmedConcern("")
    setCompleteTarget(bookingId)
  }

  const handleSubmitComplete = async () => {
    if (!completeTarget) return
    await handleUpdateStatus(completeTarget, "completed", confirmedConcern || undefined)
    setCompleteTarget(null)
    setConfirmedConcern("")
  }

  const toCardFormat = (b: Booking) => ({
    id: b._id,
    professionalId: b.professionalId?._id,
    professionalName: b.professionalId?.name || "Unknown",
    professionalSpecialization: b.professionalId?.specialization || "",
    professionalImage: b.professionalId?.profileImage || null,
    date: b.date.split("T")[0],
    time: new Date(b.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    duration: b.duration,
    status: b.status,
    patientName: b.caregiverId?.name || user?.name || "",
    fee: b.fee,
    notes: b.notes,
    hasReview: b.hasReview || false,
  })

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton fallback="/dashboard" label="Dashboard" className="mb-6" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isProfessional ? "Appointments" : "My Bookings"}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {isProfessional
                  ? "Manage incoming requests and your confirmed schedule"
                  : "Manage your appointments and consultation history"}
              </p>
            </div>
            {!isProfessional && (
              <Button asChild className="w-full sm:w-auto shrink-0">
                <Link href="/professionals" className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Book Appointment
                </Link>
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {isProfessional ? (
              <>
                <StatCard icon={<Clock className="w-5 h-5 text-yellow-600" />} iconBg="bg-yellow-100" value={pendingRequests.length} label="Pending requests" />
                <StatCard icon={<Calendar className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" value={confirmedBookings.length} label="Confirmed" />
                <StatCard icon={<CheckCircle className="w-5 h-5 text-green-600" />} iconBg="bg-green-100" value={completedBookings.length} label="Completed" />
              </>
            ) : (
              <>
                <StatCard icon={<Calendar className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" value={upcoming.length} label="Upcoming" />
                <StatCard icon={<CheckCircle className="w-5 h-5 text-green-600" />} iconBg="bg-green-100" value={completedBookings.length} label="Completed" />
              </>
            )}
          </div>

          {/* Content */}
          {isProfessional ? (
            // ── Professional view ────────────────────────────────────────
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Requests
                  {pendingRequests.length > 0 && (
                    <span className="ml-1.5 w-4 h-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center shrink-0">
                      {pendingRequests.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
                <TabsTrigger value="past">Past ({completedBookings.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <EmptyState icon={<Clock className="w-10 h-10" />} title="No pending requests" subtitle="New booking requests will appear here" />
                ) : (
                  pendingRequests.map(b => (
                    <Card key={b._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-semibold text-muted-foreground">
                            {b.caregiverId?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{b.caregiverId?.name || "Caregiver"}</p>
                            <p className="text-xs text-muted-foreground">{b.caregiverId?.email}</p>
                          </div>
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 shrink-0">Pending</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(b.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(b.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span>{b.duration} min</span>
                          <span className="capitalize">{b.consultationType}</span>
                        </div>
                        {b.notes && <p className="text-xs text-muted-foreground bg-muted/40 rounded px-2.5 py-2 mb-3 line-clamp-2">{b.notes}</p>}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs bg-primary text-primary-foreground"
                            disabled={updatingId === b._id}
                            onClick={() => handleUpdateStatus(b._id, "confirmed")}
                          >
                            {updatingId === b._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs text-destructive border-destructive/30 bg-transparent"
                            disabled={updatingId === b._id}
                            onClick={() => handleUpdateStatus(b._id, "cancelled")}
                          >
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="confirmed" className="space-y-3">
                {confirmedBookings.length === 0 ? (
                  <EmptyState icon={<Calendar className="w-10 h-10" />} title="No confirmed appointments" subtitle="Confirmed bookings will appear here" />
                ) : (
                  confirmedBookings.map(b => (
                    <Card key={b._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                            {b.caregiverId?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{b.caregiverId?.name || "Caregiver"}</p>
                            <p className="text-xs text-muted-foreground">{b.caregiverId?.email}</p>
                          </div>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 shrink-0">Confirmed</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(b.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(b.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span>{b.duration} min</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-primary text-primary-foreground"
                            disabled={updatingId === b._id}
                            onClick={() => handleMarkComplete(b._id)}
                          >
                            Mark Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-destructive border-destructive/30 bg-transparent"
                            disabled={updatingId === b._id}
                            onClick={() => handleUpdateStatus(b._id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-3">
                {completedBookings.length === 0 ? (
                  <EmptyState icon={<CheckCircle className="w-10 h-10" />} title="No completed sessions" subtitle="Completed appointments will appear here" />
                ) : (
                  completedBookings.map(b => (
                    <Card key={b._id} className="opacity-80">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-semibold text-muted-foreground">
                            {b.caregiverId?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{b.caregiverId?.name || "Caregiver"}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              <span>₦{b.fee.toLocaleString()}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 shrink-0">Done</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          ) : (
            // ── Caregiver view ───────────────────────────────────────────
            <Tabs defaultValue="upcoming" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
                <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-3">
                {upcoming.length === 0 ? (
                  <EmptyState
                    icon={<Calendar className="w-10 h-10" />}
                    title="No upcoming appointments"
                    subtitle="Book a consultation with one of our verified professionals"
                    cta={<Button asChild><Link href="/professionals">Find a Professional</Link></Button>}
                  />
                ) : (
                  upcoming.map(b => (
                    <BookingCard
                      key={b._id}
                      booking={toCardFormat(b)}
                      onCancel={b.status === "pending" ? () => setCancelTarget({ id: b._id, name: b.professionalId?.name || "appointment" }) : undefined}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-3">
                {past.length === 0 ? (
                  <EmptyState icon={<Clock className="w-10 h-10" />} title="No past appointments" subtitle="Your completed and cancelled appointments will appear here" />
                ) : (
                  past.map(b => <BookingCard key={b._id} booking={toCardFormat(b)} />)
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
        title="Cancel appointment?"
        description={`Cancel your appointment with ${cancelTarget?.name}? This cannot be undone.`}
        confirmLabel="Yes, cancel it"
        variant="destructive"
        onConfirm={handleCancelBooking}
        isLoading={isCancelling}
      />

      {/* Mark Complete — confirmed concern dialog */}
      <Dialog open={!!completeTarget} onOpenChange={(open) => { if (!open) { setCompleteTarget(null); setConfirmedConcern("") } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark session as complete</DialogTitle>
            <DialogDescription>
              Optionally record the primary concern addressed. This is anonymised and used only for platform research.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Primary concern confirmed <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <select
                value={confirmedConcern}
                onChange={e => setConfirmedConcern(e.target.value)}
                className="w-full border border-input bg-background rounded-md px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select concern category…</option>
                {IDD_CONCERNS.map(c => (
                  <option key={c} value={c}>{IDD_CONCERN_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmitComplete}
              disabled={!!updatingId}
              className="flex-1 bg-primary text-primary-foreground"
            >
              {updatingId ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Mark Complete"}
            </Button>
            <Button variant="outline" onClick={() => { setCompleteTarget(null); setConfirmedConcern("") }}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ icon, iconBg, value, label }: {
  icon: React.ReactNode
  iconBg: string
  value: string | number
  label: string
  small?: boolean
}) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-4">
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, subtitle, cta }: {
  icon: React.ReactNode
  title: string
  subtitle: string
  cta?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="text-muted-foreground/40 flex justify-center mb-3">{icon}</div>
        <h3 className="font-medium text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
        {cta}
      </CardContent>
    </Card>
  )
}
