import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiDownload, FiEye, FiCalendar, FiTrendingUp, FiFileText, FiSearch, FiChevronDown, FiUsers, FiX, FiPrinter, FiCheckCircle, FiLoader, FiAlertCircle, FiArrowLeft, FiActivity } from 'react-icons/fi';
import { X, Check, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalISODate } from '../../../Utilities/dateUtils';
import { getAllDeptPayslips } from '../../../service/api';

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
      initial={{ opacity: 0, x: '100%' }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex flex-col h-full bg-white relative overflow-hidden"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      {/* Header - High Fidelity & Sticky */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            {employee.name}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[3px]">{employee.empId}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f4f3ef]" />
            <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Financial Ledger • Detail</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="w-11 h-11 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
          >
            <X size={24} />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                  <div className="p-6 rounded-3xl bg-[#F8FAFF] border border-[#E0E8F5]">
                    <span className="text-[9px] font-black text-[#4A6DAB] uppercase tracking-[2px] block mb-2">Basic Salary</span>
                    <p className="text-[18px] font-bold text-[#1A1A2E]">{formatCurrency(employee.basic)}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-[#F8FAFF] border border-[#E0E8F5]">
                    <span className="text-[9px] font-black text-[#4A6DAB] uppercase tracking-[2px] block mb-2">HRA</span>
                    <p className="text-[18px] font-bold text-[#1A1A2E]">{formatCurrency(employee.hra)}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-[#F8FAFF] border border-[#E0E8F5]">
                    <span className="text-[9px] font-black text-[#4A6DAB] uppercase tracking-[2px] block mb-2">Special Allowances</span>
                    <p className="text-[18px] font-bold text-[#1A1A2E]">{formatCurrency(employee.allowances)}</p>
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
      initial={{ opacity: 0, x: '100%' }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex flex-col h-full bg-white relative overflow-hidden"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      {/* Header - Sticky & Blurred */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Execute Payroll
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[3px]">Financial Audit</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f4f3ef]" />
            <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Settlement Flow</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-11 h-11 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={24} />
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
  const [activeView, setActiveView] = useState('list'); // 'list', 'details', 'run-payroll'
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
        <motion.div
          key="payroll-list"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 text-left">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Payroll Management</h1>
              <p className="text-sm font-medium text-[#9B9BAD] mt-1 text-left" style={{ fontFamily: "'Calibri', sans-serif" }}>
                Financial Records <span className="mx-2">•</span> {formatDate(selectedDate)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="rounded-xl border-2 border-[#f4f3ef] px-5 py-2.5 text-sm font-bold bg-white outline-none focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer"
                style={{ 
                  fontFamily: "'Calibri', sans-serif"
                }}
              />
              <button
                onClick={() => setActiveView('run-payroll')}
                className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-medium transition-all hover:bg-[#0a3a82] active:scale-95 shadow-lg shadow-blue-500/10"
                style={{ fontFamily: "'Calibri', sans-serif" }}
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
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs font-bold uppercase tracking-wider rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[200px] bg-[#F4F3EF] text-[#1A1A2E]"
                style={{ fontFamily: "'Calibri', sans-serif" }}
              >
                <option value="All">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
            </div>
          </motion.div>

          {/* Employee List */}
          {/* Employee List - Table Style */}
          <div className={`rounded-[32px] border overflow-hidden transition-all bg-white border-[#f4f3ef] shadow-sm`}>
            <div className="hidden lg:grid grid-cols-[1fr_150px_150px_180px_160px_40px] gap-8 px-10 py-4 border-b border-[#f4f3ef] bg-[#F8FAFF]/50">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Member Detail</span>
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Basic</span>
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Deductions</span>
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Net Payable</span>
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Status</span>
              <span></span>
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
                      className="grid grid-cols-1 lg:grid-cols-[1fr_150px_150px_180px_160px_40px] items-center gap-8 px-10 py-6 border-b border-[#f4f3ef] last:border-0 hover:bg-[#F8FAFF] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-6">
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
              onClick={() => { setSelectedEmployee(null); setActiveView('list'); }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999]"
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
              className="fixed inset-y-0 right-0 w-full sm:w-[600px] md:w-[750px] shadow-2xl z-[1000] border-l flex flex-col overflow-hidden bg-white border-[#F4F3EF]"
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
              className="fixed inset-y-0 right-0 w-full sm:w-[600px] md:w-[850px] shadow-2xl z-[1000] border-l flex flex-col overflow-hidden bg-white border-[#F4F3EF]"
            >
              <PayrollRunView
                onBack={() => setActiveView('list')}
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
