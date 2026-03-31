import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiCalendar, FiTrendingUp, FiFileText, FiSearch, FiChevronDown, FiUsers, FiX, FiPrinter, FiCheckCircle, FiLoader, FiAlertCircle, FiArrowLeft, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Rupee Icon
const RupeeIcon = ({ className }) => (
  <span className={`font-bold ${className}`} style={{ fontFamily: 'Arial, sans-serif' }}>₹</span>
);

const EmployeePayrollDetailView = ({ employee, onBack, isDarkMode, getStatusConfig, getAvatarColor, formatCurrency, formatDate }) => {
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
          Employee Payroll Details
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
          <p className={`font-semibold text-lg ${isDarkMode ? 'text-blue-400' : 'text-[#3FA9F5]'}`}>{employee.empId}</p>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{employee.designation}</p>
          
          <div className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.text}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
            {statusConfig.label}
          </div>

          <div className={`w-full h-px my-6 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

          <div className="w-full text-left space-y-4">
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Payroll Period</span>
                <div className="flex items-center gap-2 font-bold text-blue-600">
                  <FiCalendar className="w-4 h-4" />
                  {formatDate(new Date().toISOString().slice(0, 10))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Earnings Type</span>
                <div className="flex items-center gap-2 font-medium">
                  <FiActivity className="w-4 h-4 text-emerald-500" />
                  Standard Monthly Cycle
                </div>
              </div>
          </div>
        </div>

        {/* Financial Details Grid */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className={`p-8 rounded-2xl border-2 shadow-xl ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h4 className="font-extrabold text-emerald-600 mb-6 flex items-center gap-2 uppercase tracking-wide text-xs">
                        <FiTrendingUp className="w-4 h-4" /> Earnings Breakdown
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm"><span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Basic Salary</span><span className="font-bold">{formatCurrency(employee.basic)}</span></div>
                        <div className="flex justify-between text-sm"><span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>HRA</span><span className="font-bold">{formatCurrency(employee.hra)}</span></div>
                        <div className="flex justify-between text-sm"><span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Allowances</span><span className="font-bold">{formatCurrency(employee.allowances)}</span></div>
                        <div className={`flex justify-between font-extrabold pt-4 border-t ${isDarkMode ? 'border-emerald-900/30' : 'border-emerald-200'}`}>
                            <span className="text-emerald-700 dark:text-emerald-400">Gross Amount</span>
                            <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(employee.basic + employee.hra + employee.allowances)}</span>
                        </div>
                    </div>
                </div>

                {/* Deductions */}
                <div className={`p-8 rounded-2xl border-2 shadow-xl ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h4 className="font-extrabold text-rose-600 mb-6 flex items-center gap-2 uppercase tracking-wide text-xs">
                        <RupeeIcon className="w-4 h-4" /> Deductions Breakdown
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm"><span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Provident Fund (PF)</span><span className="font-bold text-rose-500">{formatCurrency(employee.deductions * 0.5)}</span></div>
                        <div className="flex justify-between text-sm"><span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Income Tax (TDS)</span><span className="font-bold text-rose-500">{formatCurrency(employee.deductions * 0.3)}</span></div>
                        <div className="flex justify-between text-sm"><span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Professional Tax</span><span className="font-bold text-rose-500">{formatCurrency(employee.deductions * 0.2)}</span></div>
                        <div className={`flex justify-between font-extrabold pt-4 border-t ${isDarkMode ? 'border-rose-900/30' : 'border-rose-200'}`}>
                            <span className="text-rose-700 dark:text-rose-400">Total Deductions</span>
                            <span className="text-rose-700 dark:text-rose-400">{formatCurrency(employee.deductions)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Pay Highlight */}
            <div className={`p-8 rounded-2xl bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/20`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">Final Net Payable</span>
                    <p className="text-sm text-white/60 mt-1 italic">Calculated electronically for this cycle</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <span className="font-extrabold text-5xl whitespace-nowrap text-white">
                        {formatCurrency(employee.netPay)}
                    </span>
                    <button className="px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-bold flex items-center gap-2 transition-all border border-white/20">
                        <FiPrinter className="w-5 h-5" />
                        Print Payslip
                    </button>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

const PayrollProcessingModal = ({ isOpen, onClose, onComplete, totalEmployees, totalAmount, isDarkMode }) => {
  const [stage, setStage] = useState('summary'); // summary, processing, success
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage === 'processing') {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => setStage('success'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
      return () => clearInterval(timer);
    }
  }, [stage]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-hidden relative ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}
      >
        <AnimatePresence mode="wait">
          {stage === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiFileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Run Payroll Summary</h3>
              <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Review the payroll details for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} before processing.</p>
              
              <div className={`grid grid-cols-2 gap-4 mb-8 text-left`}>
                <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Staff</p>
                  <p className="text-xl font-bold">{totalEmployees} Employees</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Payable</p>
                  <p className="text-xl font-bold text-blue-600">₹{totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className={`flex-1 py-3.5 rounded-xl font-bold border-2 ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setStage('processing')}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1] text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                  Confirm & Run
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center py-8"
            >
              <div className="relative w-32 h-32 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64" cy="64" r="60"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-700"
                  />
                  <motion.circle
                    cx="64" cy="64" r="60"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * progress) / 100}
                    className="text-blue-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{progress}%</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Calculating Salaries...</h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Generating digital payslips and updating balances</p>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-blue-600 font-medium animate-pulse">
                <FiLoader className="animate-spin" />
                Processing request...
              </div>
            </motion.div>
          )}

          {stage === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </motion.div>
              </div>
              <h3 className="text-3xl font-bold mb-2 text-green-600">Success!</h3>
              <p className={`mb-8 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Payroll has been processed for all employees.</p>
              
              <div className={`p-5 rounded-2xl mb-8 border-2 border-dashed ${isDarkMode ? 'border-green-900/30 bg-green-900/10' : 'border-green-100 bg-green-50'}`}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500">Processing Time:</span>
                  <span className="font-bold">2.4 Seconds</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-green-600">All Completed</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:bg-green-700 transition-all"
              >
                Great, thanks!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const PayrollTab = ({ isDarkMode, selectedClient }) => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayslip, setShowPayslip] = useState(null);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP001', name: 'Rahul Sharma', designation: 'Software Engineer', basic: 50000, hra: 20000, allowances: 10000, deductions: 8000, netPay: 72000, status: 'processed', avatar: 'RS', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, empId: 'EMP002', name: 'Priya Singh', designation: 'HR Manager', basic: 45000, hra: 18000, allowances: 8000, deductions: 7100, netPay: 63900, status: 'processed', avatar: 'PS', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, empId: 'EMP003', name: 'Amit Kumar', designation: 'Sales Executive', basic: 35000, hra: 14000, allowances: 7000, deductions: 5600, netPay: 50400, status: 'pending', avatar: 'AK', photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 4, empId: 'EMP004', name: 'Sneha Patel', designation: 'Accountant', basic: 40000, hra: 16000, allowances: 8000, deductions: 6400, netPay: 57600, status: 'processed', avatar: 'SP', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 5, empId: 'EMP005', name: 'Vikram Rao', designation: 'Team Lead', basic: 60000, hra: 24000, allowances: 12000, deductions: 9600, netPay: 86400, status: 'pending', avatar: 'VR', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
    ];
    setTimeout(() => {
      setPayrollData(mockData);
      setLoading(false);
    }, 500);
  }, [selectedDate, selectedClient]);

  const totals = payrollData.reduce((acc, emp) => ({
    basic: acc.basic + emp.basic,
    hra: acc.hra + emp.hra,
    allowances: acc.allowances + emp.allowances,
    deductions: acc.deductions + emp.deductions,
    netPay: acc.netPay + emp.netPay,
  }), { basic: 0, hra: 0, allowances: 0, deductions: 0, netPay: 0 });

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const statCards = [
    { key: 'basic', label: 'Total Basic', value: totals.basic, icon: RupeeIcon, gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50', textColor: 'text-blue-600' },
    { key: 'hra', label: 'Total HRA', value: totals.hra, icon: FiTrendingUp, gradient: 'from-cyan-500 to-blue-600', lightBg: 'bg-gradient-to-br from-cyan-50 to-blue-50', textColor: 'text-cyan-600' },
    { key: 'allowances', label: 'Allowances', value: totals.allowances, icon: FiCalendar, gradient: 'from-indigo-500 to-purple-600', lightBg: 'bg-gradient-to-br from-indigo-50 to-purple-50', textColor: 'text-indigo-600' },
    { key: 'deductions', label: 'Deductions', value: totals.deductions, icon: RupeeIcon, gradient: 'from-red-500 to-pink-600', lightBg: 'bg-gradient-to-br from-red-50 to-pink-50', isNegative: true, textColor: 'text-red-500' },
    { key: 'netPay', label: 'Net Payable', value: totals.netPay, icon: RupeeIcon, gradient: 'from-[#3FA9F5] to-[#0D47A1]', lightBg: 'bg-gradient-to-br from-blue-50 to-blue-100', isPrimary: true, textColor: 'text-blue-700' },
  ];

  const getStatusConfig = (status) => {
    const config = {
      processed: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        dot: 'bg-green-500',
        label: 'Processed'
      },
      pending: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
        label: 'Pending'
      }
    };
    return config[status] || config.processed;
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

  const filteredData = payrollData.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handlePayrollComplete = () => {
    setPayrollData(prev => prev.map(emp => ({ ...emp, status: 'processed' })));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {!selectedEmployee ? (
          <motion.div
            key="payroll-list-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 1, x: -50, transition: { duration: 0.2 } }}
            className="space-y-8"
          >
            <AnimatePresence>
                {isProcessingModalOpen && (
                <PayrollProcessingModal
                    isOpen={isProcessingModalOpen}
                    onClose={() => setIsProcessingModalOpen(false)}
                    onComplete={handlePayrollComplete}
                    totalEmployees={payrollData.length}
                    totalAmount={totals.netPay}
                    isDarkMode={isDarkMode}
                />
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
                <div>
                <div className="flex items-center gap-3 text-left">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-lg shadow-[#1E88E5]/25">
                    <RupeeIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent">
                    Payroll Management
                    </h2>
                </div>
                <p className={`text-base font-semibold mt-4 ml-2 tracking-wide text-left ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'} flex items-center gap-2`}>
                    <FiCalendar className="w-4 h-4" />
                    {formatDate(selectedDate)} • {payrollData.length} Employees
                </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/50 ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
                    }`}
                />
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsProcessingModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-xl font-medium shadow-lg shadow-[#1E88E5]/25"
                >
                    <FiFileText className="w-4 h-4" />
                    Run Payroll
                </motion.button>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
                        ? 'bg-slate-800/80 border border-slate-700/50' 
                        : `${card.lightBg} border border-white/50 hover:shadow-xl`
                    } ${hoveredCard === card.key ? 'scale-[1.02]' : ''}`}
                >
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="80" cy="20" r="40" fill="currentColor" />
                    </svg>
                    </div>
                    <div className="relative flex items-start justify-between">
                    <div className="flex-1 min-w-0 text-left">
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{card.label}</p>
                        <p className={`text-xl lg:text-2xl font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {card.isNegative ? '-' : ''}{formatCurrency(card.value)}
                        </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg flex-shrink-0`}>
                        <card.icon className="w-4 h-4 text-white" />
                    </div>
                    </div>
                </motion.div>
                ))}
            </div>

            {/* Search & Filters */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col md:flex-row items-center gap-4"
            >
                <div className="relative flex-1 max-w-4xl">
                <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                    type="text"
                    placeholder="Search employee by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-[#3FA9F5]/30 ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'
                    }`}
                />
                </div>
                
                <div className="relative min-w-[200px]">
                <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <select
                    className={`w-full appearance-none rounded-xl border-2 px-4 py-3 pr-10 transition-all focus:ring-2 focus:ring-[#3FA9F5]/30 cursor-pointer font-medium ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                >
                    <option value="all">All Departments</option>
                    <option value="it">IT & Development</option>
                    <option value="hr">Human Resources</option>
                    <option value="sales">Sales & Marketing</option>
                    <option value="finance">Finance & Accounts</option>
                </select>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-2xl border-2 overflow-hidden shadow-xl ${
                isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200/50'
                }`}
            >
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className={`${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-50 to-slate-100'}`}>
                        <th className="px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Employee</th>
                        <th className="px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Designation</th>
                        <th className="px-6 py-4 text-right text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Basic</th>
                        <th className="px-6 py-4 text-right text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">HRA</th>
                        <th className="px-6 py-4 text-right text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Allowances</th>
                        <th className="px-6 py-4 text-right text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Deductions</th>
                        <th className="px-6 py-4 text-right text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Net Pay</th>
                        <th className="px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</th>
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
                            className={`group cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-blue-50/50'}`}
                            >
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                    {emp.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold">{emp.name}</p>
                                    <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{emp.empId}</p>
                                </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{emp.designation}</td>
                            <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(emp.basic)}</td>
                            <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(emp.hra)}</td>
                            <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(emp.allowances)}</td>
                            <td className="px-6 py-4 text-sm text-right font-medium text-rose-500">-{formatCurrency(emp.deductions)}</td>
                            <td className="px-6 py-4 text-sm text-right font-bold text-blue-600">{formatCurrency(emp.netPay)}</td>
                            <td className="px-6 py-4 text-center">
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
                    Showing <span className="font-semibold">{filteredData.length}</span> employees
                    </p>
                    <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Total Payable: <span className="text-blue-600 font-bold">{formatCurrency(totals.netPay)}</span>
                    </span>
                    </div>
                </div>
                </div>
            </motion.div>
          </motion.div>
        ) : (
          <EmployeePayrollDetailView 
            key="payroll-detail-view"
            employee={selectedEmployee} 
            onBack={() => setSelectedEmployee(null)} 
            isDarkMode={isDarkMode} 
            getStatusConfig={getStatusConfig}
            getAvatarColor={getAvatarColor}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>

      {/* Payslip Modal (Keep as fallback or for table actions if needed) */}
      <AnimatePresence>
        {showPayslip && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPayslip(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(showPayslip.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white/10`}>
                    {showPayslip.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{showPayslip.name}</h3>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-[#3FA9F5]'}`}>{showPayslip.empId} • {showPayslip.designation}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPayslip(null)} 
                  className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Pay Period */}
              <div className={`px-6 py-4 rounded-2xl mb-8 flex items-center justify-between ${isDarkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                 <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-blue-500" />
                    <span className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pay Period</span>
                 </div>
                 <span className="font-bold text-blue-600">{formatDate(selectedDate)}</span>
              </div>

              {/* Earnings & Deductions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-emerald-900/10 border border-emerald-900/20' : 'bg-emerald-50/50 border border-emerald-100'}`}>
                  <h4 className="font-extrabold text-emerald-600 mb-6 flex items-center gap-2 uppercase tracking-wide text-xs">
                    <FiTrendingUp className="w-4 h-4" /> Earnings
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Basic Salary</span><span className="font-bold">{formatCurrency(showPayslip.basic)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">HRA</span><span className="font-bold">{formatCurrency(showPayslip.hra)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Allowances</span><span className="font-bold">{formatCurrency(showPayslip.allowances)}</span></div>
                    <div className={`flex justify-between font-extrabold pt-4 border-t ${isDarkMode ? 'border-emerald-900/30' : 'border-emerald-200'}`}>
                      <span className="text-emerald-700 dark:text-emerald-400">Gross Amount</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(showPayslip.basic + showPayslip.hra + showPayslip.allowances)}</span>
                    </div>
                  </div>
                </div>
                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-rose-900/10 border border-rose-900/20' : 'bg-rose-50/50 border border-rose-100'}`}>
                  <h4 className="font-extrabold text-rose-600 mb-6 flex items-center gap-2 uppercase tracking-wide text-xs">
                    <RupeeIcon className="w-4 h-4" /> Deductions
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Provident Fund (PF)</span><span className="font-bold text-rose-500">{formatCurrency(showPayslip.deductions * 0.5)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Income Tax (TDS)</span><span className="font-bold text-rose-500">{formatCurrency(showPayslip.deductions * 0.3)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Professional Tax</span><span className="font-bold text-rose-500">{formatCurrency(showPayslip.deductions * 0.2)}</span></div>
                    <div className={`flex justify-between font-extrabold pt-4 border-t ${isDarkMode ? 'border-rose-900/30' : 'border-rose-200'}`}>
                      <span className="text-rose-700 dark:text-rose-400">Total Deductions</span>
                      <span className="text-rose-700 dark:text-rose-400">{formatCurrency(showPayslip.deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className={`p-6 rounded-2xl mb-8 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20`}>
                <div className="flex justify-between items-center text-white">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">Net Payable Amount</span>
                    <p className="text-sm text-white/60 mt-1 italic">Electronically calculated for {formatDate(selectedDate)}</p>
                  </div>
                  <span className="font-extrabold text-4xl whitespace-nowrap">
                    {formatCurrency(showPayslip.netPay)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPayslip(null)} 
                  className={`flex-1 px-6 py-4 rounded-xl font-bold border-2 transition-all ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  Close
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-[1.5] px-6 py-4 bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1] text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                >
                  <FiPrinter className="w-5 h-5" />
                  Print Payslip
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayrollTab;
