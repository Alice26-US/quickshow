import Session from '../models/Session.js';

export const createSession = async (req, res) => {
  try {
    const { userId, topicId } = req.body;
    
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
