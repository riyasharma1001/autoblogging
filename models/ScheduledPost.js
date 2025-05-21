// models/ScheduledPost.js
import mongoose from "mongoose";

const ScheduledPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  // The time at which the post should be published
  scheduledTime: { type: Date, required: true },
  // Categories for the post (can be one or multiple)
  categories: { type: [String], default: [] },
  // Status to determine if the post is pending, published, or failed
  status: {
    type: String,
    enum: ["pending", "published", "failed"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

// Create a text index on title and content for search (optional)
ScheduledPostSchema.index({ title: "text", content: "text" });

export default mongoose.models.ScheduledPost || mongoose.model("ScheduledPost", ScheduledPostSchema);
