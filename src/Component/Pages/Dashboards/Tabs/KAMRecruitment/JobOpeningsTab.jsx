import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiMapPin,
  FiDollarSign,
  FiUsers,
  FiClock,
  FiX,
  FiChevronDown,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
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
import { getResumeBankResumes, getResumeRoleTypes, getAllRecruitmentPositions, createRecruitmentPosition, updateRecruitmentPosition, deleteRecruitmentPosition, getAllClients, getDepartmentTeamMembers, createDepartmentTask, getAllCandidates, assignResumesToPosition } from '../../../service/api';

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const config = {
    Open: { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
    'In Progress': { gradient: 'from-[#3FA9F5] to-[#0D47A1]', shadow: 'shadow-[#3FA9F5]/25' },
    'On Hold': { gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
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
    Medium: 'from-[#3FA9F5] to-[#0D47A1] text-white',
    Low: 'from-slate-400 to-slate-500 text-white',
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${config[priority] || config.Medium}`}>
      {priority}
    </span>
  );
};

/* ── Assign Task Modal ── */
const AssignTaskModal = ({ isDarkMode, job, onClose, onAssign, teamMembers = [] }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState({ id: 'MEGA_BULK', name: 'All Matching Candidates' });
  const [candidates, setCandidates] = useState([]);
  const [resumeBankSuggestions, setResumeBankSuggestions] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [step] = useState(2); // strictly 2 to skip Step 1 candidate selection

  const taskTypes = [
    { label: 'Screen CVs', icon: FiFileText, desc: 'Review and shortlist candidates' },
    { label: 'Source Candidates', icon: FiSearch, desc: 'Find new candidates for role' },
    { label: 'Schedule Interviews', icon: FiCalendar, desc: 'Arrange interview slots' },
    { label: 'Follow Up', icon: FiPhone, desc: 'Follow up with candidates' },
    { label: 'Client Update', icon: FiBriefcase, desc: 'Send progress report to client' },
    { label: 'Custom Task', icon: FiEdit2, desc: 'Define a custom task' },
  ];

  const priorities = [
    { value: 'High', color: '#ef4444', bg: isDarkMode ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600', icon: '🔴' },
    { value: 'Medium', color: '#f59e0b', bg: isDarkMode ? 'bg-[#1E88E5]/30 border-[#1E88E5]/50 text-[#3FA9F5]' : 'bg-[#1E88E5]/10 border-[#1E88E5]/30 text-[#1E88E5]', icon: '🟡' },
    { value: 'Low', color: '#10b981', bg: isDarkMode ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600', icon: '🟢' },
  ];

  useEffect(() => {
    if (job?.id) {
      const fetchCandidatesForJob = async () => {
        setLoadingCandidates(true);
        try {
          const res = await getAllCandidates({ positionId: job.id });
          if (res?.success) {
            setCandidates(res.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch candidates:", err);
        } finally {
          setLoadingCandidates(false);
        }
      };
      
      const fetchBankSuggestions = async () => {
        if (!job.roleType) return;
        setLoadingBank(true);
        try {
          // Parse roleType to get the name (e.g. "Engineer" from "Engineer (261)")
          const roleName = job.roleType.split(' (')[0];
          const res = await getResumeBankResumes({ role: roleName, limit: 20 });
          if (res?.success) {
            setResumeBankSuggestions(res.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch bank suggestions:", err);
        } finally {
          setLoadingBank(false);
        }
      };

      fetchCandidatesForJob();
      fetchBankSuggestions();
    }
  }, [job?.id, job?.roleType]);

  const handleSubmit = async () => {
    if (!taskTitle && !taskType) return;
    
    setLoadingCandidates(true); // Reuse loading state for submission
    try {
      let finalCandidateId = selectedCandidate?.id || selectedCandidate?._id;
      
      // If candidate is from Resume Bank, onboard them to the position first
      if (selectedCandidate?.isFromBank) {
        const onboardRes = await assignResumesToPosition(
          [finalCandidateId],
          job?.id,
          assignee
        );
        // After onboarding, we might have a new candidate ID, but using the existing one for the task
        // should work if the backend handles the mapping.
      }

      const member = teamMembers.find(t => t.id === assignee);
      const taskData = {
        id: Date.now(),
        title: taskTitle || taskType,
        type: taskType,
        assignee: member ? member.name : '',
        assigneeId: assignee,
        assigneeAvatar: member ? member.avatar : '',
        assigneeColor: member ? member.color : '#1E88E5',
        priority: taskPriority,
        deadline: taskDeadline,
        description: selectedCandidate 
          ? `[Candidate: ${selectedCandidate.name}] ${taskDescription}` 
          : taskDescription,
        candidateId: finalCandidateId,
        createdAt: new Date().toISOString(),
        status: 'Pending',
      };
      
      if (onAssign) await onAssign(job?.id, taskData);
      setSubmitted(true);
      setTimeout(() => { onClose(); }, 1200);
    } catch (error) {
      console.error("Failed to complete assignment:", error);
      // Alert user or handle error
    } finally {
      setLoadingCandidates(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full flex items-center justify-center p-8 py-20 min-h-[50vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 15 }}
          className={`rounded-3xl p-10 text-center max-w-md w-full shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)' }}>
            <FiCheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Task Assigned!</h3>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
             Assignment Successful
          </p>
        </motion.div>
      </div>
    );
  }

  const handleCandidateSelect = (c) => {
    setSelectedCandidate(c);
  };

  return (
    <div className="w-full pb-8">
      {/* ── Top Bar ── */}
      <div className={`sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 mb-6 rounded-xl ${isDarkMode ? 'bg-slate-800/95 backdrop-blur-sm border-b border-slate-700' : 'bg-white/95 backdrop-blur-sm border-b border-slate-200'}`}>
        <motion.button whileHover={{ x: -4 }} whileTap={{ scale: 0.98 }} onClick={onClose}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'text-[#3FA9F5] hover:bg-slate-700' : 'text-[#1E88E5] hover:bg-[#1E88E5]/10'}`}>
          <FiArrowLeft className="w-5 h-5" /> Back to Jobs
        </motion.button>
        <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Assign Task for {job?.title}</h2>
        <div className="w-24"></div>
      </div>

      <div className={`mx-auto max-w-4xl overflow-hidden rounded-3xl shadow-xl flex flex-col ${isDarkMode ? 'bg-slate-900 border border-slate-700/50' : 'bg-white border border-slate-200'}`}>
        {/* ── Compact Header ── */}
        <div className="relative overflow-hidden px-4 sm:px-6 pt-6 pb-4">
          <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, #3FA9F5 0%, #1E88E5 50%, #0D47A1 100%)' }} />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)' }}>
                <FiClipboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>New Task Assignment</h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDarkMode ? 'bg-[#1E88E5]/40 text-[#3FA9F5]' : 'bg-[#1E88E5]/10 text-[#1E88E5]'}`}>{job?.title}</span>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>•</span>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{job?.client}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-4 sm:px-6 pb-6 space-y-5">
            {/* Selected Candidate Badge (Bulk Info) */}
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-6 border-2 ${selectedCandidate.id === 'MEGA_BULK' ? (isDarkMode ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-indigo-50 border-indigo-100 shadow-sm') : (isDarkMode ? 'bg-blue-900/30 border-blue-700/50' : 'bg-blue-50 border-blue-100')}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg ${selectedCandidate.id === 'MEGA_BULK' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-blue-500 shadow-blue-500/20'}`}>
                    {selectedCandidate.id === 'MEGA_BULK' ? <FiUsers /> : (selectedCandidate.name || 'C').substring(0, 1)}
                </div>
                <div className="flex-1">
                    <span className={`text-[12px] font-bold block ${selectedCandidate.id === 'MEGA_BULK' ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-700') : (isDarkMode ? 'text-blue-400' : 'text-blue-700')}`}>
                    {selectedCandidate.id === 'MEGA_BULK' ? 'Target: All Matching Candidates (Automatic)' : `Task for: ${selectedCandidate.name}`}
                    </span>
                    {selectedCandidate.id === 'MEGA_BULK' && (
                    <span className={`text-[10px] opacity-70 block ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                        Includes pipeline candidates & matching profiles from Resume Bank
                    </span>
                    )}
                </div>
            </div>

            {/* Quick Task Type Chips */}
            <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Quick Select Task Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {taskTypes.map(t => (
                    <motion.button key={t.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => { setTaskType(t.label); if (!taskTitle) setTaskTitle(t.label); }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${taskType === t.label
                        ? 'border-[#1E88E5] shadow-lg ' + (isDarkMode ? 'bg-[#1E88E5]/30' : 'bg-[#1E88E5]/10')
                        : isDarkMode ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md mb-1" style={{ background: 'linear-gradient(135deg, #5fa8f0, #76A8DB)' }}>
                        <t.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-semibold leading-tight ${taskType === t.label ? (isDarkMode ? 'text-[#3FA9F5]' : 'text-[#1E88E5]') : isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{t.label}</span>
                    </motion.button>
                    ))}
                </div>
            </div>

              {/* Task Title */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Task Title *</label>
                <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Screen 10 candidates for shortlist"
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                />
              </div>

              {/* Assign To — Team Member Cards */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign To *</label>
                <div className="space-y-2">
                  {teamMembers.map(m => (
                    <motion.button key={m.id} whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}
                      onClick={() => setAssignee(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${assignee === m.id
                        ? 'border-[#1E88E5] shadow-md ' + (isDarkMode ? 'bg-[#1E88E5]/20' : 'bg-[#1E88E5]/10')
                        : isDarkMode ? 'border-slate-700 hover:border-slate-600 bg-slate-800/30' : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: m.color }}>
                        {m.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{m.name}</p>
                        <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{m.role}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${assignee === m.id ? 'border-[#1E88E5] bg-[#1E88E5]' : isDarkMode ? 'border-slate-600' : 'border-slate-300'
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
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${taskPriority === p.value ? p.bg + ' border-current shadow-sm' : isDarkMode ? 'border-slate-700 text-slate-400 bg-slate-800/30' : 'border-slate-200 text-slate-500 bg-white'}`}>
                      <span className="text-xs">{p.icon}</span> {p.value}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Deadline</label>
                <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Notes (optional)</label>
                <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows={3} placeholder="Add any specific instructions..."
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all resize-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                />
              </div>
        </div>

        {/* ── Footer ── */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'}`}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >Cancel</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={(!taskTitle && !taskType) || !assignee}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all ${(!taskTitle && !taskType) || !assignee ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
            style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)', boxShadow: (!taskTitle && !taskType) || !assignee ? 'none' : '0 8px 20px rgba(31,136,229,0.35)' }}
          >
            <FiSend className="w-4 h-4" /> Assign Task
          </motion.button>
        </div>
      </div>
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
          className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-[#3FA9F5] hover:text-[#1E88E5]' : 'text-[#1E88E5] hover:text-[#0D47A1]'}`}
        >
          <FiArrowLeft className="w-5 h-5" /> Back to Job Openings
        </motion.button>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onAssignTask(job)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)', boxShadow: '0 8px 16px rgba(31,136,229,0.3)' }}
          >
            <FiClipboard className="w-4 h-4" /> Assign Task
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onEdit(job)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border-2 ${isDarkMode ? 'border-slate-600 text-slate-300 hover:border-[#1E88E5]' : 'border-slate-200 text-slate-600 hover:border-[#1E88E5]'}`}
          >
            <FiEdit2 className="w-4 h-4" /> Edit Position
          </motion.button>
        </div>
      </div>

      {/* Header Card */}
      <div className={`rounded-2xl border-2 p-4 sm:p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-[#1E88E5]/20 shadow-lg'}`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="h-20 w-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0 mx-auto sm:mx-0"
              style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)' }}>
              {job.clientLogo}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{job.title}</h2>
              </div>
              <p className={`text-lg mt-1 font-medium ${isDarkMode ? 'text-[#3FA9F5]' : 'text-[#1E88E5]'}`}>{job.client}</p>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-5 mt-3">
                <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiMapPin className="w-4 h-4" /> {job.location}</span>
                <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <FiDollarSign className="w-4 h-4" style={{ display: 'none' }} />
                  <span className="text-sm">₹</span> {job.salary}
                </span>
                <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiClock className="w-4 h-4" /> {job.type}</span>
                <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiCalendar className="w-4 h-4" /> Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                {job.skills.map(skill => (
                  <span key={skill} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-[#1E88E5]/40 text-[#3FA9F5] border border-[#1E88E5]/50' : 'bg-gradient-to-r from-[#1E88E5]/10 to-blue-50 text-[#1E88E5] border border-[#1E88E5]/30'}`}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center lg:text-right flex-shrink-0">
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Positions Filled</p>
            <p className="text-4xl font-bold" style={{ color: '#1E88E5' }}>{job.filled}/{job.openings}</p>
            <div className={`w-36 h-2.5 rounded-full mt-2 overflow-hidden mx-auto lg:mx-0 ${isDarkMode ? 'bg-slate-700' : 'bg-[#1E88E5]/20'}`}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(job.filled / job.openings) * 100}%` }} transition={{ duration: 0.8 }}
                className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex flex-wrap gap-1 p-1.5 rounded-xl ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
              ? (isDarkMode ? 'bg-[#1E88E5] text-white shadow-lg' : 'bg-white text-[#1E88E5] shadow-md')
              : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`rounded-2xl border-2 p-4 sm:p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-[#1E88E5]/5 border border-[#1E88E5]/20'}`}>
                <div className="p-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)' }}>
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
            <div className={`p-4 rounded-xl mt-4 ${isDarkMode ? 'bg-[#1E88E5]/20 border border-[#1E88E5]/30' : 'bg-[#1E88E5]/10 border border-[#1E88E5]/30'}`}>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-[#3FA9F5]' : 'text-[#1E88E5]'}`}>Key Skills Required</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.skills.map(skill => (
                  <span key={skill} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-[#1E88E5]/40 text-[#3FA9F5]' : 'bg-[#1E88E5]/10 text-[#1E88E5]'}`}>{skill}</span>
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
                `${job.experience ? (parseInt(job.experience) || job.experience) : '3+'}${typeof job.experience === 'number' || (job.experience && !job.experience.includes('year')) ? ' years' : ''} of relevant industry experience`,
                `Excellent problem-solving and analytical skills`,
                `Strong communication and teamwork abilities`,
                `Bachelor's degree in relevant field (or equivalent experience)`,
                `Experience with ${job.skills.slice(1).join(', ') || 'modern tools and technologies'}`,
              ]).map((req, i) => (
                <li key={i} className={`flex items-start gap-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <FiCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#1E88E5' }} />
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
                  <FiTarget className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#1E88E5' }} />
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
const CACHE_KEY_JOBS = 'cache_kamJobOpenings';
const CACHE_KEY_ROLES = 'cache_kamRoleTypes';
const CACHE_KEY_CLIENTS = 'cache_kamClients';

const JobOpeningsTab = ({ isDarkMode }) => {
  // Start with cached data or empty arrays - will fetch real data from API
  const [jobs, setJobs] = useState(() => {
    try { const c = localStorage.getItem(CACHE_KEY_JOBS); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [clients, setClients] = useState(() => {
    try { const c = localStorage.getItem(CACHE_KEY_CLIENTS); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  // NEW STATE FOR FULL PAGE FORM
  const [showFullPageForm, setShowFullPageForm] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [matchedResumes, setMatchedResumes] = useState([]);
  const [selectedResumes, setSelectedResumes] = useState(new Set());
  const [resumeFetchLoading, setResumeFetchLoading] = useState(false);
  const [roleTypes, setRoleTypes] = useState(() => {
    try { const c = localStorage.getItem(CACHE_KEY_ROLES); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [roleTypesLoading, setRoleTypesLoading] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: '', client: '', clientId: '', location: '', type: 'Full-time', salary: '',
    openings: 1, experience: '', priority: 'Medium', deadline: '', skills: '', description: '', roleType: ''
  });

  // ── Fetch clients from backend ──
  const fetchClients = async () => {
    try {
      const response = await getAllClients();
      // Handle { success: true, data: { clients: [...] } } or { clients: [...] } or direct array
      const rawClients = response.data?.clients || response.clients || response.data || [];
      const clientsData = (Array.isArray(rawClients) ? rawClients : []).map(c => ({
        id: c.id || c._id,
        name: c.companyName || c.name || c.clientName || 'Unknown',
      }));
      setClients(clientsData);
      try { localStorage.setItem(CACHE_KEY_CLIENTS, JSON.stringify(clientsData)); } catch {}
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  // ── Fetch team members from backend ──
  const fetchTeamMembers = async () => {
    try {
      const response = await getDepartmentTeamMembers('HR Recruitment');
      const rawMembers = response.members || response.data || [];
      const members = (Array.isArray(rawMembers) ? rawMembers : []).map(m => ({
        id: m._id || m.id,
        name: m.name || m.fullName || 'Unknown',
        role: m.role || m.position || 'Team Member',
        avatar: (m.name || 'U').substring(0, 1).toUpperCase(),
        color: '#1E88E5',
      }));
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  // ── Fetch positions from backend (always background) ──
  const fetchPositions = async () => {
    setRefreshing(true);
    try {
      const filters = {};
      if (filterClient !== 'all') filters.client = filterClient;
      if (searchTerm) filters.search = searchTerm;
      const response = await getAllRecruitmentPositions(filters);
      const positions = (response.data || []).map(p => ({
        id: p.id || p._id,
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
        tasks: p.tasks || [],
        clientId: p.clientId,
      }));

      // Update jobTasks mapping
      const taskMap = {};
      positions.forEach(p => {
        if (p.tasks && p.tasks.length > 0) {
          taskMap[p.id] = p.tasks.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            deadline: t.dueDate,
            assignee: t.assignedToName,
            status: t.status,
            assigneeAvatar: (t.assignedToName || 'U').substring(0, 1).toUpperCase()
          }));
        }
      });
      setJobTasks(taskMap);

      setJobs(positions);
      try { localStorage.setItem(CACHE_KEY_JOBS, JSON.stringify(positions)); } catch { }
    } catch (error) {
      console.error('Failed to fetch positions from backend:', error);
      // Keep whatever data we already have showing
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchClients();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem('kamJobOpenings', JSON.stringify(jobs));
    }
  }, [jobs]);

  useEffect(() => {
    const fetchRoles = async () => {
      setRefreshing(true);
      try {
        const response = await getResumeRoleTypes();
        const rolesData = response.data || response.roles || [];
        const mapped = rolesData.map(r => ({ role: r.role || r.name || r.roleType || '', count: r.count || 0 }));
        setRoleTypes(mapped);
        try { localStorage.setItem(CACHE_KEY_ROLES, JSON.stringify(mapped)); } catch { }
      } catch (error) {
        console.error('Failed to fetch role types:', error);
        // Keep existing role types
      } finally {
        setRefreshing(false);
      }
    };
    fetchRoles();
  }, []);

  const handleAssignTask = async (jobId, taskData) => {
    try {
      if (taskData.candidateId === 'ALL' || taskData.candidateId === 'MEGA_BULK') {
        const selectedPosition = jobs.find(p => p.id === jobId);
        if (!selectedPosition) return;

        let totalTargetIds = [];
        
        // 1. Fetch Pipeline Candidates
        const candidatesRes = await getAllCandidates({ positionId: jobId });
        const pipelineCandidates = candidatesRes?.success ? (candidatesRes.data || []) : [];
        pipelineCandidates.forEach(c => totalTargetIds.push({ id: c._id || c.id, name: c.name }));

        // 2. For MEGA_BULK, fetch and onboard Resume Bank profiles
        if (taskData.candidateId === 'MEGA_BULK') {
            const roleName = selectedPosition.roleType?.split(' (')[0];
            if (roleName) {
                const bankRes = await getResumeBankResumes({ role: roleName });
                const bankResumes = bankRes?.success ? (bankRes.data || []) : [];
                
                if (bankResumes.length > 0) {
                    const bankResumeIds = bankResumes.map(r => r._id || r.id);
                    // Bulk onboard bank profiles to the position
                    await assignResumesToPosition(bankResumeIds, jobId, taskData.assigneeId);
                    
                    // Add bank candidates to the target list
                    bankResumes.forEach(r => {
                      // Check if already in pipeline to avoid duplicate task creation if possible
                      if (!totalTargetIds.find(tid => tid.id === (r._id || r.id))) {
                        totalTargetIds.push({ id: r._id || r.id, name: r.name });
                      }
                    });
                }
            }
        }

        if (totalTargetIds.length === 0) {
          console.warn("No candidates found for assignment.");
          return;
        }

        // 3. Create Tasks for Everyone
        for (const target of totalTargetIds) {
          const apiPayload = {
            title: taskData.title,
            description: `[Direct: ${target.name}] ${taskData.description.replace(/^\[Direct: .*?\] /, '')}`,
            department: 'HR Recruitment',
            assignedTo: taskData.assigneeId,
            priority: taskData.priority,
            dueDate: taskData.deadline,
            positionId: jobId,
            candidateId: target.id
          };
          await createDepartmentTask(apiPayload);
        }
      } else {
        const apiPayload = {
          title: taskData.title,
          description: taskData.description || `Task for job: ${jobId}`,
          department: 'HR Recruitment',
          assignedTo: taskData.assigneeId,
          priority: taskData.priority,
          dueDate: taskData.deadline,
          positionId: jobId,
          candidateId: taskData.candidateId
        };
        await createDepartmentTask(apiPayload);
      }

      // Success feedback (optimistic update or just refresh)
      setJobTasks(prev => ({
        ...prev,
        [jobId]: [...(prev[jobId] || []), taskData],
      }));
    } catch (error) {
      console.error('Failed to assign task:', error);
      // Fallback: show local update anyway but warn? (Actually better to just log)
      setJobTasks(prev => ({
        ...prev,
        [jobId]: [...(prev[jobId] || []), { ...taskData, error: true }],
      }));
    }
  };

  const resetModal = () => {
    setModalStep(1);
    setMatchedResumes([]);
    setSelectedResumes(new Set());
    setResumeFetchLoading(false);
    setNewJobForm({ title: '', client: '', clientId: '', location: '', type: 'Full-time', salary: '', openings: 1, experience: '', priority: 'Medium', deadline: '', skills: '', description: '', roleType: '' });
  };

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

  const handleCreatePosition = async () => {
    try {
      const positionData = {
        title: newJobForm.title,
        clientId: newJobForm.clientId,
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
        teamLeaderId: JSON.parse(localStorage.getItem('user'))?.id || undefined,
      };
      const result = await createRecruitmentPosition(positionData);
      const created = result.data || {};

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
    setJobs(prev => {
      const updatedJobs = prev.map(j => j.id === editingJob.id ? {
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
      } : j);
      
      // Update selectedJob if it's the one being edited
      if (selectedJob && selectedJob.id === editingJob.id) {
        const updatedSelected = updatedJobs.find(j => j.id === editingJob.id);
        setSelectedJob(updatedSelected);
      }
      
      return updatedJobs;
    });
    setShowFullPageForm(false);
    setEditingJob(null);
    resetModal();
  };

  const toggleResumeSelection = (resumeId) => {
    setSelectedResumes(prev => {
      const next = new Set(prev);
      if (next.has(resumeId)) next.delete(resumeId);
      else next.add(resumeId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedResumes.size === matchedResumes.length) {
      setSelectedResumes(new Set());
    } else {
      setSelectedResumes(new Set(matchedResumes.map(r => r.id)));
    }
  };

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
      window.dispatchEvent(new StorageEvent('storage', { key: 'kamSelectedResumes', newValue: JSON.stringify(pipelineData) }));
    }
    setShowFullPageForm(false);
    setEditingJob(null);
    resetModal();
  };

  const handleBackToJobs = () => {
    setShowFullPageForm(false);
    setEditingJob(null);
    resetModal();
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowFullPageForm(true);
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteRecruitmentPosition(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (error) {
      console.error('Backend delete failed, deleting locally:', error);
      setJobs(prev => prev.filter(j => j.id !== jobId));
    }
    setConfirmDelete(null);
  };

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'Open' || j.status === 'Urgent').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    closed: jobs.filter(j => j.status === 'Closed').length,
    totalOpenings: jobs.reduce((sum, j) => sum + j.openings, 0),
    totalFilled: jobs.reduce((sum, j) => sum + j.filled, 0),
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'all' || job.client === filterClient;
    const matchesPosition = filterPosition === 'all' || (filterPosition === 'Open' ? (job.filled || 0) < (job.openings || 1) : (job.filled || 0) >= (job.openings || 1));
    let matchesDate = true;
    if (filterDate !== 'all' && job.postedDate) {
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
      'linear-gradient(135deg, #3FA9F5, #0D47A1)',
      'linear-gradient(135deg, #1E88E5, #0D47A1)',
      'linear-gradient(135deg, #3FA9F5, #1E88E5)',
      'linear-gradient(135deg, #1E88E5, #0D47A1)',
      'linear-gradient(135deg, #3FA9F5, #0D47A1)'
    ];
    return gradients[(name || '').charCodeAt(0) % gradients.length];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-2">
            <div className={`h-8 w-48 sm:w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-32 sm:w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
          <div className={`h-10 w-32 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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


  return (
    <>
      <AnimatePresence mode="wait">
        {showFullPageForm ? (
          <motion.div
            key="fullpage-form"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full"
          >
            {/* Back Button Header */}
            <div className={`sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 mb-4 rounded-xl ${isDarkMode ? 'bg-slate-800/95 backdrop-blur-sm border-b border-slate-700' : 'bg-white/95 backdrop-blur-sm border-b border-slate-200'}`}>
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBackToJobs}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'text-[#3FA9F5] hover:bg-slate-700' : 'text-[#1E88E5] hover:bg-[#1E88E5]/10'}`}
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Job Openings
              </motion.button>
              <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {editingJob ? 'Edit Position' : 'Create New Position'}
              </h2>
              <div className="w-24"></div>
            </div>

            {/* Form Content */}
            {modalStep === 1 ? (
              <div className="px-4 sm:px-6 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Column 1: Basic Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-[#1E88E5]/40' : 'bg-[#1E88E5]/10'}`}>
                        <FiBriefcase className={`w-3 h-3 ${isDarkMode ? 'text-[#3FA9F5]' : 'text-[#1E88E5]'}`} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Basic Information</span>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Job Title *</label>
                      <input type="text" value={newJobForm.title} onChange={e => setNewJobForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Senior Software Engineer"
                        className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Role Type * <span className={`font-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>(Resume Bank)</span></label>
                      <select value={newJobForm.roleType} onChange={e => setNewJobForm(f => ({ ...f, roleType: e.target.value }))}
                        className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="">Select Role Type</option>
                        {roleTypes.map(r => (
                          <option key={r.role} value={r.role}>{r.role} ({r.count})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Client/Company *</label>
                      <select value={newJobForm.clientId} onChange={e => {
                        const selected = clients.find(c => c.id === e.target.value);
                        setNewJobForm(f => ({ ...f, clientId: e.target.value, client: selected?.name || '' }));
                      }}
                        className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="">Select Client</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Location</label>
                      <input type="text" value={newJobForm.location} onChange={e => setNewJobForm(f => ({ ...f, location: e.target.value }))}
                        placeholder="e.g. Bangalore, Remote"
                        className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                      />
                    </div>
                  </div>

                  {/* Column 2: Job Details & Compensation */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-[#1E88E5]/40' : 'bg-[#1E88E5]/10'}`}>
                        <FiFileText className={`w-3 h-3 ${isDarkMode ? 'text-[#3FA9F5]' : 'text-[#1E88E5]'}`} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Job Details</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Type</label>
                        <select value={newJobForm.type} onChange={e => setNewJobForm(f => ({ ...f, type: e.target.value }))}
                          className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Salary</label>
                        <input type="text" value={newJobForm.salary} onChange={e => setNewJobForm(f => ({ ...f, salary: e.target.value }))}
                          placeholder="15-25 LPA"
                          className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Openings</label>
                        <input type="number" value={newJobForm.openings} onChange={e => setNewJobForm(f => ({ ...f, openings: e.target.value }))} min="1"
                          className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Experience</label>
                        <input type="text" value={newJobForm.experience} onChange={e => setNewJobForm(f => ({ ...f, experience: e.target.value }))}
                          placeholder="3-5 yrs"
                          className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                        />
                      </div>
                    </div>

                    {/* <div>
                    <label className={`block text-xs font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Priority</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'High', icon: '🔴', bg: isDarkMode ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600' },
                        { value: 'Medium', icon: '🟡', bg: isDarkMode ? 'bg-[#1E88E5]/30 border-[#1E88E5]/50 text-[#3FA9F5]' : 'bg-[#1E88E5]/10 border-[#1E88E5]/30 text-[#1E88E5]' },
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
                  </div> */}

                    <div>
                      <label className={`block text-xs font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Deadline</label>
                      <input type="date" value={newJobForm.deadline} onChange={e => setNewJobForm(f => ({ ...f, deadline: e.target.value }))}
                        className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                  </div>

                  {/* Column 3: Skills & Description */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-emerald-900/40' : 'bg-emerald-100'}`}>
                        <FiTarget className={`w-3 h-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Skills & Description</span>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Skills <span className={`font-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>(comma separated)</span></label>
                      <input type="text" value={newJobForm.skills} onChange={e => setNewJobForm(f => ({ ...f, skills: e.target.value }))}
                        placeholder="e.g. React, Node.js, MongoDB"
                        className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Job Description</label>
                      <textarea value={newJobForm.description} onChange={e => setNewJobForm(f => ({ ...f, description: e.target.value }))}
                        rows={6}
                        placeholder="Describe the role, responsibilities, and requirements..."
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all resize-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`flex flex-col sm:flex-row items-center justify-end gap-3 mt-8 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBackToJobs}
                    className={`w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-xl transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={editingJob ? handleUpdatePosition : handleCreatePosition}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)', boxShadow: '0 8px 20px rgba(31,136,229,0.35)' }}
                  >
                    <FiPlus className="w-4 h-4" />
                    {editingJob ? 'Update Position' : 'Create Position'}
                  </motion.button>
                </div>
              </div>
            ) : (
              // Step 2: Resume Matches
              <div className="px-4 sm:px-6 pb-8">
                <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: isDarkMode ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                    Position "<span className="font-bold">{newJobForm.title}</span>" created successfully! Select matching resumes to add to the pipeline.
                  </p>
                </div>

                {resumeFetchLoading && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-[#1E88E5]/30 border-t-[#1E88E5] rounded-full animate-spin mb-4" />
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Searching Resume Bank for "{newJobForm.roleType || newJobForm.title}"...</p>
                  </div>
                )}

                {!resumeFetchLoading && matchedResumes.length > 0 && (
                  <>
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl mb-4 gap-2 ${isDarkMode ? 'bg-slate-700/50' : 'bg-[#1E88E5]/10'}`}>
                      <label className="flex items-center gap-3 cursor-pointer select-none" onClick={toggleSelectAll}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedResumes.size === matchedResumes.length ? 'bg-[#1E88E5] border-[#1E88E5]' : isDarkMode ? 'border-slate-500' : 'border-slate-300'
                          }`}>
                          {selectedResumes.size === matchedResumes.length && <FiCheck className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Select All</span>
                      </label>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {matchedResumes.length} resume{matchedResumes.length !== 1 ? 's' : ''} found
                        {selectedResumes.size > 0 && <span className="text-[#1E88E5] font-semibold"> · {selectedResumes.size} selected</span>}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                      {matchedResumes.map((resume, idx) => {
                        const isSelected = selectedResumes.has(resume.id);
                        return (
                          <motion.div
                            key={resume.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => toggleResumeSelection(resume.id)}
                            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? (isDarkMode ? 'border-[#1E88E5] bg-[#1E88E5]/10' : 'border-[#1E88E5] bg-[#1E88E5]/10') : (isDarkMode ? 'border-slate-700 bg-slate-700/30 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-[#1E88E5]/50')
                              }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-[#1E88E5] border-[#1E88E5]' : isDarkMode ? 'border-slate-500' : 'border-slate-300'
                              }`}>
                              {isSelected && <FiCheck className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)' }}>
                              {(resume.candidateName || resume.fileName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                {resume.candidateName || resume.fileName?.replace(/\.[^.]+$/, '') || 'Unknown'}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                {resume.email && <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiMail className="w-3 h-3" /> {resume.email}</span>}
                                {resume.phone && <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiPhone className="w-3 h-3" /> {resume.phone}</span>}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}

                {!resumeFetchLoading && matchedResumes.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: isDarkMode ? 'rgba(31,136,229,0.15)' : 'rgba(31,136,229,0.1)' }}>
                      <FiDatabase className="w-8 h-8" style={{ color: '#1E88E5' }} />
                    </div>
                    <p className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No matching resumes found</p>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No resumes in the bank match "{newJobForm.roleType || newJobForm.title}". You can add candidates manually later.</p>
                  </div>
                )}

                <div className={`flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBackToJobs}
                    className={`w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Skip
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleAddSelectedToPipeline}
                    disabled={selectedResumes.size === 0}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-opacity ${selectedResumes.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)', boxShadow: '0 8px 16px rgba(31,136,229,0.3)' }}
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Add {selectedResumes.size > 0 ? `${selectedResumes.size} ` : ''}Selected to Pipeline
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        ) : assignTaskJob ? (
          <motion.div
            key="assigntask-page"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full"
          >
            <AssignTaskModal isDarkMode={isDarkMode} job={assignTaskJob} onClose={() => setAssignTaskJob(null)} onAssign={handleAssignTask} teamMembers={teamMembers} />
          </motion.div>
        ) : selectedJob ? (
          <motion.div
            key="job-detail"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full"
          >
            <JobDetailView
              isDarkMode={isDarkMode}
              job={selectedJob}
              onBack={() => setSelectedJob(null)}
              onAssignTask={(job) => setAssignTaskJob(job)}
              onEdit={(job) => handleEditJob(job)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="space-y-8"
          >
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-4 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)', boxShadow: '0 10px 15px -3px rgba(31,136,229,0.25)' }}>
                  <FiBriefcase className="w-7 h-7" style={{ color: 'white' }} />
                </div>
                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-left" style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Client Job Openings
                  </h2>
                  <p className={`text-sm sm:text-base mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Manage client requirements, track positions & assign tasks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button whileHover={{ scale: 1.02, rotate: 180 }} whileTap={{ scale: 0.98 }} onClick={fetchPositions}
                  className={`p-3 rounded-xl border-2 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-[#1E88E5]' : 'bg-white border-slate-200 text-slate-500 hover:border-[#1E88E5]'}`}
                >
                  <FiRefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowFullPageForm(true); setEditingJob(null); resetModal(); }}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white rounded-xl transition-shadow"
                  style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)', boxShadow: '0 10px 15px -3px rgba(31,136,229,0.25)' }}
                >
                  <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">New Position</span>
                  <span className="sm:hidden">New</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Total Positions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-[#1E88E5]/20 shadow-lg'}`}>
                <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10"><div className="w-full h-full rounded-full" style={{ backgroundColor: '#1E88E5' }}></div></div>
                <div className="relative flex items-start justify-between">
                  <div><p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Clients</p><p className="text-3xl sm:text-4xl font-extrabold mt-2" style={{ color: '#1E88E5' }}>{stats.total}</p></div>
                  <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: '#1E88E5', boxShadow: '0 10px 15px -3px rgba(31,136,229,0.3)' }}><FiBriefcase className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'white' }} /></div>
                </div>
              </motion.div>

              {/* Active Openings */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-emerald-100 shadow-lg'}`}>
                <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10"><div className="w-full h-full rounded-full" style={{ backgroundColor: '#10b981' }}></div></div>
                <div className="relative flex items-start justify-between">
                  <div><p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Openings</p><p className="text-3xl sm:text-4xl font-extrabold mt-2" style={{ color: '#059669' }}>{stats.open}</p></div>
                  <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: '#10b981', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}><FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'white' }} /></div>
                </div>
              </motion.div>

              {/* In Progress */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-[#1E88E5]/20 shadow-lg'}`}>
                <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10"><div className="w-full h-full rounded-full" style={{ backgroundColor: '#1E88E5' }}></div></div>
                <div className="relative flex items-start justify-between">
                  <div><p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>In Progress</p><p className="text-3xl sm:text-4xl font-extrabold mt-2" style={{ color: '#1E88E5' }}>{stats.inProgress}</p></div>
                  <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: '#1E88E5', boxShadow: '0 10px 15px -3px rgba(31,136,229,0.3)' }}><FiClock className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'white' }} /></div>
                </div>
              </motion.div>

              {/* Positions Filled */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-[#1E88E5]/20 shadow-lg'}`}>
                <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10"><div className="w-full h-full rounded-full" style={{ backgroundColor: '#1E88E5' }}></div></div>
                <div className="relative flex items-start justify-between">
                  <div><p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Positions Filled</p><p className="text-3xl sm:text-4xl font-extrabold mt-2" style={{ color: '#1E88E5' }}>{stats.totalFilled}/{stats.totalOpenings}</p></div>
                  <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: '#1E88E5', boxShadow: '0 10px 15px -3px rgba(31,136,229,0.3)' }}><FiUsers className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'white' }} /></div>
                </div>
              </motion.div>
            </div>

            {/* Search & Filter */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title, client, or location..."
                    className={`w-full rounded-xl border-2 py-3 pl-12 pr-5 text-base transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                  />
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4">
                  <div className="relative w-full">
                    <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}
                      className={`appearance-none w-full rounded-xl border-2 px-4 py-3 pr-10 text-base font-medium cursor-pointer focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                      <option value="all">All Clients</option>
                      {clients.map(c => (<option key={c.id} value={c.name}>{c.name}</option>))}
                    </select>
                    <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="relative w-full">
                    <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}
                      className={`appearance-none w-full rounded-xl border-2 px-4 py-3 pr-10 text-base font-medium cursor-pointer focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                      <option value="all">All</option><option value="Open">Open</option><option value="Filled">Filled</option>
                    </select>
                    <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="relative w-full">
                    <select value={filterDate} onChange={(e) => { setFilterDate(e.target.value); if (e.target.value !== 'custom') { setCustomStartDate(''); setCustomEndDate(''); } }}
                      className={`appearance-none w-full rounded-xl border-2 px-4 py-3 pr-10 text-base font-medium cursor-pointer focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                      <option value="all">All Time</option><option value="week">This Week</option><option value="month">This Month</option>
                      <option value="year">This Year</option><option value="custom">Custom Date</option>
                    </select>
                    <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                </div>
              </div>
              {filterDate === 'custom' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full"><label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>From Date</label>
                    <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
                  </div>
                  <div className="flex-1 w-full"><label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>To Date</label>
                    <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setCustomStartDate(''); setCustomEndDate(''); setFilterDate('all'); }}
                    className={`w-full sm:w-auto px-5 py-3 text-sm font-semibold rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Clear</motion.button>
                </motion.div>
              )}
            </motion.div>

            {/* Job Cards */}
            {filteredJobs.length === 0 ? (
              <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <FiAlertCircle size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold text-lg">No job openings found</p>
                <p className="text-base mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-5">
                {filteredJobs.map((job, idx) => (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.01, y: -2 }} onClick={(e) => { if (!e.target.closest('button')) setSelectedJob(job); }}
                    className={`rounded-2xl border-2 p-4 sm:p-6 transition-shadow cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-[#1E88E5]/50' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-[#1E88E5]/30'}`}>
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0 mx-auto sm:mx-0" style={{ background: getAvatarGradient(job.client) }}>{job.clientLogo}</div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{job.title}</h3>
                          <p className={`text-base mt-1.5 font-medium ${isDarkMode ? 'text-[#3FA9F5]' : 'text-[#1E88E5]'}`}>{job.client}</p>
                          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-4">
                            <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiMapPin className="w-4 h-4" /> {job.location}</span>
                            <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              <FiDollarSign className="w-4 h-4" style={{ display: 'none' }} />
                              <span className="text-sm">₹</span> {job.salary}
                            </span>
                            <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiClock className="w-4 h-4" /> {job.type}</span>
                            <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiUsers className="w-4 h-4" /> {job.candidateCount} Candidates</span>
                            <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiCalendar className="w-4 h-4" /> Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                            {job.skills.map((skill, idx2) => (
                              <span key={skill} className={`text-xs font-bold px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-[#1E88E5]/40 text-[#3FA9F5] border border-[#1E88E5]/50' : 'bg-gradient-to-r from-[#1E88E5]/10 to-blue-50 text-[#1E88E5] border border-[#1E88E5]/30'}`}>{skill}</span>
                            ))}
                          </div>
                          {jobTasks[job.id]?.length > 0 && (
                            <div className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-xl ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-800/40' : 'bg-emerald-50 border border-emerald-200'}`}>
                              <FiCheckCircle className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                              <span className={`text-xs font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{jobTasks[job.id].length} task{jobTasks[job.id].length > 1 ? 's' : ''} assigned</span>
                              <div className="flex -space-x-1.5 ml-auto">
                                {jobTasks[job.id].slice(0, 3).map(t => (
                                  <div key={t.id} className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-white dark:border-slate-800" style={{ background: t.assigneeColor }}>{t.assigneeAvatar || '?'}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row lg:flex-col items-center justify-between lg:items-end gap-4 mt-4 lg:mt-0">
                        <div className="text-center lg:text-right">
                          <p className="text-sm font-extrabold tracking-wide uppercase text-[#1E88E5]">Positions Filled</p>
                          <p className="text-3xl font-bold" style={{ color: '#1E88E5' }}>{job.filled}/{job.openings}</p>
                          <div className={`w-36 h-2 rounded-full mt-2 overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-[#1E88E5]/20'}`}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(job.filled / job.openings) * 100}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)' }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); setAssignTaskJob(job); }} className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${isDarkMode ? 'hover:bg-[#1E88E5]/40 text-[#3FA9F5]' : 'hover:bg-[#1E88E5]/10 text-[#1E88E5] hover:text-[#0D47A1]'}`} title="Assign Task"><FiClipboard className="w-5 h-5 pointer-events-none" /></button>
                          <button onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); handleEditJob(job); }} className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-[#1E88E5]/10 text-slate-500 hover:text-[#1E88E5]'}`} title="Edit"><FiEdit2 className="w-5 h-5 pointer-events-none" /></button>
                          <button onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(job.id); }} className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${isDarkMode ? 'hover:bg-red-900/40 text-slate-400 hover:text-red-400' : 'hover:bg-red-100 text-slate-500 hover:text-red-600'}`} title="Delete"><FiTrash2 className="w-5 h-5 pointer-events-none" /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {confirmDelete && (
            <motion.div key="delete-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}>
              <motion.div initial={{ scale: 0.8, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.8, y: 30, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()} className={`w-full max-w-md rounded-3xl p-8 ${isDarkMode ? 'bg-slate-900 border border-slate-700/50' : 'bg-white border border-slate-100'} shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden relative`}>

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }} className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} blur-3xl pointer-events-none`} />

                <div className="text-center relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.1 }}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-4 ${isDarkMode ? 'bg-red-900/30 border-slate-900' : 'bg-red-50 border-white'} shadow-xl rotate-3`}
                  >
                    <motion.div animate={{ rotate: [0, -15, 15, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 0.6, delay: 0.5, type: "spring" }}>
                      <FiTrash2 className="w-10 h-10 text-red-500" />
                    </motion.div>
                  </motion.div>

                  <h3 className={`text-2xl font-extrabold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Delete Position?</h3>
                  <p className={`text-sm mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Are you sure you want to delete this position? This action <span className="font-bold text-red-500">cannot be undone</span>.</p>
                  <div className="flex gap-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setConfirmDelete(null)}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteJob(confirmDelete)}
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-shadow hover:shadow-red-500/50"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #be123c)' }}>Yes, Delete</motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default JobOpeningsTab;