import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized - missing token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_super_secret");

    req.auth = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
  }
};
