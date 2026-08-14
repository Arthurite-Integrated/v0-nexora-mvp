import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Booking } from "@/lib/models/Booking"
import { Review } from "@/lib/models/Review"
import { Professional } from "@/lib/models/Professional"
import { requireAuth } from "@/lib/auth-middleware"
import { Types } from "mongoose"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (req, user) => {
    try {
      await connectDB()

      const booking = await Booking.findById(params.id)
      if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

      // Only the caregiver who made the booking can review
      if (booking.caregiverId.toString() !== user._id.toString()) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Can only review a completed booking
      if (booking.status !== "completed") {
        return NextResponse.json({ error: "You can only review completed appointments" }, { status: 400 })
      }

      // One review per booking
      const existing = await Review.findOne({ bookingId: params.id })
      if (existing) {
        return NextResponse.json({ error: "You have already reviewed this appointment" }, { status: 409 })
      }

      const { rating, comment } = await req.json()

      if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
      }

      const review = await Review.create({
        professionalId: booking.professionalId,
        caregiverId: user._id,
        bookingId: params.id,
        rating,
        comment: comment?.trim() || "",
      })

      // Recalculate professional's averageRating and reviewCount
      const allReviews = await Review.find({ professionalId: booking.professionalId })
      const reviewCount = allReviews.length
      const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount

      await Professional.findByIdAndUpdate(booking.professionalId, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount,
      })

      return NextResponse.json({ review }, { status: 201 })
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string }
      if (e.code === 11000) {
        return NextResponse.json({ error: "You have already reviewed this appointment" }, { status: 409 })
      }
      console.error("POST /review error:", err)
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
    }
  })
}
