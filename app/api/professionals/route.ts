import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const specialization = searchParams.get("specialization") || ""
    const location = searchParams.get("location") || ""
    const verified = searchParams.get("verified")
    const limit = parseInt(searchParams.get("limit") || "20")
    const page = parseInt(searchParams.get("page") || "1")

    const query: Record<string, unknown> = {}

    if (verified === "true") query.isVerified = true
    if (specialization) query.specialization = { $regex: specialization, $options: "i" }
    if (location) query.location = { $regex: location, $options: "i" }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ]
    }

    const total = await Professional.countDocuments(query)
    const professionals = await Professional.find(query)
      .sort({ isVerified: -1, averageRating: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({ professionals, total, page, pages: Math.ceil(total / limit) })
  } catch (err: unknown) {
    console.error("GET /api/professionals error:", err)
    return NextResponse.json({ error: "Failed to fetch professionals" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return requireAuth(req, async (req, user) => {
    if (user.role !== "professional") {
      return NextResponse.json({ error: "Only professionals can create a profile" }, { status: 403 })
    }

    try {
      await connectDB()

      const existing = await Professional.findOne({ userId: user._id })
      if (existing) {
        return NextResponse.json({ error: "Professional profile already exists" }, { status: 409 })
      }

      const body = await req.json()
      const professional = await Professional.create({
        userId: user._id,
        email: user.email,
        name: user.name,
        ...body,
      })

      return NextResponse.json({ professional }, { status: 201 })
    } catch (err: unknown) {
      console.error("POST /api/professionals error:", err)
      return NextResponse.json({ error: "Failed to create professional profile" }, { status: 500 })
    }
  })
}
