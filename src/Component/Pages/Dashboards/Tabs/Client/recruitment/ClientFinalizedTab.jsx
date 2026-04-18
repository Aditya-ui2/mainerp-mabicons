import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle, FiSearch, FiMail, FiCalendar, FiUsers, FiMapPin, FiChevronRight,
  FiUserCheck, FiAward, FiBriefcase, FiX, FiClock, FiPhone, FiMap, FiActivity
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { UserCheck } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview, generateCandidateCredentials } from '../../../../service/api';
import toast from 'react-hot-toast';
import { Zap, RotateCcw } from 'lucide-react';

export default function ClientFinalizedTab() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('all');
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
        console.error('Failed to load finalized data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allCandidates = candidates;
  const shortlisted = allCandidates.filter(c => c.stage === 'Client Interview' || c.stage === 'Offer Sent' || c.stage === 'Joined');
  const offerSent = allCandidates.filter(c => c.stage === 'Offer Sent');
  const hired = allCandidates.filter(c => c.stage === 'Joined');

  const displayList = (() => {
    switch (viewFilter) {
      case 'shortlisted': return shortlisted;
      case 'offer': return offerSent;
      case 'hired': return hired;
      default: return shortlisted;
    }
  })();

  const filtered = displayList.filter(c =>
    !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || (c.positionTitle || c.position || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-400 font-syne tracking-widest uppercase">Fetching Closures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 -mt-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
            Finalized & Offers
          </h1>

        </div>

      </div>


      {/* Action Bar */}
      <div className="bg-white rounded-2xl p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate or position..."
            className="w-full bg-[#F4F3EF] border-none rounded-xl py-2.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#1B4DA0]/10 outline-none transition-all placeholder:text-[#9B9BAD] text-[#1A1A2E]"
          />
        </div>

        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Finalized' },
            { key: 'offer', label: 'Offers Only' },
            { key: 'hired', label: 'Hired Only' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setViewFilter(f.key)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${viewFilter === f.key
                ? 'bg-[#1A1A2E] text-white shadow-lg shadow-gray-400/20'
                : 'bg-white text-[#9B9BAD] border border-[#F4F3EF] hover:bg-[#F4F3EF]'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Deck */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#F4F3EF] p-24 text-center flex flex-col items-center gap-4 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] shadow-inner">
              <FiUserCheck size={32} />
            </div>
            <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">No Findings In This Segment</p>
          </div>
        ) : (
          filtered.map(c => {
            const isHired = c.stage === 'Joined';
            const isOffer = c.stage === 'Offer Sent';
            const initials = c.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';

            return (
              <motion.div
                layout
                key={c.id}
                onClick={() => setSelectedCandidate(c)}
                className="bg-white rounded-[24px] border border-[#F4F3EF] p-5 flex items-center justify-between hover:shadow-lg transition-all duration-500 group cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-110 transition-transform ${isHired ? 'bg-emerald-50 text-emerald-600' : isOffer ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{c.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] font-bold text-[#9B9BAD] flex items-center gap-1.5 uppercase tracking-widest">
                        <FiBriefcase size={12} className="text-[#1B4DA0]" /> {c.positionTitle || c.position || '—'}
                      </span>
                      <span className="w-1 h-1 bg-[#F4F3EF] rounded-full" />
                      <span className="text-[10px] font-bold text-[#9B9BAD] flex items-center gap-1.5 uppercase tracking-widest">
                        <FiCalendar size={12} className="text-purple-500" /> {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${isHired ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isOffer ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                      {c.stage}
                    </span>
                  </div>
                  <button className="p-3 bg-white text-[#9B9BAD] group-hover:text-[#1B4DA0] rounded-2xl border border-[#F4F3EF] group-hover:border-[#1B4DA0]/20 transition-all shadow-sm">
                    <FiChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
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
                className="fixed inset-y-0 right-0 w-full max-w-[580px] bg-white shadow-2xl z-[10000] flex flex-col overflow-hidden text-left border-l border-[#F4F3EF]"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-xl font-black shadow-inner">
                      {selectedCandidate.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">{selectedCandidate.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {selectedCandidate.stage}
                        </span>
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">• {selectedCandidate.positionTitle || selectedCandidate.position || 'Joined'}</span>
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

                  {/* Onboarding Notes */}
                  {selectedCandidate.notes && (
                    <div className="pt-8 border-t border-[#F4F3EF]">
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-2">Finalization Notes</span>
                      <p className="text-sm text-[#4B4B5E] leading-relaxed bg-[#FDFDFD] p-4 rounded-xl border border-[#F4F3EF]">
                        {selectedCandidate.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[#F4F3EF] bg-[#FAFAF9]">
                  {/* BGV Onboarding Credentials - Same as HR Dashboard */}
                  {(selectedCandidate.stage === 'Joined' || selectedCandidate.stage === 'Offer Sent') && (
                    <div className="pt-8 border-t border-[#F4F3EF]">
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

                                // Update local list
                                setCandidates(prev => prev.map(c =>
                                  (c.id === targetId || c._id === targetId)
                                    ? { ...c, onboardingUsername: finalUsername, onboardingPassword: finalPass }
                                    : c
                                ));
                                // Update selected candidate for sidebar
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
                        <div className="flex flex-col gap-3 group/bgv relative scale-in-center">
                          <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-[#5F6368] uppercase tracking-[2px]">Onboarding ID</span>
                                <span className="text-sm font-bold text-[#1B4DA0] font-jakarta">{selectedCandidate.onboardingUsername}</span>
                              </div>
                              <FiUserCheck className="text-[#1B4DA0] opacity-20" size={24} />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-[#5F6368] uppercase tracking-[2px]">Onboarding Pass</span>
                                <span className="text-sm font-mono font-black text-[#202124] tracking-widest uppercase">{selectedCandidate.onboardingPassword}</span>
                              </div>
                              <FiActivity className="text-emerald-500 animate-pulse" size={18} />
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetId = selectedCandidate.id || selectedCandidate._id;
                              setCandidates(prev => prev.map(c =>
                                (c.id === targetId || c._id === targetId)
                                  ? { ...c, onboardingUsername: null, onboardingPassword: null }
                                  : c
                              ));
                              setSelectedCandidate(prev => ({ ...prev, onboardingUsername: null, onboardingPassword: null }));
                              toast.info("Console: Security record cleared locally.");
                            }}
                            className="w-full py-2.5 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center gap-2"
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
    </div>
  );
}
