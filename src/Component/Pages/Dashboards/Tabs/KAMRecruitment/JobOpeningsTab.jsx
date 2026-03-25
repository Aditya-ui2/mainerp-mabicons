import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiMapPin,
  FiDollarSign,
  FiUsers,
  FiClock,
  FiX,
  FiChevronDown,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiExternalLink,
  FiCalendar,
  FiClipboard,
  FiFileText,
  FiArrowLeft,
  FiSend,
  FiTarget,
  FiBookOpen,
  FiAward,
  FiLayers,
  FiDatabase,
  FiCheck,
  FiMail,
  FiPhone,
  FiStar,
} from 'react-icons/fi';
import { getResumeBankResumes, getResumeRoleTypes, getAllRecruitmentPositions, createRecruitmentPosition, updateRecruitmentPosition, deleteRecruitmentPosition } from '../../../service/api';

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const config = {
    Open: { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
    'In Progress': { gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25' },
    'On Hold': { gradient: 'from-violet-500 to-orange-600', shadow: 'shadow-violet-500/25' },
    Closed: { gradient: 'from-slate-500 to-slate-600', shadow: 'shadow-slate-500/25' },
    Urgent: { gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/25' },
  };
  const { gradient, shadow } = config[status] || config.Open;
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${gradient} shadow-lg ${shadow}`}
    >
      <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></span>
      {status}
    </motion.span>
  );
};

/* ── Priority Badge ── */
const PriorityBadge = ({ priority }) => {
  const config = {
    High: 'from-red-500 to-rose-600 text-white',
    Medium: 'from-violet-500 to-orange-600 text-white',
    Low: 'from-slate-400 to-slate-500 text-white',
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${config[priority] || config.Medium}`}>
      {priority}
    </span>
  );
};

/* ── Active Clients List ── */
const ACTIVE_CLIENTS = [
  'Solar91 & Battfit',
  'Infrared Power',
  'Johns Electric',
  'New Shop - Anusuya Enterprises',
  'Solar One Energy',
];

