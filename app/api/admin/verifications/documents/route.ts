import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"

// GET — list all professionals with pending credential docs
export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "pending"

    const professionals = await Professional.find({
      "credentialDocs.status": status,
    }, "name email specialization location credentialDocs credentialVerified verificationStatus createdAt")
      .sort({ createdAt: -1 })
      .lean()

    // Only return docs matching the requested status for clarity
    const filtered = professionals.map((p) => ({
      ...p,
      credentialDocs: (p.credentialDocs as Array<{ status: string }>).filter((d) => d.status === status),
    }))

    return NextResponse.json({ professionals: filtered })
  })
}

// PATCH — update the status of a specific doc
// body: { professionalId, docId, status: "approved"|"rejected"|"more_info", adminNote? }
export async function PATCH(req: NextRequest) {
  return requireAdmin(req, async (req) => {
    await connectDB()

    const { professionalId, docId, status, adminNote } = await req.json()

    if (!professionalId || !docId || !status) {
      return NextResponse.json({ error: "professionalId, docId and status are required" }, { status: 400 })
    }
    const allowed = ["approved", "rejected", "more_info"]
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const professional = await Professional.findById(professionalId)
    if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 })

    const doc = professional.credentialDocs.find((d: { _id?: { toString(): string }; status: string; adminNote?: string }) => d._id?.toString() === docId)
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    doc.status = status as "approved" | "rejected" | "more_info"
    if (adminNote) doc.adminNote = adminNote

    // credentialVerified = true when at least one doc is approved
    professional.credentialVerified = professional.credentialDocs.some((d: { status: string }) => d.status === "approved")

    await professional.save()

    return NextResponse.json({ professional })
  })
}
