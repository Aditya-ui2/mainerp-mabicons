import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUsers, FiMail, FiPhone, FiMapPin, FiCalendar, FiChevronRight, FiFilter, FiUser, FiBriefcase } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview } from '../../../../service/api';

const STAGE_CONFIG = {
  screening: { label: 'Screening', bg: 'bg-slate-100 text-slate-600' },
  phoneInterview: { label: 'Phone Interview', bg: 'bg-yellow-50 text-yellow-600' },
  technical: { label: 'Technical Round', bg: 'bg-amber-50 text-amber-600' },
  hrRound: { label: 'HR Round', bg: 'bg-orange-50 text-orange-600' },
  clientInterview: { label: 'Client Interview', bg: 'bg-orange-50 text-orange-600' },
  offerSent: { label: 'Offer Sent', bg: 'bg-purple-50 text-purple-600' },
  joined: { label: 'Joined', bg: 'bg-blue-50 text-blue-600' },
  rejected: { label: 'Rejected', bg: 'bg-gray-50 text-gray-500' },
};

const stageKeys = Object.keys(STAGE_CONFIG);

export default function ClientCandidatesTab() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = jwtDecode(token);
        const res = await getClientDashboardOverview(decoded.id);
        if (res?.success && res.data?.recruitment) setCandidates(res.data.recruitment.candidates || []);
      } catch (err) {
        console.error('Failed to load candidates:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = (candidates || [])
    .filter(c => stageFilter === 'all' || c.stage === STAGE_CONFIG[stageFilter]?.label)
    .filter(c => !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || (c.positionTitle || c.position)?.toLowerCase().includes(searchQuery.toLowerCase()));

  const stageCounts = (candidates || []).reduce((acc, c) => {
    const key = stageKeys.find(k => STAGE_CONFIG[k].label === c.stage) || 'screening';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-400 font-syne tracking-widest uppercase">Cataloging Talent...</p>
      </div>
    );
  }

  return (
     <div className="p-0 min-h-screen bg-[#FDFDFD] text-left" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Talent Pool</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Review and manage candidates across all hiring stages</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#F4F3EF] rounded-[28px] p-3 mb-10 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] bg-[#F4F3EF] rounded-2xl px-6 h-[56px] flex items-center gap-4">
            <FiSearch size={20} className="text-[#9B9BAD]" />
            <input
              type="text"
              placeholder="Search by candidate name or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD]/60 outline-none w-full font-bold"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 invisible-scrollbar">
            <button
              onClick={() => setStageFilter('all')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                stageFilter === 'all'
                  ? 'bg-[#1A1A2E] text-white shadow-xl shadow-gray-400/20'
                  : 'bg-white text-[#9B9BAD] border border-[#F4F3EF] hover:bg-[#F4F3EF]'
              }`}
            >
              All ({candidates?.length || 0})
            </button>
            {stageKeys.filter(k => k !== 'rejected' && k !== 'joined').map(key => (
              <button
                key={key}
                onClick={() => setStageFilter(key)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  stageFilter === key
                    ? 'bg-[#1B4DA0] text-white shadow-xl shadow-blue-500/20'
                    : 'bg-white text-[#9B9BAD] border border-[#F4F3EF] hover:bg-[#F4F3EF]'
                }`}
              >
                {STAGE_CONFIG[key].label} ({stageCounts[key] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between">
            <h2 className="text-sm font-black text-[#1A1A2E] uppercase tracking-[2px] flex items-center gap-2">
               <FiUsers className="text-[#1B4DA0]" /> Active Registry
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#9B9BAD] uppercase">
                Showing {filtered.length} Applications
            </div>
        </div>

        <div className="overflow-x-auto invisible-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9]">
                <th className="px-8 py-4 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Candidate Profile</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Position & ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Current Stage</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Last Activity</th>
                <th className="px-8 py-4 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-16 h-16 rounded-3xl bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD]">
                         <FiUser size={24} />
                       </div>
                       <p className="text-sm font-bold text-[#9B9BAD]">Zero candidate findings</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const stageKey = stageKeys.find(k => STAGE_CONFIG[k].label === c.stage);
                  const stageBg = stageKey ? STAGE_CONFIG[stageKey].bg : 'bg-slate-100 text-slate-600';
                  const initials = c.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '??';
                  
                  return (
                    <motion.tr 
                      layout
                      key={c.id} 
                      className="hover:bg-[#FAFAF9] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-sm font-black shadow-inner">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#1A1A2E] truncate font-jakarta group-hover:text-[#1B4DA0] transition-colors">{c.name}</p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-[#9B9BAD]">
                               <span className="flex items-center gap-1"><FiMail /> {c.email || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5"><FiBriefcase className="text-blue-500" /> {c.positionTitle || c.position || '—'}</span>
                          <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest">ID: {c.applicationId?.slice(-6) || 'CAND-889'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${stageBg} border border-white/20 shadow-sm`}>
                          {c.stage}
                        </span>
                      </td>
                      <td className="px-6 py-6 font-jakarta">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-[#1A1A2E]">{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Today'}</span>
                           <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-0.5">Interaction Log</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-3 bg-[#F4F3EF] hover:bg-[#1A1A2E] hover:text-white rounded-xl transition-all duration-300">
                          <FiChevronRight size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
