import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Booking } from "@/lib/models/Booking"
import { User } from "@/lib/models/User"
import { Professional } from "@/lib/models/Professional"
import { requireAuth } from "@/lib/auth-middleware"
import {
  sendBookingConfirmedCaregiver,
  sendBookingDeclinedCaregiver,
  updateSheetBookingStatus,
  type BookingEmailData,
} from "@/lib/notifications"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (_, user) => {
    await connectDB()
    const booking = await Booking.findById(params.id)
      .populate("professionalId", "name specialization profileImage consultationFee")
      .populate("caregiverId", "name email profileImage")
      .lean()

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const b = booking as unknown as { caregiverId: { _id: { toString(): string } }; professionalId: { _id: { toString(): string } } }
    const isOwner =
      b.caregiverId._id.toString() === user._id.toString() ||
      b.professionalId._id.toString() === user._id.toString() ||
      user.role === "admin"

    if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return NextResponse.json({ booking })
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (req, user) => {
    try {
      await connectDB()
      const booking = await Booking.findById(params.id)
      if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

      const isOwner =
        booking.caregiverId.toString() === user._id.toString() ||
        booking.professionalId.toString() === user._id.toString() ||
        user.role === "admin"

      if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

      const { status } = await req.json()
      const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"]
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }

      const previousStatus = booking.status
      booking.status = status
      await booking.save()

      // Send notifications on meaningful status changes
      if (status !== previousStatus && (status === "confirmed" || status === "cancelled")) {
        const populatedBooking = await Booking.findById(params.id)
          .populate("professionalId", "name specialization email userId consultationFee")
          .populate("caregiverId", "name email")
          .lean() as unknown as {
            _id: { toString(): string }
            date: Date
            duration: number
            consultationType: string
            fee: number
            notes?: string
            professionalId: { name: string; specialization: string; email: string; userId: string }
            caregiverId: { name: string; email: string }
          } | null

        if (populatedBooking) {
          // Try to get professional email from their User record
          const proUser = await User.findById(populatedBooking.professionalId.userId).lean() as { email?: string } | null

          const emailData: BookingEmailData = {
            bookingId: populatedBooking._id.toString(),
            caregiverName: populatedBooking.caregiverId.name,
            caregiverEmail: populatedBooking.caregiverId.email,
            professionalName: populatedBooking.professionalId.name,
            professionalEmail: proUser?.email || populatedBooking.professionalId.email,
            specialization: populatedBooking.professionalId.specialization,
            appointmentDate: new Date(populatedBooking.date),
            duration: populatedBooking.duration,
            consultationType: populatedBooking.consultationType,
            fee: populatedBooking.fee,
            notes: populatedBooking.notes,
          }

          Promise.all([
            status === "confirmed"
              ? sendBookingConfirmedCaregiver(emailData)
              : sendBookingDeclinedCaregiver(emailData),
            updateSheetBookingStatus(params.id, status),
          ]).catch(err => console.error("[bookings/PATCH] notification error:", err))
        }
      } else if (status !== previousStatus) {
        // Still update the sheet for other status changes (completed, etc.)
        updateSheetBookingStatus(params.id, status).catch(() => {})
      }

      return NextResponse.json({ booking })
    } catch {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
    }
  })
}
