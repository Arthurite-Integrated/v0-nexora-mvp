"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar, Clock, User, Phone, FileText, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface Professional {
  id: string
  name: string
  consultationFee: number
  availability: Array<{
    date: string
    slots: string[]
  }>
}

interface BookingFormProps {
  professional: Professional
}

export function BookingForm({ professional }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [step, setStep] = useState<"datetime" | "details" | "payment" | "confirmation">("datetime")
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    caregiverName: "",
    phone: "",
    email: "",
    relationship: "",
    reason: "",
    previousDiagnosis: "",
    urgency: "routine",
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDateTimeSubmit = () => {
    if (selectedDate && selectedTime) {
      setStep("details")
    }
  }

  const handleDetailsSubmit = () => {
    setStep("payment")
  }

  const handlePaymentSubmit = () => {
    setStep("confirmation")
  }

  const renderDateTimeStep = () => (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Select Date
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {professional.availability.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={cn(
                "p-4 border rounded-lg text-left transition-colors",
                selectedDate === day.date
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <div className="font-medium">{formatDate(day.date)}</div>
              <div className="text-sm text-gray-500 mt-1">{day.slots.length} slots available</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Select Time
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {professional.availability
              .find((day) => day.date === selectedDate)
              ?.slots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "p-3 border rounded-lg text-center transition-colors",
                    selectedTime === time
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  {time}
                </button>
              ))}
          </div>
        </div>
      )}

      <Button onClick={handleDateTimeSubmit} disabled={!selectedDate || !selectedTime} className="w-full" size="lg">
        Continue to Details
      </Button>
    </div>
  )

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg">
        <h3 className="font-semibold text-primary mb-2">Selected Appointment</h3>
        <p className="text-sm">
          {formatDate(selectedDate)} at {selectedTime}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
          </h3>

          <div>
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="Enter patient's full name"
            />
          </div>

          <div>
            <Label htmlFor="patientAge">Patient Age *</Label>
            <Input
              id="patientAge"
              value={formData.patientAge}
              onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
              placeholder="Enter patient's age"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </h3>

          <div>
            <Label htmlFor="caregiverName">Your Name *</Label>
            <Input
              id="caregiverName"
              value={formData.caregiverName}
              onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="relationship">Relationship to Patient *</Label>
            <Input
              id="relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="e.g., Parent, Guardian, Caregiver"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+234 xxx xxx xxxx"
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason for Consultation *</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Please describe the main concerns or reasons for this consultation..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="previousDiagnosis">Previous Diagnosis or Assessments</Label>
        <Textarea
          id="previousDiagnosis"
          value={formData.previousDiagnosis}
          onChange={(e) => setFormData({ ...formData, previousDiagnosis: e.target.value })}
          placeholder="Please share any previous diagnoses, assessments, or relevant medical history..."
          rows={3}
        />
      </div>

      <div>
        <Label className="text-base font-medium">Urgency Level</Label>
        <RadioGroup
          value={formData.urgency}
          onValueChange={(value) => setFormData({ ...formData, urgency: value })}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="routine" id="routine" />
            <Label htmlFor="routine">Routine - Can wait 1-2 weeks</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="urgent" id="urgent" />
            <Label htmlFor="urgent">Urgent - Need appointment within a few days</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="emergency" id="emergency" />
            <Label htmlFor="emergency">Emergency - Need immediate attention</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setStep("datetime")} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleDetailsSubmit}
          className="flex-1"
          disabled={
            !formData.patientName || !formData.caregiverName || !formData.phone || !formData.email || !formData.reason
          }
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg">
        <h3 className="font-semibold text-primary mb-2">Booking Summary</h3>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Date:</strong> {formatDate(selectedDate)}
          </p>
          <p>
            <strong>Time:</strong> {selectedTime}
          </p>
          <p>
            <strong>Patient:</strong> {formData.patientName}
          </p>
          <p>
            <strong>Duration:</strong> 60 minutes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">Consultation Fee</span>
            <span className="text-xl font-bold text-primary">₦{professional.consultationFee.toLocaleString()}</span>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="font-mono" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" className="font-mono" />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" className="font-mono" />
              </div>
            </div>

            <div>
              <Label htmlFor="cardName">Name on Card</Label>
              <Input id="cardName" placeholder="Enter name as it appears on card" />
            </div>
          </div>

          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
            <p className="flex items-center gap-2 mb-1">
              <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </span>
              Your payment information is secure and encrypted
            </p>
            <p>You will receive a confirmation email after successful payment.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
          Back
        </Button>
        <Button onClick={handlePaymentSubmit} className="flex-1" size="lg">
          Complete Booking
        </Button>
      </div>
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-green-600 text-2xl">✓</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your consultation has been successfully booked with {professional.name}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Appointment Details</h3>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Patient:</span>
              <span className="font-medium">{formData.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Professional:</span>
              <span className="font-medium">{professional.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fee:</span>
              <span className="font-medium">₦{professional.consultationFee.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg text-left">
        <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You'll receive a confirmation email with appointment details</li>
          <li>• The professional will contact you 24 hours before the appointment</li>
          <li>• Please arrive 10 minutes early for your consultation</li>
          <li>• Bring any relevant medical records or previous assessments</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 bg-transparent">
          View My Bookings
        </Button>
        <Button className="flex-1">Book Another Appointment</Button>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {step === "datetime" && (
            <>
              <Calendar className="w-5 h-5" />
              Select Date & Time
            </>
          )}
          {step === "details" && (
            <>
              <FileText className="w-5 h-5" />
              Consultation Details
            </>
          )}
          {step === "payment" && (
            <>
              <CreditCard className="w-5 h-5" />
              Payment
            </>
          )}
          {step === "confirmation" && <>Confirmation</>}
        </CardTitle>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mt-4">
          {["datetime", "details", "payment", "confirmation"].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === stepName || ["datetime", "details", "payment", "confirmation"].indexOf(step) > index
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600",
                )}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-2",
                    ["datetime", "details", "payment", "confirmation"].indexOf(step) > index
                      ? "bg-primary"
                      : "bg-gray-200",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {step === "datetime" && renderDateTimeStep()}
        {step === "details" && renderDetailsStep()}
        {step === "payment" && renderPaymentStep()}
        {step === "confirmation" && renderConfirmationStep()}
      </CardContent>
    </Card>
  )
}
