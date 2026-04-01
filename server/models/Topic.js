import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner"
  },
  thumbnail: {
    type: String,
    default: ""
  },
  videos: [
    {
      filepath: String, // Path to local content (e.g. Content/videos/file.mp4)
      title: String,
    }
  ],
  flashcards: [
    {
      frontContext: String,
      backAnswer: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Topic || mongoose.model("Topic", topicSchema);
