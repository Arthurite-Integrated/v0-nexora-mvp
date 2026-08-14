"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, AlertTriangle, CheckCircle, Clock, X, Loader2, FileText, ExternalLink } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { BackButton } from "@/components/back-button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Professional {
  _id: string
  name: string
  email: string
  specialization: string
  location: string
  experience: number
  bio: string
  credentials: string[]
  consultationFee: number
  languages: string[]
  verificationStatus: "pending" | "under_review" | "verified" | "rejected"
  isVerified: boolean
  credentialVerified: boolean
  createdAt: string
}

interface Stats {
  pending: number
  under_review: number
  verified: number
  rejected: number
}

export default function AdminVerificationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, under_review: 0, verified: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [pendingApproval, setPendingApproval] = useState<Professional | null>(null)
  const [messageTarget, setMessageTarget] = useState<Professional | null>(null)
  const [messageSubject, setMessageSubject] = useState("Clarification Needed for Your Nexora Professional Review")
  const [messageBody, setMessageBody] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [docProfessionals, setDocProfessionals] = useState<Array<{
    _id: string; name: string; email: string; specialization: string
    credentialVerified: boolean
    credentialDocs: Array<{ _id: string; url: string; filename: string; fileType: string; status: string; adminNote?: string }>
  }>>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [updatingDocId, setUpdatingDocId] = useState<string | null>(null)
  const [docNote, setDocNote] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/dashboard")
  }, [user, loading, router])

  const fetchVerifications = useCallback(async (status: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/verifications?status=${status}`)
      if (res.ok) {
        const data = await res.json()
        setProfessionals(data.professionals)
        setStats(data.stats)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === "admin") fetchVerifications(activeTab)
  }, [user, activeTab, fetchVerifications])

  // Fetch docs when documents tab is active
  useEffect(() => {
    if (activeTab === "documents" && user?.role === "admin") {
      setDocsLoading(true)
      fetch("/api/admin/verifications/documents?status=pending")
        .then(r => r.json())
        .then(d => setDocProfessionals(d.professionals || []))
        .catch(() => {})
        .finally(() => setDocsLoading(false))
    }
  }, [activeTab, user])

  const updateDocStatus = async (professionalId: string, docId: string, status: string) => {
    setUpdatingDocId(docId)
    try {
      const res = await fetch("/api/admin/verifications/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId, docId, status, adminNote: docNote[docId] || undefined }),
      })
      if (res.ok) {
        const labels: Record<string, string> = {
          approved: "Credential document approved - badge awarded",
          rejected: "Document rejected",
          more_info: "More info requested",
        }
        toast.success(labels[status] || "Updated")
        setDocProfessionals(prev => prev.map(p => {
          if (p._id !== professionalId) return p
          const updatedDocs = p.credentialDocs.map(d => d._id === docId ? { ...d, status, adminNote: docNote[docId] || d.adminNote } : d)
          const pendingDocs = updatedDocs.filter(d => d.status === "pending")
          return { ...p, credentialDocs: pendingDocs, credentialVerified: status === "approved" ? true : p.credentialVerified }
        }).filter(p => p.credentialDocs.length > 0))
      } else {
        toast.error("Failed to update document")
      }
    } catch { toast.error("Something went wrong") }
    finally { setUpdatingDocId(null) }
  }

  const updateStatus = async (id: string, verificationStatus: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus }),
      })
      if (res.ok) {
        const labels: Record<string, string> = {
          verified: "Profile approved",
          rejected: "Application rejected",
          under_review: "Moved to Under Review",
          pending: "Reset to Pending",
        }
        toast.success(labels[verificationStatus] || "Status updated")
        fetchVerifications(activeTab)
      } else {
        toast.error("Failed to update status")
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const requestApproval = (professional: Professional) => {
    if (!professional.credentialVerified) {
      setPendingApproval(professional)
      return
    }
    updateStatus(professional._id, "verified")
  }

  const openMessageDialog = (professional: Professional) => {
    setMessageTarget(professional)
    setMessageSubject("Clarification Needed for Your Nexora Professional Review")
    setMessageBody("")
  }

  const sendMessage = async () => {
    if (!messageTarget) return
    if (messageBody.trim().length < 10) {
      toast.error("Please enter a message with at least 10 characters")
      return
    }

    setIsSendingMessage(true)
    try {
      const res = await fetch(`/api/admin/verifications/${messageTarget._id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: messageSubject, message: messageBody }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to send message")
        return
      }
      toast.success("Message sent by Nexora Compliance Team")
      setMessageTarget(null)
      setMessageBody("")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton fallback="/dashboard" label="Dashboard" className="mb-6" />
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Verifications</h1>
            <p className="text-lg text-gray-600">Review and verify healthcare professional applications</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.under_review}</div>
                    <div className="text-gray-600">Under Review</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.verified}</div>
                    <div className="text-gray-600">Verified</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
                    <div className="text-gray-600">Rejected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input placeholder="Search by name, email, or specialization..." className="pl-10" />
                  </div>
                </div>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending" className="text-xs sm:text-sm">
                Pending ({stats.pending})
                {stats.pending > 0 && <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block" />}
              </TabsTrigger>
              <TabsTrigger value="under_review" className="text-xs sm:text-sm">
                Under Review ({stats.under_review})
                {stats.under_review > 0 && <span className="ml-1.5 w-2 h-2 bg-blue-500 rounded-full inline-block" />}
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Completed ({stats.verified + stats.rejected})
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">
                Documents
                {docProfessionals.length > 0 && <span className="ml-1.5 w-2 h-2 bg-yellow-500 rounded-full inline-block" />}
              </TabsTrigger>
            </TabsList>

            {["pending", "under_review", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : professionals.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {tab === "completed" ? "completed" : tab.replace("_", " ")} verifications
                      </h3>
                    </CardContent>
                  </Card>
                ) : (
                  professionals.map((p) => (
                    <Card key={p._id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                              <Badge
                                variant={
                                  p.verificationStatus === "verified"
                                    ? "default"
                                    : p.verificationStatus === "rejected"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {p.verificationStatus.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{p.email}</p>
                            <p className="text-gray-700 text-sm mb-1">
                              <strong>Specialization:</strong> {p.specialization}
                            </p>
                            <p className="text-gray-700 text-sm mb-1">
                              <strong>Location:</strong> {p.location} &nbsp;|&nbsp;
                              <strong>Experience:</strong> {p.experience} years
                            </p>
                            {p.credentials?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {p.credentials.map((c, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {p.bio && <p className="text-gray-600 text-sm mt-2 line-clamp-2">{p.bio}</p>}
                          </div>

                          <div className="flex flex-col gap-2 shrink-0">
                            {(p.verificationStatus === "pending" || p.verificationStatus === "under_review") && (
                              <>
                                {p.verificationStatus === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={updatingId === p._id}
                                    onClick={() => updateStatus(p._id, "under_review")}
                                  >
                                    Start Review
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={updatingId === p._id}
                                  onClick={() => requestApproval(p)}
                                >
                                  {updatingId === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve Profile"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updatingId === p._id}
                                  onClick={() => openMessageDialog(p)}
                                >
                                  Message
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={updatingId === p._id}
                                  onClick={() => updateStatus(p._id, "rejected")}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {(p.verificationStatus === "verified" || p.verificationStatus === "rejected") && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingId === p._id}
                                onClick={() => updateStatus(p._id, "pending")}
                              >
                                Re-review
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
            {/* Documents review tab */}
            <TabsContent value="documents" className="space-y-4">
              {docsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : docProfessionals.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-medium text-gray-600">No pending credential documents</p>
                  </CardContent>
                </Card>
              ) : (
                docProfessionals.map(pro => (
                  <Card key={pro._id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="font-semibold text-foreground">{pro.name}</p>
                          <p className="text-xs text-muted-foreground">{pro.email} · {pro.specialization}</p>
                        </div>
                        {pro.credentialVerified && (
                          <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Verified</span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {pro.credentialDocs.map(doc => (
                          <div key={doc._id} className="border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium truncate flex-1">{doc.filename}</span>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                                <ExternalLink className="w-3.5 h-3.5" />View
                              </a>
                            </div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Optional note to professional..."
                                value={docNote[doc._id] || ""}
                                onChange={e => setDocNote(prev => ({ ...prev, [doc._id]: e.target.value }))}
                                className="w-full border border-input rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                                  disabled={updatingDocId === doc._id}
                                  onClick={() => updateDocStatus(pro._id, doc._id, "approved")}>
                                  {updatingDocId === doc._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 px-3 text-xs text-yellow-600 border-yellow-300"
                                  disabled={updatingDocId === doc._id}
                                  onClick={() => updateDocStatus(pro._id, doc._id, "more_info")}>
                                  Need More Info
                                </Button>
                                <Button size="sm" variant="destructive" className="h-7 px-3 text-xs"
                                  disabled={updatingDocId === doc._id}
                                  onClick={() => updateDocStatus(pro._id, doc._id, "rejected")}>
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingApproval}
        onOpenChange={(open) => !open && setPendingApproval(null)}
        title="Approve profile only?"
        description="This professional has no approved credential documents yet. Approving now will mark their profile as platform reviewed only, not credentials verified."
        confirmLabel="Approve Profile"
        cancelLabel="Cancel"
        variant="default"
        isLoading={!!updatingId}
        onConfirm={() => {
          if (!pendingApproval) return
          updateStatus(pendingApproval._id, "verified")
          setPendingApproval(null)
        }}
      />

      <Dialog open={!!messageTarget} onOpenChange={(open) => !open && setMessageTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Practitioner</DialogTitle>
            <DialogDescription>
              Send a clarification request as Nexora Compliance Team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="text-sm font-medium text-foreground">{messageTarget?.name}</p>
              <p className="text-xs text-muted-foreground">{messageTarget?.email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-message-subject">Subject</Label>
              <Input
                id="verification-message-subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-message-body">Message</Label>
              <Textarea
                id="verification-message-body"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Explain what needs clarification or which document should be updated..."
                className="min-h-[160px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageTarget(null)} disabled={isSendingMessage}>Cancel</Button>
            <Button onClick={sendMessage} disabled={isSendingMessage}>
              {isSendingMessage ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
