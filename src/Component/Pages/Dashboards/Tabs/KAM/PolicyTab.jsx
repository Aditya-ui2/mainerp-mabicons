

import { useState, useEffect } from 'react';
import { FiBook, FiPlus, FiEdit2, FiTrash2, FiDownload, FiEye, FiCalendar, FiAlertCircle, FiCheckCircle, FiSearch, FiChevronDown, FiX, FiFileText, FiLayers, FiArrowLeft, FiTarget, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const PolicyTab = ({ isDarkMode, selectedClient }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [view, setView] = useState('list');
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const categories = ['HR Management', 'Leave Management', 'Attendance Protocol', 'Code Of Conduct', 'IT Security', 'Travel & Expense', 'Health & Safety', 'Compliance Hub'];

  useEffect(() => {
    const mockData = [
      { id: 1, title: 'Leave Policy 2026', category: 'Leave Management', description: 'Comprehensive leave policy covering all types of leaves including sick, casual, earned, and special leaves.', version: '2.0', effectiveFrom: '2026-01-01', status: 'active', lastUpdated: '2025-12-15', updatedBy: 'HR Manager' },
      { id: 2, title: 'Remote Work Policy', category: 'HR Management', description: 'Guidelines for work from home arrangements, eligibility, and productivity expectations.', version: '1.5', effectiveFrom: '2025-06-01', status: 'active', lastUpdated: '2025-05-20', updatedBy: 'HR Director' },
      { id: 3, title: 'Code of Conduct', category: 'Code Of Conduct', description: 'Professional behavior standards, ethics guidelines, and workplace conduct expectations.', version: '3.0', effectiveFrom: '2024-01-01', status: 'active', lastUpdated: '2024-01-01', updatedBy: 'Legal Team' },
      { id: 4, title: 'Data Security Policy', category: 'IT Security', description: 'Information security guidelines, data handling procedures, and compliance requirements.', version: '2.1', effectiveFrom: '2025-09-01', status: 'active', lastUpdated: '2025-08-25', updatedBy: 'IT Security' },
      { id: 5, title: 'Travel & Expense Policy', category: 'Travel & Expense', description: 'Business travel guidelines, expense claims, and reimbursement procedures.', version: '1.8', effectiveFrom: '2025-04-01', status: 'under-review', lastUpdated: '2026-02-10', updatedBy: 'Finance Team' },
      { id: 6, title: 'Attendance Policy', category: 'Attendance Protocol', description: 'Working hours, punctuality expectations, overtime rules, and attendance tracking.', version: '2.2', effectiveFrom: '2026-01-01', status: 'active', lastUpdated: '2025-12-20', updatedBy: 'HR Manager' },
    ];
    setTimeout(() => {
      setPolicies(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const statCards = [
    { key: 'total', label: 'Policy Collection', value: policies.length, icon: FiBook, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]' },
    { key: 'active', label: 'Active Directives', value: policies.filter(p => p.status === 'active').length, icon: FiCheckCircle, gradient: 'from-[#81C784] via-[#66BB6A] to-[#43A047]' },
    { key: 'review', label: 'Audit Required', value: policies.filter(p => p.status === 'under-review').length, icon: FiAlertCircle, gradient: 'from-[#FFB300] to-[#F57C00]' },
    { key: 'cats', label: 'Registry Units', value: [...new Set(policies.map(p => p.category))].length, icon: FiLayers, gradient: 'from-[#6366F1] to-[#4F46E5]' },
  ];

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) || policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || policy.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[600px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10"
          >
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
              <div className="flex items-center gap-4 text-left">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20">
                  <FiBook className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-3xl lg:text-4xl font-black text-[#1E88E5] tracking-tight mb-1 font-[Outfit]">
                    Policy Management
                  </h2>
                  <div className="flex items-center gap-2 text-slate-600 font-bold font-[Outfit]">
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm">
                      Company Directives • {policies.length} Assets Registered
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('add')}
                className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.2rem] font-black shadow-xl shadow-blue-500/30 transition-all text-[11px] font-[Outfit]"
              >
                <FiPlus className="w-4 h-4" />
                Add New Policy
              </motion.button>
            </div>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-3xl p-8 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#edf3ff] border-white shadow-lg shadow-blue-500/5'}`}
                >
                  <div className="relative z-10 flex flex-col h-full gap-4 text-left font-[Outfit]">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} w-fit shadow-lg shadow-blue-500/10`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className={`text-[13px] font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-800'}`}>
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {stat.value}
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white/50'}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} className={`h-full bg-gradient-to-r ${stat.gradient}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col sm:flex-row gap-6 font-[Outfit]">
              <div className="relative flex-1 group">
                <FiSearch className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors group-focus-within:text-blue-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search Active Directives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-[1.5rem] border-2 px-6 py-4 pl-14 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-[11px] ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm'}`}
                />
              </div>
              <div className="relative group">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`appearance-none rounded-[1.5rem] border-2 px-10 py-4 pr-16 font-black text-[11px] cursor-pointer transition-all outline-none ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <option value="all">Global Resource Hub</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Policy Collection Board - Horizontal List Layout */}
            <div className="flex flex-col gap-6 pb-12 max-w-6xl mx-auto font-[Outfit]">
              {filteredPolicies.map((policy, index) => (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => { setSelectedPolicy(policy); setView('details'); }}
                  className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-[#1E88E5]' : 'bg-[#f8fbff] border-white shadow-sm hover:shadow-md hover:border-blue-500/20'
                    }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 px-10 gap-6">
                    <div className="flex items-center gap-8 min-w-[300px] text-left">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0">
                        <FiFileText className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col text-left">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight capitalize">{policy.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#1E88E5] rounded-full text-[10px] font-black uppercase tracking-[0.1em] border border-blue-100 dark:border-blue-800">
                            {policy.category}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 line-clamp-1">
                            {policy.description.substring(0, 60)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-12 text-left shrink-0">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Version</p>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">Revision {policy.version}</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Effective</p>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{new Date(policy.effectiveFrom).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className={`px-5 py-2.5 rounded-full flex items-center gap-2.5 border ${policy.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${policy.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="text-[11px] font-black uppercase tracking-widest">{policy.status}</span>
                      </div>
                      <motion.button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-[#1E88E5] transition-colors border border-slate-100 dark:border-slate-700">
                        <FiDownload className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'add' && (
          <motion.div
            key="add"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10 font-[Outfit]"
          >
            <div className="flex flex-col gap-8">
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => setView('list')}
                className="flex items-center gap-2.5 self-start px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-[11px]"
              >
                <FiArrowLeft className="w-4 h-4" />
                Return To Registry
              </motion.button>
              <div className="flex items-center gap-6 text-left">
                <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/20">
                  <FiPlus className="w-12 h-12 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Create New directive</h2>
                  <p className="text-sm font-bold text-[#1E88E5] mt-3 ml-1">Company Policy Architecture</p>
                </div>
              </div>
            </div>

            <div className={`p-16 rounded-[4rem] border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/10'}`}>
              <form className="space-y-12 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2">Policy Title Identification</label>
                    <input type="text" placeholder="Enter Reference Title" className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500'}`} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2">Classification category</label>
                    <select className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-black text-[11px] uppercase tracking-widest cursor-pointer ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2">Policy Operational Guidelines</label>
                    <textarea rows={5} placeholder="Define policy description and scope..." className={`w-full rounded-[2rem] border-2 px-8 py-6 outline-none font-bold text-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100 focus:border-blue-500'}`} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('list')}
                    className="px-12 py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black text-[13px] shadow-2xl shadow-blue-500/40 uppercase tracking-widest"
                  >
                    Authenticate & Publish
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-12 py-6 bg-transparent border-2 border-slate-100 dark:border-slate-800 text-slate-400 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-[Outfit]"
                  >
                    Discard Draft
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {view === 'details' && selectedPolicy && (
          <motion.div
            key="details"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10 font-[Outfit]"
          >
            <div className="flex flex-col gap-8">
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => setView('list')}
                className="flex items-center gap-2.5 self-start px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-[11px]"
              >
                <FiArrowLeft className="w-4 h-4" />
                Return To Registry
              </motion.button>
              <div className="flex items-center gap-8 text-left">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-blue-500/30">
                  <FiBook className="w-16 h-16" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight capitalize leading-none">{selectedPolicy.title}</h2>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#1E88E5] rounded-full text-[11px] font-black">{selectedPolicy.category}</span>
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black capitalize ${selectedPolicy.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>Audit {selectedPolicy.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <div className={`col-span-1 lg:col-span-2 p-12 rounded-[3.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/5'}`}>
                <div className="space-y-10">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-8 space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Directive Operational Framework</h3>
                    <p className="text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{selectedPolicy.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Registry Version</p>
                      <p className="text-xl font-extrabold text-slate-800 dark:text-white">Revision {selectedPolicy.version}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Effective Timeline</p>
                      <p className="text-xl font-extrabold text-slate-800 dark:text-white">{new Date(selectedPolicy.effectiveFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="p-8 rounded-[2.5rem] border-2 border-[#1E88E5]/20 bg-blue-50/20 dark:bg-blue-900/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-[#1E88E5]">Full Digital Documentation</h4>
                      <p className="text-xs font-bold text-slate-400 mt-1">Acquire technical PDF formatting for reference.</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} className="p-5 bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] rounded-2xl text-white shadow-xl shadow-blue-500/30">
                      <FiDownload className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] border-blue-500 shadow-2xl shadow-blue-500/20'}`}>
                  <div className="space-y-6 text-white text-left">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Audit Matrix</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black">Fully Certified</span>
                      <FiCheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-white/20">
                      <div className="w-full h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm">HR</div>
                        <div>
                          <p className="text-xs font-black opacity-60 uppercase">Registry Auditor</p>
                          <p className="text-sm font-black">{selectedPolicy.updatedBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('list')}
                  className="w-full px-12 py-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 border border-slate-800 dark:border-slate-700"
                >
                  Return To Registry
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PolicyTab;