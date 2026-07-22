import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { Professional } from "@/lib/models/Professional"
import { Booking } from "@/lib/models/Booking"

export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    await connectDB()

    const [
      totalUsers,
      totalProfessionals,
      verifiedProfessionals,
      pendingVerifications,
      underReviewVerifications,
      totalBookings,
      completedBookings,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ["caregiver", "professional"] } }),
      User.countDocuments({ role: "professional" }),
      Professional.countDocuments({ isVerified: true }),
      Professional.countDocuments({ verificationStatus: "pending" }),
      Professional.countDocuments({ verificationStatus: "under_review" }),
      Booking.countDocuments({}),
      Booking.countDocuments({ status: "completed" }),
    ])

    // Recent pending verifications (up to 5)
    const pendingList = await Professional.find({ verificationStatus: { $in: ["pending", "under_review"] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProfessionals,
        verifiedProfessionals,
        pendingVerifications: pendingVerifications + underReviewVerifications,
        totalBookings,
        completedBookings,
      },
      pendingList,
    })
  })
}
