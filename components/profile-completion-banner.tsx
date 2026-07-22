"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useProfileCompletion } from "@/hooks/useProfileCompletion"
import { Button } from "@/components/ui/button"
import { ChevronRight, CheckCircle2, Circle } from "lucide-react"

export function ProfileCompletionBanner() {
  const { user } = useAuth()
  const router = useRouter()
  const { percent, fields, isLoading, hasProfessionalProfile } = useProfileCompletion(user)

  if (!user || user.role === "admin" || percent === 100 || isLoading) return null

  const incomplete = fields.filter(f => !f.done)
  const nextMissing = incomplete[0]

  const ctaLabel =
    user.role === "professional" && !hasProfessionalProfile
      ? "Complete Setup"
      : "Complete Profile"

  const ctaAction = () => {
    if (user.role === "professional" && !hasProfessionalProfile) {
      router.push("/onboarding")
    } else {
      router.push("/settings")
    }
  }

  const barColor =
    percent >= 75 ? "bg-primary" :
    percent >= 40 ? "bg-yellow-500" :
    "bg-destructive"

  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-6">
      {/* Header row — percent + CTA */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-sm font-semibold text-foreground">
          Profile {percent}% complete
        </span>
        <Button
          size="sm"
          onClick={ctaAction}
          className="shrink-0 h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {ctaLabel}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Next step hint */}
      {nextMissing && (
        <p className="text-xs text-muted-foreground mb-3">
          Next: <span className="font-medium text-foreground">{nextMissing.label}</span>
        </p>
      )}

      {/* Checklist — 1 col on mobile, 2 on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
        {fields.slice(0, 6).map(field => (
          <div key={field.key} className="flex items-center gap-1.5 text-xs min-w-0">
            {field.done
              ? <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />}
            <span className={`truncate ${field.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {field.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
