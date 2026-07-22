import { Schema, model, models, Document, Types } from "mongoose"

export interface IPost extends Document {
  groupId: Types.ObjectId
  authorId: Types.ObjectId
  title: string
  body: string
  upvotes: Types.ObjectId[]
  commentCount: number
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    commentCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
)

PostSchema.index({ groupId: 1, createdAt: -1 })
PostSchema.index({ groupId: 1, isPinned: -1, createdAt: -1 })

export const Post = models.Post || model<IPost>("Post", PostSchema)
