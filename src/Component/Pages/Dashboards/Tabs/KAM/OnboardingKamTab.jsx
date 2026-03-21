import { useState, useEffect } from 'react';
import { FiUserPlus, FiCheckCircle, FiClock, FiFileText, FiMail, FiUser, FiCalendar, FiEdit2, FiEye, FiPlus, FiSearch, FiChevronDown, FiCheck, FiBriefcase } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingKamTab = ({ isDarkMode, selectedClient }) => {
  const [onboardingData, setOnboardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const mockData = [
      { 
        id: 1, empId: 'EMP007', name: 'Ravi Verma', email: 'ravi@company.com', position: 'Junior Developer', department: 'Engineering',
        joiningDate: '2026-03-20', status: 'in-progress', progress: 65, avatar: 'RV', photo: 'https://randomuser.me/api/portraits/men/22.jpg',
        tasks: [
          { name: 'Documents Submitted', completed: true },
          { name: 'ID Card Generated', completed: true },
          { name: 'System Access', completed: true },
          { name: 'Training Started', completed: false },
          { name: 'Team Introduction', completed: false },
        ]
      },
      { 
        id: 2, empId: 'EMP008', name: 'Meena Kumari', email: 'meena@company.com', position: 'HR Executive', department: 'HR',
        joiningDate: '2026-03-22', status: 'pending', progress: 20, avatar: 'MK', photo: 'https://randomuser.me/api/portraits/women/26.jpg',
        tasks: [
          { name: 'Documents Submitted', completed: true },
          { name: 'ID Card Generated', completed: false },
          { name: 'System Access', completed: false },
          { name: 'Training Started', completed: false },
          { name: 'Team Introduction', completed: false },
        ]
      },
      { 
        id: 3, empId: 'EMP009', name: 'Karan Singh', email: 'karan@company.com', position: 'Sales Manager', department: 'Sales',
        joiningDate: '2026-03-10', status: 'completed', progress: 100, avatar: 'KS', photo: 'https://randomuser.me/api/portraits/men/45.jpg',
        tasks: [
          { name: 'Documents Submitted', completed: true },
          { name: 'ID Card Generated', completed: true },
          { name: 'System Access', completed: true },
          { name: 'Training Started', completed: true },
          { name: 'Team Introduction', completed: true },
        ]
      },
    ];
    setTimeout(() => {
      setOnboardingData(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const statCards = [
    { key: 'total', label: 'Total', icon: FiUserPlus, gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50', value: onboardingData.length },
    { key: 'completed', label: 'Completed', icon: FiCheckCircle, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50', value: onboardingData.filter(e => e.status === 'completed').length },
    { key: 'inProgress', label: 'In Progress', icon: FiClock, gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50', value: onboardingData.filter(e => e.status === 'in-progress').length },
    { key: 'pending', label: 'Pending', icon: FiFileText, gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50', value: onboardingData.filter(e => e.status === 'pending').length },
  ];

  const getStatusConfig = (status) => {
    const configs = {
      'completed': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
      'in-progress': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-500' },
      'pending': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', gradient: 'from-amber-500 to-orange-500' },
    };
    return configs[status] || configs.pending;
  };

  const getAvatarColor = (name) => {
    const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredData = onboardingData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-48 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
          <div className={`h-10 w-40 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className={`h-56 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <FiUserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Employee Onboarding
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Track new employee onboarding progress
            </p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25"
        >
          <FiPlus className="w-4 h-4" />
          New Onboarding
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div 
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setHoveredCard(stat.key)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : `${stat.lightBg} border border-white/50 hover:shadow-xl`
            } ${hoveredCard === stat.key ? 'scale-[1.02]' : ''}`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="70" cy="30" r="40" fill="currentColor" />
              </svg>
            </div>
            <div className="relative flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-violet-500/50 ${
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
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Onboarding Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredData.map((emp, index) => {
            const statusConfig = getStatusConfig(emp.status);
            return (
              <motion.div 
                key={emp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {/* Gradient accent top */}
                <div className={`h-1 bg-gradient-to-r ${statusConfig.gradient}`}></div>
                
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {emp.photo ? (
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative">
                          <img 
                            src={emp.photo} 
                            alt={emp.name}
                            className="w-14 h-14 rounded-2xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(emp.name)} items-center justify-center text-white font-bold text-lg shadow-lg hidden`}>
                            {emp.avatar}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                        >
                          {emp.avatar}
                        </motion.div>
                      )}
                      <div>
                        <p className="font-bold text-xl">{emp.name}</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{emp.empId} • {emp.position}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className={`flex items-center gap-1.5 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <FiMail className="w-4 h-4" /> {emp.email}
                          </span>
                          <span className={`flex items-center gap-1.5 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <FiBriefcase className="w-4 h-4" /> {emp.department}
                          </span>
                          <span className={`flex items-center gap-1.5 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <FiCalendar className="w-4 h-4" /> {new Date(emp.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                      {emp.status.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mt-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">Onboarding Progress</span>
                      <span className={`text-sm font-bold ${emp.progress === 100 ? 'text-emerald-500' : 'text-violet-500'}`}>{emp.progress}%</span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${emp.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${emp.progress === 100 ? 'from-emerald-500 to-teal-500' : 'from-violet-500 to-purple-500'}`}
                      />
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className={`mt-6 pt-5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className="text-sm font-semibold mb-3">Onboarding Tasks</p>
                    <div className="flex flex-wrap gap-2">
                      {emp.tasks.map((task, idx) => (
                        <motion.span 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + idx * 0.05 }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            task.completed 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                              : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {task.completed && <FiCheck className="w-3.5 h-3.5" />}
                          {task.name}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedEmployee(emp)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                    >
                      <FiEye className="w-4 h-4" /> View Details
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" /> Update Status
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Employee Detail Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEmployee(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className={`h-2 bg-gradient-to-r ${getStatusConfig(selectedEmployee.status).gradient} rounded-t-3xl`}></div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(selectedEmployee.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {selectedEmployee.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedEmployee.position}</p>
                  </div>
                </div>
                <div className={`space-y-4 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Employee ID</span>
                    <span className="font-semibold">{selectedEmployee.empId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Department</span>
                    <span className="font-semibold">{selectedEmployee.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Email</span>
                    <span className="font-semibold">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Joining Date</span>
                    <span className="font-semibold">{new Date(selectedEmployee.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEmployee(null)}
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingKamTab;
