

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
  const [view, setView] = useState('list');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const mockClients = [
      { id: 1, name: 'ABC Corporation' },
      { id: 2, name: 'XYZ Industries' },
      { id: 3, name: 'Tech Solutions Ltd' },
      { id: 4, name: 'Global Services Inc' },
    ];
    const mockTasks = [
      { id: 1, title: 'Payroll Processing', client: 'ABC Corporation', assignedTo: 'Rahul Sharma', priority: 'High', status: 'In Progress', dueDate: '2026-03-20', progress: 60 },
      { id: 2, title: 'Compliance Audit', client: 'XYZ Industries', assignedTo: 'Priya Singh', priority: 'Urgent', status: 'Pending', dueDate: '2026-03-18', progress: 0 },
      { id: 3, title: 'Employee Onboarding', client: 'Tech Solutions Ltd', assignedTo: 'Amit Kumar', priority: 'Normal', status: 'Completed', dueDate: '2026-03-15', progress: 100 },
      { id: 4, title: 'Leave Management Setup', client: 'Global Services Inc', assignedTo: 'Sneha Patel', priority: 'Normal', status: 'In Progress', dueDate: '2026-03-22', progress: 40 },
      { id: 5, title: 'Tax Consultation', client: 'ABC Corporation', assignedTo: 'Vikram Rao', priority: 'High', status: 'Pending', dueDate: '2026-03-25', progress: 0 },
      { id: 6, title: 'HR Policy Review', client: 'XYZ Industries', assignedTo: 'Rahul Sharma', priority: 'Low', status: 'Completed', dueDate: '2026-03-10', progress: 100 },
    ];
    setTimeout(() => {
      setClients(mockClients);
      setTasks(mockTasks);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
  };

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: FiClipboard, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]' },
    { label: 'Pending Audit', value: stats.pending, icon: FiClock, gradient: 'from-[#FFB300] to-[#F57C00]' },
    { label: 'In Progress', value: stats.inProgress, icon: FiTrendingUp, gradient: 'from-[#3FA9F5] to-[#1E88E5]' },
    { label: 'Completed Pulse', value: stats.completed, icon: FiCheckCircle, gradient: 'from-[#81C784] to-[#43A047]' },
  ];

  const getPriorityConfig = (priority) => {
    const configs = {
      'Urgent': { gradient: 'from-red-500 to-rose-600', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
      'High': { gradient: 'from-orange-500 to-amber-600', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
      'Normal': { gradient: 'from-blue-500 to-cyan-600', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      'Low': { gradient: 'from-slate-500 to-gray-600', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-700' },
    };
    return configs[priority] || configs.Normal;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Pending': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: FiClock, gradient: 'from-[#FFB300] to-[#F57C00]' },
      'In Progress': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: FiTrendingUp, gradient: 'from-[#3FA9F5] to-blue-600' },
      'Completed': { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: FiCheckCircle, gradient: 'from-[#81C784] to-[#43A047]' },
    };
    return configs[status] || configs.Pending;
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-[#3FA9F5] to-[#0D47A1]',
      'from-violet-500 to-purple-600',
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

  if (loading) {
    return (
      <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        <div className="flex justify-between items-center text-left">
          <div className="space-y-3">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-48 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
          <div className={`h-12 w-40 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-28 rounded-[2rem] animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[600px] font-[Outfit] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-12"
          >
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
              <div className="flex items-center gap-4 text-left">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20">
                  <FiClipboard className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-3xl lg:text-4xl font-black text-[#1E88E5] tracking-tight mb-1">
                    Client Task Hub
                  </h2>
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <FiTrendingUp className="w-4 h-4" />
                    <span className="text-sm">
                      Audit Stream • {stats.total} Active Deliverables
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('add')}
                className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.2rem] font-black shadow-xl shadow-blue-500/30 transition-all text-[11px]"
              >
                <FiPlus className="w-4 h-4" />
                Initiate New Task
              </motion.button>
            </div>

            {/* Stats Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <div className="relative z-10 flex flex-col gap-4 text-left">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} w-fit shadow-lg shadow-blue-500/10`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className={`text-[12px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                    <p className="text-3xl font-black leading-none">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Filter Hub */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col lg:flex-row gap-4 p-4 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-white shadow-xl shadow-blue-500/5'}`}
            >
              <div className="relative flex-1 group">
                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Scan Protocol Archives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full bg-white dark:bg-slate-800 rounded-2xl border-none px-14 py-4 focus:ring-4 focus:ring-blue-500/10 font-bold text-sm transition-all shadow-sm`}
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                  className={`bg-white dark:bg-slate-800 rounded-2xl border-none px-6 py-4 focus:ring-4 focus:ring-blue-500/10 font-bold text-sm transition-all shadow-sm cursor-pointer min-w-[200px]`}
                >
                  <option value="all">Client Registry</option>
                  {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`bg-white dark:bg-slate-800 rounded-2xl border-none px-6 py-4 focus:ring-4 focus:ring-blue-500/10 font-bold text-sm transition-all shadow-sm cursor-pointer min-w-[180px]`}
                >
                  <option value="all">Status Protocol</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="In Progress">Active Execution</option>
                  <option value="Completed">Verified Pulse</option>
                </select>
              </div>
            </motion.div>

            {/* Task Card Grid */}
            <div className="flex flex-col gap-4 pb-12">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task, idx) => {
                  const statusConfig = getStatusConfig(task.status);
                  const priorityConfig = getPriorityConfig(task.priority);
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => { setSelectedTask(task); setView('details'); }}
                      className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500/20'}`}
                    >
                      <div className="p-6 px-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6 min-w-[350px] text-left">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${priorityConfig.gradient} flex items-center justify-center text-white shadow-lg`}>
                            <FiClipboard className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-extrabold text-xl capitalize leading-tight group-hover:text-blue-600 transition-colors">{task.title}</h3>
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                              <span className="text-blue-500">{task.client}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              <FiCalendar className="w-3 h-3" /> Due {task.dueDate}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 max-w-[200px] text-left">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(task.assignedTo)} flex items-center justify-center text-white font-black text-[10px]`}>
                              {task.assignedTo.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs font-black">{task.assignedTo}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig.color} border border-current opacity-80`}>
                              {task.status}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <FiChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredTasks.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <FiClipboard className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                  <p className="text-lg font-black text-slate-300 uppercase tracking-widest">No Deliverables Logged</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'add' && (
          <motion.div
            key="add"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10"
          >
            <div className="flex flex-col gap-8 text-left">
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => setView('list')}
                className="flex items-center gap-2.5 self-start px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-[11px]"
              >
                <FiArrowLeft className="w-4 h-4" />
                Return To Hub
              </motion.button>
              <div className="flex items-center gap-6">
                <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/20">
                  <FiPlus className="w-12 h-12 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-5xl font-black tracking-tight leading-none">Initiate Task</h2>
                  <p className="text-sm font-bold text-[#3FA9F5] mt-4 ml-1 uppercase tracking-widest underline underline-offset-8">Client Protocol Entry</p>
                </div>
              </div>
            </div>

            <div className={`p-16 rounded-[4rem] border-2 text-left ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/10'}`}>
              <form className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Protocol Title</label>
                    <input type="text" placeholder="Task Classification" className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`} />
                  </div>
                  <div className="space-y-4 text-left">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Client Registry</label>
                    <select className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      {clients.map(c => <option key={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4 text-left">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Strategic Priority</label>
                    <select className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <option>Urgent</option>
                      <option>High</option>
                      <option>Normal</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div className="space-y-4 text-left">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Execution Deadline</label>
                    <input type="date" className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`} />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('list')}
                  className="px-16 py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black text-[13px] shadow-2xl shadow-blue-500/40"
                >
                  Deploy Task Protocol
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {view === 'details' && selectedTask && (
          <motion.div
            key="details"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10"
          >
            <div className="flex flex-col gap-8 text-left">
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => setView('list')}
                className="flex items-center gap-2.5 self-start px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-[11px]"
              >
                <FiArrowLeft className="w-4 h-4" />
                Return To Hub
              </motion.button>
              <div className="flex items-center gap-8 text-left">
                <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${getPriorityConfig(selectedTask.priority).gradient} flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-blue-500/30`}>
                  <FiClipboard className="w-16 h-16" />
                </div>
                <div className="flex flex-col text-left">
                  <h2 className="text-5xl font-black tracking-tight leading-none capitalize">{selectedTask.title}</h2>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#1E88E5] rounded-full text-[11px] font-black uppercase tracking-widest">{selectedTask.client} Registry</span>
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black capitalize ${getStatusConfig(selectedTask.status).color}`}>
                      Protocol {selectedTask.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <div className={`col-span-1 lg:col-span-2 p-12 rounded-[3.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/5'}`}>
                <div className="space-y-10 text-left">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-8 space-y-4">
                    <h3 className="text-2xl font-black capitalize">Directive Execution Audit</h3>
                    <p className="text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed text-left capitalize">Comprehensive analysis of historical task performance and cultural alignment monitoring protocols.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-left">
                      <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">Milestone Date</p>
                      <p className="text-xl font-extrabold">{selectedTask.dueDate}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-left">
                      <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">Assigned Partner</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(selectedTask.assignedTo)} flex items-center justify-center text-white text-[10px] uppercase font-black`}>
                          {selectedTask.assignedTo.charAt(0)}
                        </div>
                        <p className="text-xl font-extrabold">{selectedTask.assignedTo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center text-left">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Execution Progress</p>
                      <p className="text-xl font-black">{selectedTask.progress}% Complete</p>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${selectedTask.progress}%` }} className="h-full bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 text-left">
                <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] border-blue-500 shadow-2xl shadow-blue-500/20'}`}>
                  <div className="space-y-6 text-white text-left">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Status Matrix</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black capitalize">{selectedTask.status} Protocol</span>
                      <FiCheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-sm font-black opacity-80 leading-relaxed text-left capitalize">Audit trail suggests high-integrity execution of deliverables in the current fiscal period.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black text-[12px] shadow-2xl shadow-blue-500/40"
                  >
                    Edit Task Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('list')}
                    className="w-full px-12 py-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] font-black text-[12px] shadow-2xl flex items-center justify-center gap-3 border border-slate-800 dark:border-slate-700"
                  >
                    Return To Hub
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Explicitly defining icons that might be missing from direct import
const FiChevronRight = ({ className }) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
const FiArrowLeft = ({ className }) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export default TaskByClientTab;