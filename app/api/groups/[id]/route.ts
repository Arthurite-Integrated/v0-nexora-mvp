import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Group } from "@/lib/models/Group"
import { GroupMember } from "@/lib/models/GroupMember"
import { requireAuth, requireAdmin } from "@/lib/auth-middleware"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (_, user) => {
    await connectDB()
    const group = await Group.findById(params.id).lean()
    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const membership = await GroupMember.findOne({ groupId: params.id, userId: user._id }).lean() as { role?: string } | null
    return NextResponse.json({ group: { ...group, isMember: !!membership, memberRole: membership?.role || null } })
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(req, async (req) => {
    await connectDB()
    const body = await req.json()
    delete body.createdBy
    const group = await Group.findByIdAndUpdate(params.id, body, { new: true }).lean()
    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ group })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(req, async () => {
    await connectDB()
    await Group.findByIdAndDelete(params.id)
    return NextResponse.json({ message: "Deleted" })
  })
}
