import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { cognitoAdminDeleteUser } from "@/lib/cognito"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { Booking } from "@/lib/models/Booking"

export async function DELETE(req: NextRequest) {
  return requireAuth(req, async (_, user) => {
    try {
      await connectDB()

      // Delete Cognito user
      await cognitoAdminDeleteUser(user.email)

      // Cascade: cancel any pending/confirmed bookings
      await Booking.updateMany(
        {
          $or: [{ caregiverId: user._id }, { professionalId: user._id }],
          status: { $in: ["pending", "confirmed"] },
        },
        { status: "cancelled" }
      )

      // Delete MongoDB profile
      await User.findByIdAndDelete(user._id)

      const response = NextResponse.json({ message: "Account deleted" })
      response.cookies.delete("idToken")
      response.cookies.delete("accessToken")
      response.cookies.delete("refreshToken")
      return response
    } catch (err: unknown) {
      const error = err as { message?: string }
      console.error("Delete account error:", error)
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }
  })
}
