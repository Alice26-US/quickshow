import mongoose from "mongoose";

const contentRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      default: "",
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    requestType: {
      type: String,
      enum: ["video", "flashcard", "both"],
      required: true,
      default: "video",
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "in_review", "scheduled", "fulfilled", "rejected"],
      default: "pending",
      index: true,
    },
    adminFeedback: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    availableAt: {
      type: Date,
      default: null,
    },
    videoLink: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ContentRequest ||
  mongoose.model("ContentRequest", contentRequestSchema);
