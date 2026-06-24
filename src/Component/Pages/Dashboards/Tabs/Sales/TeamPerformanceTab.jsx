import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPhone, FiUserPlus, FiCalendar, FiAward, FiCheckCircle,
  FiBriefcase, FiSearch, FiStar, FiChevronRight, FiUsers, FiRefreshCw, FiDatabase
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getAllBDExecutives, getAllLeads } from '../../../service/api';

const TeamPerformanceTab = ({ fixedDepartment, notificationBell }) => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('dealsClosed');
  const [clientFilter, setClientFilter] = useState('All Client');
  const [deptFilter, setDeptFilter] = useState(fixedDepartment || 'All Regions');
  const [perfSearchQuery, setPerfSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({ filterType: 'all', year: new Date().getFullYear(), month: new Date().getMonth(), date: '' });

  const clientDropdownRef = useRef(null);
  const deptDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);
  const compactDateInputRef = useRef(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2024, 2025, 2026];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [execRes, leadsRes] = await Promise.all([getAllBDExecutives(), getAllLeads()]);

      // Parse executives
      let executives = [];
      if (Array.isArray(execRes)) executives = execRes;
      else if (Array.isArray(execRes?.data)) executives = execRes.data;
      else if (Array.isArray(execRes?.executives)) executives = execRes.executives;

      // Parse leads
      let leads = [];
      if (Array.isArray(leadsRes)) leads = leadsRes;
      else if (Array.isArray(leadsRes?.data)) leads = leadsRes.data;
      else if (Array.isArray(leadsRes?.data?.leads)) leads = leadsRes.data.leads;
      else if (Array.isArray(leadsRes?.leads)) leads = leadsRes.leads;

      // Map each executive with computed stats from leads
      const mapped = executives.map(exec => {
        const execName = exec.name || exec.fullName || exec.username || 'Unknown';
        const execLeads = leads.filter(l =>
          l.owner && l.owner.toLowerCase().trim() === execName.toLowerCase().trim()
        );

        const dealsClosed = execLeads.filter(l => l.status === 'Converted').length;
        const proposalsSent = execLeads.filter(l => l.status === 'Proposal' || l.status === 'Negotiation').length;
        const meetingsScheduled = execLeads.filter(l => l.status === 'Follow Up').length;
        const leadsGenerated = execLeads.length;
        // callsDone: use a field if exists, otherwise estimate from total meetings × 3
        const callsDone = exec.callsDone || (meetingsScheduled * 3 + leadsGenerated);

        return {
          id: exec.id || exec._id,
          name: execName,
          role: exec.role || exec.designation || exec.position || 'BD Executive',
          department: exec.department || exec.region || 'Sales',
          avatar: execName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          stats: { callsDone, leadsGenerated, meetingsScheduled, proposalsSent, dealsClosed }
        };
      });

      setTeamData(mapped);
    } catch (err) {
      console.error('Error fetching team performance data:', err);
      toast.error('Failed to load team performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) setShowClientDropdown(false);
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) setShowDeptDropdown(false);
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) setShowDateFilter(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilterLabel = () => {
    if (dateFilter.filterType === 'all') return 'All Time';
    if (dateFilter.filterType === 'last7days') return 'Last 7 Days';
    if (dateFilter.filterType === 'year') return `Year ${dateFilter.year}`;
    if (dateFilter.filterType === 'month') return `${months[dateFilter.month]} ${dateFilter.year}`;
    if (dateFilter.filterType === 'date') return dateFilter.date || 'Select Date';
    return 'Select Period';
  };

  const departments = ['All Regions', ...new Set(teamData.map(m => m.department).filter(Boolean))];

  const filteredData = teamData.filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(perfSearchQuery.toLowerCase()) ||
      (m.role || '').toLowerCase().includes(perfSearchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All Regions' || m.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const graphMetrics = [
    { key: 'callsDone', label: 'Total Calling', color: '#ef4444', icon: FiPhone },
    { key: 'leadsGenerated', label: 'Leads', color: '#8b5cf6', icon: FiUserPlus },
    { key: 'meetingsScheduled', label: 'Follow-Ups', color: '#3b82f6', icon: FiCalendar },
    { key: 'proposalsSent', label: 'Proposals', color: '#f59e0b', icon: FiAward },
    { key: 'dealsClosed', label: 'Deals Closed', color: '#10b981', icon: FiCheckCircle },
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } } };

  const renderAvatar = (m) => <span className="font-bold">{m?.avatar || '?'}</span>;

  const topKAMs = [...filteredData].sort((a, b) => (b.stats?.dealsClosed || 0) - (a.stats?.dealsClosed || 0));
  const fullTopKAMs = [...topKAMs];
  while (fullTopKAMs.length < 3) fullTopKAMs.push({ name: '---', stats: { dealsClosed: 0 }, avatar: '?' });

  const maxDeals = Math.max(...filteredData.map(m => m.stats?.dealsClosed || 0), 1);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiRefreshCw className="animate-spin text-[#1B4DA0] w-10 h-10" />
        <p className="text-[#9B9BAD] font-bold animate-pulse">Fetching Live Performance Data...</p>
      </div>
    );
  }

  if (!loading && teamData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center text-[#1B4DA0]">
          <FiDatabase size={32} />
        </div>
        <h3 className="text-xl font-bold text-[#1A1A2E]">No team members found</h3>
        <p className="text-[#6B6B7E] text-sm max-w-xs">Add BD executives to see their performance data here.</p>
        <button onClick={fetchData} className="mt-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm hover:bg-[#153a7a] transition-all shadow-lg">
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8" style={{ fontFamily: "'Calibri', sans-serif" }}>
      <style>{`input[type="date"]::-webkit-calendar-picker-indicator { display: none; -webkit-appearance: none; }`}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div className="text-left">
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Team Performance
          </motion.h1>
        </div>

        <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap relative z-[100]">
          {notificationBell}

          {/* Department Filter */}
          {!fixedDepartment && (
            <div className="relative" ref={deptDropdownRef}>
              <button
                onClick={() => { setShowDeptDropdown(p => !p); setShowClientDropdown(false); setShowDateFilter(false); }}
                className="px-4 py-2.5 bg-white border border-[#F4F3EF] text-[#1A1A2E] rounded-xl text-sm font-bold hover:border-[#E8E7E2] transition-all shadow-sm flex items-center gap-2 active:scale-95"
              >
                <FiUsers size={15} className="text-[#1B4DA0]" />
                <span className="whitespace-nowrap">{deptFilter}</span>
                <svg className={`w-3.5 h-3.5 ml-1 text-[#9B9BAD] transition-transform ${showDeptDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {showDeptDropdown && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-[#F4F3EF] z-[9999] overflow-hidden py-1.5">
                    {departments.map(dept => (
                      <button key={dept} onClick={() => { setDeptFilter(dept); setShowDeptDropdown(false); }}
                        className={`w-full px-5 py-2.5 text-left text-[13px] transition-colors ${deptFilter === dept ? 'bg-[#1B4DA0]/5 text-[#1B4DA0] font-bold' : 'text-[#4B4B5E] hover:bg-[#FAFAF8] font-medium'}`}>
                        {dept}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Date Filter */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              onClick={() => { setShowDateFilter(p => !p); setShowClientDropdown(false); }}
              className="px-5 py-2.5 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <FiCalendar size={15} />
              <span>{getFilterLabel()}</span>
              <svg className={`w-3.5 h-3.5 ml-1 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {showDateFilter && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#F4F3EF] z-[9999] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F4F3EF] bg-[#FAFAF8]">
                    <p className="font-bold text-[#1A1A2E] text-left text-sm">Select Time Period</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex gap-1 p-1 bg-[#F4F3EF] rounded-xl">
                      {['all', 'last7days', 'year', 'month', 'date'].map(type => (
                        <button key={type} onClick={() => setDateFilter({ ...dateFilter, filterType: type })}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${dateFilter.filterType === type ? 'bg-white text-[#1B4DA0] shadow-sm' : 'text-[#9B9BAD] hover:text-[#6B6B7E]'}`}>
                          {type === 'all' ? 'All' : type === 'last7days' ? 'Last 7' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    {(dateFilter.filterType === 'year' || dateFilter.filterType === 'month' || dateFilter.filterType === 'date') && (
                      <select value={dateFilter.year} onChange={e => setDateFilter({ ...dateFilter, year: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] bg-white focus:outline-none cursor-pointer">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    )}
                    {(dateFilter.filterType === 'month') && (
                      <select value={dateFilter.month} onChange={e => setDateFilter({ ...dateFilter, month: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] bg-white focus:outline-none cursor-pointer">
                        {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                      </select>
                    )}
                    <button onClick={() => setShowDateFilter(false)}
                      className="w-full py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all">
                      Apply Filter
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Top 3 Leaderboard */}
      <motion.div variants={itemVariants}>
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-8 text-left">
            <h3 className="text-lg font-bold text-[#1A1A2E]">Top Performers</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            {/* 2nd Place */}
            <div className="flex items-center gap-5 group py-5 px-8 bg-gradient-to-r from-[#1B4DA0]/5 to-[#1B4DA0]/10 rounded-[24px] border-2 border-[#1B4DA0]/10 relative cursor-pointer hover:border-[#1B4DA0]/25 transition-all shadow-sm">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#1B4DA0] text-base border border-[#F4F3EF] shadow-lg">
                  {renderAvatar(fullTopKAMs[1])}
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-400 to-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-white font-black text-xs shadow-lg">2</div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#1A1A2E]">{fullTopKAMs[1].name}</p>
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-wider">{fullTopKAMs[1].stats?.dealsClosed || 0} Deals</p>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex items-center gap-5 group py-5 px-8 bg-gradient-to-r from-[#1B4DA0]/5 to-[#1B4DA0]/10 rounded-[24px] border-2 border-[#1B4DA0]/10 relative cursor-pointer hover:border-[#1B4DA0]/25 transition-all shadow-sm">
              <div className="relative">
                <div className="w-[72px] h-[72px] rounded-[22px] bg-white flex items-center justify-center text-[#1B4DA0] text-2xl font-bold border-[3px] border-white shadow-xl ring-4 ring-[#1B4DA0]/5">
                  {renderAvatar(fullTopKAMs[0])}
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-400 to-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-white font-black text-xs shadow-lg">1</div>
              </div>
              <div className="text-left">
                <p className="text-[17px] font-bold text-[#1A1A2E] leading-tight">{fullTopKAMs[0].name}</p>
                <p className="text-xs font-black text-[#1B4DA0] uppercase tracking-widest mt-0.5">{fullTopKAMs[0].stats?.dealsClosed || 0} Deals</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <FiStar size={11} className="text-amber-500 fill-amber-500" />
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Top Performer</span>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex items-center gap-4 group cursor-pointer hover:bg-[#FAFAF8] p-4 rounded-2xl transition-all">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#F4F3EF] flex items-center justify-center text-[#1A1A2E] text-base border border-[#E8E7E2]">
                  {renderAvatar(fullTopKAMs[2])}
                </div>
                <div className="absolute -top-1.5 -right-1.5 bg-amber-700 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white font-black text-[10px] shadow-sm">3</div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#1A1A2E]">{fullTopKAMs[2].name}</p>
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-wider">{fullTopKAMs[2].stats?.dealsClosed || 0} Deals</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Rankings Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-[#F4F3EF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-left">
            <h2 className="text-lg font-bold text-[#1A1A2E]">Performance Rankings</h2>
            <p className="text-[11px] font-medium text-[#9B9BAD]">{filteredData.length} team members</p>
          </div>
          <div className="bg-[#F4F3EF] rounded-2xl px-4 py-2.5 flex items-center gap-2 min-w-[220px]">
            <FiSearch size={15} className="text-[#9B9BAD] flex-shrink-0" />
            <input type="text" value={perfSearchQuery} onChange={e => setPerfSearchQuery(e.target.value)}
              placeholder="Search member..." className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-4 text-[#1B4DA0]">
                <FiDatabase size={24} />
              </div>
              <p className="text-md font-bold text-[#1A1A2E] mb-1">No members found</p>
              <p className="text-xs text-[#6B6B7E]">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4F3EF]">
                  <th className="py-4 px-8 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Sales Representative</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Deals Closed</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Progress</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Leads</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Proposals</th>
                  <th className="py-4 px-8 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3EF]">
                {filteredData.map(m => {
                  const pct = Math.min(Math.round(((m.stats?.dealsClosed || 0) / maxDeals) * 100), 100);
                  return (
                    <tr key={m.id} className="hover:bg-[#FAFAF8] transition-all group cursor-pointer">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-[42px] h-[42px] rounded-[14px] bg-[#F0F7FF] flex items-center justify-center text-[13px] font-bold text-[#1B4DA0] border border-[#E0E7FF] flex-shrink-0">
                            {renderAvatar(m)}
                          </div>
                          <div className="text-left">
                            <p className="text-[14px] font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{m.name}</p>
                            <p className="text-[11px] font-medium text-[#9B9BAD]">{m.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[15px] font-black text-[#1A1A2E]">{m.stats?.dealsClosed || 0}</span>
                        <span className="text-[11px] font-bold text-[#9B9BAD] ml-1">/ {maxDeals}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                          <div className="w-full h-1.5 bg-[#F4F3EF] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-[#1B4DA0] rounded-full" />
                          </div>
                          <span className="text-[10px] font-black text-[#1B4DA0]">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center text-sm font-bold text-[#4B4B5E]">{m.stats?.leadsGenerated || 0}</td>
                      <td className="px-6 py-5 text-center text-sm font-bold text-[#4B4B5E]">{m.stats?.proposalsSent || 0}</td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2.5 bg-[#F4F3EF] text-[#1B4DA0] rounded-xl hover:bg-[#1B4DA0] hover:text-white transition-all">
                          <FiChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeamPerformanceTab;
