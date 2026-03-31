import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCheck, FiX, FiPlus, FiSearch, FiDownload, FiChevronDown, FiSun, FiMoon, FiCoffee, FiAward, FiTrendingUp, FiArrowLeft, FiSend, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ApplyLeaveView = ({ onBack, onSubmit, isDarkMode }) => {
  const [leaveMode, setLeaveMode] = useState('Full Day');

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
          Apply New Leave
        </h2>
      </div>

      <div className={`max-w-4xl mx-auto p-8 rounded-3xl border-2 shadow-xl ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100'
        }`}
      >
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 text-center">
              <label className={`block text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Leave Type
              </label>
              <div className="relative">
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <select className={`w-full appearance-none rounded-2xl border-2 px-5 py-4 font-medium transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Earned Leave</option>
                  <option>Compensatory Off</option>
                  <option>Maternity/Paternity Leave</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 text-center">
              <label className={`block text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Leave Mode
              </label>
              <div className={`flex gap-4 p-1 rounded-2xl border-2 transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                <button 
                  type="button" 
                  onClick={() => setLeaveMode('Full Day')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    leaveMode === 'Full Day' 
                      ? 'bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1] text-white shadow-lg' 
                      : `${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`
                  }`}
                >
                  Full Day
                </button>
                <button 
                  type="button" 
                  onClick={() => setLeaveMode('Half Day')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    leaveMode === 'Half Day' 
                      ? 'bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1] text-white shadow-lg' 
                      : `${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`
                  }`}
                >
                  Half Day
                </button>
              </div>
            </div>

            <div className="space-y-3 text-center">
              <label className={`block text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                From Date
              </label>
              <input 
                type="date" 
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className={`w-full rounded-2xl border-2 px-5 py-4 font-medium transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`} 
              />
            </div>

            <div className="space-y-3 text-center">
              <label className={`block text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                To Date
              </label>
              <input 
                type="date" 
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className={`w-full rounded-2xl border-2 px-5 py-4 font-medium transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`} 
              />
            </div>
          </div>

          <div className="space-y-3 text-center">
            <label className={`block text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Reason for Leave
            </label>
            <textarea 
              rows={4} 
              className={`w-full rounded-2xl border-2 px-5 py-4 font-medium transition-all focus:ring-4 focus:ring-blue-500/10 outline-none resize-none ${
                isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`} 
              placeholder="Please provide a clear reason for your leave request..." 
            />
          </div>

          <div className="flex gap-4 pt-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button" 
              onClick={onBack} 
              className={`flex-1 px-8 py-4 rounded-2xl font-bold border-2 transition-all ${
                isDarkMode ? 'border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              Discard Request
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="flex-[1.5] px-8 py-4 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
            >
              <FiSend className="w-5 h-5" />
              Submit Application
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const EmployeeDetailsView = ({ employee, onBack, isDarkMode }) => {
  if (!employee) return null;

  const leaveBalanceMock = [
    { type: 'Sick', total: 12, used: 3, remaining: 9, icon: FiSun, gradient: 'from-rose-600 to-pink-700' },
    { type: 'Casual', total: 12, used: 5, remaining: 7, icon: FiCoffee, gradient: 'from-amber-500 to-orange-600' },
    { type: 'Earned', total: 15, used: 2, remaining: 13, icon: FiAward, gradient: 'from-emerald-600 to-teal-800' },
  ];

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
          Employee Details
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Column: Profile Card */}
        <div className={`lg:col-span-1 p-8 rounded-3xl border-2 shadow-xl flex flex-col items-center text-center space-y-6 ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100'
        }`}>
          <div className="relative">
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br from-[#3FA9F5] to-[#0D47A1] flex items-center justify-center text-white text-5xl font-black shadow-2xl ring-4 ring-white`}>
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-emerald-500 text-white shadow-lg ring-4 ring-white">
              <FiCheck className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight">{employee.name}</h3>
            <p className="text-blue-500 font-bold tracking-widest text-xs uppercase">{employee.empId}</p>
          </div>

          <div className="w-full pt-6 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Department</span>
              <span>HR Operations</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Designation</span>
              <span>Team Member</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Joining Date</span>
              <span>Jan 12, 2024</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Leave Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Request Card */}
          <div className={`p-8 rounded-3xl border-2 shadow-xl space-y-6 ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100'
          }`}>
            <h4 className="text-lg font-black flex items-center gap-2">
              <FiFileText className="text-blue-500" />
              Current Leave Request
            </h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Type</p>
                <p className="text-base font-bold text-slate-700">{employee.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                <p className="text-base font-bold text-slate-700">{employee.from} to {employee.to}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</p>
                <p className="text-base font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">"{employee.reason}"</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6">
            {leaveBalanceMock.map((leave, idx) => (
              <div key={idx} className={`p-5 rounded-3xl border-2 shadow-lg transition-all hover:-translate-y-1 ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${leave.gradient} text-white`}>
                    <leave.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{leave.type}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black">{leave.remaining}</span>
                  <span className="text-[10px] font-bold text-slate-400">Days Bal.</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
             <button 
              onClick={onBack}
              className={`flex-1 px-8 py-4 rounded-2xl font-bold border-2 transition-all ${
                isDarkMode ? 'border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              Close Details
            </button>
            <button className="flex-[1.5] px-8 py-4 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-bold shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
              Update Information
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LeaveManagementTab = ({ isDarkMode, selectedClient }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'apply', 'details'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP001', name: 'Rahul Sharma', type: 'Sick Leave', from: '2026-03-18', to: '2026-03-19', days: 2, reason: 'Fever and cold', status: 'pending', appliedOn: '2026-03-16', avatar: 'RS', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, empId: 'EMP002', name: 'Priya Singh', type: 'Casual Leave', from: '2026-03-20', to: '2026-03-20', days: 1, reason: 'Personal work', status: 'approved', appliedOn: '2026-03-15', avatar: 'PS', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, empId: 'EMP003', name: 'Amit Kumar', type: 'Earned Leave', from: '2026-03-25', to: '2026-03-28', days: 4, reason: 'Family vacation', status: 'pending', appliedOn: '2026-03-16', avatar: 'AK', photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 4, empId: 'EMP004', name: 'Sneha Patel', type: 'Maternity Leave', from: '2026-04-01', to: '2026-06-30', days: 90, reason: 'Maternity', status: 'approved', appliedOn: '2026-03-10', avatar: 'SP', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 5, empId: 'EMP005', name: 'Vikram Rao', type: 'Compensatory Off', from: '2026-03-22', to: '2026-03-22', days: 1, reason: 'Worked on weekend', status: 'rejected', appliedOn: '2026-03-14', avatar: 'VR', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
    ];
    setTimeout(() => {
      setLeaveRequests(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const leaveBalance = [
    { type: 'Sick', total: 12, used: 3, remaining: 9, icon: FiSun, gradient: 'from-rose-600 to-pink-700', lightBg: 'bg-gradient-to-br from-rose-50 to-pink-50', iconColor: 'text-rose-600' },
    { type: 'Casual', total: 12, used: 5, remaining: 7, icon: FiCoffee, gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50', iconColor: 'text-amber-600' },
    { type: 'Earned', total: 15, used: 2, remaining: 13, icon: FiAward, gradient: 'from-emerald-600 to-teal-800', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-100', iconColor: 'text-emerald-600' },
    { type: 'Comp Off', total: 4, used: 1, remaining: 3, icon: FiMoon, gradient: 'from-[#3FA9F5] to-[#0D47A1]', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-100', iconColor: 'text-blue-600' },
  ];

  const stats = {
    pending: leaveRequests.filter(l => l.status === 'pending').length,
    approved: leaveRequests.filter(l => l.status === 'approved').length,
    rejected: leaveRequests.filter(l => l.status === 'rejected').length,
  };

  const getStatusConfig = (status = '') => {
    const s = status.toLowerCase();
    const config = {
      pending: { bg: 'bg-amber-100/80 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Pending' },
      approved: { bg: 'bg-green-100/80 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-600', label: 'Approved' },
      rejected: { bg: 'bg-red-100/80 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-600', label: 'Rejected' },
    };
    return config[s] || config.pending;
  };

   const getAvatarColor = (name = 'E') => {
    const colors = [
      { bg: '#2563eb', grad: 'from-blue-600 to-indigo-900' },
      { bg: '#059669', grad: 'from-emerald-600 to-teal-900' },
      { bg: '#7c3aed', grad: 'from-violet-600 to-purple-900' },
      { bg: '#e11d48', grad: 'from-rose-600 to-pink-900' },
      { bg: '#d97706', grad: 'from-amber-600 to-orange-900' }
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const handleAction = (id, action) => {
    setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
  };

  const filteredData = leaveRequests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) || req.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="leave-list-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: -50, transition: { duration: 0.2 } }}
            className="space-y-8"
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 text-left">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-lg shadow-[#1E88E5]/25">
                    <FiCalendar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent underline underline-offset-8">
                    Leave Management Dashboard
                  </h2>
                </div>
                <p className={`text-base font-semibold mt-4 ml-2 tracking-wide text-left ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'} flex items-center gap-2`}>
                  Manage employee leave requests
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('apply')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-bold shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                <FiPlus className="w-5 h-5" />
                Apply Leave
              </motion.button>
            </motion.div>

            {/* Leave Balance Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {leaveBalance.map((leave, index) => (
                <motion.div
                  key={leave.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredCard(leave.type)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer border-2 ${
                    isDarkMode 
                      ? 'bg-slate-800/80 border-slate-700/50' 
                      : `${leave.lightBg} border-white/50 shadow-sm hover:shadow-xl`
                  } ${hoveredCard === leave.type ? 'scale-[1.02] border-blue-200 dark:border-blue-800' : ''}`}
                >
                  <div className="relative text-left">
                    <div className="flex items-center justify-between mb-4">
                      <p className={`text-xs font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{leave.type} Leave</p>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                      <span className={`text-4xl font-extrabold bg-gradient-to-r ${leave.gradient} bg-clip-text text-transparent drop-shadow-md`} style={{ color: leave.type === 'Sick' ? '#e11d48' : leave.type === 'Casual' ? '#d97706' : leave.type === 'Earned' ? '#059669' : '#2563eb' }}>
                        {leave.remaining}
                      </span>
                      <span className={`text-sm pb-1 font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>/ {leave.total}</span>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(leave.remaining / leave.total) * 100}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${leave.gradient}`}
                      />
                    </div>
                    <p className={`text-xs mt-3 font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{leave.used} days used this year</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Request Stats summary cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-6"
            >
              <div className={`p-6 rounded-3xl text-center border-2 transition-all hover:shadow-lg ${isDarkMode ? 'bg-amber-900/10 border-amber-900/20' : 'bg-amber-50 border-amber-200'}`}>
                <p className="text-5xl font-extrabold text-[#FFB300] mb-1 drop-shadow-sm">{stats.pending}</p>
                <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Pending Requests</p>
              </div>
              <div className={`p-6 rounded-3xl text-center border-2 transition-all hover:shadow-lg ${isDarkMode ? 'bg-emerald-900/10 border-emerald-900/20' : 'bg-green-50 border-green-200'}`}>
                <p className="text-5xl font-extrabold text-[#2E7D32] mb-1 drop-shadow-sm">{stats.approved}</p>
                <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-green-700'}`}>Approved</p>
              </div>
              <div className={`p-6 rounded-3xl text-center border-2 transition-all hover:shadow-lg ${isDarkMode ? 'bg-rose-900/10 border-rose-900/20' : 'bg-red-50 border-red-200'}`}>
                <p className="text-5xl font-extrabold text-[#D32F2F] mb-1 drop-shadow-sm">{stats.rejected}</p>
                <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-rose-400' : 'text-red-700'}`}>Rejected</p>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col md:flex-row items-center gap-4"
            >
              <div className="relative flex-1 max-w-4xl">
                <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search leave requests by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-2xl border-2 px-4 py-4 pl-12 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'
                  }`}
                />
              </div>
              <div className="relative min-w-[200px]">
                <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`w-full appearance-none rounded-2xl border-2 px-6 py-4 pr-12 font-bold cursor-pointer transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="all">All Request Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </motion.div>

            {/* Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-3xl border-2 overflow-hidden shadow-2xl ${
                isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-50 to-slate-100/50'}`}>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Employee</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Leave Type</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Duration</th>
                      <th className="px-8 py-6 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Days</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Reason</th>
                      <th className="px-8 py-6 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Status</th>
                      <th className="px-8 py-6 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                    <AnimatePresence>
                      {filteredData.map((req, index) => {
                        const statusConfig = getStatusConfig(req.status);
                        const avatarTheme = getAvatarColor(req.name);
                        return (
                          <motion.tr 
                            key={req.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group transition-all cursor-pointer ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-blue-50/50'}`}
                            onClick={() => {
                              setSelectedEmployee(req);
                              setView('details');
                            }}
                          >
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div 
                                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarTheme.grad} flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-white`}
                                      style={{ backgroundColor: avatarTheme.bg }}
                                    >
                                      {req.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div>
                                  <p className="font-bold text-base">{req.name}</p>
                                  <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{req.empId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide ${isDarkMode ? 'bg-violet-900/30 text-violet-400' : 'bg-violet-50 text-violet-700'}`}>
                                {req.type}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2 text-sm font-bold">
                                <FiCalendar className={`w-4 h-4 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                                    {new Date(req.from).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - {new Date(req.to).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl font-extrabold text-sm ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                {req.days}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                                <p className={`text-sm font-medium max-w-[200px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{req.reason}</p>
                            </td>
                             <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                               <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black ${statusConfig.bg} ${statusConfig.text} uppercase tracking-widest shadow-sm ring-1 ring-inset ${statusConfig.text === 'text-green-700' ? 'ring-green-600/20' : statusConfig.text === 'text-red-700' ? 'ring-red-600/20' : 'ring-amber-600/20'}`}>
                                 <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} animate-pulse shadow-sm`}></span>
                                 {statusConfig.label}
                               </span>
                             </td>
                            <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                              {req.status.toLowerCase() === 'pending' ? (
                                <div className="flex items-center justify-center gap-3">
                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAction(req.id, 'approved');
                                    }}
                                    className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                  >
                                    <FiCheck className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAction(req.id, 'rejected');
                                    }}
                                    className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              ) : (
                                <div className="flex justify-center text-slate-400 italic text-xs font-bold">Processed</div>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className={`px-8 py-5 border-t ${isDarkMode ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Total <span className="text-blue-600 dark:text-blue-400">{filteredData.length}</span> leave requests found
                    </p>
                    <div className="flex gap-2">
                        <FiFileText className="w-4 h-4 text-[#3FA9F5]" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Record System</span>
                    </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : view === 'apply' ? (
          <ApplyLeaveView 
            onBack={() => setView('list')} 
            onSubmit={() => setView('list')} 
            isDarkMode={isDarkMode} 
          />
        ) : (
          <EmployeeDetailsView 
            employee={selectedEmployee}
            onBack={() => setView('list')}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaveManagementTab;
