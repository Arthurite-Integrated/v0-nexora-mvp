"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, Search, Loader2, TrendingUp, Heart, Clock } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Group {
  _id: string
  name: string
  description: string
  category: string
  tags: string[]
  memberCount: number
  postCount: number
  coverColor: string
  isMember: boolean
  createdAt: string
}

interface FeedPost {
  _id: string
  title: string
  body: string
  upvotes: string[]
  commentCount: number
  createdAt: string
  authorId: { name: string; profileImage?: string; role: string }
  groupId: { _id: string; name: string; coverColor: string }
}

const COLOR_MAP: Record<string, string> = {
  teal: "from-primary to-primary/80",
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  green: "from-green-500 to-green-600",
  rose: "from-rose-500 to-rose-600",
}

export default function SupportPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [feed, setFeed] = useState<FeedPost[]>([])
  const [search, setSearch] = useState("")
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [isLoadingFeed, setIsLoadingFeed] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/groups")
      .then(r => r.json())
      .then(d => setGroups(d.groups || []))
      .finally(() => setIsLoadingGroups(false))

    fetch("/api/feed")
      .then(r => r.json())
      .then(d => setFeed(d.posts || []))
      .finally(() => setIsLoadingFeed(false))
  }, [user])

  const handleJoin = async (groupId: string, isMember: boolean) => {
    setJoiningId(groupId)
    try {
      const res = await fetch(`/api/groups/${groupId}/${isMember ? "leave" : "join"}`, { method: "POST" })
      if (!res.ok) { toast.error("Action failed. Please try again."); return }

      const groupName = groups.find(g => g._id === groupId)?.name || "group"
      setGroups(prev => prev.map(g =>
        g._id === groupId
          ? { ...g, isMember: !isMember, memberCount: g.memberCount + (isMember ? -1 : 1) }
          : g
      ))
      if (!isMember) {
        const feedRes = await fetch("/api/feed")
        const d = await feedRes.json()
        setFeed(d.posts || [])
        toast.success(`Joined "${groupName}"`)
      } else {
        toast.info(`Left "${groupName}"`)
      }
    } finally {
      setJoiningId(null)
    }
  }

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  )

  const joinedGroups = filtered.filter(g => g.isMember)
  const discoverGroups = filtered.filter(g => !g.isMember)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-10 h-10 mx-auto mb-4 text-primary-foreground/60" />
            <h1 className="text-4xl font-bold mb-3">Support Community</h1>
            <p className="text-primary-foreground/80 text-lg">
              Connect with caregivers and professionals who understand your journey.
              Join a group, ask questions, share what's working.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="groups">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="w-4 h-4" />Groups
              </TabsTrigger>
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />My Feed
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search groups..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* ── Groups ── */}
          <TabsContent value="groups">
            {isLoadingGroups ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-10">
                {joinedGroups.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Groups</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {joinedGroups.map(g => (
                        <GroupCard key={g._id} group={g} onJoin={handleJoin} joiningId={joiningId} />
                      ))}
                    </div>
                  </div>
                )}

                {discoverGroups.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {joinedGroups.length > 0 ? "Discover More" : "All Groups"}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {discoverGroups.map(g => (
                        <GroupCard key={g._id} group={g} onJoin={handleJoin} joiningId={joiningId} />
                      ))}
                    </div>
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-20 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>No groups found. Check back soon.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── Feed ── */}
          <TabsContent value="feed">
            {isLoadingFeed ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : feed.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-gray-600">Your feed is empty</p>
                <p className="text-sm mt-1">Join some groups to see posts here</p>
                <Button className="mt-4 bg-primary hover:bg-primary" onClick={() => {
                  const el = document.querySelector('[data-value="groups"]') as HTMLButtonElement
                  el?.click()
                }}>Browse Groups</Button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4">
                {feed.map(post => (
                  <Link key={post._id} href={`/support/${post.groupId._id}/post/${post._id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${COLOR_MAP[post.groupId.coverColor] || COLOR_MAP.teal}`} />
                          <span className="text-xs text-gray-500 font-medium">{post.groupId.name}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{post.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.body}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                              {post.authorId.name[0].toUpperCase()}
                            </div>
                            <span>{post.authorId.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />{post.upvotes.length}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />{post.commentCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(post.createdAt), "MMM d")}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function GroupCard({ group, onJoin, joiningId }: {
  group: Group
  onJoin: (id: string, isMember: boolean) => void
  joiningId: string | null
}) {
  const gradient = COLOR_MAP[group.coverColor] || COLOR_MAP.teal
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 leading-snug">{group.name}</h3>
          <Badge variant="outline" className="text-xs shrink-0">{group.category}</Badge>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{group.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />{group.memberCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />{group.postCount}
            </span>
          </div>
          <div className="flex gap-2">
            {group.isMember && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/support/${group._id}`}>View</Link>
              </Button>
            )}
            <Button
              size="sm"
              variant={group.isMember ? "ghost" : "default"}
              className={group.isMember ? "text-gray-500" : "bg-primary hover:bg-primary text-white"}
              disabled={joiningId === group._id}
              onClick={() => onJoin(group._id, group.isMember)}
            >
              {joiningId === group._id
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : group.isMember ? "Leave" : "Join"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
