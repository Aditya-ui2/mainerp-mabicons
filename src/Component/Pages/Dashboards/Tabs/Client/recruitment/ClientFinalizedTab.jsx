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
import { getClientDashboardOverview } from '../../../../service/api';

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
    <div className="p-0 min-h-screen bg-[#FDFDFD] text-left" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Finalized & Wins</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Celebrating success: Offers delivered and talent onboarded</p>
        </div>
      </div>

      {/* Milestone Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Shortlisted', count: shortlisted.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: FiAward },
          { label: 'Active Offers', count: offerSent.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: FiMail },
          { label: 'Successful Hires', count: hired.length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: FiUserCheck },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-[#F4F3EF] shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
              <s.icon size={22} />
            </div>
            <p className="text-3xl font-extrabold text-[#1A1A2E] mb-1">{s.count}</p>
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white border border-[#F4F3EF] rounded-[28px] p-3 mb-10 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] bg-[#F4F3EF] rounded-2xl px-6 h-[56px] flex items-center gap-4">
            <FiSearch size={20} className="text-[#9B9BAD]" />
            <input
              type="text"
              placeholder="Search by candidate name or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD]/60 outline-none w-full font-bold"
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
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  viewFilter === f.key
                    ? 'bg-[#1A1A2E] text-white shadow-xl shadow-gray-400/20'
                    : 'bg-white text-[#9B9BAD] border border-[#F4F3EF] hover:bg-[#F4F3EF]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Deck */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-[#F4F3EF] p-24 text-center flex flex-col items-center gap-4 shadow-sm">
             <div className="w-20 h-20 rounded-3xl bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD]">
              <FiUserCheck size={32} />
            </div>
            <p className="text-sm font-bold text-[#9B9BAD]">No findings in this segment</p>
          </div>
        ) : (
          filtered.map(c => {
             const isHired = c.stage === 'Joined';
             const isOffer = c.stage === 'Offer Sent';
             const initials = c.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '??';

             return (
               <motion.div
                 layout
                 key={c.id}
                 onClick={() => setSelectedCandidate(c)}
                 className="bg-white rounded-[28px] border border-[#F4F3EF] p-5 flex items-center justify-between hover:shadow-lg transition-all group cursor-pointer"
               >
                 <div className="flex items-center gap-5">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner ${
                     isHired ? 'bg-emerald-50 text-emerald-600' : isOffer ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                   }`}>
                     {initials}
                   </div>
                   <div className="min-w-0">
                     <h3 className="text-lg font-bold text-[#1A1A2E] font-jakarta group-hover:text-[#1B4DA0] transition-colors">{c.name}</h3>
                     <div className="flex items-center gap-4 mt-1">
                        <span className="text-[11px] font-bold text-[#9B9BAD] flex items-center gap-1.5 uppercase tracking-wider">
                           <FiBriefcase className="text-blue-500" /> {c.positionTitle || c.position || '—'}
                        </span>
                        <span className="w-1 h-1 bg-[#F4F3EF] rounded-full" />
                        <span className="text-[11px] font-bold text-[#9B9BAD] flex items-center gap-1.5 uppercase tracking-wider">
                           <FiCalendar className="text-purple-500" /> {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'Active'}
                        </span>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                         isHired ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isOffer ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                         {c.stage}
                       </span>
                    </div>
                    <button className="p-3.5 bg-[#F4F3EF] hover:bg-[#1A1A2E] hover:text-white rounded-2xl transition-all duration-500 group-hover:rotate-[-45deg]">
                       <FiChevronRight size={20} />
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
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[2000]"
              />

              {/* Sidebar */}
              <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-full max-w-[580px] bg-white shadow-2xl z-[2001] flex flex-col overflow-hidden text-left"
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
