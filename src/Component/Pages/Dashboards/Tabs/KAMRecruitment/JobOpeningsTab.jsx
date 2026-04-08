import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, X, MapPin, Users, Clock, ChevronRight, Pencil, Check, Plus, Download, Briefcase, Tag, Globe, AlignLeft, BarChart3, DollarSign, ShieldCheck, Share2, Compass, Waves, TrendingUp, MessageSquare, ExternalLink, Calendar, User, ArrowLeft, RefreshCw, Target, FileText, Clipboard, Award, Layers, Database, Mail, Phone, Star, AlertCircle, CheckCircle, Edit2, Send, Trash2, ChevronDown, UserPlus
} from "lucide-react";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { toast } from "sonner";
import { getResumeBankResumes, getResumeRoleTypes, getAllRecruitmentPositions, createRecruitmentPosition, updateRecruitmentPosition, deleteRecruitmentPosition, getAllClients, getDepartmentTeamMembers, createDepartmentTask, getAllCandidates, assignResumesToPosition, distributeJobToPlatforms } from '../../../service/api';

const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Urgent: "bg-rose-50 text-rose-600 border-rose-100",
  "Hold": "bg-amber-50 text-amber-600 border-amber-100",
  "In Progress": "bg-blue-50 text-[#0D47A1] border-blue-100",
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
          className={`rounded-3xl p-10 text-center max-w-md w-full shadow-2xl bg-white`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#0D47A1]">
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-[#1A1A2E]">Task Assigned!</h3>
          <p className="text-sm mt-2 text-[#9B9BAD]">
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
      <div className="sticky top-0 z-20 px-10 py-8 border-b border-[#F4F3EF] bg-gradient-to-r from-white to-[#F8FAFF] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">Assign Task for {job?.title}</h2>
          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">Task Assignment</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mx-auto max-w-4xl overflow-hidden flex flex-col">
        {/* ── Compact Header ── */}
        <div className="px-6 sm:px-8 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0D47A1] rounded-xl flex items-center justify-center text-white shadow-xl">
                <Clipboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A2E]">New Task Assignment</h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#0D47A1]/10 text-[#0D47A1]">{job?.title}</span>
                  <span className="text-xs text-[#9B9BAD]">•</span>
                  <span className="text-xs text-[#9B9BAD]">{job?.client}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-4 sm:px-6 pb-6 space-y-5">
          {/* Selected Candidate Badge (Bulk Info) */}
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-6 border-2 ${selectedCandidate.id === 'MEGA_BULK' ? (isDarkMode ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-indigo-50 border-indigo-100 shadow-sm') : (isDarkMode ? 'bg-blue-900/30 border-blue-700/50' : 'bg-blue-50 border-blue-100')}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg ${selectedCandidate.id === 'MEGA_BULK' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-blue-500 shadow-[#0D47A1]/20'}`}>
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
            <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2.5 block">Quick Select Task Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {taskTypes.map(t => (
                <motion.button key={t.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setTaskType(t.label); if (!taskTitle) setTaskTitle(t.label); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center ${taskType === t.label
                    ? 'border-[#1B4DA0] shadow-lg bg-[#0D47A1]/10'
                    : 'border-[#F4F3EF] bg-[#FAFAF8] hover:border-[#E8E7E2]'
                    }`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0D47A1] text-white shadow-md mb-1">
                    <t.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-semibold leading-tight ${taskType === t.label ? 'text-[#0D47A1]' : 'text-[#6B6B7E]'}`}>{t.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Task Title *</label>
            <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Screen 10 candidates for shortlist"
              className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
            />
          </div>

          {/* Assign To — Team Member Cards */}
          <div>
            <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2.5 block">Assign To *</label>
            <div className="space-y-2">
              {teamMembers.map(m => (
                <motion.button key={m.id} whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}
                  onClick={() => setAssignee(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${assignee === m.id
                    ? 'border-[#1B4DA0] shadow-md bg-[#0D47A1]/10'
                    : 'border-[#F4F3EF] hover:border-[#E8E7E2] bg-white'
                    }`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: m.color }}>
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E]">{m.name}</p>
                    <p className="text-[10px] text-[#9B9BAD]">{m.role}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${assignee === m.id ? 'border-[#1B4DA0] bg-[#0D47A1]' : 'border-[#E8E7E2]'
                    }`}>
                    {assignee === m.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Priority — Pill Selection */}
          <div>
            <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2.5 block">Priority</label>
            <div className="flex gap-2">
              {priorities.map(p => (
                <motion.button key={p.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setTaskPriority(p.value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all ${taskPriority === p.value ? p.bg + ' border-current shadow-sm' : 'border-[#F4F3EF] text-[#6B6B7E] bg-white'}`}>
                  <span className="text-xs">{p.icon}</span> {p.value}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Deadline</label>
            <div onClick={() => openNativeDatePicker(taskDeadlineInputRef)} className="cursor-pointer">
              <input
                ref={taskDeadlineInputRef}
                type="date"
                value={taskDeadline}
                onChange={e => setTaskDeadline(e.target.value)}
                onClick={() => openNativeDatePicker(taskDeadlineInputRef)}
                className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Notes (optional)</label>
            <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows={3} placeholder="Add any specific instructions..."
              className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 resize-none placeholder:text-[#9B9BAD]/50"
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-4 px-6 sm:px-8 py-6 border-t border-[#F4F3EF]">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
          >Cancel</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={(!taskTitle && !taskType) || !assignee}
            className={`flex-[2] flex items-center justify-center gap-2 py-5 bg-[#0D47A1] text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all ${(!taskTitle && !taskType) || !assignee ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
          >
            <Send className="w-4 h-4" /> Assign Task
          </motion.button>
        </div>
      </div>
    </div>
  );
};

/* ── Job Detail View ── */
const RADAR_COLORS = { stroke: '#a5b4fc', fill: '#a5b4fc' };
const DONUT_COLORS = ['#3B82F6', '#6366F1', '#22D3EE'];

const JobDetailView = ({ isDarkMode, job, onBack, onAssignTask, onEdit, jobAssignments, setJobAssignments, handleAssignJob }) => {
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const skillsArr = (Array.isArray(job.skills) ? job.skills : (job.skills || '').split(',')).filter(Boolean);
  const reqsArr = (Array.isArray(job.requirements) ? job.requirements : (job.requirements || '').split('\n')).filter(Boolean);
  const respArr = (Array.isArray(job.responsibilities) ? job.responsibilities : (job.responsibilities || '').split('\n')).filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-white relative animate-in fade-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{job.title}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{job.department || job.client || 'Engineering'}</span>
            <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
            <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">{job.type || 'Full-time'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(job)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-blue-50 hover:text-[#0D47A1] transition-all active:scale-90">
            <Pencil size={16} />
          </button>
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 shadow-sm">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto pb-10">
        {/* Job Snapshot Info Grid */}
        <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-8">
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Location</span>
              <p className="text-sm font-bold text-[#1A1A2E]">{job.location || 'Not Specified'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Salary Range</span>
              <p className="text-sm font-bold text-[#1A1A2E]">{job.salary || 'Competitive'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Experience</span>
              <p className="text-sm font-bold text-[#1A1A2E]">{job.experience || 'Not Mentioned'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Openings</span>
              <p className="text-sm font-bold text-[#1A1A2E]">{job.openings || 1} Position(s)</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Deadline</span>
              <p className="text-sm font-bold text-[#1A1A2E]">{job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Priority</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${job.priority === 'Critical' ? 'bg-rose-50 text-rose-500 border-rose-100' : job.priority === 'High' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-blue-50 text-[#0D47A1] border-blue-100'}`}>
                {job.priority || 'Medium'}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#F4F3EF] text-left">
            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-4 text-left">Required Skills</span>
            <div className="flex flex-wrap gap-2 justify-start">
              {skillsArr.length > 0 ? skillsArr.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-white border border-[#F4F3EF] rounded-xl text-[11px] font-bold text-[#4B4B5E] shadow-sm">
                  {skill.trim()}
                </span>
              )) : <span className="text-sm text-[#9B9BAD] italic text-left">No specific skills listed</span>}
            </div>
          </div>

          {/* Short Description Section */}
          <div className="pt-6 border-t border-[#F4F3EF] text-left">
            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-2 text-left">Job Description</span>
            <p className="text-sm text-[#4B4B5E] leading-relaxed font-medium text-left">
              {job.description || <span className="italic text-[#9B9BAD]">No description provided</span>}
            </p>
          </div>

          {/* Requirements Section */}
          <div className="pt-6 border-t border-[#F4F3EF] text-left">
            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-3 text-left">Requirements</span>
            {reqsArr.length > 0 ? (
              <ul className="space-y-2.5 text-left">
                {reqsArr.map((req, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[#4B4B5E] font-medium leading-relaxed justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D47A1] mt-1.5 flex-shrink-0" />
                    {req.trim()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-[#9B9BAD] text-left">No specific requirements listed</p>
            )}
          </div>

          {/* Responsibilities Section */}
          <div className="pt-6 border-t border-[#F4F3EF] text-left">
            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-3 text-left">Responsibilities</span>
            {respArr.length > 0 ? (
              <ul className="space-y-2.5 text-left">
                {respArr.map((resp, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[#4B4B5E] font-medium leading-relaxed justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D47A1] mt-1.5 flex-shrink-0" />
                    {resp.trim()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-[#9B9BAD] text-left">No specific responsibilities listed</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 pt-6">
          <button onClick={onBack}
            className="flex-1 py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-[24px] font-bold text-sm hover:bg-[#E8E7E2] transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <div className="relative flex-[2]">
            <button
              id="detail-assign-btn"
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="w-full py-4 bg-[#1B4DA0] text-white rounded-[24px] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#153a7a] transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10"
            >
              <UserPlus size={18} />
              {jobAssignments[job.id] ? `Assigned to ${jobAssignments[job.id]}` : 'Assign To'}
            </button>
            {showAssignDropdown && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowAssignDropdown(false)} />
                <div
                  className="fixed z-[9999] w-52 bg-white rounded-xl shadow-2xl border border-[#E5E5EA] py-2"
                  style={(() => {
                    const btn = document.getElementById('detail-assign-btn');
                    if (!btn) return { top: 0, left: 0 };
                    const rect = btn.getBoundingClientRect();
                    return { bottom: window.innerHeight - rect.top + 8, left: rect.left + rect.width / 2 - 104 };
                  })()}
                >
                  <p className="px-4 py-1.5 text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Select Member</p>
                  <button
                    onClick={() => { handleAssignJob(job.id, 'Me'); setShowAssignDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-all ${jobAssignments[job.id] === 'Me' ? 'bg-[#0D47A1]/5 text-[#0D47A1]' : 'text-[#1A1A2E] hover:bg-[#F8FAFF]'
                      }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${jobAssignments[job.id] === 'Me' ? 'bg-[#0D47A1] text-white' : 'bg-[#F4F3EF] text-[#6B6B7E]'
                      }`}><User size={13} /></span>
                    Assign to me
                    {jobAssignments[job.id] === 'Me' && <span className="ml-auto text-[#0D47A1]">✓</span>}
                  </button>
                  <div className="border-t border-[#F4F3EF] my-1" />
                  {['Jyoti', 'Manju', 'Priyanshi'].map(name => (
                    <button key={name}
                      onClick={() => { handleAssignJob(job.id, name); setShowAssignDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-all ${jobAssignments[job.id] === name ? 'bg-[#0D47A1]/5 text-[#0D47A1]' : 'text-[#1A1A2E] hover:bg-[#F8FAFF]'
                        }`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${jobAssignments[job.id] === name ? 'bg-[#0D47A1] text-white' : 'bg-[#F4F3EF] text-[#6B6B7E]'
                        }`}>{name.charAt(0)}</span>
                      {name}
                      {jobAssignments[job.id] === name && <span className="ml-auto text-[#0D47A1]">✓</span>}
                    </button>
                  ))}
                  {jobAssignments[job.id] && (
                    <>
                      <div className="border-t border-[#F4F3EF] my-1" />
                      <button
                        onClick={() => { handleAssignJob(job.id, null); setShowAssignDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 text-red-500 hover:bg-red-50 transition-all"
                      >
                        <span className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-500"><X size={13} /></span>
                        Remove Assignment
                      </button>
                    </>
                  )}
                </div>
              </>,
              document.body
            )}
          </div>
        </div>
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
  const [assignDropdownJobId, setAssignDropdownJobId] = useState(null);
  const [jobAssignments, setJobAssignments] = useState({});
  const [selectedJobs, setSelectedJobs] = useState([]);

  // Handle assign/unassign with backend sync
  const handleAssignJob = async (jobId, name) => {
    const prev = { ...jobAssignments };
    if (name) {
      setJobAssignments(p => ({ ...p, [jobId]: name }));
    } else {
      setJobAssignments(p => { const n = { ...p }; delete n[jobId]; return n; });
    }
    try {
      await updateRecruitmentPosition(jobId, {
        assignedToName: name || null,
        assignedToId: null,
      });
    } catch (err) {
      console.error('Failed to update assignment:', err);
      setJobAssignments(prev); // rollback on error
    }
  };
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
  });
  const positionDeadlineInputRef = useRef(null);
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [respInput, setRespInput] = useState('');

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
        assignedToId: p.assignedToId || null,
        assignedToName: p.assignedToName || null,
      }));

      // Build assignment map from fetched data
      const assignMap = {};
      positions.forEach(p => {
        if (p.assignedToName) assignMap[p.id] = p.assignedToName;
      });
      setJobAssignments(prev => ({ ...assignMap, ...prev }));

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

  const handleBulkHold = async () => {
    if (window.confirm(`Put ${selectedJobs.length} positions on hold?`)) {
      const originalJobs = [...jobs];
      try {
        // Optimistic UI Update: update locally first for instant feedback
        setJobs(prev => prev.map(j =>
          selectedJobs.includes(j.id) ? { ...j, status: 'Hold' } : j
        ));

        await Promise.all(selectedJobs.map(id => updateRecruitmentPosition(id, { status: 'Hold' })));
        setSelectedJobs([]);
        toast.success(`${selectedJobs.length} positions put on hold`);
        fetchPositions(); // Sync with server
      } catch (err) {
        console.error('Bulk hold failed:', err);
        toast.error('Failed to update some positions');
        setJobs(originalJobs); // Rollback on failure
      }
    }
  };

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'Open' || j.status === 'Urgent').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    closed: jobs.filter(j => j.status === 'Closed').length,
    totalOpenings: jobs.reduce((sum, j) => sum + j.openings, 0),
    totalFilled: jobs.reduce((sum, j) => sum + j.filled, 0),
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClient = filterClient === 'all' ||
        (job.client || '').toLowerCase().trim() === filterClient.toLowerCase().trim();

      const matchesStatus = filterPosition === 'all' || job.status === filterPosition;

      return matchesSearch && matchesClient && matchesStatus;
    });
  }, [jobs, searchTerm, filterClient, filterPosition]);

  const activeJobFiltersCount = [
    searchTerm.trim() !== '',
    filterClient !== 'all',
    filterPosition !== 'all',
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
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
            <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* Header */}
              <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {editingJob ? 'Edit Position' : modalStep === 2 ? 'Matching Resumes' : 'Create New Position'}
                  </h3>
                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">
                    {modalStep === 1 ? 'Job Posting & Recruitment' : `${matchedResumes.length} candidates found`}
                  </p>
                </div>
                <button
                  onClick={handleBackToJobs}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {modalStep === 1 ? (
                <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">

                    {/* Section: Basic Information */}


                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Job Title *</label>
                      <input type="text" value={newJobForm.title} onChange={e => setNewJobForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">
                        Role Type *
                      </label>
                      <div className="relative group">
                        <select value={newJobForm.roleType} onChange={e => setNewJobForm(f => ({ ...f, roleType: e.target.value }))}
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-12 cursor-pointer"
                        >
                          <option value="">Select Role Category</option>
                          {roleTypes.map(r => (
                            <option key={r.role} value={r.role}>{r.role} ({r.count})</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0D47A1] pointer-events-none opacity-50" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">
                        Client/Company *
                      </label>
                      <div className="relative group">
                        <select value={newJobForm.clientId} onChange={e => {
                          const activeClients = (clients && clients.length > 0 ? clients : [
                            { id: '00000000-0000-0000-0000-000000000000', name: 'Mabicons ERP (Internal)', companyName: 'Mabicons', displayName: 'Mabicons ERP (Internal)' },
                            { id: '11111111-1111-1111-1111-111111111111', name: 'Standard Partner', companyName: 'General Partner', displayName: 'Standard Partner' }
                          ]);
                          const selected = activeClients.find(c => c.id === e.target.value);
                          setNewJobForm(f => ({ ...f, clientId: e.target.value, client: selected?.companyName || selected?.name || selected?.displayName || '' }));
                        }}
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-12 cursor-pointer"
                        >
                          <option value="">Select Company</option>
                          {(clients && clients.length > 0 ? clients : [
                            { id: '00000000-0000-0000-0000-000000000000', displayName: 'Mabicons ERP (Internal)' },
                            { id: '11111111-1111-1111-1111-111111111111', displayName: 'Standard Partner' }
                          ]).map(c => (
                            <option key={c.id || Math.random()} value={c.id}>{c.displayName}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0D47A1] pointer-events-none opacity-50" />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Location</label>
                      <div className="relative group">
                        <input type="text" value={newJobForm.location} onChange={e => setNewJobForm(f => ({ ...f, location: e.target.value }))}
                          placeholder="e.g. Bangalore, Remote"
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                        />
                      </div>
                    </div>



                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Type</label>
                      <div className="relative group">
                        <select value={newJobForm.type} onChange={e => setNewJobForm(f => ({ ...f, type: e.target.value }))}
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-12 cursor-pointer"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0D47A1] pointer-events-none opacity-50" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Priority</label>
                      <div className="relative group">
                        <select value={newJobForm.priority} onChange={e => setNewJobForm(f => ({ ...f, priority: e.target.value }))}
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-12 cursor-pointer"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0D47A1] pointer-events-none opacity-50" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Salary Range</label>
                      <input type="text" value={newJobForm.salary} onChange={e => setNewJobForm(f => ({ ...f, salary: e.target.value }))}
                        placeholder="e.g. 15-25 LPA"
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Experience</label>
                      <input type="text" value={newJobForm.experience} onChange={e => setNewJobForm(f => ({ ...f, experience: e.target.value }))}
                        placeholder="e.g. 3-5 Years"
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">No. of Openings</label>
                      <input type="number" value={newJobForm.openings} onChange={e => setNewJobForm(f => ({ ...f, openings: e.target.value }))} min="1"
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Deadline</label>
                      <div onClick={() => openNativeDatePicker(positionDeadlineInputRef)} className="cursor-pointer relative group">
                        <input
                          ref={positionDeadlineInputRef}
                          type="date"
                          value={newJobForm.deadline}
                          onChange={e => setNewJobForm(f => ({ ...f, deadline: e.target.value }))}
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] cursor-pointer"
                        />
                      </div>
                    </div>




                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Requirements</label>
                      <div className="w-full bg-[#F4F3EF] rounded-2xl px-4 py-3 min-h-[120px] transition-all focus-within:bg-[#EEF2FB] cursor-text"
                        onClick={() => document.getElementById('req-tag-input')?.focus()}>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newJobForm.requirements.split('\n').map(s => s.trim()).filter(Boolean).map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-[#E5E5EA] rounded-full px-3 py-1.5 text-xs font-bold text-[#1A1A2E] shadow-sm">
                              {item}
                              <button type="button" onClick={(e) => { e.stopPropagation(); const updated = newJobForm.requirements.split('\n').map(s => s.trim()).filter(Boolean).filter((_, i) => i !== idx).join('\n'); setNewJobForm(f => ({ ...f, requirements: updated })); }}
                                className="ml-0.5 text-[#9B9BAD] hover:text-red-500 transition-colors text-sm leading-none font-bold">&times;</button>
                            </span>
                          ))}
                        </div>
                        <input id="req-tag-input" type="text" value={reqInput}
                          onChange={e => setReqInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && reqInput.trim()) {
                              e.preventDefault();
                              const val = reqInput.trim();
                              const existing = newJobForm.requirements.split('\n').map(s => s.trim()).filter(Boolean);
                              if (!existing.some(s => s.toLowerCase() === val.toLowerCase())) {
                                setNewJobForm(f => ({ ...f, requirements: existing.length ? existing.join('\n') + '\n' + val : val }));
                              }
                              setReqInput('');
                            } else if (e.key === 'Backspace' && !reqInput) {
                              const existing = newJobForm.requirements.split('\n').map(s => s.trim()).filter(Boolean);
                              if (existing.length) {
                                setNewJobForm(f => ({ ...f, requirements: existing.slice(0, -1).join('\n') }));
                              }
                            }
                          }}
                          placeholder={newJobForm.requirements ? 'Add more...' : 'Type & press Enter'}
                          className="w-full bg-transparent border-0 outline-none text-sm font-bold text-[#1A1A2E] placeholder:text-[#9B9BAD]/50 py-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Responsibilities</label>
                      <div className="w-full bg-[#F4F3EF] rounded-2xl px-4 py-3 min-h-[120px] transition-all focus-within:bg-[#EEF2FB] cursor-text"
                        onClick={() => document.getElementById('resp-tag-input')?.focus()}>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newJobForm.responsibilities.split('\n').map(s => s.trim()).filter(Boolean).map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-[#E5E5EA] rounded-full px-3 py-1.5 text-xs font-bold text-[#1A1A2E] shadow-sm">
                              {item}
                              <button type="button" onClick={(e) => { e.stopPropagation(); const updated = newJobForm.responsibilities.split('\n').map(s => s.trim()).filter(Boolean).filter((_, i) => i !== idx).join('\n'); setNewJobForm(f => ({ ...f, responsibilities: updated })); }}
                                className="ml-0.5 text-[#9B9BAD] hover:text-red-500 transition-colors text-sm leading-none font-bold">&times;</button>
                            </span>
                          ))}
                        </div>
                        <input id="resp-tag-input" type="text" value={respInput}
                          onChange={e => setRespInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && respInput.trim()) {
                              e.preventDefault();
                              const val = respInput.trim();
                              const existing = newJobForm.responsibilities.split('\n').map(s => s.trim()).filter(Boolean);
                              if (!existing.some(s => s.toLowerCase() === val.toLowerCase())) {
                                setNewJobForm(f => ({ ...f, responsibilities: existing.length ? existing.join('\n') + '\n' + val : val }));
                              }
                              setRespInput('');
                            } else if (e.key === 'Backspace' && !respInput) {
                              const existing = newJobForm.responsibilities.split('\n').map(s => s.trim()).filter(Boolean);
                              if (existing.length) {
                                setNewJobForm(f => ({ ...f, responsibilities: existing.slice(0, -1).join('\n') }));
                              }
                            }
                          }}
                          placeholder={newJobForm.responsibilities ? 'Add more...' : 'Type & press Enter'}
                          className="w-full bg-transparent border-0 outline-none text-sm font-bold text-[#1A1A2E] placeholder:text-[#9B9BAD]/50 py-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Job Description</label>
                      <textarea value={newJobForm.description} onChange={e => setNewJobForm(f => ({ ...f, description: e.target.value }))}
                        rows={3} placeholder="Describe the role..."
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] resize-none placeholder:text-[#9B9BAD]/50"
                      />
                    </div>




                  </div>

                  {/* Footer Buttons */}
                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={handleBackToJobs}
                      className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
                    >
                      Cancel
                    </button>
                    <button type="button" onClick={editingJob ? handleUpdatePosition : handleCreatePosition}
                      className="flex-[2] bg-[#0D47A1] text-white py-5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-2"
                    >
                      {editingJob ? <><Check size={18} /> Update Position</> : <><Plus size={18} /> Create Position</>}
                    </button>
                  </div>
                </div>
              ) : (
                // Step 2: Resume Matches
                <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-8">
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
                    <div className="grid grid-cols-1 gap-3">
                      {matchedResumes.map((resume, idx) => {
                        const isSelected = selectedResumes.has(resume.id);
                        return (
                          <motion.div
                            key={resume.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => toggleResumeSelection(resume.id)}
                            className={`group p-5 rounded-[24px] border-2 cursor-pointer transition-all ${isSelected
                              ? 'border-[#1B4DA0] bg-blue-50/50 shadow-xl shadow-blue-500/5'
                              : 'border-[#F4F3EF] bg-white hover:border-[#1B4DA0]/30'
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-[#F4F3EF] flex items-center justify-center text-[#0D47A1] font-bold text-sm group-hover:scale-110 transition-transform">
                                {(resume.candidateName || resume.fileName || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#1A1A2E] truncate">{resume.candidateName || 'Unknown'}</p>
                                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5 truncate">{resume.email}</p>
                              </div>
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#0D47A1] border-[#1B4DA0]' : 'border-[#E8E7E2]'}`}>
                                {isSelected && <Check size={14} className="text-white" />}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer Buttons */}
                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={handleBackToJobs}
                      className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
                    >
                      Skip for Now
                    </button>
                    <button type="button" onClick={handleAddSelectedToPipeline} disabled={selectedResumes.size === 0}
                      className={`flex-[2] bg-[#0D47A1] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${selectedResumes.size === 0 ? 'opacity-50 grayscale' : ''}`}
                    >
                      <Check size={18} /> Add Selected Candidates
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-8" style={{ fontFamily: "'Calibri', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Job Openings
            </h1>
            <p className="text-sm font-medium text-[#9B9BAD] mt-1 text-left">
              <span className="text-[#0D47A1] font-bold">{filteredJobs.length}</span> Active Positions {filterClient !== 'all' ? `for ${filterClient}` : 'in Recruitment'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowFullPageForm(true); setEditingJob(null); resetModal(); }}
              className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-[#0D47A1]/20 active:scale-95"
            >
              <Plus size={18} /> Post New Job
            </button>
          </div>
        </div>

        {/* Filter Bar Redesigned based on Task Assignment style */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs, clients or location..."
              className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
            />
          </div>

          {/* Client Filter */}
          <div className="relative">
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
            >
              <option value="all">All Clients</option>
              {clients.map(c => <option key={c.id} value={c.displayName}>{c.displayName}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-12 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Urgent">Urgent</option>
              <option value="Hold">Hold</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
          </div>
        </div>

        {/* Table Interface */}
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
          <div className="grid grid-cols-[40px_1fr_140px_120px_130px_100px_140px_36px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0]"
                checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                onChange={(e) => {
                  if (e.target.checked) setSelectedJobs(filteredJobs.map(j => j.id));
                  else setSelectedJobs([]);
                }}
              />
            </div>
            {["Position", "Client", "Status", "Posted", "Applicants", "Assign To", ""].map((h, i) => (
              <div key={i} className={`text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-center`}>
                {h}
              </div>
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
                className="grid grid-cols-[40px_1fr_140px_120px_130px_100px_140px_36px] gap-4 items-center px-8 py-3 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group relative"
              >
                <div className="flex items-center" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0]"
                    checked={selectedJobs.includes(job.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (selectedJobs.includes(job.id)) {
                        setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                      } else {
                        setSelectedJobs([...selectedJobs, job.id]);
                      }
                    }}
                  />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#0f172a] group-hover:text-[#0D47A1] transition-colors flex items-center gap-2">
                    {job.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={11} className="text-[#9B9BAD]" />
                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{job.location}</span>
                  </div>
                </div>
                <div className="text-[13px] font-medium text-[#64748b] truncate flex items-center">{job.client}</div>
                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border ${STATUS_STYLES[job.status] || "bg-slate-50 text-slate-400 border-slate-100"}`}>
                  {job.status}
                </span>
                <span className="text-sm font-bold text-[#9B9BAD]">
                  {new Date(job.postedDate || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD]">
                    <Users size={14} />
                  </div>
                  <span className="text-sm font-black text-[#1A1A2E]">{job.candidateCount}</span>
                </div>
                <div className="relative" onClick={e => e.stopPropagation()}>
                  {jobAssignments[job.id] ? (
                    <button
                      id={`assign-btn-${job.id}`}
                      onClick={() => setAssignDropdownJobId(assignDropdownJobId === job.id ? null : job.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D47A1]/10 text-[#0D47A1] rounded-lg text-xs font-bold hover:bg-[#0D47A1]/20 transition-all"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#0D47A1] text-white text-[9px] font-black flex items-center justify-center">{jobAssignments[job.id].charAt(0)}</span>
                      {jobAssignments[job.id]}
                    </button>
                  ) : (
                    <button
                      id={`assign-btn-${job.id}`}
                      onClick={() => setAssignDropdownJobId(assignDropdownJobId === job.id ? null : job.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#0D47A1] text-white rounded-lg text-xs font-bold hover:bg-[#0a3a82] transition-all shadow-md shadow-[#0D47A1]/20 active:scale-95"
                    >
                      <UserPlus size={13} /> Assign
                    </button>
                  )}
                  {assignDropdownJobId === job.id && createPortal(
                    <>
                      <div className="fixed inset-0 z-[9998]" onClick={() => setAssignDropdownJobId(null)} />
                      <div
                        className="fixed z-[9999] w-52 bg-white rounded-xl shadow-2xl border border-[#E5E5EA] py-2"
                        style={(() => {
                          const btn = document.getElementById(`assign-btn-${job.id}`);
                          if (!btn) return { top: 0, left: 0 };
                          const rect = btn.getBoundingClientRect();
                          return { top: rect.bottom + 8, left: rect.left };
                        })()}
                      >
                        <p className="px-4 py-1.5 text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Select Member</p>
                        <button
                          onClick={() => { handleAssignJob(job.id, 'Me'); setAssignDropdownJobId(null); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-all ${jobAssignments[job.id] === 'Me' ? 'bg-[#0D47A1]/5 text-[#0D47A1]' : 'text-[#1A1A2E] hover:bg-[#F8FAFF]'
                            }`}
                        >
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${jobAssignments[job.id] === 'Me' ? 'bg-[#0D47A1] text-white' : 'bg-[#F4F3EF] text-[#6B6B7E]'
                            }`}><User size={13} /></span>
                          Assign to me
                          {jobAssignments[job.id] === 'Me' && <span className="ml-auto text-[#0D47A1]">✓</span>}
                        </button>
                        <div className="border-t border-[#F4F3EF] my-1" />
                        {['Jyoti', 'Manju', 'Priyanshi'].map(name => (
                          <button key={name}
                            onClick={() => { handleAssignJob(job.id, name); setAssignDropdownJobId(null); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-all ${jobAssignments[job.id] === name ? 'bg-[#0D47A1]/5 text-[#0D47A1]' : 'text-[#1A1A2E] hover:bg-[#F8FAFF]'
                              }`}
                          >
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${jobAssignments[job.id] === name ? 'bg-[#0D47A1] text-white' : 'bg-[#F4F3EF] text-[#6B6B7E]'
                              }`}>{name.charAt(0)}</span>
                            {name}
                            {jobAssignments[job.id] === name && <span className="ml-auto text-[#0D47A1]">✓</span>}
                          </button>
                        ))}
                        {jobAssignments[job.id] && (
                          <>
                            <div className="border-t border-[#F4F3EF] my-1" />
                            <button
                              onClick={() => { handleAssignJob(job.id, null); setAssignDropdownJobId(null); }}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 text-red-500 hover:bg-red-50 transition-all"
                            >
                              <span className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-500"><X size={13} /></span>
                              Remove Assignment
                            </button>
                          </>
                        )}
                      </div>
                    </>,
                    document.body
                  )}
                </div>
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#0D47A1]/5 flex items-center justify-center transition-all">
                    <ChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#0D47A1] transition-all" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selection Action Bar (Snackbar) */}
      <AnimatePresence>
        {selectedJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 bg-[#1A1A2E] rounded-2xl shadow-2xl flex items-center gap-8 border border-white/10"
          >
            <div className="flex items-center gap-3 pr-8 border-r border-white/10">
              <span className="px-2 py-1 bg-[#1B4DA0] rounded-lg text-white text-xs font-black">{selectedJobs.length}</span>
              <span className="text-sm font-bold text-white">positions selected</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={handleBulkHold}
                className="flex items-center gap-2 text-sm font-bold text-[#1B4DA0] hover:text-[#0D47A1] transition-colors"
              >
                <RefreshCw size={18} />
                Hold Selected
              </button>
            </div>
            <button
              onClick={() => setSelectedJobs([])}
              className="ml-4 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
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
                    jobAssignments={jobAssignments}
                    setJobAssignments={setJobAssignments}
                    handleAssignJob={handleAssignJob}
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
            <motion.div key="delete-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setConfirmDelete(null)}>
              <motion.div initial={{ scale: 0.8, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.8, y: 30, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl p-8 bg-white border border-[#F4F3EF] shadow-2xl overflow-hidden relative">

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }} className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-red-50 blur-3xl pointer-events-none" />

                <div className="text-center relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-4 bg-red-50 border-white shadow-xl rotate-3"
                  >
                    <motion.div animate={{ rotate: [0, -15, 15, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 0.6, delay: 0.5, type: "spring" }}>
                      <Trash2 className="w-10 h-10 text-red-500" />
                    </motion.div>
                  </motion.div>

                  <h3 className="text-2xl font-extrabold mb-2 text-[#1A1A2E]">Delete Position?</h3>
                  <p className="text-sm mb-8 leading-relaxed text-[#9B9BAD]">Are you sure you want to delete this position? This action <span className="font-bold text-red-500">cannot be undone</span>.</p>
                  <div className="flex gap-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setConfirmDelete(null)}
                      className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteJob(confirmDelete)}
                      className="flex-[2] py-5 rounded-full text-[11px] font-bold uppercase tracking-widest text-white bg-red-500 shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all">Yes, Delete</motion.button>
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
