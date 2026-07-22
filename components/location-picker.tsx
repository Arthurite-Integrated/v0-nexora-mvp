"use client"

import { useMemo } from "react"
import { Country, State, City } from "country-state-city"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import { NIGERIA_LGAS } from "@/lib/nigeria-lgas"

export interface LocationValue {
  country: string      // ISO2 code e.g. "NG"
  countryName: string
  state: string        // state code e.g. "LA"
  stateName: string
  city: string
}

const EMPTY: LocationValue = { country: "", countryName: "", state: "", stateName: "", city: "" }

interface LocationPickerProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
  label?: boolean
  required?: boolean
}

export function LocationPicker({ value, onChange, label = true, required }: LocationPickerProps) {
  const countries = useMemo(() => Country.getAllCountries(), [])

  const states = useMemo(
    () => (value.country ? State.getStatesOfCountry(value.country) : []),
    [value.country]
  )

  // For Nigeria: use our complete LGA dataset instead of the library's incomplete city list
  const cities = useMemo(() => {
    if (!value.country || !value.state) return []
    if (value.country === "NG") {
      const lgas = NIGERIA_LGAS[value.state] || []
      return lgas.map(name => ({ name }))
    }
    return City.getCitiesOfState(value.country, value.state)
  }, [value.country, value.state])

  const handleCountryChange = (isoCode: string) => {
    const country = countries.find(c => c.isoCode === isoCode)
    onChange({ country: isoCode, countryName: country?.name || "", state: "", stateName: "", city: "" })
  }

  const handleStateChange = (stateCode: string) => {
    const state = states.find(s => s.isoCode === stateCode)
    onChange({ ...value, state: stateCode, stateName: state?.name || "", city: "" })
  }

  const selectClass = "w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="space-y-3">
      {label && (
        <Label className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Location
        </Label>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Country */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Country</Label>
          <select
            value={value.country}
            onChange={e => handleCountryChange(e.target.value)}
            className={selectClass}
            required={required}
          >
            <option value="">Select country</option>
            <option value="NG">Nigeria</option>
            <option disabled>──────────</option>
            {countries
              .filter(c => c.isoCode !== "NG")
              .map(c => (
                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
              ))}
          </select>
        </div>

        {/* State */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            {value.country === "NG" ? "State" : "State / Region"}
          </Label>
          <select
            value={value.state}
            onChange={e => handleStateChange(e.target.value)}
            disabled={!value.country || states.length === 0}
            className={selectClass}
            required={required && states.length > 0}
          >
            <option value="">Select state</option>
            {states.map(s => (
              <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* City / LGA — dropdown to quick-fill, text input always visible for manual entry */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            {value.country === "NG" ? "City / LGA" : "City"}
          </Label>
          <div className="space-y-1.5">
            {cities.length > 0 && (
              <select
                value=""
                onChange={e => {
                  if (e.target.value) onChange({ ...value, city: e.target.value })
                }}
                disabled={!value.state}
                className={selectClass}
              >
                <option value="">Pick from list…</option>
                {cities.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={value.city}
              onChange={e => onChange({ ...value, city: e.target.value })}
              placeholder={
                !value.state
                  ? "Select a state first"
                  : value.country === "NG"
                  ? "Type city or LGA"
                  : "Type city"
              }
              disabled={!value.state}
              className={selectClass}
            />
          </div>
        </div>
      </div>

      {(value.stateName || value.countryName) && (
        <p className="text-xs text-muted-foreground">
          {[value.city, value.stateName, value.countryName].filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  )
}

export function locationToString(loc: LocationValue): string {
  return [loc.city, loc.stateName, loc.countryName].filter(Boolean).join(", ")
}

export function stringToLocation(str: string): LocationValue {
  if (!str) return EMPTY
  const parts = str.split(",").map(p => p.trim())
  if (parts.length >= 3) {
    return { country: "", countryName: parts[2], state: "", stateName: parts[1], city: parts[0] }
  }
  if (parts.length === 2) {
    return { country: "", countryName: parts[1], state: "", stateName: parts[0], city: "" }
  }
  return { ...EMPTY, countryName: str }
}
