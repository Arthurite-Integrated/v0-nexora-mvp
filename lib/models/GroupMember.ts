import { Schema, model, models, Document, Types } from "mongoose"

export interface IGroupMember extends Document {
  groupId: Types.ObjectId
  userId: Types.ObjectId
  role: "member" | "moderator"
  joinedAt: Date
}

const GroupMemberSchema = new Schema<IGroupMember>({
  groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["member", "moderator"], default: "member" },
  joinedAt: { type: Date, default: Date.now },
})

GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true })

export const GroupMember = models.GroupMember || model<IGroupMember>("GroupMember", GroupMemberSchema)
