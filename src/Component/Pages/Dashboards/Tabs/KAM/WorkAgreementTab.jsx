import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiFileText, FiCheckCircle, FiAlertTriangle, FiClock, FiCalendar, FiDownload, FiEye, FiPlus, FiSearch, FiX, FiArrowLeft, FiArrowRight, FiShield, FiUser, FiChevronDown, FiBriefcase } from 'react-icons/fi';
import { Search, ChevronRight, ChevronDown, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SCOPE_OPTIONS = [
  'Payroll', 'Compliance', 'Recruitment', 'Onboarding', 'Offboarding', 'Attendance', 
  'Leave Management', 'Performance', 'Employee Engagement', 'Policy Making', 
  'Document Verification', 'FnF Settlement', 'Master Data', 'Other'
];

const WorkAgreementFormView = ({ onBack, isDarkMode }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    allowedScopes: [],
    maxTasks: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [scopeInput, setScopeInput] = useState('');
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Agreement Created Successfully!');
    onBack();
  };

  const addScope = (scope) => {
    if (scope && !formData.allowedScopes.includes(scope)) {
      setFormData(prev => ({ ...prev, allowedScopes: [...prev.allowedScopes, scope] }));
    }
    setScopeInput('');
    setShowScopeDropdown(false);
  };

  const removeScope = (scope) => {
    setFormData(prev => ({ ...prev, allowedScopes: prev.allowedScopes.filter(s => s !== scope) }));
  };

  const InputField = ({ label, name, type = "text", placeholder, options }) => (
    <div className="flex flex-col gap-3 text-center">
      <label className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {label} {['title', 'clientId'].includes(name) && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group w-full px-4">
        {options ? (
          <div className="relative">
            <select
              name={name}
              value={formData[name]}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className={`w-full appearance-none rounded-xl border px-6 py-3.5 transition-all outline-none font-medium text-center cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'}`}
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
            className={`w-full rounded-xl border px-6 py-3.5 transition-all outline-none font-medium text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'}`}
            required={['title', 'clientId'].includes(name)}
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
            New Agreement
          </h3>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
            <div className="col-span-full">
              <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4 border-b border-[#F4F3EF] pb-2">Agreement Details</span>
            </div>
            <InputField label="Client Name" name="clientId" placeholder="Select Client" options={['ABC Corporation', 'XYZ Industries']} />
            <InputField label="Agreement Title" name="title" placeholder="e.g. Payroll & Compliance" />
            
            <div className="col-span-full flex flex-col gap-3 text-center">
               <label className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                 Allowed Scopes <span className="text-rose-500">*</span>
               </label>
               <div className="relative group w-full px-4 text-left">
                 <div className="flex flex-wrap gap-2 mb-2">
                    <AnimatePresence>
                      {formData.allowedScopes.map(s => (
                        <motion.span
                          key={s}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-[#F4F3EF] text-[#1B4DA0] rounded-full px-3 py-1 shadow-sm"
                        >
                          {s}
                          <button onClick={() => removeScope(s)} className="hover:text-red-600 transition-colors ml-1"><FiX className="w-3 h-3" /></button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                 </div>
                 <div className="relative">
                   <input type="text" value={scopeInput} onChange={e => { setScopeInput(e.target.value); setShowScopeDropdown(true); }} onFocus={() => setShowScopeDropdown(true)} placeholder="Type or select a scope…" className={`w-full rounded-xl border px-6 py-3.5 transition-all outline-none font-medium ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm focus:border-blue-400'}`} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (scopeInput.trim()) addScope(scopeInput.trim()); } }} />
                   <AnimatePresence>
                     {showScopeDropdown && (
                       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute z-10 top-full mt-1 w-full rounded-xl shadow-xl max-h-40 overflow-y-auto ${isDarkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-slate-200'}`}>
                         {SCOPE_OPTIONS.filter(s => !formData.allowedScopes.includes(s) && s.toLowerCase().includes(scopeInput.toLowerCase())).map(s => (
                             <button key={s} type="button" onClick={() => addScope(s)} className={`w-full text-left px-6 py-3 text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-200 hover:bg-slate-600' : 'text-[#1A1A2E] hover:bg-[#F4F3EF]'}`}>
                               {s}
                             </button>
                         ))}
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               </div>
            </div>

            <InputField label="Start Date" name="startDate" type="date" placeholder="Select Date" />
            <InputField label="End Date" name="endDate" type="date" placeholder="Select Date" />
          </div>

          <div className="flex gap-4 pt-8">
            <button type="button" onClick={onBack} className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</button>
            <button type="submit" className="flex-[2] bg-[#0D47A1] text-white py-5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-2">
              Save Agreement
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const WorkAgreementDetailView = ({ agreement, onBack, isDarkMode, getStatusConfig }) => {
  const statusConfig = getStatusConfig(agreement.status);

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
          <FiFileText className="text-[#0D47A1]" size={22} />
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Agreement Details</h3>
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
              <FiFileText size={48} />
            </div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 bg-gradient-to-br ${statusConfig.gradient} text-white shadow-lg`}>
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-2xl font-black mb-1">{agreement.title}</h3>
          <p className={`font-black tracking-widest text-xs uppercase mb-4 ${isDarkMode ? 'text-blue-400' : 'text-[#3FA9F5]'}`}>{agreement.clientName}</p>

          <div className={`w-full p-4 rounded-2xl border-2 mb-6 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.ring} ${statusConfig.border}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} animate-pulse ${statusConfig.glow}`}></span>
              Status: {agreement.status}
            </span>
          </div>

          <div className="w-full text-left space-y-4">
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Validity Period</span>
              <p className="font-bold">{new Date(agreement.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} → {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-wider mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Approved Scopes</span>
              <div className="flex flex-wrap gap-2 mt-1">
                 {agreement.allowedScopes.map(s => (
                   <span key={s} className="text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 bg-[#F4F3EF] text-[#1B4DA0]">
                     {s}
                   </span>
                 ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Task Utilization</span>
              <p className="font-bold text-blue-600">{agreement.currentTasks} / {agreement.maxTasks || 'Unlimited'} Tasks Used</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex gap-4">
            <button className="flex-1 px-6 py-4 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
              Edit Agreement
            </button>
            <button className={`flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
              Download Copy
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const WorkAgreementTab = ({ isDarkMode, selectedClient }) => {
  const [view, setView] = useState('list'); // 'list', 'details', 'form'
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, title: 'Payroll & Compliance 2026', clientName: 'ABC Corporation', startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active', allowedScopes: ['Payroll', 'Compliance', 'Recruitment'], currentTasks: 45, maxTasks: 100 },
      { id: 2, title: 'Standard HR Ops', clientName: 'XYZ Industries', startDate: '2026-03-01', endDate: null, status: 'Active', allowedScopes: ['Onboarding', 'Offboarding', 'Leave Management'], currentTasks: 12, maxTasks: 50 },
      { id: 3, title: 'Recruitment Drive Q2', clientName: 'Tech Solutions Ltd', startDate: '2025-04-01', endDate: '2025-09-30', status: 'Expired', allowedScopes: ['Recruitment', 'Onboarding'], currentTasks: 200, maxTasks: 200 },
      { id: 4, title: 'Full Suite HR', clientName: 'Global Services Inc', startDate: '2026-01-15', endDate: '2027-01-14', status: 'Terminated', allowedScopes: ['Master Data', 'Payroll', 'Performance'], currentTasks: 10, maxTasks: 500 },
    ];
    setTimeout(() => {
      setAgreements(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const getStatusConfig = (status) => {
    const configs = {
      'Active': {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-teal-500',
        ring: 'ring-4 ring-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-900/50',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]'
      },
      'Expired': {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        gradient: 'from-amber-500 to-orange-500',
        ring: 'ring-4 ring-amber-500/10',
        border: 'border-amber-200 dark:border-amber-900/50',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]'
      },
      'Terminated': {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        dot: 'bg-rose-500',
        gradient: 'from-rose-500 to-red-500',
        ring: 'ring-4 ring-rose-500/10',
        border: 'border-rose-200 dark:border-rose-900/50',
        glow: 'shadow-[0_0_10px_rgba(243,62,94,0.5)]'
      },
    };
    return configs[status] || configs.Expired;
  };

  const filteredData = agreements.filter(ag => {
    const matchesSearch = ag.title.toLowerCase().includes(searchTerm.toLowerCase()) || ag.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ag.status === filterStatus;
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
            key="agreement-list"
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
                  Work Agreements
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('form')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D47A1] text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0a3a82] transition-all active:scale-95"
                >
                  <Plus size={18} /> New Agreement
                </button>
              </div>
            </motion.div>

            {/* Modern Search & Filters Unification */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className="relative flex-1 group min-w-[200px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search Agreements by client or title..."
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
                  <option value="Active">ACTIVE</option>
                  <option value="Expired">EXPIRED</option>
                  <option value="Terminated">TERMINATED</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
              </div>
            </motion.div>

            {/* Modern Table Interface */}
            <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              {/* Header Columns */}
              <div className={`hidden md:grid grid-cols-[1.5fr_1.5fr_150px_150px_150px_40px] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
                {["Client", "Agreement Title", "Validity", "Scopes", "Status", ""].map((h, i) => (
                  <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
                    {h}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <AnimatePresence mode="popLayout">
                  {filteredData.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No agreements found</p>
                    </div>
                  ) : (
                    filteredData.map((ag, index) => {
                      const statusConfig = getStatusConfig(ag.status);
                      return (
                        <motion.div
                          key={ag.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => { setSelectedAgreement(ag); setView('details'); }}
                          className={`grid grid-cols-[1fr] md:grid-cols-[1.5fr_1.5fr_150px_150px_150px_40px] gap-4 items-center px-8 py-3 border-b last:border-0 cursor-pointer transition-all group relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'}`}
                        >
                          <div className="flex items-center gap-4 min-w-0 py-1">
                            <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110 bg-[#F0F7FF] text-[#1B4DA0] text-[13px]">
                               <FiFileText size={18} />
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                              <p className={`text-[14px] font-bold truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-[#0D47A1]' : 'text-[#0f172a] group-hover:text-[#0D47A1]'}`}>
                                {ag.clientName}
                              </p>
                            </div>
                          </div>
                          <div className="text-left hidden md:block">
                            <p className="text-[13px] font-bold text-[#6B6B7E] truncate">{ag.title}</p>
                          </div>
                          <div className="text-left hidden md:block">
                            <p className="text-[11px] font-medium text-[#9B9BAD]">
                               {new Date(ag.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} → {ag.endDate ? new Date(ag.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Ongoing'}
                            </p>
                          </div>
                          <div className="text-left hidden md:block">
                             <div className="flex flex-wrap gap-1 max-w-[150px]">
                               {ag.allowedScopes.slice(0, 2).map(s => (
                                 <span key={s} className="text-[9px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 bg-[#F4F3EF] text-[#1B4DA0]">
                                   {s}
                                 </span>
                               ))}
                               {ag.allowedScopes.length > 2 && (
                                 <span className="text-[9px] font-black uppercase tracking-widest text-[#9B9BAD]">
                                   +{ag.allowedScopes.length - 2}
                                 </span>
                               )}
                             </div>
                          </div>
                          <div className="text-left">
                             <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                               {ag.status}
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
                  onClick={() => { setSelectedAgreement(null); setView('list'); }}
                  className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
                />
              )}

              {view === 'form' && (
                <div className="fixed inset-0 z-[1101] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
                  <div className="w-full max-w-2xl pointer-events-auto flex items-center justify-center">
                    <WorkAgreementFormView onBack={() => setView('list')} isDarkMode={isDarkMode} />
                  </div>
                </div>
              )}

              {view === 'details' && selectedAgreement && (
                <motion.div
                  initial={{ x: '100%', opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0.5 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] shadow-2xl z-[1101] border-l bg-white border-[#F4F3EF] overflow-hidden"
                >
                  <WorkAgreementDetailView
                    key="agreement-detail"
                    agreement={selectedAgreement}
                    onBack={() => { setSelectedAgreement(null); setView('list'); }}
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

export default WorkAgreementTab;
