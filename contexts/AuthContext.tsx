"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export interface AuthUser {
  _id: string
  cognitoId: string
  email: string
  name: string
  role: "caregiver" | "professional" | "admin"
  phone?: string
  location?: string
  locationData?: {
    country: string
    countryName: string
    state: string
    stateName: string
    city: string
  }
  profileImage?: string
  isSelfAdvocate?: boolean
  careProfile?: {
    relationship: string
    patientAgeGroup: string
    diagnosisStatus: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isLoading: boolean
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoading: true,
  refreshUser: async () => {},
  signOut: async () => {},
  deleteAccount: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/")
  }, [router])

  const deleteAccount = useCallback(async () => {
    const res = await fetch("/api/auth/delete-account", { method: "DELETE" })
    if (res.ok) {
      setUser(null)
      router.push("/")
    } else {
      const data = await res.json()
      throw new Error(data.error || "Failed to delete account")
    }
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, isLoading: loading, refreshUser, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
