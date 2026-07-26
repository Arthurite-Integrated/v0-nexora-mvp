"use client"

import { useState, useEffect, useCallback } from "react"
import { ProfessionalCard } from "@/components/professional-card"
import { ProfessionalFilters } from "@/components/professional-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Filter, Loader2 } from "lucide-react"
import { BackButton } from "@/components/back-button"

interface Professional {
  _id: string
  name: string
  specialization: string
  location: string
  bio: string
  averageRating: number
  reviewCount: number
  isVerified: boolean
  credentialVerified?: boolean
  experience: number
  consultationFee: number
  languages: string[]
  profileImage?: string
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "9" })
      if (debouncedSearch) params.set("search", debouncedSearch)

      const res = await fetch(`/api/professionals?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProfessionals(data.professionals)
        setTotal(data.total)
        setPages(data.pages)
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    fetchProfessionals()
  }, [fetchProfessionals])

  const mapped = professionals.map((p) => ({
    id: p._id,
    name: p.name,
    specialization: p.specialization,
    location: p.location,
    bio: p.bio,
    rating: p.averageRating,
    reviewCount: p.reviewCount,
    verified: p.isVerified,
    credentialVerified: p.credentialVerified,
    yearsExperience: p.experience,
    consultationFee: p.consultationFee,
    languages: p.languages,
    image: p.profileImage || null,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/" className="mb-6" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Healthcare Professionals</h1>
          <p className="text-lg text-gray-600">
            Connect with verified specialists in Intellectual and Developmental Disabilities
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, specialization, or location..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <MapPin className="w-4 h-4" />
                Location
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80">
            <ProfessionalFilters />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {isLoading ? "Loading..." : `Showing ${total} professional${total !== 1 ? "s" : ""}`}
              </p>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>Sort by Rating</option>
                <option>Sort by Experience</option>
                <option>Sort by Price</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : mapped.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-500 text-lg">No professionals found.</p>
                {search && (
                  <Button variant="link" onClick={() => setSearch("")} className="mt-2 text-primary">
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {mapped.map((professional) => (
                  <ProfessionalCard key={professional.id} professional={professional} />
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant="outline"
                    className={page === p ? "bg-primary text-white" : ""}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button variant="outline" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
