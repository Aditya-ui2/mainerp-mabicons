import { useState, useEffect } from 'react';
import { FiClipboard, FiPlus, FiX, FiSearch, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { requestTask, getClientDetails } from '../../../service/api';

/* ── Assign Task to KAM ── */
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

  const text = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const border = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const inputBg = isDarkMode ? 'bg-[#322d4a] text-gray-100' : 'bg-[#f2f0fa] text-gray-800';
  const bgSub = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#f7f5fc]';
  const bg = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-white';

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const res = await getClientDetails(decoded.id);
      const clientTasks = res?.data?.tasks || [];
      setTasks(clientTasks);
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

  const statusColors = {
    Active: 'bg-blue-100 text-blue-700',
    'Work in Progress': 'bg-amber-100 text-amber-700',
    Review: 'bg-purple-100 text-purple-700',
    Pending: 'bg-red-100 text-red-700',
    Resolved: 'bg-green-100 text-green-700',
  };
  const priorityColors = { Low: 'text-green-500', Medium: 'text-amber-500', High: 'text-red-500' };

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  const summary = {
    total: tasks.length,
    active: tasks.filter(t => t.status === 'Active' || t.status === 'Work in Progress').length,
    review: tasks.filter(t => t.status === 'Review' || t.status === 'Pending').length,
    resolved: tasks.filter(t => t.status === 'Resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Success toast */}
      {submitSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-in">
          <FiCheckCircle size={18} /> Task submitted to KAM successfully!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow">
            <FiClipboard size={22} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${text}`}>Assign Task to KAM</h2>
            <p className={`text-sm ${textSub}`}>Request and track tasks assigned to your KAM</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
          <FiPlus size={16} /> New Task Request
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Tasks', value: summary.total, icon: FiClipboard, color: 'blue' },
          { label: 'In Progress', value: summary.active, icon: FiClock, color: 'amber' },
          { label: 'Under Review', value: summary.review, icon: FiAlertCircle, color: 'purple' },
          { label: 'Resolved', value: summary.resolved, icon: FiCheckCircle, color: 'green' },
        ].map(c => (
          <div key={c.label} className={`${cardBg} rounded-xl ${border} border p-4 flex items-center gap-3`}>
            <div className={`p-2 rounded-lg bg-${c.color}-100 ${isDarkMode ? `bg-${c.color}-900/30` : ''}`}>
              <c.icon size={18} className={`text-${c.color}-500`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${text}`}>{c.value}</p>
              <p className={`text-xs ${textSub}`}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${inputBg} flex-1`}>
          <FiSearch className={textSub} size={16} />
          <input type="text" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)}
            className={`bg-transparent outline-none text-sm w-full ${text}`} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Active', 'Work in Progress', 'Review', 'Pending', 'Resolved'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filterStatus === s ? 'bg-indigo-500 text-white' : `${bgSub} ${text} ${border} border`
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${textSub}`}>
          <FiClipboard size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tasks found</p>
          <p className="text-sm mt-1">Click "New Task Request" to assign a task to your KAM</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className={`${cardBg} rounded-xl ${border} border p-4 flex flex-col sm:flex-row sm:items-center gap-3`}>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${text} truncate`}>{t.title}</p>
                <p className={`text-xs ${textSub} truncate mt-0.5`}>{t.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${priorityColors[t.priority] || textSub}`}>{t.priority}</span>
                <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${statusColors[t.status] || 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                {t.dueDate && (
                  <span className={`text-[10px] ${textSub}`}>{new Date(t.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Create Task Modal ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className={`${bg} rounded-2xl shadow-xl w-full max-w-md`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
              <h3 className={`text-lg font-bold ${text}`}>New Task Request</h3>
              <button onClick={() => setShowModal(false)}><FiX size={20} className={textSub} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Task title…" className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border`} />
              </div>
              <div>
                <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the task…" rows={3}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border`}>
                    <option value="Deadline">Deadline</option>
                    <option value="Frequency">Frequency</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border`}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              {form.category === 'Deadline' && (
                <div>
                  <label className={`text-xs font-semibold ${textSub} mb-1 block`}>Due Date</label>
                  <input type="datetime-local" value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm ${inputBg} outline-none ${border} border`} />
                </div>
              )}
              {submitError && <p className="text-sm text-red-500">{submitError}</p>}
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
              <button onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${bgSub} ${text} ${border} border`}>Cancel</button>
              <button onClick={handleSubmit}
                disabled={!form.title || !form.description}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow disabled:opacity-40 disabled:cursor-not-allowed">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
