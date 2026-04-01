import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiCheckCircle, FiAlertTriangle, FiClock, FiFileText, FiCalendar, FiDownload, FiEye, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { getDeptCompliance } from '../../../service/api';

const ComplianceTab = ({ isDarkMode, selectedClient }) => {
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedCompliance, setSelectedCompliance] = useState(null);

  const categories = ['Statutory', 'Tax', 'Labour Law', 'Health & Safety', 'Data Protection', 'Industry Specific'];

  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        setLoading(true);
        const response = await getDeptCompliance({ 
          department: 'HR Operations' 
        });
        
        if (response.success) {
          const mappedData = (response.complianceTasks || []).map(c => ({
            id: c.id,
            title: c.title,
            category: c.category || 'Statutory',
            dueDate: c.dueDate || new Date().toISOString().split('T')[0],
            status: c.status?.toLowerCase() || 'pending',
            client: c.clientName || 'General',
            filedDate: c.filedAt || null,
            penalty: parseFloat(c.penalty) || 0
          }));
          setCompliances(mappedData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch compliance:', error);
        setLoading(false);
      }
    };

    fetchCompliance();
  }, [selectedClient]);

  const stats = {
    total: compliances.length,
    completed: compliances.filter(c => c.status === 'completed').length,
    pending: compliances.filter(c => c.status === 'pending').length,
    overdue: compliances.filter(c => c.status === 'overdue').length,
    totalPenalty: compliances.reduce((acc, c) => acc + c.penalty, 0),
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: FiShield, gradient: 'from-violet-500 to-purple-600', shadowColor: 'shadow-violet-500/25' },
    { label: 'Completed', value: stats.completed, icon: FiCheckCircle, gradient: 'from-emerald-500 to-green-600', shadowColor: 'shadow-emerald-500/25' },
    { label: 'Pending', value: stats.pending, icon: FiClock, gradient: 'from-amber-500 to-yellow-600', shadowColor: 'shadow-amber-500/25' },
    { label: 'Overdue', value: stats.overdue, icon: FiAlertTriangle, gradient: 'from-red-500 to-rose-600', shadowColor: 'shadow-red-500/25' },
  ];

  const getStatusConfig = (status) => {
    const configs = {
      'completed': { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: FiCheckCircle, gradient: 'from-emerald-500 to-green-600' },
      'pending': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: FiClock, gradient: 'from-amber-500 to-yellow-600' },
      'in-progress': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: FiFileText, gradient: 'from-blue-500 to-cyan-600' },
      'overdue': { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: FiAlertTriangle, gradient: 'from-red-500 to-rose-600' },
    };
    return configs[status];
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      'Statutory': 'from-violet-500 to-purple-600',
      'Tax': 'from-blue-500 to-cyan-600',
      'Labour Law': 'from-emerald-500 to-green-600',
      'Health & Safety': 'from-orange-500 to-amber-600',
      'Data Protection': 'from-pink-500 to-rose-600',
      'Industry Specific': 'from-teal-500 to-cyan-600',
    };
    return gradients[category] || 'from-gray-500 to-slate-600';
  };

  const filteredCompliances = compliances.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Skeleton Loader
  if (loading) {
    return (
      <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        <div className="flex justify-between items-center">
          <div>
            <div className={`h-8 w-64 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
            <div className={`h-4 w-48 rounded mt-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
          </div>
          <div className={`h-10 w-40 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-24 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-40 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div 
            className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <FiShield className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Compliance Management
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Track statutory and regulatory compliances
            </p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-shadow"
        >
          <FiPlus className="w-5 h-5" />
          Add Compliance
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            onMouseEnter={() => setHoveredCard(stat.label)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative p-4 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
            } ${hoveredCard === stat.label ? `shadow-xl ${stat.shadowColor}` : 'shadow-lg'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 transition-opacity duration-300 ${hoveredCard === stat.label ? 'opacity-10' : ''}`} />
            <div className="relative flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg ${stat.shadowColor}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {/* Penalty Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'}`}
        >
          <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>Total Penalties</p>
          <p className="text-2xl font-bold text-red-500">₹{stats.totalPenalty.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Overdue Alert */}
      <AnimatePresence>
        {stats.overdue > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            className={`flex items-center gap-3 p-4 rounded-2xl border ${
              isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-700'
            }`}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <FiAlertTriangle className="w-6 h-6 text-red-500" />
            </motion.div>
            <p className="font-medium">{stats.overdue} compliance(s) are overdue! Please take immediate action.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search compliances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 pl-11 transition-all duration-300 focus:ring-2 focus:ring-violet-500/50 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`rounded-xl border px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-violet-500/50 ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
          }`}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`rounded-xl border px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-violet-500/50 ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
          }`}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </motion.div>

      {/* Compliance Cards */}
      <AnimatePresence mode="popLayout">
        <div className="grid gap-4">
          {filteredCompliances.map((compliance, index) => {
            const statusConfig = getStatusConfig(compliance.status);
            const StatusIcon = statusConfig.icon;
            const daysRemaining = getDaysRemaining(compliance.dueDate);
            return (
              <motion.div
                key={compliance.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                } ${compliance.status === 'overdue' ? 'border-l-4 border-l-red-500' : ''} hover:shadow-xl`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getCategoryGradient(compliance.category)} shadow-lg`}>
                      <FiFileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-lg">{compliance.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryGradient(compliance.category)} text-white`}>
                          {compliance.category}
                        </span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Client: <span className="font-medium text-violet-500">{compliance.client}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-right">
                      <p className={`flex items-center gap-1 justify-end ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <FiCalendar className="w-4 h-4" /> Due: {compliance.dueDate}
                      </p>
                      {compliance.status !== 'completed' && compliance.status !== 'overdue' && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-xs mt-1 font-medium ${daysRemaining <= 3 ? 'text-red-500' : daysRemaining <= 7 ? 'text-yellow-500' : 'text-green-500'}`}
                        >
                          {daysRemaining} days remaining
                        </motion.p>
                      )}
                      {compliance.status === 'completed' && (
                        <p className="text-xs mt-1 text-green-500 font-medium">Filed: {compliance.filedDate}</p>
                      )}
                    </div>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {compliance.status.replace('-', ' ')}
                    </motion.span>
                  </div>
                </div>

                <AnimatePresence>
                  {compliance.penalty > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-3 p-3 rounded-xl text-sm flex items-center gap-2 ${
                        isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      <FiAlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Penalty: ₹{compliance.penalty.toLocaleString()}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`flex gap-2 mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCompliance(compliance)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    <FiEye className="w-4 h-4" /> View Details
                  </motion.button>
                  {compliance.status !== 'completed' && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
                    >
                      <FiCheckCircle className="w-4 h-4" /> Mark Complete
                    </motion.button>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    <FiDownload className="w-4 h-4" /> Documents
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCompliance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCompliance(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getCategoryGradient(selectedCompliance.category)} shadow-lg`}>
                    <FiShield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCompliance.title}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedCompliance.category}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCompliance(null)}
                  className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Client</p>
                  <p className="font-semibold text-violet-500">{selectedCompliance.client}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Due Date</p>
                    <p className="font-semibold flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-violet-500" />
                      {selectedCompliance.dueDate}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedCompliance.status).color}`}>
                      {selectedCompliance.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {selectedCompliance.filedDate && (
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Filed Date</p>
                    <p className="font-semibold text-emerald-500">{selectedCompliance.filedDate}</p>
                  </div>
                )}

                {selectedCompliance.penalty > 0 && (
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Penalty Amount</p>
                    <p className="font-bold text-red-500 text-xl">₹{selectedCompliance.penalty.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {selectedCompliance.status !== 'completed' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg"
                  >
                    <FiCheckCircle className="w-5 h-5" />
                    Mark Complete
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCompliance(null)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium ${
                    isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ComplianceTab;
