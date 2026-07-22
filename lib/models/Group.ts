import { Schema, model, models, Document, Types } from "mongoose"

export interface IGroup extends Document {
  name: string
  description: string
  category: string
  tags: string[]
  createdBy: Types.ObjectId
  memberCount: number
  postCount: number
  coverColor: string
  createdAt: Date
  updatedAt: Date
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    coverColor: { type: String, default: "teal" },
  },
  { timestamps: true }
)

GroupSchema.index({ category: 1 })

export const Group = models.Group || model<IGroup>("Group", GroupSchema)
