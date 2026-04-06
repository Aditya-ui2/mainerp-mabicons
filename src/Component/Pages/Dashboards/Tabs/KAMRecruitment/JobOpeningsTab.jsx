import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, X, MapPin, Users, Clock, ChevronRight, Pencil, Check, Plus, Download, Briefcase, Tag, Globe, AlignLeft, BarChart3, DollarSign, ShieldCheck, Share2, Compass, Waves, TrendingUp, MessageSquare, ExternalLink, Calendar, User, ArrowLeft, RefreshCw, Target, FileText, Clipboard, Award, Layers, Database, Mail, Phone, Star, AlertCircle, CheckCircle, Edit2, Send, Trash2, ChevronDown
} from "lucide-react";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { toast } from "sonner";
import { getResumeBankResumes, getResumeRoleTypes, getAllRecruitmentPositions, createRecruitmentPosition, updateRecruitmentPosition, deleteRecruitmentPosition, getAllClients, getDepartmentTeamMembers, createDepartmentTask, getAllCandidates, assignResumesToPosition, distributeJobToPlatforms } from '../../../service/api';

const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Urgent: "bg-rose-50 text-rose-700 border border-rose-200",
  Closed: "bg-slate-100 text-slate-500 border border-slate-200",
  "On Hold": "bg-amber-50 text-amber-700 border border-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
};

const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations", "HR"];

const openNativeDatePicker = (inputRef) => {
  const input = inputRef?.current;
  if (!input) return;

  input.focus();
  if (typeof input.showPicker === 'function') {
    input.showPicker();
  }
};

