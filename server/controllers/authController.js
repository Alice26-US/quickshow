import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "default_super_secret", {
    expiresIn: "30d",
  });
};

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
        user: { _id: user._id, name: user.name, email: user.email, image: user.image, isPro: user.isPro, isAdmin: user.isAdmin },
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

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        user: { _id: user._id, name: user.name, email: user.email, image: user.image, isPro: user.isPro, isAdmin: user.isAdmin },
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
    const user = await User.findById(req.auth.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
