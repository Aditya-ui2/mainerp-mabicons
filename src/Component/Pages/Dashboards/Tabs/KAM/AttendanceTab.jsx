import { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiCoffee, FiDownload, FiSearch, FiChevronDown, FiTrendingUp, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeDetailView = ({ employee, onBack, isDarkMode, getStatusConfig, getAvatarColor }) => {
  const statusConfig = getStatusConfig(employee.status);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      className={`w-full ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      <div className="flex items-center gap-4 mb-8">
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
          Employee Timeline
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className={`col-span-1 p-8 rounded-2xl border-2 shadow-xl flex flex-col items-center text-center ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="relative mb-5">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-xl ring-4 ring-white dark:ring-slate-700 bg-gradient-to-br ${getAvatarColor(employee.name)}`}>
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute bottom-1 right-2 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 ${statusConfig.dot}`}></div>
          </div>
          <h3 className="text-2xl font-bold mb-1">{employee.name}</h3>
          <p className={`font-semibold text-lg ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'}`}>{employee.empId}</p>
          
          <div className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.text}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
            {statusConfig.label}
          </div>

          <div className={`w-full h-px my-6 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

          <div className="w-full">
            <div className="flex flex-col items-start gap-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Date</span>
              <div className="flex items-center gap-2 font-medium">
                <FiCalendar className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                {new Date(employee.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Details Grid */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className={`p-8 rounded-2xl border-2 shadow-xl h-full ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-lg shadow-[#1E88E5]/25`}>
                <FiClock className="w-4 h-4 text-white" />
              </div>
              Time & Attendance Info
            </h3>

            <div className="grid grid-cols-2 gap-5">
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-extrabold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Check In</p>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${employee.checkIn === '-' ? (isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm border') : (isDarkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100/80 text-emerald-600 shadow-sm')}`}>
                    <FiClock className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-extrabold">{employee.checkIn}</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-extrabold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Check Out</p>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${employee.checkOut === '-' ? (isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm border') : (isDarkMode ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-100/80 text-rose-600 shadow-sm')}`}>
                    <FiClock className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-extrabold">{employee.checkOut}</span>
                </div>
              </div>

              <div className={`col-span-2 sm:col-span-1 p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-blue-50 border-blue-100/80'}`}>
                <p className={`text-xs font-extrabold uppercase tracking-wider mb-3 text-blue-600 dark:text-blue-400`}>Total Hours</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-300">{employee.hours.split('h')[0]}<span className="text-lg text-blue-500">h</span></span>
                  <span className="text-xl font-bold text-blue-600/70">{employee.hours.split('h')[1]?.trim()}</span>
                </div>
              </div>

              <div className={`col-span-2 sm:col-span-1 p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-amber-50/80 border-amber-100'}`}>
                <p className={`text-xs font-extrabold uppercase tracking-wider mb-3 text-amber-600 dark:text-amber-500`}>Overtime</p>
                {employee.overtime !== '0h' ? (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <FiTrendingUp className="w-6 h-6" />
                    </div>
                    <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{employee.overtime}
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-extrabold text-slate-300 dark:text-slate-600">—</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AttendanceTab = ({ isDarkMode, selectedClient }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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
  }, [selectedDate, selectedClient]);

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
      gradient: 'from-green-500 to-green-600',
      bgGlow: 'shadow-green-500/20',
      lightBg: 'bg-gradient-to-br from-green-50 to-green-100',
      percentage: Math.round((stats.present / stats.total) * 100) || 0
    },
    {
      key: 'absent',
      label: 'Absent',
      value: stats.absent,
      icon: FiXCircle,
      gradient: 'from-red-500 to-red-600',
      bgGlow: 'shadow-red-500/20',
      lightBg: 'bg-gradient-to-br from-red-50 to-red-100',
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
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        dot: 'bg-green-500',
        label: 'Present'
      },
      absent: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        dot: 'bg-red-500',
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
      'from-purple-500 to-indigo-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-red-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-purple-600',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredData = attendanceData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-32 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className={`relative ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {!selectedEmployee ? (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
            className="space-y-8"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-lg shadow-[#1E88E5]/25`}>
                    <FiClock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent">
                    Attendance
                  </h2>
                </div>
                <p className={`text-base font-semibold mt-3 tracking-wide ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'} flex items-center gap-2`}>
                  <span className="flex items-center gap-1.5">
                    <FiUsers className="w-4 h-4" />
                    {selectedClient ? `Client: ${selectedClient}` : 'All Employees'}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="w-4 h-4" />
                    {formatDate(selectedDate)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium cursor-pointer transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 text-white hover:border-slate-600'
                      : 'bg-white border-slate-200 hover:border-violet-300'
                      }`}
                  />
                </div>
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
                  className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer ${isDarkMode
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
                    <div className="text-left">
                      <p className={`text-base font-extrabold mb-1 tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {card.label}
                      </p>
                      <p className={`text-4xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                        {card.value}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 justify-start">
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
                <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 hover:border-slate-600 focus:border-violet-500'
                    : 'bg-white border-slate-200 placeholder:text-slate-400 hover:border-violet-300 focus:border-violet-500'
                    }`}
                />
              </div>
            <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium transition-all focus:ring-2 focus:ring-violet-500/50 cursor-pointer ${isDarkMode
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
                <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-transform duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
              </div>

              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium transition-all focus:ring-2 focus:ring-violet-500/50 cursor-pointer ${isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-white hover:border-slate-600'
                    : 'bg-white border-slate-200 hover:border-violet-300'
                    }`}
                >
                  <option value="all">Selection</option>
                  <option value="hr">HR Dept</option>
                  <option value="it">IT Team</option>
                  <option value="sales">Sales Hub</option>
                  <option value="ops">Operations</option>
                </select>
                <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-transform duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
              </div>
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-2xl border-2 overflow-hidden shadow-xl ${isDarkMode
                ? 'bg-slate-800/50 border-slate-700/50 shadow-black/20'
                : 'bg-white border-slate-200/50 shadow-slate-200/50'
                }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-50 to-slate-100'}`}>
                      <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Employee</th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Check In</th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Check Out</th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Hours</th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Overtime</th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                    <AnimatePresence>
                      {filteredData.map((emp, index) => {
                        const statusConfig = getStatusConfig(emp.status);
                        return (
                          <motion.tr
                            key={emp.id}
                            onClick={() => setSelectedEmployee(emp)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group cursor-pointer transition-colors ${isDarkMode
                              ? 'hover:bg-slate-700/30'
                              : 'hover:bg-violet-50/50'
                              }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-slate-700 bg-gradient-to-br ${getAvatarColor(emp.name)}`}
                                  >
                                    {emp.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${statusConfig.dot}`}></div>
                                </div>
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
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${emp.checkIn === '-'
                                ? isDarkMode ? 'bg-slate-700/50 text-slate-500' : 'bg-slate-100 text-slate-400'
                                : isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                <FiClock className="w-4 h-4" />
                                <span className="font-medium text-sm">{emp.checkIn}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${emp.checkOut === '-'
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
          </motion.div>
        ) : (
          <EmployeeDetailView 
            key="detail-view"
            employee={selectedEmployee} 
            onBack={() => setSelectedEmployee(null)} 
            isDarkMode={isDarkMode} 
            getStatusConfig={getStatusConfig}
            getAvatarColor={getAvatarColor}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceTab;
