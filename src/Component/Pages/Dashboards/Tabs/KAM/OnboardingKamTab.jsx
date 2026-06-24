

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiUserPlus, FiCheckCircle, FiClock, FiFileText, FiPlus, FiSearch, FiChevronDown, FiCheck, FiArrowLeft, FiArrowRight, FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiHash, FiShield, FiActivity } from 'react-icons/fi';
import { Search, ChevronDown, Plus, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingFormView = ({ onBack, isDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Basic Information', 'Employee Position', 'Statutory Info', 'Payment Mode'];

  const [formData, setFormData] = useState({
    // Stage 1
    employeeNumberSeries: '',
    employeeNo: '',
    name: '',
    dateOfBirth: '',
    aadhaarNumber: '',
    gender: '',
    reportingManager: '',
    status: '',
    dateOfJoining: '',
    referredBy: '',
    probationPeriod: '',
    confirmationDate: '',
    email: '',
    mobileNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    fathersName: '',
    spouseName: '',
    // Stage 2
    position: '',
    department: '',
    roleType: '',
    noticePeriod: '',
    // Stage 3
    panNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',
    // Stage 4
    paymentMode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Onboarding Initiated Successfully!');
    onBack();
  };

  const InputField = ({ label, name, type = "text", placeholder, options }) => (
    <div className="flex flex-col gap-2 text-left">
      <label className={`text-[11px] font-bold uppercase tracking-wider text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {label} {['name', 'email', 'employeeNo', 'roleType'].includes(name) && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group w-full">
        {options ? (
          <div className="relative">
            <select
              name={name}
              value={formData[name]}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className={`w-full appearance-none rounded-xl border px-4 py-3 transition-all outline-none font-medium text-left cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'
                }`}
              required={['roleType'].includes(name)}
            >
              <option value="">{placeholder}</option>
              {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            placeholder={placeholder}
            onChange={(e) => {
              let val = e.target.value;
              if (name === 'panNumber') {
                val = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
              } else if (['mobileNumber', 'emergencyContactNumber'].includes(name)) {
                val = val.replace(/\D/g, '').slice(0, 10);
              }
              setFormData({ ...formData, [e.target.name]: val });
            }}
            className={`w-full rounded-xl border px-4 py-3 transition-all outline-none font-medium text-left ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'
              }`}
            required={['name', 'email', 'employeeNo'].includes(name)}
          />
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in slide-in-from-bottom-8 duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 border-b border-[#F4F3EF] px-10 py-6 flex items-center justify-between z-20 bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            New Candidate Onboarding
          </h3>
          <p className="text-[#6B6B7E] text-sm font-medium">Step {currentStep + 1} of {steps.length}: {steps[currentStep]}</p>
        </div>
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        {/* Stepper */}
        <div className="flex justify-between items-center mb-10 relative px-4">
          <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0 rounded-full">
            <div className="h-full bg-[#0D47A1] rounded-full transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
          </div>
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 border-white ${currentStep >= index ? 'bg-[#0D47A1] text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200 text-slate-500'}`}>
                {index < currentStep ? <FiCheck size={16} /> : index + 1}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider absolute top-12 whitespace-nowrap ${currentStep >= index ? 'text-[#0D47A1]' : 'text-slate-400'}`}>{step}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left mt-8">
          
          {currentStep === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-6">
                <InputField label="Employee Number Series" name="employeeNumberSeries" placeholder="---Select---" options={['Default Series', 'Contractor Series']} />
                <InputField label="Employee No" name="employeeNo" placeholder="Enter employee no" />
                <InputField label="Name" name="name" placeholder="Enter full name" />
                <InputField label="Date Of Birth" name="dateOfBirth" type="date" placeholder="Select date" />
                <InputField label="Aadhaar Number" name="aadhaarNumber" placeholder="Enter Aadhaar number" />
                <InputField label="Gender" name="gender" placeholder="---Select---" options={['Male', 'Female', 'Others']} />
                <InputField label="Reporting Manager" name="reportingManager" placeholder="---Select---" options={['Manager 1', 'Manager 2']} />
                <InputField label="Status" name="status" placeholder="---Select---" options={['Active', 'Inactive', 'On Hold']} />
                <InputField label="Date Of Joining" name="dateOfJoining" type="date" placeholder="Select date" />
                <InputField label="Referred By" name="referredBy" placeholder="---Select---" options={['Employee 1', 'Employee 2']} />
              </div>
              <div className="space-y-6">
                <InputField label="Probation Period (Days)" name="probationPeriod" type="number" placeholder="Enter days" />
                <InputField label="Confirmation Date" name="confirmationDate" type="date" placeholder="Select date" />
                <InputField label="Email" name="email" type="email" placeholder="Enter email address" />
                <InputField label="Mobile Number" name="mobileNumber" placeholder="Enter mobile number" />
                <InputField label="Emergency Contact Name" name="emergencyContactName" placeholder="Enter name" />
                <InputField label="Emergency Contact Number" name="emergencyContactNumber" placeholder="Enter number" />
                <InputField label="Father's name" name="fathersName" placeholder="Enter father's name" />
                <InputField label="Spouse Name" name="spouseName" placeholder="Enter spouse name" />
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <InputField label="Position" name="position" placeholder="Select Position" options={['Senior Developer', 'UI Designer', 'Project Manager']} />
              <InputField label="Department" name="department" placeholder="Enter Department" />
              <InputField label="Role Type" name="roleType" placeholder="Select Role" options={['Technical', 'Management', 'Operational']} />
              <InputField label="Notice Period" name="noticePeriod" placeholder="Select Notice Period" options={['Immediate', '15 days', '30 days', '60 days', '90 days']} />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <InputField label="PAN Number" name="panNumber" placeholder="Enter PAN number" />
              <InputField label="UAN Number" name="uanNumber" placeholder="Enter UAN number" />
              <InputField label="PF Number" name="pfNumber" placeholder="Enter PF number" />
              <InputField label="ESI Number" name="esiNumber" placeholder="Enter ESI number" />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <InputField label="Payment Mode" name="paymentMode" placeholder="Select Payment Mode" options={['Bank Transfer', 'Cheque', 'Cash']} />
              <InputField label="Bank Name" name="bankName" placeholder="Enter Bank Name" />
              <InputField label="Account Number" name="accountNumber" placeholder="Enter Account Number" />
              <InputField label="IFSC Code" name="ifscCode" placeholder="Enter IFSC Code" />
            </motion.div>
          )}

          <div className="flex gap-4 pt-12">
            {currentStep > 0 ? (
              <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 py-4 rounded-xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Back</button>
            ) : (
              <button type="button" onClick={onBack} className="flex-1 py-4 rounded-xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</button>
            )}

            {currentStep < steps.length - 1 ? (
              <button type="button" onClick={() => setCurrentStep(prev => prev + 1)} className="flex-[2] bg-[#0D47A1] text-white py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all">
                Next Step
              </button>
            ) : (
              <button type="submit" className="flex-[2] bg-emerald-600 text-white py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                Initiate Onboarding
              </button>
            )}
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
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex flex-col h-full bg-white relative animate-in fade-in slide-in-from-right duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <FiUserPlus className="text-[#0D47A1]" size={22} />
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Onboarding Tracker</h3>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 p-10 bg-[#FAFAF8] overflow-y-auto">
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
          <motion.div
            key="onboarding-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            className="space-y-8"
          >
            {/* Modern Header (Matched with Screenshot) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8 flex-wrap gap-4"
            >
              <div className="text-left flex items-center gap-4">
                <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Onboarding
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('form')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D47A1] text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0a3a82] transition-all active:scale-95"
                >
                  <Plus size={18} /> New Onboarding
                </button>
              </div>
            </motion.div>

            {/* Modern Search & Filters Unification */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className="relative flex-1 group min-w-[200px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search candidates by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD] ${isDarkMode ? 'bg-slate-800 text-white focus:ring-2 focus:ring-slate-700' : 'bg-[#F4F3EF] text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF]'}`}
                />
              </div>
              <div className="relative group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`text-[11px] font-black uppercase tracking-widest rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[200px] transition-all hover:bg-[#EEF2FB] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
                >
                  <option value="all">ALL STATUS</option>
                  <option value="pending">PENDING</option>
                  <option value="in-progress">IN PROGRESS</option>
                  <option value="completed">COMPLETED</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
              </div>
            </motion.div>

            {/* Modern Table Interface */}
            <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              {/* Header Columns */}
              <div className={`grid grid-cols-[1.5fr_180px_180px_200px_40px] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
                {["Candidate", "Department & Role", "Joining Date", "Status", ""].map((h, i) => (
                  <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
                    {h}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <AnimatePresence mode="popLayout">
                  {filteredData.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No candidates found</p>
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
                          onClick={() => { setSelectedEmployee(emp); setView('details'); }}
                          className={`grid grid-cols-[1.5fr_180px_180px_200px_40px] gap-4 items-center px-8 py-3 border-b last:border-0 cursor-pointer transition-all group relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'}`}
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
                            <p className="text-[11px] font-medium text-[#9B9BAD]">{emp.position}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] font-bold text-[#6B6B7E]">
                              {new Date(emp.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-left">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.text}`}>
                                  {emp.status.replace('-', ' ')}
                                </span>
                                <span className="text-[10px] font-bold text-[#9B9BAD]">{emp.progress}%</span>
                              </div>
                              <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-[#F4F3EF]'}`}>
                                <div className="h-full bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1]" style={{ width: `${emp.progress}%` }}></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end pr-2">
                            <ChevronRight size={20} className={`transition-all ${isDarkMode ? 'text-slate-700' : 'text-[#C5C5D2] group-hover:text-[#0D47A1]'}`} />
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
      </AnimatePresence>
      {/* Portaled Drawers */}
      {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
              {(view === 'details' || view === 'form') && (
                <motion.div
                  key="shared-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setSelectedEmployee(null); setView('list'); }}
                  className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
                />
              )}

              {view === 'form' && (
                <div className="fixed inset-0 z-[1101] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
                  <div className="w-full max-w-2xl pointer-events-auto flex items-center justify-center">
                    <OnboardingFormView onBack={() => setView('list')} isDarkMode={isDarkMode} />
                  </div>
                </div>
              )}

              {view === 'details' && selectedEmployee && (
                <motion.div
                  initial={{ x: '100%', opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0.5 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] shadow-2xl z-[1101] border-l bg-white border-[#F4F3EF] overflow-hidden"
                >
                  <EmployeeOnboardingDetailView
                    key="onboarding-detail"
                    employee={selectedEmployee}
                    onBack={() => { setSelectedEmployee(null); setView('list'); }}
                    isDarkMode={isDarkMode}
                    getStatusConfig={getStatusConfig}
                    getAvatarColor={getAvatarColor}
                  />
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
    </div>
  );
};

export default OnboardingKamTab;