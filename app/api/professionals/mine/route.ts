import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"

export async function GET(req: NextRequest) {
  return requireAuth(req, async (_, user) => {
    await connectDB()
    const professional = await Professional.findOne({ userId: user._id }).lean()
    return NextResponse.json({ professional: professional || null })
  })
}

export async function PATCH(req: NextRequest) {
  return requireAuth(req, async (req, user) => {
    if (user.role !== "professional") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    try {
      await connectDB()
      const body = await req.json()

      // Prevent overwriting protected fields
      delete body.userId
      delete body.isVerified
      delete body.verificationStatus
      delete body.averageRating
      delete body.reviewCount

      const professional = await Professional.findOneAndUpdate(
        { userId: user._id },
        { $set: body },
        { new: true, upsert: false }
      ).lean()

      if (!professional) {
        return NextResponse.json({ error: "Professional profile not found" }, { status: 404 })
      }

      return NextResponse.json({ professional })
    } catch {
      return NextResponse.json({ error: "Failed to update professional profile" }, { status: 500 })
    }
  })
}
