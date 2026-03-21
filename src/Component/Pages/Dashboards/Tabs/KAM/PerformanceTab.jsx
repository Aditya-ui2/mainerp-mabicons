import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTarget, FiStar, FiAward, FiSearch, FiDownload, FiEdit2, FiEye, FiChevronDown, FiBarChart2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const PerformanceTab = ({ isDarkMode, selectedClient }) => {
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
    { key: 'avg', label: 'Avg Rating', value: `${avgRating}/5`, icon: FiStar, gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50' },
    { key: 'top', label: 'Top Performers', value: topPerformers, icon: FiAward, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50' },
    { key: 'pending', label: 'Pending Reviews', value: pendingReviews, icon: FiTarget, gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50' },
    { key: 'total', label: 'Total Reviewed', value: performanceData.length, icon: FiBarChart2, gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50' },
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
    const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredData = performanceData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || (filterRating === 'high' && emp.rating >= 4.5) || (filterRating === 'medium' && emp.rating >= 3.5 && emp.rating < 4.5) || (filterRating === 'low' && emp.rating < 3.5);
    return matchesSearch && matchesRating;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-72 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-48 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className={`h-64 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
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
            <FiTrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Performance Management
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Track and evaluate employee performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`appearance-none rounded-xl border-2 px-4 py-2.5 pr-10 font-medium cursor-pointer ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
              }`}
            >
              <option>Q1-2026</option>
              <option>Q4-2025</option>
              <option>Q3-2025</option>
              <option>Q2-2025</option>
            </select>
            <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25"
          >
            <FiDownload className="w-4 h-4" />
            Export Report
          </motion.button>
        </div>
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
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Ratings</option>
            <option value="high">Excellent (4.5+)</option>
            <option value="medium">Good (3.5-4.5)</option>
            <option value="low">Needs Work (&lt;3.5)</option>
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Performance Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredData.map((emp, index) => {
            const ratingConfig = getRatingConfig(emp.rating);
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
                {/* Gradient accent */}
                <div className={`h-1 bg-gradient-to-r ${ratingConfig.gradient}`}></div>
                
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
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
                        <p className="font-bold text-lg">{emp.name}</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{emp.empId} • {emp.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <FiStar className={`w-5 h-5 ${ratingConfig.text}`} />
                          <span className={`text-3xl font-bold ${ratingConfig.text}`}>{emp.rating}</span>
                        </div>
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{ratingConfig.label}</p>
                      </div>
                      <div className="text-center">
                        <div className={`flex items-center justify-center gap-1 px-4 py-2 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <span className="text-xl font-bold text-violet-500">{emp.completed}</span>
                          <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>/ {emp.goals}</span>
                        </div>
                        <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Goals</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${
                        emp.status === 'completed' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${emp.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {emp.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* KPIs */}
                  <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    {Object.entries(emp.kpis).map(([key, value], kpiIndex) => (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <span className={`text-sm font-medium capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{key}</span>
                          <span className="text-sm font-bold">{value}%</span>
                        </div>
                        <div className={`h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + kpiIndex * 0.1 }}
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(value)}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`flex gap-3 mt-6 pt-5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
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
                      <FiEdit2 className="w-4 h-4" /> Edit Review
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
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
              <div className={`h-2 bg-gradient-to-r ${getRatingConfig(selectedEmployee.rating).gradient} rounded-t-3xl`}></div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(selectedEmployee.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {selectedEmployee.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedEmployee.department}</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getRatingConfig(selectedEmployee.rating).text}`}>{selectedEmployee.rating}</div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rating</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {Object.entries(selectedEmployee.kpis).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{key}</span>
                        <span className="text-sm font-bold">{value}%</span>
                      </div>
                      <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <div className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(value)}`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
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

export default PerformanceTab;
