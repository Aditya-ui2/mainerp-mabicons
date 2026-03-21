import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClipboard, FiPlus, FiClock, FiCheckCircle, FiAlertCircle, FiUser, FiCalendar, FiSearch, FiEdit2, FiEye, FiX, FiTrendingUp } from 'react-icons/fi';

const TaskByClientTab = ({ isDarkMode, selectedClient }) => {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const mockClients = [
      { id: 1, name: 'ABC Corporation' },
      { id: 2, name: 'XYZ Industries' },
      { id: 3, name: 'Tech Solutions Ltd' },
      { id: 4, name: 'Global Services Inc' },
    ];
    const mockTasks = [
      { id: 1, title: 'Payroll Processing', client: 'ABC Corporation', assignedTo: 'Rahul Sharma', priority: 'high', status: 'in-progress', dueDate: '2026-03-20', progress: 60 },
      { id: 2, title: 'Compliance Audit', client: 'XYZ Industries', assignedTo: 'Priya Singh', priority: 'urgent', status: 'pending', dueDate: '2026-03-18', progress: 0 },
      { id: 3, title: 'Employee Onboarding', client: 'Tech Solutions Ltd', assignedTo: 'Amit Kumar', priority: 'normal', status: 'completed', dueDate: '2026-03-15', progress: 100 },
      { id: 4, title: 'Leave Management Setup', client: 'Global Services Inc', assignedTo: 'Sneha Patel', priority: 'normal', status: 'in-progress', dueDate: '2026-03-22', progress: 40 },
      { id: 5, title: 'Tax Consultation', client: 'ABC Corporation', assignedTo: 'Vikram Rao', priority: 'high', status: 'pending', dueDate: '2026-03-25', progress: 0 },
      { id: 6, title: 'HR Policy Review', client: 'XYZ Industries', assignedTo: 'Rahul Sharma', priority: 'low', status: 'completed', dueDate: '2026-03-10', progress: 100 },
    ];
    setTimeout(() => {
      setClients(mockClients);
      setTasks(mockTasks);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: FiClipboard, gradient: 'from-violet-500 to-purple-600', shadowColor: 'shadow-violet-500/25' },
    { label: 'Pending', value: stats.pending, icon: FiClock, gradient: 'from-amber-500 to-yellow-600', shadowColor: 'shadow-amber-500/25' },
    { label: 'In Progress', value: stats.inProgress, icon: FiTrendingUp, gradient: 'from-blue-500 to-cyan-600', shadowColor: 'shadow-blue-500/25' },
    { label: 'Completed', value: stats.completed, icon: FiCheckCircle, gradient: 'from-emerald-500 to-green-600', shadowColor: 'shadow-emerald-500/25' },
  ];

  const getPriorityConfig = (priority) => {
    const configs = {
      'urgent': { gradient: 'from-red-500 to-rose-600', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
      'high': { gradient: 'from-orange-500 to-amber-600', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
      'normal': { gradient: 'from-blue-500 to-cyan-600', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      'low': { gradient: 'from-slate-500 to-gray-600', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-700' },
    };
    return configs[priority] || configs.normal;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: FiClock, gradient: 'from-amber-500 to-yellow-600' },
      'in-progress': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: FiAlertCircle, gradient: 'from-blue-500 to-cyan-600' },
      'completed': { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: FiCheckCircle, gradient: 'from-emerald-500 to-green-600' },
    };
    return configs[status];
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-green-600',
      'from-pink-500 to-rose-600',
      'from-amber-500 to-yellow-600',
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'all' || task.client === filterClient;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesClient && matchesStatus;
  });

  // Skeleton Loader
  if (loading) {
    return (
      <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        <div className="flex justify-between items-center">
          <div>
            <div className={`h-8 w-56 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
            <div className={`h-4 w-44 rounded mt-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
          </div>
          <div className={`h-10 w-32 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-24 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-44 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div 
            className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <FiClipboard className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Tasks by Client
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage client-specific tasks and deliverables
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-shadow"
        >
          <FiPlus className="w-5 h-5" />
          Add Task
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            onMouseEnter={() => setHoveredCard(stat.label)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative p-4 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
            } ${hoveredCard === stat.label ? `shadow-xl ${stat.shadowColor}` : 'shadow-lg'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 transition-opacity duration-300 ${hoveredCard === stat.label ? 'opacity-10' : ''}`} />
            <div className="relative flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg ${stat.shadowColor}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 pl-11 transition-all duration-300 focus:ring-2 focus:ring-violet-500/50 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className={`rounded-xl border px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-violet-500/50 ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
          }`}
        >
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`rounded-xl border px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-violet-500/50 ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
          }`}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </motion.div>

      {/* Task Cards */}
      <AnimatePresence mode="popLayout">
        <div className="grid gap-4">
          {filteredTasks.map((task, index) => {
            const statusConfig = getStatusConfig(task.status);
            const priorityConfig = getPriorityConfig(task.priority);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div 
                key={task.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${priorityConfig.gradient} shadow-lg`}>
                      <FiClipboard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gradient-to-r ${priorityConfig.gradient} text-white`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Client: <span className="font-medium text-violet-500">{task.client}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${getAvatarGradient(task.assignedTo)} flex items-center justify-center text-white text-xs font-bold`}>
                          {task.assignedTo.charAt(0)}
                        </div>
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{task.assignedTo}</span>
                      </div>
                      <p className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <FiCalendar className="w-3.5 h-3.5" /> {task.dueDate}
                      </p>
                    </div>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {task.status.replace('-', ' ')}
                    </motion.span>
                  </div>
                </div>

                {/* Progress Bar */}
                {task.status !== 'pending' && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Progress</span>
                      <span className="text-sm font-semibold">{task.progress}%</span>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <motion.div 
                        className={`h-full rounded-full bg-gradient-to-r ${task.progress === 100 ? 'from-emerald-500 to-green-600' : 'from-violet-500 to-purple-600'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                  </div>
                )}

                <div className={`flex gap-2 mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    <FiEye className="w-4 h-4" /> View
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    <FiEdit2 className="w-4 h-4" /> Update
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-16 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
        >
          <FiClipboard className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No tasks found</p>
          <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Try adjusting your filters</p>
        </motion.div>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg">
                    <FiPlus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Add New Task</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Task Title</label>
                  <input 
                    type="text" 
                    className={`w-full rounded-xl border px-4 py-3 transition-all focus:ring-2 focus:ring-violet-500/50 ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'
                    }`} 
                    placeholder="Enter task title" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Client</label>
                    <select className={`w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                      {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Assign To</label>
                    <select className={`w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                      <option>Rahul Sharma</option>
                      <option>Priya Singh</option>
                      <option>Amit Kumar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select className={`w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Due Date</label>
                    <input 
                      type="date" 
                      className={`w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea 
                    rows={3} 
                    className={`w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} 
                    placeholder="Task description..." 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button 
                    type="button" 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(false)} 
                    className={`flex-1 px-4 py-3 rounded-xl font-medium ${
                      isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg"
                  >
                    Add Task
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Task Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getPriorityConfig(selectedTask.priority).gradient} shadow-lg`}>
                    <FiClipboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedTask.title}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedTask.client}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTask(null)}
                  className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assigned To</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getAvatarGradient(selectedTask.assignedTo)} flex items-center justify-center text-white text-sm font-bold`}>
                        {selectedTask.assignedTo.charAt(0)}
                      </div>
                      <p className="font-semibold">{selectedTask.assignedTo}</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Due Date</p>
                    <p className="font-semibold flex items-center gap-2 mt-1">
                      <FiCalendar className="w-4 h-4 text-violet-500" />
                      {selectedTask.dueDate}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Progress</p>
                  <div className="flex items-center gap-4">
                    <div className={`flex-1 h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                      <motion.div 
                        className={`h-full rounded-full bg-gradient-to-r ${selectedTask.progress === 100 ? 'from-emerald-500 to-green-600' : 'from-violet-500 to-purple-600'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedTask.progress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="text-lg font-bold">{selectedTask.progress}%</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusConfig(selectedTask.status).color}`}>
                    {selectedTask.status.replace('-', ' ')}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize bg-gradient-to-r ${getPriorityConfig(selectedTask.priority).gradient} text-white`}>
                    {selectedTask.priority}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium shadow-lg"
                >
                  <FiEdit2 className="w-5 h-5" />
                  Edit Task
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTask(null)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium ${
                    isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskByClientTab;
