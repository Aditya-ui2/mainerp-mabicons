import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiCalendar, FiTrendingUp, FiFileText, FiSearch, FiChevronDown, FiUsers, FiX, FiPrinter, FiCheckCircle, FiLoader, FiAlertCircle, FiArrowLeft, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalISODate } from '../../../Utilities/dateUtils';

// Custom Rupee Icon - Bolder & Premium
const RupeeIcon = ({ className }) => (
  <span className={`font-black ${className}`} style={{ fontFamily: "'Inter', 'Calibri', sans-serif" }}>₹</span>
);

const EmployeePayrollDetailView = ({ employee, onBack, isDarkMode, getStatusConfig, getAvatarColor, formatCurrency, formatDate }) => {
  const statusConfig = getStatusConfig(employee.status);
  const topRef = useRef(null);

  // Auto-scroll to top when the detail view opens
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <motion.div
      ref={topRef}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`w-full min-h-screen pb-12 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f8faff]'}`}
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="max-w-[1400px] mx-auto min-h-screen pb-12 px-4 sm:px-8">
        {/* Stable Header - Matches Attendance Style */}
        <div className={`py-10 flex items-center gap-6 ${isDarkMode ? 'bg-slate-900' : 'bg-[#f8faff]'}`}>
          <button
            onClick={onBack}
            className={`p-3 rounded-2xl border transition-all ${isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-600 hover:shadow-xl hover:-translate-x-1'
              }`}
          >
            <FiArrowLeft className="w-5 h-5 text-[#004fb1]" />
          </button>
          <div className="text-left">
            <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#004fb1]'}`}>
              Employee Payroll Details
            </h2>
            <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] mt-1 uppercase">Financial Settlement Cycle</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Profile Panel (col-span-1) */}
            <div className="lg:col-span-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-10 rounded-[2.5rem] shadow-xl shadow-blue-500/5 flex flex-col items-center border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}
              >
                <div className="relative mb-8 group">
                  <div className={`w-40 h-40 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl bg-gradient-to-br ${getAvatarColor(employee.name)} group-hover:rotate-3 transition-transform duration-500 ring-4 ring-blue-50/50`}>
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 p-3 rounded-full border-4 ${isDarkMode ? 'border-slate-900' : 'border-white'} ${statusConfig.dot} shadow-xl ring-2 ring-blue-50`}>
                    <FiCheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="text-center group">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
                    {employee.name}
                  </h3>
                  <p className="text-sm font-black text-[#004fb1] tracking-widest mt-1">
                    {employee.empId}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-2">{employee.designation}</p>
                </div>

                <div className="w-full mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  {[
                    { label: 'Payroll Period', value: formatDate(getLocalISODate()), icon: FiCalendar },
                    { label: 'Earnings Type', value: 'Monthly Cycle', icon: FiActivity },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{item.label}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <item.icon className="w-3 h-3 text-[#1E88E5]" />
                           <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{item.value}</span>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Financial Panel (col-span-2) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Earnings Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-10 rounded-[2.5rem] shadow-xl shadow-blue-500/5 border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}
                >
                  <div className="flex items-center gap-3 mb-10">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <FiTrendingUp className="w-5 h-5" />
                    </div>
                    <h4 className="text-[13px] font-black text-slate-800 dark:text-white tracking-[0.1em] uppercase">Earnings Breakdown</h4>
                  </div>

                  <div className="space-y-6">
                    {[
                      { label: 'Basic Salary', value: formatCurrency(employee.basic) },
                      { label: 'HRA', value: formatCurrency(employee.hra) },
                      { label: 'Allowances', value: formatCurrency(employee.allowances) },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center group">
                        <span className="text-xs font-black text-slate-400 tracking-wide">{item.label}</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Gross Amount</span>
                      <span className="text-lg font-black text-emerald-600">{formatCurrency(employee.basic + employee.hra + employee.allowances)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Deductions Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`p-10 rounded-[2.5rem] shadow-xl shadow-blue-500/5 border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}
                >
                  <div className="flex items-center gap-3 mb-10">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
                      <RupeeIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-[13px] font-black text-slate-800 dark:text-white tracking-[0.1em] uppercase">Deductions Breakdown</h4>
                  </div>

                  <div className="space-y-6">
                    {[
                      { label: 'Provident Fund (PF)', value: formatCurrency(employee.deductions * 0.5) },
                      { label: 'Income Tax (TDS)', value: formatCurrency(employee.deductions * 0.3) },
                      { label: 'Professional Tax', value: formatCurrency(employee.deductions * 0.2) },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center group">
                        <span className="text-xs font-black text-slate-400 tracking-wide">{item.label}</span>
                        <span className="text-sm font-black text-rose-500">{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Total Deductions</span>
                      <span className="text-lg font-black text-rose-600">{formatCurrency(employee.deductions)}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Net Pay Highlight Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 rounded-[3rem] bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/30 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 opacity-10 blur-3xl rounded-full bg-white translate-x-20 -translate-y-20 group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="text-center md:text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Final Net Payable Amount</span>
                    <p className="text-sm text-white/50 mt-2 font-black italic">Calculated electronically for this cycle</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="text-center md:text-right">
                      <span className="text-5xl font-black text-white tracking-tighter">
                        {formatCurrency(employee.netPay)}
                      </span>
                    </div>
                    <button className="flex items-center gap-3 px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white font-black tracking-widest text-[10px] uppercase border border-white/20 transition-all shadow-xl">
                      <FiPrinter className="w-5 h-5" />
                      Print Payslip
                    </button>
                  </div>
                </div>
              </motion.div>
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`w-full min-h-[600px] flex flex-col ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-6 mb-12 text-left">
        <button
          onClick={onBack}
          className={`p-3 rounded-2xl border transition-all ${isDarkMode
              ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-600 hover:shadow-xl hover:-translate-x-1'
            }`}
        >
          <FiArrowLeft className="w-5 h-5 text-[#004fb1]" />
        </button>
        <div className="flex flex-col">
          <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#004fb1]'}`}>
            Execute Payroll Cycle
          </h2>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mt-1 uppercase">
            Final Audit And Settlement Cycle
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
            className={`p-10 lg:p-16 rounded-[3.5rem] border-2 shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'
              }`}
          >
            <div className="absolute top-0 right-0 w-96 h-96 opacity-5 blur-3xl rounded-full bg-gradient-to-br from-[#1E88E5] to-[#004fb1]"></div>

            <div className="relative z-10 text-left">
              <div className="flex items-center gap-4 mb-16 border-l-4 border-blue-600 pl-8 py-2">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                  <FiFileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Run Summary</h3>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Verify Before Final Processing</p>
                </div>
              </div>

              {/* Horizontal Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
                <div className={`p-10 rounded-[2.5rem] border-2 transition-all hover:scale-[1.03] duration-500 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-br from-[#eff6ff] to-white border-blue-50 shadow-sm'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payroll Cycle</p>
                  <p className="text-2xl font-black text-[#004fb1] tracking-tight">{formatDate(new Date().toISOString())}</p>
                </div>
                <div className={`p-10 rounded-[2.5rem] border-2 transition-all hover:scale-[1.03] duration-500 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-br from-[#eff6ff] to-white border-blue-50 shadow-sm'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Headcount</p>
                  <p className="text-2xl font-black tracking-tight">{totalEmployees} Staff Members</p>
                </div>
                <div className={`p-10 rounded-[2.5rem] border-2 transition-all hover:scale-[1.03] duration-500 ${isDarkMode ? 'bg-slate-800/50 border-blue-900/30' : 'bg-gradient-to-br from-blue-500 to-[#0D47A1] border-white shadow-xl shadow-blue-500/20'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-blue-400' : 'text-white/70'}`}>Total Settlement</p>
                  <p className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-white'}`}>{formatCurrency(totalAmount)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStage('processing')}
                  className="flex-1 px-12 py-6 bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all flex items-center justify-center gap-3"
                >
                  <FiCheckCircle className="w-5 h-5" />
                  Confirm & Process Payroll
                </motion.button>
                <button
                  onClick={onBack}
                  className={`flex-1 px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs border-2 transition-all ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className={`p-24 text-center rounded-[4rem] border-2 border-dashed ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-blue-50/20 border-blue-200'
              }`}
          >
            <div className="relative w-64 h-64 mx-auto mb-16 group">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                <motion.circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={754} strokeDashoffset={754 - (754 * progress) / 100} className="text-[#004fb1]" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-7xl font-black tracking-tighter text-[#004fb1]">{progress}%</span>
                <span className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mt-2">Syncing</span>
              </div>
            </div>
            <h3 className="text-4xl font-black mb-6 tracking-tight">Syncing Digital Ledger...</h3>
            <p className={`text-sm font-black max-w-lg mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Generating digital payslips, calculating audit logs, and preparing fund transfer protocols.
            </p>
            <div className="mt-16 flex items-center justify-center gap-4 text-[#004fb1] font-black uppercase tracking-[0.4em] text-[11px] animate-pulse">
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
            className={`p-20 text-center rounded-[4rem] border-2 shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'
              }`}
          >
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-40 h-40 bg-emerald-100 dark:bg-emerald-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-emerald-500/20 ring-8 ring-emerald-50 dark:ring-emerald-900/5"
              >
                <FiCheckCircle className="w-20 h-20 text-emerald-600" />
              </motion.div>
              <h3 className="text-5xl font-black mb-6 bg-gradient-to-br from-emerald-600 to-teal-400 bg-clip-text text-transparent tracking-tighter uppercase">
                Payroll Liquidated
              </h3>
              <p className={`mb-16 font-black text-[11px] uppercase tracking-[0.4em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Audit Report Generated • Cycle Successfully Closed
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto mb-16 text-left">
                <div className={`p-10 rounded-[2rem] border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-800/40 text-slate-300' : 'bg-emerald-50/50 border-emerald-100 text-emerald-700'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-3 opacity-60">Processing Time</span>
                  <p className="text-2xl font-black">2.4 Seconds</p>
                </div>
                <div className={`p-10 rounded-[2rem] border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-800/40 text-slate-300' : 'bg-blue-50/50 border-blue-100 text-[#004fb1]'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-3 opacity-60">Security Level</span>
                  <p className="text-2xl font-black uppercase">AES-256 Verified</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onComplete();
                  onBack();
                }}
                className="px-20 py-7 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all border-b-4 border-emerald-800"
              >
                Back To Portal
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
    { key: 'basic', label: 'Total Basic', value: totals.basic, icon: RupeeIcon, gradient: 'from-blue-500 to-indigo-600' },
    { key: 'hra', label: 'Total HRA', value: totals.hra, icon: FiTrendingUp, gradient: 'from-cyan-500 to-blue-600' },
    { key: 'allowances', label: 'Total Allowances', value: totals.allowances, icon: FiCalendar, gradient: 'from-indigo-500 to-purple-600' },
    { key: 'deductions', label: 'Total Deductions', value: totals.deductions, icon: FiAlertCircle, gradient: 'from-red-500 to-pink-600' },
    { key: 'netPay', label: 'Net Payable', value: totals.netPay, icon: RupeeIcon, gradient: 'from-[#1E88E5] to-[#0D47A1]' },
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
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

    return (
    <div 
      className={`space-y-8 p-1 sm:p-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <AnimatePresence mode="wait">
        {activeView === 'list' ? (
          <motion.div
            key="payroll-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
            className="space-y-12"
          >
            {/* 1. Unified Banner (Header + Stats) */}
            <motion.div className={`pt-8 pb-12 px-12 rounded-[4rem] relative overflow-hidden border-2 shadow-2xl shadow-blue-500/10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
              <div className="absolute top-0 right-0 w-96 h-96 opacity-5 blur-3xl rounded-full bg-gradient-to-br from-[#1E88E5] to-[#0D47A1]"></div>
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 mb-8">
                <div className="flex items-center gap-8 text-left">
                  <div className="w-[70px] h-[100px] rounded-[2.5rem] bg-gradient-to-b from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/40 flex items-center justify-center group">
                    <RupeeIcon className="text-white text-xl" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-3xl lg:text-5xl font-black text-[#004fb1] dark:text-white tracking-tight mb-4">Payroll Management</h2>
                    <div className="flex items-center gap-6 text-[11px] font-black text-slate-500 tracking-widest uppercase font-calibri">
                      <div className="flex items-center gap-2">
                        <FiUsers className="w-4 h-4" /> All Staff Records
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" /> {formatDate(selectedDate)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`rounded-[1.5rem] border-2 px-8 py-4.5 text-sm font-black ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#f8faff] border-slate-100 shadow-sm'}`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView('run-payroll')}
                    className="px-10 py-5.5 bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black tracking-widest text-[10px] uppercase shadow-2xl shadow-blue-500/30 font-calibri"
                  >
                    Run Settlement
                  </motion.button>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 dark:bg-slate-800 relative z-10 mb-8"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                {statCards.map((card, index) => (
                  <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative overflow-hidden rounded-[2.5rem] p-8 border transition-all duration-300 hover:scale-[1.03] ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-gradient-to-br from-[#eff6ff] to-white border-blue-100/50'}`}
                  >
                    <div className="absolute top-6 right-6">
                      <div className="p-2.5 rounded-xl bg-[#0052cc] shadow-lg shadow-blue-700/20">
                        <card.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="relative z-10 flex flex-col h-full gap-5 text-left">
                      <p className={`text-[12px] font-black tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-800 uppercase font-calibri'}`}>{card.label}</p>
                      <span className={`text-[2rem] font-black ${isDarkMode ? 'text-white' : 'text-[#004fb1]'} tracking-tighter mt-auto font-calibri`}>{formatCurrency(card.value)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 2. Search & Filters */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative flex-1 group">
                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-[1.5rem] border-2 px-16 py-4.5 text-sm font-black transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm font-calibri'}`}
                />
              </div>
              <div className="relative min-w-[240px]">
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <select className={`w-full appearance-none rounded-[1.5rem] border-2 px-8 py-4.5 text-sm font-black ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 font-calibri'}`}>
                  <option>All Departments</option>
                </select>
              </div>
            </div>

            {/* 3. Employee List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredData.map((emp, index) => {
                  const statusConfig = getStatusConfig(emp.status);
                  return (
                    <motion.div
                      key={emp.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => { setSelectedEmployee(emp); setActiveView('details'); }}
                      className={`group relative p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer flex flex-col lg:flex-row lg:items-center gap-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50 hover:bg-blue-50/30'}`}
                    >
                      <div className="flex items-center gap-6 min-w-[280px]">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white`}>
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <h3 className="font-black text-[17px] tracking-tight font-calibri">{emp.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase font-calibri">{emp.empId}</p>
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 pl-8 border-l border-slate-100 dark:border-slate-800 text-left font-calibri">
                        <div className="flex flex-col"><p className="text-[9px] font-black text-slate-400 tracking-widest mb-1 uppercase">BASIC</p><span className="font-black text-sm">{formatCurrency(emp.basic)}</span></div>
                        <div className="flex flex-col"><p className="text-[9px] font-black text-slate-400 tracking-widest mb-1 uppercase">DEDUCTIONS</p><span className="font-bold text-sm text-rose-500">-{formatCurrency(emp.deductions)}</span></div>
                        <div className="flex flex-col"><p className="text-[9px] font-black text-slate-400 tracking-widest mb-1 uppercase">NET PAYABLE</p><span className="font-black text-[16px] text-[#004fb1]">{formatCurrency(emp.netPay)}</span></div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`${statusConfig.bg} ${statusConfig.text} px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-sm font-calibri`}>
                          <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                          {statusConfig.label}
                        </span>
                        <FiArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Summary Footer */}
              <div className={`mt-10 p-8 rounded-[2rem] border-2 border-dashed flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-100 bg-blue-50/20'}`}>
                <p className="text-sm font-black text-slate-400 tracking-widest uppercase font-calibri">Showing <span className="text-blue-600 font-black">{filteredData.length}</span> Records</p>
                <div className="flex items-center gap-4 font-calibri">
                  <span className="text-[11px] font-black text-slate-400 tracking-widest uppercase">Total Payable:</span>
                  <span className="text-2xl font-black text-[#004fb1] tracking-tighter">{formatCurrency(totals.netPay)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeView === 'run-payroll' ? (
          <PayrollRunView
            key="payroll-run"
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
            key="payroll-detail"
            employee={selectedEmployee}
            onBack={() => { setSelectedEmployee(null); setActiveView('list'); }}
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