/* ── Assign Task Modal ── */
const AssignTaskModal = ({ isDarkMode, job, onClose, onAssign }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const taskTypes = [
    { label: 'Screen CVs', icon: '📋', desc: 'Review and shortlist candidates' },
    { label: 'Source Candidates', icon: '🔍', desc: 'Find new candidates for role' },
    { label: 'Schedule Interviews', icon: '📅', desc: 'Arrange interview slots' },
    { label: 'Follow Up', icon: '📞', desc: 'Follow up with candidates' },
    { label: 'Client Update', icon: '💼', desc: 'Send progress report to client' },
    { label: 'Custom Task', icon: '✏️', desc: 'Define a custom task' },
  ];

  const priorities = [
    { value: 'High', color: '#ef4444', bg: isDarkMode ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600', icon: '🔴' },
    { value: 'Medium', color: '#f59e0b', bg: isDarkMode ? 'bg-amber-900/30 border-amber-700/50 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600', icon: '🟡' },
    { value: 'Low', color: '#10b981', bg: isDarkMode ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600', icon: '🟢' },
  ];

  const teamMembers = [
    { id: 'recruiter1', name: 'Priya Sharma', role: 'Recruiter', avatar: 'PS', color: '#8b5cf6' },
    { id: 'recruiter2', name: 'Rahul Verma', role: 'Recruiter', avatar: 'RV', color: '#3b82f6' },
    { id: 'lead1', name: 'Anita Singh', role: 'Team Lead', avatar: 'AS', color: '#10b981' },
  ];

  const handleSubmit = () => {
    if (!taskTitle && !taskType) return;
    const member = teamMembers.find(t => t.id === assignee);
    const taskData = {
      id: Date.now(),
      title: taskTitle || taskType,
      type: taskType,
      assignee: member ? member.name : '',
      assigneeAvatar: member ? member.avatar : '',
      assigneeColor: member ? member.color : '#8b5cf6',
      priority: taskPriority,
      deadline: taskDeadline,
      description: taskDescription,
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };
    if (onAssign) onAssign(job?.id, taskData);
    setSubmitted(true);
    setTimeout(() => { onClose(); }, 1200);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 15 }}
          className={`relative z-10 rounded-3xl p-10 text-center shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <FiCheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Task Assigned!</h3>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {assignee ? teamMembers.find(t => t.id === assignee)?.name : 'Team member'} has been notified
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`relative z-10 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900 border border-slate-700/50' : 'bg-white'}`}
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(139,92,246,0.1)' }}
      >
        {/* ── Compact Header ── */}
        <div className="relative overflow-hidden px-6 pt-6 pb-4">
          <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)' }} />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                <FiClipboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Assign Task</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDarkMode ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>{job?.title}</span>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>•</span>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{job?.client}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">

          {/* Quick Task Type Chips */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Quick Select Task Type</label>
            <div className="grid grid-cols-3 gap-2">
              {taskTypes.map(t => (
                <motion.button key={t.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setTaskType(t.label); if (!taskTitle) setTaskTitle(t.label); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                    taskType === t.label
                      ? 'border-violet-500 shadow-lg ' + (isDarkMode ? 'bg-violet-900/30' : 'bg-violet-50')
                      : isDarkMode ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}>
                  <span className="text-xl">{t.icon}</span>
                  <span className={`text-[10px] font-semibold leading-tight ${taskType === t.label ? (isDarkMode ? 'text-violet-300' : 'text-violet-600') : isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{t.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Task Title *</label>
            <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Screen 10 candidates for shortlist"
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
            />
          </div>

          {/* Assign To — Team Member Cards */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign To *</label>
            <div className="space-y-2">
              {teamMembers.map(m => (
                <motion.button key={m.id} whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}
                  onClick={() => setAssignee(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    assignee === m.id
                      ? 'border-violet-500 shadow-md ' + (isDarkMode ? 'bg-violet-900/20' : 'bg-violet-50')
                      : isDarkMode ? 'border-slate-700 hover:border-slate-600 bg-slate-800/30' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: m.color }}>
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{m.name}</p>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{m.role}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    assignee === m.id ? 'border-violet-500 bg-violet-500' : isDarkMode ? 'border-slate-600' : 'border-slate-300'
                  }`}>
                    {assignee === m.id && <FiCheck className="w-3 h-3 text-white" />}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Priority — Pill Selection */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Priority</label>
            <div className="flex gap-2">
              {priorities.map(p => (
                <motion.button key={p.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setTaskPriority(p.value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    taskPriority === p.value ? p.bg + ' border-current shadow-sm' : isDarkMode ? 'border-slate-700 text-slate-400 bg-slate-800/30' : 'border-slate-200 text-slate-500 bg-white'
                  }`}>
                  <span className="text-xs">{p.icon}</span> {p.value}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Deadline</label>
            <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Notes (optional)</label>
            <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows={3} placeholder="Add any specific instructions..."
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all resize-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={`flex items-center justify-between gap-3 px-6 py-4 border-t ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'}`}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >Cancel</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!taskTitle && !taskType}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 8px 20px rgba(139,92,246,0.35)' }}
          >
            <FiSend className="w-4 h-4" /> Assign Task
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Job Detail View ── */
const JobDetailView = ({ isDarkMode, job, onBack, onAssignTask, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiFileText },
    { id: 'jd', label: 'Job Description', icon: FiBookOpen },
    { id: 'requirements', label: 'Requirements', icon: FiTarget },
    { id: 'responsibilities', label: 'Responsibilities', icon: FiLayers },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
      {/* Back & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.button whileHover={{ x: -4 }} onClick={onBack}
          className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'}`}
        >
          <FiArrowLeft className="w-5 h-5" /> Back to Job Openings
        </motion.button>
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onAssignTask(job)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', boxShadow: '0 8px 16px rgba(245,158,11,0.3)' }}
          >
            <FiClipboard className="w-4 h-4" /> Assign Task
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onEdit(job)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border-2 ${isDarkMode ? 'border-slate-600 text-slate-300 hover:border-violet-500' : 'border-slate-200 text-slate-600 hover:border-violet-400'}`}
          >
            <FiEdit2 className="w-4 h-4" /> Edit Position
          </motion.button>
        </div>
      </div>

      {/* Header Card */}
      <div className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-violet-100 shadow-lg'}`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              {job.clientLogo}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{job.title}</h2>
              </div>
              <p className={`text-lg mt-1 font-medium ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>{job.client}</p>
              <div className="flex flex-wrap items-center gap-5 mt-3">
                <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiMapPin className="w-4 h-4" /> {job.location}</span>
                <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiDollarSign className="w-4 h-4" /> {job.salary}</span>
                <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiClock className="w-4 h-4" /> {job.type}</span>
                <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiCalendar className="w-4 h-4" /> Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {job.skills.map(skill => (
                  <span key={skill} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-violet-900/40 text-violet-300 border border-violet-700/50' : 'bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 border border-violet-200'}`}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Positions Filled</p>
            <p className="text-4xl font-bold" style={{ color: '#7c3aed' }}>{job.filled}/{job.openings}</p>
            <div className={`w-36 h-2.5 rounded-full mt-2 overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-violet-100'}`}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(job.filled / job.openings) * 100}%` }} transition={{ duration: 0.8 }}
                className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1.5 rounded-xl ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
              ? (isDarkMode ? 'bg-violet-600 text-white shadow-lg' : 'bg-white text-violet-700 shadow-md')
              : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Client', value: job.client, icon: FiBriefcase },
              { label: 'Location', value: job.location, icon: FiMapPin },
              { label: 'Employment Type', value: job.type, icon: FiClock },
              { label: 'Salary Range', value: job.salary, icon: FiDollarSign },
              { label: 'Total Openings', value: job.openings, icon: FiUsers },
              { label: 'Filled', value: job.filled, icon: FiCheckCircle },
              { label: 'Priority', value: job.priority, icon: FiAlertCircle },
              { label: 'Posted Date', value: new Date(job.postedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), icon: FiCalendar },
              { label: 'Deadline', value: new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), icon: FiCalendar },
              { label: 'Experience', value: job.experience || '3-7 years', icon: FiAward },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-violet-50/50 border border-violet-100'}`}>
                <div className="p-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' }}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'jd' && (
          <div className="space-y-4">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Job Description</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {job.description || `We are looking for a highly skilled ${job.title} to join our client ${job.client}. This is a ${job.type} opportunity based in ${job.location} with a competitive salary range of ${job.salary}.`}
            </p>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {job.descriptionExtra || `The ideal candidate will have strong expertise in ${job.skills.join(', ')} and be able to contribute to the team from day one. This role offers exposure to cutting-edge projects and a collaborative work environment.`}
            </p>
            <div className={`p-4 rounded-xl mt-4 ${isDarkMode ? 'bg-violet-900/20 border border-violet-700/30' : 'bg-violet-50 border border-violet-200'}`}>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>Key Skills Required</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.skills.map(skill => (
                  <span key={skill} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-4">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Requirements</h3>
            <ul className="space-y-3">
              {(job.requirements || [
                `${job.skills[0] ? `Strong proficiency in ${job.skills[0]}` : 'Strong technical background'} with hands-on experience`,
                `${(parseInt(job.salary) || 3)}+ years of relevant industry experience`,
                `Excellent problem-solving and analytical skills`,
                `Strong communication and teamwork abilities`,
                `Bachelor's degree in relevant field (or equivalent experience)`,
                `Experience with ${job.skills.slice(1).join(', ') || 'modern tools and technologies'}`,
              ]).map((req, i) => (
                <li key={i} className={`flex items-start gap-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <FiCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8b5cf6' }} />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'responsibilities' && (
          <div className="space-y-4">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Key Responsibilities</h3>
            <ul className="space-y-3">
              {(job.responsibilities || [
                `Lead and contribute to ${job.skills[0] || 'key'} projects for ${job.client}`,
                `Collaborate with cross-functional teams to deliver high-quality solutions`,
                `Mentor junior team members and conduct code/design reviews`,
                `Drive best practices and innovative approaches within the team`,
                `Participate in client meetings and requirement gathering sessions`,
                `Ensure deliverables meet quality standards and deadlines`,
              ]).map((resp, i) => (
                <li key={i} className={`flex items-start gap-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <FiTarget className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8b5cf6' }} />
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════ */
const JobOpeningsTab = ({ isDarkMode }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [assignTaskJob, setAssignTaskJob] = useState(null);
  const [jobTasks, setJobTasks] = useState({});
  const [filterClient, setFilterClient] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // ── Resume Match Modal State ──
  const [modalStep, setModalStep] = useState(1);
  const [matchedResumes, setMatchedResumes] = useState([]);
  const [selectedResumes, setSelectedResumes] = useState(new Set());
  const [resumeFetchLoading, setResumeFetchLoading] = useState(false);
  const [roleTypes, setRoleTypes] = useState([]);
  const [roleTypesLoading, setRoleTypesLoading] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: '', client: '', location: '', type: 'Full-time', salary: '',
    openings: 1, experience: '', priority: 'Medium', deadline: '', skills: '', description: '', roleType: ''
  });

  // ── Fetch positions from backend ──
  const fetchPositions = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterClient !== 'all') filters.client = filterClient;
      if (searchTerm) filters.search = searchTerm;
      const response = await getAllRecruitmentPositions(filters);
      const positions = (response.data || []).map(p => ({
        id: p._id,
        title: p.title,
        client: p.clientName || p.client?.companyName || p.client?.name || 'Unknown',
        clientLogo: p.clientLogo || 'NA',
        location: p.location || '',
        type: p.type || 'Full-time',
        salary: p.salary || '',
        openings: p.openings || 1,
        filled: p.filled || 0,
        status: p.status || 'Open',
        priority: p.priority || 'Medium',
        postedDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
        deadline: p.deadline ? new Date(p.deadline).toISOString().split('T')[0] : '',
        experience: p.experience || '',
        skills: p.skills || [],
        description: p.description || '',
        roleType: p.roleType || '',
        candidateCount: p.candidateCount || 0,
      }));
      setJobs(positions);
    } catch (error) {
      console.error('Failed to fetch positions from backend:', error);
      // Fallback to mock data if API fails
      const mockJobs = [
        { id: 1, title: 'Senior Software Engineer', client: 'TechCorp India', clientLogo: 'TC', location: 'Bangalore', type: 'Full-time', salary: '25-35 LPA', openings: 5, filled: 2, status: 'Open', priority: 'High', postedDate: '2026-03-10', deadline: '2026-04-10', experience: '5-8 years', skills: ['React', 'Node.js', 'MongoDB'], description: 'Senior Software Engineer position for TechCorp India.', roleType: 'Engineer' },
        { id: 2, title: 'Product Manager', client: 'StartupXYZ', clientLogo: 'SX', location: 'Mumbai', type: 'Full-time', salary: '30-40 LPA', openings: 2, filled: 0, status: 'Urgent', priority: 'High', postedDate: '2026-03-15', deadline: '2026-03-30', experience: '6-10 years', skills: ['Agile', 'Roadmap', 'Analytics'], description: 'Product Manager for StartupXYZ.', roleType: 'Manager' },
        { id: 3, title: 'UI/UX Designer', client: 'DesignHub', clientLogo: 'DH', location: 'Remote', type: 'Contract', salary: '15-20 LPA', openings: 3, filled: 1, status: 'In Progress', priority: 'Medium', postedDate: '2026-03-12', deadline: '2026-04-15', experience: '3-5 years', skills: ['Figma', 'Adobe XD', 'User Research'], description: 'UI/UX Designer for DesignHub.', roleType: 'Graphic Designer' },
        { id: 4, title: 'Data Analyst', client: 'DataDriven Co', clientLogo: 'DD', location: 'Hyderabad', type: 'Full-time', salary: '12-18 LPA', openings: 4, filled: 4, status: 'Closed', priority: 'Low', postedDate: '2026-02-20', deadline: '2026-03-20', experience: '2-4 years', skills: ['SQL', 'Python', 'Tableau'], description: 'Data Analyst for DataDriven Co.', roleType: 'Data Management and Analyst' },
        { id: 5, title: 'DevOps Engineer', client: 'CloudScale', clientLogo: 'CS', location: 'Pune', type: 'Full-time', salary: '20-28 LPA', openings: 2, filled: 0, status: 'On Hold', priority: 'Medium', postedDate: '2026-03-05', deadline: '2026-04-05', experience: '4-6 years', skills: ['AWS', 'Docker', 'Kubernetes'], description: 'DevOps Engineer for CloudScale.', roleType: 'Engineer' },
      ];
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // Sync jobs to localStorage so Candidate Pipeline can read them
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem('kamJobOpenings', JSON.stringify(jobs));
    }
  }, [jobs]);

  // Fetch role types from Resume Bank API
  useEffect(() => {
    const fetchRoles = async () => {
      setRoleTypesLoading(true);
      try {
        const response = await getResumeRoleTypes();
        const rolesData = response.data || response.roles || [];
        // API returns { name, count } — normalize to { role, count }
        setRoleTypes(rolesData.map(r => ({ role: r.role || r.name || r.roleType || '', count: r.count || 0 })));
      } catch (error) {
        console.error('Failed to fetch role types:', error);
        // Fallback role types from Resume Bank
        setRoleTypes([
          { role: 'Sales&Marketing', count: 352 },
          { role: 'Engineer', count: 261 },
          { role: 'Accountant', count: 203 },
          { role: 'ITI', count: 165 },
          { role: 'HR', count: 119 },
          { role: 'Fresher', count: 113 },
          { role: 'Solar', count: 104 },
          { role: 'Tele sales &CRM', count: 99 },
          { role: 'Back Office', count: 77 },
          { role: 'Finance', count: 57 },
          { role: 'Data Management and Analyst', count: 56 },
          { role: 'Graphic Designer', count: 55 },
          { role: 'RECEPTION AND TELECALLER', count: 41 },
          { role: 'Purchase & Operations', count: 36 },
          { role: 'E-Commerce', count: 33 },
          { role: 'Business Development', count: 31 },
          { role: 'Executive Assistant', count: 27 },
          { role: 'Teacher', count: 22 },
          { role: 'O&M', count: 17 },
          { role: 'SITE ENGINEER', count: 16 },
          { role: 'Front End Developer', count: 15 },
          { role: 'Medical', count: 13 },
          { role: 'Digital Marketing', count: 13 },
          { role: 'CA', count: 11 },
          { role: 'WAREHOUSE ASSOCIATE', count: 11 },
          { role: 'PROJECT MANAGER', count: 9 },
          { role: 'Manager', count: 7 },
          { role: 'Retail', count: 7 },
          { role: 'BPO SERVICE', count: 6 },
          { role: 'PROCESS MANAGER', count: 5 },
          { role: 'Helper', count: 4 },
          { role: 'IT', count: 4 },
          { role: 'REAL ESTATE', count: 4 },
          { role: 'Architect', count: 3 },
          { role: 'Cashier', count: 3 },
          { role: 'Admin Assistant', count: 3 },
          { role: 'CS', count: 2 },
          { role: 'SOCIAL MEDIA MANAGER', count: 1 },
        ]);
      } finally {
        setRoleTypesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // ── Handle task assignment from modal ──
  const handleAssignTask = (jobId, taskData) => {
    setJobTasks(prev => ({
      ...prev,
      [jobId]: [...(prev[jobId] || []), taskData],
    }));
  };

  // ── Reset modal to initial state ──
  const resetModal = () => {
    setModalStep(1);
    setMatchedResumes([]);
    setSelectedResumes(new Set());
    setResumeFetchLoading(false);
    setNewJobForm({ title: '', client: '', location: '', type: 'Full-time', salary: '', openings: 1, experience: '', priority: 'Medium', deadline: '', skills: '', description: '', roleType: '' });
  };

  // ── Populate form when editing ──
  useEffect(() => {
    if (editingJob) {
      setNewJobForm({
        title: editingJob.title || '',
        client: editingJob.client || '',
        location: editingJob.location || '',
        type: editingJob.type || 'Full-time',
        salary: editingJob.salary || '',
        openings: editingJob.openings || 1,
        experience: editingJob.experience || '',
        priority: editingJob.priority || 'Medium',
        deadline: editingJob.deadline || '',
        skills: editingJob.skills?.join(', ') || '',
        description: editingJob.description || '',
        roleType: editingJob.roleType || '',
      });
    } else {
      resetModal();
    }
  }, [editingJob]);

  // ── Create position & fetch matching resumes ──
  const handleCreatePosition = async () => {
    try {
      // Call backend API to create position
      const positionData = {
        title: newJobForm.title,
        description: newJobForm.description,
        location: newJobForm.location,
        type: newJobForm.type,
        salary: newJobForm.salary,
        status: newJobForm.priority === 'High' ? 'Urgent' : 'Open',
        priority: newJobForm.priority,
        openings: parseInt(newJobForm.openings) || 1,
        skills: newJobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience: newJobForm.experience,
        deadline: newJobForm.deadline || undefined,
        roleType: newJobForm.roleType,
      };
      const result = await createRecruitmentPosition(positionData);
      const created = result.data || {};

      // Add the new position to local state
      const newJob = {
        id: created._id || Date.now(),
        title: created.title || newJobForm.title,
        client: newJobForm.client,
        clientLogo: newJobForm.client ? newJobForm.client.substring(0, 2).toUpperCase() : 'NA',
        location: created.location || newJobForm.location,
        type: created.type || newJobForm.type,
        salary: created.salary || newJobForm.salary,
        openings: created.openings || parseInt(newJobForm.openings) || 1,
        filled: 0,
        status: created.status || 'Open',
        priority: created.priority || newJobForm.priority,
        postedDate: new Date().toISOString().split('T')[0],
        deadline: newJobForm.deadline,
        experience: created.experience || newJobForm.experience,
        skills: created.skills || newJobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        description: created.description || newJobForm.description,
        roleType: created.roleType || newJobForm.roleType,
      };
      setJobs(prev => [newJob, ...prev]);
    } catch (error) {
      console.error('Backend create failed, adding locally:', error);
      // Fallback: add locally even if API fails
      const newJob = {
        id: Date.now(),
        title: newJobForm.title,
        client: newJobForm.client,
        clientLogo: newJobForm.client ? newJobForm.client.substring(0, 2).toUpperCase() : 'NA',
        location: newJobForm.location,
        type: newJobForm.type,
        salary: newJobForm.salary,
        openings: parseInt(newJobForm.openings) || 1,
        filled: 0,
        status: newJobForm.priority === 'High' ? 'Urgent' : 'Open',
        priority: newJobForm.priority,
        postedDate: new Date().toISOString().split('T')[0],
        deadline: newJobForm.deadline,
        experience: newJobForm.experience,
        skills: newJobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        description: newJobForm.description,
        roleType: newJobForm.roleType,
      };
      setJobs(prev => [newJob, ...prev]);
    }

    // Move to step 2: auto-fetch matching resumes by ROLE TYPE from Resume Bank
    setModalStep(2);
    setResumeFetchLoading(true);
    try {
      const searchTerm = newJobForm.roleType || newJobForm.title;
      const response = await getResumeBankResumes({ search: searchTerm, limit: 50 });
      setMatchedResumes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch matching resumes:', error);
      setMatchedResumes([]);
    } finally {
      setResumeFetchLoading(false);
    }
  };

  // ── Update existing position ──
  const handleUpdatePosition = async () => {
    try {
      const updates = {
        title: newJobForm.title,
        description: newJobForm.description,
        location: newJobForm.location,
        type: newJobForm.type,
        salary: newJobForm.salary,
        priority: newJobForm.priority,
        openings: parseInt(newJobForm.openings) || 1,
        experience: newJobForm.experience,
        deadline: newJobForm.deadline || undefined,
        skills: newJobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        roleType: newJobForm.roleType,
      };
      await updateRecruitmentPosition(editingJob.id, updates);
    } catch (error) {
      console.error('Backend update failed, updating locally:', error);
    }
    // Update local state regardless
    setJobs(prev => prev.map(j => j.id === editingJob.id ? {
      ...j,
      title: newJobForm.title,
      client: newJobForm.client,
      clientLogo: newJobForm.client ? newJobForm.client.substring(0, 2).toUpperCase() : j.clientLogo,
      location: newJobForm.location,
      type: newJobForm.type,
      salary: newJobForm.salary,
      openings: parseInt(newJobForm.openings) || j.openings,
      experience: newJobForm.experience,
      priority: newJobForm.priority,
      deadline: newJobForm.deadline,
      skills: newJobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      description: newJobForm.description,
      roleType: newJobForm.roleType,
    } : j));
    setShowModal(false);
    setEditingJob(null);
    resetModal();
  };

  // ── Toggle single resume selection ──
  const toggleResumeSelection = (resumeId) => {
    setSelectedResumes(prev => {
      const next = new Set(prev);
      if (next.has(resumeId)) next.delete(resumeId);
      else next.add(resumeId);
      return next;
    });
  };

  // ── Toggle select all ──
  const toggleSelectAll = () => {
    if (selectedResumes.size === matchedResumes.length) {
      setSelectedResumes(new Set());
    } else {
      setSelectedResumes(new Set(matchedResumes.map(r => r.id)));
    }
  };

  // ── Add selected resumes to Candidate Pipeline ──
  const handleAddSelectedToPipeline = () => {
    const selected = matchedResumes.filter(r => selectedResumes.has(r.id));
    if (selected.length > 0) {
      const pipelineData = selected.map(resume => ({
        ...resume,
        jobTitle: newJobForm.title,
        client: newJobForm.client,
        roleType: newJobForm.roleType,
        addedAt: new Date().toISOString(),
      }));
      localStorage.setItem('kamSelectedResumes', JSON.stringify(pipelineData));
      // Dispatch storage event for same-page listener
      window.dispatchEvent(new StorageEvent('storage', { key: 'kamSelectedResumes', newValue: JSON.stringify(pipelineData) }));
    }
    setShowModal(false);
    setEditingJob(null);
    resetModal();
  };

  // ── Close modal helper ──
  const closeModal = () => {
    setShowModal(false);
    setEditingJob(null);
    resetModal();
  };

  // Stats
  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'Open' || j.status === 'Urgent').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    closed: jobs.filter(j => j.status === 'Closed').length,
    totalOpenings: jobs.reduce((sum, j) => sum + j.openings, 0),
    totalFilled: jobs.reduce((sum, j) => sum + j.filled, 0),
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'all' || job.client === filterClient;
    const matchesPosition = filterPosition === 'all' || (filterPosition === 'Open' ? job.filled < job.openings : job.filled >= job.openings);

    // Date filter
    let matchesDate = true;
    if (filterDate !== 'all') {
      const jobDate = new Date(job.postedDate);
      const now = new Date();
      if (filterDate === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = jobDate >= weekAgo;
      } else if (filterDate === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        matchesDate = jobDate >= monthAgo;
      } else if (filterDate === 'year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        matchesDate = jobDate >= yearAgo;
      } else if (filterDate === 'custom') {
        if (customStartDate) matchesDate = jobDate >= new Date(customStartDate);
        if (customEndDate && matchesDate) matchesDate = jobDate <= new Date(customEndDate);
      }
    }

    return matchesSearch && matchesClient && matchesPosition && matchesDate;
  });

  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #6366f1, #4f46e5)',
      'linear-gradient(135deg, #a78bfa, #8b5cf6)',
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #60a5fa, #8b5cf6)'
    ];
    return gradients[(name || '').charCodeAt(0) % gradients.length];
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-40 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  // If a job is selected, show detail view
  if (selectedJob) {
    return (
      <>
        <JobDetailView
          isDarkMode={isDarkMode}
          job={selectedJob}
          onBack={() => setSelectedJob(null)}
          onAssignTask={(job) => setAssignTaskJob(job)}
          onEdit={(job) => { setEditingJob(job); setShowModal(true); }}
        />
        <AnimatePresence>
          {assignTaskJob && <AssignTaskModal isDarkMode={isDarkMode} job={assignTaskJob} onClose={() => setAssignTaskJob(null)} onAssign={handleAssignTask} />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.25)' }}>
            <FiBriefcase className="w-7 h-7" style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Client Job Openings
            </h2>
            <p className={`text-base mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage client requirements, track positions & assign tasks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02, rotate: 180 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-xl border-2 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-500' : 'bg-white border-slate-200 text-slate-500 hover:border-violet-300'}`}
          >
            <FiRefreshCw className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-xl transition-shadow"
            style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.25)' }}
          >
            <FiPlus className="w-5 h-5" />
            New Position
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-violet-100 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Clients</p>
              <p className="text-4xl font-extrabold mt-2" style={{ color: '#7c3aed' }}>{stats.total}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#8b5cf6', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)' }}>
              <FiBriefcase className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>

        {/* Active Openings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-emerald-100 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#10b981' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Openings</p>
              <p className="text-4xl font-extrabold mt-2" style={{ color: '#059669' }}>{stats.open}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#10b981', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
              <FiCheckCircle className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>

        {/* In Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-blue-100 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>In Progress</p>
              <p className="text-4xl font-extrabold mt-2" style={{ color: '#2563eb' }}>{stats.inProgress}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#3b82f6', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
              <FiClock className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>

        {/* Positions Filled */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-indigo-100 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#6366f1' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Positions Filled</p>
              <p className="text-4xl font-extrabold mt-2" style={{ color: '#4f46e5' }}>{stats.totalFilled}/{stats.totalOpenings}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#6366f1', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
              <FiUsers className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, client, or location..."
            className={`w-full rounded-xl border-2 py-3.5 pl-14 pr-5 text-base transition-all focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="relative">
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-5 py-3.5 pr-12 text-base font-medium cursor-pointer focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
          >
            <option value="all">All Clients</option>
            {ACTIVE_CLIENTS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
        <div className="relative">
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-5 py-3.5 pr-12 text-base font-medium cursor-pointer focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
          >
            <option value="all">All</option>
            <option value="Open">Open</option>
            <option value="Filled">Filled</option>
          </select>
          <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
        <div className="relative">
          <select
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); if (e.target.value !== 'custom') { setCustomStartDate(''); setCustomEndDate(''); } }}
            className={`appearance-none rounded-xl border-2 px-5 py-3.5 pr-12 text-base font-medium cursor-pointer focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date</option>
          </select>
          <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Custom Date Range Picker */}
      {filterDate === 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 items-end"
        >
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>From Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
            />
          </div>
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>To Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCustomStartDate(''); setCustomEndDate(''); setFilterDate('all'); }}
            className={`px-5 py-3 text-sm font-semibold rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Clear
          </motion.button>
        </motion.div>
      )}

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <FiAlertCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg">No job openings found</p>
          <p className="text-base mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-5">
          <AnimatePresence>
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => setSelectedJob(job)}
                className={`rounded-2xl border-2 p-6 transition-shadow cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-violet-500/50' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-violet-200'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left: Job Info */}
                  <div className="flex items-start gap-5 flex-1">
                    <div className="h-16 w-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0" style={{ background: getAvatarGradient(job.client) }}>
                      {job.clientLogo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{job.title}</h3>
                      </div>
                      <p className={`text-base mt-1.5 font-medium ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>{job.client}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiMapPin className="w-4 h-4" /> {job.location}
                        </span>
                        <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiDollarSign className="w-4 h-4" /> {job.salary}
                        </span>
                        <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiClock className="w-4 h-4" /> {job.type}
                        </span>
                        <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiCalendar className="w-4 h-4" /> Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.skills.map(skill => (
                          <span key={skill} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-violet-900/40 text-violet-300 border border-violet-700/50' : 'bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 border border-violet-200'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                      {/* Assigned Tasks Indicator */}
                      {jobTasks[job.id]?.length > 0 && (
                        <div className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-xl ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-800/40' : 'bg-emerald-50 border border-emerald-200'}`}>
                          <FiCheckCircle className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                            {jobTasks[job.id].length} task{jobTasks[job.id].length > 1 ? 's' : ''} assigned
                          </span>
                          <div className="flex -space-x-1.5 ml-auto">
                            {jobTasks[job.id].slice(0, 3).map(t => (
                              <div key={t.id} className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-white dark:border-slate-800" style={{ background: t.assigneeColor }}>
                                {t.assigneeAvatar || '?'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress & Actions */}
                  <div className="flex flex-col items-end gap-4">
                    {/* Progress */}
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Positions Filled</p>
                      <p className="text-3xl font-bold" style={{ color: '#7c3aed' }}>
                        {job.filled}/{job.openings}
                      </p>
                      <div className={`w-36 h-2 rounded-full mt-2 overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-violet-100'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(job.filled / job.openings) * 100}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setAssignTaskJob(job); }}
                        className={`p-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-violet-900/40 text-violet-400' : 'hover:bg-violet-100 text-violet-600 hover:text-violet-700'}`}
                        title="Assign Task"
                      >
                        <FiClipboard className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setEditingJob(job); setShowModal(true); }}
                        className={`p-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-violet-100 text-slate-500 hover:text-violet-600'}`}
                        title="Edit"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(job.id); }}
                        className={`p-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-900/40 text-slate-400 hover:text-red-400' : 'hover:bg-red-100 text-slate-500 hover:text-red-600'}`}
                        title="Delete"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Job Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.97 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative z-10 rounded-3xl shadow-2xl w-full ${modalStep === 2 ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900 border border-slate-700/50' : 'bg-white'}`}
              style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(139,92,246,0.1)' }}
            >

              {/* ═══ STEP 1: Job Form ═══ */}
              {modalStep === 1 && (
                <>
                  {/* Compact Header */}
                  <div className="relative overflow-hidden px-6 pt-6 pb-4">
                    <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)' }} />
                    <div className="relative flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                          <FiBriefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {editingJob ? 'Edit Position' : 'New Position'}
                          </h3>
                          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Fill in the details to create a job opening</p>
                        </div>
                      </div>
                      <button onClick={closeModal} className={`p-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">

                    {/* Section: Basic Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-violet-900/40' : 'bg-violet-100'}`}>
                          <FiBriefcase className={`w-3 h-3 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Basic Information</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Job Title *</label>
                          <input type="text" value={newJobForm.title} onChange={e => setNewJobForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Software Engineer"
                            className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Role Type * <span className={`font-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>(Resume Bank)</span></label>
                          <select value={newJobForm.roleType} onChange={e => setNewJobForm(f => ({ ...f, roleType: e.target.value }))}
                            className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          >
                            <option value="">Select Role Type</option>
                            {roleTypes.map(r => (
                              <option key={r.role} value={r.role}>{r.role} ({r.count})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Client/Company *</label>
                          <select value={newJobForm.client} onChange={e => setNewJobForm(f => ({ ...f, client: e.target.value }))}
                            className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          >
                            <option value="">Select Client</option>
                            {ACTIVE_CLIENTS.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Location</label>
                          <input type="text" value={newJobForm.location} onChange={e => setNewJobForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Bangalore"
                            className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Job Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                          <FiFileText className={`w-3 h-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Job Details</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Type</label>
                          <select value={newJobForm.type} onChange={e => setNewJobForm(f => ({ ...f, type: e.target.value }))}
                            className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Remote">Remote</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Salary</label>
                          <input type="text" value={newJobForm.salary} onChange={e => setNewJobForm(f => ({ ...f, salary: e.target.value }))} placeholder="15-25 LPA"
                            className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Openings</label>
                          <input type="number" value={newJobForm.openings} onChange={e => setNewJobForm(f => ({ ...f, openings: e.target.value }))} min="1"
                            className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Experience</label>
                          <input type="text" value={newJobForm.experience} onChange={e => setNewJobForm(f => ({ ...f, experience: e.target.value }))} placeholder="3-5 yrs"
                            className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Priority & Deadline Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Priority</label>
                        <div className="flex gap-2">
                          {[
                            { value: 'High', icon: '🔴', bg: isDarkMode ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600' },
                            { value: 'Medium', icon: '🟡', bg: isDarkMode ? 'bg-amber-900/30 border-amber-700/50 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600' },
                            { value: 'Low', icon: '🟢', bg: isDarkMode ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600' },
                          ].map(p => (
                            <motion.button key={p.value} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              onClick={() => setNewJobForm(f => ({ ...f, priority: p.value }))}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                                newJobForm.priority === p.value ? p.bg + ' border-current shadow-sm' : isDarkMode ? 'border-slate-700 text-slate-400 bg-slate-800/30' : 'border-slate-200 text-slate-500 bg-white'
                              }`}>
                              <span>{p.icon}</span> {p.value}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Deadline</label>
                        <input type="date" value={newJobForm.deadline} onChange={e => setNewJobForm(f => ({ ...f, deadline: e.target.value }))}
                          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Skills <span className={`font-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>(comma separated)</span></label>
                      <input type="text" value={newJobForm.skills} onChange={e => setNewJobForm(f => ({ ...f, skills: e.target.value }))} placeholder="e.g. React, Node.js, MongoDB"
                        className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Job Description</label>
                      <textarea value={newJobForm.description} onChange={e => setNewJobForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the role, responsibilities, and requirements..."
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all resize-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`flex items-center justify-between gap-3 px-6 py-4 border-t ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'}`}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                      className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                    >Cancel</motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      onClick={editingJob ? handleUpdatePosition : handleCreatePosition}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 8px 20px rgba(139,92,246,0.35)' }}
                    >
                      <FiPlus className="w-4 h-4" /> {editingJob ? 'Update Position' : 'Create Position'}
                    </motion.button>
                  </div>
                </>
              )}

              {/* ═══ STEP 2: Resume Bank Matches ═══ */}
              {modalStep === 2 && (
                <>
                  {/* Header */}
                  <div className="sticky top-0 z-10 flex items-center justify-between p-4" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #4f46e5)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                        <FiDatabase className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Matching Resumes from Resume Bank</h3>
                        <p className="text-xs text-white/70">Role: {newJobForm.roleType || newJobForm.title} — {newJobForm.client}</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className="p-2 rounded-lg transition-colors hover:bg-white/20 text-white/80 hover:text-white">
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-5">
                    {/* Position Created Success */}
                    <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: isDarkMode ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                        Position "<span className="font-bold">{newJobForm.title}</span>" created successfully! Select matching resumes to add to the pipeline.
                      </p>
                    </div>

                    {/* Loading State */}
                    {resumeFetchLoading && (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Searching Resume Bank for "{newJobForm.roleType || newJobForm.title}"...</p>
                      </div>
                    )}

                    {/* Results */}
                    {!resumeFetchLoading && matchedResumes.length > 0 && (
                      <>
                        {/* Select All / Count Bar */}
                        <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${isDarkMode ? 'bg-slate-700/50' : 'bg-violet-50'}`}>
                          <label className="flex items-center gap-3 cursor-pointer select-none" onClick={toggleSelectAll}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              selectedResumes.size === matchedResumes.length 
                                ? 'bg-violet-600 border-violet-600' 
                                : isDarkMode ? 'border-slate-500' : 'border-slate-300'
                            }`}>
                              {selectedResumes.size === matchedResumes.length && <FiCheck className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              Select All
                            </span>
                          </label>
                          <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {matchedResumes.length} resume{matchedResumes.length !== 1 ? 's' : ''} found
                            {selectedResumes.size > 0 && <span className="text-violet-500 font-semibold"> · {selectedResumes.size} selected</span>}
                          </span>
                        </div>

                        {/* Resume Cards */}
                        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                          {matchedResumes.map((resume, idx) => {
                            const isSelected = selectedResumes.has(resume.id);
                            return (
                              <motion.div
                                key={resume.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                onClick={() => toggleResumeSelection(resume.id)}
                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                  isSelected
                                    ? isDarkMode ? 'border-violet-500 bg-violet-500/10' : 'border-violet-500 bg-violet-50'
                                    : isDarkMode ? 'border-slate-700 bg-slate-700/30 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-violet-300'
                                }`}
                              >
                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  isSelected ? 'bg-violet-600 border-violet-600' : isDarkMode ? 'border-slate-500' : 'border-slate-300'
                                }`}>
                                  {isSelected && <FiCheck className="w-3.5 h-3.5 text-white" />}
                                </div>

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                                  {(resume.candidateName || resume.fileName || 'U').charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                      {resume.candidateName || resume.fileName?.replace(/\.[^.]+$/, '') || 'Unknown'}
                                    </p>
                                    {resume.experience && (
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                        {resume.experience}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-xs">
                                    {resume.email && (
                                      <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <FiMail className="w-3 h-3" /> {resume.email}
                                      </span>
                                    )}
                                    {resume.phone && (
                                      <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <FiPhone className="w-3 h-3" /> {resume.phone}
                                      </span>
                                    )}
                                    {resume.location && (
                                      <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <FiMapPin className="w-3 h-3" /> {resume.location}
                                      </span>
                                    )}
                                  </div>
                                  {resume.skills && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {(Array.isArray(resume.skills) ? resume.skills : resume.skills.split(',').map(s => s.trim())).slice(0, 5).map((skill, si) => (
                                        <span key={si} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                                          {skill}
                                        </span>
                                      ))}
                                      {(Array.isArray(resume.skills) ? resume.skills : resume.skills.split(',')).length > 5 && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-600 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                          +{(Array.isArray(resume.skills) ? resume.skills : resume.skills.split(',')).length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Rating if available */}
                                {resume.rating && (
                                  <div className="flex items-center gap-0.5 flex-shrink-0">
                                    <FiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{resume.rating}</span>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* No Results */}
                    {!resumeFetchLoading && matchedResumes.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: isDarkMode ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)' }}>
                          <FiDatabase className="w-8 h-8" style={{ color: '#8b5cf6' }} />
                        </div>
                        <p className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No matching resumes found</p>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No resumes in the bank match "{newJobForm.roleType || newJobForm.title}". You can add candidates manually later.</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className={`sticky bottom-0 flex items-center justify-between gap-3 p-4 border-t ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                      className={`px-5 py-2.5 text-sm font-semibold rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                    >Skip</motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddSelectedToPipeline}
                      disabled={selectedResumes.size === 0}
                      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg transition-opacity ${selectedResumes.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', boxShadow: '0 8px 16px rgba(139,92,246,0.3)' }}
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Add {selectedResumes.size > 0 ? `${selectedResumes.size} ` : ''}Selected to Pipeline
                    </motion.button>
                  </div>
                </>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Task Modal */}
      <AnimatePresence>
        {assignTaskJob && <AssignTaskModal isDarkMode={isDarkMode} job={assignTaskJob} onClose={() => setAssignTaskJob(null)} onAssign={handleAssignTask} />}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative z-10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
              <div className="py-6" style={{ background: 'linear-gradient(135deg, #ef4444, #e11d48)' }}>
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <FiTrash2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Delete Position?</h3>
                <p className={`text-sm mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>This will permanently remove the job opening and all associated candidates.</p>
                <div className="flex items-center justify-center gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setConfirmDelete(null)} className={`px-5 py-2.5 text-sm font-semibold rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={async () => {
                    try { await deleteRecruitmentPosition(confirmDelete); } catch (e) { console.error('Backend delete failed:', e); }
                    setJobs(jobs.filter(j => j.id !== confirmDelete)); setConfirmDelete(null);
                  }} className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/25">
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default JobOpeningsTab;
