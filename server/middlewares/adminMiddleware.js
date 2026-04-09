import User from "../models/User.js";

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.auth.userId).select("isAdmin");
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
