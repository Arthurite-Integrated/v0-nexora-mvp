import { NextRequest, NextResponse } from "next/server"
import { jwtVerify, createRemoteJWKSet } from "jose"
import { connectDB } from "./mongodb"
import { User, IUser } from "./models/User"

// Lazy — evaluated on first request so env vars are guaranteed to be loaded
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null
function getJWKS() {
  if (!_jwks) {
    const region = process.env.APP_AWS_REGION || "us-east-1"
    const poolId = process.env.COGNITO_USER_POOL_ID!
    _jwks = createRemoteJWKSet(
      new URL(`https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`)
    )
  }
  return _jwks
}

export interface AuthenticatedRequest extends NextRequest {
  user: IUser & { _id: string }
}

export async function requireAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: IUser & { _id: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = req.cookies.get("idToken")?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const region = process.env.APP_AWS_REGION || "us-east-1"
    const poolId = process.env.COGNITO_USER_POOL_ID!
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: `https://cognito-idp.${region}.amazonaws.com/${poolId}`,
      audience: process.env.COGNITO_CLIENT_ID!,
    })

    const cognitoId = payload.sub as string

    await connectDB()
    const user = await User.findOne({ cognitoId }).lean() as unknown as (IUser & { _id: string }) | null

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    return handler(req, user)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[auth-middleware] JWT verification failed:", msg)
    return NextResponse.json({ error: "Invalid or expired token", detail: msg }, { status: 401 })
  }
}

export async function requireAdmin(
  req: NextRequest,
  handler: (req: NextRequest, user: IUser & { _id: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(req, async (req, user) => {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return handler(req, user)
  })
}
