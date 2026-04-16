import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUsers, FiMail, FiPhone, FiMapPin, FiCalendar, FiChevronRight, FiFilter, FiUser, FiBriefcase, FiX, FiDownload, FiClock, FiTag } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
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
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Shortlisted Candidates</h1>
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
                <th className="px-6 py-4 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Position</th>
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
                      onClick={() => setSelectedCandidate(c)}
                      className="hover:bg-[#FAFAF9] transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-sm font-black shadow-inner">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#1A1A2E] truncate font-jakarta group-hover:text-[#1B4DA0] transition-colors">{c.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5"><FiBriefcase className="text-blue-500" /> {c.positionTitle || c.position || '—'}</span>
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
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[2000]"
              />

              {/* Sidebar */}
              <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-full max-w-[580px] bg-white shadow-2xl z-[2001] flex flex-col overflow-hidden"
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
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${stageKeys.find(k => STAGE_CONFIG[k].label === selectedCandidate.stage) ? STAGE_CONFIG[stageKeys.find(k => STAGE_CONFIG[k].label === selectedCandidate.stage)].bg : 'bg-slate-100 text-slate-600'}`}>
                          {selectedCandidate.stage}
                        </span>
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">• {selectedCandidate.positionTitle || selectedCandidate.position?.title || 'Unknown Position'}</span>
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
    </div>
  );
}
