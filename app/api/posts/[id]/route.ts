import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Post } from "@/lib/models/Post"
import { GroupMember } from "@/lib/models/GroupMember"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (_, user) => {
    await connectDB()
    const post = await Post.findById(params.id).populate("authorId", "name profileImage role").lean()
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const p = post as unknown as { groupId: { toString(): string } }
    const isMember = await GroupMember.findOne({ groupId: p.groupId.toString(), userId: user._id })
    if (!isMember) return NextResponse.json({ error: "Join this group to view posts" }, { status: 403 })

    return NextResponse.json({ post })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (_, user) => {
    await connectDB()
    const post = await Post.findById(params.id)
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const isOwner = post.authorId.toString() === user._id.toString()
    if (!isOwner && user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await post.deleteOne()
    return NextResponse.json({ message: "Deleted" })
  })
}
