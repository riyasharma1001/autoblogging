// models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  approved: { type: Boolean, default: false }, // if you want moderation; otherwise default to true
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
