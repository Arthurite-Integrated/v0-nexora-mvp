"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
  professionalName: string
  onSuccess: () => void
}

export function ReviewModal({ open, onOpenChange, bookingId, professionalName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!rating) { toast.error("Please select a star rating"); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || "Failed to submit review"); return }
      toast.success("Review submitted — thank you!")
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = hovered || rating

  const labels: Record<number, string> = {
    1: "Poor", 2: "Fair", 3: "Good", 4: "Very good", 5: "Excellent",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your session</DialogTitle>
          <DialogDescription>
            How was your consultation with <strong>{professionalName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star picker */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= displayRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-sm font-medium text-foreground">{labels[displayRating]}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Comment <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Share your experience to help other families..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !rating}
            className="flex-1 bg-primary text-primary-foreground"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Review"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
