import { NextRequest, NextResponse } from "next/server"
import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider"

const client = new CognitoIdentityProviderClient({
  region: process.env.APP_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    await client.send(new ResendConfirmationCodeCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
    }))

    return NextResponse.json({ message: "A new code has been sent to your email" })
  } catch (err: unknown) {
    const error = err as { name?: string }
    if (error.name === "LimitExceededException") {
      return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 })
    }
    return NextResponse.json({ error: "Failed to resend code" }, { status: 500 })
  }
}
