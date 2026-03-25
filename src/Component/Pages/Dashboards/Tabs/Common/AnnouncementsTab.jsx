import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiPlus, FiTrash2, FiX, FiAlertCircle, FiInfo, FiAlertTriangle, FiBookmark } from 'react-icons/fi';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../../service/api';

const priorityConfig = {
  low: { color: '#10b981', bg: '#d1fae5', icon: FiInfo, label: 'Low' },
  medium: { color: '#f59e0b', bg: '#fef3c7', icon: FiAlertCircle, label: 'Medium' },
  high: { color: '#ef4444', bg: '#fee2e2', icon: FiAlertTriangle, label: 'High' },
  urgent: { color: '#dc2626', bg: '#fecaca', icon: FiAlertTriangle, label: 'Urgent' },
};

const AnnouncementsTab = ({ department, isHead = false }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchAnnouncements(); }, [department]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await getAnnouncements(department);
      setAnnouncements(res.announcements || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      showToast('Please fill all fields', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await createAnnouncement({ ...form, department });
      showToast('Announcement posted');
      setShowForm(false);
      setForm({ title: '', content: '', priority: 'medium' });
      fetchAnnouncements();
    } catch (err) {
      showToast(err.message || 'Failed to post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnnouncement(id);
      showToast('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium"
            style={{ background: toast.type === 'error' ? '#ef4444' : '#10b981' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
          <p className="text-gray-500 text-sm mt-1">Stay updated with department news</p>
        </div>
        {isHead && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <FiPlus style={{ width: '18px', height: '18px' }} />
            New Announcement
          </button>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">New Announcement</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <FiX style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text" value={form.title}
                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Write your announcement..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <div className="flex gap-2">
                    {Object.entries(priorityConfig).map(([key, pc]) => (
                      <button
                        key={key} type="button"
                        onClick={() => setForm(p => ({ ...p, priority: key }))}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all capitalize"
                        style={form.priority === key
                          ? { borderColor: pc.color, background: pc.bg, color: pc.color }
                          : { borderColor: '#e5e7eb', color: '#6b7280' }
                        }
                      >
                        {pc.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-white font-medium"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {submitting ? 'Posting...' : 'Post Announcement'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-gray-200" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <FiBell style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto' }} />
          <p className="text-gray-400 mt-3 font-medium">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann, idx) => {
            const pc = priorityConfig[ann.priority] || priorityConfig.medium;
            return (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                style={{ borderLeft: `4px solid ${pc.color}` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {ann.pinned && <FiBookmark style={{ width: '14px', height: '14px', color: '#6366f1' }} />}
                      <h4 className="font-semibold text-gray-900">{ann.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase" style={{ color: pc.color, background: pc.bg }}>
                        {pc.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {ann.postedByName} • {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {isHead && (
                    <button onClick={() => handleDelete(ann.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <FiTrash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsTab;
