import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  Calendar,
  Flag,
  MessageSquare,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Edit2,
  Activity,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import {
  getMyDepartmentTasks,
  updateDepartmentTask,
} from '../../../service/api';

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
    'In Progress': { bg: '#eff6ff', text: '#1e40af', dot: '#3b82f6' },
    Completed: { bg: '#ecfdf5', text: '#065f46', dot: '#10b981' },
    Overdue: { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
  };
  const c = config[status] || config.Pending;
  return (
    <span
      style={{ background: c.bg, color: c.text, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500 }}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot }}></span>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = {
    Low: { bg: '#f1f5f9', text: '#64748b' },
    Medium: { bg: '#fff7ed', text: '#c2410c' },
    High: { bg: '#fff1f2', text: '#e11d48' },
    Urgent: { bg: '#fef2f2', text: '#991b1b' },
  };
  const c = config[priority] || config.Medium;
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      border: `1px solid ${c.text}20`
    }}>
      {priority}
    </span>
  );
};

const statusOptions = [
  { value: 'all', label: 'All Status', dot: '#6366f1' },
  { value: 'Pending', label: 'Pending', dot: '#f59e0b' },
  { value: 'In Progress', label: 'In Progress', dot: '#3b82f6' },
  { value: 'Completed', label: 'Completed', dot: '#10b981' },
  { value: 'Overdue', label: 'Overdue', dot: '#ef4444' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priority' },
  { value: 'Low', label: 'Low', dot: '#475569' },
  { value: 'Medium', label: 'Medium', dot: '#f59e0b' },
  { value: 'High', label: 'High', dot: '#c2410c' },
  { value: 'Urgent', label: 'Urgent', dot: '#ef4444' },
];

const StatusFilterDropdown = ({ filterStatus, setFilterStatus }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = statusOptions.find(o => o.value === filterStatus) || statusOptions[0];

  return (
    <div ref={ref} className="relative min-w-[140px]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 bg-[#F5F5F2] hover:bg-[#EEEEE8] cursor-pointer text-[11px] font-black text-slate-700 w-full justify-between transition-all uppercase tracking-wider"
      >
        <span className="flex items-center gap-2">
          {selected.label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="absolute top-full right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 min-w-[170px]"
          >
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { setFilterStatus(option.value); setOpen(false); }}
                className="flex items-center px-4 py-2.5 w-full text-left text-xs font-bold text-slate-700 hover:bg-gray-100 transition-all border-none cursor-pointer"
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PriorityFilterDropdown = ({ filterPriority, setFilterPriority }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = priorityOptions.find(o => o.value === filterPriority) || priorityOptions[0];

  return (
    <div ref={ref} className="relative min-w-[140px]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 bg-[#F5F5F2] hover:bg-[#EEEEE8] cursor-pointer text-[11px] font-black text-slate-700 w-full justify-between transition-all uppercase tracking-wider"
      >
        <span className="flex items-center gap-2">
          {selected.label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="absolute top-full right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 min-w-[170px]"
          >
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { setFilterPriority(option.value); setOpen(false); }}
                className="flex items-center px-4 py-2.5 w-full text-left text-xs font-bold text-slate-700 hover:bg-gray-100 transition-all border-none cursor-pointer"
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const TaskActionDropdown = ({ currentStatus, onStatusChange, isUpdating, isOpen, setIsOpen }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const options = [
    { value: 'Completed', label: 'Completed' },
    { value: 'Pending', label: 'Pending' }
  ];

  return (
    <div ref={ref} className={`relative ${isOpen ? 'z-[60]' : 'z-auto'}`}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="flex items-center gap-2 bg-[#1B4DA0] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
        disabled={isUpdating}
      >
        <span>{currentStatus === 'Completed' ? 'Completed' : 'Actions'}</span>
        <ChevronDown className={`w-3 h-3 text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="absolute top-full right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 min-w-[140px]"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 w-full text-left text-xs font-bold transition-all border-none cursor-pointer ${currentStatus === opt.value ? 'bg-indigo-50 text-[#1B4DA0]' : 'text-slate-600 hover:bg-gray-50'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const MyTasksTab = ({ initialFilter = 'all' }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  useEffect(() => {
    setFilterStatus(initialFilter);
  }, [initialFilter]);
  const [commentText, setCommentText] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [toast, setToast] = useState(null);
  const [sendingComment, setSendingComment] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);




  useEffect(() => {
    fetchTasks();
  }, [initialFilter]); // Refetch when filter changes

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getMyDepartmentTasks();
      if (response.success) {
        // Map tasks and handle both id and _id fields
        const taskData = (response.tasks || []).map(t => ({
          ...t,
          id: t.id || t._id
        }));
        setTasks(taskData);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('Failed to fetch tasks from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await updateDepartmentTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, ...(newStatus === 'Completed' ? { completedAt: new Date().toISOString() } : {}) } : t));
      showToast(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleAddComment = async (taskId) => {
    if (!commentText.trim()) return;
    try {
      setSendingComment(true);
      await updateDepartmentTask(taskId, { comments: commentText });
      setCommentText('');
      showToast('Comment sent!');
      fetchTasks();
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Failed to send comment', 'error');
    } finally {
      setSendingComment(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => t.status === 'Overdue').length,
  };

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: '#ef4444' };
    if (diff === 0) return { text: 'Due today', color: '#f59e0b' };
    if (diff <= 2) return { text: `${diff}d left`, color: '#f59e0b' };
    return { text: `${diff}d left`, color: '#6b7280' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            style={{
              position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
              padding: '14px 20px', borderRadius: '12px',
              background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: '10px',
              maxWidth: '360px',
            }}
          >
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: toast.type === 'error' ? '#ef4444' : '#22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0,
            }}>
              {toast.type === 'error' ? '!' : '✓'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: toast.type === 'error' ? '#991b1b' : '#166534' }}>
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="flex flex-col items-start text-left mb-6 px-1">
        <h1 className="text-[28px] font-bold text-[#0f172a] mb-1 tracking-tight font-syne">My Tasks</h1>

      </div>


      {/* Search & Filter - Integrated Container */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap relative z-[110]">
        {/* Search Bar */}
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Find specific tasks, descriptions..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        {/* Priority Filter */}
        <div className="relative group">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[150px] w-full"
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none transition-colors group-hover:text-[#1A1A2E]" size={16} />
        </div>

        {/* Status Filter */}
        <div className="relative group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[140px] w-full"
          >
            <option value="all">All Logs</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none transition-colors group-hover:text-[#1A1A2E]" size={16} />
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-[2.5fr_1.2fr_1fr_1.2fr_40px] gap-4 px-4 py-4 bg-gray-50/50 border-b border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-left">Tasks</span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Assigned By</span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</span>
          <span></span>
        </div>

        <div className="divide-y divide-gray-100 min-h-[400px]">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-24 text-gray-500">
              <CheckSquare style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.3 }} />
              <p className="font-medium">{tasks.length === 0 ? 'No tasks assigned yet' : 'No tasks match your filters'}</p>
              <p className="text-sm mt-1 text-gray-400">Tasks assigned by your team head will appear here</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => {
              const isOverdue = task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date();
              const displayStatus = isOverdue ? 'Overdue' : task.status;
              const isActiveDropdown = activeDropdownId === task.id;

              return (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`group cursor-pointer hover:bg-[#F0F7FF]/50 transition-all ${isActiveDropdown ? 'relative z-[100]' : ''}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="px-4 py-5">
                    <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1.2fr_1fr_1.2fr_40px] gap-4 items-center">
                      {/* Task Info Column */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <h3 className={`text-[15px] font-bold tracking-tight text-left transition-colors text-[#0f172a] ${task.status === 'Completed' ? 'opacity-50 line-through' : ''}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {task.department || 'RECRUITMENT'}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>

                      {/* Assigned By Column */}
                      <div className="flex flex-col items-start lg:items-center">
                        <span className="text-sm font-semibold text-slate-600">
                          {task.assignedByName || 'Admin'}
                        </span>
                      </div>

                      {/* Status Column */}
                      <div className="flex justify-start lg:justify-center">
                        <StatusBadge status={displayStatus} />
                      </div>

                      {/* Actions Column */}
                      <div className="flex items-center justify-end gap-2">
                        <TaskActionDropdown
                          currentStatus={task.status}
                          isUpdating={updatingTaskId === task.id}
                          isOpen={isActiveDropdown}
                          setIsOpen={(val) => setActiveDropdownId(val ? task.id : null)}
                          onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                        />
                        {updatingTaskId === task.id && (
                          <Loader2 className="w-4 h-4 text-[#1B4DA0] animate-spin" />
                        )}
                      </div>

                      {/* Chevron Column */}
                      <div className="flex justify-end pr-2">
                        <div className="w-8 h-8 rounded-full bg-[#F0F7FF] flex items-center justify-center text-[#1B4DA0] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Detail Sidebar - Using Portal for global overlay */}
      {selectedTask && createPortal(
        <div className="fixed inset-0 z-[9999] isolation-auto">
          <AnimatePresence>
            {selectedTask && (
              <>
                {/* Backdrop Blur Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedTask(null)}
                  className="fixed inset-0 bg-black/20 backdrop-blur-[8px]"
                />

                {/* Sidebar Content */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 h-full w-full md:w-[600px] xl:w-[700px] bg-white shadow-2xl flex flex-col"
                >
                  {/* Sidebar Header */}
                  <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-10 py-10 flex items-center justify-between z-20">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#1A1A2E] leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>Task Protocol</h2>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-[3px]">TO: ME</span>
                         <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                         <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">ID: #{selectedTask.id.slice(-4).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedTask(null)}
                         className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Sidebar Body */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                     <div className="p-10 space-y-10">
                        {/* Task Hero Section */}
                        <div className="space-y-4">
                           <h1 className="text-3xl font-black text-[#1A1A2E] leading-tight tracking-tight">{selectedTask.title}</h1>
                           <div className="flex flex-wrap gap-3">
                              <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F4F3EF] rounded-full border border-[#E8E7E2]">
                                 <span className={`w-2.5 h-2.5 rounded-full ${selectedTask.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                 <span className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">{selectedTask.status}</span>
                              </div>
                              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border font-black uppercase tracking-widest text-[10px] ${
                                 selectedTask.priority === 'High' || selectedTask.priority === 'Urgent' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-[#F4F3EF] border-[#E8E7E2] text-[#1A1A2E]'
                              }`}>
                                 <Flag size={12} />
                                 <span>{selectedTask.priority} PRIORITY</span>
                              </div>
                           </div>
                        </div>

                        {/* Core Task Card */}
                        <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-10 space-y-8 shadow-sm">
                           <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                              <div className="space-y-2">
                                 <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Task Initiator</span>
                                 <p className="text-base font-black text-[#1A1A2E]">{selectedTask.assignedByName || 'Admin'}</p>
                              </div>
                              <div className="space-y-2">
                                 <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Deadline</span>
                                 <p className="text-base font-black text-[#E11D48]">
                                    {new Date(selectedTask.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                 </p>
                              </div>
                              <div className="space-y-2 col-span-2 pt-4 border-t border-[#F4F3EF]">
                                 <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-3">Task Briefing</span>
                                 <div className="bg-white p-6 rounded-[32px] border border-[#F4F3EF]">
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                       "{selectedTask.description || 'No detailed instructions available.'}"
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Dynamic Activity/Comments Card */}
                        <div className="space-y-6">
                           <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4">Official Log & Discussions</span>
                           <div className="space-y-4">
                              {selectedTask.comments?.length > 0 ? selectedTask.comments.map((comment, i) => (
                                 <div key={i} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-2xl bg-[#FAFAF9] border border-[#F4F3EF] flex-shrink-0 flex items-center justify-center text-xs font-black text-[#1A1A2E] group-hover:bg-[#1B4DA0] group-hover:text-white transition-all">
                                       {comment.byName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 bg-white p-5 rounded-3xl border border-[#F4F3EF] hover:border-[#1B4DA0]/20 transition-all shadow-sm">
                                       <div className="flex items-center justify-between mb-2">
                                          <span className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-wider">{comment.byName}</span>
                                          <span className="text-[10px] text-[#9B9BAD] font-bold">
                                             {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                       </div>
                                       <p className="text-sm font-medium text-slate-600 leading-relaxed">{comment.text}</p>
                                    </div>
                                 </div>
                              )) : (
                                 <div className="py-10 text-center bg-[#FAFAF9] rounded-3xl border border-dashed border-[#F4F3EF]">
                                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest italic">No activities recorded yet</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Sidebar Footer - Add Comment */}
                  <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 relative group">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:bg-white focus:border-[#1B4DA0] transition-all"
                        />
                      </div>
                      <button
                        onClick={() => handleAddComment(selectedTask.id)}
                        disabled={!commentText.trim() || sendingComment}
                        className="bg-[#1B4DA0] text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          <>
                            <span>Post</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MyTasksTab;
