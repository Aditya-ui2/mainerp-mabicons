import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiPlus, FiTrash2, FiX, FiAlertCircle, FiInfo, FiAlertTriangle, FiBookmark, FiGlobe, FiSend, FiEdit2, FiTarget, FiUsers, FiUser, FiCalendar, FiCheck, FiRefreshCw, FiEye } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, getAllClients, getAllAdmins, editAnnouncement } from '../../../service/api';

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

  // New States for Super Admin functionality
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [editableAnnouncement, setEditableAnnouncement] = useState(null);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [targetType, setTargetType] = useState('All'); // 'All', 'Department', 'Client', 'Employee'
  const [targetValue, setTargetValue] = useState('');
  const [targetOptions, setTargetOptions] = useState({
    departments: ['CRM', 'Recruitment', 'Operations', 'Finance', 'HR', 'IT', 'Sales'],
    clients: [],
    employees: []
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchAnnouncements();
    if (isHead) {
      fetchTargetOptions();
    }
  }, [department]);

  const fetchTargetOptions = async () => {
    try {
      const [clientsRes, adminsRes] = await Promise.all([
        getAllClients(),
        getAllAdmins()
      ]);
      setTargetOptions(prev => ({
        ...prev,
        clients: clientsRes.data?.clients || [],
        employees: adminsRes.admins || []
      }));
    } catch (err) {
      console.error("Failed to fetch target options", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await getAnnouncements(department);
      if (res.announcements) {
        setAnnouncements(res.announcements);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      showToast('Failed to load announcements', 'error');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnnouncement = async () => {
    try {
      setIsSavingDetail(true);
      // Assuming there's an editAnnouncement API or similar
      // If not, we'll need to use a generic update or implement it in api.jsx
      // For now using the mock pattern if API is not there
      await editAnnouncement(selectedAnnouncement.id || selectedAnnouncement._id, editableAnnouncement);

      const updated = { ...selectedAnnouncement, ...editableAnnouncement };
      setAnnouncements(prev => prev.map(a => (a.id === updated.id || a._id === updated._id) ? updated : a));
      setSelectedAnnouncement(updated);
      setIsEditingInDetail(false);
      showToast('Announcement updated successfully');
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setIsSavingDetail(false);
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
      const payload = {
        ...form,
        department: targetType === 'Department' ? targetValue : (department || 'All'),
        targetType,
        targetValue: targetType !== 'All' ? targetValue : undefined
      };
      await createAnnouncement(payload);
      showToast('Announcement posted successfully');
      setShowForm(false);
      setForm({ title: '', content: '', priority: 'medium' });
      setTargetType('All');
      setTargetValue('');
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
    <div className="w-full space-y-8 pb-10">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 text-left">
        <div className="flex flex-col text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Announcements</h1>
        </div>
        {isHead && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
            style={{ background: '#1B4DA0' }}
          >
            <FiPlus size={20} />
            Post New Alert
          </motion.button>
        )}
      </div>

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
        ) : isHead ? (
          /* Table View for Super Admin */
          <div className="bg-white rounded-[40px] border border-[#F4F3EF] shadow-xl shadow-blue-500/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#F4F3EF]">
                    <th className="px-10 py-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Announcement Title</th>
                    <th className="px-10 py-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Target Audience</th>
                    <th className="px-10 py-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Priority</th>
                    <th className="px-10 py-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Date Posted</th>
                    <th className="px-10 py-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {announcements.map((ann) => {
                    const pc = priorityConfig[ann.priority] || priorityConfig.medium;
                    return (
                      <tr
                        key={ann.id || ann._id}
                        onClick={() => { setSelectedAnnouncement(ann); setEditableAnnouncement(ann); setIsEditingInDetail(false); }}
                        className="group hover:bg-[#F8FAFF] transition-all cursor-pointer"
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: pc.bg, color: pc.color }}>
                              <pc.icon size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{ann.title}</p>
                              <p className="text-[10px] font-medium text-[#9B9BAD] truncate max-w-[200px]">{ann.content}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <span className="text-xs font-bold text-[#6B6B7E]">{ann.department === 'All' ? 'Whole Company' : ann.department}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest" style={{ color: pc.color, backgroundColor: pc.bg }}>
                            {pc.label}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#1A1A2E]">{new Date(ann.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                            <span className="text-[10px] font-medium text-[#9B9BAD]">{new Date(ann.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedAnnouncement(ann); setEditableAnnouncement(ann); setIsEditingInDetail(true); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                              <FiEdit2 size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(ann.id || ann._id); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards View for Employees */
          <div className="space-y-4">
            {announcements.map((ann, idx) => {
              const pc = priorityConfig[ann.priority] || priorityConfig.medium;
              return (
                <motion.div
                  key={ann.id || ann._id}
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

                    <p className="text-slate-600 font-medium leading-relaxed mb-6 whitespace-pre-wrap text-left">{ann.content}</p>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                          {ann.postedByName?.charAt(0) || 'U'}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-slate-900">{ann.postedByName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(ann.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Drawer - Create Portal */}
      {createPortal(
        <AnimatePresence>
          {selectedAnnouncement && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedAnnouncement(null)}
              />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white z-[200001] shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/20 to-white">
                  <div>
                    <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Announcement Detail</h3>
                    <p className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-widest mt-1">Management Console</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditingInDetail ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setIsEditingInDetail(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B6B7E] bg-[#F4F3EF] hover:bg-[#E8E7E2] transition-all">Cancel</button>
                        <button
                          disabled={isSavingDetail}
                          onClick={handleUpdateAnnouncement}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4DA0] hover:bg-[#153D80] transition-all flex items-center gap-2"
                        >
                          {isSavingDetail ? <FiRefreshCw className="animate-spin w-3 h-3" /> : <FiCheck className="w-3 h-3" />}
                          {isSavingDetail ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setIsEditingInDetail(true)} className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm"><FiEdit2 size={18} /></button>
                        <button onClick={() => handleDelete(selectedAnnouncement.id || selectedAnnouncement._id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"><FiTrash2 size={18} /></button>
                        <button onClick={() => setSelectedAnnouncement(null)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#9B9BAD] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"><FiX size={20} /></button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar text-left">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2 block">Announcement Title</label>
                      {isEditingInDetail ? (
                        <input
                          type="text"
                          value={editableAnnouncement.title}
                          onChange={(e) => setEditableAnnouncement({ ...editableAnnouncement, title: e.target.value })}
                          className="w-full text-2xl font-bold text-[#1A1A2E] bg-[#FAFAF8] border-none rounded-2xl p-4 focus:outline-none transition-all font-syne"
                        />
                      ) : (
                        <h2 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedAnnouncement.title}</h2>
                      )}
                    </div>

                    <div className="bg-[#FAFAF8] p-8 rounded-[32px] border border-[#F4F3EF] space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2 block">Priority</label>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityConfig[selectedAnnouncement.priority]?.color }}></span>
                            <span className="text-sm font-bold text-[#1A1A2E]">{priorityConfig[selectedAnnouncement.priority]?.label} Level</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2 block">Posted Date</label>
                          <div className="flex items-center gap-2 text-[#1A1A2E] font-bold text-sm">
                            <FiCalendar className="text-[#1B4DA0]" />
                            {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2 block">Target Audience</label>
                        <div className="flex items-center gap-2 text-[#1A1A2E] font-bold text-sm">
                          <FiTarget className="text-[#1B4DA0]" />
                          {selectedAnnouncement.department === 'All' ? 'All Departments' : `Special: ${selectedAnnouncement.department}`}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2 block">Message Content</label>
                        {isEditingInDetail ? (
                          <textarea
                            rows={6}
                            value={editableAnnouncement.content}
                            onChange={(e) => setEditableAnnouncement({ ...editableAnnouncement, content: e.target.value })}
                            className="w-full text-sm font-medium text-[#1A1A2E] bg-white border border-[#F4F3EF] rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
                          />
                        ) : (
                          <p className="text-sm font-medium text-[#6B6B7E] leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-[#F4F3EF]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center font-bold text-lg">
                        {selectedAnnouncement.postedByName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1A1A2E]">{selectedAnnouncement.postedByName}</p>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Posted by Super Admin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
      {/* Create Announcement Modal - Portal */}
      {createPortal(
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
                onClick={() => setShowForm(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-[40px] p-10 w-full max-w-xl shadow-2xl z-[200001] border border-[#F4F3EF]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8 text-left">
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

                <form onSubmit={handleCreate} className="space-y-6 text-left">
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
                      rows={4}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
                      placeholder="Describe the update in detail..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Audience</label>
                      <select
                        value={targetType}
                        onChange={(e) => { setTargetType(e.target.value); setTargetValue(''); }}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all appearance-none"
                      >
                        <option value="All">All Company</option>
                        <option value="Department">Special Department</option>
                        <option value="Client">Specific Client</option>
                        <option value="Employee">Special Employee</option>
                      </select>
                    </div>
                    {targetType !== 'All' && (
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select {targetType}</label>
                        <select
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all appearance-none"
                        >
                          <option value="">Choose {targetType}...</option>
                          {targetType === 'Department' && targetOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
                          {targetType === 'Client' && targetOptions.clients.map(c => <option key={c._id || c.id} value={c.name}>{c.name}</option>)}
                          {targetType === 'Employee' && targetOptions.employees.map(e => <option key={e._id || e.id} value={e.name}>{e.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Priority Level</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(priorityConfig).map(([key, pc]) => (
                        <button
                          key={key} type="button"
                          onClick={() => setForm(p => ({ ...p, priority: key }))}
                          className={`py-3 rounded-2xl text-sm font-black transition-all border-2 flex items-center justify-center gap-2 ${form.priority === key
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
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default AnnouncementsTab;
