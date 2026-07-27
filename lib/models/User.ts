import mongoose, { Schema, model, models, Document } from "mongoose"
import {
  CARE_RELATIONSHIPS, PATIENT_AGE_GROUPS, DIAGNOSIS_STATUSES,
} from "@/lib/constants/care-profile"

export {
  CARE_RELATIONSHIPS, CARE_RELATIONSHIP_LABELS,
  PATIENT_AGE_GROUPS, PATIENT_AGE_GROUP_LABELS,
  DIAGNOSIS_STATUSES, DIAGNOSIS_STATUS_LABELS,
} from "@/lib/constants/care-profile"

export interface IUser extends Document {
  cognitoId: string
  email: string
  name: string
  role: "caregiver" | "professional" | "admin"
  phone?: string
  location?: string
  locationData?: {
    country: string
    countryName: string
    state: string
    stateName: string
    city: string
  }
  profileImage?: string
  // Caregiver profile — replaces isSelfAdvocate
  careProfile?: {
    relationship: typeof CARE_RELATIONSHIPS[number]
    patientAgeGroup: typeof PATIENT_AGE_GROUPS[number]
    diagnosisStatus: typeof DIAGNOSIS_STATUSES[number]
  }
  // Keep isSelfAdvocate for backwards compat with old accounts
  isSelfAdvocate?: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    cognitoId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["caregiver", "professional", "admin"], required: true },
    phone: String,
    location: String,
    locationData: {
      country: String, countryName: String,
      state: String, stateName: String, city: String,
    },
    profileImage: String,
    careProfile: {
      relationship: { type: String, enum: [...CARE_RELATIONSHIPS] },
      patientAgeGroup: { type: String, enum: [...PATIENT_AGE_GROUPS] },
      diagnosisStatus: { type: String, enum: [...DIAGNOSIS_STATUSES] },
    },
    isSelfAdvocate: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const User = models.User || model<IUser>("User", UserSchema)
