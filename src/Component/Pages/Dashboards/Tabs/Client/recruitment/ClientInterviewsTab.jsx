import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiMapPin,
  FiMail,
  FiChevronRight,
  FiVideo,
  FiUser,
  FiSearch,
  FiRefreshCw,
  FiChevronDown,
  FiX,
  FiBriefcase,
  FiPhone,
  FiXCircle,
  FiPlus,
  FiExternalLink
} from 'react-icons/fi';
import { Video, Clock, User, ChevronRight, Calendar, Search, AlertCircle, MapPin } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview } from '../../../../service/api';

const STATUS_COLORS = {
  "Scheduled": "bg-blue-50 text-blue-600 border-blue-100",
  "In-Progress": "bg-amber-50 text-amber-600 border-amber-100 animate-pulse",
  "Completed": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Cancelled": "bg-rose-50 text-rose-600 border-rose-100",
};

export default function ClientInterviewsTab() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const res = await getClientDashboardOverview(decoded.id);
      if (res?.success && res.data?.recruitment) {
        setInterviews(res.data.recruitment.upcomingInterviews || []);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = useMemo(() => {
    return interviews.filter(i => {
      const matchesSearch = !searchTerm ||
        i.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.positionTitle?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || i.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interviews, searchTerm, statusFilter]);

  const formatTime = (time) => {
    if (!time) return "TBA";
    if (time.includes("AM") || time.includes("PM")) return time;
    try {
      const [h, m] = time.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
    } catch (e) { return time; }
  };

  const formatDate = (date) => {
    if (!date) return "TBA";
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Syncing Schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 -mt-6">
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
            Interview Schedule
          </h1>

        </div>

      </div>


      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-6 py-3.5 transition-all focus-within:bg-[#EEF2FB] focus-within:ring-2 focus-within:ring-blue-100">
          <FiSearch className="text-[#9B9BAD]" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate, position or host..."
            className="w-full bg-transparent border-none text-sm font-bold focus:ring-0 outline-none transition-all placeholder:text-[#9B9BAD]/60 placeholder:font-medium text-[#1A1A2E]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F4F3EF] text-[10px] font-black uppercase tracking-[2px] text-[#1A1A2E] rounded-2xl pl-6 pr-12 py-3.5 outline-none border-0 cursor-pointer appearance-none min-w-[160px] hover:bg-[#EEEFED] transition-all"
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In-Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
                <th className="px-6 py-4 text-center w-12">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length === filteredInterviews.length && filteredInterviews.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedRowIds(filteredInterviews.map((_, i) => i));
                      else setSelectedRowIds([]);
                    }}
                    className="w-4 h-4 rounded-md border-[#E8E7E2] text-[#1B4DA0] cursor-pointer focus:ring-[#1B4DA0]"
                  />
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Time & Date</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Candidate</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Position</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredInterviews.length > 0 ? filteredInterviews.map((iv, idx) => (
                <tr key={idx} onClick={() => setSelectedInterview(iv)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRowIds.includes(idx)}
                      onChange={() => {
                        setSelectedRowIds(prev =>
                          prev.includes(idx) ? prev.filter(id => id !== idx) : [...prev, idx]
                        );
                      }}
                      className="w-4 h-4 rounded-md border-[#E8E7E2] text-[#1B4DA0] cursor-pointer focus:ring-[#1B4DA0]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium text-[#1A1A2E]">{formatTime(iv.startTime)}</span>
                      <span className="text-[10px] font-medium text-[#9B9BAD] uppercase tracking-widest flex items-center gap-1.5 mt-0.5 text-left">
                        <Calendar size={10} className="text-[#1B4DA0]" /> {formatDate(iv.interviewDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#1A1A2E]">{iv.candidateName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-bold text-[#1A1A2E]">{iv.positionTitle || 'Requirement Mapping'}</span>
                      <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                        {iv.interviewType === 'Video' ? <Video size={10} className="text-[#1B4DA0]" /> : <FiMapPin size={10} className="text-[#1B4DA0]" />} {iv.interviewType || 'Video'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    <span className="text-[10px] font-bold text-[#6B6B7E] uppercase tracking-widest">{iv.round || 'Technical Round'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[iv.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {iv.status || 'Scheduled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {iv.meetingLink && (
                        <a
                          href={iv.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-[#1B4DA0] hover:bg-[#153e82] text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                          title="Join Meeting"
                        >
                          <Video size={16} />
                        </a>
                      )}
                      {!iv.meetingLink && (
                        <button className="p-2.5 bg-[#FAFAF8] text-[#9B9BAD] rounded-xl border border-[#F4F3EF] cursor-not-allowed">
                          <FiExternalLink size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <AlertCircle size={24} />
                      </div>
                      <p className="text-sm font-medium text-slate-400">No interviews found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interview Detail Sidebar */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedInterview && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedInterview(null)}
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
                      <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedInterview.candidateName}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${STATUS_COLORS[selectedInterview.status] || 'bg-slate-100 text-slate-600'}`}>
                          {selectedInterview.status || 'Scheduled'}
                        </span>
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">• {selectedInterview.positionTitle || 'Position'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedInterview(null)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                    <FiX size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar space-y-10">
                  {/* Interview Schedule Section */}
                  <div className="pt-0">
                    <span className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-[3px] block mb-6">Interview Schedule</span>
                    <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-2xl p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Date</span>
                          <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                            <FiCalendar className="text-[#1B4DA0]" />
                            {selectedInterview.interviewDate
                              ? new Date(selectedInterview.interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                              : 'Not Scheduled'}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Time</span>
                          <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                            <FiClock className="text-[#1B4DA0]" />
                            {formatTime(selectedInterview.startTime)} {selectedInterview.endTime && `- ${formatTime(selectedInterview.endTime)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interview Details Grid */}
                  <div className="pt-8 border-t border-[#F4F3EF]">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Interview Type</span>
                        <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                          {selectedInterview.interviewType === 'Video' ? <Video size={16} className="text-[#1B4DA0]" /> : <MapPin size={16} className="text-[#1B4DA0]" />}
                          {selectedInterview.interviewType || 'Video Call'}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Round</span>
                        <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                          <FiBriefcase className="text-[#1B4DA0]" />
                          {selectedInterview.round || 'Technical Round'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Position Details */}
                  <div className="pt-8 border-t border-[#F4F3EF]">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-4">Position Details</span>
                    <div className="bg-white border border-[#F4F3EF] rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                          <FiBriefcase size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1A2E]">{selectedInterview.positionTitle || 'Unknown Position'}</p>
                          <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-0.5">
                            {selectedInterview.location || 'Remote'} • {selectedInterview.type || 'Full-time'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Contact Info */}
                  <div className="pt-8 border-t border-[#F4F3EF]">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-4">Candidate Contact</span>
                    <div className="space-y-3">
                      {selectedInterview.candidateEmail && (
                        <div className="flex items-center gap-3 text-sm font-medium text-[#4B4B5E]">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <FiMail size={16} />
                          </div>
                          <span>{selectedInterview.candidateEmail}</span>
                        </div>
                      )}
                      {selectedInterview.candidatePhone && (
                        <div className="flex items-center gap-3 text-sm font-medium text-[#4B4B5E]">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <FiPhone size={16} />
                          </div>
                          <span>{selectedInterview.candidatePhone}</span>
                        </div>
                      )}
                      {!selectedInterview.candidateEmail && !selectedInterview.candidatePhone && (
                        <p className="text-xs text-[#9B9BAD] italic font-bold">Contact information not available</p>
                      )}
                    </div>
                  </div>

                  {/* Interview Notes */}
                  {selectedInterview.notes && (
                    <div className="pt-8 border-t border-[#F4F3EF]">
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-2">Interview Notes</span>
                      <p className="text-sm text-[#4B4B5E] leading-relaxed bg-[#FDFDFD] p-4 rounded-xl border border-[#F4F3EF]">
                        {selectedInterview.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {/* <div className="p-8 border-t border-[#F4F3EF] bg-[#FAFAF9]">
                  {selectedInterview.meetingLink ? (
                    <a
                      href={selectedInterview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-4 bg-[#1B4DA0] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#153e82] transition-all shadow-xl shadow-blue-500/20"
                    >
                      <Video size={18} />
                      Join Video Meeting
                    </a>
                  ) : (
                  )}
                </div> */}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Selection Action Bar (Inside Portal for true fixed positioning) ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedRowIds.length > 0 && (
            <div className="fixed bottom-10 left-0 md:left-80 flex justify-start z-[20000] pointer-events-none">
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-[#1A1A2E] text-white px-8 py-4 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex items-center gap-8 border border-white/10 pointer-events-auto"
              >
                <div className="flex items-center gap-3 border-r border-white/10 pr-8">
                  <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center text-[10px] font-black">
                    {selectedRowIds.length}
                  </div>
                  <span className="text-[13px] font-bold tracking-wide">Interviews Selected</span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setInterviews(prev => prev.map((iv, idx) => selectedRowIds.includes(idx) ? { ...iv, status: 'Scheduled' } : iv));
                      setSelectedRowIds([]);
                    }}
                    className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-all active:scale-95 text-xs font-bold"
                  >
                    <FiClock size={16} className="text-[#3B82F6]" />
                    Reschedule
                  </button>

                  <button
                    onClick={() => {
                      setInterviews(prev => prev.map((iv, idx) => selectedRowIds.includes(idx) ? { ...iv, status: 'Cancelled' } : iv));
                      setSelectedRowIds([]);
                    }}
                    className="flex items-center gap-2 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl transition-all active:scale-95 text-xs font-bold"
                  >
                    <FiXCircle size={16} />
                    Cancel Interview
                  </button>
                </div>

                <button
                  onClick={() => setSelectedRowIds([])}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-2xl hover:bg-red-500/20 hover:text-red-400 transition-all ml-4"
                >
                  <FiX size={20} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
