import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { GroupMember } from "@/lib/models/GroupMember"
import { Post } from "@/lib/models/Post"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(req: NextRequest) {
  return requireAuth(req, async (req, user) => {
    await connectDB()

    const memberships = await GroupMember.find({ userId: user._id }).lean()
    const groupIds = memberships.map(m => m.groupId)

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20

    const total = await Post.countDocuments({ groupId: { $in: groupIds } })
    const posts = await Post.find({ groupId: { $in: groupIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("authorId", "name profileImage role")
      .populate("groupId", "name coverColor")
      .lean()

    return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) })
  })
}
