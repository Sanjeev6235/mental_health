/**
 * seed.js — Populates the database with demo data
 * Run: node seed.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindfulme';

// ─── Inline schemas (mirrors models/) ────────────────────────
const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'user' }, streak: { type: Number, default: 0 }, lastActiveDate: Date, totalQuizzes: { type: Number, default: 0 }, totalMoodLogs: { type: Number, default: 0 }, bio: String, profilePic: String }, { timestamps: true });
const moodSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, moodType: String, note: String, intensity: Number, date: { type: Date, default: Date.now } }, { timestamps: true });
const quizSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, quizType: String, answers: Array, score: Number, maxScore: Number, result: String, suggestions: [String] }, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Mood = mongoose.model('Mood', moodSchema);
const QuizResult = mongoose.model('QuizResult', quizSchema);

const MOODS = ['happy', 'sad', 'angry', 'stressed', 'anxious', 'calm', 'excited', 'tired'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Mood.deleteMany({}), QuizResult.deleteMany({})]);
  console.log('🗑️  Cleared existing data');

  // Hash passwords
  const salt = await bcrypt.genSalt(12);
  const userHash = await bcrypt.hash('demo1234', salt);
  const adminHash = await bcrypt.hash('admin1234', salt);

  // Create users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: adminHash,
    role: 'admin',
    streak: 14,
    bio: 'Platform administrator',
    totalQuizzes: 5,
    totalMoodLogs: 20,
  });

  const user1 = await User.create({
    name: 'Alex Johnson',
    email: 'user@demo.com',
    password: userHash,
    role: 'user',
    streak: 7,
    bio: 'Working on my mental wellness journey 🌱',
    totalQuizzes: 8,
    totalMoodLogs: 30,
  });

  const user2 = await User.create({
    name: 'Sam Rivera',
    email: 'sam@demo.com',
    password: userHash,
    role: 'user',
    streak: 3,
    totalQuizzes: 3,
    totalMoodLogs: 12,
  });

  console.log('👥 Created users');

  // Seed moods (30 days back for user1)
  const moodLogs = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // 1-3 logs per day
    const logsToday = randInt(1, 3);
    for (let j = 0; j < logsToday; j++) {
      moodLogs.push({
        userId: user1._id,
        moodType: rand(MOODS),
        note: rand(['Feeling okay today', 'Rough day at work', 'Had a good workout', 'Slept well', '', '', '']),
        intensity: randInt(3, 9),
        date: new Date(date.getTime() + j * 3600000),
      });
    }
  }

  // Moods for user2
  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    moodLogs.push({ userId: user2._id, moodType: rand(MOODS), intensity: randInt(2, 10), date });
  }

  await Mood.insertMany(moodLogs);
  console.log(`😊 Seeded ${moodLogs.length} mood logs`);

  // Seed quiz results
  const quizTypes = ['anxiety', 'stress', 'depression'];
  const results = ['minimal', 'low', 'moderate', 'high'];
  const quizLogs = [];

  for (let i = 0; i < 10; i++) {
    const type = rand(quizTypes);
    const maxScore = type === 'stress' ? 40 : type === 'depression' ? 27 : 21;
    const score = randInt(0, maxScore);
    const pct = score / maxScore;
    const result = pct < 0.25 ? 'minimal' : pct < 0.5 ? 'low' : pct < 0.75 ? 'moderate' : 'high';
    const date = new Date();
    date.setDate(date.getDate() - randInt(0, 25));

    quizLogs.push({ userId: user1._id, quizType: type, answers: [], score, maxScore, result, suggestions: [], createdAt: date });
  }

  for (let i = 0; i < 4; i++) {
    const type = rand(quizTypes);
    const maxScore = type === 'stress' ? 40 : type === 'depression' ? 27 : 21;
    const score = randInt(0, maxScore);
    const pct = score / maxScore;
    const result = pct < 0.25 ? 'minimal' : pct < 0.5 ? 'low' : pct < 0.75 ? 'moderate' : 'high';
    quizLogs.push({ userId: user2._id, quizType: type, answers: [], score, maxScore, result, suggestions: [] });
  }

  await QuizResult.insertMany(quizLogs);
  console.log(`🧠 Seeded ${quizLogs.length} quiz results`);

  console.log('\n🎉 Seed complete! Demo accounts:');
  console.log('   👤 User:  user@demo.com  / demo1234');
  console.log('   👑 Admin: admin@demo.com / admin1234');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
