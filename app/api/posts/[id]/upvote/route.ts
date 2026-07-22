import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Post } from "@/lib/models/Post"
import { requireAuth } from "@/lib/auth-middleware"
import { Types } from "mongoose"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(req, async (_, user) => {
    await connectDB()
    const post = await Post.findById(params.id)
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const userId = new Types.ObjectId(user._id)
    const hasUpvoted = post.upvotes.some((id: Types.ObjectId) => id.equals(userId))

    if (hasUpvoted) {
      post.upvotes = post.upvotes.filter((id: Types.ObjectId) => !id.equals(userId))
    } else {
      post.upvotes.push(userId)
    }

    await post.save()
    return NextResponse.json({ upvotes: post.upvotes.length, upvoted: !hasUpvoted })
  })
}
