"use client"

import { useState, useEffect, useCallback } from "react"
import { ProfessionalCard } from "@/components/professional-card"
import { ProfessionalFilters, FilterState, DEFAULT_FILTERS } from "@/components/professional-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react"
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
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset to page 1 when search or filters change
  useEffect(() => { setPage(1) }, [debouncedSearch, filters])

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "9" })

      if (debouncedSearch) params.set("search", debouncedSearch)
      if (filters.specializations.length > 0) params.set("specialization", filters.specializations.join(","))
      if (filters.locations.length > 0) params.set("location", filters.locations.join(","))
      if (filters.languages.length > 0) params.set("languages", filters.languages.join(","))
      if (filters.minExperience > 0) params.set("minExperience", String(filters.minExperience))
      if (filters.maxFee > 0) params.set("maxFee", String(filters.maxFee))
      if (filters.verifiedOnly) params.set("verified", "true")
      if (filters.credentialVerifiedOnly) params.set("credentialVerified", "true")
      if (filters.sortBy !== "rating") params.set("sortBy", filters.sortBy)

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
  }, [page, debouncedSearch, filters])

  useEffect(() => { fetchProfessionals() }, [fetchProfessionals])

  const activeFilterCount = filters.specializations.length + filters.locations.length +
    filters.languages.length + (filters.minExperience > 0 ? 1 : 0) +
    (filters.maxFee > 0 ? 1 : 0) + (filters.verifiedOnly ? 1 : 0) +
    (filters.credentialVerifiedOnly ? 1 : 0)

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
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Find Healthcare Professionals</h1>
          <p className="text-muted-foreground text-sm">
            Connect with verified specialists in Intellectual and Developmental Disabilities
          </p>
        </div>

        {/* Search + filter toggle */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, specialization, or location..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 shrink-0 ${showFilters ? "border-primary text-primary" : ""}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar — hidden on mobile unless toggled */}
          <div className={`lg:w-72 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <ProfessionalFilters
              filters={filters}
              onChange={(f) => setFilters(f)}
              onClear={() => setFilters(DEFAULT_FILTERS)}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-3">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${total} professional${total !== 1 ? "s" : ""}`}
              </p>
              <select
                className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary"
                value={filters.sortBy}
                onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as FilterState["sortBy"] }))}
              >
                <option value="rating">Sort: Highest Rated</option>
                <option value="experience">Sort: Most Experienced</option>
                <option value="fee_asc">Sort: Fee (Low to High)</option>
                <option value="fee_desc">Sort: Fee (High to Low)</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : mapped.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground text-lg mb-3">No professionals match your filters.</p>
                <Button variant="outline" onClick={() => { setSearch(""); setFilters(DEFAULT_FILTERS) }}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {mapped.map((professional) => (
                  <ProfessionalCard key={professional.id} professional={professional} />
                ))}
              </div>
            )}

            {pages > 1 && !isLoading && (
              <div className="flex justify-center mt-8 gap-2">
                <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant="outline"
                    className={page === p ? "bg-primary text-primary-foreground" : ""}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button variant="outline" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
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
