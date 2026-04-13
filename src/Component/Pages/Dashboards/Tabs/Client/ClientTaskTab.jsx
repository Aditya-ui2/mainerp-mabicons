import { useState, useEffect } from 'react';
import { FiClipboard, FiPlus, FiX, FiSearch, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { requestTask, getClientDashboardOverview } from '../../../service/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientTaskTab({ isDarkMode, clientData }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Deadline',
    dueDate: new Date().toISOString().slice(0, 16),
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      
      const res = await getClientDashboardOverview(decoded.id);
      
      const activeTasks = (res?.data?.operations?.recentTasks || []).map(t => ({ ...t, _type: 'active' }));
      const requestedTasks = (res?.data?.operations?.requestedTasks || []).map(t => ({ ...t, _type: 'request' }));
      
      // Combine and sort by newest first
      const combined = [...activeTasks, ...requestedTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTasks(combined);
    } catch (e) {
      console.error('Failed to load tasks', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitError('');
    if (!form.title || !form.description || !form.category) {
      setSubmitError('Title, description, and category are required.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const payload = {
        title: form.title,
        description: form.description,
        clientId: decoded.id,
        category: form.category,
        priority: form.priority,
        ...(form.category === 'Deadline' ? { dueDate: new Date(form.dueDate).toISOString() } : {}),
      };
      await requestTask(payload);
      setShowModal(false);
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      
      setForm({ title: '', description: '', priority: 'Medium', category: 'Deadline', dueDate: new Date().toISOString().slice(0, 16) });
      loadTasks();
    } catch (e) {
      setSubmitError(e?.message || 'Failed to submit task');
    }
  };

  const statusConfig = {
    'Requested': 'bg-slate-100 text-slate-600 border border-slate-200',
    'Active': 'bg-blue-50 text-blue-600 border border-blue-100',
    'Work in Progress': 'bg-amber-50 text-amber-600 border border-amber-100',
    'Review': 'bg-purple-50 text-purple-600 border border-purple-100',
    'Pending': 'bg-amber-50 text-amber-600 border border-amber-100',
    'Resolved': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    'Accepted': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    'Rejected': 'bg-red-50 text-red-600 border border-red-100',
  };

  const priorityColors = {
    Low: 'text-emerald-500 bg-emerald-50 border border-emerald-100',
    Medium: 'text-amber-500 bg-amber-50 border border-amber-100',
    High: 'text-red-500 bg-red-50 border border-red-100'
  };

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'All') {
      if (filterStatus === 'In Progress' && !['Active', 'Work in Progress'].includes(t.status)) return false;
      if (filterStatus === 'Under Review' && !['Review', 'Pending', 'Requested'].includes(t.status)) return false;
      if (filterStatus === 'Completed' && !['Resolved', 'Accepted', 'Rejected'].includes(t.status)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  const summary = {
    total: tasks.length,
    active: tasks.filter(t => ['Active', 'Work in Progress'].includes(t.status)).length,
    review: tasks.filter(t => ['Review', 'Pending', 'Requested'].includes(t.status)).length,
    resolved: tasks.filter(t => ['Resolved', 'Accepted', 'Rejected'].includes(t.status)).length,
  };

  const statCards = [
    { label: 'Total Tasks',  value: summary.total,    color: 'text-[#1B4DA0]',   icon: FiClipboard },
    { label: 'In Progress',  value: summary.active,   color: 'text-amber-500',   icon: FiClock },
    { label: 'Under Review', value: summary.review,   color: 'text-purple-500',  icon: FiAlertCircle },
    { label: 'Resolved',     value: summary.resolved, color: 'text-emerald-500', icon: FiCheckCircle },
  ];

  return (
    <div className="p-0 min-h-screen bg-[#FDFDFD] text-left" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-[3000] bg-emerald-500 text-white px-5 py-4 rounded-[20px] shadow-2xl flex items-center gap-3 font-jakarta font-bold text-sm">
            <FiCheckCircle size={20} /> Task submitted successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Task Manager</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Request and track tasks assigned to your KAM</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#E8E7E2] flex-1 md:w-72 shadow-sm focus-within:border-[#1B4DA0] transition-colors">
            <FiSearch className="text-[#9B9BAD]" size={16} />
            <input type="text" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-[#1A1A2E] font-semibold w-full font-jakarta" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#1A1A2E] hover:bg-[#2A2A3E] transition-all shadow-lg shadow-gray-200 whitespace-nowrap">
            <FiPlus size={16} /> New Task Request
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map(s => (
          <div key={s.label} className="bg-white p-6 rounded-[28px] border border-[#F4F3EF] shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-[#F4F3EF] ${s.color} transition-transform duration-300 group-hover:scale-110`}>
              <s.icon size={18} />
            </div>
            <p className={`text-3xl font-extrabold ${s.color} mb-1 leading-none`}>{s.value}</p>
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'In Progress', 'Under Review', 'Completed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterStatus === s 
                ? 'bg-[#1B4DA0] text-white shadow-md' 
                : 'bg-white text-[#6B6B7E] border border-[#E8E7E2] hover:border-[#1B4DA0]'
            }`}>{s}</button>
        ))}
      </div>

      {/* ── Task List ── */}
      <div className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
        <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-3 mb-6 font-syne">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <FiClipboard className="w-5 h-5 text-[#1B4DA0]" />
          </div>
          Active & Requested Tasks
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative"><div className="w-12 h-12 border-4 border-slate-100 rounded-full" /><div className="absolute inset-0 w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" /></div>
            <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest">Loading tasks...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[#F4F3EF] rounded-2xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-[#F4F3EF] rounded-2xl flex items-center justify-center text-[#9B9BAD]"><FiClipboard size={24} /></div>
            <div>
              <p className="text-sm font-bold text-[#1A1A2E]">No tasks found</p>
              <p className="text-xs text-[#9B9BAD] mt-1 font-semibold">Click "New Task Request" to assign a task to your KAM</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(t => (
              <div key={t.id} className="p-5 rounded-[20px] bg-white border border-[#E8E7E2] hover:border-[#1B4DA0] transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${t._type === 'request' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                      {t._type === 'request' ? 'Requested' : 'Active'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${priorityColors[t.priority] || 'bg-slate-50 text-slate-500'}`}>
                      {t.priority}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1A1A2E] truncate font-jakarta">{t.title}</h3>
                  <p className="text-xs font-semibold text-[#6B6B7E] mt-1 line-clamp-2 max-w-3xl leading-relaxed">{t.description}</p>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                  <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${statusConfig[t.status] || 'bg-slate-100 text-slate-600'}`}>
                    {t.status}
                  </span>
                  {t.dueDate && (
                    <span className="text-[11px] font-bold text-[#9B9BAD] flex items-center gap-1.5 bg-[#F4F3EF] px-2.5 py-1 rounded-lg">
                      <FiClock size={12} className="text-[#1B4DA0]" />
                      Due {new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Task Modal ── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[2000]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 flex items-start justify-center z-[2001] p-6 pt-16 overflow-y-auto"
            >
              <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col font-jakarta border border-[#E8E7E2]">
                <div className="px-8 py-6 border-b border-[#F4F3EF] flex items-center justify-between bg-[#FAFAF8]">
                  <div>
                    <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">New Task Request</h3>
                    <p className="text-xs text-[#9B9BAD] font-bold uppercase tracking-widest mt-1">Assign work to your KAM</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white border border-[#E8E7E2] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"><FiX size={20} /></button>
                </div>

                <div className="px-8 py-8 space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 block">Task Title <span className="text-red-500">*</span></label>
                    <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g., Shortlist 5 React developers" className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#1A1A2E] bg-white border border-[#E8E7E2] outline-none hover:border-[#1B4DA0] focus:border-[#1B4DA0] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 block">Description <span className="text-red-500">*</span></label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Provide detailed requirements..." rows={4}
                      className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#1A1A2E] bg-white border border-[#E8E7E2] outline-none hover:border-[#1B4DA0] focus:border-[#1B4DA0] transition-colors resize-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 block">Category <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#1A1A2E] bg-white border border-[#E8E7E2] outline-none hover:border-[#1B4DA0] focus:border-[#1B4DA0] transition-colors appearance-none cursor-pointer">
                          <option value="Deadline">Deadline-based</option>
                          <option value="Frequency">Recurring/Frequency</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 block">Priority</label>
                      <div className="relative">
                        <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#1A1A2E] bg-white border border-[#E8E7E2] outline-none hover:border-[#1B4DA0] focus:border-[#1B4DA0] transition-colors appearance-none cursor-pointer">
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {form.category === 'Deadline' && (
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 block">Due Date</label>
                      <input type="datetime-local" value={form.dueDate}
                        onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#1A1A2E] bg-white border border-[#E8E7E2] outline-none hover:border-[#1B4DA0] focus:border-[#1B4DA0] transition-colors cursor-pointer" />
                    </div>
                  )}

                  {submitError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-bold text-red-600">{submitError}</p>
                    </div>
                  )}
                </div>

                <div className="px-8 py-5 border-t border-[#F4F3EF] bg-[#FAFAF8] flex items-center justify-end gap-3 rounded-b-[32px]">
                  <button onClick={() => setShowModal(false)}
                    className="px-5 py-3 rounded-xl text-sm font-bold text-[#6B6B7E] bg-white border border-[#E8E7E2] hover:bg-gray-50 transition-all shadow-sm">
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={!form.title || !form.description}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#1A1A2E] hover:bg-[#2A2A3E] transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    Submit Request
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
