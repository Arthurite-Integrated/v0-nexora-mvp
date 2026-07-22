import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Group } from "@/lib/models/Group"
import { GroupMember } from "@/lib/models/GroupMember"
import { requireAuth } from "@/lib/auth-middleware"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (_, user) => {
    await connectDB()

    const group = await Group.findById(params.id)
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 })

    const existing = await GroupMember.findOne({ groupId: params.id, userId: user._id })
    if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 })

    await GroupMember.create({ groupId: params.id, userId: user._id })
    await Group.findByIdAndUpdate(params.id, { $inc: { memberCount: 1 } })

    return NextResponse.json({ message: "Joined successfully" })
  })
}
