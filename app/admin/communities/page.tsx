"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Plus, Users, MessageSquare, Trash2, Loader2 } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { toast } from "sonner"

interface Group {
  _id: string
  name: string
  description: string
  category: string
  memberCount: number
  postCount: number
  coverColor: string
}

const CATEGORIES = ["Family Support", "Diagnoses", "Therapy", "Education", "Healthcare", "Community", "Professionals", "Resources"]
const COLORS = ["teal", "blue", "purple", "orange", "green", "rose"]

export default function AdminCommunitiesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const [form, setForm] = useState({
    name: "", description: "", category: CATEGORIES[0], tags: "", coverColor: "teal",
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/dashboard")
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role !== "admin") return
    fetch("/api/groups")
      .then(r => r.json())
      .then(d => setGroups(d.groups || []))
      .finally(() => setIsFetching(false))
  }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || "Failed to create group"); return }
      setGroups(prev => [d.group, ...prev])
      setForm({ name: "", description: "", category: CATEGORIES[0], tags: "", coverColor: "teal" })
      setShowForm(false)
      toast.success(`"${d.group.name}" created`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    await fetch(`/api/groups/${deleteTarget.id}`, { method: "DELETE" })
    setGroups(prev => prev.filter(g => g._id !== deleteTarget.id))
    toast.success(`"${deleteTarget.name}" deleted`)
    setDeletingId(null)
    setDeleteTarget(null)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BackButton fallback="/dashboard" label="Dashboard" className="mb-6" />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
            <p className="text-gray-500 mt-1">Create and manage support groups</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" />New Group
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Create New Group</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Group Name</Label>
                    <Input placeholder="e.g. Parents of Autistic Children" value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="What is this group for? Who should join?" value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="min-h-[80px]" required />
                </div>

                <div className="space-y-2">
                  <Label>Tags <span className="text-gray-400 font-normal">(comma-separated)</span></Label>
                  <Input placeholder="autism, behaviour, Nigeria" value={form.tags}
                    onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Cover Colour</Label>
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(p => ({ ...p, coverColor: c }))}
                        className={`w-7 h-7 rounded-full transition-transform ${form.coverColor === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : ""} bg-${c}-500`}
                        style={{ backgroundColor: `var(--color-${c}-500, #14b8a6)` }}
                      >
                        {/* colour swatch */}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(p => ({ ...p, coverColor: c }))}
                        className={`px-2 py-1 rounded text-xs border transition-colors ${form.coverColor === c ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary text-white">
                    {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Group"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isFetching ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No groups yet. Create the first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(g => (
              <Card key={g._id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{g.name}</h3>
                        <Badge variant="outline" className="text-xs">{g.category}</Badge>
                      </div>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-1">{g.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.memberCount} members</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{g.postCount} posts</span>
                        <span className={`w-2 h-2 rounded-full bg-${g.coverColor}-500 inline-block`} />
                        <span>{g.coverColor}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      disabled={deletingId === g._id}
                      onClick={() => setDeleteTarget({ id: g._id, name: g.name })}>
                      {deletingId === g._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the group and all its posts. Members will lose access immediately. This cannot be undone."
        confirmLabel="Delete Group"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={!!deletingId}
      />
    </div>
  )
}
