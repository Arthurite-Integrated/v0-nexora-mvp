import { Schema, model, models, Document, Types } from "mongoose"
import { IDD_CONCERNS, IDDConcern } from "@/lib/constants/idd-concerns"
export { IDD_CONCERNS, IDD_CONCERN_LABELS } from "@/lib/constants/idd-concerns"
export type { IDDConcern } from "@/lib/constants/idd-concerns"

export interface IBooking extends Document {
  professionalId: Types.ObjectId
  caregiverId: Types.ObjectId
  date: Date
  duration: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  consultationType: "video" | "phone" | "in-person"
  notes?: string
  fee: number
  // Research fields — optional, never personally identifiable
  presentingConcern?: IDDConcern   // set by caregiver at booking
  confirmedConcern?: IDDConcern    // set by professional on completion
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    professionalId: { type: Schema.Types.ObjectId, ref: "Professional", required: true, index: true },
    caregiverId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    consultationType: {
      type: String,
      enum: ["video", "phone", "in-person"],
      default: "video",
    },
    notes: String,
    fee: { type: Number, required: true },
    presentingConcern: { type: String, enum: [...IDD_CONCERNS], default: null },
    confirmedConcern: { type: String, enum: [...IDD_CONCERNS], default: null },
  },
  { timestamps: true }
)

BookingSchema.index({ date: 1, status: 1 })

export const Booking = models.Booking || model<IBooking>("Booking", BookingSchema)
