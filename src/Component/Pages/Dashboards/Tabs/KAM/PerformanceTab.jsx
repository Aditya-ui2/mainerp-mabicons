import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTarget, FiStar, FiAward, FiSearch, FiDownload, FiEdit2, FiEye, FiChevronDown, FiBarChart2, FiArrowLeft, FiCalendar, FiActivity, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeePerformanceDetailView = ({ employee, onBack, isDarkMode, getRatingConfig, getAvatarColor, getProgressGradient }) => {
  const ratingConfig = getRatingConfig(employee.rating);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      className={`w-full ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      <div className="flex items-center gap-4 mb-8 text-left">
        <button 
          onClick={onBack}
          className={`p-2.5 rounded-xl transition-all shadow-sm ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h2 
          onClick={onBack}
          className="text-2xl font-bold bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity select-none"
        >
          Employee Performance Insights
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className={`col-span-1 p-8 rounded-[2.5rem] border-2 shadow-xl flex flex-col items-center text-center relative overflow-hidden ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'
          }`}
        >
          {/* Background Glow */}
          <div className={`absolute -top-12 -right-12 w-32 h-32 opacity-20 blur-3xl rounded-full bg-gradient-to-br ${ratingConfig.gradient}`}></div>
          
          <div className="relative mb-6">
            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl ring-4 ring-white dark:ring-slate-800 bg-gradient-to-br ${getAvatarColor(employee.name)}`}>
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 bg-gradient-to-br ${ratingConfig.gradient} text-white shadow-lg`}>
              <FiAward className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-2xl font-black mb-1">{employee.name}</h3>
          <p className={`font-black tracking-widest text-xs uppercase mb-4 ${isDarkMode ? 'text-blue-400' : 'text-[#3FA9F5]'}`}>{employee.empId}</p>
          <p className={`text-sm font-bold px-4 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>{employee.department}</p>
          
          <div className={`mt-6 w-full p-4 rounded-3xl border-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center justify-center gap-3">
              <FiStar className={`w-6 h-6 ${ratingConfig.text} fill-current`} />
              <span className={`text-4xl font-black ${ratingConfig.text}`}>{employee.rating}</span>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${ratingConfig.text}`}>
              Overall Rating: {ratingConfig.label}
            </p>
          </div>

          <div className={`w-full h-px my-6 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

          <div className="w-full text-left space-y-4">
              <div className="flex flex-col gap-1">
                <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Review Period</span>
                <div className="flex items-center gap-2 font-bold text-blue-600">
                  <FiCalendar className="w-4 h-4" />
                  Q1 Performance Cycle (2026)
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Status</span>
                <div className="flex items-center gap-2 font-medium">
                  <FiActivity className={`w-4 h-4 ${employee.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`} />
                  {employee.status === 'completed' ? 'Evaluation finalized' : 'Review in progress'}
                </div>
              </div>
          </div>
        </div>

        {/* Detailed KPI Analysis */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className={`p-8 rounded-[2.5rem] border-2 shadow-xl ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h4 className="font-black text-blue-600 mb-8 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <FiBarChart2 className="w-4 h-4" /> KPI Breakdown & Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {Object.entries(employee.kpis).map(([key, value], idx) => (
                      <motion.div 
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className="space-y-3"
                      >
                        <div className="flex justify-between items-end">
                          <span className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{key}</span>
                          <span className="font-black text-lg">{value}%</span>
                        </div>
                        <div className={`h-3 rounded-full overflow-hidden p-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(value)}`}
                          />
                        </div>
                      </motion.div>
                    ))}
                </div>
            </div>

            {/* Performance Narrative */}
            <div className={`p-8 rounded-[2.5rem] border-2 shadow-xl ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h4 className="font-black text-violet-600 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <FiTrendingUp className="w-4 h-4" /> Reviewer Analysis
                </h4>
                <div className={`p-6 rounded-3xl italic text-sm leading-relaxed ${isDarkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-600 font-medium'}`}>
                  "{employee.name} has demonstrated exceptional focus on quality and productivity this quarter. Their contribution to the core engineering team has been pivotal in meeting project deadlines. Areas for growth include taking more initiative in cross-departmental collaborations."
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                      <FiUsers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">Reviewed By</p>
                      <p className="text-sm font-bold">Sr. Engineering Manager</p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-[#1E88E5] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20">
                    Download Full PDF
                  </button>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

const PerformanceTab = ({ isDarkMode, selectedClient }) => {
  const [view, setView] = useState('list'); // 'list', 'details'
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('Q1-2026');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP001', name: 'Rahul Sharma', department: 'Engineering', rating: 4.5, goals: 8, completed: 7, kpis: { productivity: 92, quality: 88, teamwork: 95, initiative: 85 }, status: 'completed', avatar: 'RS', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, empId: 'EMP002', name: 'Priya Singh', department: 'HR', rating: 4.8, goals: 6, completed: 6, kpis: { productivity: 95, quality: 92, teamwork: 98, initiative: 90 }, status: 'completed', avatar: 'PS', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, empId: 'EMP003', name: 'Amit Kumar', department: 'Sales', rating: 3.8, goals: 10, completed: 7, kpis: { productivity: 85, quality: 80, teamwork: 88, initiative: 78 }, status: 'pending', avatar: 'AK', photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 4, empId: 'EMP004', name: 'Sneha Patel', department: 'Finance', rating: 4.2, goals: 7, completed: 6, kpis: { productivity: 88, quality: 90, teamwork: 85, initiative: 82 }, status: 'completed', avatar: 'SP', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 5, empId: 'EMP005', name: 'Vikram Rao', department: 'Engineering', rating: 4.9, goals: 9, completed: 9, kpis: { productivity: 98, quality: 95, teamwork: 92, initiative: 95 }, status: 'completed', avatar: 'VR', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
    ];
    setTimeout(() => {
      setPerformanceData(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient, selectedPeriod]);

  const avgRating = performanceData.length > 0 ? (performanceData.reduce((acc, emp) => acc + emp.rating, 0) / performanceData.length).toFixed(1) : '0.0';
  const topPerformers = performanceData.filter(e => e.rating >= 4.5).length;
  const pendingReviews = performanceData.filter(e => e.status === 'pending').length;

  const statCards = [
    { key: 'avg', label: 'Avg Rating', value: `${avgRating}/5`, icon: FiStar, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]', shadow: 'shadow-blue-500/20' },
    { key: 'top', label: 'Top Performers', value: topPerformers, icon: FiAward, gradient: 'from-[#1E88E5] to-[#0D47A1]', shadow: 'shadow-blue-700/20' },
    { key: 'pending', label: 'Pending Reviews', value: pendingReviews, icon: FiTarget, gradient: 'from-[#0D47A1] to-blue-900', shadow: 'shadow-blue-900/20' },
    { key: 'total', label: 'Total Reviewed', value: performanceData.length, icon: FiBarChart2, gradient: 'from-cyan-400 to-[#3FA9F5]', shadow: 'shadow-cyan-500/20' },
  ];

  const getRatingConfig = (rating) => {
    if (rating >= 4.5) return { text: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', gradient: 'from-emerald-500 to-teal-500', label: 'Excellent' };
    if (rating >= 3.5) return { text: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', gradient: 'from-amber-500 to-orange-500', label: 'Good' };
    return { text: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', gradient: 'from-rose-500 to-pink-500', label: 'Needs Work' };
  };

  const getProgressGradient = (value) => {
    if (value >= 90) return 'from-emerald-500 to-teal-500';
    if (value >= 70) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  const getAvatarColor = (name) => {
    const colors = [
      'from-blue-600 to-indigo-900',
      'from-[#3FA9F5] to-blue-700',
      'from-cyan-500 to-blue-600',
      'from-indigo-500 to-purple-700',
      'from-teal-500 to-emerald-700'
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredData = performanceData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || (filterRating === 'high' && emp.rating >= 4.5) || (filterRating === 'medium' && emp.rating >= 3.5 && emp.rating < 4.5) || (filterRating === 'low' && emp.rating < 3.5);
    return matchesSearch && matchesRating;
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className={`h-10 w-80 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-56 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          </div>
        </div>
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
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-[#1E88E5]/30 ring-4 ring-blue-500/10">
                    <FiTrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent tracking-tight">
                      Performance
                    </h2>
                    <p className={`text-sm font-black uppercase tracking-[0.2em] mt-1 ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'} flex items-center gap-2`}>
                      <FiActivity className="w-4 h-4" />
                      Digital Workforce Evaluation
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className={`appearance-none rounded-2xl border-2 px-6 py-3.5 pr-12 font-bold cursor-pointer transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${
                        isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'
                      }`}
                  >
                    <option>Q1-2026</option>
                    <option>Q4-2025</option>
                    <option>Q3-2025</option>
                    <option>Q2-2025</option>
                  </select>
                  <FiChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1] text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all uppercase tracking-widest text-xs"
                >
                  <FiDownload className="w-5 h-5" />
                  Export Reports
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
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.1
                  }}
                  onMouseEnter={() => setHoveredCard(stat.key)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`relative overflow-hidden rounded-[2.5rem] p-7 transition-all duration-300 cursor-pointer bg-gradient-to-br border-b-8 border-r-4 border-black/5 ${stat.gradient} ${stat.shadow} group`}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative flex flex-col gap-6">
                    <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/30`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-white drop-shadow-xl tracking-tighter">
                          {stat.value}
                        </p>
                        {stat.key === 'avg' && <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Index</span>}
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="absolute bottom-0 left-0 h-1.5 bg-white/50"
                    initial={{ width: 0 }}
                    animate={{ width: hoveredCard === stat.key ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1 group">
                <FiSearch className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors group-focus-within:text-blue-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <input
                  type="text"
                  placeholder="Search and analyze employee performance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-[1.5rem] border-2 px-6 py-4 pl-14 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-100 shadow-sm placeholder:text-slate-300'
                    }`}
                />
              </div>
              <div className="relative group">
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className={`appearance-none rounded-[1.5rem] border-2 px-8 py-4 pr-14 font-extrabold cursor-pointer transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm'
                    }`}
                >
                  <option value="all">Global Ratings</option>
                  <option value="high">Excellent (4.5+)</option>
                  <option value="medium">Good (3.5-4.5)</option>
                  <option value="low">Needs Work (&lt;3.5)</option>
                </select>
                <FiChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
            </motion.div>

            {/* Performance Cards */}
            <div className="space-y-8 pb-12">
              <AnimatePresence>
                {filteredData.map((emp, index) => {
                  const ratingConfig = getRatingConfig(emp.rating);
                  
                  return (
                    <motion.div 
                      key={emp.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      whileHover={{ y: -8, shadow: "0 40px 60px -20px rgba(0,0,0,0.2)" }}
                      className={`group relative overflow-hidden rounded-[3rem] border-2 transition-all duration-500 cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-900/40 border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-800/40' 
                          : 'bg-white border-slate-100/80 hover:border-blue-200 hover:shadow-2xl shadow-blue-500/5'
                      }`}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setView('details');
                      }}
                    >
                      {/* Interactive Accent Glow */}
                      <div className={`absolute top-0 right-0 w-64 h-64 opacity-[0.03] group-hover:opacity-10 blur-3xl rounded-full bg-gradient-to-br transition-opacity duration-700 ${ratingConfig.gradient}`}></div>
                      
                      <div className="p-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                          {/* Left: Profile Info */}
                          <div className="flex items-center gap-8">
                            <motion.div 
                              className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-black text-4xl shadow-2xl ring-4 ring-white dark:ring-slate-800 group-hover:rotate-6 transition-transform`}
                            >
                              {emp.name.charAt(0)}
                            </motion.div>
                            <div>
                              <h3 className="font-black text-3xl tracking-tight mb-2 group-hover:text-blue-500 transition-colors">{emp.name}</h3>
                              <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800/80 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                  {emp.empId}
                                </span>
                                <span className={`text-xs font-black uppercase tracking-widest text-slate-400`}>
                                  {emp.department}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Middle: KPIs Grid */}
                          <div className="flex-1 max-w-2xl lg:px-6">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                              {Object.entries(emp.kpis).map(([key, value], kpiIndex) => (
                                <div key={key} className="space-y-2.5">
                                  <div className="flex justify-between items-end">
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                      {key}
                                    </span>
                                    <span className="text-xs font-black group-hover:text-blue-500 transition-colors">{value}%</span>
                                  </div>
                                  <div className={`h-2.5 rounded-full overflow-hidden p-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${value}%` }}
                                      transition={{ duration: 1.5, delay: 0.5 + (index * 0.1) + (kpiIndex * 0.05) }}
                                      className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(value)}`}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: Score & Actions */}
                          <div className="flex flex-row lg:flex-col items-center justify-between gap-8 lg:min-w-[220px] pt-10 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100/50 dark:border-slate-800/50 lg:pl-10">
                            <div className="text-center lg:text-right w-full space-y-4">
                              <div className="flex lg:justify-end">
                                <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                                  emp.status === 'completed' 
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                }`}>
                                  <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${emp.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                  {emp.status}
                                </span>
                              </div>
                              <div className="flex items-center lg:justify-end gap-3">
                                <FiStar className={`w-6 h-6 ${ratingConfig.text} fill-current`} />
                                <span className={`text-5xl font-black ${ratingConfig.text}`}>{emp.rating}</span>
                              </div>
                              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${ratingConfig.text} opacity-80`}>
                                {ratingConfig.label}
                              </p>
                            </div>
                            
                            <div className="hidden lg:flex gap-4">
                              <motion.button 
                                whileHover={{ scale: 1.1, rotate: -3 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/5"
                                title="Comprehensive Analysis"
                              >
                                <FiEye className="w-6 h-6" />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1, rotate: 3 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white transition-all shadow-xl shadow-violet-500/5"
                                title="Edit Evaluation"
                              >
                                <FiEdit2 className="w-6 h-6" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <EmployeePerformanceDetailView 
            key="performance-detail"
            employee={selectedEmployee} 
            onBack={() => {
              setSelectedEmployee(null);
              setView('list');
            }} 
            isDarkMode={isDarkMode} 
            getRatingConfig={getRatingConfig}
            getAvatarColor={getAvatarColor}
            getProgressGradient={getProgressGradient}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformanceTab;
