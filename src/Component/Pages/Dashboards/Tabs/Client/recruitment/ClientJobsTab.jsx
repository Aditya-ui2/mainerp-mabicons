import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiChevronDown, FiChevronUp, FiPlus, FiSearch, FiRefreshCw, FiCalendar, FiX, FiZap, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Briefcase, FileText, Settings, DollarSign, MapPin, Clock, Users, Target, Calendar, AlignLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview, createRecruitmentPosition } from '../../../../service/api';

const StatusBadge = ({ status }) => {
  const config = {
    Open: 'bg-blue-50 text-blue-600 border border-blue-100',
    Urgent: 'bg-amber-50 text-amber-600 border border-amber-100',
    'In Progress': 'bg-slate-50 text-slate-500 border border-slate-100',
    Closed: 'bg-gray-50 text-gray-400 border border-gray-100',
    Hold: 'bg-amber-50 text-amber-500 border border-amber-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${config[status] || 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
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

export default function ClientJobsTab() {
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showAddJob, setShowAddJob] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [newJob, setNewJob] = useState({
    title: '', description: '', location: '', type: 'Full-time',
    salary: '', priority: 'Medium', openings: 1, experience: '', skills: '',
    deadline: '', requirements: '', responsibilities: '', roleType: '',
  });
  const [clientSkillInput, setClientSkillInput] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      setClientId(decoded.id);  
      const res = await getClientDashboardOverview(decoded.id);
      if (res?.success && res.data?.recruitment) {
        setPositions(res.data.recruitment.positions || []);
        setCandidates(res.data.recruitment.candidates || []);
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
        if (dateFilter === 'today') { const t = new Date(); t.setHours(0,0,0,0); return d >= t; }
        if (dateFilter === 'week') { const s = new Date(now); s.setDate(s.getDate() - s.getDay()); s.setHours(0,0,0,0); return d >= s; }
        if (dateFilter === 'month') { return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }
        if (dateFilter === 'prev-month') { const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1); const pe = new Date(now.getFullYear(), now.getMonth(), 0); return d >= pm && d <= pe; }
        if (dateFilter === 'quarter') { const qm = Math.floor(now.getMonth() / 3) * 3; return d >= new Date(now.getFullYear(), qm, 1) && d <= now; }
        if (dateFilter === 'custom') { const s = customStartDate ? new Date(customStartDate) : null; const e = customEndDate ? new Date(customEndDate) : null; if (s && d < s) return false; if (e) { e.setHours(23,59,59); if (d > e) return false; } return true; }
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

  return (
    <div className="space-y-6">
      {/* Detached Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Job Positions</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Manage and track all your active recruitment requirements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddJob(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] hover:bg-[#153b7a] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FiPlus className="w-5 h-5" strokeWidth="3" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-4 border border-[#E8E7E2] shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" />
            <input
              type="text"
              placeholder="Search by role, location or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-[#F4F3EF] border-0 rounded-2xl text-[#1A1A2E] placeholder:text-[#9B9BAD] focus:outline-none focus:ring-2 focus:ring-blue-100 font-bold transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="pl-10 pr-10 py-3 text-xs font-bold bg-[#F4F3EF] border-0 rounded-2xl text-[#1A1A2E] appearance-none outline-none cursor-pointer hover:bg-[#E8E7E2] transition-all min-w-[140px]"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="prev-month">Previous Month</option>
                <option value="quarter">This Quarter</option>
                <option value="custom">Custom Range</option>
              </select>
              <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B4DA0]" />
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9BAD] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="pl-10 pr-10 py-3 text-xs font-bold bg-[#F4F3EF] border-0 rounded-2xl text-[#1A1A2E] appearance-none outline-none cursor-pointer hover:bg-[#E8E7E2] transition-all min-w-[140px]"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Urgent">Urgent</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9BAD] pointer-events-none" />
            </div>

            <button
               onClick={fetchData}
               className="p-3 bg-[#F4F3EF] text-[#1B4DA0] rounded-2xl hover:bg-[#E8E7E2] transition-all active:scale-95 shadow-sm"
               title="Refresh Data"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Positions', count: filteredPositions?.length || 0, icon: FiBriefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Open', count: filteredPositions?.filter(p => p.status === 'Open').length || 0, icon: FiZap, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Urgent Needs', count: filteredPositions?.filter(p => p.status === 'Urgent').length || 0, icon: FiAlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Fulfilled', count: filteredPositions?.filter(p => p.status === 'Closed').length || 0, icon: FiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[24px] border border-[#E8E7E2] p-6 shadow-sm group hover:shadow-md transition-all cursor-default relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 ${s.bg} rounded-full -mr-8 -mt-8 opacity-40 group-hover:scale-110 transition-transform duration-500`} />
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <s.icon size={20} />
              </div>
              <p className="text-3xl font-extrabold text-[#1A1A2E] leading-none mb-1">{s.count}</p>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Job Modal — exact KAM-style overlay */}
      <AnimatePresence>
        {showAddJob && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddJob(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl"
            />

            {/* Modal Content Card */}
            <motion.div
              key="client-job-modal"
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
                     Create New Position
                   </h2>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">Client Portal</span>
                      <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                      <span className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px]">New Request</span>
                   </div>
                </div>
                <button
                  onClick={() => setShowAddJob(false)}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#1A1A2E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95 group shadow-sm"
                >
                  <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Column 1: Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-4 flex items-center gap-2">
                      <Briefcase size={14} /> Basic Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Job Title *</label>
                        <input type="text" value={newJob.title} onChange={e => setNewJob(f => ({ ...f, title: e.target.value }))}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] border border-transparent focus:border-[#1B4DA0]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Role Type *</label>
                        <div className="relative">
                          <select value={newJob.roleType || ''} onChange={e => setNewJob(f => ({ ...f, roleType: e.target.value }))}
                            className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] appearance-none pr-10"
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
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Location</label>
                        <input type="text" value={newJob.location} onChange={e => setNewJob(f => ({ ...f, location: e.target.value }))}
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
                        <select value={newJob.type} onChange={e => setNewJob(f => ({ ...f, type: e.target.value }))}
                          className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] appearance-none"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Priority</label>
                        <select value={newJob.priority} onChange={e => setNewJob(f => ({ ...f, priority: e.target.value }))}
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
                        <input type="text" value={newJob.salary} onChange={e => setNewJob(f => ({ ...f, salary: e.target.value }))}
                          placeholder="15-25 LPA"
                          className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Experience</label>
                        <input type="text" value={newJob.experience} onChange={e => setNewJob(f => ({ ...f, experience: e.target.value }))}
                          placeholder="3-5 yrs"
                          className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Openings</label>
                        <input type="number" value={newJob.openings} onChange={e => setNewJob(f => ({ ...f, openings: e.target.value }))} min="1"
                          className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Deadline</label>
                        <div className="relative">
                          <input type="date" value={newJob.deadline} onChange={e => setNewJob(f => ({ ...f, deadline: e.target.value }))}
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
                      <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Skills</label>
                      <div className="w-full bg-[#FAFAF8] rounded-2xl px-4 py-3 flex flex-wrap items-center gap-2 min-h-[52px] transition-all focus-within:bg-[#F0F2FF] cursor-text"
                        onClick={() => document.getElementById('client-skill-tag-input')?.focus()}>
                        {newJob.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-[#E5E5EA] rounded-full px-3 py-1.5 text-xs font-bold text-[#1A1A2E] shadow-sm">
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
                              const val = clientSkillInput.trim().replace(/,$/,'');
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

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Requirements (one per line)</label>
                        <textarea value={newJob.requirements} onChange={e => setNewJob(f => ({ ...f, requirements: e.target.value }))}
                          rows={4}
                          placeholder="Detailed requirements..."
                          className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Responsibilities (one per line)</label>
                        <textarea value={newJob.responsibilities} onChange={e => setNewJob(f => ({ ...f, responsibilities: e.target.value }))}
                          rows={4}
                          placeholder="Key responsibilities..."
                          className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 mb-2">Short Description</label>
                      <textarea value={newJob.description} onChange={e => setNewJob(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                        placeholder="Describe the role..."
                        className="w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#F0F2FF] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-[#F4F3EF] px-10 py-8 flex items-center justify-end gap-4">
                 <button 
                   onClick={() => setShowAddJob(false)}
                   className="px-8 py-4 text-sm font-bold text-[#6B6B7E] hover:text-[#1A1A2E] transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleAddJob}
                   disabled={submitting || !newJob.title.trim()}
                   className="px-10 py-4 bg-[#1A1A2E] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#2A2A3E] transition-all shadow-xl active:scale-95 disabled:opacity-50"
                 >
                   <FiPlus size={18} /> {submitting ? 'Creating...' : 'Create Position'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Positions List */}
      <div className="bg-white rounded-[32px] p-6 border border-[#E8E7E2] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            <FiBriefcase className="w-5 h-5 text-amber-500" /> Positions ({filteredPositions.length})
          </h2>
        </div>

        {filteredPositions.length === 0 ? (
          <p className="text-sm text-center py-12 text-[#9B9BAD]">No positions found</p>
        ) : (
          <div className="space-y-3">
            {filteredPositions.map(pos => {
              const isExpanded = expandedPosition === pos.id;
              const progress = pos.openings ? Math.round((pos.filled / pos.openings) * 100) : 0;
              const posCandidates = (candidates || []).filter(c => c.position === pos.title);

              return (
                <div key={pos.id} className="rounded-2xl border border-[#E8E7E2] bg-[#FAFAF8] overflow-hidden hover:shadow-sm transition-all">
                  <button
                    onClick={() => setExpandedPosition(isExpanded ? null : pos.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F4F3EF] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#1A1A2E] truncate">{pos.title}</span>
                        <StatusBadge status={pos.status} />
                        <PriorityBadge priority={pos.priority} />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#9B9BAD] font-medium">
                        {pos.location && <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{pos.location}</span>}
                        <span>{pos.type}</span>
                        <span>{pos.candidateCount} candidate{pos.candidateCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8E7E2" strokeWidth="3" />
                          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1B4DA0" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#1A1A2E]">{pos.filled}/{pos.openings}</span>
                      </div>
                      {isExpanded ? <FiChevronUp className="w-4 h-4 text-[#9B9BAD]" /> : <FiChevronDown className="w-4 h-4 text-[#9B9BAD]" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#E8E7E2] p-4">
                      {posCandidates.length > 0 ? (
                        <>
                          <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-3">Candidates in Pipeline</p>
                          <div className="space-y-2">
                            {posCandidates.map(c => (
                              <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-[#E8E7E2]">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-[10px] font-bold">
                                    {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </div>
                                  <span className="text-xs font-semibold text-[#1A1A2E]">{c.name}</span>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                                  {c.stage}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-center text-[#9B9BAD]">No candidates yet for this position</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
