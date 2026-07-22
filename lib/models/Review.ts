import { Schema, model, models, Document, Types } from "mongoose"

export interface IReview extends Document {
  professionalId: Types.ObjectId
  caregiverId: Types.ObjectId
  bookingId: Types.ObjectId
  rating: number
  comment: string
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    professionalId: { type: Schema.Types.ObjectId, ref: "Professional", required: true, index: true },
    caregiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
)

export const Review = models.Review || model<IReview>("Review", ReviewSchema)
