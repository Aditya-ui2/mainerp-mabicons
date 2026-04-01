import { useState, useEffect } from 'react';
import { FiUserMinus, FiCheckCircle, FiClock, FiFileText, FiPlus, FiSearch, FiChevronDown, FiCheck, FiArrowLeft, FiArrowRight, FiUser, FiMail, FiCalendar, FiActivity, FiBriefcase, FiAlertTriangle, FiInfo, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeOffboardingDetailView = ({ employee, onBack, isDarkMode, getStatusConfig }) => {
  const statusConfig = getStatusConfig(employee.status);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      className={`w-full ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      <div className="flex items-center gap-4 mb-10 text-left">
        <button
          onClick={onBack}
          className={`p-2.5 rounded-xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 onClick={onBack} className="text-2xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity select-none">
            Employee Exit Details
          </h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'}`}>Full clearance and offboarding overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className={`col-span-1 p-8 rounded-[3rem] border-2 shadow-2xl flex flex-col items-center text-center relative overflow-hidden ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className={`absolute -top-12 -right-12 w-32 h-32 opacity-10 blur-3xl rounded-full bg-gradient-to-br ${statusConfig.gradient}`}></div>

          <div className="relative mb-6">
            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-[#1E88E5] font-black text-7xl shadow-2xl border-4 border-slate-100 bg-white ring-8 ring-blue-50/50 transition-transform duration-500 hover:scale-105 uppercase`}>
              {(employee.name || '').trim().charAt(0)}
            </div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 bg-gradient-to-br ${statusConfig.gradient} text-white shadow-lg`}>
              <FiUserMinus className="w-5 h-5" />
            </div>
          </div>



          <h3 className="text-2xl font-black mb-1 uppercase tracking-tight">{employee.name}</h3>
          <p className={`font-black tracking-[0.2em] text-[10px] mb-6 ${isDarkMode ? 'text-blue-400' : 'text-[#3FA9F5]'}`}>{employee.empId}</p>

          <div className="w-full p-4 rounded-[2rem] border-2 mb-8 flex flex-col items-center gap-4">
            <span className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.ring} ${statusConfig.border}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} animate-pulse ${statusConfig.glow}`}></span>
              {employee.status.replace('-', ' ')}
            </span>
          </div>

          <div className="w-full text-left space-y-5 px-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</span>
              <p className="font-bold text-sm tracking-tight">{employee.department}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Official Email</span>
              <p className="font-bold text-sm text-blue-600 truncate">{employee.email}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resignation Date</span>
              <p className="font-bold text-sm tracking-tight text-blue-500">{new Date(employee.resignationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Working Day</span>
              <p className="font-bold text-sm tracking-tight text-blue-600 underline decoration-2 underline-offset-4">{new Date(employee.lastWorkingDay).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Exit Progress & Tasks */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <div className={`p-10 rounded-[3rem] border-2 shadow-2xl ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-end mb-10">
              <div className="flex flex-col gap-2">
                <h4 className="font-black text-blue-600 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <FiActivity className="w-4 h-4" /> Clearance Progress
                </h4>
                <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-[#1E88E5]'}`}>Final settlement and asset recovery status</p>
              </div>
              <span className="text-3xl font-black text-blue-600">{employee.progress}%</span>
            </div>

            <div className={`h-4 rounded-full overflow-hidden p-1 mb-12 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${employee.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-lg shadow-blue-500/20`}
              />
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Offboarding Checklist</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.checklist.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${item.done
                      ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20'
                      : isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center transition-transform group-hover:rotate-6 ${item.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {item.done ? <FiCheckCircle className="w-6 h-6" /> : <FiClock className="w-5 h-5" />}
                      </div>
                      <span className={`text-sm font-black tracking-tight ${item.done ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {item.task}
                      </span>
                    </div>
                    {item.done && <FiCheck className="w-5 h-5 text-emerald-500" />}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 px-8 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3">
              Generate Exit Report
              <FiFileText className="w-5 h-5" />
            </button>
            <button className={`flex-1 px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border-2 transition-all ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}>
              Internal Knowledge Handover
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const OffboardingFormView = ({ onBack, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    email: '',
    department: '',
    resignationDate: '',
    lastWorkingDay: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Offboarding Initiation Successful!');
    onBack();
  };

  const InputField = ({ icon: Icon, label, name, type = "text", placeholder }) => (
    <div className="flex flex-col gap-3">
      <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        {label}
      </label>
      <div className="relative group">
        <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-600 group-focus-within:text-[#1E88E5]' : 'text-slate-300 group-focus-within:text-[#1E88E5]'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          placeholder={placeholder}
          className={`w-full rounded-2xl border-2 px-6 py-4 pl-14 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none font-bold ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-100 shadow-sm placeholder:text-slate-300'
            }`}
          required
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      className={`w-full ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      <div className="flex items-center gap-4 mb-10 text-left">
        <button
          onClick={onBack}
          className={`p-2.5 rounded-xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent">
            Initiate Employee Exit
          </h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-[#1E88E5]'}`}>Formal resignation and process initiation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className={`p-10 lg:p-14 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] blur-3xl rounded-full bg-gradient-to-br from-[#3FA9F5] to-[#0D47A1]"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            <div className="col-span-full border-l-4 border-[#1E88E5] pl-5 py-2 mb-4">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-[#1E88E5]">Employee Details</h4>
            </div>
            <InputField icon={FiUser} label="Employee Name" name="name" placeholder="Search employee..." />
            <InputField icon={FiMail} label="Official Email" name="email" type="email" placeholder="rahul@company.com" />
            <InputField icon={FiBriefcase} label="Department" name="department" placeholder="e.g. Sales" />

            <div className="col-span-full border-l-4 border-[#1E88E5] pl-5 mt-6 py-2 mb-4">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-[#1E88E5]">Exit Timeline</h4>
            </div>
            <InputField icon={FiCalendar} label="Resignation Date" name="resignationDate" type="date" />
            <InputField icon={FiCalendar} label="Last Working Day" name="lastWorkingDay" type="date" />
            <InputField icon={FiInfo} label="Reason for Exit" name="reason" placeholder="e.g. Higher Studies" />
          </div>

          <div className="mt-16 flex flex-col sm:flex-row items-center gap-6 border-t border-slate-100 dark:border-slate-800 pt-10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-3"
            >
              Start Exit Process
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
            <button
              type="button"
              onClick={onBack}
              className={`w-full sm:w-auto px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs border-2 transition-all ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
            >
              Cancel Process
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

const OffboardingTab = ({ isDarkMode, selectedClient }) => {
  const [view, setView] = useState('list'); // 'list', 'details', 'form'
  const [offboardingData, setOffboardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP010', name: 'Rajesh Khanna', email: 'rajesh@company.com', department: 'Engineering', resignationDate: '2026-02-15', lastWorkingDay: '2026-03-15', reason: 'Better opportunity', status: 'in-progress', progress: 70, checklist: [{ task: 'Resignation Accepted', done: true }, { task: 'Exit Interview', done: true }, { task: 'Knowledge Transfer', done: true }, { task: 'Asset Return', done: false }, { task: 'Final Settlement', done: false }] },
      { id: 2, empId: 'EMP011', name: 'Suman Devi', email: 'suman@company.com', department: 'Marketing', resignationDate: '2026-03-01', lastWorkingDay: '2026-03-31', reason: 'Personal reasons', status: 'pending', progress: 40, checklist: [{ task: 'Resignation Accepted', done: true }, { task: 'Exit Interview', done: true }, { task: 'Knowledge Transfer', done: false }, { task: 'Asset Return', done: false }, { task: 'Final Settlement', done: false }] },
      { id: 3, empId: 'EMP012', name: 'Anil Kapoor', email: 'anil@company.com', department: 'Sales', resignationDate: '2026-01-10', lastWorkingDay: '2026-02-10', reason: 'Relocation', status: 'completed', progress: 100, checklist: [{ task: 'Resignation Accepted', done: true }, { task: 'Exit Interview', done: true }, { task: 'Knowledge Transfer', done: true }, { task: 'Asset Return', done: true }, { task: 'Final Settlement', done: true }] },
    ];
    setTimeout(() => {
      setOffboardingData(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const getStatusConfig = (status) => {
    const configs = {
      'completed': {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-teal-500',
        ring: 'ring-4 ring-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-900/50',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]'
      },
      'in-progress': {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        gradient: 'from-blue-500 to-indigo-500',
        ring: 'ring-4 ring-blue-500/10',
        border: 'border-blue-200 dark:border-blue-900/50',
        glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]'
      },
      'pending': {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        gradient: 'from-amber-500 to-orange-500',
        ring: 'ring-4 ring-amber-500/10',
        border: 'border-amber-200 dark:border-amber-900/50',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]'
      },
    };
    return configs[status] || configs.pending;
  };

  const statCards = [
    { key: 'total', label: 'Total Exits', value: offboardingData.length, icon: FiUserMinus, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]' },
    { key: 'completed', label: 'Completed Exits', value: offboardingData.filter(e => e.status === 'completed').length, icon: FiCheckCircle, gradient: 'from-[#81C784] via-[#66BB6A] to-[#43A047]' },
    { key: 'inProgress', label: 'In Clearance', value: offboardingData.filter(e => e.status === 'in-progress').length, icon: FiClock, gradient: 'from-blue-600 to-blue-900' },
    { key: 'pending', label: 'Awaiting Action', value: offboardingData.filter(e => e.status === 'pending').length, icon: FiAlertTriangle, gradient: 'from-amber-400 via-orange-500 to-orange-600' },
  ];

  const filteredData = offboardingData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
    <div className={`space-y-10 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="offboarding-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            className="space-y-10"
          >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/10">
                    <FiUserMinus className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent tracking-tight">
                    Offboarding Portal
                  </h2>
                </div>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'} tracking-wide ml-1`}>
                  Manage formal employee exits and clearance processes
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('form')}
                className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all uppercase tracking-widest text-xs mt-1"
              >
                <FiPlus className="w-5 h-5" />
                Initiate Offboarding
              </motion.button>
            </div>

            {/* Stats */}
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Process</span>
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <FiSearch className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors group-focus-within:text-blue-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <input
                  type="text"
                  placeholder="Identify exit profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-[1.5rem] border-2 px-6 py-4 pl-14 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none font-bold ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-100 shadow-sm placeholder:text-slate-300'
                    }`}
                />
              </div>
              <div className="relative group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`appearance-none rounded-[1.5rem] border-2 px-10 py-4 pr-16 font-black uppercase tracking-widest text-[10px] cursor-pointer transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm'
                    }`}
                >
                  <option value="all">Global Exits</option>
                  <option value="pending">Awaiting Paperwork</option>
                  <option value="in-progress">In Clearance</option>
                  <option value="completed">Successfully Exit</option>
                </select>
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-8 pb-12">
              <AnimatePresence>
                {filteredData.map((emp, index) => {
                  const statusConfig = getStatusConfig(emp.status);
                  return (
                    <motion.div
                      key={emp.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 15 }}
                      whileHover={{ y: -8, shadow: "0 40px 60px -20px rgba(0,0,0,0.2)" }}
                      onClick={() => { setSelectedEmployee(emp); setView('details'); }}
                      className={`group relative overflow-hidden rounded-[3rem] border-2 transition-all duration-500 cursor-pointer ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:border-blue-500/40' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-2xl'
                        }`}
                    >
                      <div className={`absolute top-0 right-0 w-64 h-64 opacity-[0.03] group-hover:opacity-10 blur-3xl rounded-full bg-gradient-to-br transition-opacity duration-700 ${statusConfig.gradient}`}></div>

                      <div className="p-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                          {/* Profile */}
                          <div className="flex items-center gap-8">
                            <motion.div className={`w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center text-[#1E88E5] font-black text-5xl shadow-xl border border-slate-100 group-hover:scale-105 transition-transform duration-300 uppercase`}>
                              {(emp.name || '').trim().charAt(0)}
                            </motion.div>
                            <div>
                              <h3 className="font-black text-3xl tracking-tight mb-2 group-hover:text-[#1E88E5] transition-colors uppercase">{emp.name}</h3>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                  {emp.empId}
                                </span>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{emp.department}</span>
                              </div>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="flex-1 max-w-2xl lg:px-6">
                            <div className="space-y-5">
                              <div className="flex justify-between items-end">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Clearance Phase</span>
                                <span className="text-xs font-black group-hover:text-blue-600 transition-colors uppercase">{emp.progress}% Finalized</span>
                              </div>
                              <div className={`h-2.5 rounded-full overflow-hidden p-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${emp.progress}%` }}
                                  transition={{ duration: 1.5, delay: 0.5 + (index * 0.1) }}
                                  className="h-full rounded-full bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-md"
                                />
                              </div>
                              <div className="flex flex-wrap gap-4 mt-4">
                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <FiCalendar className="text-[#1E88E5]" /> LWD: {new Date(emp.lastWorkingDay).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[200px]">
                                  <FiMail className="text-[#1E88E5]" /> {emp.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="flex flex-row lg:flex-row items-center justify-between gap-8 pt-10 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100/50 dark:border-slate-800/50 lg:pl-10">
                            <div className="text-center lg:text-right">
                              <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.ring} ${statusConfig.border}`}>
                                <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} animate-pulse ${statusConfig.glow}`}></span>
                                {emp.status}
                              </span>
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
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : view === 'details' ? (
          <EmployeeOffboardingDetailView
            key="offboarding-detail"
            employee={selectedEmployee}
            onBack={() => { setSelectedEmployee(null); setView('list'); }}
            isDarkMode={isDarkMode}
            getStatusConfig={getStatusConfig}
          />
        ) : (
          <OffboardingFormView
            key="offboarding-form"
            onBack={() => setView('list')}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OffboardingTab;
