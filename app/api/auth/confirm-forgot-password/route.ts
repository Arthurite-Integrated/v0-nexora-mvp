import { NextRequest, NextResponse } from "next/server"
import { cognitoConfirmForgotPassword } from "@/lib/cognito"

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, code, and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    await cognitoConfirmForgotPassword(email, code, newPassword)

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string }
    if (error.name === "CodeMismatchException" || error.name === "ExpiredCodeException") {
      return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 })
    }
    if (error.name === "InvalidPasswordException") {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with uppercase, lowercase, and numbers" },
        { status: 400 }
      )
    }
    console.error("Confirm forgot password error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
