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
            Finalized & Offers
          </h1>

        </div>

      </div>


      {/* Action Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-6 py-3.5 transition-all focus-within:bg-[#EEF2FB] focus-within:ring-2 focus-within:ring-blue-100">
          <FiSearch className="text-[#9B9BAD]" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate or position..."
            className="w-full bg-transparent border-none text-sm font-bold focus:ring-0 outline-none transition-all placeholder:text-[#9B9BAD]/60 placeholder:font-medium text-[#1A1A2E]"
          />
        </div>

        <div className="flex gap-2">

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
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-3xl bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD]">
                        <FiUserCheck size={24} />
                      </div>
                      <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No Findings In This Segment</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const isHired = c.stage === 'Joined';
                  const isOffer = c.stage === 'Offer Sent';
                  const statusBg = isHired
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : isOffer
                      ? 'bg-purple-50 text-purple-600 border-purple-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-[#1A1A2E]">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-[#1A1A2E]">{c.positionTitle || c.position || '—'}</span>
                          <span className="text-[10px] font-medium text-[#9B9BAD] uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                            <FiBriefcase size={10} className="text-[#1B4DA0]" /> Corporate Opening
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className="text-[10px] font-medium text-[#6B6B7E] uppercase tracking-widest">
                          {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase() : 'TODAY'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusBg}`}>
                          {c.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button className="p-2.5 bg-white text-[#9B9BAD] hover:text-[#1B4DA0] rounded-xl border border-[#F4F3EF] group-hover:border-[#1B4DA0]/20 transition-all shadow-sm">
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
                className="fixed inset-y-0 right-0 w-full max-w-[580px] bg-white shadow-2xl z-[10000] flex flex-col overflow-hidden text-left border-l border-[#F4F3EF]"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
                  <div className="flex items-center gap-4">
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

              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
