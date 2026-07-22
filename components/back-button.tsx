"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  fallback?: string   // URL to push if there's no browser history
  label?: string
  className?: string
}

export function BackButton({ fallback = "/", label = "Back", className }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    // If there's a previous page in history, go back — otherwise use fallback
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  )
}
