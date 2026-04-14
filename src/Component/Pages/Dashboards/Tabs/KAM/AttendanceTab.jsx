

import { useState, useEffect, useRef } from 'react';
import { FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiCoffee, FiDownload, FiSearch, FiChevronDown, FiTrendingUp, FiUsers, FiArrowLeft, FiLogIn, FiLogOut } from 'react-icons/fi';
import { Search, ChevronDown, ChevronRight, MapPin, Users as UsersIcon, Check, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeptAttendance } from '../../../service/api';

const EmployeeDetailView = ({ employee, onBack, isDarkMode, getStatusConfig }) => {
  const statusConfig = getStatusConfig(employee.status);
  const topRef = useRef(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <motion.div
      ref={topRef}
      initial={{ opacity: 0, x: '100%' }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex flex-col h-full bg-white relative overflow-hidden"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      {/* Header - Simple & Clean */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            {employee.name}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[3px]">{employee.empId}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4F3EF]" />
            <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Member Detail</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-11 h-11 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-10 bg-[#FAFAF8] overflow-y-auto">
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden">
          
          {/* Main Info Grid */}
          <div className="p-10">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-x-16 gap-y-10">
              
              {/* Employee Basic Info */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Department</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">HR Operations</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Designation</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">Team Member</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Joining Date</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">Jan 12, 2024</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Attendance Status</span>
                <div className="pt-1">
                  <span className={`${statusConfig.bg} ${statusConfig.text} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/10`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Timing Info */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Check-In Time</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">{employee.checkIn === '-' ? 'N/A' : employee.checkIn}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Check-Out Time</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">{employee.checkOut === '-' ? 'N/A' : employee.checkOut}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Working Hours</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">{employee.hours}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Today's Date</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Dividers & Text Sections */}
            <div className="mt-12 pt-10 border-t border-[#F4F3EF]">
              <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4">Daily Reason / Notes</span>
              <p className="text-[15px] font-medium text-[#6B6B7E] leading-relaxed italic">
                "Employee clocked in on-time and performed critical operations."
              </p>
            </div>

            <div className="mt-12 pt-10 border-t border-[#F4F3EF]">
              <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4">Additional Information</span>
              <p className="text-[15px] font-medium text-[#9B9BAD] leading-relaxed">
                No extra notes provided for this record. Information is synced with the bio-metric server.
              </p>
            </div>
          </div>
        </div>

        {/* Simplified Actions */}
        <div className="mt-10 flex justify-center">
          <button onClick={onBack} className="w-full max-w-md py-5 rounded-[24px] bg-white border-2 border-[#F4F3EF] text-[#6B6B7E] text-sm font-bold hover:bg-[#F4F3EF] transition-all">
            Close Details
          </button>
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

  // Fetch real attendance data from backend
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const params = {
          date: selectedDate,
          department: 'HR Operations' // Default department for this dashboard
        };
        const response = await getDeptAttendance(params);
        if (response.success && response.records) {
          const mappedData = response.records.map(record => {
            // Helper to map backend status to frontend keys
            const mapStatus = (status) => {
              if (!status) return 'absent';
              const s = status.toLowerCase();
              if (s.includes('present')) return 'present';
              if (s.includes('absent')) return 'absent';
              if (s.includes('half')) return 'halfday';
              if (s.includes('leave')) return 'leave';
              if (s.includes('wfh')) return 'present';
              return 'present';
            };

            // Helper to format check-in/out times safely
            const formatTime = (timeStr) => {
              if (!timeStr || timeStr === '-') return '-';
              try {
                // If it's already a time string like "09:00", return it
                if (typeof timeStr === 'string' && timeStr.length === 5 && timeStr.includes(':')) return timeStr;
                
                const d = new Date(timeStr);
                if (isNaN(d.getTime())) return '-';
                return d.toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: true 
                });
              } catch (e) {
                return '-';
              }
            };

            return {
              id: record.id,
              empId: record.memberId?.slice(0, 6) || 'EMP' + record.id.toString().slice(0, 3),
              name: record.memberName || 'Unknown Member',
              date: record.date,
              checkIn: formatTime(record.checkIn),
              checkOut: formatTime(record.checkOut),
              status: mapStatus(record.status),
              hours: record.workHours ? `${record.workHours}h` : '0h',
              overtime: '0h',
              avatar: record.memberName ? record.memberName.split(' ').map(n => n[0]).join('') : '??',
              photo: null
            };
          });
          setAttendanceData(mappedData);
        } else {
          setAttendanceData([]);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
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
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        label: 'Approved'
      },
      absent: {
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        text: 'text-rose-600 dark:text-rose-400',
        dot: 'bg-rose-500',
        label: 'Absent'
      },
      halfday: {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        label: 'Half Day'
      },
      leave: {
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
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

              <div className="text-left">
                <h2 className={`text-3xl font-bold tracking-tight mb-1 font-syne ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                  Attendance
                </h2>
                <div className="flex items-center gap-3 mt-1 text-left">
                  <p className={`text-sm font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-slate-500' : 'text-[#9B9BAD]'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
                    <FiUsers className="w-4 h-4" />
                    {selectedClient ? `Client: ${selectedClient}` : 'All Employees'}
                  </p>
                  <span className={`${isDarkMode ? 'text-slate-700' : 'text-[#F4F3EF]'}`}>|</span>
                  <p className={`text-sm font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-slate-500' : 'text-[#9B9BAD]'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
                    <FiCalendar className="w-4 h-4" />
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group flex items-center">
                <FiCalendar className="absolute right-5 w-4 h-4 text-white pointer-events-none z-10" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`flex items-center gap-2 pl-6 pr-12 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all shadow-lg active:scale-95 bg-[#0D47A1] text-white border-transparent hover:bg-[#0a3a82] shadow-blue-500/20 appearance-none`}
                  style={{ 
                    fontFamily: "'Calibri', sans-serif",
                    colorScheme: 'dark' // This helps making the native text white in some browsers
                  }}
                />
                <style dangerouslySetInnerHTML={{ __html: `
                  input[type="date"]::-webkit-calendar-picker-indicator {
                    opacity: 0;
                    cursor: pointer;
                  }
                `}} />
              </div>
            </div>
          </motion.div>



          {/* Modern Filters Unification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}
          >
            {/* Search Bar */}
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

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`text-xs font-bold uppercase tracking-wider rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="halfday">Half Day</option>
                <option value="leave">On Leave</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className={`text-xs font-bold uppercase tracking-wider rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
              >
                <option value="all">Departments</option>
                <option value="hr">HR Dept</option>
                <option value="it">IT Team</option>
                <option value="sales">Sales Hub</option>
                <option value="ops">Operations</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
            </div>
          </motion.div>

          {/* Modern Table Interface - Matched with Job Openings */}
          <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
            {/* Header Columns */}
            <div className={`grid grid-cols-[1fr_200px_200px_240px_40px] gap-8 px-10 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/20' : 'border-[#F4F3EF] bg-[#F8FAFF]/50'}`}>
              {["Employee", "Check In", "Check Out", "Status", ""].map((h, i) => (
                <div key={i} className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left flex items-start justify-start">
                  {h}
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {filteredData.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No matching records found</p>
                  </div>
                ) : (
                  filteredData.map((emp, index) => {
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
                          className={`grid grid-cols-[1fr_200px_200px_240px_40px] gap-8 items-center px-10 py-6 border-b last:border-0 cursor-pointer transition-all group relative ${
                            isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'
                          }`}
                        >
                          {/* Employee Info */}
                          <div className="flex items-center gap-4 min-w-0">
                            <div 
                              className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110 bg-[#F0F7FF]"
                              style={{ 
                                color: '#1B4DA0',
                                fontSize: '13px',
                                fontFamily: "'Calibri', sans-serif"
                              }}
                            >
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className={`text-[16px] font-bold truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-[#1A1A2E] group-hover:text-[#0D47A1]'}`}>
                                  {emp.name}
                                </p>
                                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5 truncate">{emp.empId}</p>
                            </div>
                          </div>

                          {/* Time Columns */}
                          <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                             <span className={`text-[15px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A2E]'}`}>
                               {emp.checkIn === '-' ? 'Not In' : emp.checkIn}
                             </span>
                          </div>

                          <div className="flex items-center gap-2">
                             <span className={`w-1.5 h-1.5 rounded-full ${emp.checkOut === '-' ? 'bg-slate-300' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></span>
                             <span className={`text-[15px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A2E]'}`}>
                               {emp.checkOut === '-' ? 'Not Out' : emp.checkOut}
                             </span>
                          </div>

                          {/* Status Pill */}
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border shadow-sm ${statusConfig.bg} ${statusConfig.text} ${isDarkMode ? 'border-transparent' : 'border-current/10'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusConfig.dot}`}></span>
                              {statusConfig.label}
                            </span>
                          </div>

                          {/* Arrow Right icon */}
                          <div className="flex justify-end pr-2">
                             <ChevronRight size={20} className={`transition-all ${isDarkMode ? 'text-slate-700 group-hover:text-blue-400' : 'text-[#C5C5D2] group-hover:text-[#0D47A1]'}`} />
                          </div>
                        </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Side Drawer for Employee Details */}
        <AnimatePresence>
          {selectedEmployee && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedEmployee(null)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
              />

              {/* Sliding Panel */}
              <motion.div
                key="drawer"
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className={`fixed inset-y-0 right-0 w-full sm:w-[600px] md:w-[750px] shadow-2xl z-[110] border-l flex flex-col overflow-hidden ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF]'
                }`}
              >
                <EmployeeDetailView
                  employee={selectedEmployee}
                  onBack={() => setSelectedEmployee(null)}
                  isDarkMode={isDarkMode}
                  getStatusConfig={getStatusConfig}
                  getAvatarColor={getAvatarColor}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};

export default AttendanceTab;
