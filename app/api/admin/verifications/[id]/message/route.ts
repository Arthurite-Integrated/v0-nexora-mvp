import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"
import { User } from "@/lib/models/User"
import { sendProfessionalComplianceMessage } from "@/lib/notifications"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(req, async (req) => {
    try {
      await connectDB()

      const { subject, message } = await req.json()
      const cleanSubject = typeof subject === "string" ? subject.trim() : ""
      const cleanMessage = typeof message === "string" ? message.trim() : ""

      if (!cleanMessage || cleanMessage.length < 10) {
        return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 })
      }

      const professional = await Professional.findById(params.id, "name email userId").lean() as {
        name: string
        email: string
        userId: string
      } | null

      if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 })

      const proUser = await User.findOne({ _id: professional.userId }, "email").lean() as { email?: string } | null
      const email = proUser?.email || professional.email

      await sendProfessionalComplianceMessage({
        professionalEmail: email,
        professionalName: professional.name,
        subject: cleanSubject || "Clarification Needed for Your Nexora Professional Review",
        message: cleanMessage,
      })

      return NextResponse.json({ ok: true })
    } catch (err) {
      console.error("[admin/verifications/message] error:", err)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
  })
}
