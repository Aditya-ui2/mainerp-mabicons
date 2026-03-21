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
    Pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    Completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Overdue: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  };
  const c = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-orange-100 text-orange-700',
    Urgent: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${config[priority] || config.Medium}`}>
      <FiFlag className="w-3 h-3" />
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
      // Mock data
      setTeamMembers([
        { _id: '1', name: 'Manju Sharma', role: 'HR Executive' },
        { _id: '2', name: 'Jyoti Verma', role: 'Leave Manager' },
        { _id: '3', name: 'Priya Singh', role: 'Payroll Specialist' },
      ]);
      setTasks([
        { _id: '1', title: 'Process March Payroll', description: 'Process payroll for TechCorp employees', assignedTo: { _id: '1', name: 'Manju Sharma' }, assignedToName: 'Manju Sharma', status: 'In Progress', priority: 'High', dueDate: '2026-03-25', createdAt: new Date() },
        { _id: '2', title: 'Review Leave Requests', description: 'Review and approve pending leave requests', assignedTo: { _id: '2', name: 'Jyoti Verma' }, assignedToName: 'Jyoti Verma', status: 'Pending', priority: 'Medium', dueDate: '2026-03-20', createdAt: new Date() },
        { _id: '3', title: 'Update Attendance Records', description: 'Update attendance for all clients', assignedTo: { _id: '3', name: 'Priya Singh' }, assignedToName: 'Priya Singh', status: 'Completed', priority: 'Low', dueDate: '2026-03-18', createdAt: new Date() },
        { _id: '4', title: 'Prepare Tax Documentation', description: 'Prepare TDS documentation for Q4', assignedTo: { _id: '1', name: 'Manju Sharma' }, assignedToName: 'Manju Sharma', status: 'Overdue', priority: 'Urgent', dueDate: '2026-03-15', createdAt: new Date() },
      ]);
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
        await updateDepartmentTask(editingTask._id, taskData);
      } else {
        await createDepartmentTask(taskData);
      }

      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      alert(error.message || 'Failed to save task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateDepartmentTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteDepartmentTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <FiCheckSquare className="w-6 h-6 text-white" />
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
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
        >
          <FiPlus className="w-4 h-4" />
          Assign Task
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks or assignee..."
            className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
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
        <div className="text-center py-16 text-gray-500">
          <FiCheckSquare size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tasks found</p>
          <p className="text-sm mt-1">Assign your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, idx) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <FiUser className="w-4 h-4" />
                      <span>{task.assignedToName}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="w-4 h-4" />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.status !== 'Completed' && (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white font-medium cursor-pointer"
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
                        assignedTo: task.assignedTo?._id || '',
                        priority: task.priority,
                        dueDate: task.dueDate?.split('T')[0] || '',
                      });
                      setShowModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setConfirmDelete(task._id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => { setShowModal(false); setEditingTask(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingTask ? 'Edit Task' : 'Assign New Task'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); setEditingTask(null); }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Process March Payroll"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task details..."
                    rows={3}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                    <select
                      required
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                    >
                      <option value="">Select member</option>
                      {teamMembers.map(member => (
                        <option key={member._id} value={member._id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingTask(null); }}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                  >
                    {editingTask ? 'Update Task' : 'Assign Task'}
                  </button>
                </div>
              </form>
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
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <FiTrash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Task?</h3>
              <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskAssignmentTab;
