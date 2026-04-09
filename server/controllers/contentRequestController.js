import ContentRequest from "../models/ContentRequest.js";
import User from "../models/User.js";

const VALID_REQUEST_TYPES = new Set(["video", "flashcard", "both"]);
const VALID_STATUSES = new Set(["pending", "in_review", "scheduled", "fulfilled", "rejected"]);

export const createContentRequest = async (req, res) => {
  try {
    const { requestType, topic, message, studentEmail } = req.body;
    const authUserId = req.auth?.userId;

    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!VALID_REQUEST_TYPES.has(requestType)) {
      return res.status(400).json({ success: false, message: "Invalid request type" });
    }

    const safeTopic = String(topic || "").trim();
    const safeMessage = String(message || "").trim();
    if (!safeTopic || !safeMessage) {
      return res.status(400).json({ success: false, message: "Topic and request details are required" });
    }

    const user = await User.findById(authUserId).select("name email");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const fallbackEmail = String(user.email || "").trim().toLowerCase();
    const safeStudentEmail = String(studentEmail || fallbackEmail).trim().toLowerCase();
    if (!safeStudentEmail) {
      return res.status(400).json({ success: false, message: "Student email is required" });
    }

    const createdRequest = await ContentRequest.create({
      userId: authUserId,
      studentName: String(user.name || "").trim(),
      studentEmail: safeStudentEmail,
      requestType,
      topic: safeTopic,
      message: safeMessage,
    });

    return res.status(201).json({ success: true, request: createdRequest });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyContentRequests = async (req, res) => {
  try {
    const authUserId = req.auth?.userId;
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const requests = await ContentRequest.find({ userId: authUserId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllContentRequests = async (req, res) => {
  try {
    const requests = await ContentRequest.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback, availableAt, videoLink } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Request id is required" });
    }

    const updateData = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.has(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      updateData.status = status;
    }

    if (adminFeedback !== undefined) {
      updateData.adminFeedback = String(adminFeedback || "").trim();
    }

    if (videoLink !== undefined) {
      updateData.videoLink = String(videoLink || "").trim();
    }

    if (availableAt !== undefined) {
      if (!availableAt) {
        updateData.availableAt = null;
      } else {
        const parsedDate = new Date(availableAt);
        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid available date" });
        }
        updateData.availableAt = parsedDate;
      }
    }

    if (req.auth?.userId) {
      updateData.reviewedBy = req.auth.userId;
    }

    const updatedRequest = await ContentRequest.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    return res.status(200).json({ success: true, request: updatedRequest, message: "Request updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
