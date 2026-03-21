import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFileText,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiX,
  FiSearch,
  FiChevronDown,
  FiBriefcase,
  FiCalendar,
  FiHash,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  getWorkAgreementSummary,
  createWorkAgreement,
  updateWorkAgreement,
  deleteWorkAgreement,
  getWorkAgreements,
} from '../../../service/api';

/* ── Predefined scopes (can be customized per business) ── */
const SCOPE_OPTIONS = [
  'Payroll',
  'Compliance',
  'Recruitment',
  'Onboarding',
  'Offboarding',
  'Attendance',
  'Leave Management',
  'Performance',
  'Employee Engagement',
  'Policy Making',
  'Document Verification',
  'FnF Settlement',
  'Master Data',
  'Other',
];

/* ── Badge helpers with animations ── */
const StatusBadge = ({ status }) => {
  const map = {
    Active: 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/25',
    Expired: 'from-amber-500 to-orange-600 text-white shadow-amber-500/25',
    Terminated: 'from-red-500 to-rose-600 text-white shadow-red-500/25',
  };
  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className={`text-[11px] font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r shadow-lg ${map[status] || 'from-slate-500 to-slate-600 text-white'}`}
    >
      {status}
    </motion.span>
  );
};

/* ── Animated Mini bar ── */
const MiniBar = ({ value, max, color = 'from-violet-500 to-purple-600', delay = 0 }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
};

/* ── Scope chip with animation ── */
const ScopeChip = ({ label, onRemove }) => (
  <motion.span 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    whileHover={{ scale: 1.05 }}
    className="inline-flex items-center gap-1 text-xs font-medium bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200 rounded-full px-2.5 py-1 shadow-sm"
  >
    {label}
    {onRemove && (
      <button onClick={onRemove} className="hover:text-red-600 transition-colors">
        <FiX className="w-3 h-3" />
      </button>
    )}
  </motion.span>
);

