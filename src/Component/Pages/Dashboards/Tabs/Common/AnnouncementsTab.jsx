import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiPlus, FiTrash2, FiX, FiAlertCircle, FiInfo, FiAlertTriangle, FiBookmark, FiGlobe, FiSend } from 'react-icons/fi';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../../service/api';

const priorityConfig = {
  low: { color: '#10b981', bg: '#f0fdf4', icon: FiInfo, label: 'Low' },
  medium: { color: '#f59e0b', bg: '#fffbeb', icon: FiAlertCircle, label: 'Medium' },
  high: { color: '#ef4444', bg: '#fef2f2', icon: FiAlertTriangle, label: 'High' },
  urgent: { color: '#dc2626', bg: '#fff1f2', icon: FiAlertTriangle, label: 'Urgent' },
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
    } catch { 
      showToast('Failed to load announcements', 'error');
    } finally {
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
      showToast('Announcement posted successfully');
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
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      showToast('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 backdrop-blur-md"
            style={{ background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)' }}
          >
            {toast.type === 'error' ? <FiAlertCircle size={20} /> : <FiSend size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <FiBell size={28} className="animate-bounce-slow" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Announcements</h2>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              {department === 'All' ? (
                <>
                  <FiGlobe className="text-indigo-500" />
                  Broadcasted to all company departments
                </>
              ) : (
                <>
                  <FiInfo className="text-indigo-500" />
                  Internal updates for {department}
                </>
              )}
            </p>
          </div>
        </div>
        {isHead && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-bold shadow-lg shadow-indigo-200 transition-all"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            <FiPlus size={20} />
            Post New Alert
          </motion.button>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] p-10 w-full max-w-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FiSend size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Create Announcement</h3>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                  <input
                    type="text" value={form.title}
                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                    placeholder="Enter a catchy title..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Message Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
                    rows={5}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
                    placeholder="Describe the update in detail..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Priority Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(priorityConfig).map(([key, pc]) => (
                      <button
                        key={key} type="button"
                        onClick={() => setForm(p => ({ ...p, priority: key }))}
                        className={`py-3 rounded-2xl text-sm font-black transition-all border-2 flex items-center justify-center gap-2 ${
                          form.priority === key 
                          ? 'shadow-lg' 
                          : 'opacity-60 hover:opacity-100 border-slate-100 bg-slate-50 text-slate-400'
                        }`}
                        style={form.priority === key ? { borderColor: pc.color, backgroundColor: pc.bg, color: pc.color } : {}}
                      >
                        <pc.icon size={16} />
                        {pc.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit" disabled={submitting}
                    className="w-full py-5 rounded-[24px] text-white font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:scale-[1.01]"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Broadcasting...
                      </>
                    ) : (
                      <>
                        <FiSend size={22} />
                        Post Announcement
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Section */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm animate-pulse flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-6 w-1/3 bg-slate-50 rounded-lg" />
                  <div className="h-4 w-full bg-slate-50 rounded-lg" />
                  <div className="h-4 w-2/3 bg-slate-50 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200"
          >
            <div className="w-24 h-24 rounded-[32px] bg-indigo-50 text-indigo-200 flex items-center justify-center mb-6">
              <FiBell size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Silence is Golden</h3>
            <p className="text-slate-400 font-medium mt-2 max-w-sm text-center">There are no announcements currently active. New updates will appear here once posted.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann, idx) => {
              const pc = priorityConfig[ann.priority] || priorityConfig.medium;
              return (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all flex items-start gap-6 relative overflow-hidden"
                >
                  {/* Priority Accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: pc.color }} />
                  
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: pc.bg, color: pc.color }}>
                    <pc.icon size={26} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      {ann.pinned && (
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                          <FiBookmark size={12} />
                          Pinned
                        </span>
                      )}
                      <h4 className="text-xl font-black text-slate-900 truncate">{ann.title}</h4>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm" style={{ color: pc.color, backgroundColor: pc.bg }}>
                        {pc.label} Priority
                      </span>
                    </div>
                    
                    <p className="text-slate-600 font-medium leading-relaxed mb-6 whitespace-pre-wrap">{ann.content}</p>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                          {ann.postedByName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{ann.postedByName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(ann.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      {isHead && (
                        <button 
                          onClick={() => handleDelete(ann.id)} 
                          className="w-10 h-10 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                          title="Delete Announcement"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsTab;
