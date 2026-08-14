import { Schema, model, models, Document, Types } from "mongoose"

export interface ICredentialDoc {
  url: string
  filename: string
  fileType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp"
  s3Key: string
  uploadedAt: Date
  status: "pending" | "approved" | "rejected" | "more_info"
  adminNote?: string
}

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
  credentialDocs: ICredentialDoc[]
  credentialVerified: boolean   // true only when admin explicitly approves ≥1 doc
  averageRating: number
  reviewCount: number
  availability: { day: string; startTime: string; endTime: string }[]
  createdAt: Date
  updatedAt: Date
}

const CredentialDocSchema = new Schema<ICredentialDoc>(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    fileType: { type: String, required: true },
    s3Key: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "more_info"],
      default: "pending",
    },
    adminNote: String,
  },
  { _id: true }
)

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
    credentialDocs: { type: [CredentialDocSchema], default: [] },
    credentialVerified: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    availability: [{ day: String, startTime: String, endTime: String }],
  },
  { timestamps: true }
)

ProfessionalSchema.index({ specialization: 1 })
ProfessionalSchema.index({ location: 1 })
ProfessionalSchema.index({ isVerified: 1 })
ProfessionalSchema.index({ credentialVerified: -1, isVerified: -1 })

export const Professional = models.Professional || model<IProfessional>("Professional", ProfessionalSchema)
