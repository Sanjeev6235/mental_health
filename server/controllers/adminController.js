import User from '../models/User.js';
import Mood from '../models/Mood.js';
import QuizResult from '../models/QuizResult.js';
import Chat from '../models/Chat.js';

// @route  GET /api/admin/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalQuizzes, totalMoodLogs, totalChats] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      QuizResult.countDocuments(),
      Mood.countDocuments(),
      Chat.countDocuments(),
    ]);

    // Average scores per quiz type
    const avgScores = await QuizResult.aggregate([
      {
        $group: {
          _id: '$quizType',
          avgScore: { $avg: '$score' },
          avgMaxScore: { $avg: '$maxScore' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Mood distribution
    const moodDist = await Mood.aggregate([
      { $group: { _id: '$moodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent registrations (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    // Quiz result distribution
    const resultDist = await QuizResult.aggregate([
      { $group: { _id: { type: '$quizType', result: '$result' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalQuizzes,
        totalMoodLogs,
        totalChats,
        newUsers,
        avgScores,
        moodDist,
        resultDist,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    // Cascade delete user data
    await Promise.all([
      Mood.deleteMany({ userId: req.params.id }),
      QuizResult.deleteMany({ userId: req.params.id }),
      Chat.deleteMany({ userId: req.params.id }),
    ]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/admin/quiz-analytics
export const getQuizAnalytics = async (req, res, next) => {
  try {
    const analytics = await QuizResult.aggregate([
      {
        $group: {
          _id: { type: '$quizType', result: '$result' },
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
        },
      },
      { $sort: { '_id.type': 1 } },
    ]);

    res.json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
};
