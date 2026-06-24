
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiUserMinus, FiCheckCircle, FiClock, FiFileText, FiPlus, FiSearch, FiChevronDown, FiCheck, FiArrowLeft, FiArrowRight, FiUser, FiMail, FiCalendar, FiActivity, FiBriefcase, FiAlertTriangle, FiInfo, FiTrash2 } from 'react-icons/fi';
import { Search, ChevronDown, Plus, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeOffboardingDetailView = ({ employee, onBack, isDarkMode, getStatusConfig }) => {
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
          <FiUserMinus className="text-[#0D47A1]" size={22} />
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Offboarding Tracker</h3>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 p-10 bg-[#FAFAF8] overflow-y-auto">
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
        <div className="col-span-1 lg:col-span-2 space-y-8 mt-6">
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
              <div className="flex flex-col gap-4">
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Resignation Details', 'Exit', 'Asset Recovery', 'Final Settlement'];

  const [formData, setFormData] = useState({
    // Stage 1
    employeeName: '',
    employeeId: '',
    department: '',
    resignationDate: '',
    lastWorkingDay: '',
    noticePeriodServed: '',
    reasonForExit: '',
    // Stage 2
    primaryReason: '',
    experienceRating: '',
    managerFeedback: '',
    recommend: '',
    newEmployer: '',
    // Stage 3
    laptopReturned: '',
    idCardReturned: '',
    systemAccessRevoked: '',
    emailDeactivated: '',
    // Stage 4
    leaveEncashment: '',
    pendingDues: '',
    recoveryAmount: '',
    fnfStatus: '',
    paymentMode: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Offboarding Initiated Successfully!');
    onBack();
  };

  const InputField = ({ label, name, type = "text", placeholder, options }) => (
    <div className="flex flex-col gap-2 text-left">
      <label className={`text-[11px] font-bold uppercase tracking-wider text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {label} {['employeeName', 'employeeId', 'resignationDate', 'lastWorkingDay'].includes(name) && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group w-full">
        {options ? (
          <div className="relative">
            <select
              name={name}
              value={formData[name]}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className={`w-full appearance-none rounded-xl border px-4 py-3 transition-all outline-none font-medium text-left cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'}`}
              required={['noticePeriodServed'].includes(name)}
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
            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            className={`w-full rounded-xl border px-4 py-3 transition-all outline-none font-medium text-left ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'}`}
            required={['employeeName', 'employeeId', 'resignationDate', 'lastWorkingDay'].includes(name)}
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
            Initiate Employee Exit
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
                <InputField label="Employee Name" name="employeeName" placeholder="Enter employee name" />
                <InputField label="Employee ID" name="employeeId" placeholder="Enter employee ID" />
                <InputField label="Department" name="department" placeholder="Enter department" />
                <InputField label="Reason for Exit" name="reasonForExit" placeholder="---Select---" options={['Better Opportunity', 'Relocation', 'Personal Reasons', 'Higher Education', 'Other']} />
              </div>
              <div className="space-y-6">
                <InputField label="Resignation Date" name="resignationDate" type="date" placeholder="Select date" />
                <InputField label="Last Working Day" name="lastWorkingDay" type="date" placeholder="Select date" />
                <InputField label="Notice Period Served" name="noticePeriodServed" placeholder="---Select---" options={['Yes', 'No', 'Partial']} />
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <InputField label="Primary Reason for Leaving" name="primaryReason" placeholder="Enter reason" />
              <InputField label="Overall Experience Rating" name="experienceRating" placeholder="---Select---" options={['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent']} />
              <InputField label="Feedback for Manager" name="managerFeedback" placeholder="Enter feedback" />
              <InputField label="Would you recommend us?" name="recommend" placeholder="---Select---" options={['Yes', 'No']} />
              <div className="col-span-full">
                <InputField label="New Employer (Optional)" name="newEmployer" placeholder="Enter new employer" />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <InputField label="Laptop Returned" name="laptopReturned" placeholder="---Select---" options={['Pending', 'Returned', 'Not Applicable']} />
              <InputField label="ID Card & Access Card" name="idCardReturned" placeholder="---Select---" options={['Pending', 'Returned', 'Not Applicable']} />
              <InputField label="System Access Revoked" name="systemAccessRevoked" placeholder="---Select---" options={['Pending', 'Revoked']} />
              <InputField label="Email ID Deactivated" name="emailDeactivated" placeholder="---Select---" options={['Pending', 'Deactivated']} />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <InputField label="Leave Encashment (Days)" name="leaveEncashment" type="number" placeholder="Enter days" />
              <InputField label="Pending Dues Amount" name="pendingDues" type="number" placeholder="Enter amount" />
              <InputField label="Recovery Amount" name="recoveryAmount" type="number" placeholder="Enter amount" />
              <InputField label="FnF Status" name="fnfStatus" placeholder="---Select---" options={['Pending', 'Processing', 'Cleared']} />
              <div className="col-span-full">
                <InputField label="Preferred Payment Mode" name="paymentMode" placeholder="---Select---" options={['Bank Transfer', 'Cheque']} />
              </div>
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
              <button type="submit" className="flex-[2] bg-rose-600 text-white py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                Initiate Offboarding
              </button>
            )}
          </div>
        </form>
      </div>
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
      { id: 1, empId: 'EMP010', name: 'Rajesh Khanna', email: 'rajesh@company.com', department: 'Engineering', resignationDate: '2026-02-15', lastWorkingDay: '2026-03-15', reason: 'Better opportunity', status: 'in-progress', progress: 70, checklist: [{ task: 'Resignation Accepted', done: true }, { task: 'Exit', done: true }, { task: 'Knowledge Transfer', done: true }, { task: 'Asset Return', done: false }, { task: 'Final Settlement', done: false }] },
      { id: 2, empId: 'EMP011', name: 'Suman Devi', email: 'suman@company.com', department: 'Marketing', resignationDate: '2026-03-01', lastWorkingDay: '2026-03-31', reason: 'Personal reasons', status: 'pending', progress: 40, checklist: [{ task: 'Resignation Accepted', done: true }, { task: 'Exit', done: true }, { task: 'Knowledge Transfer', done: false }, { task: 'Asset Return', done: false }, { task: 'Final Settlement', done: false }] },
      { id: 3, empId: 'EMP012', name: 'Anil Kapoor', email: 'anil@company.com', department: 'Sales', resignationDate: '2026-01-10', lastWorkingDay: '2026-02-10', reason: 'Relocation', status: 'completed', progress: 100, checklist: [{ task: 'Resignation Accepted', done: true }, { task: 'Exit', done: true }, { task: 'Knowledge Transfer', done: true }, { task: 'Asset Return', done: true }, { task: 'Final Settlement', done: true }] },
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
        <motion.div
          key="offboarding-list"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
          className="space-y-10"
        >
          {/* Modern Header (Matched with Onboarding Style) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 flex-wrap gap-4"
          >
            <div className="text-left flex items-center gap-4">
              <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                Offboarding
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('form')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D47A1] text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0a3a82] transition-all active:scale-95"
              >
                <Plus size={18} /> Initiate Offboarding
              </button>
            </div>
          </motion.div>

          {/* Modern Search & Filters Unification */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
            <div className="relative flex-1 group min-w-[200px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Identify exit profiles..."
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
                <option value="all">Global Exits</option>
                <option value="pending">Awaiting Paperwork</option>
                <option value="in-progress">In Clearance</option>
                <option value="completed">Successfully Exit</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
            </div>
          </motion.div>

          {/* Modern Table Interface */}
          <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
            <div className={`grid grid-cols-[1.5fr_180px_180px_200px_40px] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
              {["Employee", "Department", "Last Working Day", "Clearance", ""].map((h, i) => (
                <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
                  {h}
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {filteredData.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No profiles found</p>
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
                          <p className="text-[11px] font-medium text-[#9B9BAD]">Exit Initiated</p>
                        </div>
                        <div className="text-left">
                          <p className="text-[13px] font-bold text-[#6B6B7E]">
                            {new Date(emp.lastWorkingDay).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                <OffboardingFormView onBack={() => setView('list')} isDarkMode={isDarkMode} />
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
              <EmployeeOffboardingDetailView
                key="offboarding-detail"
                employee={selectedEmployee}
                onBack={() => { setSelectedEmployee(null); setView('list'); }}
                isDarkMode={isDarkMode}
                getStatusConfig={getStatusConfig}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default OffboardingTab;