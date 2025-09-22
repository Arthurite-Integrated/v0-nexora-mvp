import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export function ProfessionalFilters() {
  return (
    <div className="space-y-6">
      {/* Specialization Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Specialization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Developmental Pediatrics",
            "Speech Therapy",
            "Occupational Therapy",
            "Behavioral Therapy",
            "Special Education",
            "Psychiatry",
            "Psychology",
            "Physical Therapy",
          ].map((specialization) => (
            <div key={specialization} className="flex items-center space-x-2">
              <Checkbox id={specialization} />
              <Label htmlFor={specialization} className="text-sm font-normal">
                {specialization}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Kaduna", "Jos"].map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox id={location} />
              <Label htmlFor={location} className="text-sm font-normal">
                {location}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Years of Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider defaultValue={[0]} max={25} step={1} className="w-full" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0 years</span>
              <span>25+ years</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consultation Fee</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider defaultValue={[10000]} max={50000} step={5000} className="w-full" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>₦10,000</span>
              <span>₦50,000+</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="verified" />
            <Label htmlFor="verified" className="text-sm font-normal">
              Verified Professionals Only
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Languages Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["English", "Yoruba", "Igbo", "Hausa", "French"].map((language) => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox id={language} />
              <Label htmlFor={language} className="text-sm font-normal">
                {language}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full bg-transparent" variant="outline">
        Clear All Filters
      </Button>
    </div>
  )
}
