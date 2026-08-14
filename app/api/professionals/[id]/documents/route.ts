import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"
import { deleteS3Object } from "@/lib/s3"

const MAX_DOCS = 10
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

// POST — add a credential doc (professional uploads)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (req, user) => {
    await connectDB()

    const professional = await Professional.findById(params.id)
    if (!professional) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (professional.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (professional.credentialDocs.length >= MAX_DOCS) {
      return NextResponse.json({ error: `Maximum ${MAX_DOCS} documents allowed` }, { status: 400 })
    }

    const { url, filename, fileType, s3Key } = await req.json()
    if (!url || !filename || !fileType || !s3Key) {
      return NextResponse.json({ error: "url, filename, fileType and s3Key are required" }, { status: 400 })
    }
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    professional.credentialDocs.push({ url, filename, fileType, s3Key, uploadedAt: new Date(), status: "pending" } as never)
    await professional.save()

    return NextResponse.json({ professional }, { status: 201 })
  })
}

// DELETE — remove a credential doc (professional deletes their own)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (req, user) => {
    await connectDB()

    const professional = await Professional.findById(params.id)
    if (!professional) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (professional.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { docId } = await req.json()
    const doc = professional.credentialDocs.find((d: { _id?: { toString(): string }; status: string; adminNote?: string }) => d._id?.toString() === docId)
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    // Remove from S3
    await deleteS3Object(doc.s3Key).catch(() => {})

    professional.credentialDocs = professional.credentialDocs.filter((d: { _id?: { toString(): string } }) => d._id?.toString() !== docId) as never
    // Recalculate credentialVerified
    professional.credentialVerified = professional.credentialDocs.some((d: { status: string }) => d.status === "approved")
    await professional.save()

    return NextResponse.json({ message: "Document removed" })
  })
}
