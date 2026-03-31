import { useState, useEffect } from 'react';
import { FiTrendingUp, FiCheckCircle, FiClock, FiAlertCircle, FiArrowRight, FiArrowLeft, FiEdit3, FiEye, FiDownload, FiBarChart2, FiTarget, FiFilter, FiCalendar, FiChevronDown, FiUser, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const BulkAssessmentView = ({ onBack, onComplete, isDarkMode, statCards }) => {
  const [stage, setStage] = useState('summary'); // summary, processing, success
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage === 'processing') {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => setStage('success'), 600);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [stage]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      className={`w-full ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-12 text-left">
        <button
          onClick={onBack}
          className={`p-3 rounded-2xl transition-all shadow-sm ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 
            onClick={onBack}
            className="text-2xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity select-none"
          >
            Performance Review Cycle
          </h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'}`}>
            Professional Audit & Growth Synchronization
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-10 lg:p-14 rounded-[3.5rem] border-2 shadow-2xl relative overflow-hidden ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.05] blur-3xl rounded-full bg-gradient-to-br from-[#3FA9F5] to-[#0D47A1]"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-14 border-l-4 border-blue-600 pl-6 py-2">
                <FiBarChart2 className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Cycle Assessment Summary</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verify the department performance data</p>
                </div>
              </div>

              {/* Horizontal Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                {statCards.slice(0, 3).map((stat, i) => (
                  <div key={i} className={`p-10 rounded-[2.5rem] border-2 transition-all hover:scale-105 ${
                    isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-white shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <stat.icon className="text-blue-600 w-4 h-4" />
                    </div>
                    <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 border-t border-slate-100 dark:border-slate-800 pt-12">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStage('processing')}
                  className="flex-1 px-12 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all flex items-center justify-center gap-3"
                >
                  <FiCheckCircle className="w-5 h-5" />
                  Initiate Global Sync
                </motion.button>
                <button
                  onClick={onBack}
                  className={`flex-1 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs border-2 transition-all ${
                    isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Discard Cycle
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className={`p-24 text-center rounded-[4rem] border-2 border-dashed ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/50 border-blue-100'
            }`}
          >
            <div className="relative w-56 h-56 mx-auto mb-14">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="112" cy="112" r="105" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                <motion.circle cx="112" cy="112" r="105" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={660} strokeDashoffset={660 - (660 * progress) / 100} className="text-blue-600" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-black tracking-tighter text-blue-600 font-mono">{progress}%</span>
              </div>
            </div>
            <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">Analyzing Performance DNA...</h3>
            <p className={`text-sm font-bold max-w-lg mx-auto leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Syncing KPI metrics, calculating growth multipliers, and updating department leaderboards.
            </p>
            <div className="mt-14 flex items-center justify-center gap-4 text-blue-600 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
              <FiLoader className="animate-spin w-5 h-5" />
              System Intelligence Active...
            </div>
          </motion.div>
        )}

        {stage === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-20 text-center rounded-[4.5rem] border-2 shadow-2xl relative overflow-hidden ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="w-36 h-36 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-emerald-500/20 ring-8 ring-emerald-50 dark:ring-emerald-900/10 rotate-6">
                <FiCheckCircle className="w-16 h-16 text-emerald-600" />
              </div>
              <h3 className="text-6xl font-black mb-4 bg-gradient-to-br from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter uppercase">
                Assessment Synchronized
              </h3>
              <p className={`mb-14 font-black text-[12px] uppercase tracking-[0.4em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Growth metrics validated • Profiles Updated
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-14">
                <div className={`p-10 rounded-[2.5rem] border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-800/40 text-slate-300' : 'bg-blue-50/50 border-blue-100 text-blue-700'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-2 opacity-60">Avg. Score Improvement</span>
                  <p className="text-3xl font-black">+4.2%</p>
                </div>
                <div className={`p-10 rounded-[2.5rem] border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-800/40 text-slate-300' : 'bg-emerald-50/50 border-emerald-100 text-emerald-700'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-2 opacity-60">System Security</span>
                  <p className="text-3xl font-black uppercase whitespace-nowrap">Verified</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="px-20 py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all border-b-4 border-blue-900"
              >
                Return to Dashboard
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PerformanceTab = ({ isDarkMode, selectedClient }) => {
  const [view, setView] = useState('list'); // 'list', 'details'
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-Q4');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    // Mock simulation
    const mockData = [
      { id: 1, empId: 'EMP001', name: 'Rahul Sharma', email: 'rahul@mabicons.com', position: 'Senior Developer', department: 'IT', score: 92, lastReview: '2025-Dec-15', status: 'Exceeds Expectations', avatar: 'RS', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, empId: 'EMP002', name: 'Priya Singh', email: 'priya@mabicons.com', position: 'Product Manager', department: 'Product', score: 88, lastReview: '2025-Dec-20', status: 'Met Expectations', avatar: 'PS', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, empId: 'EMP003', name: 'Amit Kumar', email: 'amit@mabicons.com', position: 'UI Designer', department: 'Design', score: 95, lastReview: '2025-Dec-10', status: 'Exceeds Expectations', avatar: 'AK', photo: 'https://randomuser.me/api/portraits/men/15.jpg' },
      { id: 4, empId: 'EMP004', name: 'Sneha Patel', email: 'sneha@mabicons.com', position: 'HR Manager', department: 'HR', score: 82, lastReview: '2025-Dec-22', status: 'Met Expectations', avatar: 'SP', photo: 'https://randomuser.me/api/portraits/women/65.jpg' }
    ];

    setTimeout(() => {
      setPerformanceData(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const statCards = [
    { key: 'avgScore', label: 'Cycle Average Score', icon: FiActivity, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]', value: '89.2%' },
    { key: 'reviewsDone', label: 'Reviews Completed', icon: FiCheckCircle, gradient: 'from-[#1E88E5] to-[#0D47A1]', value: '24/28' },
    { key: 'topPerformers', label: 'Star Performers', icon: FiTarget, gradient: 'from-[#0D47A1] to-blue-900', value: '12' },
    { key: 'atRisk', label: 'Action Required', icon: FiAlertCircle, gradient: 'from-blue-400 to-[#3FA9F5]', value: '03' },
  ];

  const getAvatarColor = (name) => {
    const colors = ['from-blue-600 to-indigo-900', 'from-[#3FA9F5] to-blue-700', 'from-cyan-500 to-blue-600', 'from-indigo-500 to-purple-700', 'from-teal-500 to-emerald-700'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-36 rounded-[2.5rem] animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-64 rounded-[3rem] animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="performance-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            className="space-y-8"
          >
            {/* Header / Navbar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/20 ring-4 ring-blue-500/10">
                    <FiTrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent tracking-tight">
                    Performance Dashboard
                  </h2>
                </div>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'} tracking-wide ml-1`}>
                  Evaluate and track employee growth and performance insights
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className={`appearance-none rounded-2xl border-2 px-6 py-3.5 pr-12 font-extrabold cursor-pointer transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'
                      }`}
                  >
                    <option value="2025-Q4">Cycle: 2025 Q4</option>
                    <option value="2025-Q3">Cycle: 2025 Q3</option>
                    <option value="Annual-2025">Annual Review 2025</option>
                  </select>
                  <FiChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('bulk-assessment')}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all uppercase tracking-widest text-xs"
                >
                  <FiBarChart2 className="w-5 h-5" />
                  Performance Review Cycle
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredCard(stat.key)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer border-2 ${
                    isDarkMode 
                      ? 'bg-slate-800/80 border-slate-700/50 text-white' 
                      : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-white shadow-sm hover:shadow-xl'
                    } ${hoveredCard === stat.key ? 'scale-[1.02] border-blue-200 dark:border-blue-800' : ''}`}
                >
                  <div className="relative text-left">
                    <div className="flex items-center justify-between mb-4">
                      <p className={`text-[10px] font-extrabold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {stat.label}
                      </p>
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg flex-shrink-0`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <p className={`text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0D47A1]'}`}>
                        {stat.value}
                      </p>
                      <div className="pb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth</span>
                      </div>
                    </div>
                    
                    <div className={`mt-4 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-white/50'}`}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${stat.gradient}`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Employee Performance Grid */}
            <div className="grid grid-cols-1 gap-8 pb-12">
              <AnimatePresence>
                {performanceData.map((emp, index) => (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 15 }}
                    whileHover={{ y: -8, shadow: "0 40px 60px -20px rgba(0,0,0,0.2)" }}
                    onClick={() => { setSelectedEmployee(emp); setView('details'); }}
                    className={`group relative overflow-hidden rounded-[3rem] border-2 transition-all duration-500 cursor-pointer ${isDarkMode ? 'bg-slate-900/40 border-slate-800/80 hover:border-blue-500/40' : 'bg-white border-slate-100/80 hover:border-blue-200 hover:shadow-2xl'
                      }`}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] group-hover:opacity-10 blur-3xl rounded-full bg-gradient-to-br from-[#3FA9F5] to-[#0D47A1] transition-opacity duration-700"></div>

                    <div className="p-10">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        {/* Profile Info */}
                        <div className="flex items-center gap-8">
                          <motion.div className={`w-24 h-24 rounded-[2.5rem] bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-black text-5xl shadow-2xl ring-4 ring-white dark:ring-slate-800 group-hover:rotate-6 transition-transform`}>
                            {emp.name.charAt(0).toUpperCase()}
                          </motion.div>
                          <div>
                            <h3 className="font-black text-3xl tracking-tight mb-2 group-hover:text-blue-500 transition-colors uppercase">{emp.name}</h3>
                            <div className="flex items-center gap-3">
                              <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                {emp.empId}
                              </span>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{emp.position}</span>
                            </div>
                          </div>
                        </div>

                        {/* Performance Score Circle */}
                        <div className="flex-1 max-w-2xl lg:px-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                              <span className={`text-[10px] font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Score Summary</span>
                              <span className="text-xs font-black group-hover:text-blue-500 transition-colors">{emp.score}% KPI Score</span>
                            </div>
                            <div className={`h-2.5 rounded-full overflow-hidden p-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${emp.score}%` }}
                                transition={{ duration: 1.5, delay: 0.5 + (index * 0.1) }}
                                className="h-full rounded-full bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]"
                              />
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <span className="flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5" /> Last: {emp.lastReview}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div>
                              <span className={`px-3 py-1 rounded-full ${emp.score >= 90 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                                {emp.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row lg:flex-col items-center justify-between gap-8 lg:min-w-[220px] pt-10 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100/50 dark:border-slate-800/50 lg:pl-10">
                          <div className="text-center lg:text-right w-full">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Current Standing</p>
                            <p className="text-2xl font-black text-blue-600">A+</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1, x: 5 }}
                            className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/5"
                          >
                            <FiArrowRight className="w-6 h-6" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : view === 'bulk-assessment' ? (
          <BulkAssessmentView
            key="bulk-assessment-view"
            onBack={() => setView('list')}
            onComplete={() => setView('list')}
            isDarkMode={isDarkMode}
            statCards={statCards}
          />
        ) : (
          <EmployeePerformanceDetailView
            key="performance-detail"
            employee={selectedEmployee}
            onBack={() => { setSelectedEmployee(null); setView('list'); }}
            isDarkMode={isDarkMode}
            getAvatarColor={getAvatarColor}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformanceTab;
