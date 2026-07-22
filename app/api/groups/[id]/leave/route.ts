import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Group } from "@/lib/models/Group"
import { GroupMember } from "@/lib/models/GroupMember"
import { requireAuth } from "@/lib/auth-middleware"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (_, user) => {
    await connectDB()
    const deleted = await GroupMember.findOneAndDelete({ groupId: params.id, userId: user._id })
    if (!deleted) return NextResponse.json({ error: "Not a member" }, { status: 400 })
    await Group.findByIdAndUpdate(params.id, { $inc: { memberCount: -1 } })
    return NextResponse.json({ message: "Left group" })
  })
}
