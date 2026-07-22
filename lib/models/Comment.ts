import { Schema, model, models, Document, Types } from "mongoose"

export interface IComment extends Document {
  postId: Types.ObjectId
  authorId: Types.ObjectId
  body: string
  parentCommentId: Types.ObjectId | null
  upvotes: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
)

CommentSchema.index({ postId: 1, createdAt: 1 })

export const Comment = models.Comment || model<IComment>("Comment", CommentSchema)
