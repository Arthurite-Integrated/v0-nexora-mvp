import mongoose, { Schema, model, models, Document } from "mongoose"

export const CARE_RELATIONSHIPS = [
  "self",
  "child",
  "sibling_parent",
  "other_dependent",
  "professional_carer",
] as const

export const CARE_RELATIONSHIP_LABELS: Record<typeof CARE_RELATIONSHIPS[number], string> = {
  self: "Myself — I have an IDD",
  child: "My child",
  sibling_parent: "My sibling or parent",
  other_dependent: "Another person I care for",
  professional_carer: "A client (I am a paid carer / support worker)",
}

export const PATIENT_AGE_GROUPS = ["under_5", "5_12", "13_17", "18_35", "over_35"] as const
export const PATIENT_AGE_GROUP_LABELS: Record<typeof PATIENT_AGE_GROUPS[number], string> = {
  under_5: "Under 5",
  "5_12": "5 – 12",
  "13_17": "13 – 17",
  "18_35": "18 – 35",
  over_35: "Over 35",
}

export const DIAGNOSIS_STATUSES = ["diagnosed", "awaiting", "not_assessed", "prefer_not"] as const
export const DIAGNOSIS_STATUS_LABELS: Record<typeof DIAGNOSIS_STATUSES[number], string> = {
  diagnosed: "Already diagnosed",
  awaiting: "Awaiting diagnosis",
  not_assessed: "Not yet assessed",
  prefer_not: "Prefer not to say",
}

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
