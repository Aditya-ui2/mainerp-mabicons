import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiShield, FiCheckCircle, FiAlertTriangle, FiClock, FiFileText, FiCalendar, FiDownload, FiEye, FiPlus, FiSearch, FiX, FiArrowLeft, FiArrowRight, FiTarget, FiUser, FiChevronDown } from 'react-icons/fi';
import { Search, ChevronRight, ChevronDown, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ComplianceFormView = ({ onBack, isDarkMode, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    category: '',
    dueDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Compliance Created Successfully!');
    onBack();
  };

  const InputField = ({ label, name, type = "text", placeholder, options }) => (
    <div className="flex flex-col gap-3 text-center">
      <label className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {label} {['title', 'client'].includes(name) && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group w-full px-4">
        {options ? (
          <div className="relative">
            <select
              name={name}
              value={formData[name]}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className={`w-full appearance-none rounded-xl border px-6 py-3.5 transition-all outline-none font-medium text-center cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'
                }`}
              required={true}
            >
              <option value="">{placeholder}</option>
              {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            placeholder={placeholder}
            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            className={`w-full rounded-xl border px-6 py-3.5 transition-all outline-none font-medium text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'
              }`}
            required={['title'].includes(name)}
          />
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in slide-in-from-bottom-8 duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20 bg-gradient-to-r from-white to-[#F8FAFF]">
        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            New Compliance
          </h3>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-1 gap-x-8 gap-y-7">
            <div className="col-span-full">
              <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4 border-b border-[#F4F3EF] pb-2">Compliance Details</span>
            </div>
            <InputField label="Directive Title" name="title" placeholder="Enter Registration Title" />
            <InputField label="Client Organization" name="client" placeholder="Select Client" options={['ABC Corporation', 'XYZ Industries', 'Tech Solutions Ltd', 'Global Services Inc']} />
            <InputField label="Category" name="category" placeholder="Select Category" options={categories} />
            <InputField label="Deadline" name="dueDate" type="date" placeholder="Select Date" />
          </div>

          <div className="flex gap-4 pt-8">
            <button type="button" onClick={onBack} className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</button>
            <button type="submit" className="flex-[2] bg-[#0D47A1] text-white py-5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-2">
              Save Directive
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const ComplianceDetailView = ({ compliance, onBack, isDarkMode, getStatusConfig }) => {
  const statusConfig = getStatusConfig(compliance.status);

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
          <FiShield className="text-[#0D47A1]" size={22} />
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Compliance Details</h3>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 p-10 bg-[#FAFAF8] overflow-y-auto">
        <div className={`col-span-1 p-8 rounded-[2.5rem] border-2 shadow-xl flex flex-col items-center text-center relative overflow-hidden ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className={`absolute -top-12 -right-12 w-32 h-32 opacity-10 blur-3xl rounded-full bg-gradient-to-br ${statusConfig.gradient}`}></div>

          <div className="relative mb-6">
            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-[#1E88E5] font-black shadow-2xl border-4 border-slate-100 bg-white ring-8 ring-blue-50/50 transition-transform duration-500 hover:scale-105`}>
              <FiShield size={48} />
            </div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 bg-gradient-to-br ${statusConfig.gradient} text-white shadow-lg`}>
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-2xl font-black mb-1">{compliance.title}</h3>
          <p className={`font-black tracking-widest text-xs uppercase mb-4 ${isDarkMode ? 'text-blue-400' : 'text-[#3FA9F5]'}`}>{compliance.client}</p>

          <div className={`w-full p-4 rounded-2xl border-2 mb-6 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.ring} ${statusConfig.border}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} animate-pulse ${statusConfig.glow}`}></span>
              Audit {compliance.status.replace('-', ' ')}
            </span>
          </div>

          <div className="w-full text-left space-y-4">
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Category</span>
              <p className="font-bold">{compliance.category}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Deadline</span>
              <p className="font-bold">{new Date(compliance.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Filing Outcome</span>
              <p className="font-bold text-blue-600">{compliance.filedDate ? compliance.filedDate : 'Pending Audit'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {compliance.penalty > 0 && (
            <div className="p-6 rounded-[2.5rem] bg-rose-50 border border-rose-100 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-bold text-rose-600">Statutory Penalty Detected</p>
                <p className="text-[11px] font-semibold text-rose-400 mt-1">Audit Failed. System Registered Financial Penalty.</p>
              </div>
              <span className="text-xl font-black text-rose-600">₹{compliance.penalty.toLocaleString()}</span>
            </div>
          )}

          <div className="flex gap-4">
            <button className="flex-1 px-6 py-4 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
              Certify Audit
            </button>
            <button className={`flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}>
              Download Report
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ComplianceTab = ({ isDarkMode, selectedClient }) => {
  const [view, setView] = useState('list'); // 'list', 'details', 'form'
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompliance, setSelectedCompliance] = useState(null);

  const categories = ['Statutory Compliance', 'Taxation Registry', 'Labour Law Audit', 'Health & Safety', 'Data Protection', 'Industry Specific'];

  useEffect(() => {
    const mockData = [
      { id: 1, title: 'PF Monthly Return', category: 'Statutory Compliance', dueDate: '2026-03-15', status: 'completed', client: 'ABC Corporation', filedDate: '2026-03-14', penalty: 0 },
      { id: 2, title: 'ESI Contribution', category: 'Statutory Compliance', dueDate: '2026-03-21', status: 'pending', client: 'XYZ Industries', filedDate: null, penalty: 0 },
      { id: 3, title: 'TDS Quarterly Filing', category: 'Taxation Registry', dueDate: '2026-03-31', status: 'in-progress', client: 'Tech Solutions Ltd', filedDate: null, penalty: 0 },
      { id: 4, title: 'Professional Tax', category: 'Taxation Registry', dueDate: '2026-03-10', status: 'overdue', client: 'Global Services Inc', filedDate: null, penalty: 500 },
      { id: 5, title: 'Labour Welfare Fund', category: 'Labour Law Audit', dueDate: '2026-03-31', status: 'pending', client: 'ABC Corporation', filedDate: null, penalty: 0 },
      { id: 6, title: 'Fire Safety Audit', category: 'Health & Safety', dueDate: '2026-04-15', status: 'pending', client: 'XYZ Industries', filedDate: null, penalty: 0 },
      { id: 7, title: 'GDPR Compliance Review', category: 'Data Protection', dueDate: '2026-03-28', status: 'in-progress', client: 'Tech Solutions Ltd', filedDate: null, penalty: 0 },
    ];
    setTimeout(() => {
      setCompliances(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const getStatusConfig = (status) => {
    const configs = {
      'completed': {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-teal-500',
        ring: 'ring-4 ring-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-900/50',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]'
      },
      'in-progress': {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        gradient: 'from-blue-500 to-indigo-500',
        ring: 'ring-4 ring-blue-500/10',
        border: 'border-blue-200 dark:border-blue-900/50',
        glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]'
      },
      'pending': {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        gradient: 'from-amber-500 to-orange-500',
        ring: 'ring-4 ring-amber-500/10',
        border: 'border-amber-200 dark:border-amber-900/50',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]'
      },
      'overdue': {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        dot: 'bg-rose-500',
        gradient: 'from-rose-500 to-red-500',
        ring: 'ring-4 ring-rose-500/10',
        border: 'border-rose-200 dark:border-rose-900/50',
        glow: 'shadow-[0_0_10px_rgba(243,62,94,0.5)]'
      },
    };
    return configs[status] || configs.pending;
  };

  const filteredCompliances = compliances.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className={`h-10 w-80 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-56 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="space-y-6 mt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-24 rounded-[2rem] animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
          <motion.div
            key="compliance-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            className="space-y-8"
          >
            {/* Modern Header (Matched with Screenshot) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8 flex-wrap gap-4"
            >
              <div className="text-left flex items-center gap-4">
                <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Compliance Management
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('form')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D47A1] text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0a3a82] transition-all active:scale-95"
                >
                  <Plus size={18} /> New Compliance
                </button>
              </div>
            </motion.div>

            {/* Modern Search & Filters Unification */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className="relative flex-1 group min-w-[200px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search Compliance Directives..."
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
                  <option value="all">ALL STATUS</option>
                  <option value="pending">PENDING</option>
                  <option value="in-progress">IN PROGRESS</option>
                  <option value="completed">COMPLETED</option>
                  <option value="overdue">OVERDUE</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
              </div>
            </motion.div>

            {/* Modern Table Interface */}
            <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              {/* Header Columns */}
              <div className={`grid grid-cols-[1.5fr_1.5fr_150px_150px_200px_40px] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
                {["Compliance Title", "Client", "Category", "Due Date", "Status", ""].map((h, i) => (
                  <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
                    {h}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <AnimatePresence mode="popLayout">
                  {filteredCompliances.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No compliances found</p>
                    </div>
                  ) : (
                    filteredCompliances.map((comp, index) => {
                      const statusConfig = getStatusConfig(comp.status);
                      return (
                        <motion.div
                          key={comp.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => { setSelectedCompliance(comp); setView('details'); }}
                          className={`grid grid-cols-[1.5fr_1.5fr_150px_150px_200px_40px] gap-4 items-center px-8 py-3 border-b last:border-0 cursor-pointer transition-all group relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'}`}
                        >
                          <div className="flex items-center gap-4 min-w-0 py-1">
                            <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110 bg-[#F0F7FF] text-[#1B4DA0] text-[13px]">
                               <FiShield size={18} />
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                              <p className={`text-[14px] font-bold truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-[#0D47A1]' : 'text-[#0f172a] group-hover:text-[#0D47A1]'}`}>
                                {comp.title}
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] font-bold text-[#6B6B7E] truncate">{comp.client}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[11px] font-medium text-[#9B9BAD]">{comp.category}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] font-bold text-[#6B6B7E]">
                              {new Date(comp.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-left">
                             <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                               {comp.status.replace('-', ' ')}
                             </span>
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
                  onClick={() => { setSelectedCompliance(null); setView('list'); }}
                  className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
                />
              )}

              {view === 'form' && (
                <div className="fixed inset-0 z-[1101] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
                  <div className="w-full max-w-2xl pointer-events-auto flex items-center justify-center">
                    <ComplianceFormView onBack={() => setView('list')} isDarkMode={isDarkMode} categories={categories} />
                  </div>
                </div>
              )}

              {view === 'details' && selectedCompliance && (
                <motion.div
                  initial={{ x: '100%', opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0.5 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] shadow-2xl z-[1101] border-l bg-white border-[#F4F3EF] overflow-hidden"
                >
                  <ComplianceDetailView
                    key="compliance-detail"
                    compliance={selectedCompliance}
                    onBack={() => { setSelectedCompliance(null); setView('list'); }}
                    isDarkMode={isDarkMode}
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

export default ComplianceTab;