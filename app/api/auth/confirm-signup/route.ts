import { NextRequest, NextResponse } from "next/server"
import { cognitoConfirmSignUp, cognitoSignIn, cognitoAddUserToGroup } from "@/lib/cognito"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { appendSignupToSheet } from "@/lib/notifications"

const isProduction = process.env.NODE_ENV === "production"
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
}

export async function POST(req: NextRequest) {
  try {
    const { email, code, password, location, locationData, isSelfAdvocate } = await req.json()

    if (!email || !code || !password) {
      return NextResponse.json({ error: "Email, code, and password are required" }, { status: 400 })
    }

    // Confirm the OTP with Cognito
    await cognitoConfirmSignUp(email, code)

    // Auto sign-in after confirmation
    const result = await cognitoSignIn(email, password)
    const auth = result.AuthenticationResult

    if (!auth?.IdToken || !auth?.AccessToken) {
      return NextResponse.json({ error: "Confirmed but sign-in failed — please sign in manually" }, { status: 500 })
    }

    // Fetch MongoDB user + save location/isSelfAdvocate in the same request
    await connectDB()
    const updateFields: Record<string, unknown> = {}
    if (location) updateFields.location = location
    if (locationData?.country) updateFields.locationData = locationData
    if (isSelfAdvocate) updateFields.isSelfAdvocate = true

    const user = Object.keys(updateFields).length > 0
      ? await User.findOneAndUpdate(
          { email: email.toLowerCase() },
          { $set: updateFields },
          { new: true }
        ).lean() as { role?: string; location?: string; locationData?: { stateName?: string; countryName?: string }; isSelfAdvocate?: boolean } | null
      : await User.findOne({ email: email.toLowerCase() }).lean() as { role?: string } | null

    if (user?.role) {
      const groupMap: Record<string, string> = {
        caregiver: "caregivers",
        professional: "professionals",
        admin: "admins",
      }
      try {
        await cognitoAddUserToGroup(email, groupMap[user.role])
      } catch {
        // non-fatal
      }
    }

    // Now write the sheet with the fully updated user data
    const mongoUser = user as { role?: string; location?: string; locationData?: { stateName?: string; countryName?: string }; isSelfAdvocate?: boolean } | null
    await appendSignupToSheet({
      role: mongoUser?.role || "caregiver",
      state: mongoUser?.locationData?.stateName || mongoUser?.location?.split(",")?.[1]?.trim() || "",
      country: mongoUser?.locationData?.countryName || mongoUser?.location?.split(",")?.pop()?.trim() || "Nigeria",
      isSelfAdvocate: mongoUser?.isSelfAdvocate || false,
    }).catch(err => console.error("[confirm-signup] sheet error:", err))

    const response = NextResponse.json({ message: "Email verified", user }, { status: 200 })
    const maxAge = auth.ExpiresIn || 3600

    response.cookies.set("idToken", auth.IdToken, { ...COOKIE_OPTIONS, maxAge })
    response.cookies.set("accessToken", auth.AccessToken, { ...COOKIE_OPTIONS, maxAge })
    if (auth.RefreshToken) {
      response.cookies.set("refreshToken", auth.RefreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 })
    }

    return response
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string }
    if (error.name === "CodeMismatchException" || error.name === "ExpiredCodeException") {
      return NextResponse.json({ error: "Invalid or expired code. Request a new one." }, { status: 400 })
    }
    if (error.name === "NotAuthorizedException") {
      return NextResponse.json({ error: "This account is already verified." }, { status: 400 })
    }
    console.error("Confirm signup error:", error)
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 })
  }
}
