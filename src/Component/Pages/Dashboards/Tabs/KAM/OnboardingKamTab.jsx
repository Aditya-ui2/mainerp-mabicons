import { useState, useEffect } from 'react';
import { FiUserPlus, FiCheckCircle, FiClock, FiFileText, FiPlus, FiSearch, FiChevronDown, FiCheck, FiArrowLeft, FiArrowRight, FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiHash, FiShield, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingFormView = ({ onBack, isDarkMode }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    position: '',
    roleType: '',
    jobTitle: '',
    client: '',
    experience: '',
    noticePeriod: '',
    currentCtc: '',
    expectedCtc: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Onboarding Initiated Successfully!');
    onBack();
  };

  const InputField = ({ label, name, type = "text", placeholder, options }) => (
    <div className="flex flex-col gap-3 text-center">
      <label className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {label} {['fullName', 'email', 'jobTitle', 'roleType'].includes(name) && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group w-full px-4">
        {options ? (
          <div className="relative">
            <select
              name={name}
              value={formData[name]}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className={`w-full appearance-none rounded-xl border px-6 py-3.5 transition-all outline-none font-medium text-center cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'
                }`}
              required={['roleType'].includes(name)}
            >
              <option value="">{placeholder}</option>
              {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            placeholder={placeholder}
            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            className={`w-full rounded-xl border px-6 py-3.5 transition-all outline-none font-medium text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'
              }`}
            required={['fullName', 'email', 'jobTitle'].includes(name)}
          />
        )}
      </div>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, color = "blue", isLast }) => (
    <div className={`col-span-full ${isLast ? 'mt-12' : 'mt-6'} mb-8`}>
      <div className="flex items-center gap-5 mb-5">
        <div className={`p-3.5 rounded-2xl ${color === 'blue' ? 'bg-[#3FA9F5]' : 'bg-[#22C55E]'} text-white shadow-xl shadow-opacity-20 flex items-center justify-center transition-transform hover:scale-110 duration-300`}>
          <Icon className="w-6 h-6 stroke-[3.5]" />
        </div>
        <h4 className="font-black text-base text-slate-800 dark:text-white tracking-widest uppercase">{title}</h4>
      </div>
      <div className={`h-[2px] w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-full`}></div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className={`w-full overflow-hidden rounded-[2rem] border-2 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
    >
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-blue-600 via-[#1E88E5] to-[#0D47A1] p-10 lg:p-12 relative overflow-hidden">
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
              <FiUserPlus className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-3xl font-black text-white tracking-tight">Add New Candidate</h2>
              <p className="text-blue-100/70 font-semibold text-xs uppercase tracking-[0.2em] mt-1">Fill in the candidate details below</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-10 lg:p-14">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {/* Section 1: Personal Details */}
          <SectionHeader icon={FiUser} title="Personal Details" />
          <InputField label="Full Name" name="fullName" placeholder="Enter full name" />
          <InputField label="Email" name="email" type="email" placeholder="Enter email" />
          <InputField label="Phone" name="phone" placeholder="+91 XXXXX XXXXX" />
          <InputField label="Location" name="location" placeholder="City" />

          {/* Section 2: Job Details */}
          <SectionHeader icon={FiBriefcase} title="Job Details" isLast={true} />
          <InputField
            label="Position/Job Opening"
            name="position"
            placeholder="Select Opening (Optional)"
            options={['Senior Developer', 'UI Designer', 'Project Manager']}
          />
          <InputField
            label="Role Type (Core Matching)"
            name="roleType"
            placeholder="Select Role Category"
            options={['Technical', 'Management', 'Operational']}
          />
          <InputField label="Display Job Title" name="jobTitle" placeholder="e.g., Senior Software Engineer" />
          <InputField label="Client" name="client" placeholder="Company name" />
          <InputField label="Experience" name="experience" placeholder="e.g., 5 years" />
          <InputField
            label="Notice Period"
            name="noticePeriod"
            placeholder="Select Notice Period"
            options={['Immediate', '15 days', '30 days', '60 days', '90 days']}
          />

          {/* Section 3: Compensation */}
          <SectionHeader icon={FiShield} title="Compensation" color="emerald" isLast={true} />
          <InputField label="Current CTC" name="currentCtc" placeholder="INR 0.00" />
          <InputField label="Expected CTC" name="expectedCtc" placeholder="INR 0.00" />

          {/* Footer Actions */}
          <div className="col-span-full mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onBack}
              className={`font-black text-sm transition-all hover:opacity-70 ${isDarkMode ? 'text-slate-400' : 'text-slate-800'
                }`}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-10 py-4 bg-gradient-to-r from-[#3FA9F5] to-[#1E88E5] text-white rounded-full font-bold shadow-[0_15px_40px_rgba(30,136,229,0.4)] hover:shadow-[0_20px_50px_rgba(30,136,229,0.5)] transition-all flex items-center gap-3"
            >
              <FiPlus className="w-5 h-5 stroke-[3]" />
              <span className="tracking-wide">Initiate Onboarding</span>
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const EmployeeOnboardingDetailView = ({ employee, onBack, isDarkMode, getStatusConfig, getAvatarColor }) => {
  const statusConfig = getStatusConfig(employee.status);

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
          className={`p-2.5 rounded-xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h2
          onClick={onBack}
          className="text-2xl font-bold bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity select-none"
        >
          Employee Onboarding Details
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Highlights */}
        <div className={`col-span-1 p-8 rounded-[2.5rem] border-2 shadow-xl flex flex-col items-center text-center relative overflow-hidden ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'
          }`}
        >
          <div className={`absolute -top-12 -right-12 w-32 h-32 opacity-10 blur-3xl rounded-full bg-gradient-to-br ${statusConfig.gradient}`}></div>

          <div className="relative mb-6">
            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-[#1E88E5] font-black text-7xl shadow-2xl border-4 border-slate-100 bg-white ring-8 ring-blue-50/50 transition-transform duration-500 hover:scale-105 uppercase`}>
              {(employee.name || '').trim().charAt(0)}
            </div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 bg-gradient-to-br ${statusConfig.gradient} text-white shadow-lg`}>
              <FiUserPlus className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-2xl font-black mb-1">{employee.name}</h3>
          <p className={`font-black tracking-widest text-xs uppercase mb-4 ${isDarkMode ? 'text-blue-400' : 'text-[#3FA9F5]'}`}>{employee.empId}</p>

          <div className={`w-full p-4 rounded-2xl border-2 mb-6 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.ring} ${statusConfig.border}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} animate-pulse ${statusConfig.glow}`}></span>
              {employee.status.replace('-', ' ')}
            </span>
          </div>

          <div className="w-full text-left space-y-4">
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Position & Department</span>
              <p className="font-bold">{employee.position} • {employee.department}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Official Email</span>
              <p className="font-bold text-blue-600">{employee.email}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Date of Joining</span>
              <p className="font-bold">{new Date(employee.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Task & Progress Analysis */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className={`p-8 rounded-[2.5rem] border-2 shadow-xl ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-end mb-8">
              <h4 className="font-black text-blue-600 flex items-center gap-2 uppercase tracking-widest text-xs">
                <FiCheckCircle className="w-4 h-4" /> Onboard Progress Tracking
              </h4>
              <span className="text-2xl font-black text-blue-600">{employee.progress}%</span>
            </div>

            <div className={`h-4 rounded-full overflow-hidden p-1 mb-10 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${employee.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]`}
              />
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Milestone Checklist</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.tasks.map((task, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${task.completed
                      ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20'
                      : isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {task.completed ? <FiCheck className="w-5 h-5" /> : <FiClock className="w-4 h-4" />}
                      </div>
                      <span className={`text-sm font-bold ${task.completed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {task.name}
                      </span>
                    </div>
                    {task.completed && <FiCheckCircle className="w-5 h-5 text-emerald-500" />}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 px-6 py-4 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
              Send Welcome Gift
            </button>
            <button className={`flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}>
              Document Repository
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const OnboardingKamTab = ({ isDarkMode, selectedClient }) => {
  const [view, setView] = useState('list'); // 'list', 'details', 'form'
  const [onboardingData, setOnboardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP007', name: 'Ravi Verma', email: 'ravi@company.com', position: 'Junior Developer', department: 'Engineering', joiningDate: '2026-03-20', status: 'in-progress', progress: 65, avatar: 'RV', photo: 'https://randomuser.me/api/portraits/men/22.jpg', tasks: [{ name: 'Documents Submitted', completed: true }, { name: 'ID Card Generated', completed: true }, { name: 'System Access', completed: true }, { name: 'Training Started', completed: false }, { name: 'Team Introduction', completed: false }] },
      { id: 2, empId: 'EMP008', name: 'Meena Kumari', email: 'meena@company.com', position: 'HR Executive', department: 'HR', joiningDate: '2026-03-22', status: 'pending', progress: 20, avatar: 'MK', photo: 'https://randomuser.me/api/portraits/women/26.jpg', tasks: [{ name: 'Documents Submitted', completed: true }, { name: 'ID Card Generated', completed: false }, { name: 'System Access', completed: false }, { name: 'Training Started', completed: false }, { name: 'Team Introduction', completed: false }] },
      { id: 3, empId: 'EMP009', name: 'Karan Singh', email: 'karan@company.com', position: 'Sales Manager', department: 'Sales', joiningDate: '2026-03-10', status: 'completed', progress: 100, avatar: 'KS', photo: 'https://randomuser.me/api/portraits/men/45.jpg', tasks: [{ name: 'Documents Submitted', completed: true }, { name: 'ID Card Generated', completed: true }, { name: 'System Access', completed: true }, { name: 'Training Started', completed: true }, { name: 'Team Introduction', completed: true }] },
    ];
    setTimeout(() => {
      setOnboardingData(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const statCards = [
    { key: 'total', label: 'Onboard Funnel', icon: FiUserPlus, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]', value: onboardingData.length, color: 'text-white' },
    { key: 'completed', label: 'Successfully Joined', icon: FiCheckCircle, gradient: 'from-[#81C784] via-[#66BB6A] to-[#43A047]', value: onboardingData.filter(e => e.status === 'completed').length, color: 'text-white' },
    { key: 'inProgress', label: 'Active Process', icon: FiClock, gradient: 'from-blue-600 to-blue-900', value: onboardingData.filter(e => e.status === 'in-progress').length, color: 'text-white' },
    { key: 'pending', label: 'Awaiting Action', icon: FiFileText, gradient: 'from-amber-400 via-orange-500 to-orange-600', value: onboardingData.filter(e => e.status === 'pending').length, color: 'text-white' },
  ];

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

  const getAvatarColor = (name) => {
    const colors = ['from-blue-600 to-indigo-900', 'from-[#3FA9F5] to-blue-700', 'from-cyan-500 to-blue-600', 'from-indigo-500 to-purple-700', 'from-teal-500 to-emerald-700'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredData = onboardingData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
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
            key="onboarding-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            className="space-y-8"
          >
            {/* Header / Navbar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/20 ring-4 ring-blue-500/10">
                    <FiUserPlus className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent tracking-tight">
                    Onboarding Dashboard
                  </h2>
                </div>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'} tracking-wide ml-1`}>
                  Initiate and track new employee onboarding progress
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('form')}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all uppercase tracking-widest text-xs mt-1"
              >
                <FiPlus className="w-5 h-5" />
                New Onboarding
              </motion.button>
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global</span>
                      </div>
                    </div>

                    <div className={`mt-4 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-white/50'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: hoveredCard === stat.key ? '100%' : '30%' }}
                        transition={{ duration: 0.4 }}
                        className={`h-full bg-gradient-to-r ${stat.gradient}`}
                      />
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
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1 group">
                <FiSearch className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors group-focus-within:text-blue-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <input
                  type="text"
                  placeholder="Search and initiate new talent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-[1.5rem] border-2 px-6 py-4 pl-14 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-100 shadow-sm placeholder:text-slate-300'
                    }`}
                />
              </div>
              <div className="relative group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`appearance-none rounded-[1.5rem] border-2 px-8 py-4 pr-14 font-extrabold cursor-pointer transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm'
                    }`}
                >
                  <option value="all">Select One</option>
                  <option value="pending">Pending Review</option>
                  <option value="in-progress">Actively Joining</option>
                  <option value="completed">Successfully Integrated</option>
                </select>
                <FiChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
            </motion.div>

            {/* Onboarding List */}
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
                      transition={{ delay: index * 1.1, type: "spring", stiffness: 100, damping: 15 }}
                      whileHover={{ y: -8, shadow: "0 40px 60px -20px rgba(0,0,0,0.2)" }}
                      onClick={() => { setSelectedEmployee(emp); setView('details'); }}
                      className={`group relative overflow-hidden rounded-[3rem] border-2 transition-all duration-500 cursor-pointer ${isDarkMode ? 'bg-slate-900/40 border-slate-800/80 hover:border-blue-500/40' : 'bg-white border-slate-100/80 hover:border-blue-200 hover:shadow-2xl'
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
                              <h3 className="font-black text-3xl tracking-tight mb-2 group-hover:text-blue-500 transition-colors uppercase">{emp.name}</h3>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                  {emp.empId}
                                </span>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{emp.position}</span>
                              </div>
                            </div>
                          </div>

                          {/* Progress & Task Preview */}
                          <div className="flex-1 max-w-2xl lg:px-6">
                            <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                <span className={`text-[10px] font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Process Milestone</span>
                                <span className="text-xs font-black group-hover:text-blue-500 transition-colors uppercase">{emp.progress}% Completed</span>
                              </div>
                              <div className={`h-2.5 rounded-full overflow-hidden p-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${emp.progress}%` }}
                                  transition={{ duration: 1.5, delay: 0.5 + (index * 0.1) }}
                                  className="h-full rounded-full bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2 mt-4">
                                {emp.tasks.slice(0, 3).map((task, tidx) => (
                                  <span key={tidx} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${task.completed ? 'bg-emerald-100/50 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {task.name}
                                  </span>
                                ))}
                                {emp.tasks.length > 3 && <span className="text-[10px] font-bold text-slate-400 flex items-center">+{emp.tasks.length - 3} more</span>}
                              </div>
                            </div>
                          </div>

                          {/* Action & Status */}
                          <div className="flex flex-row lg:flex-col items-center justify-between gap-8 lg:min-w-[220px] pt-10 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100/50 dark:border-slate-800/50 lg:pl-10">
                            <div className="text-center lg:text-right w-full">
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
          <EmployeeOnboardingDetailView
            key="onboarding-detail"
            employee={selectedEmployee}
            onBack={() => { setSelectedEmployee(null); setView('list'); }}
            isDarkMode={isDarkMode}
            getStatusConfig={getStatusConfig}
            getAvatarColor={getAvatarColor}
          />
        ) : (
          <OnboardingFormView
            key="onboarding-form"
            onBack={() => setView('list')}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingKamTab;
