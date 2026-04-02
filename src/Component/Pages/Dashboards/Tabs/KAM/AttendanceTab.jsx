

import { useState, useEffect, useRef } from 'react';
import { FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiCoffee, FiDownload, FiSearch, FiChevronDown, FiTrendingUp, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeDetailView = ({ employee, onBack, isDarkMode, getStatusConfig, getAvatarColor }) => {
  const statusConfig = getStatusConfig(employee.status);
  const topRef = useRef(null);

  // Definitive scroll-to-top using Ref (Works even if parent is a scroll container)
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <motion.div
      ref={topRef}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`w-full min-h-screen pb-12 ${isDarkMode ? 'bg-slate-900' : 'bg-[#f8faff]'}`}
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="max-w-[1400px] mx-auto min-h-screen pb-12">
        {/* Stable Non-Sticky Header (To prevent overlap) */}
        <div className={`px-8 py-8 flex items-center gap-6 ${isDarkMode ? 'bg-slate-900' : 'bg-[#f8faff]'}`}>
          <button
            onClick={onBack}
            className={`p-3 rounded-xl border transition-all ${isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:shadow-lg'
              }`}
          >
            <FiArrowLeft className="w-5 h-5 text-[#004fb1]" />
          </button>
          <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#004fb1]'}`}>
            Employee Details
          </h2>
        </div>

        <div className="px-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Profile Panel (Matched v1 Square Avatar/Table style) */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-10 rounded-[2.5rem] shadow-xl shadow-blue-500/5 flex flex-col items-center border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}
              >
                <div className="relative mb-8 group">
                  <div className={`w-40 h-40 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] group-hover:rotate-3 transition-transform duration-500 ring-4 ring-blue-50/50`}>
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 p-3 rounded-full border-4 ${isDarkMode ? 'border-slate-900 bg-emerald-500' : 'border-white bg-[#004fb1]'} text-white shadow-xl ring-2 ring-blue-50`}>
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-center group">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
                    {employee.name}
                  </h3>
                  <p className="text-sm font-black text-[#004fb1] tracking-widest mt-1">
                    {employee.empId}
                  </p>
                </div>

                <div className="w-full mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  {[
                    { label: 'Department', value: 'HR Operations' },
                    { label: 'Designation', value: 'Team Member' },
                    { label: 'Joining Date', value: 'Jan 12, 2024' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <span className="text-[11px] font-black text-slate-400 tracking-widest">{item.label}</span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Activity Panel */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Information Card (Daily Attendance) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-10 rounded-[2.5rem] shadow-xl shadow-blue-500/5 border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}
              >
                <div className="flex items-center gap-3 mb-10">
                  <FiClock className="w-5 h-5 text-[#004fb1]" />
                  <h4 className="text-[13px] font-black text-slate-800 dark:text-white tracking-[0.1em]">Daily Attendance Record</h4>
                </div>

                <div className="grid grid-cols-2 gap-y-12 gap-x-8 mb-12">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-3">Attendance Status</p>
                    <div className="flex items-center gap-3">
                       <span className={`${statusConfig.bg} ${statusConfig.text} px-5 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-sm`}>
                          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                          {statusConfig.label}
                       </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-3">Duration</p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">Today, {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                <div className="w-full">
                   <p className="text-center text-[10px] font-black text-slate-400 tracking-[0.3em] mb-4">Reason / Notes</p>
                   <div className={`p-8 rounded-[1.5rem] border-2 italic text-center text-sm font-bold shadow-inner ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50/50 border-slate-100 text-slate-500'}`}>
                      "Employee clocked in on-time and performed critical operations."
                   </div>
                </div>
              </motion.div>

              {/* Bottom Balanced Cards (Stats Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Check In', value: employee.checkIn === '-' ? 'N/A' : employee.checkIn, sub: 'Log Time' },
                  { label: 'Check Out', value: employee.checkOut === '-' ? 'N/A' : employee.checkOut, sub: 'Log Time', icon: true },
                  { label: 'Working', value: employee.hours, sub: 'Effective' },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-8 rounded-[2rem] shadow-lg shadow-blue-500/5 border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'} group hover:-translate-y-1 transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black text-slate-400 tracking-widest ml-auto">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {stat.icon && (
                        <div className="p-3 rounded-xl bg-orange-400 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                          <FiCoffee className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">{stat.value}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={onBack}
                  className={`flex-1 py-5 rounded-[1.5rem] text-[11px] font-black tracking-widest transition-all ${isDarkMode
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                >
                  Close Details
                </button>
                <button className="flex-[2] py-5 rounded-[1.5rem] bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] text-white text-[11px] font-black tracking-widest shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-[1.01] transition-all">
                  Update Information
                </button>
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
      total: stats.total,
      icon: FiCheckCircle,
      color: 'text-[#00df9a]',
      bgColor: 'bg-[#00df9a]/10',
      barColor: 'bg-[#00df9a]',
      glowColor: 'shadow-[#00df9a]/50',
      subtext: `${stats.present} employees present today`
    },
    {
      key: 'absent',
      label: 'Absent',
      value: stats.absent,
      total: stats.total,
      icon: FiXCircle,
      color: 'text-[#ff4b2b]',
      bgColor: 'bg-[#ff4b2b]/10',
      barColor: 'bg-[#ff4b2b]',
      glowColor: 'shadow-[#ff4b2b]/50',
      subtext: `${stats.absent} employees absent today`
    },
    {
      key: 'halfday',
      label: 'Half Day',
      value: stats.halfday,
      total: stats.total,
      icon: FiCoffee,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      barColor: 'bg-amber-500',
      glowColor: 'shadow-amber-500/50',
      subtext: `${stats.halfday} on half day shift`
    },
    {
      key: 'onLeave',
      label: 'Leaves',
      value: stats.onLeave,
      total: stats.total,
      icon: FiCalendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      barColor: 'bg-blue-500',
      glowColor: 'shadow-blue-500/50',
      subtext: `${stats.onLeave} approved leaves`
    },
  ];

  const getStatusConfig = (status) => {
    const config = {
      present: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        dot: 'bg-green-500',
        label: 'Approved'
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
    <div 
      className={`w-full min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-[#fcfdff] text-slate-800'}`}
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
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
            {/* Modern Banner Header (Matched with Payroll/Performance Layout) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20">
                  <FiClock className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent tracking-tight mb-1">
                    Attendance
                  </h2>
                  <div className="flex items-center gap-3">
                    <p className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <FiUsers className="w-4 h-4" />
                      {selectedClient ? `Client: ${selectedClient}` : 'All Employees'}
                    </p>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <p className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <FiCalendar className="w-4 h-4" />
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className={`rounded-2xl border-2 px-6 py-3.5 text-sm font-black cursor-pointer transition-all focus:ring-4 focus:ring-blue-500/10 ${isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
                      : 'bg-white border-slate-100 text-slate-700 hover:border-blue-200 shadow-sm'
                      }`}
                  />
                </div>
              </div>
            </motion.div>

            {/* Premium Stats Containers (Matched with v1 Reference Image) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative overflow-hidden rounded-[2.5rem] p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${isDarkMode
                    ? 'bg-slate-900 border-slate-800 shadow-xl'
                    : 'bg-gradient-to-br from-[#eff6ff] to-[#f8faff] border-white shadow-xl shadow-blue-500/10'
                    }`}
                >
                  {/* Floating Icon Button */}
                  <div className="absolute top-6 right-6">
                    <div className={`p-2.5 rounded-xl bg-[#0052cc] shadow-lg shadow-blue-700/30 group-hover:scale-110 transition-transform`}>
                      <card.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col h-full gap-5">
                    {/* Header Label - Left Aligned, Large & Bold */}
                    <div className="flex flex-col items-start gap-1">
                      <p className={`text-[15px] font-black tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-800'}`}>
                        {card.label}
                      </p>
                    </div>

                    {/* Main Value and Trend - Left Aligned */}
                    <div className="flex items-baseline gap-2 mt-1">
                       <span className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-[#004fb1]'} tracking-tighter`}>
                        {/* Format numbers like "3%" or "01" */}
                        {card.label === 'Present' ? `${card.value}%` : card.value < 10 ? `0${card.value}` : card.value}
                      </span>
                      <span className={`text-[11px] font-bold tracking-tight ${isDarkMode ? 'text-blue-400/50' : 'text-[#004fb1]/60'}`}>
                        {card.label === 'Present' ? 'Growth' : card.label === 'Absent' ? 'Critical' : 'Trend'}
                      </span>
                    </div>

                    {/* Clean Progress Bar (Bottom Aligned) */}
                    <div className="mt-auto pt-6">
                      <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-blue-200/50'} overflow-hidden`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${card.total > 0 ? Math.min((card.value / card.total) * 100, 100) : 0}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 + index * 0.1 }}
                          className={`h-full rounded-full bg-[#0052cc] shadow-[0_0_10px_rgba(0,82,204,0.3)]`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Filters */}            {/* Modern Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 items-center"
            >
              <div className="relative flex-1 w-full">
                <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search by name or Employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-2xl border-2 px-4 py-3.5 pl-12 transition-all focus:ring-4 focus:ring-blue-500/10 ${isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-600'
                    : 'bg-white border-slate-100 placeholder:text-slate-400 shadow-sm'
                    }`}
                />
              </div>

              <div className="flex gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-44">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`w-full appearance-none rounded-2xl border-2 px-5 py-3.5 pr-10 font-bold transition-all focus:ring-4 focus:ring-blue-500/10 cursor-pointer ${isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-white'
                      : 'bg-white border-slate-100 text-slate-700 shadow-sm'
                      }`}
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="halfday">Half Day</option>
                    <option value="leave">On Leave</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400" />
                </div>

                <div className="relative flex-1 sm:w-44">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className={`w-full appearance-none rounded-2xl border-2 px-5 py-3.5 pr-10 font-bold transition-all focus:ring-4 focus:ring-blue-500/10 cursor-pointer ${isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-white'
                      : 'bg-white border-slate-100 text-slate-700 shadow-sm'
                      }`}
                  >
                    <option value="all">Departments</option>
                    <option value="hr">HR Dept</option>
                    <option value="it">IT Team</option>
                    <option value="sales">Sales Hub</option>
                    <option value="ops">Operations</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400" />
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {filteredData.map((emp, index) => {
                  const statusConfig = getStatusConfig(emp.status);
                  return (
                    <motion.div
                      key={emp.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`group relative overflow-hidden rounded-[1.5rem] border-b transition-all duration-300 cursor-pointer ${isDarkMode
                        ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800'
                        : index % 2 === 0 ? 'bg-[#f8faff] border-slate-100 hover:bg-[#f0f7ff]' : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                    >
                      <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left: User Info (Matched v1 avatar/text style) */}
                        <div className="flex items-center gap-5 lg:min-w-[280px]">
                          <div className="relative">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg ring-2 ring-white bg-gradient-to-br ${getAvatarColor(emp.name)} group-hover:rotate-6 transition-transform`}>
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-black text-[16px] tracking-tight text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                              {emp.name}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">
                              {emp.empId}
                            </p>
                          </div>
                        </div>

                        {/* Center: Time Stats (Clean Columns) */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                          <div className="flex flex-col items-center lg:items-start">
                            <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mb-2">Check In</p>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${emp.checkIn === '-' ? 'bg-slate-300' : 'bg-emerald-500'}`}></div>
                              <span className="font-black text-sm text-slate-700 dark:text-slate-300 tracking-tighter">{emp.checkIn === '-' ? 'Not In' : emp.checkIn}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center lg:items-start">
                            <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mb-2">Check Out</p>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${emp.checkOut === '-' ? 'bg-slate-300' : 'bg-rose-500'}`}></div>
                              <span className="font-black text-sm text-slate-700 dark:text-slate-300 tracking-tighter">{emp.checkOut === '-' ? 'Not Out' : emp.checkOut}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center lg:items-start">
                            <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mb-2">Total Hours</p>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-slate-700 dark:text-slate-300 tracking-tighter">{emp.hours}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center lg:items-start">
                            <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mb-2">Overtime</p>
                            <span className={`font-black text-sm tracking-tighter ${emp.overtime !== '0h' ? 'text-emerald-600' : 'text-slate-300'}`}>
                              {emp.overtime !== '0h' ? emp.overtime : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Right: Status & Action (Pill + Icons) */}
                        <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                          <span className={`${statusConfig.bg} ${statusConfig.text} px-5 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-sm`}>
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                            {statusConfig.label}
                          </span>
                          <div className="flex items-center gap-2">
                             <button className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm">
                               <FiCheckCircle className="w-4 h-4" />
                             </button>
                             <button className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm">
                               <FiXCircle className="w-4 h-4" />
                             </button>
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
