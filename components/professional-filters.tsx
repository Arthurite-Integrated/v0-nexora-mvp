"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { SPECIALIZATIONS } from "@/lib/constants/specializations"

const LOCATIONS = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Kaduna", "Jos"]
const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "French", "Arabic", "Pidgin"]

export interface FilterState {
  specializations: string[]
  locations: string[]
  languages: string[]
  minExperience: number
  maxFee: number
  verifiedOnly: boolean
  credentialVerifiedOnly: boolean
  sortBy: "rating" | "experience" | "fee_asc" | "fee_desc"
}

export const DEFAULT_FILTERS: FilterState = {
  specializations: [],
  locations: [],
  languages: [],
  minExperience: 0,
  maxFee: 0,           // 0 = no limit
  verifiedOnly: false,
  credentialVerifiedOnly: false,
  sortBy: "rating",
}

interface ProfessionalFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onClear: () => void
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
}

const activeCount = (f: FilterState) =>
  f.specializations.length + f.locations.length + f.languages.length +
  (f.minExperience > 0 ? 1 : 0) + (f.maxFee > 0 ? 1 : 0) +
  (f.verifiedOnly ? 1 : 0) + (f.credentialVerifiedOnly ? 1 : 0)

export function ProfessionalFilters({ filters, onChange, onClear }: ProfessionalFiltersProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch })
  const count = activeCount(filters)

  return (
    <div className="space-y-4">
      {/* Specialization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Specialization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 max-h-64 overflow-y-auto">
          {SPECIALIZATIONS.map(s => (
            <div key={s} className="flex items-center gap-2">
              <Checkbox
                id={`spec-${s}`}
                checked={filters.specializations.includes(s)}
                onCheckedChange={() => set({ specializations: toggleItem(filters.specializations, s) })}
              />
              <Label htmlFor={`spec-${s}`} className="text-xs font-normal cursor-pointer leading-snug">{s}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {LOCATIONS.map(loc => (
            <div key={loc} className="flex items-center gap-2">
              <Checkbox
                id={`loc-${loc}`}
                checked={filters.locations.includes(loc)}
                onCheckedChange={() => set({ locations: toggleItem(filters.locations, loc) })}
              />
              <Label htmlFor={`loc-${loc}`} className="text-xs font-normal cursor-pointer">{loc}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Min. Years of Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            value={[filters.minExperience]}
            onValueChange={([v]) => set({ minExperience: v })}
            min={0} max={20} step={1}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Any</span>
            <span className="font-medium text-foreground">
              {filters.minExperience > 0 ? `${filters.minExperience}+ yrs` : "No minimum"}
            </span>
            <span>20+</span>
          </div>
        </CardContent>
      </Card>

      {/* Fee */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Max. Consultation Fee</CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            value={[filters.maxFee || 50000]}
            onValueChange={([v]) => set({ maxFee: v >= 50000 ? 0 : v })}
            min={5000} max={50000} step={5000}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₦5k</span>
            <span className="font-medium text-foreground">
              {filters.maxFee > 0 ? `Up to ₦${(filters.maxFee / 1000).toFixed(0)}k` : "No limit"}
            </span>
            <span>Any</span>
          </div>
        </CardContent>
      </Card>

      {/* Verification */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="verified-only"
              checked={filters.verifiedOnly}
              onCheckedChange={v => set({ verifiedOnly: !!v })}
            />
            <Label htmlFor="verified-only" className="text-xs font-normal cursor-pointer">Platform verified</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="cred-verified"
              checked={filters.credentialVerifiedOnly}
              onCheckedChange={v => set({ credentialVerifiedOnly: !!v })}
            />
            <Label htmlFor="cred-verified" className="text-xs font-normal cursor-pointer">Credential verified (green tick)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {LANGUAGES.map(lang => (
            <div key={lang} className="flex items-center gap-2">
              <Checkbox
                id={`lang-${lang}`}
                checked={filters.languages.includes(lang)}
                onCheckedChange={() => set({ languages: toggleItem(filters.languages, lang) })}
              />
              <Label htmlFor={`lang-${lang}`} className="text-xs font-normal cursor-pointer">{lang}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {count > 0 && (
        <Button variant="outline" className="w-full text-xs" onClick={onClear}>
          Clear {count} filter{count !== 1 ? "s" : ""}
        </Button>
      )}
    </div>
  )
}
