import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiCalendar, FiTrendingUp, FiFileText, FiSearch, FiChevronDown, FiUsers, FiX, FiPrinter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Rupee Icon
const RupeeIcon = ({ className }) => (
  <span className={`font-bold ${className}`} style={{ fontFamily: 'Arial, sans-serif' }}>₹</span>
);

const PayrollTab = ({ isDarkMode, selectedClient }) => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayslip, setShowPayslip] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

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
  }, [selectedMonth, selectedClient]);

  const totals = payrollData.reduce((acc, emp) => ({
    basic: acc.basic + emp.basic,
    hra: acc.hra + emp.hra,
    allowances: acc.allowances + emp.allowances,
    deductions: acc.deductions + emp.deductions,
    netPay: acc.netPay + emp.netPay,
  }), { basic: 0, hra: 0, allowances: 0, deductions: 0, netPay: 0 });

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const statCards = [
    { key: 'basic', label: 'Total Basic', value: totals.basic, icon: RupeeIcon, gradient: 'from-blue-500 to-cyan-600', lightBg: 'bg-gradient-to-br from-blue-50 to-cyan-50', textColor: 'text-cyan-600' },
    { key: 'hra', label: 'Total HRA', value: totals.hra, icon: FiTrendingUp, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50', textColor: 'text-emerald-600' },
    { key: 'allowances', label: 'Allowances', value: totals.allowances, icon: FiCalendar, gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50', textColor: 'text-violet-600' },
    { key: 'deductions', label: 'Deductions', value: totals.deductions, icon: RupeeIcon, gradient: 'from-rose-500 to-pink-600', lightBg: 'bg-gradient-to-br from-rose-50 to-pink-50', isNegative: true, textColor: 'text-rose-500' },
    { key: 'netPay', label: 'Net Payable', value: totals.netPay, icon: RupeeIcon, gradient: 'from-indigo-500 to-violet-600', lightBg: 'bg-gradient-to-br from-indigo-50 to-violet-50', isPrimary: true, textColor: 'text-indigo-600' },
  ];

  const getAvatarColor = (name) => {
    const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredData = payrollData.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMonth = (dateString) => {
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <RupeeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Payroll Management
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {formatMonth(selectedMonth)} • {payrollData.length} Employees
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-emerald-500/50 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25"
          >
            <FiFileText className="w-4 h-4" />
            Run Payroll
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25"
          >
            <FiDownload className="w-4 h-4" />
            Export
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
            } ${hoveredCard === card.key ? 'scale-[1.02]' : ''} ${card.isPrimary ? 'lg:col-span-1' : ''}`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="80" cy="20" r="40" fill="currentColor" />
              </svg>
            </div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{card.label}</p>
                <p className={`text-lg lg:text-xl font-bold truncate ${isDarkMode ? 'text-white' : card.textColor}`}>
                  {card.isNegative ? '-' : ''}{formatCurrency(card.value)}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg flex-shrink-0`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative max-w-md"
      >
        <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Search employee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-emerald-500/50 ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
          }`}
        />
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
          <table className="w-full">
            <thead>
              <tr className={`${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-50 to-slate-100'}`}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Designation</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Basic</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">HRA</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Allowances</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Deductions</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Net Pay</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
              <AnimatePresence>
                {filteredData.map((emp, index) => (
                  <motion.tr 
                    key={emp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-emerald-50/50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {emp.photo ? (
                          <div className="relative">
                            <img 
                              src={emp.photo} 
                              alt={emp.name}
                              className="w-10 h-10 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} items-center justify-center text-white font-bold text-sm shadow-lg hidden`}>
                              {emp.avatar}
                            </div>
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                            {emp.avatar}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{emp.name}</p>
                          <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{emp.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{emp.designation}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(emp.basic)}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(emp.hra)}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(emp.allowances)}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-rose-500">-{formatCurrency(emp.deductions)}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">{formatCurrency(emp.netPay)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        emp.status === 'processed' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'processed' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowPayslip(emp)}
                          className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <FiDownload className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
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
                Total Payable: <span className="text-emerald-600 font-bold">{formatCurrency(totals.netPay)}</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payslip Modal */}
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
              className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(showPayslip.name)} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {showPayslip.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{showPayslip.name}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{showPayslip.empId} • {showPayslip.designation}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPayslip(null)} 
                  className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Pay Period */}
              <div className={`px-4 py-3 rounded-xl mb-6 ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                <p className="text-sm text-center">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Pay Period:</span>
                  <span className="font-semibold ml-2">{formatMonth(selectedMonth)}</span>
                </p>
              </div>

              {/* Earnings & Deductions */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-900/30' : 'bg-emerald-50 border border-emerald-100'}`}>
                  <h4 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
                    <FiTrendingUp className="w-4 h-4" /> Earnings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span>Basic Salary</span><span className="font-medium">{formatCurrency(showPayslip.basic)}</span></div>
                    <div className="flex justify-between text-sm"><span>HRA</span><span className="font-medium">{formatCurrency(showPayslip.hra)}</span></div>
                    <div className="flex justify-between text-sm"><span>Allowances</span><span className="font-medium">{formatCurrency(showPayslip.allowances)}</span></div>
                    <div className={`flex justify-between font-bold pt-3 border-t ${isDarkMode ? 'border-emerald-900/30' : 'border-emerald-200'}`}>
                      <span>Gross</span>
                      <span className="text-emerald-600">{formatCurrency(showPayslip.basic + showPayslip.hra + showPayslip.allowances)}</span>
                    </div>
                  </div>
                </div>
                <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-rose-900/20 border border-rose-900/30' : 'bg-rose-50 border border-rose-100'}`}>
                  <h4 className="font-bold text-rose-600 mb-4 flex items-center gap-2">
                    <RupeeIcon className="w-4 h-4" /> Deductions
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span>PF</span><span className="font-medium">{formatCurrency(showPayslip.deductions * 0.5)}</span></div>
                    <div className="flex justify-between text-sm"><span>Tax</span><span className="font-medium">{formatCurrency(showPayslip.deductions * 0.3)}</span></div>
                    <div className="flex justify-between text-sm"><span>Others</span><span className="font-medium">{formatCurrency(showPayslip.deductions * 0.2)}</span></div>
                    <div className={`flex justify-between font-bold pt-3 border-t ${isDarkMode ? 'border-rose-900/30' : 'border-rose-200'}`}>
                      <span>Total</span>
                      <span className="text-rose-600">{formatCurrency(showPayslip.deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className={`p-5 rounded-2xl mb-6 bg-gradient-to-r ${isDarkMode ? 'from-violet-900/50 to-purple-900/50' : 'from-violet-100 to-purple-100'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Net Pay</span>
                  <span className="font-bold text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(showPayslip.netPay)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPayslip(null)} 
                  className={`flex-1 px-4 py-3 rounded-xl font-medium border-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  Close
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                >
                  <FiDownload className="w-4 h-4" />
                  Download PDF
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
