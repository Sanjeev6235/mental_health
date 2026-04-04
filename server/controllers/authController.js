import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @route  POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        bio: user.bio,
        streak: user.streak,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update streak on login
    user.updateStreak();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        bio: user.bio,
        streak: user.streak,
        totalQuizzes: user.totalQuizzes,
        totalMoodLogs: user.totalMoodLogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};
