import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String, default: "" },
  isPro: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  subscriptionPlan: {
    type: String,
    enum: ["none", "weekly", "monthly", "yearly"],
    default: "none",
  },
  subscriptionStartAt: { type: Date, default: null },
  subscriptionEndAt: { type: Date, default: null },
})

const User = mongoose.model("User", userSchema);

export default User;
