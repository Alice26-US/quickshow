import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/me", requireAuth, getMe);

export default authRouter;
