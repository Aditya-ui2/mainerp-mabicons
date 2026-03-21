import { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiCoffee, FiDownload, FiSearch, FiChevronDown, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AttendanceTab = ({ isDarkMode, selectedClient }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Mock data - Replace with API call
  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP001', name: 'Rahul Sharma', date: '2026-03-17', checkIn: '09:00', checkOut: '18:00', status: 'present', hours: '9h 0m', overtime: '0h', avatar: 'RS', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, empId: 'EMP002', name: 'Priya Singh', date: '2026-03-17', checkIn: '09:15', checkOut: '18:30', status: 'present', hours: '9h 15m', overtime: '15m', avatar: 'PS', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, empId: 'EMP003', name: 'Amit Kumar', date: '2026-03-17', checkIn: '-', checkOut: '-', status: 'absent', hours: '0h', overtime: '0h', avatar: 'AK', photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 4, empId: 'EMP004', name: 'Sneha Patel', date: '2026-03-17', checkIn: '10:00', checkOut: '17:00', status: 'halfday', hours: '7h 0m', overtime: '0h', avatar: 'SP', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 5, empId: 'EMP005', name: 'Vikram Rao', date: '2026-03-17', checkIn: '09:00', checkOut: '20:00', status: 'present', hours: '11h 0m', overtime: '2h', avatar: 'VR', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { id: 6, empId: 'EMP006', name: 'Anjali Gupta', date: '2026-03-17', checkIn: '-', checkOut: '-', status: 'leave', hours: '0h', overtime: '0h', avatar: 'AG', photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
    ];
    setTimeout(() => {
      setAttendanceData(mockData);
      setLoading(false);
    }, 500);
  }, [selectedMonth, selectedClient]);

  const stats = {
    present: attendanceData.filter(a => a.status === 'present').length,
    absent: attendanceData.filter(a => a.status === 'absent').length,
    halfday: attendanceData.filter(a => a.status === 'halfday').length,
    onLeave: attendanceData.filter(a => a.status === 'leave').length,
    total: attendanceData.length,
  };

  const statCards = [
    { 
      key: 'present', 
      label: 'Present', 
      value: stats.present, 
      icon: FiCheckCircle, 
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'shadow-emerald-500/20',
      lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      percentage: Math.round((stats.present / stats.total) * 100) || 0
    },
    { 
      key: 'absent', 
      label: 'Absent', 
      value: stats.absent, 
      icon: FiXCircle, 
      gradient: 'from-rose-500 to-pink-600',
      bgGlow: 'shadow-rose-500/20',
      lightBg: 'bg-gradient-to-br from-rose-50 to-pink-50',
      percentage: Math.round((stats.absent / stats.total) * 100) || 0
    },
    { 
      key: 'halfday', 
      label: 'Half Day', 
      value: stats.halfday, 
      icon: FiCoffee, 
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'shadow-amber-500/20',
      lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      percentage: Math.round((stats.halfday / stats.total) * 100) || 0
    },
    { 
      key: 'onLeave', 
      label: 'On Leave', 
      value: stats.onLeave, 
      icon: FiCalendar, 
      gradient: 'from-blue-500 to-indigo-600',
      bgGlow: 'shadow-blue-500/20',
      lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      percentage: Math.round((stats.onLeave / stats.total) * 100) || 0
    },
  ];

  const getStatusConfig = (status) => {
    const config = {
      present: { 
        bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        label: 'Present'
      },
      absent: { 
        bg: 'bg-rose-100 dark:bg-rose-900/30', 
        text: 'text-rose-700 dark:text-rose-400',
        dot: 'bg-rose-500',
        label: 'Absent'
      },
      halfday: { 
        bg: 'bg-amber-100 dark:bg-amber-900/30', 
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
        label: 'Half Day'
      },
      leave: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-700 dark:text-blue-400',
        dot: 'bg-blue-500',
        label: 'On Leave'
      },
    };
    return config[status] || config.present;
  };

  const getAvatarColor = (name) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-indigo-500 to-blue-600',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredData = attendanceData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatMonth = (dateString) => {
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-32 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        {/* Skeleton Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        {/* Skeleton Table */}
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
        <div>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25`}>
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Attendance & Time Tracking
              </h2>
              <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedClient ? `Client: ${selectedClient}` : 'All Employees'} • {formatMonth(selectedMonth)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/50 ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700 text-white hover:border-slate-600' 
                  : 'bg-white border-slate-200 hover:border-violet-300'
              }`}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
          >
            <FiDownload className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setHoveredCard(card.key)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800/80 border border-slate-700/50 hover:border-slate-600' 
                : `${card.lightBg} border border-white/50 hover:shadow-xl ${card.bgGlow}`
            } ${hoveredCard === card.key ? 'scale-[1.02]' : ''}`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="80" cy="20" r="40" fill="currentColor" />
              </svg>
            </div>
            
            <div className="relative flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {card.label}
                </p>
                <p className={`text-4xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <FiTrendingUp className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    {card.percentage}% of total
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className={`mt-4 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-white/50'}`}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${card.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${card.gradient}`}
              />
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
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 hover:border-slate-600 focus:border-violet-500' 
                : 'bg-white border-slate-200 placeholder:text-slate-400 hover:border-violet-300 focus:border-violet-500'
            }`}
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium transition-all focus:ring-2 focus:ring-violet-500/50 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700 text-white hover:border-slate-600' 
                : 'bg-white border-slate-200 hover:border-violet-300'
            }`}
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="halfday">Half Day</option>
            <option value="leave">On Leave</option>
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-2xl border-2 overflow-hidden shadow-xl ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50 shadow-black/20' 
            : 'bg-white border-slate-200/50 shadow-slate-200/50'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-50 to-slate-100'}`}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Check In</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Check Out</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hours</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Overtime</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
              <AnimatePresence>
                {filteredData.map((emp, index) => {
                  const statusConfig = getStatusConfig(emp.status);
                  return (
                    <motion.tr 
                      key={emp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-slate-700/30' 
                          : 'hover:bg-violet-50/50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {emp.photo ? (
                            <div className="relative">
                              <img 
                                src={emp.photo} 
                                alt={emp.name}
                                className="w-10 h-10 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} items-center justify-center text-white font-bold text-sm shadow-lg hidden`}>
                                {emp.avatar}
                              </div>
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                              {emp.avatar}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{emp.name}</p>
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{emp.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {new Date(emp.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                          emp.checkIn === '-' 
                            ? isDarkMode ? 'bg-slate-700/50 text-slate-500' : 'bg-slate-100 text-slate-400' 
                            : isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          <FiClock className="w-4 h-4" />
                          <span className="font-medium text-sm">{emp.checkIn}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                          emp.checkOut === '-' 
                            ? isDarkMode ? 'bg-slate-700/50 text-slate-500' : 'bg-slate-100 text-slate-400' 
                            : isDarkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-600'
                        }`}>
                          <FiClock className="w-4 h-4" />
                          <span className="font-medium text-sm">{emp.checkOut}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{emp.hours}</span>
                      </td>
                      <td className="px-6 py-4">
                        {emp.overtime !== '0h' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                            <FiTrendingUp className="w-3.5 h-3.5" />
                            +{emp.overtime}
                          </span>
                        ) : (
                          <span className={`text-sm ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                          {statusConfig.label}
                        </span>
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
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Showing <span className="font-semibold">{filteredData.length}</span> of <span className="font-semibold">{attendanceData.length}</span> employees
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AttendanceTab;
