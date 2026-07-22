"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar, Clock, CheckCircle, Loader2, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AvailabilitySlot {
  day: string
  startTime: string
  endTime: string
}

interface Professional {
  _id: string
  name: string
  consultationFee: number
  availability: AvailabilitySlot[]
}

interface BookingFormProps {
  professional: Professional
}

type Step = "datetime" | "details" | "confirmed"

const DAYS_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

function getNextOccurrences(day: string, count = 4): Date[] {
  const dayIndex = DAYS_ORDER.indexOf(day)
  if (dayIndex === -1) return []
  const today = new Date()
  const todayDay = today.getDay() // 0=Sun,1=Mon,...
  const targetDay = (dayIndex + 1) % 7 // convert to JS day (Mon=1...Sun=0)
  const dates: Date[] = []
  let d = new Date(today)
  for (let i = 1; dates.length < count; i++) {
    d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() === targetDay) {
      dates.push(new Date(d))
    }
  }
  return dates
}

function generateSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = []
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  let h = sh, m = sm
  while (h * 60 + m + 60 <= eh * 60 + em) {
    const label = new Date(2000, 0, 1, h, m).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    slots.push(label)
    m += 60
    if (m >= 60) { h += m >= 60 ? 1 : 0; m = m % 60 }
  }
  return slots
}

export function BookingForm({ professional }: BookingFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("datetime")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [consultationType, setConsultationType] = useState("video")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Build available date+slot options from professional's availability
  const dateOptions: { date: Date; day: string; slots: string[] }[] = []
  for (const slot of professional.availability) {
    const dates = getNextOccurrences(slot.day, 3)
    const slots = generateSlots(slot.startTime, slot.endTime)
    if (slots.length > 0) {
      for (const date of dates) {
        dateOptions.push({ date, day: slot.day, slots })
      }
    }
  }
  // Sort by date, deduplicate, take next 8
  dateOptions.sort((a, b) => a.date.getTime() - b.date.getTime())
  const uniqueDates = dateOptions.filter((d, i, arr) =>
    arr.findIndex(x => x.date.toDateString() === d.date.toDateString()) === i
  ).slice(0, 8)

  const selectedSlots = selectedDate
    ? uniqueDates.find(d => d.date.toDateString() === selectedDate.toDateString())?.slots || []
    : []

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

  const formatDateLong = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

  const buildDateTime = (): Date => {
    if (!selectedDate || !selectedTime) return new Date()
    const d = new Date(selectedDate)
    const t = new Date(`2000-01-01 ${selectedTime}`)
    d.setHours(t.getHours(), t.getMinutes(), 0, 0)
    return d
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: professional._id,
          date: buildDateTime().toISOString(),
          duration: 60,
          consultationType,
          notes: notes.trim() || undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error || "Failed to submit booking")
        return
      }
      setStep("confirmed")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === "confirmed") {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-5">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Request Sent!</h2>
            <p className="text-muted-foreground text-sm">
              Your booking request has been sent to <strong>{professional.name}</strong>.
              You'll receive an email once they confirm.
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg p-4 text-left text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{selectedDate ? formatDateLong(selectedDate) : ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{consultationType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-medium">₦{professional.consultationFee.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/bookings")}>
              View My Bookings
            </Button>
            <Button className="flex-1 bg-primary text-primary-foreground" onClick={() => router.push("/professionals")}>
              Find More Professionals
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          {step === "datetime" ? <><Calendar className="w-4 h-4" />Select Date &amp; Time</> : <><FileText className="w-4 h-4" />Confirm Booking</>}
        </CardTitle>
        {/* Step dots */}
        <div className="flex gap-2 mt-2">
          {(["datetime", "details"] as const).map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${step === s ? "bg-primary w-8" : i < (["datetime","details"] as string[]).indexOf(step as string) ? "bg-primary w-4" : "bg-muted w-4"}`} />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        {step === "datetime" && (
          <>
            {uniqueDates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-foreground mb-1">No availability set</p>
                <p className="text-sm">This professional hasn't set their weekly availability yet.</p>
              </div>
            ) : (
              <>
                {/* Date selection */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Choose a date</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {uniqueDates.map(({ date }) => (
                      <button
                        key={date.toDateString()}
                        type="button"
                        onClick={() => { setSelectedDate(date); setSelectedTime("") }}
                        className={cn(
                          "p-3 border rounded-lg text-center text-sm transition-colors",
                          selectedDate?.toDateString() === date.toDateString()
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border hover:border-primary/30 text-foreground"
                        )}
                      >
                        <div className="font-medium">{formatDate(date)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time selection */}
                {selectedDate && selectedSlots.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />Choose a time
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {selectedSlots.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "p-2.5 border rounded-lg text-sm text-center transition-colors",
                            selectedTime === time
                              ? "border-primary bg-primary text-primary-foreground font-medium"
                              : "border-border hover:border-primary/30 text-foreground"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button
              className="w-full bg-primary text-primary-foreground"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep("details")}
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}

        {step === "details" && (
          <>
            {/* Summary */}
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedDate ? formatDateLong(selectedDate) : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">60 minutes</span>
              </div>
            </div>

            {/* Consultation type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Consultation type</Label>
              <RadioGroup value={consultationType} onValueChange={setConsultationType} className="grid grid-cols-3 gap-2">
                {[
                  { value: "video", label: "Video" },
                  { value: "phone", label: "Phone" },
                  { value: "in-person", label: "In-person" },
                ].map(opt => (
                  <div key={opt.value}>
                    <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                    <Label
                      htmlFor={opt.value}
                      className={cn(
                        "flex items-center justify-center p-2.5 border rounded-lg text-sm cursor-pointer transition-colors",
                        consultationType === opt.value
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes for the professional <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe the reason for the consultation, any previous diagnoses, or what you'd like to discuss..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("datetime")} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                  : "Send Booking Request"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Need this import for the details step icon
import { FileText } from "lucide-react"
