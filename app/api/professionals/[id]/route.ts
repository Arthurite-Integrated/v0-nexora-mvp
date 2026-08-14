import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"
import { Review } from "@/lib/models/Review"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const professional = await Professional.findById(params.id).lean()
    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 })
    }

    const reviews = await Review.find({ professionalId: params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("caregiverId", "name profileImage")
      .lean()

    return NextResponse.json({ professional, reviews })
  } catch {
    return NextResponse.json({ error: "Failed to fetch professional" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (req, user) => {
    try {
      await connectDB()

      const professional = await Professional.findById(params.id)
      if (!professional) {
        return NextResponse.json({ error: "Professional not found" }, { status: 404 })
      }

      // Only the professional who owns the profile or an admin can update it
      if (professional.userId.toString() !== user._id.toString() && user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const body = await req.json()
      // Prevent overwriting protected fields — credentialDocs/credentialVerified managed via /documents route
      delete body.userId
      delete body.isVerified
      delete body.verificationStatus
      delete body.averageRating
      delete body.reviewCount
      delete body.credentialDocs
      delete body.credentialVerified

      const updated = await Professional.findByIdAndUpdate(params.id, body, { new: true }).lean()
      return NextResponse.json({ professional: updated })
    } catch {
      return NextResponse.json({ error: "Failed to update professional" }, { status: 500 })
    }
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (_, user) => {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await connectDB()
    await Professional.findByIdAndDelete(params.id)
    return NextResponse.json({ message: "Deleted" })
  })
}
