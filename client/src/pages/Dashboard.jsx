import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../services/api.js';

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card p-5"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>
      {icon}
    </div>
    <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
  </motion.div>
);

const QuickAction = ({ to, icon, label, desc, color }) => (
  <Link to={to} className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group block">
    <span className={`text-3xl block mb-3 group-hover:scale-110 transition-transform`}>{icon}</span>
    <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
  </Link>
);

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const moodEmojis = { happy: '😄', sad: '😔', angry: '😡', stressed: '😫', anxious: '😰', calm: '😌', excited: '🤩', tired: '😴' };
  const resultColors = { minimal: 'text-green-600', low: 'text-lime-600', moderate: 'text-amber-600', high: 'text-orange-600', severe: 'text-red-600' };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="font-display text-3xl font-bold text-gray-900 dark:text-white"
        >
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-gray-500 dark:text-gray-400 mt-1"
        >
          How are you feeling today? Let's check in.
        </motion.p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🔥" label="Day Streak" value={user?.streak || 0} color="bg-amber-50 dark:bg-amber-900/20" delay={0.1} />
        <StatCard icon="📊" label="Quizzes Taken" value={loading ? '—' : stats?.totalQuizzes || 0} color="bg-lavender-100 dark:bg-purple-900/20" delay={0.15} />
        <StatCard icon="😊" label="Mood Logs" value={loading ? '—' : stats?.totalMoodLogs || 0} color="bg-blue-50 dark:bg-blue-900/20" delay={0.2} />
        <StatCard icon="💬" label="Chat Sessions" value="∞" color="bg-sage-50 dark:bg-sage-900/20" delay={0.25} />
      </div>

      {/* Quick actions */}
      <h2 className="font-display text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickAction to="/mood" icon="😊" label="Log Mood" desc="Record how you feel" />
        <QuickAction to="/quiz" icon="🧠" label="Take a Quiz" desc="Assess your wellness" />
        <QuickAction to="/chat" icon="🤖" label="Talk to AI" desc="Get support now" />
        <QuickAction to="/profile" icon="👤" label="Profile" desc="View your history" />
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent moods */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200">Recent Moods</h3>
            <Link to="/mood" className="text-xs text-sage-600 dark:text-sage-400 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-sage-50 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          ) : stats?.recentMoods?.length ? (
            <div className="space-y-2">
              {stats.recentMoods.slice(0, 5).map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-sage-50 dark:border-gray-800 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{moodEmojis[m.moodType] || '😐'}</span>
                    <span className="capitalize text-sm font-medium text-gray-700 dark:text-gray-300">{m.moodType}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(m.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">😊</p>
              <p className="text-sm text-gray-400">No mood logs yet</p>
              <Link to="/mood" className="text-sm text-sage-600 dark:text-sage-400 mt-1 block hover:underline">Log your first mood →</Link>
            </div>
          )}
        </motion.div>

        {/* Recent quizzes */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200">Recent Quizzes</h3>
            <Link to="/quiz" className="text-xs text-sage-600 dark:text-sage-400 hover:underline">Take quiz →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-sage-50 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          ) : stats?.recentQuizzes?.length ? (
            <div className="space-y-3">
              {stats.recentQuizzes.map((q, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-sage-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200">{q.quizType} Test</p>
                    <p className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{q.score}/{q.maxScore}</p>
                    <p className={`text-xs font-medium capitalize ${resultColors[q.result] || ''}`}>{q.result}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🧠</p>
              <p className="text-sm text-gray-400">No quizzes taken yet</p>
              <Link to="/quiz" className="text-sm text-sage-600 dark:text-sage-400 mt-1 block hover:underline">Take your first quiz →</Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Wellness tip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-6 p-5 bg-gradient-to-r from-sage-600 to-sage-500 rounded-2xl text-white"
      >
        <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">Daily Tip 💡</p>
        <p className="font-medium">Take 5 minutes today to practice mindful breathing. Inhale for 4 counts, hold for 4, exhale for 4. Your nervous system will thank you. 🌿</p>
      </motion.div>
    </div>
  );
}
