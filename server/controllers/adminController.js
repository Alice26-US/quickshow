import User from '../models/User.js';
import Topic from '../models/Topic.js';
import Session from '../models/Session.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTopics = await Topic.countDocuments();
    const activeSessions = await Session.countDocuments();
    const proUsers = await User.countDocuments({ isPro: true });

    // Try to fetch recent sessions for activity feed
    const recentActivityRaw = await Session.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('userId', 'name image')
      .populate('topicId', 'title');

    // format it easily for frontend consumption
    const recentActivity = recentActivityRaw.map(session => ({
        id: session._id,
        user: session.userId?.name || "Deleted User",
        userInitials: (session.userId?.name || "DU").substring(0, 2).toUpperCase(),
        topic: session.topicId?.title || "Deleted Topic",
        time: session.createdAt
    }));

    res.json({
        success: true,
        stats: {
           totalTopics,
           totalUsers,
           activeSessions,
           proUsers
        },
        recentActivity
    });
  } catch(error) {
     res.status(500).json({ success: false, message: error.message });
  }
}
