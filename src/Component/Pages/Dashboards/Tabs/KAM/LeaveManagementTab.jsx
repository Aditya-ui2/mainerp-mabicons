import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCheck, FiX, FiPlus, FiSearch, FiDownload, FiChevronDown, FiSun, FiMoon, FiCoffee, FiAward, FiTrendingUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const LeaveManagementTab = ({ isDarkMode, selectedClient }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP001', name: 'Rahul Sharma', type: 'Sick Leave', from: '2026-03-18', to: '2026-03-19', days: 2, reason: 'Fever and cold', status: 'pending', appliedOn: '2026-03-16', avatar: 'RS', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, empId: 'EMP002', name: 'Priya Singh', type: 'Casual Leave', from: '2026-03-20', to: '2026-03-20', days: 1, reason: 'Personal work', status: 'approved', appliedOn: '2026-03-15', avatar: 'PS', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, empId: 'EMP003', name: 'Amit Kumar', type: 'Earned Leave', from: '2026-03-25', to: '2026-03-28', days: 4, reason: 'Family vacation', status: 'pending', appliedOn: '2026-03-16', avatar: 'AK', photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 4, empId: 'EMP004', name: 'Sneha Patel', type: 'Maternity Leave', from: '2026-04-01', to: '2026-06-30', days: 90, reason: 'Maternity', status: 'approved', appliedOn: '2026-03-10', avatar: 'SP', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 5, empId: 'EMP005', name: 'Vikram Rao', type: 'Compensatory Off', from: '2026-03-22', to: '2026-03-22', days: 1, reason: 'Worked on weekend', status: 'rejected', appliedOn: '2026-03-14', avatar: 'VR', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
    ];
    setTimeout(() => {
      setLeaveRequests(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const leaveBalance = [
    { type: 'Sick', total: 12, used: 3, remaining: 9, icon: FiSun, gradient: 'from-rose-500 to-pink-600', lightBg: 'bg-gradient-to-br from-rose-50 to-pink-50' },
    { type: 'Casual', total: 12, used: 5, remaining: 7, icon: FiCoffee, gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50' },
    { type: 'Earned', total: 15, used: 2, remaining: 13, icon: FiAward, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50' },
    { type: 'Comp Off', total: 4, used: 1, remaining: 3, icon: FiMoon, gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50' },
  ];

  const stats = {
    pending: leaveRequests.filter(l => l.status === 'pending').length,
    approved: leaveRequests.filter(l => l.status === 'approved').length,
    rejected: leaveRequests.filter(l => l.status === 'rejected').length,
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
      approved: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
      rejected: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    };
    return config[status] || config.pending;
  };

  const getAvatarColor = (name) => {
    const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const handleAction = (id, action) => {
    setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
  };

  const filteredData = leaveRequests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) || req.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <FiCalendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Leave Management
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage employee leave requests
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25"
        >
          <FiPlus className="w-4 h-4" />
          Apply Leave
        </motion.button>
      </motion.div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalance.map((leave, index) => (
          <motion.div
            key={leave.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setHoveredCard(leave.type)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : `${leave.lightBg} border border-white/50 hover:shadow-xl`
            } ${hoveredCard === leave.type ? 'scale-[1.02]' : ''}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="80" cy="20" r="40" fill="currentColor" />
              </svg>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{leave.type} Leave</p>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${leave.gradient} shadow-lg`}>
                  <leave.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-3xl font-bold bg-gradient-to-r ${leave.gradient} bg-clip-text text-transparent`}>{leave.remaining}</span>
                <span className={`text-sm pb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>/ {leave.total}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(leave.remaining / leave.total) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                  className={`h-full rounded-full bg-gradient-to-r ${leave.gradient}`}
                />
              </div>
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{leave.used} used</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Request Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className={`p-5 rounded-2xl text-center ${isDarkMode ? 'bg-amber-900/20 border border-amber-900/30' : 'bg-amber-50 border border-amber-100'}`}>
          <p className="text-4xl font-bold text-amber-500">{stats.pending}</p>
          <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Pending</p>
        </div>
        <div className={`p-5 rounded-2xl text-center ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-900/30' : 'bg-emerald-50 border border-emerald-100'}`}>
          <p className="text-4xl font-bold text-emerald-500">{stats.approved}</p>
          <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Approved</p>
        </div>
        <div className={`p-5 rounded-2xl text-center ${isDarkMode ? 'bg-rose-900/20 border border-rose-900/30' : 'bg-rose-50 border border-rose-100'}`}>
          <p className="text-4xl font-bold text-rose-500">{stats.rejected}</p>
          <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-rose-400' : 'text-rose-700'}`}>Rejected</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-blue-500/50 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`rounded-2xl border-2 overflow-hidden shadow-xl ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200/50'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-50 to-slate-100'}`}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Leave Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Duration</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Days</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Reason</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
              <AnimatePresence>
                {filteredData.map((req, index) => {
                  const statusConfig = getStatusConfig(req.status);
                  return (
                    <motion.tr 
                      key={req.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-blue-50/50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {req.photo ? (
                            <div className="relative">
                              <img 
                                src={req.photo} 
                                alt={req.name}
                                className="w-10 h-10 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(req.name)} items-center justify-center text-white font-bold text-sm shadow-lg hidden`}>
                                {req.avatar}
                              </div>
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(req.name)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                              {req.avatar}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{req.name}</p>
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{req.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isDarkMode ? 'bg-violet-900/30 text-violet-400' : 'bg-violet-100 text-violet-700'}`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FiCalendar className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                          <span>{new Date(req.from).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - {new Date(req.to).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          {req.days}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm max-w-[200px] truncate">{req.reason}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'pending' && (
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleAction(req.id, 'approved')}
                              className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                            >
                              <FiCheck className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleAction(req.id, 'rejected')}
                              className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                            >
                              <FiX className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Showing <span className="font-semibold">{filteredData.length}</span> leave requests
          </p>
        </div>
      </motion.div>

      {/* Add Leave Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-blue-500" />
                  Apply for Leave
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <form className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Leave Type</label>
                  <select className={`w-full rounded-xl border-2 px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`}>
                    <option>Sick Leave</option>
                    <option>Casual Leave</option>
                    <option>Earned Leave</option>
                    <option>Compensatory Off</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>From</label>
                    <input type="date" className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>To</label>
                    <input type="date" className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Reason</label>
                  <textarea rows={3} className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} placeholder="Enter reason for leave..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className={`flex-1 px-4 py-3 rounded-xl font-medium border-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25"
                  >
                    Submit
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaveManagementTab;
