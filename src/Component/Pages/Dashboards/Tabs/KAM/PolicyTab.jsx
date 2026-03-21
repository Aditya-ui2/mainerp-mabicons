import { useState, useEffect } from 'react';
import { FiBook, FiPlus, FiEdit2, FiTrash2, FiDownload, FiEye, FiCalendar, FiAlertCircle, FiCheckCircle, FiSearch, FiChevronDown, FiX, FiFileText, FiLayers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const PolicyTab = ({ isDarkMode, selectedClient }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewPolicy, setViewPolicy] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const categories = ['HR', 'Leave', 'Attendance', 'Code of Conduct', 'IT Security', 'Travel', 'Expense', 'Health & Safety', 'Compliance'];

  useEffect(() => {
    const mockData = [
      { id: 1, title: 'Leave Policy 2026', category: 'Leave', description: 'Comprehensive leave policy covering all types of leaves including sick, casual, earned, and special leaves.', version: '2.0', effectiveFrom: '2026-01-01', status: 'active', lastUpdated: '2025-12-15', updatedBy: 'HR Manager' },
      { id: 2, title: 'Remote Work Policy', category: 'HR', description: 'Guidelines for work from home arrangements, eligibility, and productivity expectations.', version: '1.5', effectiveFrom: '2025-06-01', status: 'active', lastUpdated: '2025-05-20', updatedBy: 'HR Director' },
      { id: 3, title: 'Code of Conduct', category: 'Code of Conduct', description: 'Professional behavior standards, ethics guidelines, and workplace conduct expectations.', version: '3.0', effectiveFrom: '2024-01-01', status: 'active', lastUpdated: '2024-01-01', updatedBy: 'Legal Team' },
      { id: 4, title: 'Data Security Policy', category: 'IT Security', description: 'Information security guidelines, data handling procedures, and compliance requirements.', version: '2.1', effectiveFrom: '2025-09-01', status: 'active', lastUpdated: '2025-08-25', updatedBy: 'IT Security' },
      { id: 5, title: 'Travel & Expense Policy', category: 'Travel', description: 'Business travel guidelines, expense claims, and reimbursement procedures.', version: '1.8', effectiveFrom: '2025-04-01', status: 'under-review', lastUpdated: '2026-02-10', updatedBy: 'Finance Team' },
      { id: 6, title: 'Attendance Policy', category: 'Attendance', description: 'Working hours, punctuality expectations, overtime rules, and attendance tracking.', version: '2.2', effectiveFrom: '2026-01-01', status: 'active', lastUpdated: '2025-12-20', updatedBy: 'HR Manager' },
    ];
    setTimeout(() => {
      setPolicies(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const getStatusConfig = (status) => {
    const configs = {
      'active': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', icon: FiCheckCircle },
      'under-review': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', icon: FiAlertCircle },
      'draft': { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500', icon: FiEdit2 },
      'archived': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500', icon: FiBook },
    };
    return configs[status] || configs['active'];
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      'HR': 'from-violet-500 to-purple-600',
      'Leave': 'from-blue-500 to-cyan-600',
      'Attendance': 'from-emerald-500 to-teal-600',
      'Code of Conduct': 'from-rose-500 to-pink-600',
      'IT Security': 'from-orange-500 to-amber-600',
      'Travel': 'from-yellow-500 to-lime-600',
      'Expense': 'from-teal-500 to-cyan-600',
      'Health & Safety': 'from-pink-500 to-rose-600',
      'Compliance': 'from-indigo-500 to-violet-600',
    };
    return gradients[category] || 'from-slate-500 to-slate-600';
  };

  const statCards = [
    { key: 'total', label: 'Total Policies', value: policies.length, icon: FiBook, gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50' },
    { key: 'active', label: 'Active', value: policies.filter(p => p.status === 'active').length, icon: FiCheckCircle, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50' },
    { key: 'review', label: 'Under Review', value: policies.filter(p => p.status === 'under-review').length, icon: FiAlertCircle, gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50' },
    { key: 'cats', label: 'Categories', value: [...new Set(policies.map(p => p.category))].length, icon: FiLayers, gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50' },
  ];

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) || policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || policy.category === filterCategory;
    return matchesSearch && matchesCategory;
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className={`h-64 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <FiBook className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Policy Management
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage company policies and guidelines
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25"
        >
          <FiPlus className="w-4 h-4" />
          Add Policy
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="70" cy="30" r="40" fill="currentColor" />
              </svg>
            </div>
            <div className="relative flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-violet-500/50 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
        </div>
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Policies Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredPolicies.map((policy, index) => {
            const statusConfig = getStatusConfig(policy.status);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div 
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {/* Top gradient accent */}
                <div className={`h-1.5 bg-gradient-to-r ${getCategoryGradient(policy.category)}`}></div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg leading-tight">{policy.title}</h3>
                      <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${getCategoryGradient(policy.category)} text-white`}>
                        {policy.category}
                      </span>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {policy.status.replace('-', ' ')}
                    </span>
                  </div>

                  <p className={`text-sm line-clamp-2 mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {policy.description}
                  </p>

                  <div className={`text-xs space-y-2 mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <p className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>v{policy.version}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FiCalendar className="w-3.5 h-3.5" /> Effective: {new Date(policy.effectiveFrom).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className={`flex gap-2 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setViewPolicy(policy)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                    >
                      <FiEye className="w-4 h-4" /> View
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <FiDownload className="w-4 h-4" /> PDF
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 rounded-xl ml-auto transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View Policy Modal */}
      <AnimatePresence>
        {viewPolicy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewPolicy(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(viewPolicy.category)} rounded-t-3xl`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{viewPolicy.title}</h3>
                    <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${getCategoryGradient(viewPolicy.category)} text-white`}>
                      {viewPolicy.category}
                    </span>
                  </div>
                  <button onClick={() => setViewPolicy(null)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{viewPolicy.description}</p>
                  
                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Version</p><p className="font-semibold">{viewPolicy.version}</p></div>
                    <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</p><p className="font-semibold capitalize">{viewPolicy.status.replace('-', ' ')}</p></div>
                    <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Effective From</p><p className="font-semibold">{new Date(viewPolicy.effectiveFrom).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                    <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Last Updated</p><p className="font-semibold">{new Date(viewPolicy.lastUpdated).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                    <div className="col-span-2"><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Updated By</p><p className="font-semibold">{viewPolicy.updatedBy}</p></div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewPolicy(null)} 
                    className={`flex-1 px-4 py-3 rounded-xl font-medium border-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    Close
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" /> Download PDF
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Policy Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-3xl"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FiPlus className="w-5 h-5 text-violet-500" />
                    Add New Policy
                  </h3>
                  <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <form className="space-y-5">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Policy Title</label>
                    <input type="text" className={`w-full rounded-xl border-2 px-4 py-3 transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} placeholder="Enter policy title" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                      <select className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Effective From</label>
                      <input type="date" className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
                    <textarea rows={4} className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} placeholder="Policy description..." />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button" 
                      onClick={() => setShowAddModal(false)} 
                      className={`flex-1 px-4 py-3 rounded-xl font-medium border-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      Cancel
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25"
                    >
                      Save Policy
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PolicyTab;
