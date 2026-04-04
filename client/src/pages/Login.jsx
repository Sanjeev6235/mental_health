import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice.js';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => { if (token) navigate('/dashboard'); }, [token, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-screen flex dark:bg-gray-950">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-sage-600 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${80 + i * 60}px`, height: `${80 + i * 60}px`, top: `${10 + i * 15}%`, left: `${-10 + i * 20}%`, opacity: 0.3 - i * 0.03 }} />
          ))}
        </div>
        <div className="relative z-10">
          <span className="text-4xl">🌿</span>
          <h1 className="font-display text-3xl font-bold mt-4">MindfulMe</h1>
          <p className="text-sage-200 mt-2">Your mental wellness companion</p>
        </div>
        <div className="relative z-10 space-y-6">
          {[
            { emoji: '🧠', title: 'Mental Health Quizzes', desc: 'Assess anxiety, stress & depression' },
            { emoji: '😊', title: 'Mood Tracker', desc: 'Track your emotional patterns' },
            { emoji: '🤖', title: 'AI Chatbot', desc: 'Talk through your feelings anytime' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="text-2xl">{f.emoji}</span>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-sage-200 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-sage-300 text-sm">
          "Taking care of your mind is not a luxury — it's a necessity."
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <span className="text-4xl lg:hidden">🌿</span>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mt-2">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-sage-50 dark:bg-gray-800 rounded-xl text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">Demo accounts:</p>
            <p>User: user@demo.com / demo1234</p>
            <p>Admin: admin@demo.com / admin1234</p>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-sage-600 dark:text-sage-400 font-medium hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
