import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { connectDB } from "@/lib/mongodb"
import { Booking } from "@/lib/models/Booking"
import { User } from "@/lib/models/User"
import { Professional } from "@/lib/models/Professional"
import { ResearchEvent } from "@/lib/models/ResearchEvent"
import { requireAuth } from "@/lib/auth-middleware"
import {
  sendBookingConfirmedCaregiver,
  sendBookingDeclinedCaregiver,
  updateSheetBookingStatus,
  appendResearchEventToSheet,
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

      const { status, confirmedConcern } = await req.json()
      const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"]
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }

      const previousStatus = booking.status
      booking.status = status

      // Save confirmedConcern when professional marks complete
      if (status === "completed" && confirmedConcern) {
        booking.confirmedConcern = confirmedConcern
      }

      await booking.save()

      // ── Notifications on meaningful status changes ────────────────────────
      if (status !== previousStatus && (status === "confirmed" || status === "cancelled")) {
        const populatedBooking = await Booking.findById(params.id)
          .populate("professionalId", "name specialization email userId consultationFee location")
          .populate("caregiverId", "name email")
          .lean() as unknown as {
            _id: { toString(): string }
            date: Date
            duration: number
            consultationType: string
            fee: number
            notes?: string
            presentingConcern?: string
            confirmedConcern?: string
            professionalId: { name: string; specialization: string; email: string; userId: string; location?: string }
            caregiverId: { name: string; email: string; _id: { toString(): string } }
          } | null

        if (populatedBooking) {
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

          // Sheet must be awaited before Lambda returns
          await updateSheetBookingStatus(params.id, status).catch(err =>
            console.error("[bookings/PATCH] sheet error:", err)
          )
          // Email in background — non-critical
          const emailFn = status === "confirmed" ? sendBookingConfirmedCaregiver : sendBookingDeclinedCaregiver
          emailFn(emailData).catch(() => {})
        }
      } else if (status !== previousStatus) {
        await updateSheetBookingStatus(params.id, status).catch(() => {})
      }

      // ── ResearchEvent on terminal states ─────────────────────────────────
      if (status !== previousStatus && (status === "completed" || status === "cancelled")) {
        try {
          const populated = await Booking.findById(params.id)
            .populate("professionalId", "specialization location")
            .populate("caregiverId", "_id")
            .lean() as unknown as {
              _id: { toString(): string }
              date: Date
              consultationType: string
              presentingConcern?: string
              confirmedConcern?: string
              professionalId: { specialization: string; location?: string }
              caregiverId: { _id: { toString(): string } }
            } | null

          if (populated) {
            const salt = process.env.RESEARCH_PSEUDONYM_SALT || "nexora-salt"
            const pseudoId = createHash("sha256")
              .update(populated.caregiverId._id.toString() + salt)
              .digest("hex")

            // Extract state from "City, State, Country" location string
            const locationParts = (populated.professionalId.location || "").split(",").map(s => s.trim())
            const state = locationParts.length >= 2 ? locationParts[locationParts.length - 2] : (locationParts[0] || "")

            const researchDoc = {
              bookingId: params.id,
              pseudoCaregiverId: pseudoId,
              specialization: populated.professionalId.specialization,
              state,
              consultationType: populated.consultationType,
              outcome: status as "completed" | "cancelled",
              sessionDate: new Date(populated.date),
              presentingConcern: populated.presentingConcern as never || undefined,
              confirmedConcern: populated.confirmedConcern as never || undefined,
            }

            await ResearchEvent.findOneAndUpdate(
              { bookingId: params.id },
              researchDoc,
              { upsert: true, new: true }
            )

            await appendResearchEventToSheet(researchDoc).catch(err =>
              console.error("[bookings/PATCH] research sheet error:", err)
            )
          }
        } catch (researchErr) {
          console.error("[bookings/PATCH] ResearchEvent error:", researchErr)
          // Non-fatal — don't fail the booking update
        }
      }

      return NextResponse.json({ booking })
    } catch {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
    }
  })
}
