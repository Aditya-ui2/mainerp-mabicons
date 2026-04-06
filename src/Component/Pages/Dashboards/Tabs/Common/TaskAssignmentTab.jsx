import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckSquare,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiClock,
  FiUser,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiMessageSquare,
  FiFlag,
  FiBell,
  FiLoader,
  FiFilter,
  FiMoreHorizontal,
  FiType,
  FiZap,
  FiAlignLeft,
  FiActivity,
} from 'react-icons/fi';
import {
  getDepartmentTasks,
  createDepartmentTask,
  updateDepartmentTask,
  deleteDepartmentTask,
  getDepartmentTeamMembers,
} from '../../../service/api';

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
    'In Progress': { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
    Completed: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
    Overdue: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  };
  const c = config[status] || config.Pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, background: c.bg, color: c.text, border: `1px solid ${c.dot}33` }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot }}></span>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = {
    Low: { bg: '#F4F7FE', text: '#64748B', border: '#E2E8F0' },
    Medium: { bg: '#FFF9EB', text: '#B45309', border: '#FEF3C7' },
    High: { bg: '#FFF1F2', text: '#E11D48', border: '#FECACA' },
    Urgent: { bg: '#7F1D1D', text: '#FFFFFF', border: '#991B1B' },
  };
  const c = config[priority] || config.Medium;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '8px', fontSize: '10px',
      fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`
    }}>
      {priority}
    </span>
  );
};

const getRelativeDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return { label: 'Today', color: 'text-rose-500', bg: 'bg-rose-500' };
  if (days === 1) return { label: 'Tomorrow', color: 'text-amber-500', bg: 'bg-amber-500' };
  if (days < 0) return { label: 'Overdue', color: 'text-rose-600', bg: 'bg-rose-600' };
  return { label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), color: 'text-[#9B9BAD]', bg: 'bg-[#9B9BAD]' };
};

const StatCard = ({ label, value, icon: Icon }) => (
  <motion.div
    whileHover="hover"
    initial="initial"
    className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-start gap-5 shadow-sm text-left relative overflow-hidden group cursor-pointer"
    style={{ minHeight: '180px' }}
  >
    <motion.div
      variants={{
        initial: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
        hover: { y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
      }}
      className="w-full h-full absolute inset-0 bg-white -z-10"
    />
    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 transition-all duration-300">
      <motion.div
        variants={{
          initial: { color: '#1A1A2E' },
          hover: { color: '#0D47A1' }
        }}
      >
        <Icon size={22} />
      </motion.div>
    </div>
    <div className="space-y-2 mt-auto">
      <p className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
      <p className="text-sm font-medium text-[#1A1A2E] opacity-70 group-hover:opacity-100 transition-opacity">{label}</p>
    </div>
  </motion.div>
);

const WorkloadCard = ({ teamData, tasks }) => {
  const memberWorkload = teamData.map(m => ({
    name: m.name,
    tasks: tasks.filter(t => t.assignedToName === m.name && t.status !== 'Completed').length,
  })).sort((a, b) => b.tasks - a.tasks).slice(0, 4);

  const maxTasks = Math.max(...memberWorkload.map(m => m.tasks), 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Team Workload</h4>
        <FiActivity className="text-blue-500" size={18} />
      </div>
      <div className="space-y-4">
        {memberWorkload.map((m, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-[#4B4B5E]">{m.name}</span>
              <span className="text-[#1A1A2E]">{m.tasks} Tasks</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(m.tasks / maxTasks) * 100}%` }}
                className="h-full bg-[#1B4DA0] rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TaskAssignmentTab = ({ department = 'HR Operations' }) => {
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Process March Payroll', description: 'Review and approve payroll for all department staff for March 2024.', status: 'In Progress', priority: 'High', category: 'Admin', assignedToName: 'Manju', dueDate: new Date().toISOString() },
    { id: 't2', title: 'Employee Onboarding - John Doe', description: 'Complete onboarding documentation and hardware setup for the new Senior KAM.', status: 'Pending', priority: 'Urgent', category: 'Onboarding', assignedToName: 'Priyanshi', dueDate: new Date().toISOString() },
    { id: 't3', title: 'Review Q1 Performance', description: 'Compile team performance metrics and prepare individual feedback sessions.', status: 'Completed', priority: 'Medium', category: 'Internal', assignedToName: 'Jyoti', dueDate: '2024-03-31T10:00:00Z' },
    { id: 't4', title: 'Update Leave Policy', description: 'Review current leave policy and draft updates for special medical leaves.', status: 'Overdue', priority: 'Low', category: 'Internal', assignedToName: 'Sachin', dueDate: '2024-03-20T10:00:00Z' },
    { id: 't5', title: 'Client Meeting - TechNexus', description: 'Monthly project status update and requirements gathering for April.', status: 'Pending', priority: 'High', category: 'Client', assignedToName: 'Manju', dueDate: new Date().toISOString() },
  ]);
  const [teamMembers, setTeamMembers] = useState([
    { id: 'mock-1', name: 'Manju' },
    { id: 'mock-2', name: 'Priyanshi' },
    { id: 'mock-3', name: 'Jyoti' },
    { id: 'mock-4', name: 'Sachin' },
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [department]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // We wrap individual promises in a shorter timeout for dev experience
      const fetchWithTimeout = (promise, ms = 2000) =>
        Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

      const [tasksRes, membersRes] = await Promise.all([
        fetchWithTimeout(getDepartmentTasks(department)).catch(() => null),
        fetchWithTimeout(getDepartmentTeamMembers(department)).catch(() => null),
      ]);

      if (tasksRes?.tasks && tasksRes.tasks.length > 0) {
        setTasks(tasksRes.tasks);
      }
      if (membersRes?.members && membersRes.members.length > 0) {
        setTeamMembers(membersRes.members);
      }
    } catch (error) {
      console.warn('API Error, using mock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formData,
        department,
      };

      if (editingTask) {
        await updateDepartmentTask(editingTask.id, taskData);
      } else {
        await createDepartmentTask(taskData);
      }

      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
      showToast(editingTask ? 'Task updated!' : 'Task assigned!');
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      showToast(error.message || 'Failed to save task', 'error');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateDepartmentTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      showToast(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteDepartmentTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      setConfirmDelete(null);
      showToast('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task', 'error');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || task.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    pending: tasks.filter(t => t.status === 'Pending').length,
    highPriority: tasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length,
    todayDeadlines: tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length,
  };

  const getTaskCardTone = (status) => {
    switch (status) {
      case 'Completed':
        return { border: '#10b981', bg: 'linear-gradient(180deg, #ffffff, #f0fdf4)' };
      case 'In Progress':
        return { border: '#3b82f6', bg: 'linear-gradient(180deg, #ffffff, #eff6ff)' };
      case 'Overdue':
        return { border: '#ef4444', bg: 'linear-gradient(180deg, #ffffff, #fef2f2)' };
      default:
        return { border: '#f59e0b', bg: 'linear-gradient(180deg, #ffffff, #fffbeb)' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="h-9 w-64 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-4 w-48 rounded-lg bg-gray-100 animate-pulse mt-2" />
          </div>
          <div className="h-11 w-40 rounded-xl bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
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

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Task Assignment</h2>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Assign and track tasks for your team</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingTask(null); setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-7 py-3 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#1B4DA0]/20 transition-all border border-white/10"
        >
          <FiPlus size={20} />
          Assign Task
        </motion.button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard label="Pending Tasks" value={stats.pending} icon={FiClock} />
        <StatCard label="High Priority" value={stats.highPriority} icon={FiAlertCircle} />
        <StatCard label="Today's Deadlines" value={stats.todayDeadlines} icon={FiCalendar} />
        <WorkloadCard teamData={teamMembers} tasks={tasks} />
      </div>

      {/* Tabs & Search Header */}
      <div className="flex flex-col gap-6 mt-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex gap-8">
            {['All', 'Recruitment', 'Client', 'Internal', 'Admin', 'Onboarding'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-[#1B4DA0]' : 'text-[#9B9BAD] hover:text-[#4B4B5E]'
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4DA0]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-2 rounded-2xl">
          <div className="relative flex-1 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find a task..."
              className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-[#1B4DA0]/5 focus:border-[#1B4DA0] outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Task Directory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-2">
          <h3 className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Task Directory</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-[#9B9BAD] text-[10px] font-black rounded-md uppercase tracking-wider">{filteredTasks.length} Tasks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9]/50">
                <th className="p-5 w-14">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0]"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTasks(filteredTasks.map(t => t.id));
                      else setSelectedTasks([]);
                    }}
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  />
                </th>
                <th className="p-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Task Details</th>
                <th className="p-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Urgency</th>
                <th className="p-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Assignee</th>
                <th className="p-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Status</th>
                <th className="p-5 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-[#9B9BAD]">
                    <div className="flex flex-col items-center gap-4">
                      <FiCheckSquare size={48} className="opacity-20" />
                      <p className="font-bold">No tasks found in this directory</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className={`group hover:bg-[#F8FAFC] transition-colors ${selectedTasks.includes(task.id) ? 'bg-[#F1F5F9]' : ''}`}>
                    <td className="p-5">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0]"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => {
                          if (selectedTasks.includes(task.id)) setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                          else setSelectedTasks([...selectedTasks, task.id]);
                        }}
                      />
                    </td>
                    <td className="p-5 max-w-sm">
                      <div className="space-y-1">
                        <p className="font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{task.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">RECRUITMENT</span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {(() => {
                        const rd = getRelativeDate(task.dueDate);
                        return (
                          <div className="flex flex-col items-center">
                            <div className={`flex items-center gap-2 ${rd.color} font-bold`}>
                              <FiClock size={14} />
                              <span className="text-[11px] uppercase tracking-wider">{rd.label}</span>
                            </div>
                            <div className={`w-8 h-0.5 ${rd.bg} rounded-full mt-1 opacity-40`} />
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] text-[#1B4DA0] flex items-center justify-center font-black text-xs border border-[#1B4DA0]/10 shadow-sm">
                          {task.assignedToName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-[#4B4B5E]">{task.assignedToName}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="p-5 px-0">
                      <div className="flex items-center gap-1 pr-5">
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setFormData({
                              title: task.title,
                              description: task.description || '',
                              assignedTo: task.assignedTo?.id || task.assignedTo?._id || '',
                              priority: task.priority,
                              dueDate: task.dueDate?.split('T')[0] || '',
                            });
                            setShowModal(true);
                          }}
                          className="p-2 text-[#9B9BAD] hover:text-[#1B4DA0] transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => setConfirmDelete(task.id)} className="p-2 text-[#9B9BAD] hover:text-[#E11D48] transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selection Action Bar (Snackbar) */}
      <AnimatePresence>
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-[#1A1A2E] rounded-2xl shadow-2xl flex items-center gap-8 border border-white/10"
          >
            <div className="flex items-center gap-3 pr-8 border-r border-white/10">
              <span className="px-2 py-1 bg-[#1B4DA0] rounded-lg text-white text-xs font-black">{selectedTasks.length}</span>
              <span className="text-sm font-bold text-white">tasks selected</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={async () => {
                  try {
                    await Promise.all(selectedTasks.map(id => updateDepartmentTask(id, { status: 'Completed' })));
                    setTasks(prev => prev.map(t => selectedTasks.includes(t.id) ? { ...t, status: 'Completed' } : t));
                    setSelectedTasks([]);
                    showToast(`${selectedTasks.length} tasks marked as finished`);
                  } catch (e) {
                    showToast('Failed to update tasks', 'error');
                  }
                }}
                className="flex items-center gap-2 text-sm font-bold text-green-400 hover:text-green-300 transition-colors"
              >
                <FiCheckCircle size={18} />
                Finish
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedTasks.length} tasks?`)) {
                    selectedTasks.forEach(id => handleDelete(id));
                    setSelectedTasks([]);
                  }
                }}
                className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                <FiTrash2 size={18} />
                Delete
              </button>
            </div>
            <button
              onClick={() => setSelectedTasks([])}
              className="ml-4 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => { setShowModal(false); setEditingTask(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-[480px] overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              {/* Header */}
              <div className="p-8 pb-6 text-center relative">
                <button
                  onClick={() => { setShowModal(false); setEditingTask(null); }}
                  className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <FiX size={20} />
                </button>
                <h3 className="text-2xl font-bold text-[#1A1A2E] leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {editingTask ? 'Edit Task Details' : 'Assign New Task'}
                </h3>
                <p className="text-[13px] font-medium text-gray-500 mt-2">
                  {editingTask ? 'Update the following information to modify the task' : 'Fill in the details below to assign a new task to your team'}
                </p>
              </div>

              {/* Form Content */}
              <div className="px-8 pb-8 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Task Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.05em] text-gray-400 ml-1">Task Title *</label>
                    <div className="relative group">
                      <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Process March Payroll"
                        className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Assign To & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-[0.05em] text-gray-400 ml-1">Assign To *</label>
                      <div className="relative group">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors pointer-events-none" size={18} />
                        <select
                          required
                          value={formData.assignedTo}
                          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                          className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-10 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select member</option>
                          {teamMembers.map((member) => (
                            <option key={member.id || member._id} value={member.id || member._id}>{member.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <FiMoreHorizontal size={14} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-[0.05em] text-gray-400 ml-1">Priority</label>
                      <div className="relative group">
                        <FiZap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors pointer-events-none" size={18} />
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-10 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <FiMoreHorizontal size={14} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.05em] text-gray-400 ml-1">Due Date</label>
                    <div className="relative group">
                      <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.05em] text-gray-400 ml-1">Description</label>
                    <div className="relative group">
                      <FiAlignLeft className="absolute left-4 top-[18px] text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Expected outcomes and task details..."
                        rows={3}
                        className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all resize-none placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setEditingTask(null); }}
                      className="flex-1 py-3.5 bg-[#F8F9FA] hover:bg-gray-100 text-gray-500 rounded-2xl text-sm font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-[#1B4DA0] hover:bg-[#0D47A1] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#1B4DA0]/20 transition-all"
                    >
                      {editingTask ? 'Update Task' : 'Assign Task'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#fee2e2' }}>
                <FiTrash2 style={{ width: '32px', height: '32px', color: '#ef4444' }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Task?</h3>
              <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600">Cancel</button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  style={{
                    padding: '10px 20px', fontSize: '14px', fontWeight: 600,
                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #ef4444, #e11d48)',
                    color: '#fff',
                  }}
                >Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskAssignmentTab;
