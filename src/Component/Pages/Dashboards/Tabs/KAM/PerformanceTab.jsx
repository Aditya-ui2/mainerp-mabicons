
import { useState, useEffect } from 'react';
import { FiTrendingUp, FiCheckCircle, FiClock, FiAlertCircle, FiArrowRight, FiArrowLeft, FiEdit3, FiEye, FiDownload, FiBarChart2, FiTarget, FiFilter, FiCalendar, FiChevronDown, FiUser, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

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
  const [searchTerm, setSearchTerm] = useState('');

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
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
            >
              <div className="text-left">
                <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Performance
                </h1>
                <p className="text-sm font-medium text-[#9B9BAD] mt-1 text-left" style={{ fontFamily: "'Calibri', sans-serif" }}>
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • <span className="text-[#0D47A1] font-bold">{performanceData.length}</span> Employee Growth Records
                </p>
              </div>
            </motion.div>

            {/* Modern Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-[24px] p-2 border flex items-center gap-3 mb-6 mt-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}
            >
              <div className="relative flex-1 group min-w-[200px]">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors`} size={18} />
                <input
                  type="text"
                  placeholder="Search by name or Employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD] ${isDarkMode ? 'bg-slate-800 text-white focus:ring-2 focus:ring-slate-700' : 'bg-[#F4F3EF] text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF]'}`}
                />
              </div>
            </motion.div>


            {/* Modern Table Interface */}
            <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className={`grid grid-cols-[1.5fr_150px_120px_100px_200px_150px_40px] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
                {["Employee", "Department", "Review Date", "Score", "Growth Analysis", "Status", ""].map((h, i) => (
                  <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
                    {h}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <AnimatePresence mode="popLayout">
                  {performanceData
                    .filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase()))
                    .length === 0 ? (
                      <div className="py-24 text-center">
                        <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No results matching your scan</p>
                      </div>
                    ) : (
                    performanceData
                      .filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((emp, index) => (
                        <motion.div
                          key={emp.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedEmployee(emp)}
                          className={`grid grid-cols-[1.5fr_150px_120px_100px_200px_150px_40px] gap-4 items-center px-8 py-3 border-b last:border-0 cursor-pointer transition-all group relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'}`}
                        >
                          <div className="flex items-center gap-4 min-w-0 py-1">
                            <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110 bg-[#F0F7FF] text-[#1B4DA0] text-[13px]">
                              {(emp.name || '??').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                                <p className={`text-[14px] font-bold truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-[#0D47A1]' : 'text-[#0f172a] group-hover:text-[#0D47A1]'}`}>
                                  {emp.name}
                                </p>
                                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">{emp.empId}</p>
                            </div>
                          </div>

                          <div className="text-left">
                            <p className="text-[13px] font-bold text-[#6B6B7E]">{emp.department}</p>
                          </div>

                          <div className="text-left">
                             <p className="text-[13px] font-bold text-[#6B6B7E]">{emp.lastReview}</p>
                          </div>

                          <div className="text-left">
                            <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-[15px] font-black text-[#1B4DA0] shadow-sm">
                              {Math.round(emp.score / 10)}
                            </div>
                          </div>

                          <div className="text-left">
                            <p className="text-[12px] font-medium text-[#9B9BAD] truncate italic">
                              "Growth Analysis: {emp.position}"
                            </p>
                          </div>

                          <div className="text-left">
                            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 inline-flex border ${emp.score >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              <span className="text-[10px] font-black uppercase tracking-widest">{emp.score >= 90 ? 'EXCELLENT' : 'MET GOALS'}</span>
                            </div>
                          </div>

                          <div className="flex justify-end pr-2">
                             <ChevronRight size={20} className={`transition-all ${isDarkMode ? 'text-slate-700' : 'text-[#C5C5D2] group-hover:text-[#0D47A1]'}`} />
                          </div>
                        </motion.div>
                      )
                    )
                  )
                }
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {(selectedEmployee || view === 'bulk-assessment') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedEmployee(null); setView('list'); }} className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]" />
          )}

          {view === 'bulk-assessment' && (
            <div className="fixed inset-0 z-[1101] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
              <div className="w-full max-w-4xl pointer-events-auto bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  <BulkAssessmentView
                    key="bulk-assessment-view"
                    onBack={() => setView('list')}
                    onComplete={() => setView('list')}
                    isDarkMode={isDarkMode}
                    statCards={statCards}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedEmployee && (
            <motion.div initial={{ x: '100%', opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0.5 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] shadow-2xl z-[1101] border-l flex flex-col overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF]'}`}>
              <EmployeePerformanceDetailView employee={selectedEmployee} onBack={() => setSelectedEmployee(null)} isDarkMode={isDarkMode} getAvatarColor={getAvatarColor} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

const EmployeePerformanceDetailView = ({ employee, onBack, isDarkMode, getAvatarColor }) => {
  if (!employee) return null;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'text-white bg-slate-900' : 'text-slate-800 bg-white'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Drawer Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            {employee.name}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[3px]">{employee.empId}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4F3EF]" />
            <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Growth Analytics</span>
          </div>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
          <FiArrowRight size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="space-y-10">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-[#0D47A1] to-[#1E88E5] p-10 rounded-[40px] relative overflow-hidden shadow-xl shadow-blue-500/10">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-[2.5rem] bg-indigo-500 overflow-hidden shadow-2xl ring-4 ring-white/20 flex items-center justify-center text-white text-5xl font-black`}>
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-white text-[#0D47A1] shadow-lg">
                    <FiActivity size={24} />
                  </div>
                </div>
                <div className="text-left text-white">
                   <h3 className="text-3xl font-bold tracking-tight mb-2 uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>{employee.position}</h3>
                   <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-4">
                     {employee.department} DEPARTMENT
                   </div>
                   <p className="text-blue-100/70 text-sm font-medium italic opacity-80 leading-relaxed max-w-sm">
                     "Demonstrating consistent growth and technical proficiency within the mabicons ecosystem."
                   </p>
                </div>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 rounded-[32px] bg-[#F4F3EF]/50 border border-[#F4F3EF] text-left">
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2">Cycle Status</p>
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-2xl font-black text-[#1A1A2E] tracking-tight uppercase">Excellent</p>
                </div>
             </div>
             <div className="p-8 rounded-[32px] bg-[#F4F3EF]/50 border border-[#F4F3EF] text-left">
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2">Growth Score</p>
                <p className="text-4xl font-black text-[#0D47A1] tracking-tighter">
                   {Math.round(employee.score / 10)}<span className="text-lg text-[#9B9BAD]">/10</span>
                </p>
             </div>
          </div>

          {/* Metrics Section */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[4px] text-left px-1">KPI Analysis DNA</h4>
            <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm p-8 space-y-8">
              {[
                { label: 'Technical DNA', val: 94, color: 'bg-[#0D47A1]' },
                { label: 'Growth Velocity', val: 88, color: 'bg-[#1E88E5]' },
                { label: 'Professional Integrity', val: 75, color: 'bg-[#3FA9F5]' },
              ].map(kpi => (
                <div key={kpi.label} className="space-y-4">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-sm font-bold text-[#1A1A2E] uppercase tracking-tight">{kpi.label}</span>
                    <span className="text-lg font-black text-[#0D47A1] font-mono">{kpi.val}%</span>
                  </div>
                  <div className="h-4 rounded-full bg-[#F4F3EF] p-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${kpi.val}%` }} 
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className={`h-full rounded-full ${kpi.color} shadow-lg shadow-blue-500/10`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-10 flex gap-4">
            <button className="flex-1 py-5 rounded-[24px] bg-[#F4F3EF] text-[#6B6B7E] text-sm font-bold hover:bg-[#EAEAE8] transition-all">Download Report</button>
            <button onClick={onBack} className="flex-1 py-5 rounded-[24px] bg-[#0D47A1] text-white text-sm font-bold shadow-xl shadow-blue-500/20 hover:bg-[#0a3a82] transition-all">Close Performance Review</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;