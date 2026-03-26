import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckSquare,
  FiPlus,
  FiSearch,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiSend,
  FiTrendingUp,
  FiTarget,
  FiRefreshCw,
} from 'react-icons/fi';

/* ── Priority Badge ── */
const PriorityBadge = ({ priority }) => {
  const config = {
    High: { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' },
    Medium: { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
    Low: { bg: '#dcfce7', text: '#16a34a', dot: '#22c55e' },
  };
  const { bg, text, dot } = config[priority] || config.Medium;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: bg, color: text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }}></span>
      {priority}
    </span>
  );
};

/* ── Status Badge ── */
const TaskStatusBadge = ({ status }) => {
  const config = {
    'Not Started': { bg: '#f1f5f9', text: '#64748b' },
    'In Progress': { bg: '#dbeafe', text: '#2563eb' },
    'Completed': { bg: '#dcfce7', text: '#16a34a' },
    'On Hold': { bg: '#fef3c7', text: '#d97706' },
    'Overdue': { bg: '#fee2e2', text: '#dc2626' },
  };
  const { bg, text } = config[status] || config['Not Started'];
  return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: bg, color: text }}>
      {status}
    </span>
  );
};

/* ══════════════════════════════════════════════════════ */
const TaskAssignmentTab = ({ isDarkMode, userRole = 'KAM', currentUserId = null }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    type: 'candidate',
    relatedItem: '',
    priority: 'Medium',
    dueDate: '',
    instructions: '',
  });

  // Team members - Sachin's team
  const teamMembers = [
    { id: 'emp-001', name: 'Jyoti Yadav', photo: 'https://randomuser.me/api/portraits/women/32.jpg' },
    { id: 'emp-002', name: 'Manju Saini', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 'emp-003', name: 'Priyanshi Sharma', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: 'emp-004', name: 'Anushka Raturi', photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
  ];

  // Mock tasks data
  useEffect(() => {
    const mockTasks = [
      {
        id: 1,
        title: 'Screen candidates for TechCorp India',
        description: 'Review and screen 5 new applications for Senior Software Engineer position',
        type: 'screening',
        assignedTo: 'emp-001',
        assignedBy: 'Sachin',
        client: 'TechCorp India',
        relatedCandidates: ['Rahul Sharma', 'Vikram Rao'],
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-03-22',
        createdAt: '2026-03-18',
        progress: 40,
        comments: 2,
      },
      {
        id: 2,
        title: 'Schedule interviews for StartupXYZ',
        description: 'Coordinate and schedule client interviews for Product Manager candidates',
        type: 'interview',
        assignedTo: 'emp-002',
        assignedBy: 'Sachin',
        client: 'StartupXYZ',
        relatedCandidates: ['Priya Singh'],
        priority: 'High',
        status: 'Not Started',
        dueDate: '2026-03-21',
        createdAt: '2026-03-19',
        progress: 0,
        comments: 0,
      },
      {
        id: 3,
        title: 'Follow up with DesignHub candidates',
        description: 'Contact shortlisted UI/UX designers and collect availability',
        type: 'followup',
        assignedTo: 'emp-003',
        assignedBy: 'Sachin',
        client: 'DesignHub',
        relatedCandidates: ['Amit Kumar'],
        priority: 'Medium',
        status: 'Completed',
        dueDate: '2026-03-19',
        createdAt: '2026-03-16',
        progress: 100,
        comments: 5,
      },
      {
        id: 4,
        title: 'Prepare offer letter for CloudScale',
        description: 'Draft and send offer letter to selected DevOps Engineer candidate',
        type: 'offer',
        assignedTo: 'emp-004',
        assignedBy: 'Sachin',
        client: 'CloudScale',
        relatedCandidates: ['Sneha Patel'],
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-03-20',
        createdAt: '2026-03-18',
        progress: 70,
        comments: 3,
      },
      {
        id: 5,
        title: 'Update candidate profiles in SharePoint',
        description: 'Sync latest candidate data and interview feedback to SharePoint',
        type: 'admin',
        assignedTo: 'emp-001',
        assignedBy: 'Sachin',
        client: null,
        relatedCandidates: [],
        priority: 'Low',
        status: 'Not Started',
        dueDate: '2026-03-23',
        createdAt: '2026-03-20',
        progress: 0,
        comments: 0,
      },
    ];

    // Filter tasks based on role
    if (userRole === 'Employee' && currentUserId) {
      setTasks(mockTasks.filter(t => t.assignedTo === currentUserId));
    } else {
      setTasks(mockTasks);
    }
    setLoading(false);
  }, [userRole, currentUserId]);

  // Stats
  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesAssignee = filterAssignee === 'all' || t.assignedTo === filterAssignee;
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const getAssigneeName = (id) => teamMembers.find(m => m.id === id)?.name || 'Unassigned';
  const getAssigneePhoto = (id) => teamMembers.find(m => m.id === id)?.photo || null;

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      setToast('Please fill required fields');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    const task = {
      id: Date.now(),
      ...newTask,
      assignedBy: 'Sachin',
      status: 'Not Started',
      progress: 0,
      comments: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks(prev => [task, ...prev]);
    setShowCreateModal(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      type: 'candidate',
      relatedItem: '',
      priority: 'Medium',
      dueDate: '',
      instructions: '',
    });
    setToast('Task created successfully!');
    setTimeout(() => setToast(null), 2000);
  };

  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus, progress: newStatus === 'Completed' ? 100 : t.progress } : t
    ));
    setToast('Task status updated!');
    setTimeout(() => setToast(null), 2000);
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25)' }}>
            <FiCheckSquare className="w-6 h-6" style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(90deg, #10b981, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Task Assignment
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {userRole === 'KAM' ? 'Manage and track team tasks' : 'Your assigned tasks'}
            </p>
          </div>
        </div>
        {userRole === 'KAM' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl"
            style={{ background: 'linear-gradient(90deg, #10b981, #0d9488)', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25)' }}
          >
            <FiPlus className="w-4 h-4" />
            Create Task
          </motion.button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, icon: FiCheckSquare, color: '#8b5cf6' },
          { label: 'In Progress', value: stats.inProgress, icon: FiRefreshCw, color: '#3b82f6' },
          { label: 'Completed', value: stats.completed, icon: FiCheckCircle, color: '#10b981' },
          { label: 'Overdue', value: stats.overdue, icon: FiAlertCircle, color: '#ef4444' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl p-5 ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                  <p className="text-3xl font-extrabold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: stat.color, boxShadow: `0 10px 15px -3px ${stat.color}40` }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-3"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`rounded-xl border-2 px-4 py-3 font-medium ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
        >
          <option value="all">All Status</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
        {userRole === 'KAM' && (
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className={`rounded-xl border-2 px-4 py-3 font-medium ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
          >
            <option value="all">All Team</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        )}
      </motion.div>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl p-5 ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox / Status */}
                <button
                  onClick={() => handleUpdateStatus(task.id, task.status === 'Completed' ? 'In Progress' : 'Completed')}
                  className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    task.status === 'Completed'
                      ? 'bg-emerald-500 border-emerald-500'
                      : isDarkMode ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500'
                  }`}
                >
                  {task.status === 'Completed' && <FiCheckCircle className="w-4 h-4 text-white" />}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${task.status === 'Completed' ? 'line-through opacity-60' : ''} ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    {/* Assignee */}
                    <div className="flex items-center gap-2">
                      {getAssigneePhoto(task.assignedTo) ? (
                        <img src={getAssigneePhoto(task.assignedTo)} alt="" className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <FiUser className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {getAssigneeName(task.assignedTo)}
                      </span>
                    </div>

                    {/* Client */}
                    {task.client && (
                      <span className={`flex items-center gap-1.5 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <FiTarget className="w-4 h-4" />
                        {task.client}
                      </span>
                    )}

                    {/* Due Date */}
                    <span className={`flex items-center gap-1.5 text-sm ${
                      new Date(task.dueDate) < new Date() && task.status !== 'Completed'
                        ? 'text-red-500'
                        : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <FiCalendar className="w-4 h-4" />
                      {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {task.status !== 'Completed' && task.progress > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Progress</span>
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{task.progress}%</span>
                      </div>
                      <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${task.progress}%`, background: 'linear-gradient(90deg, #10b981, #0d9488)' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {userRole === 'KAM' && (
                  <div className="flex items-center gap-1">
                    <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                      <FiEdit2 className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                    <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                      <FiTrash2 className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className={`text-center py-12 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <FiCheckSquare className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No tasks found</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}
            >
              {/* Header */}
              <div className={`sticky top-0 flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>
                    <FiCheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Create New Task</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign work to team member</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  <FiX className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Task Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    placeholder="Enter task title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
                  <textarea
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border-2 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    placeholder="Task description..."
                  />
                </div>

                {/* Assign To */}
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Assign To *</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Priority & Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Due Date *</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Instructions</label>
                  <textarea
                    rows={2}
                    value={newTask.instructions}
                    onChange={(e) => setNewTask(prev => ({ ...prev, instructions: e.target.value }))}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border-2 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    placeholder="Any specific instructions..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-5 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateTask}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg"
                >
                  <FiSend className="w-4 h-4" />
                  Create Task
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskAssignmentTab;
