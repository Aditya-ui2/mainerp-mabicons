import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUsers, FiMail, FiPhone, FiMapPin, FiCalendar, FiChevronRight, FiChevronDown, FiFilter, FiUser, FiBriefcase, FiX, FiDownload, FiClock, FiTag, FiFileText, FiExternalLink } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview, getShortlistedCandidates } from '../../../../service/api';

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

export default function ClientCandidatesTab({ shortlistedOnly = false }) {
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
        
        if (shortlistedOnly) {
          const res = await getShortlistedCandidates({ clientId: decoded.id });
          if (res && res.data) {
            const normalized = res.data.map(item => ({
              id: item._id || item.id,
              name: item.name,
              positionTitle: item.position?.title || item.positionTitle || item.position || '—',
              stage: item.stage || item.status || 'Shortlisted',
              experience: item.experience,
              location: item.location,
              skills: item.skills,
              currentSalary: item.currentSalary,
              expectedSalary: item.expectedSalary,
              ...item
            }));
            setCandidates(normalized);
          }
        } else {
          const res = await getClientDashboardOverview(decoded.id);
          if (res?.success && res.data?.recruitment) {
            setCandidates(res.data.recruitment.candidates || []);
          }
        }
      } catch (err) {
        console.error('Failed to load candidates:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [shortlistedOnly]);

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
    <div className="space-y-6 animate-in fade-in duration-500 -mt-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
            Shortlisted Candidates
          </h1>
        </div>
        <div className="flex gap-2">
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
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-[#F4F3EF] text-[10px] font-black uppercase tracking-[2px] text-[#1A1A2E] rounded-2xl pl-6 pr-12 py-3.5 outline-none border-0 cursor-pointer appearance-none min-w-[160px] hover:bg-[#EEEFED] transition-all"
          >
            <option value="all">All Stages</option>
            {stageKeys.map(k => (
              <option key={k} value={k}>{STAGE_CONFIG[k].label}</option>
            ))}
          </select>
          <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
        </div>
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-[24px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#F4F3EF]">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Candidate</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Position</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-3xl bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD]">
                        <FiUser size={24} />
                      </div>
                      <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">Zero candidate findings</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const stageKey = stageKeys.find(k => STAGE_CONFIG[k].label === c.stage);
                  const stageBg = stageKey ? STAGE_CONFIG[stageKey].bg : 'bg-slate-100 text-slate-600';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className="hover:bg-[#F8FAFF] transition-all duration-300 group cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#1A1A2E]">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold text-[#1A1A2E]">{c.positionTitle || c.position || '—'}</span>
                          <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                            <FiBriefcase size={10} className="text-[#1B4DA0]" /> Corporate Opening
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${stageBg}`}>
                          {c.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button className="p-2.5 bg-white text-[#9B9BAD] group-hover:bg-[#EEF2FB] group-hover:text-[#1B4DA0] rounded-xl border border-[#F4F3EF] group-hover:border-[#1B4DA0]/20 transition-all shadow-sm active:scale-95">
                          <FiChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
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
                className="fixed inset-0 backdrop-blur-xl z-[9999]"
                style={{ backgroundColor: '#1A1A2E66' }}
              />

              {/* Sidebar */}
              <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-full max-w-[580px] bg-white shadow-2xl z-[10000] flex flex-col overflow-hidden border-l border-[#F4F3EF]"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
                  <div className="flex items-center gap-4">
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

                  {/* Joining Details if stage is Joined or has joining details */}
                  {(selectedCandidate.stage === 'Joined' || selectedCandidate.stage === 'Offer Sent' || selectedCandidate.stage === 'Offer Accepted') && (selectedCandidate.joiningDate || selectedCandidate.joiningStatus) && (
                    <div className="pt-8 border-t border-[#F4F3EF] grid grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Joining Status</span>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block ${
                          selectedCandidate.joiningStatus === 'Joined'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : selectedCandidate.joiningStatus === 'Not Joined'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : selectedCandidate.joiningStatus === 'Rescheduled'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {selectedCandidate.joiningStatus || 'Pending'}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Joining Date</span>
                        <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                          <FiCalendar className="text-[#1B4DA0]" /> {selectedCandidate.joiningDate ? new Date(selectedCandidate.joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resume Section */}
                  {selectedCandidate.cvUrl && (
                    <div className="pt-8 border-t border-[#F4F3EF]">
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-4">Resume</span>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1B4DA0] to-indigo-600 text-white">
                              <FiFileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{selectedCandidate.cvFileName || 'Candidate_CV.pdf'}</p>
                              <p className="text-xs text-slate-500">Click to view or download</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`${selectedCandidate.cvUrl}?token=${localStorage.getItem('token')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1B4DA0] rounded-xl hover:bg-[#153e82] transition-all"
                            >
                              <FiExternalLink className="w-4 h-4" /> View
                            </a>
                            <a
                              href={`${selectedCandidate.cvUrl}?token=${localStorage.getItem('token')}`}
                              download
                              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all"
                              title="Download"
                            >
                              <FiDownload className="w-4 h-4 text-slate-600" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}

              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
