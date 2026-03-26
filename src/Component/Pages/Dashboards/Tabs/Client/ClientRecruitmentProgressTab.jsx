import { useState, useEffect } from 'react';
import {
  FiTarget,
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiRefreshCw,
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientRecruitmentProgress } from '../../../service/api';

/* ── Stage color config ── */
const STAGE_CONFIG = {
  screening: { label: 'Screening', color: 'from-slate-400 to-slate-500', bg: 'bg-slate-100 text-slate-700' },
  phoneInterview: { label: 'Phone Interview', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-100 text-blue-700' },
  technical: { label: 'Technical Round', color: 'from-violet-400 to-violet-600', bg: 'bg-violet-100 text-violet-700' },
  hrRound: { label: 'HR Round', color: 'from-purple-400 to-purple-600', bg: 'bg-purple-100 text-purple-700' },
  clientInterview: { label: 'Client Interview', color: 'from-pink-400 to-pink-600', bg: 'bg-pink-100 text-pink-700' },
  offerSent: { label: 'Offer Sent', color: 'from-amber-400 to-amber-600', bg: 'bg-amber-100 text-amber-700' },
  joined: { label: 'Joined', color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'from-red-400 to-red-600', bg: 'bg-red-100 text-red-700' },
};

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const config = {
    Open: 'bg-emerald-100 text-emerald-700',
    Urgent: 'bg-red-100 text-red-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    Closed: 'bg-slate-100 text-slate-600',
    Hold: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config[status] || 'bg-slate-100 text-slate-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Open' ? 'bg-emerald-500' : status === 'Urgent' ? 'bg-red-500 animate-pulse' : status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'}`} />
      {status}
    </span>
  );
};

