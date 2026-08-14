import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { cognitoSignUp, cognitoAddUserToGroup, cognitoAdminDeleteUser } from "@/lib/cognito"
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider"

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.APP_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
  },
})

export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    await connectDB()
    const admins = await User.find({ role: "admin" }, "name email createdAt").sort({ createdAt: -1 }).lean()
    return NextResponse.json({ admins })
  })
}

export async function POST(req: NextRequest) {
  return requireAdmin(req, async (req) => {
    const { email, name, password } = await req.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: "email, name and password are required" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    try {
      // Create in Cognito using AdminCreateUser (bypasses email verification)
      const result = await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: email,
        TemporaryPassword: password,
        MessageAction: "SUPPRESS",
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" },
          { Name: "name", Value: name },
          { Name: "custom:role", Value: "admin" },
        ],
      }))

      const cognitoId = result.User?.Attributes?.find(a => a.Name === "sub")?.Value
      if (!cognitoId) throw new Error("Failed to get Cognito sub")

      // Set permanent password
      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: email,
        Password: password,
        Permanent: true,
      }))

      // Add to admins group
      await cognitoAddUserToGroup(email, "admins")

      // Create MongoDB profile
      await connectDB()
      const user = await User.create({ cognitoId, email: email.toLowerCase(), name, role: "admin" })

      return NextResponse.json({ user }, { status: 201 })
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string }
      if (e.name === "UsernameExistsException") {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
      }
      console.error("Create admin error:", err)
      return NextResponse.json({ error: e.message || "Failed to create admin" }, { status: 500 })
    }
  })
}

export async function DELETE(req: NextRequest) {
  return requireAdmin(req, async (req, currentUser) => {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })
    if (email === currentUser.email) {
      return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 })
    }

    try {
      await connectDB()
      await cognitoAdminDeleteUser(email)
      await User.findOneAndDelete({ email: email.toLowerCase() })
      return NextResponse.json({ message: "Admin removed" })
    } catch (err: unknown) {
      const e = err as { message?: string }
      return NextResponse.json({ error: e.message || "Failed to remove admin" }, { status: 500 })
    }
  })
}
