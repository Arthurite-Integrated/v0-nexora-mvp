import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(req, async (req) => {
    try {
      await connectDB()

      const { verificationStatus } = await req.json()
      const allowed = ["pending", "under_review", "verified", "rejected"]
      if (!allowed.includes(verificationStatus)) {
        return NextResponse.json({ error: "Invalid verification status" }, { status: 400 })
      }

      const professional = await Professional.findByIdAndUpdate(
        params.id,
        {
          verificationStatus,
          isVerified: verificationStatus === "verified",
        },
        { new: true }
      ).lean()

      if (!professional) return NextResponse.json({ error: "Not found" }, { status: 404 })

      return NextResponse.json({ professional })
    } catch {
      return NextResponse.json({ error: "Failed to update verification" }, { status: 500 })
    }
  })
}
