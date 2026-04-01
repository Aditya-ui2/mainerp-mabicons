import { useState, useEffect } from 'react';
import { FiDollarSign, FiFileText, FiDownload, FiCheck, FiClock, FiAlertCircle, FiEye, FiPlus, FiSearch, FiChevronDown, FiX, FiTrendingUp, FiTrendingDown, FiPercent, FiArrowLeft, FiArrowRight, FiBriefcase } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getFnFList } from '../../../service/api';

const FnFDetailView = ({ employee, onBack, isDarkMode, formatCurrency, getStatusConfig }) => {
  const statusConfig = getStatusConfig(employee.status);

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
          className={`p-2.5 rounded-xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 onClick={onBack} className="text-2xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity select-none">
            Settlement Breakdown
          </h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'}`}>Final auditory and payout overview</p>
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
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <div className={`p-10 rounded-[3rem] border-2 shadow-2xl ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h4 className="font-black text-blue-600 flex items-center gap-2 uppercase tracking-widest text-xs mb-10">
              <FiBriefcase className="w-4 h-4" /> Comprehensive Settlement Audit
            </h4>

            <div className="grid md:grid-cols-2 gap-8">
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

            <div className={`mt-8 p-10 rounded-[2.5rem] bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6`}>
              <div className="flex flex-col gap-1 text-center md:text-left">
                <span className="font-black text-xs uppercase tracking-[0.2em] text-white/70">Final Net Payable Amount</span>
                <p className="text-[10px] font-bold text-white/50 uppercase">Values verified by auditory system</p>
              </div>
              <span className="text-5xl font-black tracking-tighter drop-shadow-2xl">{formatCurrency(employee.settlement.netPayable)}</span>
            </div>

            <div className="flex gap-4 mt-10">
              <button className={`flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}>
                <FiDownload className="inline-block mr-2 w-4 h-4" /> Download Statement
              </button>
              <button className="flex-1 px-8 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
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
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      className={`w-full ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      <div className="flex items-center gap-4 mb-10 text-left">
        <button onClick={onBack} className={`p-2.5 rounded-xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'}`}>
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent">Initiate New Settlement</h2>
      </div>
      <div className={`p-12 rounded-[3rem] border-2 shadow-2xl flex flex-col items-center justify-center text-center gap-6 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
          <FiDollarSign className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black">Settlement Calculator</h3>
        <p className="text-slate-400 max-w-md mx-auto font-bold uppercase tracking-widest text-[10px]">Please select an employee from the "Exit Records" to begin the full and final settlement calculation process.</p>
        <button onClick={onBack} className="mt-6 px-10 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30">Select Employee</button>
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
    const fetchFnF = async () => {
      try {
        setLoading(true);
        const response = await getFnFList({ 
          department: 'HR Operations' 
        });
        
        if (response.success) {
          const mappedData = (response.list || []).map(f => ({
            id: f.id,
            empId: f.memberId?.substring(0, 8).toUpperCase() || 'EMP-TEMP',
            name: f.memberName,
            department: f.department || 'HR Operations',
            lastWorkingDay: f.lastWorkingDay || new Date().toISOString(),
            status: f.status?.toLowerCase() || 'pending',
            photo: null,
            settlement: {
              basicSalary: parseFloat(f.basicSalary) || 0,
              hra: parseFloat(f.hra) || 0,
              leavesEncashed: parseFloat(f.leavesEncashed) || 0,
              leaveAmount: parseFloat(f.leaveAmount) || 0,
              bonus: parseFloat(f.bonus) || 0,
              gratuity: parseFloat(f.gratuity) || 0,
              pf: parseFloat(f.pf) || 0,
              professionalTax: parseFloat(f.professionalTax) || 0,
              otherDeductions: parseFloat(f.otherDeductions) || 0,
              grossEarnings: parseFloat(f.grossEarnings) || 0,
              grossDeductions: parseFloat(f.grossDeductions) || 0,
              netPayable: parseFloat(f.netPayable) || 0
            }
          }));
          setFnfData(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch FnF:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFnF();
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
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className={`h-48 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
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
            key="fnf-list"
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
                    <FiDollarSign className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent tracking-tight">
                    Full & Final Settlement
                  </h2>
                </div>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#1E88E5]'} tracking-wide ml-1`}>
                  Manage final dues, clearancess, and exit payouts
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('form')}
                className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all uppercase tracking-widest text-xs mt-1"
              >
                <FiPlus className="w-5 h-5" />
                Initiate Settlement
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredCard(stat.key)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer border-2 ${
                    isDarkMode 
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
                      <p className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0D47A1]'}`}>
                        {stat.value}
                      </p>
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

              {/* Total Amount Card - Special */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`relative overflow-hidden rounded-2xl p-5 border-2 col-span-2 lg:col-span-1 border-blue-200 shadow-lg ${
                    isDarkMode 
                      ? 'bg-slate-800/80 border-slate-700/50' 
                      : 'bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 text-white'
                }`}
              >
                <div className="relative flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <p className={`text-[10px] font-extrabold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-white/80'}`}>
                        Total Payable
                      </p>
                      <div className={`p-2 rounded-xl bg-white/20 backdrop-blur-md shadow-lg`}>
                        <FiDollarSign className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-tighter drop-shadow-md">
                        {formatCurrency(totalAmount)}
                      </p>
                      <p className={`text-[9px] font-bold mt-1 uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-white/60'}`}>
                        System Audit Ready
                      </p>
                    </div>
                </div>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-6">
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
                  <option value="all">Global settlements</option>
                  <option value="pending">Awaiting Review</option>
                  <option value="processing">In Processing</option>
                  <option value="completed">Finalized</option>
                </select>
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-8 pb-12">
              <AnimatePresence mode="popLayout">
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

                          {/* Amounts */}
                          <div className="flex-1 max-w-2xl lg:px-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Payable</span>
                                <p className="text-2xl font-black text-[#1E88E5] tracking-tight">{formatCurrency(emp.settlement.netPayable)}</p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exit Date</span>
                                <p className="font-bold text-sm tracking-tight">{new Date(emp.lastWorkingDay).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              </div>
                              <div className="hidden md:flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gross Earnings</span>
                                <p className="font-bold text-sm tracking-tight text-emerald-600">{formatCurrency(emp.settlement.grossEarnings)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="flex flex-row lg:flex-row items-center justify-between gap-8 pt-10 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100/50 dark:border-slate-800/50 lg:pl-10">
                            <div className="text-center lg:text-right">
                              <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all border ${statusConfig.bg} ${statusConfig.text}`}>
                                <span className={`w-2.5 h-2.5 rounded-full bg-current animate-pulse`}></span>
                                {emp.status}
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ x: 5, scale: 1.1 }}
                              className="p-4 rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
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
          <FnFDetailView
            key="fnf-details"
            employee={selectedEmployee}
            onBack={() => setView('list')}
            isDarkMode={isDarkMode}
            formatCurrency={formatCurrency}
            getStatusConfig={getStatusConfig}
          />
        ) : (
          <FnFFormView
            key="fnf-form"
            onBack={() => setView('list')}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FnFTab;
