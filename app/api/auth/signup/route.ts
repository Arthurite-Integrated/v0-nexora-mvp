import { NextRequest, NextResponse } from "next/server"
import { cognitoSignUp, cognitoAddUserToGroup } from "@/lib/cognito"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role = "caregiver" } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    const validRoles = ["caregiver", "professional", "admin"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Create Cognito user
    const cognitoResult = await cognitoSignUp(email, password, name, role)
    const cognitoId = cognitoResult.UserSub

    if (!cognitoId) {
      return NextResponse.json({ error: "Failed to create Cognito user" }, { status: 500 })
    }

    // Add to Cognito group
    const groupMap: Record<string, string> = {
      caregiver: "caregivers",
      professional: "professionals",
      admin: "admins",
    }
    try {
      await cognitoAddUserToGroup(email, groupMap[role])
    } catch {
      // Non-fatal if group doesn't exist yet
    }

    // Create MongoDB profile
    await connectDB()
    const user = await User.create({ cognitoId, email, name, role })

    return NextResponse.json(
      {
        message: "Signup successful. Please check your email to verify your account.",
        userId: user._id,
        cognitoId,
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string }
    if (error.name === "UsernameExistsException") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }
    console.error("Signup error:", error)
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 })
  }
}
