import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { updateSignupSheetCareProfile } from "@/lib/notifications"

export async function GET(req: NextRequest) {
  return requireAuth(req, async (_, user) => {
    return NextResponse.json({ user })
  })
}

export async function PATCH(req: NextRequest) {
  return requireAuth(req, async (req, user) => {
    try {
      await connectDB()
      const body = await req.json()

      // Prevent changing protected fields
      delete body.cognitoId
      delete body.email
      delete body.role

      // If locationData is provided, also update the flat location string
      if (body.locationData) {
        const { city, stateName, countryName } = body.locationData
        body.location = [city, stateName, countryName].filter(Boolean).join(", ")
      }

      const updated = await User.findByIdAndUpdate(user._id, body, { new: true }).lean() as {
        role?: string; location?: string
        locationData?: { stateName?: string; countryName?: string }
        careProfile?: { relationship?: string; patientAgeGroup?: string; diagnosisStatus?: string }
      } | null

      // If careProfile was just completed, update the signup sheet row
      if (body.careProfile?.relationship && updated) {
        await updateSignupSheetCareProfile({
          email: user.email,
          relationship: updated.careProfile?.relationship || "",
          patientAgeGroup: updated.careProfile?.patientAgeGroup || "",
          diagnosisStatus: updated.careProfile?.diagnosisStatus || "",
        }).catch(err => console.error("[users/me PATCH] sheet update error:", err))
      }

      return NextResponse.json({ user: updated })
    } catch {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
  })
}
