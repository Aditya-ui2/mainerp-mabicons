import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiDownload, FiEye, FiCalendar, FiTrendingUp, FiFileText, FiSearch, FiChevronDown, FiUsers, FiX, FiPrinter, FiCheckCircle, FiLoader, FiAlertCircle, FiArrowLeft, FiActivity, FiLock, FiUnlock, FiShield } from 'react-icons/fi';
import { X, Check, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalISODate } from '../../../Utilities/dateUtils';
import { getAllDeptPayslips } from '../../../service/api';
import { toast } from 'react-hot-toast';

// Custom Rupee Icon - Bolder & Premium
const RupeeIcon = ({ className }) => (
  <span className={`font-black ${className}`} style={{ fontFamily: "'Inter', 'Calibri', sans-serif" }}>₹</span>
);

const EmployeePayrollDetailView = ({ employee, onBack, isDarkMode, getStatusConfig, formatCurrency, formatDate }) => {
  const statusConfig = getStatusConfig(employee.status);
  const topRef = useRef(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <motion.div
      ref={topRef}
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex flex-col h-full bg-white relative animate-in fade-in slide-in-from-right duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <FiFileText className="text-[#0D47A1]" size={22} />
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Financial Ledger Detail</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-10 bg-[#FAFAF8] overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Main Information Container */}
          <div className="bg-white rounded-[40px] border border-[#F4F3EF] shadow-sm overflow-hidden">
            <div className="p-12">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-x-20 gap-y-12 text-left">
                
                {/* Information Blocks */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Current Department</span>
                  <p className="text-[16px] font-bold text-[#1A1A2E] tracking-tight">{employee.department || 'General Operations'}</p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Official Designation</span>
                  <p className="text-[16px] font-bold text-[#1A1A2E] tracking-tight">{employee.designation}</p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Fiscal Period</span>
                  <p className="text-[16px] font-bold text-[#1A1A2E] tracking-tight">{formatDate(getLocalISODate())}</p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Audit Status</span>
                  <div className="pt-1">
                    <span className={`${statusConfig.bg} ${statusConfig.text} px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[2px] border border-current/10 flex items-center gap-2 w-fit`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Earnings Table-like Grid */}
              <div className="mt-16 pt-12 border-t border-[#F4F3EF]">
                <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[4px] block mb-10 text-left">Earnings Breakdown</span>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-12 text-left">
                  <div className="p-6 rounded-3xl bg-[#F8FAFF] border border-[#E0E8F5] max-w-md">
                    <span className="text-[9px] font-black text-[#4A6DAB] uppercase tracking-[2px] block mb-2">Salary per Month</span>
                    <p className="text-[18px] font-bold text-[#1A1A2E]">{formatCurrency(employee.basic)}</p>
                  </div>
                </div>
              </div>

              {/* Deductions - Clean Style */}
              <div className="mt-16 pt-12 border-t border-[#F4F3EF]">
                <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[4px] block mb-10 text-left">Deductions Audit</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left text-rose-600">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2.5px]">Provident Fund (PF)</span>
                    <p className="text-[16px] font-bold">-{formatCurrency(employee.deductions * 0.5)}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2.5px]">Income Tax (TDS)</span>
                    <p className="text-[16px] font-bold">-{formatCurrency(employee.deductions * 0.3)}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2.5px]">Prof. Tax</span>
                    <p className="text-[16px] font-bold">-{formatCurrency(employee.deductions * 0.2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Statement Card */}
          <div className="p-10 rounded-[40px] bg-[#0D47A1] shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-10">
              <div className="text-left">
                <span className="text-[11px] font-black uppercase tracking-[4px] text-white/50">Fiscal Settlement Output</span>
                <h3 className="text-white text-4xl font-black mt-3 tracking-tighter">
                  {formatCurrency(employee.netPay)}
                </h3>
                <p className="text-white/40 text-[10px] font-bold mt-3 uppercase tracking-[3px] italic">Electronically calculated & audited record</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-white text-[#0D47A1] rounded-[24px] font-black tracking-[3px] text-[11px] uppercase shadow-2xl hover:bg-blue-50 transition-all flex items-center gap-3"
              >
                <FiPrinter className="text-lg" />
                Generate Record
              </motion.button>
            </div>
          </div>

          {/* Clean Return Action */}
          <div className="mt-16 flex justify-center pb-12">
            <button 
              onClick={onBack} 
              className="w-full max-w-md py-6 rounded-[28px] bg-white border-2 border-[#F4F3EF] text-[#6B6B7E] text-[12px] font-black uppercase tracking-[4px] hover:bg-[#F4F3EF] transition-all shadow-sm"
            >
              Back to Ledger List
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PayrollRunView = ({ onBack, onComplete, totalEmployees, totalAmount, formatCurrency }) => {
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
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex flex-col h-full bg-white relative animate-in fade-in slide-in-from-right duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <FiCheckCircle className="text-[#0D47A1]" size={22} />
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Execute Payroll</h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm">
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-10 bg-[#FAFAF8] overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {stage === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="bg-white p-12 rounded-[40px] border border-[#F4F3EF] shadow-sm relative overflow-hidden">
                   <div className="relative z-10 text-left">
                      <div className="mb-12">
                        <span className="text-[12px] font-black text-[#9B9BAD] uppercase tracking-[4px] block mb-3">Run Summary Overview</span>
                        <p className="text-[16px] font-bold text-[#6B6B7E] leading-relaxed">
                          Please verify final headcount and total settlement amount before executing the digital ledger payout.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="p-10 rounded-[32px] bg-[#FAFAF8] border border-[#F4F3EF] transition-all hover:border-blue-100 group">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4">Total Active Members</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-[#1A1A2E] tracking-tighter">{totalEmployees}</span>
                            <span className="text-sm font-bold text-[#9B9BAD]">Headcount</span>
                          </div>
                        </div>
                        <div className="p-10 rounded-[32px] bg-[#0D47A1] shadow-2xl shadow-blue-500/20 group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                          <span className="text-[10px] font-black uppercase tracking-[3px] text-white/50 block mb-4">Total Net Liquidation</span>
                          <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency(totalAmount)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setStage('processing')}
                          className="flex-[2] px-12 py-6 bg-[#0D47A1] text-white rounded-[24px] font-black uppercase tracking-[3px] text-[11px] shadow-xl shadow-blue-500/20 hover:bg-[#0a3a82] transition-all"
                        >
                          Confirm & Liquidate Ledger
                        </motion.button>
                        <button
                          onClick={onBack}
                          className="flex-1 px-12 py-6 rounded-[24px] font-black uppercase tracking-[3px] text-[11px] bg-white border-2 border-[#F4F3EF] text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
                        >
                          Cancel Run
                        </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {stage === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="p-20 text-center bg-white rounded-[40px] border border-[#F4F3EF] shadow-sm flex flex-col items-center"
              >
                <div className="relative w-56 h-56 mb-16">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="90" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#F4F3EF]" />
                    <motion.circle 
                      cx="112" cy="112" r="90" 
                      stroke="#0D47A1" strokeWidth="10" 
                      fill="transparent" 
                      strokeDasharray={565} 
                      strokeDashoffset={565 - (565 * progress) / 100} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-[#0D47A1] tracking-tighter">{progress}%</span>
                    <span className="text-[10px] font-black text-[#9B9BAD] tracking-[4px] uppercase mt-2">Syncing Ledger</span>
                  </div>
                </div>
                <h3 className="text-4xl font-bold mb-6 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Processing Financial Settlement...</h3>
                <p className="text-[16px] font-bold text-[#9B9BAD] max-w-md leading-relaxed">
                  Generating auditing logs and encrypted payslip records for bank transfer synchronization.
                </p>
              </motion.div>
            )}

            {stage === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-16 text-center bg-white rounded-[40px] border border-[#F4F3EF] shadow-sm relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-emerald-50 rounded-[32px] flex items-center justify-center mb-8 shadow-sm border border-emerald-100"
                  >
                    <Check className="w-16 h-16 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-4xl font-bold mb-4 text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Settlement Liquidated
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-10">
                    <span className="text-[10px] font-black text-[#0D47A1] uppercase tracking-[3px]">Audit Ledger Success</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f4f3ef]" />
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Cycle Closed</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
                    <div className="p-8 rounded-3xl bg-[#FAFAF8] border border-[#F4F3EF] text-left">
                      <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-2">Processing Time</span>
                      <p className="text-xl font-bold text-[#1A1A2E]">2.4 Seconds</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-[#FAFAF8] border border-[#F4F3EF] text-left">
                      <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-2">Security ID</span>
                      <p className="text-xl font-bold text-[#1A1A2E] uppercase">SEC-256-V5</p>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        onComplete();
                        onBack();
                    }}
                    className="px-16 py-6 bg-[#0D47A1] text-white rounded-[24px] font-black uppercase tracking-[4px] text-[11px] shadow-2xl shadow-blue-500/20 hover:bg-blue-800 transition-all"
                  >
                    Close Financial Run
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const PayrollTab = ({ isDarkMode, selectedClient }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'list', 'run-payroll'
  const [payrollData, setPayrollData] = useState([
    { id: '1', empId: 'EMP001', name: 'Rahul Sharma', designation: 'Staff', department: 'HR Operations', basic: 50000, hra: 20000, allowances: 10000, deductions: 5000, netPay: 75000, status: 'processed' },
    { id: '2', empId: 'EMP002', name: 'Priya Singh', designation: 'Team Lead', department: 'Recruitment', basic: 65000, hra: 25000, allowances: 12000, deductions: 7000, netPay: 95000, status: 'processed' },
    { id: '3', empId: 'EMP003', name: 'Amit Kumar', designation: 'Manager', department: 'Sales', basic: 80000, hra: 30000, allowances: 15000, deductions: 10000, netPay: 115000, status: 'processed' },
    { id: '4', empId: 'EMP004', name: 'Sneha Patel', designation: 'Developer', department: 'Technology', basic: 70000, hra: 28000, allowances: 14000, deductions: 8000, netPay: 104000, status: 'processed' },
    { id: '5', empId: 'EMP005', name: 'Vikram Rao', designation: 'Executive', department: 'Marketing', basic: 45000, hra: 18000, allowances: 9000, deductions: 4000, netPay: 68000, status: 'processed' },
    { id: '6', empId: 'EMP006', name: 'Anjali Gupta', designation: 'Specialist', department: 'HR Operations', basic: 55000, hra: 22000, allowances: 11000, deductions: 6000, netPay: 82000, status: 'processed' },
    { id: '7', empId: 'EMP007', name: 'Sanjay Dutt', designation: 'Analyst', department: 'Sales', basic: 60000, hra: 24000, allowances: 12000, deductions: 7000, netPay: 89000, status: 'processed' },
    { id: '8', empId: 'EMP008', name: 'Meera Reddy', designation: 'Designer', department: 'Technology', basic: 72000, hra: 29000, allowances: 14500, deductions: 8500, netPay: 107000, status: 'processed' },
    { id: '9', empId: 'EMP009', name: 'Karan Mehra', designation: 'Consultant', department: 'Recruitment', basic: 68000, hra: 27000, allowances: 13500, deductions: 7500, netPay: 101000, status: 'processed' },
    { id: '10', empId: 'EMP010', name: 'Pooja Varma', designation: 'Coordinator', department: 'Marketing', basic: 48000, hra: 19000, allowances: 9500, deductions: 4500, netPay: 72000, status: 'processed' }
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getLocalISODate());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const departments = ['HR Operations', 'Recruitment', 'Sales', 'Marketing', 'Technology'];
  const [showPayslip, setShowPayslip] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [activePayrollMonth, setActivePayrollMonth] = useState('Jun 2026');
  const [payrollLockState, setPayrollLockState] = useState(() => {
    const stored = localStorage.getItem('mabicons_payroll_lock_state');
    return stored ? JSON.parse(stored) : {
      'Apr 2025': true, 'May 2025': true, 'Jun 2025': true, 'Jul 2025': true,
      'Aug 2025': true, 'Sep 2025': true, 'Oct 2025': true, 'Nov 2025': true,
      'Dec 2025': true, 'Jan 2026': true, 'Feb 2026': true, 'Mar 2026': true,
      'Apr 2026': true, 'May 2026': true, 'Jun 2026': false
    };
  });
  const [payslipsReleaseState, setPayslipsReleaseState] = useState(() => {
    const stored = localStorage.getItem('mabicons_payslips_release_state');
    return stored ? JSON.parse(stored) : {
      'Apr 2025': true, 'May 2025': true, 'Jun 2025': true, 'Jul 2025': true,
      'Aug 2025': true, 'Sep 2025': true, 'Oct 2025': true, 'Nov 2025': true,
      'Dec 2025': true, 'Jan 2026': true, 'Feb 2026': true, 'Mar 2026': true,
      'Apr 2026': true, 'May 2026': false, 'Jun 2026': false
    };
  });

  // Keep track of which months have completed run settlement locally
  const [monthProcessedState, setMonthProcessedState] = useState(() => {
    const stored = localStorage.getItem('mabicons_month_processed_state');
    return stored ? JSON.parse(stored) : {
      'Apr 2025': true, 'May 2025': true, 'Jun 2025': true, 'Jul 2025': true,
      'Aug 2025': true, 'Sep 2025': true, 'Oct 2025': true, 'Nov 2025': true,
      'Dec 2025': true, 'Jan 2026': true, 'Feb 2026': true, 'Mar 2026': true,
      'Apr 2026': true, 'May 2026': true, 'Jun 2026': false
    };
  });

  useEffect(() => {
    localStorage.setItem('mabicons_payroll_lock_state', JSON.stringify(payrollLockState));
  }, [payrollLockState]);

  useEffect(() => {
    localStorage.setItem('mabicons_payslips_release_state', JSON.stringify(payslipsReleaseState));
  }, [payslipsReleaseState]);

  useEffect(() => {
    localStorage.setItem('mabicons_month_processed_state', JSON.stringify(monthProcessedState));
  }, [monthProcessedState]);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        const response = await getAllDeptPayslips({
          department: 'HR Operations',
          date: selectedDate
        });

        if (response.success && response.payslips?.length > 0) {
          const mappedData = response.payslips.map(ps => ({
            id: ps.id,
            empId: ps.memberId?.substring(0, 8).toUpperCase() || 'EMP-TEMP',
            name: ps.memberName,
            department: ps.department || 'HR Operations',
            designation: ps.designation || 'Department Staff',
            basic: parseFloat(ps.basicSalary) || 0,
            hra: parseFloat(ps.hra) || 0,
            allowances: (parseFloat(ps.conveyance) || 0) + (parseFloat(ps.medical) || 0) + (parseFloat(ps.special) || 0),
            deductions: parseFloat(ps.totalDeductions) || 0,
            netPay: parseFloat(ps.netSalary) || 0,
            status: 'processed',
          }));
          setPayrollData(mappedData);
        } else {
          // Comprehensive Mock data for UI testing (10 Records)
          const mockData = [
            { id: '1', empId: 'EMP001', name: 'Rahul Sharma', designation: 'Staff', department: 'HR Operations', basic: 50000, hra: 20000, allowances: 10000, deductions: 5000, netPay: 75000, status: 'processed' },
            { id: '2', empId: 'EMP002', name: 'Priya Singh', designation: 'Team Lead', department: 'Recruitment', basic: 65000, hra: 25000, allowances: 12000, deductions: 7000, netPay: 95000, status: 'processed' },
            { id: '3', empId: 'EMP003', name: 'Amit Kumar', designation: 'Manager', department: 'Sales', basic: 80000, hra: 30000, allowances: 15000, deductions: 10000, netPay: 115000, status: 'processed' },
            { id: '4', empId: 'EMP004', name: 'Sneha Patel', designation: 'Developer', department: 'Technology', basic: 70000, hra: 28000, allowances: 14000, deductions: 8000, netPay: 104000, status: 'processed' },
            { id: '5', empId: 'EMP005', name: 'Vikram Rao', designation: 'Executive', department: 'Marketing', basic: 45000, hra: 18000, allowances: 9000, deductions: 4000, netPay: 68000, status: 'processed' },
            { id: '6', empId: 'EMP006', name: 'Anjali Gupta', designation: 'Specialist', department: 'HR Operations', basic: 55000, hra: 22000, allowances: 11000, deductions: 6000, netPay: 82000, status: 'processed' },
            { id: '7', empId: 'EMP007', name: 'Sanjay Dutt', designation: 'Analyst', department: 'Sales', basic: 60000, hra: 24000, allowances: 12000, deductions: 7000, netPay: 89000, status: 'processed' },
            { id: '8', empId: 'EMP008', name: 'Meera Reddy', designation: 'Designer', department: 'Technology', basic: 72000, hra: 29000, allowances: 14500, deductions: 8500, netPay: 107000, status: 'processed' },
            { id: '9', empId: 'EMP009', name: 'Karan Mehra', designation: 'Consultant', department: 'Recruitment', basic: 68000, hra: 27000, allowances: 13500, deductions: 7500, netPay: 101000, status: 'processed' },
            { id: '10', empId: 'EMP010', name: 'Pooja Varma', designation: 'Coordinator', department: 'Marketing', basic: 48000, hra: 19000, allowances: 9500, deductions: 4500, netPay: 72000, status: 'processed' }
          ];
          setPayrollData(mockData);
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
    deductions: acc.deductions + emp.deductions,
    netPay: acc.netPay + emp.netPay,
  }), { basic: 0, deductions: 0, netPay: 0 });

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const statCards = [
    { key: 'basic', label: 'Total Salary', value: totals.basic, icon: RupeeIcon, gradient: 'from-blue-500 to-indigo-600' },
    { key: 'deductions', label: 'Total Deductions', value: totals.deductions, icon: FiAlertCircle, gradient: 'from-red-500 to-pink-600' },
    { key: 'netPay', label: 'Net Payable', value: totals.netPay, icon: RupeeIcon, gradient: 'from-[#1E88E5] to-[#0D47A1]' },
  ];

  const getStatusConfig = (status) => {
    const config = {
      processed: {
        bg: 'bg-green-50 dark:bg-green-900/20',
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

  const filteredData = payrollData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handlePayrollComplete = () => {
    setPayrollData(prev => prev.map(emp => ({ ...emp, status: 'processed' })));
    setMonthProcessedState(prev => ({
      ...prev,
      [activePayrollMonth]: true
    }));
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
      className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <AnimatePresence mode="wait">
        {activeView === 'overview' ? (
          <motion.div
            key="payroll-overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
            className="space-y-8 text-left animate-in fade-in slide-in-from-left duration-300"
          >
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne" style={{ fontFamily: "'Syne', sans-serif" }}>Payroll Overview</h1>
                <p className="text-sm font-medium text-[#9B9BAD] mt-1">
                  Main Ledger Summary <span className="mx-2">•</span> Financial Year 2025 - 2026
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                  payrollLockState[activePayrollMonth]
                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                    : 'bg-green-50 text-green-700 border-green-100'
                }`}>
                  {payrollLockState[activePayrollMonth] ? (
                    <>
                      <FiLock className="animate-pulse" /> LOCKED
                    </>
                  ) : (
                    <>
                      <FiUnlock className="animate-pulse" /> INPUTS OPEN
                    </>
                  )}
                </span>

                <button
                  onClick={() => {
                    const months = Object.keys(payrollLockState);
                    const lastMonth = months[months.length - 1];
                    const parts = lastMonth.split(' ');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    let mIdx = monthNames.indexOf(parts[0]);
                    let yVal = parseInt(parts[1]);
                    mIdx++;
                    if (mIdx > 11) {
                      mIdx = 0;
                      yVal++;
                    }
                    const newMonthLabel = `${monthNames[mIdx]} ${yVal}`;
                    
                    setPayrollLockState(prev => ({ ...prev, [newMonthLabel]: false }));
                    setPayslipsReleaseState(prev => ({ ...prev, [newMonthLabel]: false }));
                    setMonthProcessedState(prev => ({ ...prev, [newMonthLabel]: false }));
                    setActivePayrollMonth(newMonthLabel);
                    toast.success(`Created new payroll month ledger for ${newMonthLabel}`);
                  }}
                  className="px-5 py-3 rounded-xl border border-[#0D47A1] text-[#0D47A1] dark:text-blue-400 dark:border-blue-400 text-xs font-bold hover:bg-[#0D47A1]/5 active:scale-95 transition-all"
                >
                  Create New Month
                </button>
              </div>
            </div>

            {/* Horizontal Months Navigation Timeline */}
            <div className="bg-[#FAF9F6] dark:bg-slate-800 p-2 rounded-2xl border border-[#F4F3EF] dark:border-slate-700 overflow-x-auto flex items-center gap-3 custom-scrollbar select-none">
              {Object.keys(payrollLockState).map((month) => {
                const isSelected = activePayrollMonth === month;
                const isLocked = payrollLockState[month];
                const isProcessed = monthProcessedState[month];
                
                return (
                  <button
                    key={month}
                    onClick={() => {
                      setActivePayrollMonth(month);
                      setSearchTerm('');
                    }}
                    className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-[#0D47A1] dark:text-blue-400 shadow-sm font-black border border-blue-50/50'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent'
                    }`}
                  >
                    <span>{month}</span>
                    {isLocked ? (
                      <FiLock className="text-rose-500 w-3 h-3" />
                    ) : isProcessed ? (
                      <FiCheckCircle className="text-emerald-500 w-3 h-3" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-black text-lg">
                  ₹
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Net Pay</p>
                  <h3 className="text-xl font-bold text-slate-850 dark:text-white mt-1">
                    {monthProcessedState[activePayrollMonth] ? formatCurrency(totals.netPay) : '₹0 (Pending)'}
                  </h3>
                </div>
              </div>

              <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-black text-lg">
                  ₹
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Salary</p>
                  <h3 className="text-xl font-bold text-slate-850 dark:text-white mt-1">
                    {monthProcessedState[activePayrollMonth] ? formatCurrency(totals.basic) : '₹0 (Pending)'}
                  </h3>
                </div>
              </div>

              <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                  <FiAlertCircle size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Deductions</p>
                  <h3 className="text-xl font-bold text-slate-850 dark:text-white mt-1">
                    {monthProcessedState[activePayrollMonth] ? formatCurrency(totals.deductions) : '₹0 (Pending)'}
                  </h3>
                </div>
              </div>

              <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                  <FiUsers size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Headcount</p>
                  <h3 className="text-xl font-bold text-slate-850 dark:text-white mt-1">
                    {payrollData.length} Employees
                  </h3>
                </div>
              </div>
            </div>

            {/* Checklist and Exception Panel split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Checklist (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className={`p-8 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-6`}>
                  <h4 className="text-lg font-bold text-slate-850 dark:text-white font-syne border-b border-[#F4F3EF] dark:border-slate-800 pb-3">
                    Payroll Processing Checklist
                  </h4>

                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                        ✓
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-850 dark:text-white">Verify Headcount & Exclusions</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          1 new employee added. 0 employees excluded from payroll. Headcount audit complete.
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Completed</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 items-start border-t border-[#F4F3EF] dark:border-slate-850 pt-5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                        ✓
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-850 dark:text-white">Biometric Attendance & Leave Sync</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Biometric swipes and holiday records successfully synced. 0 LOP (Loss of Pay) days calculated.
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Synced</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4 items-start border-t border-[#F4F3EF] dark:border-slate-850 pt-5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${
                        monthProcessedState[activePayrollMonth]
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {monthProcessedState[activePayrollMonth] ? '✓' : '3'}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-850 dark:text-white">Run Payroll Settlement</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Calculate base pay, hra, special allowances, and deduct provident fund & TDS taxes.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          monthProcessedState[activePayrollMonth]
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {monthProcessedState[activePayrollMonth] ? 'Processed' : 'Pending'}
                        </span>
                        
                        <button
                          disabled={payrollLockState[activePayrollMonth]}
                          onClick={() => setActiveView('run-payroll')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                            payrollLockState[activePayrollMonth]
                              ? 'bg-slate-100 text-slate-350 border-slate-200 cursor-not-allowed'
                              : 'border-[#0D47A1] text-[#0D47A1] hover:bg-[#0D47A1]/5'
                          }`}
                        >
                          {monthProcessedState[activePayrollMonth] ? 'Rerun' : 'Run Process'}
                        </button>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4 items-start border-t border-[#F4F3EF] dark:border-slate-850 pt-5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                        ✓
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-855 dark:text-white">Audit Exceptions & Salary Verification</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Run automated audit on negative salary, payout holds, and tax computation errors.
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Audited</span>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-4 items-start border-t border-[#F4F3EF] dark:border-slate-855 pt-5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${
                        payrollLockState[activePayrollMonth]
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {payrollLockState[activePayrollMonth] ? '✓' : '5'}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-855 dark:text-white">Lock Payroll Inputs</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Lock inputs to finalize payroll and prevent subsequent manual edits for this fiscal period.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          payrollLockState[activePayrollMonth]
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {payrollLockState[activePayrollMonth] ? 'Locked' : 'Open'}
                        </span>
                        
                        <button
                          disabled={!monthProcessedState[activePayrollMonth]}
                          onClick={() => {
                            const current = payrollLockState[activePayrollMonth];
                            setPayrollLockState(prev => ({ ...prev, [activePayrollMonth]: !current }));
                            if (!current) {
                              toast.success(`Payroll inputs locked for ${activePayrollMonth}`);
                            } else {
                              toast.success(`Payroll inputs unlocked for ${activePayrollMonth}`);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                            !monthProcessedState[activePayrollMonth]
                              ? 'bg-slate-100 text-slate-350 border-slate-200 cursor-not-allowed'
                              : payrollLockState[activePayrollMonth]
                                ? 'border-rose-500 text-rose-600 hover:bg-rose-50'
                                : 'border-[#0D47A1] text-[#0D47A1] hover:bg-[#0D47A1]/5'
                          }`}
                        >
                          {payrollLockState[activePayrollMonth] ? 'Unlock Inputs' : 'Lock Payroll'}
                        </button>
                      </div>
                    </div>

                    {/* Step 6 */}
                    <div className="flex gap-4 items-start border-t border-[#F4F3EF] dark:border-slate-855 pt-5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${
                        payslipsReleaseState[activePayrollMonth]
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {payslipsReleaseState[activePayrollMonth] ? '✓' : '6'}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-855 dark:text-white">Publish Self-Service Payslips</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Release salary statements and TDS sheets to employee accounts in the client portal.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          payslipsReleaseState[activePayrollMonth]
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {payslipsReleaseState[activePayrollMonth] ? 'Released' : 'Unreleased'}
                        </span>
                        
                        <button
                          disabled={!payrollLockState[activePayrollMonth]}
                          onClick={() => {
                            const current = payslipsReleaseState[activePayrollMonth];
                            setPayslipsReleaseState(prev => ({ ...prev, [activePayrollMonth]: !current }));
                            if (!current) {
                              toast.success(`Payslips released to employee portals for ${activePayrollMonth}`);
                            } else {
                              toast.success(`Payslips recalled for ${activePayrollMonth}`);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                            !payrollLockState[activePayrollMonth]
                              ? 'bg-slate-100 text-slate-350 border-slate-200 cursor-not-allowed'
                              : payslipsReleaseState[activePayrollMonth]
                                ? 'border-amber-500 text-amber-600 hover:bg-amber-50'
                                : 'border-[#0D47A1] text-[#0D47A1] hover:bg-[#0D47A1]/5'
                          }`}
                        >
                          {payslipsReleaseState[activePayrollMonth] ? 'Recall' : 'Release'}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Sidebar Exceptions Panel */}
              <div className="lg:col-span-4 space-y-6">
                {/* Audit exceptions */}
                <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-5 text-left`}>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-[#F4F3EF] dark:border-slate-800 pb-3">
                    Salary Exception Logs
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-705 dark:text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Negative Salaries
                      </div>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">0 Checked</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-705 dark:text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Payout Holds
                      </div>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">0 Checked</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-705 dark:text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Stop Pay Declarations
                      </div>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">0 Checked</span>
                    </div>
                  </div>
                </div>

                {/* Operations Actions Card */}
                <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-4 text-left`}>
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-[#F4F3EF] dark:border-slate-800 pb-3">
                    Operational Actions
                  </h4>

                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveView('list')}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-50 to-[#F0F7FF] border border-blue-100 hover:border-blue-300 text-[#0D47A1] text-xs font-bold hover:shadow-md transition-all active:scale-95"
                    >
                      <span>View Detailed Employee Summary</span>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button
                      onClick={() => {
                        toast.success('Downloaded full payroll journal for ' + activePayrollMonth);
                      }}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-[#FAFAF8] border border-[#E8E7E2] hover:border-slate-300 text-slate-650 text-xs font-bold hover:shadow-md transition-all active:scale-95"
                    >
                      <span>Export Payout Excel Journal</span>
                      <FiDownload size={16} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="payroll-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
            className="space-y-8 text-left animate-in fade-in slide-in-from-right duration-300"
          >
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveView('overview')}
                    className="w-10 h-10 rounded-xl bg-[#F8FAFF] border border-blue-100 flex items-center justify-center text-slate-650 hover:bg-blue-50 hover:text-[#0D47A1] transition-all shadow-sm"
                    title="Back to Overview"
                  >
                    <FiArrowLeft size={18} />
                  </button>
                  <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne" style={{ fontFamily: "'Syne', sans-serif" }}>Payroll Management</h1>
                </div>
                <p className="text-sm font-medium text-[#9B9BAD] mt-2 pl-13">
                  Financial Records <span className="mx-2">•</span> {formatDate(selectedDate)}
                </p>
              </div>

              <div className="flex items-center gap-3 pl-13 lg:pl-0">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="rounded-xl border-2 border-[#f4f3ef] px-5 py-2.5 text-sm font-bold bg-white outline-none focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer text-slate-700"
                />
                <button
                  onClick={() => setActiveView('run-payroll')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-medium transition-all hover:bg-[#0a3a82] active:scale-95 shadow-lg shadow-blue-500/10"
                >
                  Run Settlement
                </button>
              </div>
            </div>



          {/* Modern Search & Filters Unification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 bg-white border-[#F4F3EF] shadow-sm`}
          >
            {/* Search Bar */}
            <div className="relative flex-1 group min-w-[200px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-none rounded-2xl py-3 pl-14 pr-12 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD] bg-[#F4F3EF] text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF]"
                style={{ fontFamily: "'Calibri', sans-serif" }}
              />
            </div>

            {/* Department Filter */}
            <div className="relative group">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-[11px] font-black uppercase tracking-widest rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[200px] transition-all hover:bg-[#EEF2FB] bg-[#F4F3EF] text-[#1A1A2E]"
                style={{ fontFamily: "'Calibri', sans-serif" }}
              >
                <option value="All">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
            </div>
          </motion.div>

          {/* Employee List */}
          <div className={`rounded-[32px] border overflow-hidden transition-all bg-white border-[#f4f3ef] shadow-sm`}>
            <div className="hidden lg:grid grid-cols-[1fr_150px_150px_180px_160px_40px] gap-4 px-8 py-4 border-b border-[#f4f3ef] bg-transparent">
              {["Member Detail", "Basic", "Deductions", "Net Payable", "Status", ""].map((h, i) => (
                <span key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
                  {h}
                </span>
              ))}
            </div>

            <div className="flex flex-col">
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
                      onClick={() => { setSelectedEmployee(emp); }}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_150px_150px_180px_160px_40px] items-center gap-4 px-8 py-3 border-b border-[#f4f3ef] last:border-0 hover:bg-[#F8FAFF] transition-all cursor-pointer group relative"
                    >
                      <div className="flex items-center gap-4 min-w-0 py-1">
                        <div className="w-11 h-11 rounded-[14px] bg-[#F0F7FF] flex items-center justify-center text-[#1B4DA0] font-bold text-sm shadow-sm transition-transform group-hover:scale-110">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <h3 className="text-[16px] font-bold text-[#1A1A2E] group-hover:text-[#0D47A1] transition-colors">{emp.name}</h3>
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">{emp.empId}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold text-[#1A1A2E]">{formatCurrency(emp.basic)}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold text-rose-500">-{formatCurrency(emp.deductions)}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-[17px] font-black text-[#0D47A1] tracking-tight">{formatCurrency(emp.netPay)}</span>
                      </div>
                      <div className="text-left">
                        <span className={`${statusConfig.bg} ${statusConfig.text} px-5 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 border border-current/10`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex justify-end lg:justify-center pr-2">
                        <ChevronRight className="w-5 h-5 text-[#C5C5D2] group-hover:text-[#0D47A1] transition-all" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Side Drawers Portaled (Member Detail & Run Settlement) */}
      {createPortal(
        <AnimatePresence>
          {/* Backdrop Blur (Shared for both drawers) */}
          {(selectedEmployee || activeView === 'run-payroll') && (
            <motion.div
              key="shared-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { 
                setSelectedEmployee(null); 
                if (activeView === 'run-payroll') setActiveView('overview'); 
              }}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
            />
          )}

          {/* Member Detail Drawer */}
          {selectedEmployee && (
            <motion.div
              key="drawer-detail"
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] shadow-2xl z-[1101] border-l flex flex-col overflow-hidden bg-white border-[#F4F3EF]"
            >
              <EmployeePayrollDetailView
                employee={selectedEmployee}
                onBack={() => setSelectedEmployee(null)}
                isDarkMode={isDarkMode}
                getStatusConfig={getStatusConfig}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </motion.div>
          )}

          {/* Run Settlement Drawer */}
          {activeView === 'run-payroll' && (
            <motion.div
              key="drawer-run"
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] shadow-2xl z-[1101] border-l flex flex-col overflow-hidden bg-white border-[#F4F3EF]"
            >
              <PayrollRunView
                onBack={() => setActiveView('overview')}
                onComplete={handlePayrollComplete}
                totalEmployees={payrollData.length}
                totalAmount={totals.netPay}
                formatCurrency={formatCurrency}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

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
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Salary per Month</span><span className="font-bold">{formatCurrency(showPayslip.basic)}</span></div>
                    <div className={`flex justify-between font-extrabold pt-4 border-t ${isDarkMode ? 'border-emerald-900/30' : 'border-emerald-200'}`}>
                      <span className="text-emerald-700 dark:text-emerald-400">Gross Amount</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(showPayslip.basic)}</span>
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
