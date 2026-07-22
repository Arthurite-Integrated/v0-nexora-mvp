"use client"

import { useState, useEffect } from "react"
import { AuthUser } from "@/contexts/AuthContext"

export interface CompletionField {
  key: string
  label: string
  done: boolean
}

export interface ProfileCompletion {
  percent: number
  fields: CompletionField[]
  isLoading: boolean
  hasProfessionalProfile: boolean
}

interface ProfessionalData {
  specialization?: string
  bio?: string
  credentials?: string[]
  availability?: { day: string }[]
  consultationFee?: number
  languages?: string[]
}

export function useProfileCompletion(user: AuthUser | null): ProfileCompletion {
  const [proData, setProData] = useState<ProfessionalData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user?.role === "professional") {
      setIsLoading(true)
      fetch("/api/professionals/mine")
        .then(r => r.ok ? r.json() : null)
        .then(d => setProData(d?.professional || null))
        .catch(() => setProData(null))
        .finally(() => setIsLoading(false))
    }
  }, [user?.role, user?._id])

  if (!user) {
    return { percent: 0, fields: [], isLoading: false, hasProfessionalProfile: false }
  }

  const sharedFields: CompletionField[] = [
    { key: "photo",    label: "Add a profile photo",  done: !!user.profileImage },
    { key: "phone",    label: "Add your phone number", done: !!user.phone },
    { key: "location", label: "Set your location",     done: !!user.location },
  ]

  if (user.role === "caregiver") {
    const done = sharedFields.filter(f => f.done).length
    return {
      percent: Math.round((done / sharedFields.length) * 100),
      fields: sharedFields,
      isLoading: false,
      hasProfessionalProfile: false,
    }
  }

  if (user.role === "professional") {
    const proFields: CompletionField[] = [
      { key: "specialization", label: "Add your specialization",    done: !!proData?.specialization },
      { key: "bio",            label: "Write your professional bio", done: (proData?.bio?.length ?? 0) >= 20 },
      { key: "credentials",    label: "Add your credentials",        done: (proData?.credentials?.length ?? 0) > 0 },
      { key: "availability",   label: "Set your availability",       done: (proData?.availability?.length ?? 0) > 0 },
      { key: "fee",            label: "Set your consultation fee",   done: (proData?.consultationFee ?? 0) > 0 },
      { key: "languages",      label: "Add languages you speak",     done: (proData?.languages?.length ?? 0) > 0 },
    ]

    const allFields = [...sharedFields, ...proFields]
    const done = allFields.filter(f => f.done).length

    return {
      percent: Math.round((done / allFields.length) * 100),
      fields: allFields,
      isLoading,
      hasProfessionalProfile: !!proData,
    }
  }

  return { percent: 100, fields: [], isLoading: false, hasProfessionalProfile: false }
}
