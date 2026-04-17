import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiRefreshCw,
  FiX,
  FiDownload,
  FiMail,
  FiPhone,
  FiChevronRight,
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import {
  Briefcase,
  Users as LuUsers,
  Target as LuTarget,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview, generateCandidateCredentials } from '../../../service/api';
import toast from 'react-hot-toast';
import { Zap, RotateCcw } from 'lucide-react';

/* ── Stage color config ── */
const STAGE_CONFIG = {
  screening: { label: 'Screening', hex: ['#cbd5e1', '#b0bec5'], bg: 'bg-slate-100 text-slate-600' },
  phoneInterview: { label: 'Phone Interview', hex: ['#fef08a', '#fde68a'], bg: 'bg-yellow-50 text-yellow-600' },
  technical: { label: 'Technical Round', hex: ['#fde68a', '#fcd34d'], bg: 'bg-amber-50 text-amber-600' },
  hrRound: { label: 'HR Round', hex: ['#fed7aa', '#fdba74'], bg: 'bg-orange-50 text-orange-600' },
  clientInterview: { label: 'Client Interview', hex: ['#fdba74', '#fbbf24'], bg: 'bg-orange-50 text-orange-600' },
  offerSent: { label: 'Offer Sent', hex: ['#ddd6fe', '#c4b5fd'], bg: 'bg-purple-50 text-purple-600' },
  joined: { label: 'Joined', hex: ['#93c5fd', '#60a5fa'], bg: 'bg-blue-50 text-blue-600' },
  rejected: { label: 'Rejected', hex: ['#d1d5db', '#b0b5be'], bg: 'bg-gray-50 text-gray-500' },
};

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const config = {
    Open: 'bg-blue-50 text-[#1B4DA0] border border-blue-100',
    Urgent: 'bg-amber-50 text-amber-700 border border-amber-100',
    'In Progress': 'bg-slate-50 text-slate-600 border border-slate-100',
    Closed: 'bg-gray-50 text-gray-500 border border-gray-100',
    Hold: 'bg-amber-50 text-amber-600 border border-amber-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${config[status] || 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
      {status}
    </span>
  );
};

