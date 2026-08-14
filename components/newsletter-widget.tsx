"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Loader2, CheckCircle } from "lucide-react"

interface NewsletterWidgetProps {
  source?: string
}

export function NewsletterWidget({ source = "resources_page" }: NewsletterWidgetProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    setMessage("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      })
      const d = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(d.error || "Something went wrong.")
      } else {
        setStatus("success")
        setMessage(d.message)
        setEmail("")
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col items-center text-center gap-2">
          <CheckCircle className="w-8 h-8 text-primary" />
          <p className="text-sm font-semibold text-gray-900">{message}</p>
          <p className="text-xs text-gray-400">We'll be in touch.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-gray-900 text-sm">Stay Updated</h3>
      </div>
      <p className="text-gray-500 text-xs mb-4 leading-relaxed">
        Get the latest articles and IDD care resources delivered to your inbox — no spam.
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); if (status === "error") setStatus("idle") }}
          className="text-sm h-9 border-gray-200 focus:border-primary"
          required
          disabled={status === "loading"}
        />
        {status === "error" && (
          <p className="text-xs text-destructive">{message}</p>
        )}
        <Button
          type="submit"
          disabled={status === "loading" || !email}
          className="w-full h-9 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {status === "loading"
            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Subscribing...</>
            : "Subscribe"}
        </Button>
      </form>
      <p className="text-gray-400 text-xs mt-3 text-center">Unsubscribe anytime.</p>
    </div>
  )
}
