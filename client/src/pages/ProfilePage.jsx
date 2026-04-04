import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../redux/slices/authSlice.js';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', profilePic: user?.profilePic || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    api.get('/users/stats').then(({ data }) => setStats(data.stats)).catch(() => {});
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(updateUserProfile(form)).unwrap();
      toast.success('Profile updated! 🌿');
      setEditing(false);
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setChangingPw(true);
    try {
      await api.put('/users/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setChangingPw(false);
    }
  };

  // Download PDF report
  const downloadReport = async () => {
    toast.loading('Generating report...', { id: 'pdf' });
    try {
      const [moodsRes, quizzesRes] = await Promise.all([
        api.get('/moods?range=month'),
        api.get('/quizzes/history'),
      ]);

      const doc = new jsPDF();
      const moods = moodsRes.data.moods || [];
      const quizzes = quizzesRes.data.results || [];
      let y = 20;

      // Header
      doc.setFillColor(74, 124, 89);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('🌿 MindfulMe Wellness Report', 15, 25);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 35);

      y = 55;
      doc.setTextColor(0, 0, 0);

      // User info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('User Profile', 15, y); y += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${user.name}`, 15, y); y += 6;
      doc.text(`Email: ${user.email}`, 15, y); y += 6;
      doc.text(`Member since: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}`, 15, y); y += 6;
      doc.text(`Current streak: ${user.streak || 0} days 🔥`, 15, y); y += 14;

      // Stats
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Activity Summary (Last 30 Days)', 15, y); y += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total mood logs: ${moods.length}`, 15, y); y += 6;
      doc.text(`Total quizzes taken: ${quizzes.length}`, 15, y); y += 14;

      // Mood summary
      if (moods.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Mood Breakdown', 15, y); y += 8;
        const counts = {};
        moods.forEach((m) => { counts[m.moodType] = (counts[m.moodType] || 0) + 1; });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([mood, count]) => {
          doc.text(`• ${mood.charAt(0).toUpperCase() + mood.slice(1)}: ${count} times`, 15, y); y += 6;
        });
        y += 8;
      }

      // Quiz results
      if (quizzes.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Quiz Results', 15, y); y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        quizzes.slice(0, 10).forEach((q) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(`• ${q.quizType.charAt(0).toUpperCase() + q.quizType.slice(1)} Test — Score: ${q.score}/${q.maxScore} (${q.result}) — ${new Date(q.createdAt).toLocaleDateString()}`, 15, y);
          y += 6;
        });
        y += 8;
      }

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('This report is for personal reference only. Consult a professional for clinical advice.', 15, 285);

      doc.save(`mindfulme-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report downloaded!', { id: 'pdf' });
    } catch (err) {
      toast.error('Failed to generate report', { id: 'pdf' });
    }
  };

  const tabs = ['profile', 'security', 'history'];

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <button onClick={downloadReport} className="btn-outline text-sm flex items-center gap-2">
          📄 Download Report
        </button>
      </div>

      {/* Profile header card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-sage-200 dark:bg-sage-800 flex items-center justify-center text-2xl font-bold text-sage-700 dark:text-sage-300 overflow-hidden">
            {user?.profilePic
              ? <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            {user?.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">"{user.bio}"</p>}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span>🔥</span>
              <span className="font-bold text-amber-600">{user?.streak || 0}</span>
            </div>
            <p className="text-xs text-gray-400">day streak</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-sage-100 dark:border-gray-800">
          <div className="text-center">
            <p className="text-xl font-bold font-display text-gray-900 dark:text-white">{stats?.totalMoodLogs || 0}</p>
            <p className="text-xs text-gray-400">Mood Logs</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-display text-gray-900 dark:text-white">{stats?.totalQuizzes || 0}</p>
            <p className="text-xs text-gray-400">Quizzes</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-display text-gray-900 dark:text-white">{user?.role === 'admin' ? '👑' : '🌿'}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-sage-50 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200">Edit Profile</h3>
            <button onClick={() => setEditing(!editing)} className="btn-outline text-sm">
              {editing ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!editing} />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input resize-none" rows={3} placeholder="Tell us about yourself..."
                value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} disabled={!editing} />
            </div>
            <div>
              <label className="label">Profile Picture URL</label>
              <input className="input" placeholder="https://..." value={form.profilePic}
                onChange={(e) => setForm({ ...form, profilePic: e.target.value })} disabled={!editing} />
            </div>
            {editing && (
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : '💾 Save Changes'}
              </button>
            )}
          </form>
        </motion.div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-5">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" required value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" required value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" required value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
            <button type="submit" disabled={changingPw} className="btn-primary flex items-center gap-2">
              {changingPw ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : '🔒 Update Password'}
            </button>
          </form>
        </motion.div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-3">Recent Quizzes</h3>
            {stats?.recentQuizzes?.length ? (
              <div className="space-y-2">
                {stats.recentQuizzes.map((q, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-sage-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <p className="font-medium text-sm capitalize text-gray-800 dark:text-gray-200">{q.quizType} Test</p>
                      <p className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{q.score}/{q.maxScore}</p>
                      <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{q.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No quiz history yet.</p>}
          </div>
        </motion.div>
      )}
    </div>
  );
}
