"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Star, X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReviewModal } from "@/components/review-modal"
import Link from "next/link"

interface Booking {
  id: string
  professionalId?: string
  professionalName: string
  professionalSpecialization: string
  professionalImage?: string | null
  date: string
  time: string
  duration: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  patientName: string
  fee: number
  notes?: string | null
  hasReview?: boolean
}

interface BookingCardProps {
  booking: Booking
  onCancel?: () => void
  onReviewed?: () => void
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-50 text-green-700 border-green-200",
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle className="w-3.5 h-3.5" />,
  pending:   <Clock className="w-3.5 h-3.5" />,
  completed: <CheckCircle className="w-3.5 h-3.5" />,
  cancelled: <X className="w-3.5 h-3.5" />,
}

export function BookingCard({ booking, onCancel, onReviewed }: BookingCardProps) {
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewed, setReviewed] = useState(booking.hasReview || false)

  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  })

  const isUpcoming = booking.status === "confirmed" || booking.status === "pending"

  const handleReviewSuccess = () => {
    setReviewed(true)
    onReviewed?.()
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          {/* Row 1 — avatar + name/spec + status badge */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <img
                src={booking.professionalImage || "/placeholder.svg"}
                alt={booking.professionalName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground leading-snug truncate">{booking.professionalName}</h3>
                  <Badge variant="secondary" className="text-xs mt-0.5">{booking.professionalSpecialization}</Badge>
                </div>
                <Badge
                  variant="outline"
                  className={cn("flex items-center gap-1 shrink-0 text-xs whitespace-nowrap", STATUS_STYLES[booking.status])}
                >
                  {STATUS_ICONS[booking.status]}
                  <span className="capitalize">{booking.status}</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Row 2 — date/time/patient details */}
          <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{formattedDate} at {booking.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 shrink-0" />
              <span>Patient: {booking.patientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{booking.duration} min session</span>
            </div>
          </div>

          {booking.notes && (
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2 bg-muted/40 rounded-md px-3 py-2">
              {booking.notes}
            </p>
          )}

          {/* Row 3 — fee + actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
            <div>
              <span className="font-semibold text-foreground">₦{booking.fee.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-1">/ session</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isUpcoming && booking.status === "pending" && onCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancel}
                  className="h-8 px-3 text-xs text-destructive border-destructive/30 hover:bg-destructive/5 bg-transparent"
                >
                  Cancel
                </Button>
              )}

              {booking.status === "completed" && (
                <>
                  {reviewed ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      Reviewed
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs bg-primary text-primary-foreground"
                      onClick={() => setReviewOpen(true)}
                    >
                      <Star className="w-3.5 h-3.5 mr-1" />
                      Leave Review
                    </Button>
                  )}
                  {booking.professionalId && (
                    <Button size="sm" variant="outline" className="h-8 px-3 text-xs" asChild>
                      <Link href={`/book/${booking.professionalId}`}>Book Again</Link>
                    </Button>
                  )}
                </>
              )}

              {booking.status === "cancelled" && booking.professionalId && (
                <Button size="sm" variant="outline" className="h-8 px-3 text-xs" asChild>
                  <Link href={`/book/${booking.professionalId}`}>Book Again</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        bookingId={booking.id}
        professionalName={booking.professionalName}
        onSuccess={handleReviewSuccess}
      />
    </>
  )
}
