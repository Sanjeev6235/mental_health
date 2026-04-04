import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MoodTracker from './pages/MoodTracker.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

// Protected route wrapper
const PrivateRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-body text-sm',
          style: { borderRadius: '12px', padding: '12px 16px' },
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected - wrapped in shared Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mood" element={<MoodTracker />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="quiz/:type" element={<QuizPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
