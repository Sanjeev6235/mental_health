import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const MOODS = [
  { type: 'happy',   emoji: '😄', label: 'Happy',   color: '#22c55e', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  { type: 'calm',    emoji: '😌', label: 'Calm',    color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { type: 'excited', emoji: '🤩', label: 'Excited', color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  { type: 'sad',     emoji: '😔', label: 'Sad',     color: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
  { type: 'angry',   emoji: '😡', label: 'Angry',   color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  { type: 'stressed',emoji: '😫', label: 'Stressed',color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
  { type: 'anxious', emoji: '😰', label: 'Anxious', color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  { type: 'tired',   emoji: '😴', label: 'Tired',   color: '#78716c', bg: 'bg-stone-50 dark:bg-stone-900/20 border-stone-200 dark:border-stone-800' },
];

const PIE_COLORS = MOODS.reduce((acc, m) => ({ ...acc, [m.type]: m.color }), {});

export default function MoodTracker() {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [range, setRange] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchMoods = () => {
    setLoading(true);
    api.get(`/moods?range=${range}`)
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMoods(); }, [range]);

  const handleLog = async () => {
    if (!selected) return toast.error('Please select a mood first');
    setSubmitting(true);
    try {
      await api.post('/moods', { moodType: selected, note, intensity });
      toast.success('Mood logged! 🌿');
      setSelected(null); setNote(''); setIntensity(5); setShowForm(false);
      fetchMoods();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log mood');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare bar chart data from daily summary
  const barData = data?.dailySummary
    ? Object.entries(data.dailySummary)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-7)
        .map(([date, counts]) => ({
          date: new Date(date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
          ...counts,
        }))
    : [];

  // Pie chart data
  const pieData = data?.moodCounts
    ? Object.entries(data.moodCounts).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Mood Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Track your emotional patterns over time</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Log Mood'}
        </button>
      </div>

      {/* Log mood form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="card p-6 mb-6 overflow-hidden"
          >
            <h2 className="font-display text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">How are you feeling right now?</h2>

            {/* Mood grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {MOODS.map((m) => (
                <button
                  key={m.type}
                  onClick={() => setSelected(m.type)}
                  className={`mood-btn p-4 rounded-2xl border-2 transition-all text-center ${
                    selected === m.type
                      ? 'border-sage-500 dark:border-sage-400 shadow-md scale-105'
                      : `${m.bg} border-transparent hover:scale-105`
                  }`}
                >
                  <span className="mood-emoji text-3xl block mb-1">{m.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Intensity slider */}
            <div className="mb-4">
              <label className="label">Intensity: {intensity}/10</label>
              <input type="range" min="1" max="10" value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-sage-600" />
            </div>

            {/* Note */}
            <div className="mb-5">
              <label className="label">Add a note (optional)</label>
              <textarea className="input resize-none" rows={2} placeholder="What's on your mind?"
                value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <button onClick={handleLog} disabled={submitting || !selected} className="btn-primary flex items-center gap-2">
              {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Logging...</> : '💾 Save Mood'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Range selector */}
      <div className="flex gap-2 mb-6">
        {['week', 'month', 'year'].map((r) => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${range === r ? 'bg-sage-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-sage-200 dark:border-gray-700 hover:border-sage-400'}`}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="card h-64 animate-pulse bg-sage-50 dark:bg-gray-800" />)}
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">{data?.total || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Logs</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">
                {pieData.length > 0 ? (MOODS.find(m => m.type === pieData.sort((a,b) => b.value - a.value)[0]?.name)?.emoji || '😐') : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Most Common</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">{barData.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Days</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bar chart */}
            <div className="card p-5">
              <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-4">Mood History</h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    {MOODS.map((m) => (
                      <Bar key={m.type} dataKey={m.type} stackId="a" fill={m.color} radius={[0,0,0,0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-3xl mb-2">📊</p>
                    <p className="text-sm">Log moods to see your chart</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pie chart */}
            <div className="card p-5">
              <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-4">Mood Distribution</h3>
              {pieData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={PIE_COLORS[entry.name] || '#ccc'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {pieData.sort((a,b) => b.value - a.value).slice(0, 5).map((d) => {
                      const mood = MOODS.find(m => m.type === d.name);
                      return (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                          <span>{mood?.emoji}</span>
                          <span className="capitalize text-gray-700 dark:text-gray-300 flex-1">{d.name}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{d.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-3xl mb-2">🥧</p>
                    <p className="text-sm">No mood data yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent logs */}
          {data?.moods?.length > 0 && (
            <div className="card p-5 mt-6">
              <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Logs</h3>
              <div className="divide-y divide-sage-50 dark:divide-gray-800">
                {data.moods.slice(0, 10).map((m, i) => {
                  const mood = MOODS.find(md => md.type === m.moodType);
                  return (
                    <div key={i} className="py-3 flex items-center gap-3">
                      <span className="text-2xl">{mood?.emoji || '😐'}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize text-sm text-gray-800 dark:text-gray-200">{m.moodType}</span>
                          <span className="badge bg-sage-50 dark:bg-gray-800 text-sage-700 dark:text-sage-300">
                            {m.intensity}/10
                          </span>
                        </div>
                        {m.note && <p className="text-xs text-gray-400 mt-0.5">{m.note}</p>}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
