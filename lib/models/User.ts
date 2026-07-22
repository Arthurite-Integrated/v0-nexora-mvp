import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IUser extends Document {
  cognitoId: string
  email: string
  name: string
  role: "caregiver" | "professional" | "admin"
  phone?: string
  location?: string                 // flat string for display: "City, State, Country"
  locationData?: {                  // structured for filtering
    country: string
    countryName: string
    state: string
    stateName: string
    city: string
  }
  profileImage?: string
  isSelfAdvocate?: boolean          // caregiver who is seeking care for themselves
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
      country: String,
      countryName: String,
      state: String,
      stateName: String,
      city: String,
    },
    profileImage: String,
    isSelfAdvocate: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const User = models.User || model<IUser>("User", UserSchema)
