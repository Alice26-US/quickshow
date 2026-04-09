import User from "../models/User.js";
import bcrypt from "bcryptjs";

const SUBSCRIPTION_PLANS = {
  weekly: { days: 7, price: 500, label: "Weekly" },
  monthly: { days: 30, price: 2000, label: "Monthly" },
  yearly: { days: 365, price: 10000, label: "Yearly" },
};

const keepSubscriptionFresh = async (user) => {
  if (!user) return null;

  const hasEnded =
    user.subscriptionEndAt && new Date(user.subscriptionEndAt) <= new Date();
  if (hasEnded && user.isPro) {
    await User.updateOne(
      { _id: user._id },
      {
        isPro: false,
        subscriptionPlan: "none",
        subscriptionStartAt: null,
        subscriptionEndAt: null,
      }
    );
    user.isPro = false;
    user.subscriptionPlan = "none";
    user.subscriptionStartAt = null;
    user.subscriptionEndAt = null;
  }

  return user;
};

const applySubscriptionPlan = async (user, planId) => {
  const selectedPlan = SUBSCRIPTION_PLANS[planId];
  if (!selectedPlan) {
    throw new Error("Invalid subscription plan");
  }

  const now = new Date();
  const currentEnd = user.subscriptionEndAt ? new Date(user.subscriptionEndAt) : null;
  const startsAt = currentEnd && currentEnd > now ? currentEnd : now;
  const endsAt = new Date(
    startsAt.getTime() + selectedPlan.days * 24 * 60 * 60 * 1000
  );

  user.isPro = true;
  user.subscriptionPlan = planId;
  user.subscriptionStartAt = startsAt;
  user.subscriptionEndAt = endsAt;
  await user.save();

  return {
    plan: planId,
    amount: selectedPlan.price,
    currency: "FCFA",
    startsAt,
    endsAt,
  };
};

// Get user details
export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let user = await User.findById(userId).select("-password");
    if (!user) return res.json({ success: false, message: "User not found" });
    user = await keepSubscriptionFresh(user);
    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Fetch all users for Admin
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json({ success: true, users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Toggle Pro status manually (by Admin)
export const toggleProStatus = async (req, res) => {
  try {
    const { userId, isPro } = req.body;
    const updateData = { isPro };
    if (!isPro) {
      updateData.subscriptionPlan = "none";
      updateData.subscriptionStartAt = null;
      updateData.subscriptionEndAt = null;
    }
    await User.findByIdAndUpdate(userId, updateData);
    res.json({ success: true, message: "User subscription updated" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Mock Mobile Money Payment (no external API)
export const mockPayment = async (req, res) => {
  try {
    const { userId, phoneProvider, phoneNumber, plan } = req.body;
    if (!phoneNumber || !phoneProvider || !plan) {
      return res.json({ success: false, message: "Invalid payment details" });
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan];
    if (!selectedPlan) {
      return res.json({ success: false, message: "Invalid subscription plan selected" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const subscription = await applySubscriptionPlan(user, plan);

    return res.json({
      success: true,
      paymentStatus: "success",
      message: `Mock payment via ${phoneProvider} successful. ${selectedPlan.label} plan activated.`,
      subscription,
    });
  } catch (err) {
    res.json({ success: false, paymentStatus: "failed", message: "Checkout failed" });
  }
};

// Update User Profile & Avatar
export const updateProfile = async (req, res) => {
  try {
    const { name, password, userId } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    if (req.file) {
      updateData.image = `http://localhost:3000/Content/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId || req.body.userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