const parseListInput = (value) =>
  (value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeListFromApi = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const formatSalaryDisplay = (value) => {
  const salary = String(value || '').replace(/\$/g, '₹').trim();
  if (!salary) return 'Not specified';

  // If rupee/INR already present, keep as-is.
  if (/₹|\brs\b|\binr\b/i.test(salary)) return salary;

  // Common numeric forms should display with rupee and LPA for clarity.
  if (/^\d+(\.\d+)?$/.test(salary) || /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(salary)) {
    return `₹ ${salary} LPA`;
  }

  return `₹ ${salary}`;
};

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit ${STATUS_STYLES[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
};

/* ── Priority Badge ── */
const PriorityBadge = ({ priority }) => {
  const config = {
    High: "bg-rose-50 text-rose-700 border border-rose-200",
    Medium: "bg-blue-50 text-blue-700 border border-blue-200",
    Low: "bg-slate-100 text-slate-500 border border-slate-200",
  };
  return (
    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-widest ${config[priority] || config.Medium}`}>
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
  const taskDeadlineInputRef = useRef(null);

  const taskTypes = [
    { label: 'Screen CVs', icon: FileText, desc: 'Review and shortlist candidates' },
    { label: 'Source Candidates', icon: Search, desc: 'Find new candidates for role' },
    { label: 'Schedule Interviews', icon: Calendar, desc: 'Arrange interview slots' },
    { label: 'Follow Up', icon: Phone, desc: 'Follow up with candidates' },
    { label: 'Client Update', icon: Briefcase, desc: 'Send progress report to client' },
    { label: 'Custom Task', icon: Edit2, desc: 'Define a custom task' },
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
            <CheckCircle className="w-10 h-10 text-white" />
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
          <ArrowLeft className="w-5 h-5" /> Back to Jobs
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
                <Clipboard className="w-6 h-6 text-white" />
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
              {selectedCandidate.id === 'MEGA_BULK' ? <Users /> : (selectedCandidate.name || 'C').substring(0, 1)}
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
                    {assignee === m.id && <Check className="w-3 h-3 text-white" />}
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
            <div onClick={() => openNativeDatePicker(taskDeadlineInputRef)} className="cursor-pointer">
              <input
                ref={taskDeadlineInputRef}
                type="date"
                value={taskDeadline}
                onChange={e => setTaskDeadline(e.target.value)}
                onClick={() => openNativeDatePicker(taskDeadlineInputRef)}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>
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
            <Send className="w-4 h-4" /> Assign Task
          </motion.button>
        </div>
      </div>
    </div>
  );
};

/* ── Job Detail View ── */
const JobDetailView = ({ isDarkMode, job, onBack, onAssignTask, onEdit }) => {
  return (
    <div className="flex flex-col h-full bg-white relative animate-in fade-in slide-in-from-right duration-500">
      {/* Drawer Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            {job.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">{job.client}</span>
            <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
            <span className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px]">{job.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-10 space-y-12 pb-32 overflow-y-auto">
        {/* Meta Info Grid - Clean & Minimal */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Experience', val: job.experience || 'Flexible', icon: Award },
            { label: 'Location', val: job.location || 'Remote', icon: MapPin },
            { label: 'Priority', val: job.priority || 'Medium', icon: ShieldCheck },
            { label: 'Deadline', val: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Active', icon: Clock },
            { label: 'Applicants', val: job.candidateCount || 0, icon: Users },
            { label: 'Target Openings', val: job.openings || 1, icon: Target }
          ].map((stat, i) => (
            <div key={i} className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#F4F3EF] group hover:bg-white hover:shadow-md transition-all duration-200">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#F4F3EF] flex items-center justify-center text-[#6B6B7E] mb-2">
                <stat.icon size={13} />
              </div>
              <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">{stat.label}</p>
              <p className="text-xs font-bold text-[#1A1A2E] mt-1 truncate">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Deep Info Sections */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-4 flex items-center gap-2">
              <FileText size={14} className="text-[#1B4DA0]" /> Overview
            </h3>
            <p className="text-sm text-[#4B4B5E] leading-relaxed whitespace-pre-wrap">
              {job.description || "Leading market position requires top-tier expertise in modern technology stacks."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-4">Key Requirements</h3>
              <ul className="space-y-3">
                {(Array.isArray(job.requirements) ? job.requirements : (job.requirements || "").split("\n")).filter(Boolean).map((req, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded-lg bg-[#F4F3EF] border border-[#E8E7E2] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#1A1A2E] transition-all">
                      <Check size={10} className="text-[#6B6B7E] group-hover:text-white" />
                    </div>
                    <span className="text-sm text-[#6B6B7E] group-hover:text-[#1A1A2E] transition-colors">{req}</span>
                  </li>
                )) || <li className="text-[11px] text-[#9B9BAD] italic opacity-60 uppercase tracking-widest">General Qualifications Apply</li>}
                {(!job.requirements || job.requirements.length === 0) && <li className="text-[11px] text-[#9B9BAD] italic opacity-60 uppercase tracking-widest">General Qualifications Apply</li>}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-4">Major Responsibilities</h3>
              <ul className="space-y-3">
                {(Array.isArray(job.responsibilities) ? job.responsibilities : (job.responsibilities || "").split("\n")).filter(Boolean).map((res, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B9BAD] mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                    <span className="text-sm text-[#6B6B7E] group-hover:text-[#1A1A2E] transition-colors">{res}</span>
                  </li>
                )) || <li className="text-[11px] text-[#9B9BAD] italic opacity-60 uppercase tracking-widest">Standard Technical Duties</li>}
                {(!job.responsibilities || job.responsibilities.length === 0) && <li className="text-[11px] text-[#9B9BAD] italic opacity-60 uppercase tracking-widest">Standard Technical Duties</li>}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-4">Essential Tech Stack</h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {(Array.isArray(job.skills) ? job.skills : (job.skills || '').split(',')).filter(Boolean).map((skill, i) => (
                <span key={i} className="px-5 py-2.5 rounded-xl bg-[#F4F3EF] text-[#1A1A2E] text-[10px] font-bold uppercase tracking-widest border border-transparent hover:border-[#1B4DA0] hover:bg-white transition-all cursor-default">
                  {typeof skill === 'string' ? skill.trim() : skill}
                </span>
              ))}
              {(!job.skills || job.skills.length === 0 || job.skills === "") && <span className="text-[11px] text-[#9B9BAD] italic uppercase tracking-widest opacity-60">Global Tech Standard</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#F4F3EF] p-8 flex flex-col gap-3 z-30 shadow-[0_-15px_40px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => onEdit(job)}
          className="w-full h-15 bg-[#1A1A2E] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#1B4DA0] transition-all shadow-xl shadow-gray-200 active:scale-[0.98] py-4"
        >
          <Pencil size={18} /> Edit Position Details
        </button>
      </div>
    </div>
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
    const defaultClients = [
      { id: '00000000-0000-0000-0000-000000000000', name: 'Mabicons ERP (Internal)', companyName: 'Mabicons', displayName: 'Mabicons ERP (Internal)' },
      { id: '11111111-1111-1111-1111-111111111111', name: 'Standard Partner', companyName: 'General Partner', displayName: 'Standard Partner' }
    ];
    try {
      const c = localStorage.getItem(CACHE_KEY_CLIENTS);
      const parsed = c ? JSON.parse(c) : [];
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : defaultClients;
    } catch { return defaultClients; }
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
    openings: 1,
    experience: '',
    priority: 'Medium',
    deadline: '',
    skills: '',
    description: '',
    requirements: '',
    responsibilities: '',
    roleType: '',
    postPlatforms: ['google_jobs', 'mabicons_website'],
  });
  const positionDeadlineInputRef = useRef(null);

  // ── Fetch clients from backend ──
  const fetchClients = async () => {
    try {
      const response = await getAllClients();
      // Handle various response structures
      const apiClients = response.data?.clients || response.clients || (Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []));

      // If no clients found, provide defaults as requested
      const rawClients = apiClients.length > 0 ? apiClients : [
        { id: '00000000-0000-0000-0000-000000000000', name: 'Internal', companyName: 'Mabicons ERP' },
        { id: '11111111-1111-1111-1111-111111111111', name: 'Standard Client', companyName: 'General Partner' }
      ];

      const clientsData = rawClients.map(c => {
        // Broad field mapping to handle various backend variations
        const id = c.id || c._id || c.clientId || '';
        const clientName = (c.name || c.clientName || c.fullName || c.client_name || '').trim();
        const companyName = (c.companyName || c.company || '').trim();

        let displayName = companyName || clientName || 'Unnamed Client';
        if (clientName && companyName && clientName.toLowerCase() !== companyName.toLowerCase()) {
          displayName = `${clientName} / ${companyName}`;
        }

        return {
          id,
          clientName,
          companyName,
          name: displayName,
          displayName: displayName || 'Unnamed Client'
        };
      });

      setClients(clientsData);
      try { localStorage.setItem(CACHE_KEY_CLIENTS, JSON.stringify(clientsData)); } catch { }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      // Fallback on error too
      if (clients.length === 0) {
        const defaults = [
          { id: '00000000-0000-0000-0000-000000000000', clientName: 'Internal', companyName: 'Mabicons ERP', name: 'Mabicons ERP', displayName: 'Mabicons ERP' }
        ];
        setClients(defaults);
      }
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
        requirements: normalizeListFromApi(p.requirements),
        responsibilities: normalizeListFromApi(p.responsibilities),
        roleType: p.roleType || '',
        candidateCount: p.candidateCount || 0,
        tasks: p.tasks || [],
        clientId: p.clientId,
        postedByName: p.postedByName || p.postedBy?.name || '',
        postedByEmail: p.postedByEmail || p.postedBy?.email || '',
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
    // Transparently patch mock tokens for the current session to prevent UUID errors
    try {
      const token = localStorage.getItem('token');
      if (token && token.includes('.') && (token.includes('mock-') || token.includes('internal-'))) {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        if (payload.id && (String(payload.id).startsWith('mock-') || String(payload.id).startsWith('internal-'))) {
          // Use a valid UUID format for the session
          payload.id = '123e4567-e89b-12d3-a456-426614174000';
          const newEncodedPayload = btoa(JSON.stringify(payload));
          const newToken = `${parts[0]}.${newEncodedPayload}.${parts[2]}`;
          localStorage.setItem('token', newToken);
          console.log('Successfully patched session token for backend compatibility.');
        }
      }
    } catch (e) {
      console.warn('Silent token patcher failure:', e);
    }

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
        // Handle various response structures
        const rawRoles = response.data || response.roles || (Array.isArray(response) ? response : []);
        const mapped = rawRoles.map(r => ({
          role: r.role || r.name || r.roleType || '',
          count: r.count || r.candidateCount || 0
        }));
        setRoleTypes(mapped);
        try { localStorage.setItem(CACHE_KEY_ROLES, JSON.stringify(mapped)); } catch { }
      } catch (error) {
        console.error('Failed to fetch role types:', error);
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
    setNewJobForm({
      title: '', client: '', clientId: '', location: '', type: 'Full-time', salary: '',
      openings: 1, experience: '', priority: 'Medium', deadline: '',
      skills: '', description: '', requirements: '', responsibilities: '', roleType: ''
    });
    setModalStep(1);
    setMatchedResumes([]);
    setSelectedResumes(new Set());
    setResumeFetchLoading(false);

    // Safety: Refresh data if empty
    if (clients.length === 0) fetchClients();
    if (roleTypes.length === 0) {
      const fetchRoles = async () => {
        try {
          const response = await getResumeRoleTypes();
          const rawRoles = response.data || response.roles || (Array.isArray(response) ? response : []);
          setRoleTypes(rawRoles.map(r => ({ role: r.role || r.name || '', count: r.count || 0 })));
        } catch (err) { console.error(err); }
      };
      fetchRoles();
    }
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
        requirements: Array.isArray(editingJob.requirements) ? editingJob.requirements.join('\n') : '',
        responsibilities: Array.isArray(editingJob.responsibilities) ? editingJob.responsibilities.join('\n') : '',
        roleType: editingJob.roleType || '',
      });
    } else {
      resetModal();
    }
  }, [editingJob]);

  const handleCreatePosition = async () => {
    try {
      const currentUserName = localStorage.getItem('userName') || 'Current User';
      let departmentTeamId;
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Only use ID if it's not a mock string to prevent UUID errors
          departmentTeamId = (payload.id && !String(payload.id).startsWith('mock-')) ? payload.id : undefined;
        }
      } catch (e) {
        departmentTeamId = undefined;
      }

      const positionData = {
        title: newJobForm.title,
        clientId: newJobForm.clientId,
        description: newJobForm.description,
        location: newJobForm.location || 'Remote',
        type: newJobForm.type === 'Remote' ? 'Full-time' : newJobForm.type,
        salary: newJobForm.salary,
        status: 'Open',
        priority: newJobForm.priority,
        openings: parseInt(newJobForm.openings) || 1,
        skills: newJobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements: parseListInput(newJobForm.requirements),
        responsibilities: parseListInput(newJobForm.responsibilities),
        experience: newJobForm.experience,
        deadline: newJobForm.deadline || undefined,
        roleType: newJobForm.roleType,
        departmentTeamId,
        postPlatforms: newJobForm.postPlatforms || [],
      };

      // FINAL BRUTE-FORCE CLEANUP: Remove ANY mock IDs or invalid UUID strings
      const cleanPositionData = {};
      Object.keys(positionData).forEach(key => {
        const val = positionData[key];
        // Skip if undefined, null, or a mock-prefix string
        if (val === undefined || val === null) return;
        if (typeof val === 'string' && (val.startsWith('mock-') || val === '')) return;

        cleanPositionData[key] = val;
      });

      console.log('Sending Clean Payload:', cleanPositionData);
      const result = await createRecruitmentPosition(cleanPositionData);
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
        requirements: normalizeListFromApi(created.requirements).length > 0 ? normalizeListFromApi(created.requirements) : parseListInput(newJobForm.requirements),
        responsibilities: normalizeListFromApi(created.responsibilities).length > 0 ? normalizeListFromApi(created.responsibilities) : parseListInput(newJobForm.responsibilities),
        roleType: created.roleType || newJobForm.roleType,
        postedByName: created.postedByName || currentUserName,
        postedByEmail: created.postedByEmail || '',
      };
      setJobs(prev => [newJob, ...prev]);

      // Distribute to selected platforms
      const platforms = newJobForm.postPlatforms || [];
      if (platforms.length > 0 && created._id) {
        try {
          await distributeJobToPlatforms(created._id, platforms);
          toast.success(`Job posted to ${platforms.length} platform(s)`);
        } catch (distErr) {
          console.error('Distribution error:', distErr);
          toast.error('Job created but platform distribution failed');
        }
      }
    } catch (error) {
      console.error('Backend create failed:', error);
      alert(error?.message || error?.error || 'Position create failed. Please check required fields and try again.');
      return;
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
        requirements: parseListInput(newJobForm.requirements),
        responsibilities: parseListInput(newJobForm.responsibilities),
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
        requirements: parseListInput(newJobForm.requirements),
        responsibilities: parseListInput(newJobForm.responsibilities),
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
    const matchesClient = filterClient === 'all' ||
      (job.client || '').toLowerCase().trim() === filterClient.toLowerCase().trim();

    const matchesPosition = filterPosition === 'all' || job.status === filterPosition;

    let matchesDate = true;
    if (filterDate !== 'all') {
      const dateStr = job.postedDate || job.deadline || job.createdAt;
      if (!dateStr) {
        matchesDate = false;
      } else {
        const jobDate = new Date(dateStr);
        const now = new Date();
        if (filterDate === 'today') {
          const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
          matchesDate = jobDate >= todayStart && jobDate <= todayEnd;
        } else if (filterDate === 'week') {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          matchesDate = jobDate >= weekStart && jobDate <= weekEnd;
        } else if (filterDate === 'prev-week') {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay() - 7);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          matchesDate = jobDate >= weekStart && jobDate <= weekEnd;
        } else if (filterDate === 'month') {
          matchesDate = jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
        } else if (filterDate === 'prev-month') {
          const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const prevMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          matchesDate = jobDate.getMonth() === prevMonth && jobDate.getFullYear() === prevMonthYear;
        } else if (filterDate === 'quarter') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const jobQuarter = Math.floor(jobDate.getMonth() / 3);
          matchesDate = jobQuarter === currentQuarter && jobDate.getFullYear() === now.getFullYear();
        } else if (filterDate === 'prev-quarter') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
          const prevQuarterYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
          const jobQuarter = Math.floor(jobDate.getMonth() / 3);
          matchesDate = jobQuarter === prevQuarter && jobDate.getFullYear() === prevQuarterYear;
        } else if (filterDate === 'year') {
          matchesDate = jobDate.getFullYear() === now.getFullYear();
        } else if (filterDate === 'custom') {
          if (customStartDate) matchesDate = jobDate >= new Date(customStartDate);
          if (customEndDate && matchesDate) matchesDate = jobDate <= new Date(customEndDate + 'T23:59:59');
        }
      }
    }
    return matchesSearch && matchesClient && matchesPosition && matchesDate;
  });

  const activeJobFiltersCount = [
    searchTerm.trim() !== '',
    filterClient !== 'all',
    filterPosition !== 'all',
    filterDate !== 'all',
    filterDate === 'custom' && (customStartDate || customEndDate),
  ].filter(Boolean).length;

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
      <AnimatePresence>
        {showFullPageForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackToJobs}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl"
            />

            {/* Modal Content Card */}
            <motion.div
              key="position-modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[40px] w-full max-w-6xl max-h-[92vh] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.25)] relative z-10 flex flex-col animate-in zoom-in-95 duration-300 border border-white/20"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between px-10 py-8 bg-white/80 backdrop-blur-md border-b border-[#F4F3EF]">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {editingJob ? 'Edit Position' : 'Create New Position'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">Recruitment Module</span>
                    <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                    <span className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px]">Step {modalStep} of 2</span>
                  </div>
                </div>
                <button
                  onClick={handleBackToJobs}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#1A1A2E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95 group shadow-sm"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                {modalStep === 1 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Column 1: Basic Information */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-4 flex items-center gap-2">
                        <Briefcase size={14} /> Basic Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Job Title *</label>
                          <input type="text" value={newJobForm.title} onChange={e => setNewJobForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Senior Software Engineer"
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] border border-transparent focus:border-[#1B4DA0]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Role Type *</label>
                          <div className="relative">
                            <select value={newJobForm.roleType} onChange={e => setNewJobForm(f => ({ ...f, roleType: e.target.value }))}
                              className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] appearance-none pr-10"
                            >
                              <option value="">Select Role Category</option>
                              {roleTypes.map(r => (
                                <option key={r.role} value={r.role}>{r.role} ({r.count})</option>
                              ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Client/Company *</label>
                          <div className="relative">
                            <select value={newJobForm.clientId} onChange={e => {
                              const activeClients = (clients && clients.length > 0 ? clients : [
                                { id: '00000000-0000-0000-0000-000000000000', name: 'Mabicons ERP (Internal)', companyName: 'Mabicons', displayName: 'Mabicons ERP (Internal)' },
                                { id: '11111111-1111-1111-1111-111111111111', name: 'Standard Partner', companyName: 'General Partner', displayName: 'Standard Partner' }
                              ]);
                              const selected = activeClients.find(c => c.id === e.target.value);
                              setNewJobForm(f => ({ ...f, clientId: e.target.value, client: selected?.companyName || selected?.name || selected?.displayName || '' }));
                            }}
                              className="w-full bg-white border-0 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:bg-[#F0F2FF] appearance-none pr-10 shadow-inner"
                              style={{ color: '#111827' }}
                            >
                              <option value="" className="text-slate-900 bg-white">Select Company</option>
                              {(clients && clients.length > 0 ? clients : [
                                { id: '00000000-0000-0000-0000-000000000000', displayName: 'Mabicons ERP (Internal)' },
                                { id: '11111111-1111-1111-1111-111111111111', displayName: 'Standard Partner' }
                              ]).map(c => (
                                <option key={c.id || Math.random()} value={c.id} className="text-slate-900 bg-white">{c.displayName}</option>
                              ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Location</label>
                          <input type="text" value={newJobForm.location} onChange={e => setNewJobForm(f => ({ ...f, location: e.target.value }))}
                            placeholder="e.g. Bangalore, Remote"
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Job Details & Compensation */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-4 flex items-center gap-2">
                        <FileText size={14} /> Job Details
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Type</label>
                          <select value={newJobForm.type} onChange={e => setNewJobForm(f => ({ ...f, type: e.target.value }))}
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] appearance-none"
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Priority</label>
                          <select value={newJobForm.priority} onChange={e => setNewJobForm(f => ({ ...f, priority: e.target.value }))}
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] appearance-none"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Salary</label>
                          <input type="text" value={newJobForm.salary} onChange={e => setNewJobForm(f => ({ ...f, salary: e.target.value }))}
                            placeholder="15-25 LPA"
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF]"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Experience</label>
                          <input type="text" value={newJobForm.experience} onChange={e => setNewJobForm(f => ({ ...f, experience: e.target.value }))}
                            placeholder="3-5 yrs"
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF]"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Openings</label>
                          <input type="number" value={newJobForm.openings} onChange={e => setNewJobForm(f => ({ ...f, openings: e.target.value }))} min="1"
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF]"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Deadline</label>
                          <div onClick={() => openNativeDatePicker(positionDeadlineInputRef)} className="cursor-pointer relative group">
                            <input
                              ref={positionDeadlineInputRef}
                              type="date"
                              value={newJobForm.deadline}
                              onChange={e => setNewJobForm(f => ({ ...f, deadline: e.target.value }))}
                              className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] cursor-pointer"
                            />
                            <Calendar size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Skills & Technical Requirements */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-4 flex items-center gap-2">
                        <Target size={14} /> Skills & Detailed Info
                      </h3>

                      <div>
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Skills (comma separated)</label>
                        <input type="text" value={newJobForm.skills} onChange={e => setNewJobForm(f => ({ ...f, skills: e.target.value }))}
                          placeholder="e.g. React, Node.js, MongoDB"
                          className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF]"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Requirements (one per line)</label>
                          <textarea value={newJobForm.requirements} onChange={e => setNewJobForm(f => ({ ...f, requirements: e.target.value }))}
                            rows={4}
                            placeholder="Detailed requirements..."
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Responsibilities (one per line)</label>
                          <textarea value={newJobForm.responsibilities} onChange={e => setNewJobForm(f => ({ ...f, responsibilities: e.target.value }))}
                            rows={4}
                            placeholder="Key responsibilities..."
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] resize-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Short Description</label>
                        <textarea value={newJobForm.description} onChange={e => setNewJobForm(f => ({ ...f, description: e.target.value }))}
                          rows={3}
                          placeholder="Describe the role..."
                          className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] resize-none"
                        />
                      </div>

                      {/* Auto-Post to Job Platforms */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px] pl-1 mb-3 flex items-center gap-2">
                          <Globe size={14} /> Post to Job Platforms
                        </label>
                        <div className="space-y-2">
                          {[
                            { key: 'google_jobs', label: 'Google Jobs', desc: 'Auto-index via structured data', icon: '🔍' },
                            { key: 'mabicons_website', label: 'Mabicons Website', desc: 'mabicons.com/careers', icon: '🌐' },
                            { key: 'linkedin', label: 'LinkedIn', desc: 'Post via LinkedIn Jobs API', icon: '💼' },
                            { key: 'indeed', label: 'Indeed', desc: 'Free job posting via XML feed', icon: '📋' },
                            { key: 'jooble', label: 'Jooble', desc: 'Free job aggregator', icon: '🔎' },
                            { key: 'adzuna', label: 'Adzuna', desc: 'Free job board distribution', icon: '📢' },
                          ].map(platform => {
                            const isChecked = (newJobForm.postPlatforms || []).includes(platform.key);
                            return (
                              <label key={platform.key} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${isChecked ? 'bg-blue-50/50 border-[#1B4DA0]/20' : 'bg-[#FAFAF8] border-transparent hover:bg-[#F0F2FF]'}`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setNewJobForm(f => ({
                                      ...f,
                                      postPlatforms: isChecked
                                        ? f.postPlatforms.filter(p => p !== platform.key)
                                        : [...(f.postPlatforms || []), platform.key]
                                    }));
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-[#1B4DA0] focus:ring-[#1B4DA0]/30"
                                />
                                <span className="text-lg">{platform.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#1A1A2E]">{platform.label}</p>
                                  <p className="text-[10px] text-[#9B9BAD]">{platform.desc}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Step 2: Resume Matches
                  <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-4 bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 animate-bounce">
                        <Check size={24} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-900 leading-tight">Position Created Successfully</p>
                        <p className="text-sm font-medium text-emerald-700/70 mt-0.5">We found {matchedResumes.length} matching resumes for &quot;{newJobForm.title}&quot;</p>
                      </div>
                    </div>

                    {resumeFetchLoading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-[#1B4DA0]/20 border-t-[#1B4DA0] rounded-full animate-spin mb-6" />
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">Searching Talent Bank...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matchedResumes.map((resume, idx) => {
                          const isSelected = selectedResumes.has(resume.id);
                          return (
                            <motion.div
                              key={resume.id || idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => toggleResumeSelection(resume.id)}
                              className={`group p-6 rounded-[32px] border-2 cursor-pointer transition-all ${isSelected
                                  ? 'border-[#1B4DA0] bg-blue-50/50 shadow-xl shadow-blue-500/5'
                                  : 'border-[#F4F3EF] bg-white hover:border-[#1B4DA0]/30'
                                }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] font-bold text-lg group-hover:scale-110 transition-transform">
                                  {(resume.candidateName || resume.fileName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[#1A1A2E] truncate">{resume.candidateName || 'Unknown'}</p>
                                  <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5 truncate">{resume.email}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#1B4DA0] border-[#1B4DA0]' : 'border-[#E8E7E2]'
                                  }`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-[#F4F3EF] px-10 py-8 flex items-center justify-end gap-4">
                <button
                  onClick={handleBackToJobs}
                  className="px-8 py-4 text-sm font-bold text-[#6B6B7E] hover:text-[#1A1A2E] transition-all"
                >
                  Cancel
                </button>
                {modalStep === 1 ? (
                  <button
                    onClick={editingJob ? handleUpdatePosition : handleCreatePosition}
                    className="px-10 py-4 bg-[#1A1A2E] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#2A2A3E] transition-all shadow-xl active:scale-95"
                  >
                    {editingJob ? (
                      <><Check size={18} /> Update Position</>
                    ) : (
                      <><Plus size={18} /> Create Position</>
                    )}
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={handleBackToJobs}
                      className="px-8 py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-2xl font-bold hover:bg-[#E8E7E2] transition-colors"
                    >
                      Skip for Now
                    </button>
                    <button
                      onClick={handleAddSelectedToPipeline}
                      disabled={selectedResumes.size === 0}
                      className={`px-10 py-4 bg-[#1B4DA0] text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl ${selectedResumes.size === 0 ? 'opacity-50 grayscale' : 'hover:bg-[#153e82] active:scale-95'
                        }`}
                    >
                      <Check size={18} /> Add Selected Candidates
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showFullPageForm && (
          <motion.div
            key="main-content"
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Job Openings
                </h1>
                <p className="text-[#6B6B7E] text-sm mt-1">{filteredJobs.length} active positions in recruitment</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowFullPageForm(true); setEditingJob(null); resetModal(); }}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold hover:bg-[#153e82] transition-all shadow-lg active:scale-95"
                >
                  <Plus size={18} /> Post New Job
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-3 border border-[#F4F3EF] shadow-sm">
              {/* Search */}
              <div className="flex items-center gap-2 bg-[#F4F3EF] rounded-xl px-3 py-2 flex-1 min-w-[200px]">
                <Search size={15} className="text-[#9B9BAD]" />
                <input
                  type="text"
                  placeholder="Search by title, client or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")}>
                    <X size={13} className="text-[#9B9BAD]" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="On Hold">On Hold</option>
              </select>

              {/* Client Filter Dropdown */}
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer"
              >
                <option value="all">All Clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>{c.displayName}</option>
                ))}
              </select>

              {/* Deadline Date Filter */}
              <select
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); if (e.target.value !== 'custom') { setCustomStartDate(''); setCustomEndDate(''); } }}
                className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="prev-week">Previous Week</option>
                <option value="month">This Month</option>
                <option value="prev-month">Previous Month</option>
                <option value="quarter">This Quarter</option>
                <option value="prev-quarter">Previous Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
              {filterDate === 'custom' && (
                <div className="flex items-center gap-2">
                  <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
                    className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer" />
                  <span className="text-[10px] text-[#9B9BAD] font-bold">to</span>
                  <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
                    className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer" />
                </div>
              )}
            </div>

            {/* Table Interface */}
            <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
              <div className="grid grid-cols-[1fr_140px_120px_130px_100px_36px] gap-4 px-8 py-5 border-b border-[#F4F3EF] bg-[#FAFAF8]">
                {["Position", "Department", "Status", "Posted", "Applicants", ""].map((h, i) => (
                  <span key={i} className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">
                    {h}
                  </span>
                ))}
              </div>

              {filteredJobs.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No positions match your criteria</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="grid grid-cols-[1fr_140px_120px_130px_100px_36px] gap-4 items-center px-8 py-6 border-b border-[#F4F3EF] last:border-0 hover:bg-[#FAFAF8] cursor-pointer transition-all group"
                  >
                    <div>
                      <p className="text-base font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors flex items-center gap-2 font-syne">
                        {job.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={12} className="text-[#9B9BAD]" />
                        <span className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider">{job.location}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#6B6B7E] truncate">{job.client}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit ${STATUS_STYLES[job.status] || "bg-slate-100 text-slate-500"}`}>
                      {job.status}
                    </span>
                    <span className="text-sm font-bold text-[#9B9BAD]">
                      {new Date(job.postedDate || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <div className="flex items-center gap-2 text-[#1A1A2E]/80">
                      <Users size={14} />
                      <span className="text-sm font-bold">{job.candidateCount}</span>
                    </div>
                    <ChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#1B4DA0] transition-all" />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Drawer for Job Details & Tasks */}
      <AnimatePresence>
        {(selectedJob || assignTaskJob) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedJob(null); setAssignTaskJob(null); }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] bg-white shadow-2xl z-[110] border-l border-[#F4F3EF] flex flex-col overflow-hidden"
            >
              {assignTaskJob ? (
                <div className="flex-1 overflow-y-auto">
                  <AssignTaskModal
                    isDarkMode={isDarkMode}
                    job={assignTaskJob}
                    onClose={() => setAssignTaskJob(null)}
                    onAssign={handleAssignTask}
                    teamMembers={teamMembers}
                  />
                </div>
              ) : selectedJob && (
                <div className="flex-1 overflow-y-auto">
                  <JobDetailView
                    isDarkMode={isDarkMode}
                    job={selectedJob}
                    onBack={() => setSelectedJob(null)}
                    onAssignTask={(job) => setAssignTaskJob(job)}
                    onEdit={(job) => handleEditJob(job)}
                  />
                </div>
              )}
            </motion.div>
          </>
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
                      <Trash2 className="w-10 h-10 text-red-500" />
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
