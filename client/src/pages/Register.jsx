import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice.js';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  useEffect(() => { if (token) navigate('/dashboard'); }, [token, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50 dark:bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-sage-100 dark:border-gray-800"
      >
        <div className="text-center mb-8">
          <span className="text-4xl">🌱</span>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mt-3">Start your journey</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create your free MindfulMe account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input" placeholder="Your name" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min. 6 characters" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" className="input" placeholder="Repeat password" required
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
            ) : 'Create Account 🌿'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sage-600 dark:text-sage-400 font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
