import { NextRequest, NextResponse } from "next/server"
import { cognitoSignIn } from "@/lib/cognito"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"

const isProduction = process.env.NODE_ENV === "production"
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await cognitoSignIn(email, password)
    const auth = result.AuthenticationResult

    if (!auth?.IdToken || !auth?.AccessToken) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Fetch user profile from MongoDB
    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase() }).lean()

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const response = NextResponse.json({ user }, { status: 200 })

    // Store tokens in httpOnly cookies
    const maxAge = auth.ExpiresIn || 3600
    response.cookies.set("idToken", auth.IdToken, { ...COOKIE_OPTIONS, maxAge })
    response.cookies.set("accessToken", auth.AccessToken, { ...COOKIE_OPTIONS, maxAge })
    if (auth.RefreshToken) {
      response.cookies.set("refreshToken", auth.RefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60,
      })
    }

    return response
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string }
    if (
      error.name === "NotAuthorizedException" ||
      error.name === "UserNotFoundException"
    ) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 })
    }
    if (error.name === "UserNotConfirmedException") {
      return NextResponse.json(
        { error: "Please verify your email before signing in", code: "EMAIL_NOT_VERIFIED" },
        { status: 403 }
      )
    }
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
