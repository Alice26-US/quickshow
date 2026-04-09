import Session from '../models/Session.js';
import Topic from '../models/Topic.js';
import mongoose from 'mongoose';

export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({})
      .populate('userId', 'name email image')
      .populate('topicId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSession = async (req, res) => {
  try {
    const { userId, topicId } = req.body;

    if (!userId || !topicId) {
      return res.status(400).json({ success: false, message: 'userId and topicId are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ success: false, message: 'Invalid topicId' });
    }

    const topicExists = await Topic.exists({ _id: topicId });
    if (!topicExists) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    
    const session = new Session({
      userId,
      topicId,
      chatHistory: []
    });

    await session.save();
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("topicId");
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveChatMessage = async (req, res) => {
    try {
      const { sessionId, role, content } = req.body;
      const session = await Session.findById(sessionId);
      if(!session) return res.status(404).json({ success: false, message: "Session not found" });
  
      session.chatHistory.push({ role, content });
      await session.save();
      
      res.status(200).json({ success: true, session });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.auth.userId })
      .populate('topicId', 'title thumbnail level')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
