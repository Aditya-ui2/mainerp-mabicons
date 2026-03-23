import { useState, useEffect, useRef } from 'react';
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
  FiFilter,
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

const statusOptions = [
  { value: 'all', label: 'All Status', dot: '#6366f1' },
  { value: 'Pending', label: 'Pending', dot: '#f59e0b' },
  { value: 'In Progress', label: 'In Progress', dot: '#3b82f6' },
  { value: 'Completed', label: 'Completed', dot: '#10b981' },
  { value: 'Overdue', label: 'Overdue', dot: '#ef4444' },
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
    <div ref={ref} style={{ position: 'relative', minWidth: '160px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '12px',
          border: '2px solid #e5e7eb', background: '#fff',
          cursor: 'pointer', fontSize: '14px', fontWeight: 500,
          color: '#374151', width: '100%', justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFilter style={{ width: '16px', height: '16px', color: '#6b7280' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selected.dot }}></span>
          {selected.label}
        </span>
        <FiChevronDown style={{ width: '16px', height: '16px', color: '#9ca3af', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: '#fff', borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
              border: '1px solid #e5e7eb', overflow: 'hidden',
              zIndex: 50, minWidth: '180px',
            }}
          >
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { setFilterStatus(option.value); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 16px', width: '100%',
                  background: filterStatus === option.value ? '#f0f4ff' : 'transparent',
                  border: 'none', cursor: 'pointer', fontSize: '13px',
                  fontWeight: filterStatus === option.value ? 600 : 400,
                  color: filterStatus === option.value ? '#4338ca' : '#374151',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (filterStatus !== option.value) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { if (filterStatus !== option.value) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: option.dot, flexShrink: 0 }}></span>
                <span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
                {filterStatus === option.value && (
                  <FiCheckCircle style={{ width: '14px', height: '14px', color: '#4338ca' }} />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const [toast, setToast] = useState(null);
  const [sendingComment, setSendingComment] = useState(false);

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
          <FiSearch style={{ width: '20px', height: '20px', color: '#9ca3af', position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
          />
        </div>
        <StatusFilterDropdown filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FiCheckSquare style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.3 }} />
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
                        <FiLoader style={{ width: '16px', height: '16px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                      >
                        {isExpanded ? <FiChevronUp style={{ width: '16px', height: '16px' }} /> : <FiChevronDown style={{ width: '16px', height: '16px' }} />}
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
                      <div style={{ padding: '20px', background: 'linear-gradient(180deg, #f8fafc, #f1f5f9)' }}>
                        {/* Comments Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <FiMessageSquare style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                            Comments
                          </span>
                          {task.comments?.length > 0 && (
                            <span style={{
                              fontSize: '11px', fontWeight: 600, color: '#6366f1',
                              background: '#e0e7ff', padding: '2px 8px', borderRadius: '9999px',
                            }}>
                              {task.comments.length}
                            </span>
                          )}
                        </div>

                        {/* Comments List - Chat Style */}
                        {task.comments?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                            {task.comments.map((comment, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                              >
                                {/* Avatar */}
                                <div style={{
                                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                  background: `linear-gradient(135deg, ${comment.byType === 'TeamLeader' ? '#f59e0b, #ea580c' : '#3b82f6, #6366f1'})`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#fff', fontSize: '13px', fontWeight: 700,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}>
                                  {(comment.byName || 'U').charAt(0).toUpperCase()}
                                </div>
                                {/* Message Bubble */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    background: '#fff', borderRadius: '0 12px 12px 12px',
                                    padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                    border: '1px solid #e2e8f0',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                                        {comment.byName || 'User'}
                                      </span>
                                      {comment.byType === 'TeamLeader' && (
                                        <span style={{
                                          fontSize: '10px', fontWeight: 600, color: '#b45309',
                                          background: '#fef3c7', padding: '1px 6px', borderRadius: '4px',
                                        }}>
                                          Manager
                                        </span>
                                      )}
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0, wordBreak: 'break-word' }}>
                                      {comment.text}
                                    </p>
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block', paddingLeft: '4px' }}>
                                    {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div style={{
                            textAlign: 'center', padding: '24px 16px', marginBottom: '16px',
                            background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1',
                          }}>
                            <FiMessageSquare style={{ width: '28px', height: '28px', color: '#cbd5e1', margin: '0 auto 8px' }} />
                            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No comments yet — start the conversation!</p>
                          </div>
                        )}

                        {/* Add Comment Input */}
                        {task.status !== 'Completed' && (
                          <div style={{
                            display: 'flex', gap: '10px', alignItems: 'center',
                            background: '#fff', borderRadius: '16px', padding: '6px 6px 6px 16px',
                            border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            transition: 'border-color 0.2s',
                          }}>
                            <input
                              type="text"
                              value={expandedTask === task.id ? commentText : ''}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && !sendingComment && handleAddComment(task.id)}
                              placeholder="Write a message..."
                              style={{
                                flex: 1, border: 'none', outline: 'none', fontSize: '14px',
                                color: '#1e293b', background: 'transparent',
                              }}
                            />
                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => handleAddComment(task.id)}
                              disabled={sendingComment || !commentText.trim()}
                              style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: commentText.trim() ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#e2e8f0',
                                border: 'none', cursor: commentText.trim() ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.2s',
                                opacity: sendingComment ? 0.6 : 1,
                              }}
                            >
                              {sendingComment ? (
                                <FiLoader style={{ width: '16px', height: '16px', color: '#fff', animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <FiSend style={{ width: '16px', height: '16px', color: commentText.trim() ? '#fff' : '#94a3b8' }} />
                              )}
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
