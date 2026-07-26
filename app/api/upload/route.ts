import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { createUploadPresignedUrl } from "@/lib/s3"
import { randomUUID } from "crypto"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]

export async function POST(req: NextRequest) {
  return requireAuth(req, async (req, user) => {
    try {
      const { contentType, folder = "general" } = await req.json()

      if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
        return NextResponse.json(
          { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF" },
          { status: 400 }
        )
      }

      const extMap: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }
      const ext = extMap[contentType] || contentType.split("/")[1]
      const key = `${folder}/${user._id}/${randomUUID()}.${ext}`

      const { uploadUrl, publicUrl } = await createUploadPresignedUrl(key, contentType)

      return NextResponse.json({ uploadUrl, publicUrl, key })
    } catch (err) {
      console.error("Upload presign error:", err)
      return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 })
    }
  })
}
