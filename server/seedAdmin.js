import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "./models/User.js";
import connectDB from "./configs/db.js";
import "dotenv/config";

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const email = "admin@gmail.com";
    const password = "password123";

    // Delete existing if it happens to be there to avoid duplicates
    await User.deleteOne({ email });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newId = crypto.randomUUID();

    await User.create({
      _id: newId,
      name: "Super Admin",
      email: email,
      password: hashedPassword,
      image: "https://via.placeholder.com/150",
      isPro: true,
      isAdmin: true
    });

    console.log("Admin user successfully created!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
