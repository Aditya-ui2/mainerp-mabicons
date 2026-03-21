import { useState, useEffect } from 'react';
import { FiDollarSign, FiFileText, FiDownload, FiCheck, FiClock, FiAlertCircle, FiEye, FiPlus, FiSearch, FiChevronDown, FiX, FiTrendingUp, FiTrendingDown, FiPercent } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FnFTab = ({ isDarkMode, selectedClient }) => {
  const [fnfData, setFnfData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(null);
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
      'pending': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', gradient: 'from-amber-500 to-orange-600', icon: FiClock },
      'processing': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', gradient: 'from-blue-500 to-indigo-600', icon: FiAlertCircle },
      'completed': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', gradient: 'from-emerald-500 to-teal-600', icon: FiCheck },
    };
    return configs[status];
  };

  const totalAmount = fnfData.reduce((acc, f) => acc + f.settlement.netPayable, 0);

  const statCards = [
    { key: 'total', label: 'Total Cases', value: fnfData.length, icon: FiFileText, gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50' },
    { key: 'pending', label: 'Pending', value: fnfData.filter(f => f.status === 'pending').length, icon: FiClock, gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50' },
    { key: 'processing', label: 'Processing', value: fnfData.filter(f => f.status === 'processing').length, icon: FiAlertCircle, gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50' },
    { key: 'completed', label: 'Completed', value: fnfData.filter(f => f.status === 'completed').length, icon: FiCheck, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50' },
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
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <FiDollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Full & Final Settlement
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Process employee final settlements
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25"
        >
          <FiPlus className="w-4 h-4" />
          New Settlement
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div 
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setHoveredCard(stat.key)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : `${stat.lightBg} border border-white/50 hover:shadow-xl`
            } ${hoveredCard === stat.key ? 'scale-[1.02]' : ''}`}
          >
            <div className="relative flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Total Amount Card - Special */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-500/25"
        >
          <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="70" cy="30" r="40" fill="white" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-sm font-medium text-white/80">Total Amount</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalAmount)}</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
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
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* FnF Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredData.map((emp, index) => {
            const statusConfig = getStatusConfig(emp.status);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div 
                key={emp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-slate-300'
                }`}
              >
                <div className={`h-1.5 bg-gradient-to-r ${statusConfig.gradient}`}></div>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {emp.photo ? (
                        <div className="relative">
                          <img 
                            src={emp.photo} 
                            alt={emp.name}
                            className="w-14 h-14 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarGradient(emp.name)} items-center justify-center text-white text-xl font-bold shadow-lg hidden`}>
                            {emp.name.charAt(0)}
                          </div>
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarGradient(emp.name)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                          {emp.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{emp.name}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {emp.empId} • {emp.department} • LWD: {new Date(emp.lastWorkingDay).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Net Payable</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">{formatCurrency(emp.settlement.netPayable)}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold capitalize ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-4 h-4" />
                        {emp.status}
                      </span>
                    </div>
                  </div>

                  {/* Quick Summary */}
                  <div className={`grid grid-cols-3 gap-4 mt-5 pt-5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-emerald-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <FiTrendingUp className="w-4 h-4 text-emerald-500" />
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Gross Earnings</p>
                      </div>
                      <p className="font-bold text-lg text-emerald-600">{formatCurrency(emp.settlement.grossEarnings)}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-rose-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <FiTrendingDown className="w-4 h-4 text-rose-500" />
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Deductions</p>
                      </div>
                      <p className="font-bold text-lg text-rose-600">{formatCurrency(emp.settlement.grossDeductions)}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <FiPercent className="w-4 h-4 text-blue-500" />
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Leaves Encashed</p>
                      </div>
                      <p className="font-bold text-lg text-blue-600">{emp.settlement.leavesEncashed} days</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal(emp)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl"
                    >
                      <FiEye className="w-4 h-4" /> View Details
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"
                    >
                      <FiDownload className="w-4 h-4" /> Download
                    </motion.button>
                    {emp.status === 'pending' && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"
                      >
                        <FiCheck className="w-4 h-4" /> Process
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className={`h-2 bg-gradient-to-r ${getStatusConfig(showModal.status).gradient} rounded-t-3xl`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getAvatarGradient(showModal.name)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                      {showModal.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{showModal.name}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{showModal.empId} • {showModal.department}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(null)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-800/50' : 'bg-emerald-50 border border-emerald-100'}`}>
                    <h4 className="font-bold mb-4 text-emerald-600 flex items-center gap-2"><FiTrendingUp /> Earnings</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-slate-300' : ''}>Basic Salary</span><span className="font-semibold">{formatCurrency(showModal.settlement.basicSalary)}</span></div>
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-slate-300' : ''}>HRA</span><span className="font-semibold">{formatCurrency(showModal.settlement.hra)}</span></div>
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-slate-300' : ''}>Leave ({showModal.settlement.leavesEncashed} days)</span><span className="font-semibold">{formatCurrency(showModal.settlement.leaveAmount)}</span></div>
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-slate-300' : ''}>Bonus</span><span className="font-semibold">{formatCurrency(showModal.settlement.bonus)}</span></div>
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-slate-300' : ''}>Gratuity</span><span className="font-semibold">{formatCurrency(showModal.settlement.gratuity)}</span></div>
                      <div className={`flex justify-between font-bold pt-3 mt-2 border-t ${isDarkMode ? 'border-emerald-800' : 'border-emerald-200'}`}>
                        <span>Gross Earnings</span><span className="text-emerald-600 text-lg">{formatCurrency(showModal.settlement.grossEarnings)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-rose-900/20 border border-rose-800/50' : 'bg-rose-50 border border-rose-100'}`}>
                    <h4 className="font-bold mb-4 text-rose-600 flex items-center gap-2"><FiTrendingDown /> Deductions</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-slate-300' : ''}>PF Contribution</span><span className="font-semibold">{formatCurrency(showModal.settlement.pf)}</span></div>
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-slate-300' : ''}>Professional Tax</span><span className="font-semibold">{formatCurrency(showModal.settlement.professionalTax)}</span></div>
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-slate-300' : ''}>Other Deductions</span><span className="font-semibold">{formatCurrency(showModal.settlement.otherDeductions)}</span></div>
                      <div className={`flex justify-between font-bold pt-3 mt-2 border-t ${isDarkMode ? 'border-rose-800' : 'border-rose-200'}`}>
                        <span>Gross Deductions</span><span className="text-rose-600 text-lg">{formatCurrency(showModal.settlement.grossDeductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-6 p-5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg text-white/90">Net Payable Amount</span>
                    <span className="font-bold text-3xl">{formatCurrency(showModal.settlement.netPayable)}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(null)} 
                    className={`flex-1 px-4 py-3 rounded-xl font-medium border-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    Close
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" /> Download PDF
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FnFTab;
