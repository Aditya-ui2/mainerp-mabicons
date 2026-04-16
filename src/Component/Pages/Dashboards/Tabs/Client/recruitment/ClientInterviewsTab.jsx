import { useState, useEffect, useMemo } from 'react';
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
  FiFilter,
  FiExternalLink
} from 'react-icons/fi';
import { Video, Clock, User, ChevronRight, Calendar, Search, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Interview Schedule
          </h1>
          <p className="text-sm text-[#9B9BAD] mt-1">Track and manage upcoming candidate interviews</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#6B6B7E] border border-[#F4F3EF] rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <FiUsers size={16} className="text-[#1B4DA0]" />
              Refresh List
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate or role..."
            className="w-full bg-[#F4F3EF] border-none rounded-xl py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#1B4DA0]/10 outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In-Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none opacity-50" />
        </div>
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-[24px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#F4F3EF]">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider">Time & Date</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider">Role / Job</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-[#9B9BAD] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredInterviews.length > 0 ? filteredInterviews.map((iv, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1A1A2E]">{formatTime(iv.startTime)}</span>
                      <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-tight flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> {formatDate(iv.interviewDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-xs font-bold">
                        {iv.candidateName?.charAt(0).toUpperCase() || <User size={14} />}
                      </div>
                      <span className="text-sm font-semibold text-[#1A1A2E]">{iv.candidateName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1A1A2E]">{iv.positionTitle || 'Requirement mapping'}</span>
                      <span className="text-[10px] font-semibold text-[#9B9BAD] flex items-center gap-1 mt-0.5">
                         {iv.interviewType === 'Video' ? <Video size={10} /> : <FiMapPin size={10} />} {iv.interviewType || 'Video'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium text-[#6B6B7E]">{iv.round || 'Technical Round'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLORS[iv.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
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
                          className="p-2 bg-[#1B4DA0] hover:bg-[#153e82] text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                          title="Join Meeting"
                        >
                          <Video size={16} />
                        </a>
                      )}
                      {!iv.meetingLink && (
                        <button className="p-2 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed">
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
    </div>
  );
}
