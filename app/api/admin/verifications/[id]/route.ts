import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"
import { User } from "@/lib/models/User"
import { sendProfessionalApproved, sendProfessionalRejected } from "@/lib/notifications"

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
      ).lean() as { name: string; email: string; userId: string } | null

      if (!professional) return NextResponse.json({ error: "Not found" }, { status: 404 })

      // Send email on approved or rejected
      if (verificationStatus === "verified" || verificationStatus === "rejected") {
        // Prefer the User record email (more reliable than professional.email)
        const proUser = await User.findOne({ _id: professional.userId }, "email").lean() as { email?: string } | null
        const email = proUser?.email || professional.email
        const name = professional.name

        Promise.resolve().then(() =>
          verificationStatus === "verified"
            ? sendProfessionalApproved(email, name)
            : sendProfessionalRejected(email, name)
        ).catch(err => console.error("[verifications/PATCH] email error:", err))
      }

      return NextResponse.json({ professional })
    } catch {
      return NextResponse.json({ error: "Failed to update verification" }, { status: 500 })
    }
  })
}
