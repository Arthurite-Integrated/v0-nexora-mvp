import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Booking } from "@/lib/models/Booking"
import { Professional } from "@/lib/models/Professional"
import { User } from "@/lib/models/User"
import { requireAuth } from "@/lib/auth-middleware"
import {
  sendBookingRequestedCaregiver,
  sendBookingRequestedProfessional,
  appendBookingToSheet,
  type BookingEmailData,
} from "@/lib/notifications"

export async function GET(req: NextRequest) {
  return requireAuth(req, async (req, user) => {
    try {
      await connectDB()

      const { searchParams } = new URL(req.url)
      const status = searchParams.get("status")
      const limit = parseInt(searchParams.get("limit") || "20")
      const page = parseInt(searchParams.get("page") || "1")

      const query: Record<string, unknown> =
        user.role === "professional"
          ? { professionalId: user._id }
          : { caregiverId: user._id }

      if (status) query.status = status

      const total = await Booking.countDocuments(query)
      const bookings = await Booking.find(query)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("professionalId", "name specialization profileImage location consultationFee")
        .populate("caregiverId", "name email profileImage")
        .lean()

      return NextResponse.json({ bookings, total, page, pages: Math.ceil(total / limit) })
    } catch (err: unknown) {
      console.error("GET /api/bookings error:", err)
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }
  })
}

export async function POST(req: NextRequest) {
  return requireAuth(req, async (req, user) => {
    if (user.role !== "caregiver") {
      return NextResponse.json({ error: "Only caregivers can create bookings" }, { status: 403 })
    }

    try {
      await connectDB()

      const body = await req.json()
      const { professionalId, date, consultationType, notes, duration } = body

      if (!professionalId || !date) {
        return NextResponse.json({ error: "professionalId and date are required" }, { status: 400 })
      }

      const professional = await Professional.findById(professionalId)
      if (!professional) {
        return NextResponse.json({ error: "Professional not found" }, { status: 404 })
      }

      const booking = await Booking.create({
        professionalId,
        caregiverId: user._id,
        date: new Date(date),
        duration: duration || 60,
        consultationType: consultationType || "video",
        notes,
        fee: professional.consultationFee,
        status: "pending",
      })

      // Fetch professional's user record to get their email
      const professionalUser = await User.findById(professional.userId).lean() as { email?: string } | null

      const emailData: BookingEmailData = {
        bookingId: booking._id.toString(),
        caregiverName: user.name,
        caregiverEmail: user.email,
        professionalName: professional.name,
        professionalEmail: professionalUser?.email || professional.email,
        specialization: professional.specialization,
        appointmentDate: new Date(date),
        duration: duration || 60,
        consultationType: consultationType || "video",
        fee: professional.consultationFee,
        notes,
      }

      // Fire emails + sheet in background — don't await so response is fast
      Promise.all([
        sendBookingRequestedCaregiver(emailData),
        sendBookingRequestedProfessional(emailData),
        appendBookingToSheet(emailData),
      ]).catch(err => console.error("[bookings/POST] notification error:", err))

      return NextResponse.json({ booking }, { status: 201 })
    } catch (err: unknown) {
      console.error("POST /api/bookings error:", err)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }
  })
}
