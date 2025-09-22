import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MessageCircle, Star, X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  professionalName: string
  professionalSpecialization: string
  professionalImage: string
  date: string
  time: string
  duration: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  patientName: string
  fee: number
  notes: string
}

interface BookingCardProps {
  booking: Booking
}

export function BookingCard({ booking }: BookingCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <X className="w-4 h-4" />
      default:
        return null
    }
  }

  const isUpcoming = booking.status === "confirmed" || booking.status === "pending"

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Professional Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={booking.professionalImage || "/placeholder.svg"}
                alt={booking.professionalName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.professionalName}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {booking.professionalSpecialization}
                  </Badge>
                </div>
                <Badge variant="outline" className={cn("flex items-center gap-1", getStatusColor(booking.status))}>
                  {getStatusIcon(booking.status)}
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(booking.date)} at {booking.time}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Patient: {booking.patientName}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration: {booking.duration} minutes
                </div>
              </div>

              {booking.notes && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  <strong>Notes:</strong> {booking.notes}
                </p>
              )}
            </div>
          </div>

          {/* Actions & Fee */}
          <div className="flex flex-col justify-between items-end gap-4 lg:w-48">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">₦{booking.fee.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Consultation fee</div>
            </div>

            <div className="flex flex-col gap-2 w-full lg:w-auto">
              {isUpcoming && (
                <>
                  <Button size="sm" className="w-full lg:w-32">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="w-full lg:w-32 bg-transparent">
                    Reschedule
                  </Button>
                  {booking.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full lg:w-32 text-red-600 hover:text-red-700 bg-transparent"
                    >
                      Cancel
                    </Button>
                  )}
                </>
              )}

              {booking.status === "completed" && (
                <>
                  <Button size="sm" className="w-full lg:w-32">
                    <Star className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                  <Button variant="outline" size="sm" className="w-full lg:w-32 bg-transparent">
                    Book Again
                  </Button>
                </>
              )}

              {booking.status === "cancelled" && (
                <Button size="sm" className="w-full lg:w-32">
                  Book Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
