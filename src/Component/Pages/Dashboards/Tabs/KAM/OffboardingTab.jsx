import { useState, useEffect } from 'react';
import { FiUserMinus, FiClipboard, FiCheckSquare, FiAlertTriangle, FiCalendar, FiMail, FiEdit2, FiEye, FiPlus, FiSearch, FiChevronDown, FiX, FiCheck, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getOffboardingList } from '../../../service/api';

const OffboardingTab = ({ isDarkMode, selectedClient }) => {
  const [offboardingData, setOffboardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewDetails, setViewDetails] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchOffboarding = async () => {
      try {
        setLoading(true);
        const response = await getOffboardingList({ 
          department: 'HR Operations' 
        });
        
        if (response.success) {
          const mappedData = (response.list || []).map(emp => ({
            id: emp.id,
            empId: emp.memberId?.substring(0, 8).toUpperCase() || 'EMP-TEMP',
            name: emp.memberName,
            email: emp.email,
            department: emp.department || 'HR Operations',
            resignationDate: emp.resignationDate || new Date().toISOString(),
            lastWorkingDay: emp.lastWorkingDay || new Date().toISOString(),
            reason: emp.exitReason || 'Relocation/Personal',
            status: emp.exitStatus?.toLowerCase() || 'in-progress',
            progress: emp.exitStatus === 'Completed' ? 100 : 60,
            photo: null,
            checklist: [
              { task: 'Resignation Accepted', done: true },
              { task: 'Exit Interview', done: emp.exitStatus === 'Completed' },
              { task: 'Knowledge Transfer', done: emp.exitStatus === 'Completed' },
              { task: 'Asset Return', done: false },
              { task: 'Final Settlement', done: false },
            ]
          }));
          setOffboardingData(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch offboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffboarding();
  }, [selectedClient]);

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-rose-500 to-pink-600', 'from-violet-500 to-purple-600', 'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-cyan-500 to-blue-600',
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
  };

  const getStatusConfig = (status) => {
    const configs = {
      'completed': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', gradient: 'from-emerald-500 to-teal-600', icon: FiCheckSquare },
      'in-progress': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', gradient: 'from-blue-500 to-indigo-600', icon: FiClipboard },
      'pending': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', gradient: 'from-amber-500 to-orange-600', icon: FiClock },
    };
    return configs[status] || configs['pending'];
  };

  const statCards = [
    { key: 'total', label: 'Total Exits', value: offboardingData.length, icon: FiUserMinus, gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50' },
    { key: 'completed', label: 'Completed', value: offboardingData.filter(e => e.status === 'completed').length, icon: FiCheckSquare, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50' },
    { key: 'progress', label: 'In Progress', value: offboardingData.filter(e => e.status === 'in-progress').length, icon: FiClipboard, gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50' },
    { key: 'pending', label: 'Pending', value: offboardingData.filter(e => e.status === 'pending').length, icon: FiAlertTriangle, gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50' },
  ];

  const filteredData = offboardingData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-56 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25">
            <FiUserMinus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Offboarding
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage employee exit process
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-rose-500/25"
        >
          <FiPlus className="w-4 h-4" />
          Initiate Offboarding
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
            className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-rose-500/50 ${
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

      {/* Offboarding Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredData.map((emp, index) => {
            const statusConfig = getStatusConfig(emp.status);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div 
                key={emp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-slate-300'
                }`}
              >
                <div className={`h-1.5 bg-gradient-to-r ${statusConfig.gradient}`}></div>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {emp.photo ? (
                        <div className="relative">
                          <img 
                            src={emp.photo} 
                            alt={emp.name}
                            className="w-14 h-14 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarGradient(emp.name)} items-center justify-center text-white text-xl font-bold shadow-lg hidden`}>
                            {emp.name.charAt(0)}
                          </div>
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarGradient(emp.name)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                          {emp.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{emp.name}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{emp.empId} • {emp.department}</p>
                        <div className={`flex flex-wrap items-center gap-3 mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          <span className="flex items-center gap-1.5"><FiMail className="w-4 h-4" /> {emp.email}</span>
                          <span className="flex items-center gap-1.5"><FiCalendar className="w-4 h-4" /> LWD: {new Date(emp.lastWorkingDay).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          <span className="font-medium">Reason:</span> {emp.reason}
                        </p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold capitalize ${statusConfig.bg} ${statusConfig.text}`}>
                      <StatusIcon className="w-4 h-4" />
                      {emp.status.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">Exit Progress</span>
                      <span className={`text-sm font-bold bg-gradient-to-r ${statusConfig.gradient} bg-clip-text text-transparent`}>{emp.progress}%</span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${emp.progress}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${statusConfig.gradient}`}
                      />
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className={`mt-5 pt-5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className="text-sm font-semibold mb-3">Exit Checklist</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {emp.checklist.map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                            item.done 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                              : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.done && <FiCheck className="w-3.5 h-3.5" />}
                          {item.task}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setViewDetails(emp)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl"
                    >
                      <FiEye className="w-4 h-4" /> View Details
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"
                    >
                      <FiEdit2 className="w-4 h-4" /> Update
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewDetails(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className={`h-2 bg-gradient-to-r ${getStatusConfig(viewDetails.status).gradient}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarGradient(viewDetails.name)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {viewDetails.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{viewDetails.name}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{viewDetails.empId} • {viewDetails.department}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewDetails(null)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className={`grid grid-cols-2 gap-4 p-4 rounded-2xl mb-4 ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email</p><p className="font-semibold text-sm">{viewDetails.email}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</p><p className="font-semibold text-sm capitalize">{viewDetails.status.replace('-', ' ')}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Resignation Date</p><p className="font-semibold text-sm">{new Date(viewDetails.resignationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Last Working Day</p><p className="font-semibold text-sm">{new Date(viewDetails.lastWorkingDay).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                  <div className="col-span-2"><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reason</p><p className="font-semibold text-sm">{viewDetails.reason}</p></div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold">Checklist Progress</p>
                  {viewDetails.checklist.map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl ${item.done ? 'bg-emerald-50 dark:bg-emerald-900/20' : isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}>
                        {item.done && <FiCheck className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-sm font-medium ${item.done ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>{item.task}</span>
                    </div>
                  ))}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewDetails(null)} 
                  className="w-full px-4 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-rose-500/25"
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

export default OffboardingTab;
