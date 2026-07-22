"use client"

import { Check, X } from "lucide-react"

interface Rule {
  label: string
  test: (p: string) => boolean
}

const RULES: Rule[] = [
  { label: "At least 8 characters",   test: p => p.length >= 8 },
  { label: "One uppercase letter",     test: p => /[A-Z]/.test(p) },
  { label: "One lowercase letter",     test: p => /[a-z]/.test(p) },
  { label: "One number",               test: p => /[0-9]/.test(p) },
]

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const passed = RULES.filter(r => r.test(password)).length
  const allPassed = passed === RULES.length

  return (
    <div className="space-y-2 pt-1">
      {/* Progress bar */}
      <div className="flex gap-1">
        {RULES.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < passed
                ? passed === RULES.length
                  ? "bg-primary"
                  : passed >= 3
                  ? "bg-yellow-500"
                  : "bg-destructive"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Rules list */}
      <ul className="space-y-1">
        {RULES.map(rule => {
          const ok = rule.test(password)
          return (
            <li key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${ok ? "text-primary" : "text-muted-foreground"}`}>
              {ok
                ? <Check className="w-3 h-3 shrink-0" />
                : <X className="w-3 h-3 shrink-0 text-muted-foreground/50" />}
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Returns true only when the password satisfies all Cognito rules */
export function isPasswordValid(password: string): boolean {
  return RULES.every(r => r.test(password))
}
