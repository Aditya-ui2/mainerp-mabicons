import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiMail, FiChevronRight, FiVideo, FiUser } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview } from '../../../../service/api';

export default function ClientInterviewsTab() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = jwtDecode(token);
        const res = await getClientDashboardOverview(decoded.id);
        if (res?.success && res.data?.recruitment) setInterviews(res.data.recruitment.upcomingInterviews || []);
      } catch (err) {
        console.error('Failed to load interviews:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const list = interviews;

  // Group by date
  const grouped = list.reduce((acc, iv) => {
    const d = iv.interviewDate ? new Date(iv.interviewDate).toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }) : 'Unscheduled / Pipeline';
    if (!acc[d]) acc[d] = [];
    acc[d].push(iv);
    return acc;
  }, {});

  const today = new Date();
  const todayStr = today.toDateString();
  const tomorrowStr = new Date(Date.now() + 86400000).toDateString();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-400 font-syne tracking-widest uppercase">Syncing Schedule...</p>
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
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Interview Tracker</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Live schedule and interview performance monitoring</p>
        </div>
      </div>

      {/* Highlight Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Scheduled', count: list.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: FiCalendar },
          { label: 'Scheduled Today', count: list.filter(iv => new Date(iv.interviewDate).toDateString() === todayStr).length, color: 'text-amber-500', bg: 'bg-amber-50', icon: FiClock },
          { label: 'Active Pipeline', count: list.length + 5, color: 'text-purple-500', bg: 'bg-purple-50', icon: FiUsers },
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

      {/* Timeline List */}
      <div className="space-y-10">
        {list.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-[#F4F3EF] p-24 text-center shadow-sm flex flex-col items-center gap-4">
             <div className="w-20 h-20 rounded-3xl bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD]">
              <FiCalendar size={32} />
            </div>
            <p className="text-sm font-bold text-[#9B9BAD]">No interviews scheduled in the current window</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, items]) => {
            const firstDate = items[0]?.interviewDate ? new Date(items[0].interviewDate) : null;
            const isToday = firstDate && firstDate.toDateString() === todayStr;
            const isTomorrow = firstDate && firstDate.toDateString() === tomorrowStr;
            const dayTag = isToday ? 'Current Day' : isTomorrow ? 'Next Day' : null;

            return (
              <div key={dateLabel} className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-lg font-bold text-[#1A1A2E] font-syne">{dateLabel}</h3>
                  {dayTag && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${isToday ? 'bg-[#1B4DA0] text-white shadow-lg shadow-blue-500/20' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {dayTag}
                    </span>
                  )}
                  <div className="h-[1px] bg-[#F4F3EF] flex-1" />
                </div>

                <div className="flex flex-col gap-3">
                  {items.map((iv, i) => (
                    <motion.div
                      whileHover={{ x: 4, backgroundColor: '#FAFAFA' }}
                      key={i}
                      className="bg-white rounded-[20px] border border-[#F4F3EF] p-4 shadow-sm transition-all relative overflow-hidden group flex items-center justify-between gap-6"
                    >
                      {/* Left: Candidate Info */}
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] font-black text-sm shadow-inner transition-transform group-hover:scale-105">
                          {iv.candidateName ? iv.candidateName.split(' ').map(n=>n[0]).join('').slice(0, 2) : <FiUser />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-[#1A1A2E] truncate font-jakarta group-hover:text-[#1B4DA0] transition-colors">{iv.candidateName}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] font-semibold text-[#9B9BAD] truncate uppercase tracking-wider">{iv.positionTitle || 'Requirement Mapping'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Stats / Type */}
                      <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Interview Type</span>
                          <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-[#1B4DA0] whitespace-nowrap">
                            {iv.interviewType || 'Video Call'}
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Scheduled Time</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                             <FiClock size={14} className="text-blue-500" /> {iv.startTime || 'TBA'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                         {iv.meetingLink && (
                          <a 
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-12 h-12 bg-[#1B4DA0] hover:bg-[#153e82] rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/10 transition-all active:scale-95 group/btn"
                            title="Join Meeting"
                          >
                             <FiVideo size={20} className="group-hover/btn:scale-110 transition-transform" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
