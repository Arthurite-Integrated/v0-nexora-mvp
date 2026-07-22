import { Schema, model, models, Document, Types } from "mongoose"

export interface IProfessional extends Document {
  userId: Types.ObjectId
  name: string
  email: string
  specialization: string
  credentials: string[]
  experience: number
  bio: string
  location: string
  consultationFee: number
  languages: string[]
  profileImage?: string
  isVerified: boolean
  verificationStatus: "pending" | "under_review" | "verified" | "rejected"
  averageRating: number
  reviewCount: number
  availability: {
    day: string
    startTime: string
    endTime: string
  }[]
  createdAt: Date
  updatedAt: Date
}

const ProfessionalSchema = new Schema<IProfessional>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    specialization: { type: String, required: true },
    credentials: [{ type: String }],
    experience: { type: Number, default: 0 },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    consultationFee: { type: Number, default: 0 },
    languages: [{ type: String }],
    profileImage: String,
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "under_review", "verified", "rejected"],
      default: "pending",
    },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
  },
  { timestamps: true }
)

ProfessionalSchema.index({ specialization: 1 })
ProfessionalSchema.index({ location: 1 })
ProfessionalSchema.index({ isVerified: 1 })

export const Professional = models.Professional || model<IProfessional>("Professional", ProfessionalSchema)
