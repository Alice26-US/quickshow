import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  chatHistory: [
    {
      role: {
        type: String,
        enum: ["user", "assistant", "system"],
      },
      content: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

export default mongoose.models.Session || mongoose.model("Session", sessionSchema);
