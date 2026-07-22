import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Group } from "@/lib/models/Group"
import { GroupMember } from "@/lib/models/GroupMember"
import { Post } from "@/lib/models/Post"
import { requireAuth } from "@/lib/auth-middleware"

async function assertMember(groupId: string, userId: string) {
  const m = await GroupMember.findOne({ groupId, userId })
  return !!m
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (req, user) => {
    await connectDB()

    const isMember = await assertMember(params.id, user._id.toString())
    if (!isMember) return NextResponse.json({ error: "Join this group to view posts" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 15

    const total = await Post.countDocuments({ groupId: params.id })
    const posts = await Post.find({ groupId: params.id })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("authorId", "name profileImage role")
      .lean()

    return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) })
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (req, user) => {
    await connectDB()

    const isMember = await assertMember(params.id, user._id.toString())
    if (!isMember) return NextResponse.json({ error: "Join this group to post" }, { status: 403 })

    const { title, body } = await req.json()
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
    }

    const post = await Post.create({ groupId: params.id, authorId: user._id, title: title.trim(), body: body.trim() })
    await Group.findByIdAndUpdate(params.id, { $inc: { postCount: 1 } })

    const populated = await post.populate("authorId", "name profileImage role")
    return NextResponse.json({ post: populated }, { status: 201 })
  })
}
