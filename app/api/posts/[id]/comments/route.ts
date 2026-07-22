import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Comment } from "@/lib/models/Comment"
import { Post } from "@/lib/models/Post"
import { GroupMember } from "@/lib/models/GroupMember"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (_, user) => {
    await connectDB()

    const post = await Post.findById(params.id).lean()
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const p = post as unknown as { groupId: { toString(): string } }
    const isMember = await GroupMember.findOne({ groupId: p.groupId.toString(), userId: user._id })
    if (!isMember) return NextResponse.json({ error: "Members only" }, { status: 403 })

    const comments = await Comment.find({ postId: params.id })
      .sort({ createdAt: 1 })
      .populate("authorId", "name profileImage role")
      .lean()

    return NextResponse.json({ comments })
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (req, user) => {
    await connectDB()

    const post = await Post.findById(params.id)
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const p = post as unknown as { groupId: { toString(): string } }
    const isMember = await GroupMember.findOne({ groupId: p.groupId.toString(), userId: user._id })
    if (!isMember) return NextResponse.json({ error: "Join this group to comment" }, { status: 403 })

    const { body, parentCommentId } = await req.json()
    if (!body?.trim()) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 })

    const comment = await Comment.create({
      postId: params.id,
      authorId: user._id,
      body: body.trim(),
      parentCommentId: parentCommentId || null,
    })

    await Post.findByIdAndUpdate(params.id, { $inc: { commentCount: 1 } })

    const populated = await comment.populate("authorId", "name profileImage role")
    return NextResponse.json({ comment: populated }, { status: 201 })
  })
}
