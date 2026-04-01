import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiCalendar, FiTrendingUp, FiFileText, FiSearch, FiChevronDown, FiUsers, FiX, FiPrinter, FiCheckCircle, FiLoader, FiAlertCircle, FiArrowLeft, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalISODate } from '../../../Utilities/dateUtils';

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
                  {formatDate(getLocalISODate())}
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

const PayrollRunView = ({ onBack, onComplete, totalEmployees, totalAmount, isDarkMode, formatDate, formatCurrency }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      className={`w-full ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-10 text-left">
        <button
          onClick={onBack}
          className={`p-2.5 rounded-xl transition-all shadow-sm ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 
            onClick={onBack}
            className="text-2xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity select-none"
          >
            Execute Payroll Cycle
          </h2>
          <p className={`text-[10px] font-bold tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'}`}>
            Final Auditory and Settlement Cycle
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-10 lg:p-14 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] blur-3xl rounded-full bg-gradient-to-br from-[#3FA9F5] to-[#0D47A1]"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-12 border-l-4 border-blue-600 pl-6 py-2">
                <FiFileText className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <h3 className="text-xl font-black tracking-tight">Run Summary</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest">Verify Before Final Processing</p>
                </div>
              </div>

              {/* Horizontal Form Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className={`p-8 rounded-3xl border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-white shadow-sm'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Payroll Cycle</p>
                  <p className="text-xl font-black text-blue-600">{formatDate(new Date().toISOString())}</p>
                </div>
                <div className={`p-8 rounded-3xl border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-white shadow-sm'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Headcount</p>
                  <p className="text-xl font-black">{totalEmployees} Staff Member</p>
                </div>
                <div className={`p-8 rounded-3xl border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-white shadow-md'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Settlement</p>
                  <p className="text-3xl font-black text-[#0D47A1] tracking-tighter">{formatCurrency(totalAmount)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 border-t border-slate-100 dark:border-slate-800 pt-10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStage('processing')}
                  className="flex-1 px-12 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-3"
                >
                  <FiCheckCircle className="w-5 h-5" />
                  Confirm & Process Payroll
                </motion.button>
                <button
                  onClick={onBack}
                  className={`flex-1 px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs border-2 transition-all ${
                    isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Cancel Cycle
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className={`p-20 text-center rounded-[3.5rem] border-2 border-dashed ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/50 border-blue-100'
            }`}
          >
            <div className="relative w-48 h-48 mx-auto mb-12">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                <motion.circle cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={565} strokeDashoffset={565 - (565 * progress) / 100} className="text-blue-600" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-black tracking-tighter text-blue-600 font-mono">{progress}%</span>
              </div>
            </div>
            <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">Syncing Digital Ledger...</h3>
            <p className={`text-sm font-bold max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Generating digital payslips, calculating audit logs, and preparing fund transfer protocols.
            </p>
            <div className="mt-12 flex items-center justify-center gap-4 text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
              <FiLoader className="animate-spin w-5 h-5" />
              System Processing...
            </div>
          </motion.div>
        )}

        {stage === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-16 text-center rounded-[4rem] border-2 shadow-2xl relative overflow-hidden ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/20 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
                <FiCheckCircle className="w-16 h-16 text-emerald-600" />
              </div>
              <h3 className="text-5xl font-black mb-4 bg-gradient-to-br from-emerald-600 to-teal-400 bg-clip-text text-transparent tracking-tighter uppercase">
                Payroll Liquidated
              </h3>
              <p className={`mb-12 font-black text-[10px] uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Audit report generated • Cycle successfully closed
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
                <div className={`p-8 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-800/40 text-slate-300' : 'bg-emerald-50/50 border-emerald-100 text-emerald-700'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-2 opacity-60">Processing Time</span>
                  <p className="text-xl font-black">2.4 SECONDS</p>
                </div>
                <div className={`p-8 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-800/40 text-slate-300' : 'bg-blue-50/50 border-blue-100 text-blue-700'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-2 opacity-60">Security Level</span>
                  <p className="text-xl font-black uppercase">AES-256 Verified</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onComplete();
                  onBack();
                }}
                className="px-16 py-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all border-b-4 border-emerald-800"
              >
                Back to Portal
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PayrollTab = ({ isDarkMode, selectedClient }) => {
  const [activeView, setActiveView] = useState('list'); // 'list', 'details', 'run-payroll'
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getLocalISODate());
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayslip, setShowPayslip] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        const response = await getAllDeptPayslips({ 
          department: 'HR Operations',
          date: selectedDate 
        });
        
        if (response.success) {
          const mappedData = (response.payslips || []).map(ps => ({
            id: ps.id,
            empId: ps.memberId?.substring(0, 8).toUpperCase() || 'EMP-TEMP',
            name: ps.memberName,
            designation: ps.designation || 'Department Staff',
            basic: parseFloat(ps.basicSalary) || 0,
            hra: parseFloat(ps.hra) || 0,
            allowances: (parseFloat(ps.conveyance) || 0) + (parseFloat(ps.medical) || 0) + (parseFloat(ps.special) || 0),
            deductions: parseFloat(ps.totalDeductions) || 0,
            netPay: parseFloat(ps.netSalary) || 0,
            status: 'processed',
            avatar: ps.memberName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
            photo: null
          }));
          setPayrollData(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch payroll:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
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
    { key: 'hra', label: 'Total HRA', value: totals.hra, icon: FiTrendingUp, gradient: 'from-cyan-500 to-blue-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50', textColor: 'text-cyan-600' },
    { key: 'allowances', label: 'Allowances', value: totals.allowances, icon: FiCalendar, gradient: 'from-indigo-500 to-purple-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50', textColor: 'text-indigo-600' },
    { key: 'deductions', label: 'Deductions', value: totals.deductions, icon: RupeeIcon, gradient: 'from-red-500 to-pink-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50', isNegative: true, textColor: 'text-red-500' },
    { key: 'netPay', label: 'Net Payable', value: totals.netPay, icon: RupeeIcon, gradient: 'from-[#3FA9F5] to-[#0D47A1]', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50', isPrimary: true, textColor: 'text-blue-700' },
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
        {activeView === 'list' ? (
          <motion.div
            key="payroll-list-view"
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
                  <div className="flex items-center gap-3 text-left">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-lg shadow-[#1E88E5]/25">
                      <RupeeIcon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent">
                      Payroll Management
                      </h2>
                  </div>
                  <p className={`text-base font-semibold mt-4 ml-2 tracking-wide text-left ${isDarkMode ? 'text-white' : 'text-black'} flex items-center gap-2`}>
                      <FiCalendar className="w-4 h-4 text-black dark:text-white" />
                      {formatDate(selectedDate)} • {payrollData.length} Employee Records
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
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveView('run-payroll')}
                      className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black tracking-widest text-[10px] uppercase shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
                  >
                      <FiFileText className="w-4 h-4" />
                      Run Settlement
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
                    className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer border-2 ${
                    isDarkMode 
                        ? 'bg-slate-800/80 border-slate-700/50 text-white' 
                        : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-white shadow-sm hover:shadow-xl'
                    } ${hoveredCard === card.key ? 'scale-[1.02] border-blue-200 dark:border-blue-800' : ''}`}
                >
                    <div className="relative text-left">
                        <div className="flex items-center justify-between mb-4">
                            <p className={`text-[10px] font-extrabold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {card.label}
                            </p>
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg flex-shrink-0`}>
                                <card.icon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0D47A1]'}`}>
                                {card.isNegative ? '-' : ''}{formatCurrency(card.value)}
                            </p>
                        </div>
                        
                        <div className={`mt-4 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-white/50'}`}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '65%' }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${card.gradient}`}
                            />
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
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setActiveView('details');
                            }}
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
        ) : activeView === 'run-payroll' ? (
          <PayrollRunView
            key="payroll-run-view"
            onBack={() => setActiveView('list')}
            onComplete={handlePayrollComplete}
            totalEmployees={payrollData.length}
            totalAmount={totals.netPay}
            isDarkMode={isDarkMode}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        ) : (
          <EmployeePayrollDetailView 
            key="payroll-detail-view"
            employee={selectedEmployee} 
            onBack={() => {
              setSelectedEmployee(null);
              setActiveView('list');
            }} 
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
