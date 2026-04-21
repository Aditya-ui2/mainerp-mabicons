import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiChevronDown, FiChevronUp, FiPlus, FiSearch, FiRefreshCw, FiCalendar, FiX, FiZap, FiAlertCircle, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import { Briefcase, FileText, Settings, DollarSign, MapPin, Clock, Users, Target, Calendar, AlignLeft, Search } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview, createRecruitmentPosition } from '../../../../service/api';

const StatusBadge = ({ status }) => {
  const config = {
    Open: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Urgent: 'bg-rose-50 text-rose-600 border-rose-100',
    'In Progress': 'bg-blue-50 text-[#0D47A1] border-blue-100',
    Closed: 'bg-slate-50 text-slate-400 border-slate-100',
    Hold: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit border ${config[status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = {
    High: 'bg-red-50 text-red-500 border border-red-200',
    Medium: 'bg-amber-50 text-amber-500 border border-amber-200',
    Low: 'bg-slate-50 text-slate-400 border border-slate-200',
    Urgent: 'bg-red-100 text-red-600 border border-red-300',
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
            <span className="text-[10px] font-bold text-[#0D47A1] uppercase tracking-[3px] font-jakarta">{job.client || 'Engineering'}</span>
            <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
            <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] font-jakarta">{job.type || 'Full-time'}</span>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 shadow-sm">
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar font-jakarta">
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

          <div className="pt-6 border-t border-[#F4F3EF] text-left">
            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-2 text-left">Job Description</span>
            <p className="text-sm text-[#4B4B5E] leading-relaxed font-medium text-left">
              {job.description || <span className="italic text-[#9B9BAD]">No description provided</span>}
            </p>
          </div>

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
      </div>

      {/* Footer Actions */}

    </div>
  );
};

export default function ClientJobsTab() {
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showAddJob, setShowAddJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [newJob, setNewJob] = useState({
    title: '', description: '', location: '', type: 'Full-time',
    salary: '', priority: 'Medium', openings: 1, experience: '', skills: '',
    deadline: '', requirements: '', responsibilities: '', roleType: '',
  });
  const [clientSkillInput, setClientSkillInput] = useState('');
  const [currentClientName, setCurrentClientName] = useState('Client');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      setClientId(decoded.id);

      // Fetch fresh client details to get the company name
      const res = await getClientDashboardOverview(decoded.id);

      if (res?.success) {
        if (res.data?.client?.companyName) {
          setCurrentClientName(res.data.client.companyName);
        }
        if (res.data?.recruitment) {
          setPositions(res.data.recruitment.positions || []);
          setCandidates(res.data.recruitment.candidates || []);
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredPositions = useMemo(() => {
    const now = new Date();
    return (positions || [])
      .filter(p => filterStatus === 'all' || p.status === filterStatus)
      .filter(p => !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(p => {
        if (dateFilter === 'all') return true;
        const d = new Date(p.postedDate || p.createdAt);
        if (isNaN(d)) return true;
        if (dateFilter === 'today') { const t = new Date(); t.setHours(0, 0, 0, 0); return d >= t; }
        if (dateFilter === 'week') { const s = new Date(now); s.setDate(s.getDate() - s.getDay()); s.setHours(0, 0, 0, 0); return d >= s; }
        if (dateFilter === 'month') { return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }
        if (dateFilter === 'prev-month') { const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1); const pe = new Date(now.getFullYear(), now.getMonth(), 0); return d >= pm && d <= pe; }
        if (dateFilter === 'quarter') { const qm = Math.floor(now.getMonth() / 3) * 3; return d >= new Date(now.getFullYear(), qm, 1) && d <= now; }
        if (dateFilter === 'custom') { const s = customStartDate ? new Date(customStartDate) : null; const e = customEndDate ? new Date(customEndDate) : null; if (s && d < s) return false; if (e) { e.setHours(23, 59, 59); if (d > e) return false; } return true; }
        return true;
      });
  }, [positions, filterStatus, searchQuery, dateFilter, customStartDate, customEndDate]);

  const handleAddJob = async () => {
    if (!newJob.title.trim()) return;
    setSubmitting(true);
    try {
      const positionData = {
        title: newJob.title,
        clientId,
        client: currentClientName, // Linking current client name
        description: newJob.description,
        location: newJob.location || 'Remote',
        type: newJob.type,
        salary: newJob.salary,
        status: 'Open',
        priority: newJob.priority,
        openings: parseInt(newJob.openings) || 1,
        skills: newJob.skills ? newJob.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        experience: newJob.experience,
        deadline: newJob.deadline || undefined,
        requirements: newJob.requirements ? newJob.requirements.split('\n').filter(Boolean) : [],
        responsibilities: newJob.responsibilities ? newJob.responsibilities.split('\n').filter(Boolean) : [],
        roleType: newJob.roleType,
        postedByClient: true, // Internal flag for Admin visibility
        departmentTeamId: '60de4380-0140-49ff-b26d-a8d06333af11', // Explicitly linking to Admin Sachin (Recruitment Head)
      };
      await createRecruitmentPosition(positionData);
      setShowAddJob(false);
      setNewJob({ title: '', description: '', location: '', type: 'Full-time', salary: '', priority: 'Medium', openings: 1, experience: '', skills: '', deadline: '', requirements: '', responsibilities: '', roleType: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create position:', err);
      alert(err?.message || 'Failed to create position');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading positions...</p>
      </div>
    );
  }

  const handleBulkStatusUpdate = (newStatus) => {
    setPositions(prev => prev.map(p => selectedPositions.includes(p.id) ? { ...p, status: newStatus } : p));
    setSelectedPositions([]);
  };

  const handleBulkDelete = () => {
    setPositions(prev => prev.filter(p => !selectedPositions.includes(p.id)));
    setSelectedPositions([]);
  };

  return (
    <div className="space-y-6 -mt-6">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
          z-index: 10;
        }
      `}</style>
      {/* Detached Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">

          <div className="flex flex-col justify-center items-start">

            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Job Openings</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">

          <button
            onClick={() => setShowAddJob(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-[#0D47A1]/20 active:scale-95"
          >
            <FiPlus className="w-4 h-4" strokeWidth="3" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>


      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 mt-8 mb-5 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, client or location..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative">
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="bg-[#F4F3EF] text-[10px] font-black uppercase tracking-[2px] text-[#1A1A2E] rounded-2xl pl-6 pr-12 py-3.5 outline-none border-0 cursor-pointer appearance-none min-w-[160px] hover:bg-[#EEEFED] transition-all"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="prev-month">Previous Month</option>
            <option value="quarter">This Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
          <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#F4F3EF] text-[10px] font-black uppercase tracking-[2px] text-[#1A1A2E] rounded-2xl pl-6 pr-12 py-3.5 outline-none border-0 cursor-pointer appearance-none min-w-[160px] hover:bg-[#EEEFED] transition-all"
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
          <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
        </div>
      </div>


      {dateFilter === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-3 mt-4 pt-4 border-t border-[#F4F3EF]"
        >
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">From</label>
            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-xs px-3 py-2 rounded-xl border border-[#E8E7E2] bg-[#FAFAF8] outline-none font-bold" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">To</label>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-xs px-3 py-2 rounded-xl border border-[#E8E7E2] bg-[#FAFAF8] outline-none font-bold" />
          </div>
        </motion.div>
      )}




      {/* Add Job Modal — expert-level portal rendering */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showAddJob && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
              {/* Backdrop Blur Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddJob(false)}
                className="absolute inset-0 backdrop-blur-xl"
                style={{ backgroundColor: '#1A1A2E66' }}
              />

              {/* Modal Content Card */}
              <motion.div
                key="client-job-modal"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[44px] w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.25)] relative z-[2001] flex flex-col animate-in zoom-in-95 duration-300 border border-white/20"
              >
                {/* Modal Header */}
                <div className="sticky top-0 z-20 px-10 pt-10 pb-8 bg-white/80 backdrop-blur-md border-b border-[#F4F3EF] text-left">
                  <div className="relative">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-syne"> Create New Position</h1>

                    <button
                      onClick={() => setShowAddJob(false)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-[#FAFAF8] text-[#1A1A2E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 group shadow-sm border border-[#F4F3EF]"
                    >
                      <FiX size={20} className="transition-transform duration-300" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                  <div className="space-y-6">
                    {/* Row 1: Job Title */}
                    <div>
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Job Title *</label>
                      <input type="text" value={newJob.title} onChange={e => setNewJob(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white focus:border-[#1B4DA0]/20"
                      />
                    </div>

                    {/* Row 2: Role Type & Client/Company */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Role Type *</label>
                        <div className="relative">
                          <select value={newJob.roleType || ''} onChange={e => setNewJob(f => ({ ...f, roleType: e.target.value }))}
                            className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white appearance-none pr-10"
                          >
                            <option value="">Select Role Category</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Operations">Operations</option>
                            <option value="Finance">Finance</option>
                            <option value="HR">HR</option>
                            <option value="Product">Product</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Other">Other</option>
                          </select>
                          <FiChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Client/Company</label>
                        <div className="relative group">
                          <div className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1B4DA0] outline-none transition-all flex items-center justify-between shadow-inner">
                            <span>{currentClientName}</span>
                            <div className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-100">
                              Auto-Linked
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Location */}
                    <div>
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Location</label>
                      <input type="text" value={newJob.location} onChange={e => setNewJob(f => ({ ...f, location: e.target.value }))}
                        placeholder="e.g. Bangalore, Remote"
                        className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white"
                      />
                    </div>

                    {/* Row 4: Type & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Type</label>
                        <div className="relative">
                          <select value={newJob.type} onChange={e => setNewJob(f => ({ ...f, type: e.target.value }))}
                            className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white appearance-none pr-10"
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                          </select>
                          <FiChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Priority</label>
                        <div className="relative">
                          <select value={newJob.priority} onChange={e => setNewJob(f => ({ ...f, priority: e.target.value }))}
                            className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white appearance-none pr-10"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                          <FiChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Row 5: Salary & Experience */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Salary Range</label>
                        <input type="text" value={newJob.salary} onChange={e => setNewJob(f => ({ ...f, salary: e.target.value }))}
                          placeholder="e.g. 15-25 LPA"
                          className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Experience</label>
                        <input type="text" value={newJob.experience} onChange={e => setNewJob(f => ({ ...f, experience: e.target.value }))}
                          placeholder="e.g. 3-5 Years"
                          className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Row 6: Openings & Deadline */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">No. of Openings</label>
                        <input type="number" value={newJob.openings} onChange={e => setNewJob(f => ({ ...f, openings: e.target.value }))} min="1"
                          className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Deadline</label>
                        <div className="relative">
                          <input type="date" value={newJob.deadline} onChange={e => setNewJob(f => ({ ...f, deadline: e.target.value }))}
                            className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white cursor-pointer"
                          />
                          <FiCalendar size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div>
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Required Skills</label>
                      <div className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[20px] px-4 py-3 flex flex-wrap items-center gap-2 min-h-[56px] transition-all focus-within:bg-white cursor-text"
                        onClick={() => document.getElementById('client-skill-tag-input')?.focus()}>
                        {newJob.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-[#E5E5EA] rounded-full px-3 py-1 text-xs font-bold text-[#1A1A2E] shadow-sm animate-in fade-in zoom-in-95 duration-200">
                            {skill}
                            <button type="button" onClick={(e) => { e.stopPropagation(); const updated = newJob.skills.split(',').map(s => s.trim()).filter(Boolean).filter((_, i) => i !== idx).join(', '); setNewJob(f => ({ ...f, skills: updated })); }}
                              className="ml-0.5 text-[#9B9BAD] hover:text-red-500 transition-colors text-sm leading-none font-bold">&times;</button>
                          </span>
                        ))}
                        <input id="client-skill-tag-input" type="text" value={clientSkillInput}
                          onChange={e => setClientSkillInput(e.target.value)}
                          onKeyDown={e => {
                            if ((e.key === ' ' || e.key === 'Enter' || e.key === ',') && clientSkillInput.trim()) {
                              e.preventDefault();
                              const val = clientSkillInput.trim().replace(/,$/, '');
                              if (val) {
                                const existing = newJob.skills.split(',').map(s => s.trim()).filter(Boolean);
                                if (!existing.some(s => s.toLowerCase() === val.toLowerCase())) {
                                  setNewJob(f => ({ ...f, skills: existing.length ? existing.join(', ') + ', ' + val : val }));
                                }
                              }
                              setClientSkillInput('');
                            } else if (e.key === 'Backspace' && !clientSkillInput) {
                              const existing = newJob.skills.split(',').map(s => s.trim()).filter(Boolean);
                              if (existing.length) {
                                setNewJob(f => ({ ...f, skills: existing.slice(0, -1).join(', ') }));
                              }
                            }
                          }}
                          placeholder={newJob.skills ? 'Add more...' : 'Type a skill & press space'}
                          className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm font-bold text-[#1A1A2E] placeholder:text-[#9B9BAD]/50 py-1"
                        />
                      </div>
                    </div>

                    {/* Requirements & Responsibilities */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Requirements (one per line)</label>
                        <textarea value={newJob.requirements} onChange={e => setNewJob(f => ({ ...f, requirements: e.target.value }))}
                          rows={4}
                          placeholder="Detailed requirements..."
                          className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[24px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Responsibilities (one per line)</label>
                        <textarea value={newJob.responsibilities} onChange={e => setNewJob(f => ({ ...f, responsibilities: e.target.value }))}
                          rows={4}
                          placeholder="Key responsibilities..."
                          className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[24px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white resize-none"
                        />
                      </div>
                    </div>

                    {/* Short Description */}
                    <div>
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Job Description</label>
                      <textarea value={newJob.description} onChange={e => setNewJob(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                        placeholder="Describe the role..."
                        className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-[24px] px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-[#F4F3EF] px-10 py-8 flex items-center justify-end gap-4">
                  <button
                    onClick={() => setShowAddJob(false)}
                    className="px-8 py-5 text-sm font-bold text-[#6B6B7E] hover:text-[#1A1A2E] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddJob}
                    disabled={submitting || !newJob.title.trim()}
                    className="flex-[2] bg-[#0D47A1] text-white py-5 px-10 rounded-full text-[11px] font-bold uppercase tracking-[2px] flex items-center justify-center transition-all shadow-xl shadow-[#0D47A1]/20 active:scale-95 disabled:opacity-70 min-w-[317px]"
                  >
                    {submitting ? 'Creating...' : '+ Create Position'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Positions Table Interface */}
      <div className="bg-white rounded-[24px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#F4F3EF]">
                <th className="px-8 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer"
                    checked={selectedPositions.length === filteredPositions.length && filteredPositions.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPositions(filteredPositions.map(p => p.id));
                      else setSelectedPositions([]);
                    }}
                  />
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Position</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-center">Posted</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-center">Applicants</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredPositions.length > 0 ? filteredPositions.map((pos) => (
                <tr key={pos.id} onClick={() => setSelectedJob(pos)} className="hover:bg-[#F8FAFF] transition-all duration-300 group cursor-pointer">
                  <td className="px-8 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer"
                      checked={selectedPositions.includes(pos.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (selectedPositions.includes(pos.id)) {
                          setSelectedPositions(selectedPositions.filter(id => id !== pos.id));
                        } else {
                          setSelectedPositions([...selectedPositions, pos.id]);
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-left">
                    <div className="flex flex-col items-start justify-center">
                      <span className="text-sm font-bold text-[#1A1A2E]">{pos.title}</span>
                      <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest flex items-center justify-start gap-1.5 mt-0.5 text-left">
                        <MapPin size={10} className="text-[#9B9BAD]" /> {pos.location || 'Remote'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={pos.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-[#94a3b8]">
                        {new Date(pos.postedDate || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[13px] font-black text-[#1A1A2E]">{pos.candidateCount || 0}</span>
                      <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[1px] ml-0.5">APPLICANTS</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 bg-white text-[#9B9BAD] group-hover:bg-[#EEF2FB] group-hover:text-[#1B4DA0] rounded-xl transition-all shadow-sm border border-[#F4F3EF] group-hover:border-[#1B4DA0]/20 active:scale-95">
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No positions found Matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selection Action Bar (Snackbar) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedPositions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 100, x: "-50%" }}
              className="fixed bottom-10 left-1/2 z-[9999] px-6 py-4 bg-[#1A1A2E]/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 border border-white/10"
            >
              <div className="flex items-center gap-4 pr-6 border-r border-white/10 shrink-0">
                <span className="w-6 h-6 flex items-center justify-center bg-[#1B4DA0] rounded-lg text-white text-[10px] font-black shadow-lg shadow-[#1B4DA0]/20">
                  {selectedPositions.length}
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">Positions Selected</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <button onClick={() => handleBulkStatusUpdate('Hold')} className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#9B9BAD] hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 active:scale-95 whitespace-nowrap">
                  Mark As Hold
                </button>
                <button onClick={() => handleBulkStatusUpdate('Open')} className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-100 bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap">
                  Mark As Open
                </button>
                <button onClick={() => handleBulkStatusUpdate('Urgent')} className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-black bg-amber-400 hover:bg-amber-500 transition-all shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap">
                  Mark As Urgent
                </button>
                <button onClick={() => handleBulkStatusUpdate('Closed')} className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10 hover:bg-white/10 transition-all active:scale-95 whitespace-nowrap">
                  Mark As Complete
                </button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button onClick={handleBulkDelete} className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95 whitespace-nowrap">
                  Delete Selected
                </button>
              </div>
              <button onClick={() => setSelectedPositions([])} className="w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-xl bg-white/5 hover:bg-red-500 hover:text-white transition-all text-[#9B9BAD]">
                <FiX size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Right Side Drawer for Job Details */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedJob && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedJob(null)}
                className="fixed inset-0 backdrop-blur-xl z-[9999]"
                style={{ backgroundColor: '#1A1A2E66' }}
              />

              {/* Sliding Panel */}
              <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-[698px] bg-white shadow-2xl z-[10000] border-l border-[#F4F3EF] flex flex-col overflow-hidden"
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
    </div>
  );
}
