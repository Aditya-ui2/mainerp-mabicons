import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckSquare,
  FiClock,
  FiCalendar,
  FiFlag,
  FiMessageSquare,
  FiSearch,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import {
  getMyDepartmentTasks,
  updateDepartmentTask,
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
    Low: { bg: '#f1f5f9', text: '#475569' },
    Medium: { bg: '#fef3c7', text: '#92400e' },
    High: { bg: '#ffedd5', text: '#c2410c' },
    Urgent: { bg: '#fee2e2', text: '#991b1b' },
  };
  const c = config[priority] || config.Medium;
  return (
    <span style={{ background: c.bg, color: c.text, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
      <FiFlag style={{ width: '12px', height: '12px' }} />
      {priority}
    </span>
  );
};

const MyTasksTab = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedTask, setExpandedTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getMyDepartmentTasks();
      setTasks(res.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await updateDepartmentTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, ...(newStatus === 'Completed' ? { completedAt: new Date().toISOString() } : {}) } : t));
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleAddComment = async (taskId) => {
    if (!commentText.trim()) return;
    try {
      await updateDepartmentTask(taskId, { comments: commentText });
      setCommentText('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div style={{ padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
          <FiCheckSquare style={{ width: '24px', height: '24px', color: '#fff' }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-sm text-gray-500">Your assigned tasks and todo items</p>
        </div>
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
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium cursor-pointer focus:ring-2 focus:ring-blue-500/50"
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
          <p className="font-medium">{tasks.length === 0 ? 'No tasks assigned yet' : 'No tasks match your filters'}</p>
          <p className="text-sm mt-1">Tasks assigned by your team head will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, idx) => {
            const daysInfo = getDaysLeft(task.dueDate);
            const isExpanded = expandedTask === task.id;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      {/* Title Row */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {task.status === 'Completed' ? (
                          <FiCheckCircle style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0 }} />
                        ) : task.status === 'Overdue' ? (
                          <FiAlertCircle style={{ width: '20px', height: '20px', color: '#ef4444', flexShrink: 0 }} />
                        ) : (
                          <FiClock style={{ width: '20px', height: '20px', color: '#6b7280', flexShrink: 0 }} />
                        )}
                        <h3 className={`font-semibold ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-gray-500 mb-3 ml-7">{task.description}</p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 ml-7">
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5">
                            <FiCalendar style={{ width: '14px', height: '14px' }} />
                            <span>{new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                        {daysInfo && (
                          <span style={{ color: daysInfo.color, fontWeight: 600, fontSize: '12px' }}>
                            {daysInfo.text}
                          </span>
                        )}
                        {task.assignedByName && (
                          <span className="text-xs text-gray-400">
                            Assigned by: {task.assignedByName}
                          </span>
                        )}
                        {task.comments?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FiMessageSquare style={{ width: '14px', height: '14px' }} />
                            <span>{task.comments.length}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {task.status !== 'Completed' && (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          disabled={updatingTaskId === task.id}
                          className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white font-medium cursor-pointer disabled:opacity-50"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Mark Complete</option>
                        </select>
                      )}
                      {updatingTaskId === task.id && (
                        <FiLoader className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                      >
                        {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Expanded Section - Comments */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 overflow-hidden"
                    >
                      <div className="p-5 bg-gray-50">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Comments</h4>

                        {/* Existing Comments */}
                        {task.comments?.length > 0 ? (
                          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                            {task.comments.map((comment, i) => (
                              <div key={i} className="bg-white rounded-lg p-3 text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-700">{comment.byName || 'User'}</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-gray-600">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 mb-4">No comments yet</p>
                        )}

                        {/* Add Comment */}
                        {task.status !== 'Completed' && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={expandedTask === task.id ? commentText : ''}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(task.id)}
                              placeholder="Add a comment..."
                              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAddComment(task.id)}
                              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                            >
                              <FiSend style={{ width: '16px', height: '16px' }} />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasksTab;
