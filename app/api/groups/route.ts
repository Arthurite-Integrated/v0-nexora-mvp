import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Group } from "@/lib/models/Group"
import { GroupMember } from "@/lib/models/GroupMember"
import { requireAuth, requireAdmin } from "@/lib/auth-middleware"

export async function GET(req: NextRequest) {
  return requireAuth(req, async (req, user) => {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")

    const query: Record<string, unknown> = {}
    if (category) query.category = category

    const groups = await Group.find(query).sort({ memberCount: -1 }).lean()

    // For each group, check if this user is a member
    const groupIds = groups.map(g => g._id)
    const memberships = await GroupMember.find({ userId: user._id, groupId: { $in: groupIds } }).lean()
    const memberSet = new Set(memberships.map(m => (m.groupId as unknown as { toString(): string }).toString()))

    const enriched = groups.map(g => ({
      ...g,
      isMember: memberSet.has((g._id as unknown as { toString(): string }).toString()),
    }))

    return NextResponse.json({ groups: enriched })
  })
}

export async function POST(req: NextRequest) {
  return requireAdmin(req, async (req, user) => {
    await connectDB()
    const body = await req.json()
    const { name, description, category, tags, coverColor } = body

    if (!name || !description || !category) {
      return NextResponse.json({ error: "name, description, and category are required" }, { status: 400 })
    }

    const group = await Group.create({ name, description, category, tags: tags || [], coverColor: coverColor || "teal", createdBy: user._id })
    return NextResponse.json({ group }, { status: 201 })
  })
}
