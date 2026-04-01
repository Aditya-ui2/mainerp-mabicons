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
    Low: { bg: '#f1f5f9', text: '#475569' },
    Medium: { bg: '#fef3c7', text: '#92400e' },
    High: { bg: '#ffedd5', text: '#c2410c' },
    Urgent: { bg: '#fee2e2', text: '#991b1b' },
  };
  const c = config[priority] || config.Medium;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', background: c.bg, color: c.text, border: '1px solid rgba(0,0,0,0.06)' }}>
      <FiFlag style={{ width: '12px', height: '12px' }} />
      {priority}
    </span>
  );
};

const TaskAssignmentTab = ({ department = 'HR Operations' }) => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
  });
  const [toast, setToast] = useState(null);

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
      const [tasksRes, membersRes] = await Promise.all([
        getDepartmentTasks(department),
        getDepartmentTeamMembers(department),
      ]);
      setTasks(tasksRes.tasks || []);
      setTeamMembers(membersRes.members || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setTasks([]);
      setTeamMembers([]);
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
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => t.status === 'Overdue').length,
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
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
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
    <div className="space-y-6">
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div style={{ padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
            <FiCheckSquare style={{ width: '24px', height: '24px', color: '#fff' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Task Assignment</h2>
            <p className="text-sm text-gray-500">Assign and track tasks for your team</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingTask(null); setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' }); setShowModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', fontSize: '14px', fontWeight: 600,
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
          }}
        >
          <FiPlus style={{ width: '16px', height: '16px' }} />
          Assign Task
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: '#6366f1' },
          { label: 'Pending', value: stats.pending, color: '#f59e0b' },
          { label: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
          { label: 'Completed', value: stats.completed, color: '#10b981' },
          { label: 'Overdue', value: stats.overdue, color: '#ef4444' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm" style={{ borderTop: `3px solid ${stat.color}` }}>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <div className="relative flex-1">
          <FiSearch style={{ width: '20px', height: '20px', color: '#9ca3af', position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks or assignee..."
            className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium cursor-pointer focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200">
          <FiCheckSquare style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.3 }} />
          <p className="font-medium">No tasks found</p>
          <p className="text-sm mt-1">Assign your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderLeft: `4px solid ${getTaskCardTone(task.status).border}`, background: getTaskCardTone(task.status).bg }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold text-gray-900">{task.title}</h3>
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <FiUser style={{ width: '16px', height: '16px' }} />
                      <span>{task.assignedToName}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5">
                        <FiCalendar style={{ width: '16px', height: '16px' }} />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.status !== 'Completed' && (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white font-semibold cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
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
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-transparent hover:border-gray-200"
                  >
                    <FiEdit2 style={{ width: '16px', height: '16px' }} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setConfirmDelete(task.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 border border-transparent hover:border-red-100"
                  >
                    <FiTrash2 style={{ width: '16px', height: '16px' }} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-40 bg-gray-100 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, x: 140 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 120 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="min-h-screen px-3 py-4 sm:px-5 sm:py-6"
            >
              <div className="max-w-6xl mx-auto space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingTask(null); }}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {'< Back to Task Assignment'}
                  </button>
                  <h3 className="text-2xl font-bold text-slate-900 text-center">
                    {editingTask ? 'Edit Task' : 'Assign New Task'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingTask(null); }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                  >
                    <FiX style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FiCheckSquare className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Basic Information</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Task Title *</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. Process March Payroll"
                          className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Task details and expected output..."
                          rows={6}
                          className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FiUser className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assignment Details</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Assign To *</label>
                        <select
                          required
                          value={formData.assignedTo}
                          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                          className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        >
                          <option value="">Select member</option>
                          {teamMembers.map((member) => (
                            <option key={member.id || member._id} value={member.id || member._id}>{member.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <FiCalendar className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Schedule</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Due Date</label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setEditingTask(null); }}
                      className="px-6 py-2.5 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-7 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)', boxShadow: '0 8px 20px rgba(30,136,229,0.3)' }}
                    >
                      <FiPlus className="w-4 h-4" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