/* ── Priority Badge ── */
const PriorityBadge = ({ priority }) => {
  const config = {
    High: 'bg-red-50 text-red-600 border border-red-200',
    Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
    Low: 'bg-slate-50 text-slate-500 border border-slate-200',
    Urgent: 'bg-red-100 text-red-700 border border-red-300',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config[priority] || config.Medium}`}>{priority}</span>;
};

/* ══════════════════ CLIENT RECRUITMENT PROGRESS ═══════════════════ */
export default function ClientRecruitmentProgressTab({ isDarkMode, clientData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const text = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const border = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const bgSub = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#f7f5fc]';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const res = await getClientRecruitmentProgress(decoded.id);
      if (res?.success) setData(res.data);
    } catch (err) {
      console.error('Failed to load recruitment progress:', err);
      setError('Failed to load recruitment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className={`text-sm ${textSub}`}>{error}</p>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
          <FiRefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, positions, funnel, upcomingInterviews, candidates } = data;

  // Filter positions
  const filteredPositions = filterStatus === 'all'
    ? positions
    : positions.filter(p => p.status === filterStatus);

  // Funnel stages in order
  const funnelStages = ['screening', 'phoneInterview', 'technical', 'hrRound', 'clientInterview', 'offerSent', 'joined'];
  const maxFunnel = Math.max(...funnelStages.map(s => funnel[s] || 0), 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow">
            <FiTarget size={22} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${text}`}>Recruitment Progress</h2>
            <p className={`text-xs ${textSub}`}>Track your hiring pipeline in real-time</p>
          </div>
        </div>
        <button onClick={fetchData} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${border} ${cardBg} ${textSub} hover:opacity-80 transition-opacity`}>
          <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Open Positions', value: summary.openPositions, total: summary.totalPositions, icon: FiBriefcase, gradient: 'from-blue-500 to-indigo-600' },
          { label: 'Candidates', value: summary.inPipeline, total: summary.totalCandidates, icon: FiUsers, gradient: 'from-violet-500 to-purple-600' },
          { label: 'Interviews', value: summary.scheduledInterviews, total: summary.totalInterviews, icon: FiCalendar, gradient: 'from-cyan-500 to-blue-600' },
          { label: 'Hired', value: summary.hired, total: summary.totalCandidates, icon: FiCheckCircle, gradient: 'from-emerald-500 to-teal-600' },
        ].map((card, i) => (
          <div key={i} className={`${cardBg} rounded-xl border ${border} p-4 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${card.gradient} opacity-10 rounded-bl-[2rem]`} />
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${card.gradient} text-white mb-2`}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className={`text-2xl font-bold ${text}`}>{card.value}</p>
            <p className={`text-[11px] ${textSub}`}>{card.label} <span className="opacity-60">/ {card.total} total</span></p>
          </div>
        ))}
      </div>

      {/* Pipeline Funnel */}
      <div className={`${cardBg} rounded-xl border ${border} p-5`}>
        <h3 className={`text-sm font-bold ${text} mb-4 flex items-center gap-2`}>
          <FiTrendingUp className="w-4 h-4 text-violet-500" /> Candidate Pipeline
        </h3>
        <div className="space-y-2.5">
          {funnelStages.map(stage => {
            const count = funnel[stage] || 0;
            const width = Math.max((count / maxFunnel) * 100, 4);
            const cfg = STAGE_CONFIG[stage];
            return (
              <div key={stage} className="flex items-center gap-3">
                <span className={`text-[11px] font-medium w-28 text-right ${textSub}`}>{cfg.label}</span>
                <div className={`flex-1 h-7 rounded-full ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'} overflow-hidden relative`}>
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cfg.color} transition-all duration-700 ease-out flex items-center justify-end pr-2`}
                    style={{ width: `${width}%` }}
                  >
                    {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {funnel.rejected > 0 && (
          <p className={`text-[11px] mt-3 ${textSub}`}>
            <span className="text-red-500 font-semibold">{funnel.rejected}</span> candidate{funnel.rejected > 1 ? 's' : ''} rejected
          </p>
        )}
      </div>

      {/* Positions & Upcoming Interviews Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Positions List */}
        <div className={`lg:col-span-2 ${cardBg} rounded-xl border ${border} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold ${text} flex items-center gap-2`}>
              <FiBriefcase className="w-4 h-4 text-blue-500" /> Positions ({filteredPositions.length})
            </h3>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${border} ${isDarkMode ? 'bg-[#322d4a] text-gray-200' : 'bg-white text-gray-700'} outline-none`}
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Urgent">Urgent</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {filteredPositions.length === 0 ? (
            <p className={`text-sm text-center py-8 ${textSub}`}>No positions found</p>
          ) : (
            <div className="space-y-2">
              {filteredPositions.map(pos => {
                const isExpanded = expandedPosition === pos.id;
                const progress = pos.openings ? Math.round((pos.filled / pos.openings) * 100) : 0;
                const posCandidates = candidates.filter(c => c.position === pos.title);

                return (
                  <div key={pos.id} className={`rounded-lg border ${border} ${isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#faf9ff]'} overflow-hidden`}>
                    <button
                      onClick={() => setExpandedPosition(isExpanded ? null : pos.id)}
                      className="w-full flex items-center justify-between p-3.5 text-left hover:opacity-90 transition-opacity"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-semibold ${text} truncate`}>{pos.title}</span>
                          <StatusBadge status={pos.status} />
                          <PriorityBadge priority={pos.priority} />
                        </div>
                        <div className={`flex items-center gap-3 mt-1 text-[11px] ${textSub}`}>
                          {pos.location && <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{pos.location}</span>}
                          <span>{pos.type}</span>
                          <span>{pos.candidateCount} candidate{pos.candidateCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Progress ring */}
                        <div className="relative w-10 h-10">
                          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeWidth="3" />
                            <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
                          </svg>
                          <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${text}`}>{pos.filled}/{pos.openings}</span>
                        </div>
                        {isExpanded ? <FiChevronUp className={`w-4 h-4 ${textSub}`} /> : <FiChevronDown className={`w-4 h-4 ${textSub}`} />}
                      </div>
                    </button>

                    {isExpanded && posCandidates.length > 0 && (
                      <div className={`border-t ${border} p-3`}>
                        <p className={`text-[11px] font-semibold mb-2 ${textSub}`}>Candidates in Pipeline</p>
                        <div className="space-y-1.5">
                          {posCandidates.map(c => (
                            <div key={c.id} className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg ${isDarkMode ? 'bg-[#282440]' : 'bg-white'}`}>
                              <span className={`text-xs font-medium ${text}`}>{c.name}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STAGE_CONFIG[Object.keys(STAGE_CONFIG).find(k => STAGE_CONFIG[k].label === c.stage)]?.bg || 'bg-slate-100 text-slate-600'}`}>
                                {c.stage}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isExpanded && posCandidates.length === 0 && (
                      <div className={`border-t ${border} p-4`}>
                        <p className={`text-xs text-center ${textSub}`}>No candidates yet for this position</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className={`${cardBg} rounded-xl border ${border} p-5`}>
          <h3 className={`text-sm font-bold ${text} flex items-center gap-2 mb-4`}>
            <FiCalendar className="w-4 h-4 text-cyan-500" /> Upcoming Interviews
          </h3>
          {(!upcomingInterviews || upcomingInterviews.length === 0) ? (
            <div className={`text-center py-8 ${textSub}`}>
              <FiCalendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No upcoming interviews</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingInterviews.map((iv, i) => {
                const date = new Date(iv.interviewDate);
                const isToday = date.toDateString() === new Date().toDateString();
                const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
                const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${border} ${isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#faf9ff]'}`}>
                    <div className={`flex-shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center ${isToday ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white' : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <span className="text-[10px] font-bold leading-none">{dateLabel}</span>
                      {!isToday && !isTomorrow && <span className="text-[8px] opacity-60">{date.getFullYear()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${text} truncate`}>{iv.candidateName}</p>
                      <p className={`text-[10px] ${textSub} truncate`}>{iv.positionTitle}</p>
                      <div className={`flex items-center gap-2 mt-1 text-[10px] ${textSub}`}>
                        <FiClock className="w-3 h-3" />
                        <span>{iv.startTime || 'TBD'}</span>
                        <span className={`px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} font-medium`}>
                          {iv.interviewType || 'Video'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* All Candidates Table */}
      {candidates.length > 0 && (
        <div className={`${cardBg} rounded-xl border ${border} p-5`}>
          <h3 className={`text-sm font-bold ${text} flex items-center gap-2 mb-4`}>
            <FiUsers className="w-4 h-4 text-violet-500" /> All Candidates ({candidates.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[11px] font-semibold ${textSub} border-b ${border}`}>
                  <th className="pb-2.5 pr-4">Candidate</th>
                  <th className="pb-2.5 pr-4">Position</th>
                  <th className="pb-2.5 pr-4">Stage</th>
                  <th className="pb-2.5">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 20).map(c => (
                  <tr key={c.id} className={`border-b ${border} last:border-0`}>
                    <td className={`py-2.5 pr-4 text-xs font-medium ${text}`}>{c.name}</td>
                    <td className={`py-2.5 pr-4 text-xs ${textSub}`}>{c.position || '—'}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STAGE_CONFIG[Object.keys(STAGE_CONFIG).find(k => STAGE_CONFIG[k].label === c.stage)]?.bg || 'bg-slate-100 text-slate-600'}`}>
                        {c.stage}
                      </span>
                    </td>
                    <td className={`py-2.5 text-[11px] ${textSub}`}>
                      {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {candidates.length > 20 && (
              <p className={`text-[11px] text-center pt-3 ${textSub}`}>Showing 20 of {candidates.length} candidates</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
