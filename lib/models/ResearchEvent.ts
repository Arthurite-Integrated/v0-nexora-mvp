import { Schema, model, models, Document } from "mongoose"
import { IDD_CONCERNS, IDDConcern } from "./Booking"

/**
 * Pseudonymised, non-identifiable research record.
 * Never stores names, emails, notes, or direct user IDs.
 * pseudoCaregiverId = SHA256(caregiverId + RESEARCH_PSEUDONYM_SALT)
 */
export interface IResearchEvent extends Document {
  bookingId: string                   // booking reference for dedup only — not a join
  pseudoCaregiverId: string           // irreversible hash — cannot re-identify
  specialization: string              // professional specialization
  state: string                       // professional's state (not LGA for privacy)
  consultationType: string
  outcome: "completed" | "cancelled"
  sessionDate: Date                   // booking's scheduled date — not event record date
  presentingConcern?: IDDConcern      // caregiver's concern at booking
  confirmedConcern?: IDDConcern       // professional's confirmed concern at completion
  recordedAt: Date
}

const ResearchEventSchema = new Schema<IResearchEvent>(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    pseudoCaregiverId: { type: String, required: true, index: true },
    specialization: { type: String, required: true },
    state: { type: String, default: "" },
    consultationType: { type: String, default: "" },
    outcome: { type: String, enum: ["completed", "cancelled"], required: true },
    sessionDate: { type: Date, required: true },
    presentingConcern: { type: String, enum: [...IDD_CONCERNS], default: null },
    confirmedConcern: { type: String, enum: [...IDD_CONCERNS], default: null },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

export const ResearchEvent = models.ResearchEvent || model<IResearchEvent>("ResearchEvent", ResearchEventSchema)
