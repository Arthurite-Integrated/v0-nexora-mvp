import { NextRequest, NextResponse } from "next/server"
import { cognitoForgotPassword } from "@/lib/cognito"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    await cognitoForgotPassword(email)

    return NextResponse.json({ message: "Password reset code sent to your email" })
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string }
    if (error.name === "UserNotFoundException") {
      // Don't reveal whether email exists
      return NextResponse.json({ message: "Password reset code sent to your email" })
    }
    if (error.name === "LimitExceededException") {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
    }
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Failed to send reset code" }, { status: 500 })
  }
}
