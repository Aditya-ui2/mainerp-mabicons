
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiDollarSign, FiFileText, FiDownload, FiCheck, FiClock, FiAlertCircle, FiEye, FiPlus, FiSearch, FiChevronDown, FiX, FiTrendingUp, FiTrendingDown, FiPercent, FiArrowLeft, FiArrowRight, FiBriefcase } from 'react-icons/fi';
import { Search, ChevronDown, Plus, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FnFDetailView = ({ employee, onBack, isDarkMode, formatCurrency, getStatusConfig }) => {
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
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <FiDollarSign className="text-[#0D47A1]" size={22} />
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Settlement Breakdown</h3>
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
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-2xl font-black mb-1 uppercase tracking-tight">{employee.name}</h3>
          <p className={`font-black tracking-[0.2em] text-[10px] mb-6 ${isDarkMode ? 'text-blue-400' : 'text-[#3FA9F5]'}`}>{employee.empId}</p>

          <div className="w-full p-4 rounded-[2rem] border-2 mb-8 flex flex-col items-center gap-4">
            <span className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all border ${statusConfig.bg} ${statusConfig.text}`}>
              <span className={`w-2.5 h-2.5 rounded-full bg-current animate-pulse`}></span>
              {employee.status}
            </span>
          </div>

          <div className="w-full text-left space-y-5 px-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</span>
              <p className="font-bold text-sm tracking-tight">{employee.department}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exit Date</span>
              <p className="font-bold text-sm tracking-tight text-blue-600 italic underline decoration-2 underline-offset-4">{new Date(employee.lastWorkingDay).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="col-span-1 lg:col-span-2 space-y-8 mt-6">
          <div className={`p-10 rounded-[3rem] border-2 shadow-2xl ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h4 className="font-black text-blue-600 flex items-center gap-2 uppercase tracking-widest text-xs mb-10">
              <FiBriefcase className="w-4 h-4" /> Comprehensive Settlement Audit
            </h4>

            <div className="flex flex-col gap-8">
              <div className={`p-8 rounded-[2.5rem] border-2 ${isDarkMode ? 'bg-emerald-900/10 border-emerald-900/20' : 'bg-emerald-50/50 border-emerald-100'}`}>
                <h5 className="font-black text-emerald-600 text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><FiTrendingUp /> Earnings</h5>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm"><span className="font-bold">Basic Salary</span><span className="font-black">{formatCurrency(employee.settlement.basicSalary)}</span></div>
                  <div className="flex justify-between text-sm"><span className="font-bold">HRA</span><span className="font-black">{formatCurrency(employee.settlement.hra)}</span></div>
                  <div className="flex justify-between text-sm"><span className="font-bold text-blue-600">Leaves ({employee.settlement.leavesEncashed}d)</span><span className="font-black text-blue-600">{formatCurrency(employee.settlement.leaveAmount)}</span></div>
                  {employee.settlement.bonus > 0 && <div className="flex justify-between text-sm"><span className="font-bold">Bonus</span><span className="font-black">{formatCurrency(employee.settlement.bonus)}</span></div>}
                  <div className={`flex justify-between pt-4 mt-4 border-t-2 ${isDarkMode ? 'border-emerald-900/30' : 'border-emerald-200'} font-black text-lg text-emerald-600`}>
                    <span>Gross Total</span><span>{formatCurrency(employee.settlement.grossEarnings)}</span>
                  </div>
                </div>
              </div>

              <div className={`p-8 rounded-[2.5rem] border-2 ${isDarkMode ? 'bg-rose-900/10 border-rose-900/20' : 'bg-rose-50/50 border-rose-100'}`}>
                <h5 className="font-black text-rose-600 text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><FiTrendingDown /> Deductions</h5>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm"><span className="font-bold">PF Contribution</span><span className="font-black">{formatCurrency(employee.settlement.pf)}</span></div>
                  <div className="flex justify-between text-sm"><span className="font-bold">Professional Tax</span><span className="font-black">{formatCurrency(employee.settlement.professionalTax)}</span></div>
                  <div className="flex justify-between text-sm"><span className="font-bold">Other Deductions</span><span className="font-black">{formatCurrency(employee.settlement.otherDeductions)}</span></div>
                  <div className={`flex justify-between pt-4 mt-4 border-t-2 ${isDarkMode ? 'border-rose-900/30' : 'border-rose-200'} font-black text-lg text-rose-600`}>
                    <span>Deduction Total</span><span>{formatCurrency(employee.settlement.grossDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-8 p-10 rounded-[2.5rem] bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white shadow-2xl flex flex-col items-center text-center gap-6`}>
              <div className="flex flex-col gap-1 text-center">
                <span className="font-black text-xs uppercase tracking-[0.2em] text-white/70">Final Net Payable Amount</span>
                <p className="text-[10px] font-bold text-white/50 uppercase">Values verified by auditory system</p>
              </div>
              <span className="text-5xl font-black tracking-tighter drop-shadow-2xl">{formatCurrency(employee.settlement.netPayable)}</span>
            </div>

            <div className="flex flex-col gap-4 mt-10">
              <button className={`w-full px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}>
                <FiDownload className="inline-block mr-2 w-4 h-4" /> Download Statement
              </button>
              <button className="w-full px-8 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
                Finalize Payout
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FnFFormView = ({ onBack, isDarkMode }) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="w-full max-w-[450px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-8 duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20 bg-gradient-to-r from-white to-[#F8FAFF]">
        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Initiate New Settlement
          </h3>
        </div>
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
          <X size={18} />
        </button>
      </div>
      <div className="p-10 flex flex-col items-center justify-center text-center gap-6 bg-[#FAFAF8]">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-[#0D47A1] mb-2 shadow-sm border border-blue-100">
          <FiDollarSign className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#1A1A2E]">Settlement Calculator</h3>
        <p className="text-[#9B9BAD] max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px]">Please select an employee from the "Exit Records" to begin the full and final settlement calculation process.</p>
        <button onClick={onBack} className="mt-4 w-full py-4 bg-[#0D47A1] text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all">Select Employee</button>
      </div>
    </motion.div>
  );
};

const FnFTab = ({ isDarkMode, selectedClient }) => {
  const [fnfData, setFnfData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState('list'); // 'list', 'details', 'form'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const mockData = [
      {
        id: 1, empId: 'EMP010', name: 'Rajesh Khanna', department: 'Engineering', lastWorkingDay: '2026-03-15', status: 'pending',
        photo: 'https://randomuser.me/api/portraits/men/52.jpg',
        settlement: {
          basicSalary: 50000, hra: 20000, leavesEncashed: 8, leaveAmount: 15385, bonus: 10000, gratuity: 0,
          pf: 12000, professionalTax: 200, otherDeductions: 500,
          grossEarnings: 95385, grossDeductions: 12700, netPayable: 82685
        }
      },
      {
        id: 2, empId: 'EMP011', name: 'Suman Devi', department: 'Marketing', lastWorkingDay: '2026-03-31', status: 'processing',
        photo: 'https://randomuser.me/api/portraits/women/55.jpg',
        settlement: {
          basicSalary: 45000, hra: 18000, leavesEncashed: 12, leaveAmount: 20769, bonus: 8000, gratuity: 25000,
          pf: 10800, professionalTax: 200, otherDeductions: 300,
          grossEarnings: 116769, grossDeductions: 11300, netPayable: 105469
        }
      },
      {
        id: 3, empId: 'EMP012', name: 'Anil Kapoor', department: 'Sales', lastWorkingDay: '2026-02-10', status: 'completed',
        photo: 'https://randomuser.me/api/portraits/men/58.jpg',
        settlement: {
          basicSalary: 60000, hra: 24000, leavesEncashed: 5, leaveAmount: 11538, bonus: 15000, gratuity: 50000,
          pf: 14400, professionalTax: 200, otherDeductions: 1000,
          grossEarnings: 160538, grossDeductions: 15600, netPayable: 144938
        }
      },
    ];
    setTimeout(() => {
      setFnfData(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-violet-500 to-purple-600', 'from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-cyan-500 to-blue-600',
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { bg: 'bg-amber-50 text-amber-600 border-amber-100', text: 'text-amber-600', gradient: 'from-amber-400 via-orange-500 to-orange-600', icon: FiClock },
      'processing': { bg: 'bg-blue-50 text-blue-600 border-blue-100', text: 'text-blue-600', gradient: 'from-blue-600 to-blue-900', icon: FiAlertCircle },
      'completed': { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', text: 'text-emerald-600', gradient: 'from-[#81C784] via-[#66BB6A] to-[#43A047]', icon: FiCheck },
    };
    return configs[status] || configs['pending'];
  };

  const totalAmount = fnfData.reduce((acc, f) => acc + f.settlement.netPayable, 0);

  const statCards = [
    { key: 'total', label: 'Settlement Funnel', value: fnfData.length, icon: FiFileText, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]' },
    { key: 'completed', label: 'Finalized', value: fnfData.filter(f => f.status === 'completed').length, icon: FiCheck, gradient: 'from-[#81C784] via-[#66BB6A] to-[#43A047]' },
    { key: 'processing', label: 'Processing', value: fnfData.filter(f => f.status === 'processing').length, icon: FiAlertCircle, gradient: 'from-blue-600 to-blue-900' },
    { key: 'pending', label: 'Awaiting Review', value: fnfData.filter(f => f.status === 'pending').length, icon: FiClock, gradient: 'from-amber-400 via-orange-500 to-orange-600' },
  ];

  const filteredData = fnfData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-48 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-48 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-10 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
          <motion.div
            key="fnf-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            className="space-y-10"
          >
            {/* Modern Header (Matched with Screenshot) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8 flex-wrap gap-4"
            >
              <div className="text-left flex items-center gap-4">
                <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Full & Final Settlement
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView('form')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D47A1] text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0a3a82] transition-all active:scale-95"
                >
                  <Plus size={18} /> Initiate Settlement
                </button>
              </div>
            </motion.div>


            {/* Modern Search & Filters Unification */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 mt-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
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
                  <option value="all">Global settlements</option>
                  <option value="pending">Awaiting Review</option>
                  <option value="processing">In Processing</option>
                  <option value="completed">Finalized</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
              </div>
            </motion.div>

            {/* Modern Table Interface */}
            <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className={`grid grid-cols-[1.5fr_150px_150px_150px_150px_40px] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
                {["Employee", "Net Payable", "Department", "Exit Date", "Status", ""].map((h, i) => (
                  <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
                    {h}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <AnimatePresence mode="popLayout">
                  {filteredData.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No settlements found</p>
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
                          className={`grid grid-cols-[1.5fr_150px_150px_150px_150px_40px] gap-4 items-center px-8 py-3 border-b last:border-0 cursor-pointer transition-all group relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'}`}
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
                            <p className="text-[14px] font-black text-[#1E88E5]">{formatCurrency(emp.settlement.netPayable)}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] font-bold text-[#6B6B7E]">{emp.department}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] font-bold text-[#6B6B7E]">
                              {new Date(emp.lastWorkingDay).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-left">
                            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 inline-flex border ${statusConfig.bg}`}>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.text}`}>
                                {emp.status}
                              </span>
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
                  <div className="w-full max-w-lg pointer-events-auto flex items-center justify-center">
                    <FnFFormView onBack={() => setView('list')} isDarkMode={isDarkMode} />
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
                  <FnFDetailView
                    key="fnf-details"
                    employee={selectedEmployee}
                    onBack={() => setView('list')}
                    isDarkMode={isDarkMode}
                    formatCurrency={formatCurrency}
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

export default FnFTab;