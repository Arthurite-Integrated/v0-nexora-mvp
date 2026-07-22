import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(req: NextRequest) {
  return requireAuth(req, async (_, user) => {
    return NextResponse.json({ user })
  })
}
