import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    profilePic: {
      type: String,
      default: '', // URL or base64
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    totalQuizzes: {
      type: Number,
      default: 0,
    },
    totalMoodLogs: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update streak on activity
userSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastActiveDate) {
    this.streak = 1;
  } else {
    const last = new Date(this.lastActiveDate);
    last.setHours(0, 0, 0, 0);
    const diff = (today - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      this.streak += 1; // Consecutive day
    } else if (diff > 1) {
      this.streak = 1; // Streak broken
    }
    // diff === 0 means same day, don't change streak
  }
  this.lastActiveDate = new Date();
};

export default mongoose.model('User', userSchema);
