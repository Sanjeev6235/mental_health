import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice.js';
import { toggleTheme } from '../../redux/slices/themeSlice.js';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/mood', icon: '😊', label: 'Mood Tracker' },
  { to: '/quiz', icon: '🧠', label: 'Mental Health Quiz' },
  { to: '/chat', icon: '🤖', label: 'AI Chatbot' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { mode } = useSelector((s) => s.theme);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌿</span>
          <span className="font-display text-xl font-bold text-sage-700 dark:text-sage-300">MindfulMe</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 pl-0.5">Your wellness companion</p>
      </div>

      {/* Streak badge */}
      {user?.streak > 0 && (
        <div className="mx-4 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{user.streak} Day Streak!</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Keep it going</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="text-base">⚙️</span>
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-sage-100 dark:border-gray-800 space-y-1">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="sidebar-link w-full"
        >
          <span>{mode === 'dark' ? '☀️' : '🌙'}</span>
          <span>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>

      {/* User profile mini */}
      <div className="p-4 border-t border-sage-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sage-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-sage-700 dark:text-sage-300 overflow-hidden">
            {user?.profilePic
              ? <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate dark:text-gray-200">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-sage-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-sage-100 dark:border-gray-800 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-sage-100 dark:border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sage-50 dark:hover:bg-gray-800">
            <div className="space-y-1.5">
              <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300"></span>
              <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300"></span>
              <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300"></span>
            </div>
          </button>
          <span className="font-display font-bold text-sage-700 dark:text-sage-300">🌿 MindfulMe</span>
          <button onClick={() => dispatch(toggleTheme())} className="p-2 rounded-lg hover:bg-sage-50 dark:hover:bg-gray-800 text-lg">
            {mode === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
