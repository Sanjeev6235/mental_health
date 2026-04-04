import User from '../models/User.js';
import QuizResult from '../models/QuizResult.js';
import Mood from '../models/Mood.js';

// @route  GET /api/users/profile
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

// @route  PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profilePic } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, profilePic },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/users/password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/users/stats
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [quizCount, moodCount, recentQuizzes, recentMoods] = await Promise.all([
      QuizResult.countDocuments({ userId }),
      Mood.countDocuments({ userId }),
      QuizResult.find({ userId }).sort({ createdAt: -1 }).limit(3),
      Mood.find({ userId }).sort({ date: -1 }).limit(7),
    ]);

    const user = await User.findById(userId);

    res.json({
      success: true,
      stats: {
        streak: user.streak,
        totalQuizzes: quizCount,
        totalMoodLogs: moodCount,
        recentQuizzes,
        recentMoods,
      },
    });
  } catch (err) {
    next(err);
  }
};
