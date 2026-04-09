import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "default_super_secret", {
    expiresIn: "30d",
  });
};

const sanitizeSubscriptionState = async (userDoc) => {
  if (!userDoc) return null;

  const hasEnded = userDoc.subscriptionEndAt && new Date(userDoc.subscriptionEndAt) <= new Date();
  if (hasEnded && userDoc.isPro) {
    await User.updateOne(
      { _id: userDoc._id },
      {
        isPro: false,
        subscriptionPlan: "none",
        subscriptionStartAt: null,
        subscriptionEndAt: null,
      }
    );
    userDoc.isPro = false;
    userDoc.subscriptionPlan = "none";
    userDoc.subscriptionStartAt = null;
    userDoc.subscriptionEndAt = null;
  }

  return userDoc;
};

const toAuthUser = (userDoc) => ({
  _id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  image: userDoc.image,
  isPro: userDoc.isPro,
  isAdmin: userDoc.isAdmin,
  subscriptionPlan: userDoc.subscriptionPlan || "none",
  subscriptionStartAt: userDoc.subscriptionStartAt,
  subscriptionEndAt: userDoc.subscriptionEndAt,
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Assign a UUID to maintain compatibility with legacy code expecting String _id
    const newId = crypto.randomUUID();

    const user = await User.create({
      _id: newId,
      name,
      email,
      password: hashedPassword,
      image: "https://via.placeholder.com/150", // Use a default placeholder for image
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: toAuthUser(user),
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    user = await sanitizeSubscriptionState(user);

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        user: toAuthUser(user),
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.auth.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user = await sanitizeSubscriptionState(user);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
