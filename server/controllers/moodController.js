import Mood from '../models/Mood.js';
import User from '../models/User.js';

// @route  POST /api/moods
export const logMood = async (req, res, next) => {
  try {
    const { moodType, note, intensity } = req.body;

    if (!moodType) {
      return res.status(400).json({ message: 'Mood type is required' });
    }

    const mood = await Mood.create({
      userId: req.user._id,
      moodType,
      note,
      intensity: intensity || 5,
    });

    // Update user's streak and count
    const user = await User.findById(req.user._id);
    user.totalMoodLogs += 1;
    user.updateStreak();
    await user.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, mood });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/moods - Get user moods with filters
export const getMoods = async (req, res, next) => {
  try {
    const { range = 'week' } = req.query;

    const now = new Date();
    let startDate;

    if (range === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(0); // All time
    }

    const moods = await Mood.find({
      userId: req.user._id,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    // Build daily summary for charts
    const dailySummary = {};
    moods.forEach((m) => {
      const day = m.date.toISOString().split('T')[0];
      if (!dailySummary[day]) dailySummary[day] = {};
      dailySummary[day][m.moodType] = (dailySummary[day][m.moodType] || 0) + 1;
    });

    // Mood frequency count
    const moodCounts = {};
    moods.forEach((m) => {
      moodCounts[m.moodType] = (moodCounts[m.moodType] || 0) + 1;
    });

    res.json({ success: true, moods, dailySummary, moodCounts, total: moods.length });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/moods/:id
export const deleteMood = async (req, res, next) => {
  try {
    const mood = await Mood.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!mood) return res.status(404).json({ message: 'Mood log not found' });
    res.json({ success: true, message: 'Mood log deleted' });
  } catch (err) {
    next(err);
  }
};
