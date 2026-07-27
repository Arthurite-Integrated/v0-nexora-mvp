import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"
import { requireAuth } from "@/lib/auth-middleware"
import { appendProfessionalToSheet } from "@/lib/notifications"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const specialization = searchParams.get("specialization") || ""   // comma-separated
    const location = searchParams.get("location") || ""               // comma-separated
    const languages = searchParams.get("languages") || ""             // comma-separated
    const verified = searchParams.get("verified")
    const credentialVerified = searchParams.get("credentialVerified")
    const minExperience = parseInt(searchParams.get("minExperience") || "0")
    const maxFee = parseInt(searchParams.get("maxFee") || "0")
    const sortBy = searchParams.get("sortBy") || "rating"
    const limit = parseInt(searchParams.get("limit") || "20")
    const page = parseInt(searchParams.get("page") || "1")

    const query: Record<string, unknown> = {}

    if (verified === "true") query.isVerified = true
    if (credentialVerified === "true") query.credentialVerified = true
    if (minExperience > 0) query.experience = { $gte: minExperience }
    if (maxFee > 0) query.consultationFee = { $lte: maxFee }

    // Specialization — multiple values → $in with case-insensitive match
    if (specialization) {
      const specs = specialization.split(",").map(s => s.trim()).filter(Boolean)
      query.specialization = specs.length === 1
        ? { $regex: specs[0], $options: "i" }
        : { $in: specs.map(s => new RegExp(s, "i")) }
    }

    // Location — multiple cities/states → $or across location field
    if (location) {
      const locs = location.split(",").map(l => l.trim()).filter(Boolean)
      query.location = { $in: locs.map(l => new RegExp(l, "i")) }
    }

    // Languages — professional must speak ALL selected languages
    if (languages) {
      const langs = languages.split(",").map(l => l.trim()).filter(Boolean)
      if (langs.length > 0) query.languages = { $all: langs }
    }

    // Text search across name, specialization, bio, location
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }

    // Sort
    type SortSpec = Record<string, 1 | -1>
    const sortMap: Record<string, SortSpec> = {
      rating:     { credentialVerified: -1, isVerified: -1, averageRating: -1, createdAt: -1 },
      experience: { credentialVerified: -1, experience: -1, createdAt: -1 },
      fee_asc:    { consultationFee: 1, createdAt: -1 },
      fee_desc:   { consultationFee: -1, createdAt: -1 },
    }
    const sort = sortMap[sortBy] ?? sortMap.rating

    const total = await Professional.countDocuments(query)
    const professionals = await Professional.find(query)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort(sort as any)
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

      await appendProfessionalToSheet({
        name: professional.name,
        email: professional.email,
        specialization: professional.specialization,
        location: professional.location || "",
        experience: professional.experience,
        consultationFee: professional.consultationFee,
        languages: professional.languages,
        verificationStatus: professional.verificationStatus,
        credentialVerified: professional.credentialVerified,
      }).catch(err => console.error("[professionals/POST] sheet error:", err))

      return NextResponse.json({ professional }, { status: 201 })
    } catch (err: unknown) {
      console.error("POST /api/professionals error:", err)
      return NextResponse.json({ error: "Failed to create professional profile" }, { status: 500 })
    }
  })
}
