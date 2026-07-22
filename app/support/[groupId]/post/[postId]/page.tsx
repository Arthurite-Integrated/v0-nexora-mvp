"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, MessageSquare, Clock, Loader2, Send, CornerDownRight } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface Author { _id: string; name: string; profileImage?: string; role: string }

interface Post {
  _id: string
  title: string
  body: string
  upvotes: string[]
  commentCount: number
  isPinned: boolean
  createdAt: string
  authorId: Author
  groupId: string
}

interface Comment {
  _id: string
  body: string
  upvotes: string[]
  parentCommentId: string | null
  createdAt: string
  authorId: Author
}

export default function PostPage() {
  const { groupId, postId } = useParams<{ groupId: string; postId: string }>()
  const { user, loading } = useAuth()
  const router = useRouter()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<string | null>(null) // commentId or null = top-level
  const [commentBody, setCommentBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [upvoting, setUpvoting] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    const [postRes, commentsRes] = await Promise.all([
      fetch(`/api/posts/${postId}`),
      fetch(`/api/posts/${postId}/comments`),
    ])
    if (postRes.ok) setPost((await postRes.json()).post)
    if (commentsRes.ok) setComments((await commentsRes.json()).comments)
    setIsLoading(false)
  }, [postId])

  useEffect(() => {
    if (user) fetchData()
  }, [user, fetchData])

  const handleUpvote = async () => {
    if (!post) return
    setUpvoting(true)
    const res = await fetch(`/api/posts/${postId}/upvote`, { method: "POST" })
    if (res.ok) {
      const d = await res.json()
      setPost(prev => {
        if (!prev) return prev
        const newUpvotes = d.upvoted
          ? [...prev.upvotes, user!._id]
          : prev.upvotes.filter(id => id !== user!._id)
        return { ...prev, upvotes: newUpvotes }
      })
    }
    setUpvoting(false)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentBody.trim(), parentCommentId: replyTo }),
      })
      if (res.ok) {
        const d = await res.json()
        setComments(prev => [...prev, d.comment])
        setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev)
        setCommentBody("")
        setReplyTo(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Post not found or you need to join this group to view it.
      </div>
    )
  }

  const topLevelComments = comments.filter(c => !c.parentCommentId)
  const getReplies = (commentId: string) => comments.filter(c => c.parentCommentId === commentId)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href={`/support/${groupId}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-primary text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to group
        </Link>

        {/* Post */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-snug">{post.title}</h1>
            <div className="flex items-center gap-3 mb-5 text-sm text-gray-500">
              <Avatar name={post.authorId.name} />
              <span className="font-medium text-gray-700">{post.authorId.name}</span>
              {post.authorId.role === "professional" && (
                <Badge variant="outline" className="text-xs py-0 text-primary border-primary/20">Professional</Badge>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 mb-6 whitespace-pre-wrap leading-relaxed">
              {post.body}
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  user && post.upvotes.includes(user._id) ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${user && post.upvotes.includes(user._id) ? "fill-current" : ""}`} />
                {post.upvotes.length} {post.upvotes.length === 1 ? "like" : "likes"}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <MessageSquare className="w-4 h-4" />
                {post.commentCount} {post.commentCount === 1 ? "reply" : "replies"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Comment box */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3">
              {replyTo ? (
                <span className="flex items-center gap-2">
                  <CornerDownRight className="w-4 h-4 text-primary" />
                  Replying to comment
                  <button onClick={() => setReplyTo(null)} className="text-xs text-gray-400 hover:text-gray-600 font-normal">(cancel)</button>
                </span>
              ) : "Add a Reply"}
            </h3>
            <form onSubmit={handleComment} className="space-y-3">
              <Textarea
                placeholder="Share your thoughts, experiences, or advice..."
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                className="min-h-[90px]"
                required
              />
              <Button type="submit" disabled={isSubmitting || !commentBody.trim()} className="bg-primary hover:bg-primary text-white">
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Posting...</>
                  : <><Send className="w-4 h-4 mr-2" />Post Reply</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Comments */}
        {topLevelComments.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">{post.commentCount} {post.commentCount === 1 ? "Reply" : "Replies"}</h3>
            {topLevelComments.map(comment => (
              <CommentBlock
                key={comment._id}
                comment={comment}
                replies={getReplies(comment._id)}
                userId={user?._id}
                onReply={id => { setReplyTo(id); setCommentBody("") }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
      {name[0].toUpperCase()}
    </div>
  )
}

function CommentBlock({ comment, replies, userId, onReply }: {
  comment: Comment
  replies: Comment[]
  userId?: string
  onReply: (id: string) => void
}) {
  const hasUpvoted = userId ? comment.upvotes.includes(userId) : false
  return (
    <div className="space-y-2">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm">
            <Avatar name={comment.authorId.name} />
            <span className="font-medium text-gray-800">{comment.authorId.name}</span>
            {comment.authorId.role === "professional" && (
              <Badge variant="outline" className="text-xs py-0 text-primary border-primary/20">Pro</Badge>
            )}
            <span className="text-gray-400 text-xs flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {format(new Date(comment.createdAt), "MMM d, h:mm a")}
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className={`flex items-center gap-1 text-xs ${hasUpvoted ? "text-rose-500" : "text-gray-400"}`}>
              <Heart className={`w-3 h-3 ${hasUpvoted ? "fill-current" : ""}`} />
              {comment.upvotes.length}
            </span>
            <button onClick={() => onReply(comment._id)} className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
              <CornerDownRight className="w-3 h-3" />Reply
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="ml-6 space-y-2 border-l-2 border-teal-100 pl-4">
          {replies.map(reply => (
            <Card key={reply._id} className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <Avatar name={reply.authorId.name} />
                  <span className="font-medium text-gray-800">{reply.authorId.name}</span>
                  {reply.authorId.role === "professional" && (
                    <Badge variant="outline" className="text-xs py-0 text-primary border-primary/20">Pro</Badge>
                  )}
                  <span className="text-gray-400 text-xs ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(reply.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{reply.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
