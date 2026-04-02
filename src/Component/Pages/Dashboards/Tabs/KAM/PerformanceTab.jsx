
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
          className={`p-3 rounded-2xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
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

      {/* Banner Header */}
      <div className="bg-gradient-to-r from-blue-600 via-[#1E88E5] to-[#0D47A1] p-10 lg:p-12 relative overflow-hidden rounded-t-[3rem]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex items-center gap-6 relative z-10">
          <button
            onClick={onBack}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/15 rounded-2xl border border-white/20 shadow-inner">
              <FiBarChart2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">Performance Review Cycle</h2>
              <p className="text-blue-100/70 font-semibold text-xs uppercase tracking-[0.2em] mt-1 italic">Professional Audit & Growth Synchronization</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-10 lg:p-14 border-x-2 border-b-2 rounded-b-[3.5rem] shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'
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
                  <div key={i} className={`p-10 rounded-[2.5rem] border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-white shadow-sm'
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
                  className={`flex-1 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs border-2 transition-all ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
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
            className={`p-24 text-center rounded-b-[4rem] border-x-2 border-b-2 border-dashed ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/50 border-blue-100'
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
              <FiClock className="animate-spin w-5 h-5" />
              System Intelligence Active...
            </div>
          </motion.div>
        )}

        {stage === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-20 text-center rounded-b-[4.5rem] border-x-2 border-b-2 shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'
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
            {/* Modern Header (Matched with Payroll Layout) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20">
                  <FiTrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent tracking-tight mb-1">
                    Performance
                  </h2>
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {performanceData.length} Employee Growth Records
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className={`appearance-none rounded-2xl border-2 px-6 py-3.5 pr-12 font-bold cursor-pointer transition-all focus:ring-4 focus:ring-blue-500/10 outline-none w-40 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-700 shadow-sm'
                      }`}
                  >
                    <option value="2025-Q4">2025 Q4</option>
                    <option value="2025-Q3">2025 Q3</option>
                    <option value="Annual-2025">Annual Review 2025</option>
                  </select>
                  <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('bulk-assessment')}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 transition-all uppercase tracking-widest text-xs"
                >
                  <FiBarChart2 className="w-5 h-5" />
                  Performance Review
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
                  className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer border-2 ${isDarkMode
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

            {/* Employee Performance Row List */}
            <div className="flex flex-col gap-4 pb-12 max-w-6xl mx-auto">
              <AnimatePresence>
                {performanceData.map((emp, index) => (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => { setSelectedEmployee(emp); setView('details'); }}
                    className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-500/40' : 'bg-[#f8fbff] border-white shadow-sm hover:shadow-md'
                      }`}
                  >
                    <div className="p-4 px-8 flex items-center justify-between gap-6">
                      {/* Avatar and Identity */}
                      <div className="flex items-center gap-6 min-w-[250px]">
                        <div className={`w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg ring-2 ring-white dark:ring-slate-800`}>
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">{emp.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.empId}</p>
                        </div>
                      </div>

                      {/* Department / Category */}
                      <div className="hidden md:block text-left min-w-[150px]">
                        <p className="text-[11px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest">
                          {emp.department} DEPARTMENT
                        </p>
                      </div>

                      {/* Reference Date */}
                      <div className="hidden lg:flex items-center gap-3 text-left min-w-[180px]">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                          <FiCalendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[12px] font-black text-slate-800 dark:text-slate-200 leading-tight">
                            {emp.lastReview}
                          </p>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="hidden sm:flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-sm border border-slate-100 dark:border-slate-700 min-w-[60px]">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {Math.round(emp.score / 10)}
                        </span>
                      </div>

                      {/* Details / Reason */}
                      <div className="hidden xl:block flex-1 text-left px-4">
                        <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          Professional Growth: {emp.position}
                        </p>
                      </div>

                      {/* Status Pill Badge */}
                      <div className="flex items-center gap-4">
                        <div className={`px-5 py-2.5 rounded-full flex items-center gap-2.5 border ${emp.score >= 90
                          ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50'
                          : 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50'
                          }`}>
                          <div className={`w-2 h-2 rounded-full ${emp.score >= 90 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${emp.score >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {emp.score >= 90 ? 'EXCELLENT' : 'MET GOALS'}
                          </span>
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

const EmployeePerformanceDetailView = ({ employee, onBack, isDarkMode, getAvatarColor }) => {
  if (!employee) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      className={`w-full ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-blue-600 via-[#1E88E5] to-[#0D47A1] p-10 lg:p-12 relative overflow-hidden rounded-[3rem] mb-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex items-center gap-6 relative z-10">
          <button
            onClick={onBack}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-5">
            <div className={`p-4 bg-white/15 rounded-2xl border border-white/20 shadow-inner rotate-3`}>
              <FiUser className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">{employee.name}</h2>
              <p className="text-blue-100/70 font-semibold text-xs uppercase tracking-[0.2em] mt-1 italic">Growth Analytics & KPI Matrix</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Profile Card */}
        <div className={`p-8 rounded-[3rem] border-2 shadow-xl flex flex-col items-center text-center space-y-6 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'
          }`}>
          <div className="relative group">
            <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${getAvatarColor(employee.name)} flex items-center justify-center text-white text-5xl font-black shadow-2xl ring-4 ring-white transition-transform group-hover:rotate-6`}>
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-emerald-500 text-white shadow-lg ring-4 ring-white">
              <FiTrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight uppercase">{employee.name}</h3>
            <p className="text-blue-500 font-bold tracking-widest text-xs uppercase">{employee.empId}</p>
          </div>

          <div className="w-full pt-8 space-y-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">Department</span>
              <span className="uppercase">{employee.department}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">Position</span>
              <span className="uppercase">{employee.position}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">Email</span>
              <span className="text-xs">{employee.email}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className={`p-8 rounded-[3rem] border-2 shadow-xl space-y-8 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'
            }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                <FiActivity className="text-blue-500" />
                KPI Performance DNA
              </h4>
              <span className="px-5 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-xs font-black uppercase">Level: Senior</span>
            </div>

            <div className="space-y-8">
              {[
                { label: 'Technical Proficiency', val: 94, color: 'from-blue-400 to-blue-600' },
                { label: 'Team Collaboration', val: 88, color: 'from-emerald-400 to-emerald-600' },
                { label: 'Leadership Qualities', val: 75, color: 'from-amber-400 to-amber-600' },
              ].map(kpi => (
                <div key={kpi.label} className="space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                    <span>{kpi.label}</span>
                    <span className="text-blue-600 font-mono">{kpi.val}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${kpi.val}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${kpi.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className={`p-8 rounded-[2.5rem] border-2 shadow-lg transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-white'
              }`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cycle Status</p>
              <p className="text-2xl font-black text-emerald-600 uppercase">Excellent</p>
            </div>
            <div className={`p-8 rounded-[2.5rem] border-2 shadow-lg transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-white'
              }`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Growth Potential</p>
              <p className="text-2xl font-black text-blue-600 uppercase">High Pro</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceTab;