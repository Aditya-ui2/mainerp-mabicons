import { useState, useEffect } from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';
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
    const d = iv.interviewDate ? new Date(iv.interviewDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Unscheduled';
    if (!acc[d]) acc[d] = [];
    acc[d].push(iv);
    return acc;
  }, {});

  const today = new Date();
  const todayStr = today.toDateString();
  const tomorrowStr = new Date(Date.now() + 86400000).toDateString();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading interviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
          Interviews
        </h1>
        <p className="text-sm text-[#6B6B7E] mt-1 font-medium">Upcoming and scheduled interviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Scheduled', count: list.length, color: 'text-[#1B4DA0]' },
          { label: 'Today', count: list.filter(iv => new Date(iv.interviewDate).toDateString() === todayStr).length, color: 'text-amber-600' },
          { label: 'This Week', count: list.filter(iv => { const d = new Date(iv.interviewDate); const diff = (d - today) / 86400000; return diff >= 0 && diff < 7; }).length, color: 'text-slate-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E8E7E2] p-5 shadow-sm">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.count}</p>
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Interview List */}
      {list.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-[#E8E7E2] p-12 text-center shadow-sm">
          <FiCalendar className="w-10 h-10 mx-auto mb-3 text-[#E8E7E2]" />
          <p className="text-sm text-[#9B9BAD]">No interviews scheduled</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateLabel, items]) => {
            const firstDate = items[0]?.interviewDate ? new Date(items[0].interviewDate) : null;
            const isToday = firstDate && firstDate.toDateString() === todayStr;
            const isTomorrow = firstDate && firstDate.toDateString() === tomorrowStr;
            const dayTag = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : null;

            return (
              <div key={dateLabel}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-bold text-[#1A1A2E]">{dateLabel}</h3>
                  {dayTag && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${isToday ? 'bg-blue-50 text-[#1B4DA0]' : 'bg-amber-50 text-amber-600'}`}>
                      {dayTag}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((iv, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#E8E7E2] p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                            isToday ? 'text-white shadow-lg shadow-blue-500/20' : 'bg-[#F4F3EF] text-[#1A1A2E]'
                          }`}
                          style={isToday ? { background: '#1B4DA0' } : {}}
                        >
                          <FiCalendar className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#1A1A2E] truncate">{iv.candidateName}</p>
                          <p className="text-xs text-[#9B9BAD] truncate font-medium mt-0.5">{iv.positionTitle}</p>
                          <div className="flex items-center gap-2 mt-2 text-[11px] text-[#9B9BAD]">
                            <FiClock className="w-3 h-3" />
                            <span className="font-medium">{iv.startTime || 'TBD'}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-[#F4F3EF] text-[#1A1A2E] font-bold text-[9px]">
                              {iv.interviewType || 'Video'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
