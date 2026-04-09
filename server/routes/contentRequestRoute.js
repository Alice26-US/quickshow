import express from "express";
import {
  createContentRequest,
  getAllContentRequests,
  getMyContentRequests,
  updateContentRequest,
} from "../controllers/contentRequestController.js";
import { requireAdmin } from "../middlewares/adminMiddleware.js";

const requestRouter = express.Router();

requestRouter.post("/", createContentRequest);
requestRouter.get("/my", getMyContentRequests);
requestRouter.get("/admin", requireAdmin, getAllContentRequests);
requestRouter.put("/admin/:id", requireAdmin, updateContentRequest);

export default requestRouter;
