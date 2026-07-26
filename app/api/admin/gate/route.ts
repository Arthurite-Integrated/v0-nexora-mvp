import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  const gate = process.env.ADMIN_GATE_PASSWORD
  if (!gate) {
    return NextResponse.json({ error: "Admin gate not configured" }, { status: 500 })
  }

  if (password !== gate) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
  }

  // Set a short-lived httpOnly cookie so the gate doesn't ask again this session
  const response = NextResponse.json({ ok: true })
  response.cookies.set("admin_gate", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 8, // 8 hours
  })
  return response
}

export async function GET(req: NextRequest) {
  const passed = req.cookies.get("admin_gate")?.value === "1"
  return NextResponse.json({ passed })
}
