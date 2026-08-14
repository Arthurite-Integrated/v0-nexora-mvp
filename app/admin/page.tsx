"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PasswordStrength, isPasswordValid } from "@/components/password-strength"
import { Shield, Plus, Trash2, Loader2, Eye, EyeOff, AlertCircle, Users, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { format } from "date-fns"

interface Admin {
  _id: string
  name: string
  email: string
  createdAt: string
}

type View = "gate" | "hub"

export default function AdminHubPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [view, setView] = useState<View>("gate")
  const [checkingGate, setCheckingGate] = useState(true)

  // Gate state
  const [gatePassword, setGatePassword] = useState("")
  const [showGatePassword, setShowGatePassword] = useState(false)
  const [gateError, setGateError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  // Admin list state
  const [admins, setAdmins] = useState<Admin[]>([])
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [removeTarget, setRemoveTarget] = useState<Admin | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Create admin form state
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Redirect non-admins
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/dashboard")
  }, [user, loading, router])

  // Check if gate already passed this session
  useEffect(() => {
    fetch("/api/admin/gate")
      .then(r => r.json())
      .then(d => { if (d.passed) setView("hub") })
      .catch(() => {})
      .finally(() => setCheckingGate(false))
  }, [])

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true)
    fetch("/api/admin/admins")
      .then(r => r.json())
      .then(d => setAdmins(d.admins || []))
      .catch(() => {})
      .finally(() => setAdminsLoading(false))
  }, [])

  useEffect(() => {
    if (view === "hub") fetchAdmins()
  }, [view, fetchAdmins])

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGateError("")
    setIsVerifying(true)
    try {
      const res = await fetch("/api/admin/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: gatePassword }),
      })
      if (res.ok) {
        setView("hub")
      } else {
        const d = await res.json()
        setGateError(d.error || "Incorrect password")
      }
    } catch {
      setGateError("Something went wrong")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid(newPassword)) { toast.error("Password does not meet requirements"); return }
    setIsCreating(true)
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, name: newName, password: newPassword }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || "Failed to create admin"); return }
      toast.success(`Admin account created for ${newName}`)
      setNewName(""); setNewEmail(""); setNewPassword(""); setShowForm(false)
      fetchAdmins()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsCreating(false)
    }
  }

  const handleRemoveAdmin = async () => {
    if (!removeTarget) return
    setIsRemoving(true)
    try {
      const res = await fetch("/api/admin/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: removeTarget.email }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || "Failed to remove admin"); return }
      toast.success(`${removeTarget.name} removed`)
      fetchAdmins()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsRemoving(false)
      setRemoveTarget(null)
    }
  }

  if (loading || checkingGate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // ── Gate screen ────────────────────────────────────────────────────────────
  if (view === "gate") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg border-0">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Admin Hub</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter the admin gate password to continue</p>
            </div>

            <form onSubmit={handleGateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gate">Password</Label>
                <div className="relative">
                  <Input
                    id="gate"
                    type={showGatePassword ? "text" : "password"}
                    value={gatePassword}
                    onChange={e => { setGatePassword(e.target.value); setGateError("") }}
                    placeholder="Enter gate password"
                    className="pr-10"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowGatePassword(!showGatePassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                    {showGatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {gateError && (
                  <p className="flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />{gateError}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={isVerifying || !gatePassword}
                className="w-full bg-primary text-primary-foreground">
                {isVerifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Enter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Hub screen ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />Admin Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage administrators and platform operations</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {[
            { label: "Verifications", href: "/admin/verifications", icon: <CheckCircle className="w-4 h-4" /> },
            { label: "Communities", href: "/admin/communities", icon: <Users className="w-4 h-4" /> },
            { label: "Dashboard", href: "/dashboard", icon: <Shield className="w-4 h-4" /> },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-2 p-3 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
              {link.icon}{link.label}
            </Link>
          ))}
        </div>

        {/* Admin management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />Administrators ({admins.length})
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)}
              className="bg-primary text-primary-foreground h-8 px-3 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />Add Admin
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Create admin form */}
            {showForm && (
              <div className="border border-primary/20 bg-primary/5 rounded-lg p-5 space-y-4">
                <h3 className="font-medium text-sm">New Administrator</h3>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newName">Full Name</Label>
                      <Input id="newName" value={newName} onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. Paul Aderoju" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">Email</Label>
                      <Input id="newEmail" type="email" value={newEmail}
                        onChange={e => setNewEmail(e.target.value)} placeholder="admin@nexoracare.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password</Label>
                    <div className="relative">
                      <Input id="newPassword" type={showNewPassword ? "text" : "password"}
                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters" className="pr-10" required />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={newPassword} />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isCreating || !isPasswordValid(newPassword)}
                      className="bg-primary text-primary-foreground text-sm">
                      {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Admin"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Admin list */}
            {adminsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
              </div>
            ) : admins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No admins found.</p>
            ) : (
              <div className="space-y-2">
                {admins.map(admin => (
                  <div key={admin._id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs font-semibold">{admin.name[0].toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{admin.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {format(new Date(admin.createdAt), "MMM d, yyyy")}
                      </span>
                      {admin.email !== user?.email && (
                        <Button size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setRemoveTarget(admin)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {admin.email === user?.email && (
                        <span className="text-xs text-primary font-medium">You</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={open => { if (!open) setRemoveTarget(null) }}
        title={`Remove ${removeTarget?.name}?`}
        description="This will permanently delete their Cognito account and MongoDB profile. They will no longer be able to sign in."
        confirmLabel="Yes, remove admin"
        variant="destructive"
        onConfirm={handleRemoveAdmin}
        isLoading={isRemoving}
      />
    </div>
  )
}