/* ── Priority Badge ── */
const PriorityBadge = ({ priority }) => {
  const config = {
    High: 'bg-red-50 text-red-600 border border-red-200',
    Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
    Low: 'bg-slate-50 text-slate-500 border border-slate-200',
    Urgent: 'bg-red-100 text-red-700 border border-red-300',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${config[priority] || config.Medium}`}>{priority}</span>;
};

/* ── Job Detail Sidebar ── */
const JobDetailSidebar = ({ job, onClose }) => {
  if (!job) return null;

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
            <span className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px]">{job.client || 'Engineering'}</span>
            <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
            <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">{job.type || 'Full-time'}</span>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90 shadow-sm">
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Job Snapshot Info Grid */}
        <div className="px-8 py-8 space-y-8">
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Location</span>
              <p className="text-sm font-bold text-[#1A1A2E]">{job.location || 'Not Specified'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Salary Range</span>
              <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-1.5">
                <span className="text-[#9B9BAD]">₹</span>
                {job.salary ? (job.salary.toString().toLowerCase().includes('lpa') ? job.salary : `${job.salary} LPA`) : 'Competitive'}
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Experience</span>
              <p className="text-sm font-bold text-[#1A1A2E]">{job.experience ? (job.experience.toString().toLowerCase().includes('year') ? job.experience : `${job.experience} Years`) : 'Not Mentioned'}</p>
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
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${job.priority === 'Critical' ? 'bg-rose-50 text-rose-500 border-rose-100' : job.priority === 'High' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-blue-50 text-[#1B4DA0] border-blue-100'}`}>
                {job.priority || 'Medium'}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#F4F3EF]">
            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-4">Required Skills</span>
            <div className="flex flex-wrap gap-2">
              {skillsArr.length > 0 ? skillsArr.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-white border border-[#F4F3EF] rounded-xl text-[11px] font-bold text-[#4B4B5E] shadow-sm">
                  {skill.trim()}
                </span>
              )) : <span className="text-sm text-[#9B9BAD] italic">No specific skills listed</span>}
            </div>
          </div>

          <div className="pt-6 border-t border-[#F4F3EF]">
            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-2">Job Description</span>
            <p className="text-sm text-[#4B4B5E] leading-relaxed font-medium">
              {job.description || <span className="italic text-[#9B9BAD]">No description provided</span>}
            </p>
          </div>

          <div className="pt-6 border-t border-[#F4F3EF]">
            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-3">Requirements</span>
            {reqsArr.length > 0 ? (
              <ul className="space-y-2.5">
                {reqsArr.map((req, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[#4B4B5E] font-medium leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B4DA0] mt-1.5 flex-shrink-0" />
                    {req.trim()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-[#9B9BAD]">No specific requirements listed</p>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-[#F4F3EF] px-10 py-6 flex items-center gap-4 z-20">
        <button
          onClick={onClose}
          className="flex-1 py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-2xl font-bold text-sm hover:bg-[#E8E7E2] transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ══════════════════ CLIENT RECRUITMENT PROGRESS ═══════════════════ */
export default function ClientRecruitmentProgressTab({ isDarkMode, clientData, setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [datePreset, setDatePreset] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isPositionsModalOpen, setIsPositionsModalOpen] = useState(false);
  const [isCandidatesModalOpen, setIsCandidatesModalOpen] = useState(false);
  const [isInterviewsModalOpen, setIsInterviewsModalOpen] = useState(false);
  const [isHiredModalOpen, setIsHiredModalOpen] = useState(false);
  const datePickerRef = useRef(null);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offsetPos = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({
        top: offsetPos,
        behavior: 'smooth'
      });
    }
  };

  // Close date picker on outside click

  // Date range helper
  const getDateRange = () => {
    const now = new Date();
    const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    switch (datePreset) {
      case 'today': return { from: startOfDay(now), to: now };
      case 'week': { const d = startOfDay(now); d.setDate(d.getDate() - d.getDay()); return { from: d, to: now }; }
      case 'month': return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
      case 'quarter': { const qm = Math.floor(now.getMonth() / 3) * 3; return { from: new Date(now.getFullYear(), qm, 1), to: now }; }
      case 'year': return { from: new Date(now.getFullYear(), 0, 1), to: now };
      case 'custom': return { from: customFrom ? new Date(customFrom) : null, to: customTo ? new Date(customTo + 'T23:59:59') : null };
      default: return null;
    }
  };

  const filterByDate = (items, dateField = 'updatedAt') => {
    const range = getDateRange();
    if (!range || (!range.from && !range.to)) return items;
    return items.filter(item => {
      const d = item[dateField] ? new Date(item[dateField]) : null;
      if (!d) return true;
      if (range.from && d < range.from) return false;
      if (range.to && d > range.to) return false;
      return true;
    });
  };

  const datePresetLabel = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    quarter: 'This Quarter',
    year: 'This Year',
    custom: customFrom || customTo ? `${customFrom || '...'} → ${customTo || '...'}` : 'Custom Range',
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the clientId passed via props or from localStorage if user is a client
      const cid = clientData?.id;
      if (!cid) throw new Error('Client ID not found');
      
      const res = await getClientDashboardOverview(cid, datePreset);
      if (res?.success && res.data?.recruitment) {
        const r = res.data.recruitment;
        setData({
          summary: r.summary || {},
          positions: r.positions || [],
          funnel: r.funnel || {},
          upcomingInterviews: r.upcomingInterviews || [],
          candidates: r.candidates || [],
        });
        return;
      }
      // API returned but success was false — use empty data as fallback
      setData({
        summary: { openPositions: 0, totalPositions: 0, inPipeline: 0, totalCandidates: 0, scheduledInterviews: 0, totalInterviews: 0, hired: 0 },
        positions: [],
        funnel: { screening: 0, phoneInterview: 0, technical: 0, hrRound: 0, clientInterview: 0, offerSent: 0, joined: 0, rejected: 0 },
        upcomingInterviews: [],
        candidates: [],
      });
    } catch (err) {
      console.error('Failed to load recruitment progress:', err);
      // Fallback to empty data so the UI still renders
      setData({
        summary: { openPositions: 0, totalPositions: 0, inPipeline: 0, totalCandidates: 0, scheduledInterviews: 0, totalInterviews: 0, hired: 0 },
        positions: [],
        funnel: { screening: 0, phoneInterview: 0, technical: 0, hrRound: 0, clientInterview: 0, offerSent: 0, joined: 0, rejected: 0 },
        upcomingInterviews: [],
        candidates: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [datePreset, clientData?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading recruitment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-[#9B9BAD]">{error}</p>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#1B4DA0] rounded-xl hover:bg-[#153e82] transition-all">
          <FiRefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, positions, funnel, upcomingInterviews, candidates } = data;

  // Apply date filter to candidates, positions, and interviews
  const dateFilteredCandidates = filterByDate(candidates, 'updatedAt');
  const dateFilteredPositions = filterByDate(positions, 'createdAt');
  const dateFilteredInterviews = filterByDate(upcomingInterviews || [], 'interviewDate');

  // Recompute funnel from date-filtered candidates
  const stageMap = {
    'Screening': 'screening',
    'Phone Interview': 'phoneInterview',
    'Technical Round': 'technical',
    'HR Round': 'hrRound',
    'Client Interview': 'clientInterview',
    'Offer Sent': 'offerSent',
    'Joined': 'joined',
    'Rejected': 'rejected',
  };
  const isDateFiltered = datePreset !== 'all';
  const computedFunnel = isDateFiltered
    ? dateFilteredCandidates.reduce((acc, c) => {
        const key = stageMap[c.stage] || 'screening';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, { screening: 0, phoneInterview: 0, technical: 0, hrRound: 0, clientInterview: 0, offerSent: 0, joined: 0, rejected: 0 })
    : funnel;

  // Recompute KPI summary from filtered data
   const computedSummary = isDateFiltered
    ? {
        openPositions: dateFilteredPositions.filter(p => p.status === 'Open' || p.status === 'Urgent').length,
        totalPositions: dateFilteredPositions.length,
        inPipeline: dateFilteredCandidates.filter(c => c.stage !== 'Rejected' && c.stage !== 'Joined').length,
        totalCandidates: dateFilteredCandidates.length,
        scheduledInterviews: dateFilteredInterviews.length,
        totalInterviews: dateFilteredInterviews.length,
        hired: dateFilteredCandidates.filter(c => c.stage === 'Joined').length,
      }
    : summary;

  // Filter positions by status
  const filteredPositions = filterStatus === 'all'
    ? dateFilteredPositions
    : dateFilteredPositions.filter(p => p.status === filterStatus);

  const activeExpId = expandedPosition;

  // Funnel stages in order
  const funnelStages = ['screening', 'phoneInterview', 'technical', 'hrRound', 'clientInterview', 'offerSent', 'joined'];
  const maxFunnel = Math.max(...funnelStages.map(s => computedFunnel[s] || 0), 1);

  const kpiCards = [
    { label: 'Open Positions', value: computedSummary.openPositions, change: `${computedSummary.totalPositions} total`, up: computedSummary.openPositions > 0, icon: Briefcase },
    { label: 'Candidates', value: computedSummary.inPipeline, change: `${computedSummary.totalCandidates} total`, up: computedSummary.inPipeline > 0 ? true : null, icon: LuUsers },
    { label: 'Interviews', value: computedSummary.scheduledInterviews || 0, change: `${computedSummary.totalInterviews || 0} total`, up: (computedSummary.scheduledInterviews || 0) > 0, icon: LuTarget },
    { label: 'Hired', value: computedSummary.hired || 0, change: `${computedSummary.totalCandidates || 0} total`, up: (computedSummary.hired || 0) > 0, icon: UserCheck },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Detached Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Recruitment Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                datePreset !== 'all'
                  ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white border-[#E8E7E2] text-[#1A1A2E] hover:bg-[#F4F3EF]'
              } shadow-sm active:scale-95`}
            >
              <FiCalendar className={`w-4 h-4 ${datePreset !== 'all' ? 'text-white' : 'text-[#1B4DA0]'}`} />
              <span className="max-w-[180px] truncate">{datePresetLabel[datePreset]}</span>
              <FiChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDatePicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-72 bg-white border border-[#E8E7E2] rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  {/* Quick presets */}
                  <div className="p-2 border-b border-[#F4F3EF]">
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest px-3 py-1.5">Quick Filter</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['all', 'today', 'week', 'month', 'quarter', 'year'].map(preset => (
                        <button
                          key={preset}
                          onClick={() => { setDatePreset(preset); if (preset !== 'custom') setShowDatePicker(false); fetchData(); }}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                            datePreset === preset
                              ? 'bg-[#1B4DA0] text-white'
                              : 'text-[#1A1A2E] hover:bg-[#F4F3EF]'
                          }`}
                        >
                          {{ all: 'All Time', today: 'Today', week: 'This Week', month: 'This Month', quarter: 'This Quarter', year: 'This Year' }[preset]}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Custom date range */}
                  <div className="p-3">
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-2">Custom Range</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-[#9B9BAD] block mb-1">From</label>
                        <input
                          type="date"
                          value={customFrom}
                          onChange={(e) => { setCustomFrom(e.target.value); setDatePreset('custom'); }}
                          className="w-full px-2.5 py-1.5 text-xs border border-[#E8E7E2] rounded-lg bg-[#FAFAF8] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <span className="text-[#9B9BAD] text-xs mt-4">→</span>
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-[#9B9BAD] block mb-1">To</label>
                        <input
                          type="date"
                          value={customTo}
                          onChange={(e) => { setCustomTo(e.target.value); setDatePreset('custom'); }}
                          className="w-full px-2.5 py-1.5 text-xs border border-[#E8E7E2] rounded-lg bg-[#FAFAF8] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => { setDatePreset('all'); setCustomFrom(''); setCustomTo(''); setShowDatePicker(false); fetchData(); }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600"
                      >
                        Clear Filter
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-3 py-1.5 text-[10px] font-bold text-white bg-[#1B4DA0] rounded-lg hover:bg-[#153e82] transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E7E2] rounded-xl text-sm font-semibold text-[#1A1A2E] hover:bg-[#F4F3EF] transition-all shadow-sm active:scale-95"
          >
            <FiRefreshCw className={`w-4 h-4 text-[#1B4DA0] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards — same style as Dashboard Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          const handleClick = () => {
            if (kpi.label === 'Open Positions') {
              if (computedSummary.openPositions > 0) setIsPositionsModalOpen(true);
              else toast.error('No open positions found');
            }
            else if (kpi.label === 'Candidates') {
              if (computedSummary.inPipeline > 0) setIsCandidatesModalOpen(true);
              else toast.error('No candidates in pipeline');
            }
            else if (kpi.label === 'Interviews') {
              if (computedSummary.scheduledInterviews > 0) setIsInterviewsModalOpen(true);
              else toast.error('No interviews scheduled');
            }
            else if (kpi.label === 'Hired') {
              if (computedSummary.hired > 0) setIsHiredModalOpen(true);
              else toast.error('No hired candidates found');
            }
          };

          return (
            <div 
              key={i} 
              onClick={handleClick}
              className="bg-white p-6 rounded-[24px] border border-[#E8E7E2] shadow-sm hover:shadow-xl hover:border-[#1B4DA0]/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <FiChevronRight className="text-[#1B4DA0]/30" size={24} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-black group-hover:text-[#1B4DA0] transition-colors duration-300 group-hover:scale-110">
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-4xl font-extrabold text-[#1A1A2E] mb-1 tracking-tighter">{kpi.value}</p>
              <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest mb-3">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Candidates Pie Chart */}
      {(() => {
        const CustomTooltip = ({ active, payload }) => {
          if (active && payload && payload.length) {
            return (
              <div className="bg-white p-3 rounded-xl border border-[#E8E7E2] shadow-xl">
                <p className="text-xs font-bold text-[#1A1A2E] mb-1">{payload[0].name}</p>
                <p className="text-sm font-extrabold text-[#1B4DA0]">{payload[0].value} candidates</p>
              </div>
            );
          }
          return null;
        };

        const pieColors = ['#cbd5e1', '#fde68a', '#fcd34d', '#fdba74', '#fbbf24', '#c4b5fd', '#93c5fd'];
        const chartData = funnelStages
          .map((stage, i) => ({
            name: STAGE_CONFIG[stage].label,
            value: computedFunnel[stage] || 0,
            fill: pieColors[i],
          }))
          .filter(d => d.value > 0);

        const totalCandidates = chartData.reduce((sum, d) => sum + d.value, 0);

        return (
          <div id="candidates-chart-section" className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex flex-col items-start scroll-mt-24">
            <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-3 mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <FiUsers className="w-5 h-5 text-[#1B4DA0]" />
              </div>
              Candidates
            </h2>
            <div className="flex flex-col xl:flex-row items-center xl:items-start gap-12 w-full">
              <div className="relative w-[280px] h-[280px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={85}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-extrabold text-[#1A1A2E] leading-none mb-1">{totalCandidates}</span>
                  <span className="text-[10px] font-bold text-[#9B9BAD] tracking-widest uppercase">Total</span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-8 gap-y-4 flex-1">
                {chartData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer w-full max-w-[240px]">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-sm font-semibold text-[#1A1A2E]">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#9B9BAD] group-hover:text-[#1B4DA0] transition-colors">{entry.value}</span>
                  </div>
                ))}
                {computedFunnel.rejected > 0 && (
                  <div className="col-span-2 lg:col-span-1 pt-4 mt-4 border-t border-[#F4F3EF] flex items-center gap-2">
                    <FiUsers className="w-3.5 h-3.5 text-red-400" />
                    <p className="text-xs text-[#9B9BAD]">
                      <span className="text-red-500 font-bold">{computedFunnel.rejected}</span> rejected candidates
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Positions & Upcoming Interviews Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Positions List */}
        <div id="positions-section" className="lg:col-span-6 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex flex-col min-h-[500px] scroll-mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-amber-50 rounded-2xl">
                <FiBriefcase className="w-5 h-5 text-amber-500" />
              </div>
              <span>Open Positions</span>
            </h2>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 pb-2">
                  <th className="py-4 px-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Position</th>
                  <th className="py-4 px-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Openings</th>
                  <th className="py-4 px-4 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPositions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-sm font-medium text-slate-400">
                      No active vacancies
                    </td>
                  </tr>
                ) : (
                  filteredPositions.map(pos => (
                    <tr key={pos._id || pos.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedJob(pos)}>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <h3 className="text-sm font-semibold text-slate-700">{pos.title}</h3>
                          <p className="text-[11px] text-slate-400 font-medium">{pos.location || 'Remote'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-slate-600">{pos.openings || 1}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <StatusBadge status={pos.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div id="interviews-section" className="lg:col-span-6 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex flex-col min-h-[500px] scroll-mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-blue-50 rounded-2xl">
                <FiCalendar className="w-5 h-5 text-blue-500" />
              </div>
              <span>Upcoming Interviews</span>
            </h2>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 pb-2">
                  <th className="py-4 px-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Candidate</th>
                  <th className="py-4 px-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Position</th>
                  <th className="py-4 px-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(!dateFilteredInterviews || dateFilteredInterviews.length === 0) ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-sm font-medium text-slate-400">
                      No scheduled sessions
                    </td>
                  </tr>
                ) : (
                  dateFilteredInterviews.map((iv, i) => {
                    const date = new Date(iv.interviewDate);
                    const formattedDate = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                    
                    return (
                      <tr 
                        key={i} 
                        onClick={() => setSelectedInterview(iv)}
                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-slate-700">{iv.candidateName}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-slate-600">{iv.positionTitle}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-600">{formattedDate}</p>
                            <p className="text-sm font-semibold text-[#1B4DA0]">{iv.startTime}</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Positions Modal */}
      {isPositionsModalOpen && createPortal(
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPositionsModalOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF]"
          >
            <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Open Positions</h3>
                <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Live Vacancy Status</p>
              </div>
              <button 
                onClick={() => setIsPositionsModalOpen(false)}
                className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {filteredPositions.filter(p => p.status === 'Open' || p.status === 'Urgent').map(p => (
                <div 
                  key={p._id || p.id}
                  onClick={() => { setSelectedJob(p); setIsPositionsModalOpen(false); }}
                  className="p-6 rounded-[32px] bg-[#FAFAF8] border border-[#E8E7E2] hover:border-[#1B4DA0] hover:bg-white transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8E7E2] flex items-center justify-center text-[#1B4DA0] text-lg font-black group-hover:bg-blue-50 transition-colors">
                      {p.title.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#1A1A2E]">{p.title}</p>
                      <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">{p.location || 'Remote'} • {p.openings || 1} Openings</p>
                    </div>
                  </div>
                  <FiChevronRight className="text-[#9B9BAD] group-hover:text-[#1B4DA0] transition-colors" size={20} />
                </div>
              ))}
            </div>
            
            <div className="p-8 bg-[#F4F3EF]/50 border-t border-[#F4F3EF]">
              <button 
                onClick={() => setIsPositionsModalOpen(false)}
                className="w-full py-4 bg-white border border-[#E8E7E2] rounded-2xl text-[#1A1A2E] font-bold hover:bg-[#F4F3EF] transition-all"
              >
                Close Breakdown
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Candidates Modal */}
      {isCandidatesModalOpen && createPortal(
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsCandidatesModalOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF]"
          >
            <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Active Candidates</h3>
                <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Hiring Pipeline Status</p>
              </div>
              <button onClick={() => setIsCandidatesModalOpen(false)} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <FiX size={24} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {dateFilteredCandidates.filter(c => c.stage !== 'Rejected' && c.stage !== 'Joined').map(c => (
                <div 
                  key={c.id}
                  onClick={() => { setSelectedCandidate(c); setIsCandidatesModalOpen(false); }}
                  className="p-6 rounded-[32px] bg-[#FAFAF8] border border-[#E8E7E2] hover:border-[#1B4DA0] hover:bg-white transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8E7E2] flex items-center justify-center text-[#1B4DA0] text-lg font-black group-hover:bg-blue-50 transition-colors">
                      {c.name?.split(' ').map(n=>n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#1A1A2E]">{c.name}</p>
                      <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">{c.stage} • Applied for {c.position || 'Unknown'}</p>
                    </div>
                  </div>
                  <FiChevronRight className="text-[#9B9BAD] group-hover:text-[#1B4DA0] transition-colors" size={20} />
                </div>
              ))}
            </div>
            <div className="p-8 bg-[#F4F3EF]/50 border-t border-[#F4F3EF]">
              <button onClick={() => setIsCandidatesModalOpen(false)} className="w-full py-4 bg-white border border-[#E8E7E2] rounded-2xl text-[#1A1A2E] font-bold hover:bg-[#F4F3EF] transition-all">Close</button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Interviews Modal */}
      {isInterviewsModalOpen && createPortal(
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsInterviewsModalOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF]"
          >
            <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Today's Interviews</h3>
                <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Scheduled Slots</p>
              </div>
              <button onClick={() => setIsInterviewsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <FiX size={24} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {dateFilteredInterviews.map((iv, i) => (
                <div 
                  key={i}
                  className="p-6 rounded-[32px] bg-[#FAFAF8] border border-[#E8E7E2] group flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8E7E2] flex flex-col items-center justify-center text-[#1B4DA0] font-black group-hover:bg-blue-50 transition-colors">
                      <FiClock size={16} className="mb-1" />
                      <span className="text-[10px]">{iv.startTime?.split(' ')[0]}</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#1A1A2E]">{iv.candidateName}</p>
                      <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">{iv.interviewType} • {iv.positionTitle}</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Confirmed</span>
                </div>
              ))}
            </div>
            <div className="p-8 bg-[#F4F3EF]/50 border-t border-[#F4F3EF]">
              <button onClick={() => setIsInterviewsModalOpen(false)} className="w-full py-4 bg-white border border-[#E8E7E2] rounded-2xl text-[#1A1A2E] font-bold hover:bg-[#F4F3EF] transition-all">Close</button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Hired Modal */}
      {isHiredModalOpen && createPortal(
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsHiredModalOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF]"
          >
            <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Successful Hires</h3>
                <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Growth Milestones</p>
              </div>
              <button onClick={() => setIsHiredModalOpen(false)} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <FiX size={24} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {dateFilteredCandidates.filter(c => c.stage === 'Joined').map(c => (
                <div 
                  key={c.id}
                  onClick={() => { setSelectedCandidate(c); setIsHiredModalOpen(false); }}
                  className="p-6 rounded-[32px] bg-emerald-50/30 border border-emerald-100 hover:border-emerald-500 hover:bg-white transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 text-lg font-black group-hover:bg-emerald-50 transition-colors">
                      {c.name?.split(' ').map(n=>n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#1A1A2E]">{c.name}</p>
                      <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">New Hire • {c.position || 'Engineering'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <span className="text-[10px] font-black uppercase tracking-widest">Joined</span>
                    <FiCheckCircle size={18} />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-emerald-50/20 border-t border-[#F4F3EF]">
              <button 
                onClick={() => { setIsHiredModalOpen(false); setActiveTab?.('Finalized & Offers'); }} 
                className="w-full py-4 bg-[#1A1A2E] text-white rounded-2xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
              >
                View Hired Tab
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Job Detail Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedJob && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedJob(null)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[5000]"
              />
              <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-[698px] bg-white shadow-2xl z-[5001] border-l border-[#F4F3EF] flex flex-col overflow-hidden"
              >
                <JobDetailSidebar
                  job={selectedJob}
                  onClose={() => setSelectedJob(null)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Candidate Detail Sidebar */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedCandidate && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCandidate(null)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[5000]"
              />
              {/* Sidebar */}
              <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-full max-w-[580px] bg-white shadow-2xl z-[5001] flex flex-col overflow-hidden text-left"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-xl font-black shadow-inner">
                      {selectedCandidate.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '??'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">{selectedCandidate.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${STAGE_CONFIG[Object.keys(STAGE_CONFIG).find(k => STAGE_CONFIG[k].label === selectedCandidate.stage)]?.bg || 'bg-slate-100 text-slate-600'}`}>
                          {selectedCandidate.stage}
                        </span>
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">• {selectedCandidate.position || selectedCandidate.position?.title || 'Unknown Position'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCandidate(null)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                    <FiX size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar space-y-10">
                  {/* Professional Summary */}
                  <div className="pt-0">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Experience</span>
                        <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                          <FiClock className="text-[#1B4DA0]" /> {selectedCandidate.experience ? (selectedCandidate.experience.toString().toLowerCase().includes('year') ? selectedCandidate.experience : `${selectedCandidate.experience} Years`) : 'Not Specified'}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Location</span>
                        <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                          <FiMapPin className="text-[#1B4DA0]" /> {selectedCandidate.location || 'Remote / Not Specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="pt-8 border-t border-[#F4F3EF]">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-4">Core Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(selectedCandidate.skills) && selectedCandidate.skills.length > 0 ? (
                        selectedCandidate.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-[#F4F3EF] rounded-lg text-xs font-bold text-[#1A1A2E] border border-[#E8E7E2]">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-[#9B9BAD] italic font-bold">No specific skills listed</p>
                      )}
                    </div>
                  </div>

                  {/* Compensation */}
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#F4F3EF]">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Current Salary</span>
                      <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2 text-emerald-600">
                        <FaRupeeSign size={12} /> {selectedCandidate.currentSalary ? (selectedCandidate.currentSalary.toString().toLowerCase().includes('lpa') ? selectedCandidate.currentSalary : `${selectedCandidate.currentSalary} LPA`) : 'Competitive'}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Expected Salary</span>
                      <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2 text-blue-600">
                        <FaRupeeSign size={12} /> {selectedCandidate.expectedSalary ? (selectedCandidate.expectedSalary.toString().toLowerCase().includes('lpa') ? selectedCandidate.expectedSalary : `${selectedCandidate.expectedSalary} LPA`) : 'Negotiable'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[#F4F3EF] bg-[#FAFAF9]">
                  {/* BGV Onboarding Credentials - Same as HR Dashboard */}
                  {(selectedCandidate.stage === 'Joined' || selectedCandidate.stage === 'Offer Sent') && (
                    <div className="pt-8 mb-8 border-t border-[#F4F3EF]">
                      <span className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-[3px] block mb-4">Onboarding Protocol</span>
                      
                      {!selectedCandidate.onboardingUsername ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const loadingId = toast.loading("📡 Initiating Protocol Handshake...");
                            const targetId = selectedCandidate.id || selectedCandidate._id;
                            try {
                              if (!targetId) {
                                toast.error("System Error: Reference missing.", { id: loadingId });
                                return;
                              }
                              
                              const response = await generateCandidateCredentials(targetId);
                              if (response && response.success && response.data) {
                                   const finalUsername = response.data.username || response.data.email;
                                   const finalPass = response.data.password;

                                   // Update local data state
                                   setData(prev => ({
                                     ...prev,
                                     candidates: prev.candidates.map(c => 
                                       (c.id === targetId || c._id === targetId) 
                                         ? { ...c, onboardingUsername: finalUsername, onboardingPassword: finalPass } 
                                         : c
                                     )
                                   }));
                                   // Update selected candidate
                                   setSelectedCandidate(prev => ({ 
                                     ...prev, 
                                     onboardingUsername: finalUsername, 
                                     onboardingPassword: finalPass 
                                   }));
                                   
                                   toast.success(`Success: Records Secured`, { id: loadingId });
                                 } else {
                                   toast.error(`Control Error: ${response?.message || 'Gateway rejection'}`, { id: loadingId });
                                 }
                            } catch (err) {
                               toast.error("Console Error: Protocol failed to reach gateway.", { id: loadingId });
                            }
                          }}
                          className="bg-[#1B4DA0] text-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/10 w-full"
                        >
                          <Zap size={16} fill="currentColor" />
                          GENERATE ONBOARDING CREDENTIALS
                        </motion.button>
                      ) : (
                        <div className="flex flex-col gap-3 group/bgv relative bg-white rounded-2xl">
                           <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-2xl p-6 shadow-sm">
                             <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
                               <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-[#5F6368] uppercase tracking-[2px]">Onboarding ID</span>
                                 <span className="text-sm font-bold text-[#1B4DA0] font-jakarta">{selectedCandidate.onboardingUsername}</span>
                                </div>
                                <UserCheck className="text-[#1B4DA0] opacity-20" size={24} />
                             </div>
                             <div className="flex items-center justify-between gap-4">
                               <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-[#5F6368] uppercase tracking-[2px]">Onboarding Pass</span>
                                 <span className="text-sm font-mono font-black text-[#202124] tracking-widest uppercase">{selectedCandidate.onboardingPassword}</span>
                               </div>
                               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             </div>
                           </div>
                           
                           <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const targetId = selectedCandidate.id || selectedCandidate._id;
                                setData(prev => ({
                                  ...prev,
                                  candidates: prev.candidates.map(c => 
                                    (c.id === targetId || c._id === targetId) 
                                      ? { ...c, onboardingUsername: null, onboardingPassword: null } 
                                      : c
                                  )
                                }));
                                setSelectedCandidate(prev => ({ ...prev, onboardingUsername: null, onboardingPassword: null }));
                                toast.info("Console: Security record cleared locally.");
                              }}
                              className="w-full py-2 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center gap-2"
                            >
                              <RotateCcw size={12} />
                              Reset Security Credentials
                            </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={() => setSelectedCandidate(null)}
                    className="w-full py-4 bg-[#1A1A2E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#2A2A3E] transition-all shadow-xl shadow-gray-200"
                  >
                    Close Profile
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
      {/* Interview Detail Modal */}
      <AnimatePresence>
        {selectedInterview && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInterview(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF]"
            >
              <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedInterview.candidateName}</h3>
                  <p className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-widest mt-1">
                    {selectedInterview.positionTitle || 'PROPOSED POSITION'}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedInterview(null)}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                   <FiX size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-6 text-left">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Schedule Date</span>
                    <p className="text-sm font-bold text-[#1A1A2E]">
                      {new Date(selectedInterview.interviewDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Session Time</span>
                    <p className="text-sm font-bold text-[#1A1A2E]">
                      {selectedInterview.startTime}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#F4F3EF]">
                   <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-3">Meeting Details</span>
                   <p className="text-sm text-[#4B4B5E] leading-relaxed font-medium">
                      Technical evaluation session with the candidate. Please ensure all required interviewers are briefed on the candidate's profile and current hiring requirements.
                   </p>
                </div>
              </div>

              <div className="p-8 bg-[#F4F3EF]/50">
                <button 
                  onClick={() => setSelectedInterview(null)}
                  className="w-full py-4 bg-[#1B4DA0] text-white rounded-2xl font-bold text-sm hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/10"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