/* ══════════════════════════════════════════════════════ */
const WorkAgreementTab = ({ isDarkMode }) => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const emptyForm = {
    clientId: '',
    title: '',
    description: '',
    allowedScopes: [],
    maxTasks: '',
    startDate: '',
    endDate: '',
    notes: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [scopeInput, setScopeInput] = useState('');
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);

  /* ── Fetch ── */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWorkAgreementSummary();
      setAgreements(res.summaries || []);
    } catch (err) {
      setError(err.message || 'Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Handlers ── */
  const openCreate = () => {
    setEditingAgreement(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (ag) => {
    setEditingAgreement(ag);
    setForm({
      clientId: ag.clientId,
      title: ag.title,
      description: '',
      allowedScopes: [...ag.allowedScopes],
      maxTasks: ag.maxTasks || '',
      startDate: ag.startDate || '',
      endDate: ag.endDate || '',
      notes: ag.notes || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.clientId || !form.title || form.allowedScopes.length === 0 || !form.startDate) {
      setFormError('Client ID, title, at least one scope, and start date are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        maxTasks: form.maxTasks ? Number(form.maxTasks) : null,
        endDate: form.endDate || null,
      };

      if (editingAgreement) {
        await updateWorkAgreement({ agreementId: editingAgreement.id, ...payload });
      } else {
        await createWorkAgreement(payload);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save agreement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkAgreement(id);
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete agreement.');
    }
  };

  const addScope = (scope) => {
    if (scope && !form.allowedScopes.includes(scope)) {
      setForm(prev => ({ ...prev, allowedScopes: [...prev.allowedScopes, scope] }));
    }
    setScopeInput('');
    setShowScopeDropdown(false);
  };

  const removeScope = (scope) => {
    setForm(prev => ({ ...prev, allowedScopes: prev.allowedScopes.filter(s => s !== scope) }));
  };

  /* ── Filtered data ── */
  const filtered = agreements.filter(ag => {
    const matchSearch = (ag.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ag.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || ag.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ── Stats ── */
  const totalActive = agreements.filter(a => a.status === 'Active').length;
  const totalExpired = agreements.filter(a => a.status === 'Expired').length;
  const atLimit = agreements.filter(a => a.maxTasks && a.currentTasks >= a.maxTasks).length;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
          <div className="flex gap-2">
            <div className={`h-10 w-10 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-10 w-36 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        {/* Skeleton Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        {/* Skeleton Table */}
        <div className={`h-80 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  /* ── Error ── */
  if (error && agreements.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-96 gap-4"
      >
        <div className="p-4 rounded-full bg-gradient-to-br from-red-100 to-rose-100">
          <FiAlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <p className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{error}</p>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchData} 
          className="px-5 py-2.5 text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  /* ── Stat cards config ── */
  const statCards = [
    { label: 'Total Agreements', value: agreements.length, icon: FiFileText, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25' },
    { label: 'Active', value: totalActive, icon: FiCheckCircle, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
    { label: 'Expired', value: totalExpired, icon: FiCalendar, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
    { label: 'At Task Limit', value: atLimit, icon: FiAlertTriangle, gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/25' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* ── Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <FiFileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent`}>
              Work Agreements
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Define scope per client &amp; prevent out-of-scope tasks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02, rotate: 180 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            onClick={fetchData}
            className={`p-2.5 rounded-xl border-2 transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-500 hover:text-violet-400' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600'
            }`}
          >
            <FiRefreshCw className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
          >
            <FiPlus className="w-4 h-4" />
            New Agreement
          </motion.button>
        </div>
      </motion.div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-shadow ${
                isDarkMode 
                  ? 'bg-slate-800/80 border border-slate-700/50 hover:border-slate-600' 
                  : 'bg-white border border-slate-200/50 hover:shadow-xl'
              } ${card.shadow}`}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${card.gradient}`}></div>
              </div>
              <div className="relative flex items-start justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {card.label}
                  </p>
                  <p className={`text-3xl font-extrabold mt-1 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              {/* Mini progress indicator */}
              <div className="mt-3 flex items-center gap-2">
                <FiTrendingUp className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {agreements.length > 0 ? Math.round((card.value / agreements.length) * 100) : 0}% of total
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Search & Filter bar ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col md:flex-row items-stretch md:items-center gap-3"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by client, company, or title…"
            className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 hover:border-slate-600 focus:border-violet-500' 
                : 'bg-white border-slate-200 placeholder:text-slate-400 hover:border-violet-300 focus:border-violet-500'
            }`}
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium transition-all cursor-pointer focus:ring-2 focus:ring-violet-500/50 ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700 text-white hover:border-slate-600' 
                : 'bg-white border-slate-200 hover:border-violet-300'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Terminated">Terminated</option>
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* ── Agreements table ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl border-2 overflow-hidden ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'
        }`}
      >
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <FiFileText className={`w-8 h-8 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {agreements.length === 0 ? 'No work agreements yet. Create one to get started.' : 'No agreements match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-slate-700/50 text-slate-400' : 'bg-gradient-to-r from-violet-50 to-purple-50 text-slate-600'}`}>
                  <th className="text-left px-5 py-4 font-semibold">Client</th>
                  <th className="text-left px-4 py-4 font-semibold">Agreement</th>
                  <th className="px-4 py-4 font-semibold">Scopes</th>
                  <th className="px-4 py-4 font-semibold">Tasks</th>
                  <th className="px-4 py-4 font-semibold">Period</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                <AnimatePresence>
                  {filtered.map((ag, idx) => {
                    const limitReached = ag.maxTasks && ag.currentTasks >= ag.maxTasks;
                    const avatarColors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600'];
                    const avatarGradient = avatarColors[(ag.companyName || ag.clientName || '').charCodeAt(0) % avatarColors.length];
                    
                    return (
                      <motion.tr 
                        key={ag.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-violet-50/50'
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg`}>
                              {(ag.companyName || ag.clientName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className={`font-semibold truncate max-w-[160px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                {ag.companyName || ag.clientName}
                              </p>
                              <p className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{ag.clientName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className={`font-medium truncate max-w-[180px] ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{ag.title}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {ag.allowedScopes.slice(0, 3).map(s => (
                              <span key={s} className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${
                                isDarkMode 
                                  ? 'bg-violet-900/40 text-violet-300 border border-violet-700/50' 
                                  : 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-600 border border-violet-100'
                              }`}>{s}</span>
                            ))}
                            {ag.allowedScopes.length > 3 && (
                              <span className={`text-[10px] font-medium px-2 py-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                +{ag.allowedScopes.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1">
                              <MiniBar
                                value={ag.currentTasks}
                                max={ag.maxTasks || ag.currentTasks || 1}
                                color={limitReached ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-teal-600'}
                                delay={idx * 0.1}
                              />
                            </div>
                            <span className={`text-xs font-bold whitespace-nowrap ${
                              limitReached 
                                ? 'text-red-500' 
                                : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {ag.currentTasks}{ag.maxTasks ? `/${ag.maxTasks}` : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span>{ag.startDate ? new Date(ag.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–'}</span>
                            {ag.endDate && (
                              <>
                                <span className="mx-1">→</span>
                                <span className={new Date(ag.endDate) < new Date() ? 'text-red-500 font-semibold' : ''}>
                                  {new Date(ag.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                              </>
                            )}
                            {!ag.endDate && <span className={`block text-[10px] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>No expiry</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StatusBadge status={ag.status} />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEdit(ag)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                  ? 'hover:bg-violet-900/40 text-slate-400 hover:text-violet-400' 
                                  : 'hover:bg-violet-100 text-slate-500 hover:text-violet-600'
                              }`}
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setConfirmDelete(ag.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                  ? 'hover:bg-red-900/40 text-slate-400 hover:text-red-400' 
                                  : 'hover:bg-red-100 text-slate-500 hover:text-red-600'
                              }`}
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Scope enforcement info ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-2xl border-2 p-5 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-violet-900/30 to-purple-900/30 border-violet-700/50' 
            : 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-violet-800/50' : 'bg-white shadow-sm'}`}>
            <FiShield className="w-5 h-5 text-violet-600 flex-shrink-0" />
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-violet-300' : 'text-violet-800'}`}>
              Scope Enforcement Active
            </h4>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
              When a client or team leader creates a task, the system validates the task title against the client's active agreement scopes.
              Tasks outside the agreed scope or exceeding the max task limit are automatically blocked with a clear reason message.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ══════ CREATE / EDIT MODAL ══════ */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setShowModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${
                isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
              }`}
            >
              {/* Modal header */}
              <div className={`sticky top-0 border-b px-6 py-4 rounded-t-2xl flex items-center justify-between ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                    <FiFileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {editingAgreement ? 'Edit Agreement' : 'New Work Agreement'}
                  </h3>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)} 
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-sm text-red-700"
                >
                  <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </motion.div>
              )}

              {/* Client ID */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Client ID *
                </label>
                <input
                  type="text"
                  value={form.clientId}
                  onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                  disabled={!!editingAgreement}
                  placeholder="Enter client UUID"
                  className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 disabled:bg-slate-800 disabled:text-slate-500' 
                      : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-violet-500 disabled:bg-slate-50 disabled:text-slate-400'
                  }`}
                />
              </div>

              {/* Title */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Agreement Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Payroll & Compliance 2026"
                  className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500' 
                      : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-violet-500'
                  }`}
                />
              </div>

              {/* Allowed Scopes */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Allowed Scopes *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <AnimatePresence>
                    {form.allowedScopes.map(s => (
                      <ScopeChip key={s} label={s} onRemove={() => removeScope(s)} />
                    ))}
                  </AnimatePresence>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={scopeInput}
                    onChange={e => { setScopeInput(e.target.value); setShowScopeDropdown(true); }}
                    onFocus={() => setShowScopeDropdown(true)}
                    placeholder="Type or select a scope…"
                    className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500' 
                        : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-violet-500'
                    }`}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (scopeInput.trim()) addScope(scopeInput.trim());
                      }
                    }}
                  />
                  <AnimatePresence>
                    {showScopeDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute z-10 top-full mt-1 w-full rounded-xl shadow-xl max-h-40 overflow-y-auto ${
                          isDarkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-slate-200'
                        }`}
                      >
                        {SCOPE_OPTIONS
                          .filter(s => !form.allowedScopes.includes(s) && s.toLowerCase().includes(scopeInput.toLowerCase()))
                          .map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => addScope(s)}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                isDarkMode 
                                  ? 'text-slate-200 hover:bg-slate-600' 
                                  : 'text-slate-700 hover:bg-violet-50'
                              }`}
                            >
                              {s}
                            </button>
                          ))
                        }
                        {scopeInput.trim() && !SCOPE_OPTIONS.some(s => s.toLowerCase() === scopeInput.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => addScope(scopeInput.trim())}
                            className={`w-full text-left px-4 py-2 text-sm font-medium ${
                              isDarkMode 
                                ? 'text-violet-400 hover:bg-slate-600' 
                                : 'text-violet-600 hover:bg-violet-50'
                            }`}
                          >
                            + Add "{scopeInput.trim()}"
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Max Tasks */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Max Concurrent Tasks
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxTasks}
                  onChange={e => setForm(p => ({ ...p, maxTasks: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                  className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500' 
                      : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-violet-500'
                  }`}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' 
                        : 'bg-white border-slate-200 focus:border-violet-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' 
                        : 'bg-white border-slate-200 focus:border-violet-500'
                    }`}
                  />
                </div>
              </div>

              {/* Status (edit only) */}
              {editingAgreement && (
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Status
                  </label>
                  <select
                    value={form.status || editingAgreement.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' 
                        : 'bg-white border-slate-200 focus:border-violet-500'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional details about this agreement…"
                  className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all resize-none focus:ring-2 focus:ring-violet-500/50 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500' 
                      : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-violet-500'
                  }`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Saving…
                    </span>
                  ) : editingAgreement ? 'Update Agreement' : 'Create Agreement'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* ══════ DELETE CONFIRM ══════ */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setConfirmDelete(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center ${
                isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
              }`}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mb-4">
                <FiTrash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Delete Agreement?
              </h3>
              <p className={`text-sm mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                This will permanently remove the agreement. Tasks already created won't be affected.
              </p>
              <div className="flex items-center justify-center gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmDelete(null)} 
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl ${
                    isDarkMode 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(confirmDelete)} 
                  className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkAgreementTab;
