"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Heart, Clock, ArrowLeft, Pin, Plus, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Group {
  _id: string
  name: string
  description: string
  category: string
  memberCount: number
  postCount: number
  coverColor: string
  isMember: boolean
}

interface Post {
  _id: string
  title: string
  body: string
  upvotes: string[]
  commentCount: number
  isPinned: boolean
  createdAt: string
  authorId: { _id: string; name: string; profileImage?: string; role: string }
}

const COLOR_MAP: Record<string, string> = {
  teal: "from-primary to-primary/80",
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  green: "from-green-500 to-green-600",
  rose: "from-rose-500 to-rose-600",
}

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const { user, loading } = useAuth()
  const router = useRouter()

  const [group, setGroup] = useState<Group | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [upvotingId, setUpvotingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const fetchGroup = useCallback(async () => {
    const res = await fetch(`/api/groups/${groupId}`)
    if (res.ok) {
      const d = await res.json()
      setGroup(d.group)
    }
  }, [groupId])

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    const res = await fetch(`/api/groups/${groupId}/posts`)
    if (res.ok) {
      const d = await res.json()
      setPosts(d.posts || [])
    }
    setIsLoading(false)
  }, [groupId])

  useEffect(() => {
    if (!user) return
    fetchGroup()
    fetchPosts()
  }, [user, fetchGroup, fetchPosts])

  const handleJoin = async () => {
    if (!group) return
    const leaving = group.isMember
    await fetch(`/api/groups/${groupId}/${leaving ? "leave" : "join"}`, { method: "POST" })
    await fetchGroup()
    if (!leaving) {
      fetchPosts()
      toast.success(`Joined "${group.name}"`)
    } else {
      setPosts([])
      toast.info(`Left "${group.name}"`)
    }
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newBody.trim()) return
    setIsPosting(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), body: newBody.trim() }),
      })
      const d = await res.json()
      if (!res.ok) {
        const msg = d.error || "Failed to post"
        toast.error(msg)
        return
      }
      setPosts(prev => [d.post, ...prev])
      setNewTitle("")
      setNewBody("")
      setShowNewPost(false)
      toast.success("Discussion posted")
    } finally {
      setIsPosting(false)
    }
  }

  const handleUpvote = async (postId: string) => {
    setUpvotingId(postId)
    try {
      const res = await fetch(`/api/posts/${postId}/upvote`, { method: "POST" })
      if (res.ok) {
        const d = await res.json()
        setPosts(prev => prev.map(p => {
          if (p._id !== postId) return p
          const newUpvotes = d.upvoted
            ? [...p.upvotes, user!._id]
            : p.upvotes.filter(id => id !== user!._id)
          return { ...p, upvotes: newUpvotes }
        }))
      }
    } finally {
      setUpvotingId(null)
    }
  }

  if (loading || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const gradient = COLOR_MAP[group.coverColor] || COLOR_MAP.teal

  return (
    <div className="min-h-screen bg-background">
      {/* Group header */}
      <div className={`bg-gradient-to-r ${gradient} text-white py-10`}>
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/support" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />Back to Support
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <p className="text-white/80 max-w-xl">{group.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{group.memberCount} members</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{group.postCount} posts</span>
                <Badge className="bg-white/20 text-white border-0">{group.category}</Badge>
              </div>
            </div>
            <Button
              onClick={handleJoin}
              variant={group.isMember ? "outline" : "secondary"}
              className={group.isMember ? "border-white text-white bg-transparent hover:bg-white/10" : ""}
            >
              {group.isMember ? "Leave Group" : "Join Group"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {group.isMember && (
          <div className="mb-6">
            {!showNewPost ? (
              <Button
                onClick={() => setShowNewPost(true)}
                className="bg-primary hover:bg-primary text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />Start a Discussion
              </Button>
            ) : (
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">New Discussion</h3>
                    <button onClick={() => setShowNewPost(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handlePost} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="What's on your mind?"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        maxLength={200}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Details</Label>
                      <Textarea
                        placeholder="Share more context, ask your question, or start a conversation..."
                        value={newBody}
                        onChange={e => setNewBody(e.target.value)}
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={isPosting} className="bg-primary hover:bg-primary text-white">
                        {isPosting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Posting...</> : "Post Discussion"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!group.isMember && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <p className="text-primary text-sm font-medium">Join this group to read and participate in discussions.</p>
              <Button onClick={handleJoin} className="bg-primary hover:bg-primary text-white shrink-0">
                Join Group
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-600">No discussions yet</p>
            {group.isMember && <p className="text-sm mt-1">Be the first to start a conversation</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <Card key={post._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.isPinned && (
                          <span className="flex items-center gap-1 text-xs text-primary font-medium">
                            <Pin className="w-3 h-3" />Pinned
                          </span>
                        )}
                      </div>
                      <Link href={`/support/${groupId}/post/${post._id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors leading-snug mb-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.body}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {post.authorId.name[0].toUpperCase()}
                          </div>
                          <span>{post.authorId.name}</span>
                          {post.authorId.role === "professional" && (
                            <Badge variant="outline" className="text-xs py-0 text-primary border-primary/20">Pro</Badge>
                          )}
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {format(new Date(post.createdAt), "MMM d")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <button
                            onClick={() => handleUpvote(post._id)}
                            disabled={upvotingId === post._id}
                            className={`flex items-center gap-1 hover:text-rose-500 transition-colors ${
                              user && post.upvotes.includes(user._id) ? "text-rose-500" : ""
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${user && post.upvotes.includes(user._id) ? "fill-current" : ""}`} />
                            {post.upvotes.length}
                          </button>
                          <Link href={`/support/${groupId}/post/${post._id}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" />{post.commentCount}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
