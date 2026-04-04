import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="card p-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>{icon}</div>
    <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    {sub && <p className="text-xs text-green-500 mt-0.5">{sub}</p>}
  </div>
);

const RESULT_COLORS = { minimal: '#22c55e', low: '#84cc16', moderate: '#f59e0b', high: '#f97316', severe: '#ef4444' };
const MOOD_COLORS = { happy: '#22c55e', calm: '#3b82f6', excited: '#f59e0b', sad: '#6366f1', angry: '#ef4444', stressed: '#f97316', anxious: '#8b5cf6', tired: '#78716c' };

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/users'),
    ])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    try {
      const { data } = await api.get(`/admin/users?search=${q}`);
      setUsers(data.users);
    } catch {}
  };

  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`Delete user "${name}"? This will remove all their data.`)) return;
    setDeleting(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success(`User "${name}" deleted`);
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  // Prepare chart data
  const moodPieData = stats?.moodDist?.map((m) => ({
    name: m._id.charAt(0).toUpperCase() + m._id.slice(1),
    value: m.count,
    fill: MOOD_COLORS[m._id] || '#ccc',
  })) || [];

  const quizBarData = ['anxiety', 'stress', 'depression'].map((type) => {
    const entry = stats?.avgScores?.find((s) => s._id === type);
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      avgScore: entry ? Math.round(entry.avgScore) : 0,
      count: entry?.count || 0,
    };
  });

  const resultBarData = (() => {
    const grouped = {};
    stats?.resultDist?.forEach(({ _id, count }) => {
      if (!grouped[_id.type]) grouped[_id.type] = {};
      grouped[_id.type][_id.result] = count;
    });
    return Object.entries(grouped).map(([type, results]) => ({ name: type, ...results }));
  })();

  const tabs = ['overview', 'users', 'analytics'];

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400">Loading admin data...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">⚙️</span>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Monitor and manage the platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-sage-50 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="👥" label="Total Users" value={stats?.totalUsers || 0} sub={`+${stats?.newUsers || 0} this week`} color="bg-blue-50 dark:bg-blue-900/20" />
            <StatCard icon="📊" label="Total Quizzes" value={stats?.totalQuizzes || 0} color="bg-purple-50 dark:bg-purple-900/20" />
            <StatCard icon="😊" label="Mood Logs" value={stats?.totalMoodLogs || 0} color="bg-green-50 dark:bg-green-900/20" />
            <StatCard icon="💬" label="Chat Sessions" value={stats?.totalChats || 0} color="bg-amber-50 dark:bg-amber-900/20" />
          </div>

          {/* Charts row 1 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-5">
              <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-4">Average Quiz Scores</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={quizBarData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#5a8260" radius={[6, 6, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-4">Mood Distribution</h3>
              {moodPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={moodPieData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                      {moodPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-gray-400 py-10 text-center">No mood data available</p>}
            </div>
          </div>

          {/* Quiz result distribution */}
          {resultBarData.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-4">Quiz Result Distribution by Severity</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={resultBarData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {Object.entries(RESULT_COLORS).map(([result, color]) => (
                    <Bar key={result} dataKey={result} fill={color} stackId="a" name={result.charAt(0).toUpperCase() + result.slice(1)} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-sage-100 dark:border-gray-800 flex items-center gap-3">
              <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 flex-1">All Users ({users.length})</h3>
              <input
                className="input w-64 py-2 text-sm"
                placeholder="Search by name or email..."
                value={search}
                onChange={handleSearch}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sage-50 dark:bg-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streak</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-50 dark:divide-gray-800">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-sage-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sage-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-sage-700 dark:text-sage-300 overflow-hidden shrink-0">
                            {u.profilePic ? <img src={u.profilePic} alt="" className="w-full h-full object-cover" /> : u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge px-2 py-0.5 ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-400'}`}>
                          {u.role === 'admin' ? '👑 Admin' : '🌿 User'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">🔥 {u.streak || 0}</td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={deleting === u._id}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
                          >
                            {deleting === u._id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-3xl mb-2">👥</p>
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-4">
            {quizBarData.map((q) => (
              <div key={q.name} className="card p-5 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{q.name} Test</p>
                <p className="text-3xl font-bold font-display text-gray-900 dark:text-white">{q.avgScore}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                <p className="text-xs text-gray-400 mt-1">{q.count} submissions</p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-4">Platform Health Metrics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-sage-50 dark:bg-gray-800 rounded-xl text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalQuizzes && stats?.totalUsers ? Math.round(stats.totalQuizzes / Math.max(stats.totalUsers, 1) * 10) / 10 : 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">Avg quizzes/user</p>
              </div>
              <div className="p-4 bg-sage-50 dark:bg-gray-800 rounded-xl text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalMoodLogs && stats?.totalUsers ? Math.round(stats.totalMoodLogs / Math.max(stats.totalUsers, 1) * 10) / 10 : 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">Avg mood logs/user</p>
              </div>
              <div className="p-4 bg-sage-50 dark:bg-gray-800 rounded-xl text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.newUsers || 0}</p>
                <p className="text-xs text-gray-400 mt-1">New users this week</p>
              </div>
              <div className="p-4 bg-sage-50 dark:bg-gray-800 rounded-xl text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalChats || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Total chat sessions</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
