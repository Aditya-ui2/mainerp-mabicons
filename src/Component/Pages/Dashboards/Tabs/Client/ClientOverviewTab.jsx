import { useState, useEffect } from 'react';
import {
  FiTarget, FiBriefcase, FiUsers, FiCalendar, FiCheckCircle, FiClock,
  FiTrendingUp, FiChevronDown, FiChevronUp, FiMapPin, FiRefreshCw,
  FiClipboard, FiAlertTriangle, FiRepeat, FiShield, FiUser, FiPhone,
  FiMail, FiActivity, FiArrowRight, FiFileText, FiStar, FiPlay,
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview } from '../../../service/api';

/* ── Color configs ── */
const STAGE_COLORS = {
  screening: { label: 'Screening', gradient: 'from-slate-400 to-slate-500', badge: 'bg-slate-100 text-slate-700' },
  phoneInterview: { label: 'Phone Interview', gradient: 'from-blue-400 to-blue-600', badge: 'bg-blue-100 text-blue-700' },
  technical: { label: 'Technical Round', gradient: 'from-violet-400 to-violet-600', badge: 'bg-violet-100 text-violet-700' },
  hrRound: { label: 'HR Round', gradient: 'from-purple-400 to-purple-600', badge: 'bg-purple-100 text-purple-700' },
  clientInterview: { label: 'Client Interview', gradient: 'from-pink-400 to-pink-600', badge: 'bg-pink-100 text-pink-700' },
  offerSent: { label: 'Offer Sent', gradient: 'from-amber-400 to-amber-600', badge: 'bg-amber-100 text-amber-700' },
  joined: { label: 'Joined', gradient: 'from-emerald-400 to-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', gradient: 'from-red-400 to-red-600', badge: 'bg-red-100 text-red-700' },
};

const STATUS_COLORS = {
  Open: 'bg-emerald-100 text-emerald-700', Urgent: 'bg-red-100 text-red-700',
  'In Progress': 'bg-blue-100 text-blue-700', Closed: 'bg-slate-100 text-slate-600', Hold: 'bg-amber-100 text-amber-700',
};

const PRIORITY_COLORS = {
  High: 'bg-red-50 text-red-600 border border-red-200', Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
  Low: 'bg-slate-50 text-slate-500 border border-slate-200', Urgent: 'bg-red-100 text-red-700 border border-red-300',
};

const TASK_STATUS_COLORS = {
  Active: 'bg-blue-100 text-blue-700', 'Work in Progress': 'bg-violet-100 text-violet-700',
  Review: 'bg-amber-100 text-amber-700', Pending: 'bg-orange-100 text-orange-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

const TASK_PRIORITY_COLORS = {
  High: 'text-red-500', Medium: 'text-amber-500', Low: 'text-slate-400', Urgent: 'text-red-600',
};

/* ── Progress Ring ── */
const ProgressRing = ({ value, max, size = 44, stroke = 3, color = '#8b5cf6', isDarkMode }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round" />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{value}/{max}</span>
    </div>
  );
};

/* ══════════════════ CLIENT OVERVIEW TAB ═══════════════════ */
export default function ClientOverviewTab({ isDarkMode, clientData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'recruitment' | 'operations'
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);

  const t = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const tSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const card = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const bdr = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const subBg = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#f7f5fc]';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const res = await getClientDashboardOverview(decoded.id);
      if (res?.success) setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
        <p className={`text-sm ${tSub}`}>{error}</p>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">
          <FiRefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { client, recruitment, operations } = data;
  const { summary: rSum, positions, funnel, upcomingInterviews, candidates } = recruitment;
  const { taskSummary, recentTasks, overdueTasks, requestedTasks, recurringTasks, agreement } = operations;

  const funnelStages = ['screening', 'phoneInterview', 'technical', 'hrRound', 'clientInterview', 'offerSent', 'joined'];
  const maxFunnel = Math.max(...funnelStages.map(s => funnel[s] || 0), 1);

  const showRecruitment = activeSection === 'all' || activeSection === 'recruitment';
  const showOperations = activeSection === 'all' || activeSection === 'operations';

  return (
    <div className="space-y-5">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/40">
            <FiActivity size={22} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${t}`}>Dashboard Overview</h2>
            <p className={`text-xs ${tSub}`}>{client.companyName} — Complete view of Recruitment & Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Section toggle */}
          <div className={`flex items-center rounded-lg border ${bdr} overflow-hidden text-[11px] font-semibold`}>
            {[
              { key: 'all', label: 'All' },
              { key: 'recruitment', label: 'Recruitment' },
              { key: 'operations', label: 'Operations' },
            ].map(s => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                className={`px-3 py-1.5 transition-colors ${activeSection === s.key
                  ? 'bg-violet-600 text-white'
                  : `${isDarkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${bdr} ${card} ${tSub} hover:opacity-80`}>
            <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ═══ KAM Info Card ═══ */}
      {client.kam && (
        <div className={`${card} rounded-xl border ${bdr} p-4 flex flex-col sm:flex-row sm:items-center gap-4`}>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow">
              {client.kam.name?.charAt(0)}
            </div>
            <div>
              <p className={`text-sm font-semibold ${t}`}>Your Account Manager</p>
              <p className={`text-xs ${tSub}`}>{client.kam.name}</p>
            </div>
          </div>
          <div className={`flex items-center gap-4 text-xs ${tSub}`}>
            <span className="flex items-center gap-1"><FiMail className="w-3.5 h-3.5" /> {client.kam.email}</span>
            {client.kam.phone && <span className="flex items-center gap-1"><FiPhone className="w-3.5 h-3.5" /> {client.kam.phone}</span>}
          </div>
        </div>
      )}

      {/* ═══ COMBINED STATS ROW ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {showRecruitment && (
          <>
            <StatCard icon={FiBriefcase} label="Open Positions" value={rSum.openPositions} sub={`${rSum.totalPositions} total`} gradient="from-blue-500 to-indigo-600" isDarkMode={isDarkMode} />
            <StatCard icon={FiUsers} label="Candidates" value={rSum.inPipeline} sub={`${rSum.totalCandidates} total`} gradient="from-violet-500 to-purple-600" isDarkMode={isDarkMode} />
            <StatCard icon={FiCheckCircle} label="Hired" value={rSum.hired} sub={`${rSum.completedInterviews} interviews done`} gradient="from-emerald-500 to-teal-600" isDarkMode={isDarkMode} />
          </>
        )}
        {showOperations && (
          <>
            <StatCard icon={FiClipboard} label="Active Tasks" value={taskSummary.active + taskSummary.wip} sub={`${taskSummary.total} total`} gradient="from-cyan-500 to-blue-600" isDarkMode={isDarkMode} />
            <StatCard icon={FiCheckCircle} label="Completed" value={taskSummary.resolved} sub={`${taskSummary.completionRate}% rate`} gradient="from-green-500 to-emerald-600" isDarkMode={isDarkMode} />
            <StatCard icon={FiAlertTriangle} label="Overdue" value={taskSummary.overdue} sub={`${taskSummary.review} in review`} gradient="from-red-500 to-rose-600" isDarkMode={isDarkMode} />
          </>
        )}
      </div>

      {/* ═══ RECRUITMENT SECTION ═══ */}
      {showRecruitment && (
        <>
          {/* Section Label */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px flex-1 bg-gradient-to-r from-violet-300 to-transparent" />
            <span className="text-[11px] font-bold text-violet-500 tracking-wider uppercase flex items-center gap-1.5">
              <FiTarget className="w-3.5 h-3.5" /> Recruitment
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-violet-300 to-transparent" />
          </div>

          {/* Pipeline Funnel */}
          <div className={`${card} rounded-xl border ${bdr} p-5`}>
            <h3 className={`text-sm font-bold ${t} mb-4 flex items-center gap-2`}>
              <FiTrendingUp className="w-4 h-4 text-violet-500" /> Hiring Pipeline
            </h3>
            <div className="space-y-2">
              {funnelStages.map(stage => {
                const count = funnel[stage] || 0;
                const width = Math.max((count / maxFunnel) * 100, 4);
                const cfg = STAGE_COLORS[stage];
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className={`text-[11px] font-medium w-28 text-right ${tSub}`}>{cfg.label}</span>
                    <div className={`flex-1 h-7 rounded-full ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'} overflow-hidden`}>
                      <div className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-700 flex items-center justify-end pr-2`} style={{ width: `${width}%` }}>
                        {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {funnel.rejected > 0 && <p className={`text-[11px] mt-3 ${tSub}`}><span className="text-red-500 font-semibold">{funnel.rejected}</span> rejected</p>}
          </div>

          {/* Positions + Interviews row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Positions */}
            <div className={`lg:col-span-2 ${card} rounded-xl border ${bdr} p-5`}>
              <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-4`}>
                <FiBriefcase className="w-4 h-4 text-blue-500" /> Open Positions ({positions.length})
              </h3>
              {positions.length === 0 ? (
                <p className={`text-sm text-center py-8 ${tSub}`}>No positions yet</p>
              ) : (
                <div className="space-y-2">
                  {positions.map(pos => {
                    const isExp = expandedPosition === pos.id;
                    const posCands = candidates.filter(c => c.position === pos.title);
                    return (
                      <div key={pos.id} className={`rounded-lg border ${bdr} ${subBg} overflow-hidden`}>
                        <button onClick={() => setExpandedPosition(isExp ? null : pos.id)} className="w-full flex items-center justify-between p-3 text-left hover:opacity-90 transition-opacity">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-semibold ${t} truncate`}>{pos.title}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[pos.status] || 'bg-slate-100 text-slate-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${pos.status === 'Urgent' ? 'bg-red-500 animate-pulse' : pos.status === 'Open' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {pos.status}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[pos.priority] || ''}`}>{pos.priority}</span>
                            </div>
                            <div className={`flex items-center gap-3 mt-1 text-[10px] ${tSub}`}>
                              {pos.location && <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{pos.location}</span>}
                              <span>{pos.type}</span>
                              <span>{pos.candidateCount} candidate{pos.candidateCount !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ProgressRing value={pos.filled} max={pos.openings} isDarkMode={isDarkMode} />
                            {isExp ? <FiChevronUp className={`w-4 h-4 ${tSub}`} /> : <FiChevronDown className={`w-4 h-4 ${tSub}`} />}
                          </div>
                        </button>
                        {isExp && posCands.length > 0 && (
                          <div className={`border-t ${bdr} p-3`}>
                            <p className={`text-[11px] font-semibold mb-2 ${tSub}`}>Candidates in Pipeline</p>
                            <div className="space-y-1.5">
                              {posCands.map(c => {
                                const stageKey = Object.keys(STAGE_COLORS).find(k => STAGE_COLORS[k].label === c.stage);
                                return (
                                  <div key={c.id} className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg ${card}`}>
                                    <span className={`text-xs font-medium ${t}`}>{c.name}</span>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STAGE_COLORS[stageKey]?.badge || 'bg-slate-100 text-slate-600'}`}>{c.stage}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {isExp && posCands.length === 0 && (
                          <div className={`border-t ${bdr} p-4`}>
                            <p className={`text-xs text-center ${tSub}`}>No candidates yet</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Interviews */}
            <div className={`${card} rounded-xl border ${bdr} p-5`}>
              <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-4`}>
                <FiCalendar className="w-4 h-4 text-cyan-500" /> Upcoming Interviews
              </h3>
              {(!upcomingInterviews || upcomingInterviews.length === 0) ? (
                <div className={`text-center py-8 ${tSub}`}>
                  <FiCalendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No upcoming interviews</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingInterviews.map((iv, i) => {
                    const d = new Date(iv.interviewDate);
                    const isToday = d.toDateString() === new Date().toDateString();
                    const isTomorrow = d.toDateString() === new Date(Date.now() + 86400000).toDateString();
                    const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${bdr} ${subBg}`}>
                        <div className={`flex-shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center ${isToday ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white' : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          <span className="text-[10px] font-bold leading-none">{dateLabel}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${t} truncate`}>{iv.candidateName}</p>
                          <p className={`text-[10px] ${tSub} truncate`}>{iv.positionTitle}</p>
                          <div className={`flex items-center gap-2 mt-1 text-[10px] ${tSub}`}>
                            <FiClock className="w-3 h-3" />
                            <span>{iv.startTime || 'TBD'}</span>
                            <span className={`px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} font-medium`}>{iv.interviewType || 'Video'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══ OPERATIONS SECTION ═══ */}
      {showOperations && (
        <>
          {/* Section Label */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px flex-1 bg-gradient-to-r from-blue-300 to-transparent" />
            <span className="text-[11px] font-bold text-blue-500 tracking-wider uppercase flex items-center gap-1.5">
              <FiClipboard className="w-3.5 h-3.5" /> Operations
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-blue-300 to-transparent" />
          </div>

          {/* Task Status Bar */}
          <div className={`${card} rounded-xl border ${bdr} p-5`}>
            <h3 className={`text-sm font-bold ${t} mb-4 flex items-center gap-2`}>
              <FiActivity className="w-4 h-4 text-blue-500" /> Task Progress
            </h3>
            {taskSummary.total === 0 ? (
              <p className={`text-sm text-center py-6 ${tSub}`}>No tasks assigned yet</p>
            ) : (
              <>
                {/* Visual status bar */}
                <div className="flex h-4 rounded-full overflow-hidden mb-4">
                  {[
                    { key: 'resolved', color: 'bg-emerald-500', count: taskSummary.resolved },
                    { key: 'review', color: 'bg-amber-400', count: taskSummary.review },
                    { key: 'wip', color: 'bg-violet-500', count: taskSummary.wip },
                    { key: 'active', color: 'bg-blue-400', count: taskSummary.active },
                    { key: 'pending', color: 'bg-orange-400', count: taskSummary.pending },
                  ].filter(s => s.count > 0).map(s => (
                    <div key={s.key} className={`${s.color} transition-all`} style={{ width: `${(s.count / taskSummary.total) * 100}%` }} title={`${s.key}: ${s.count}`} />
                  ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                  {[
                    { label: 'Resolved', color: 'bg-emerald-500', count: taskSummary.resolved },
                    { label: 'Review', color: 'bg-amber-400', count: taskSummary.review },
                    { label: 'In Progress', color: 'bg-violet-500', count: taskSummary.wip },
                    { label: 'Active', color: 'bg-blue-400', count: taskSummary.active },
                    { label: 'Pending', color: 'bg-orange-400', count: taskSummary.pending },
                  ].filter(s => s.count > 0).map(s => (
                    <span key={s.label} className={`flex items-center gap-1.5 ${tSub}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                      {s.label}: <span className={`font-bold ${t}`}>{s.count}</span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Recent Tasks + Overdue row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Tasks */}
            <div className={`lg:col-span-2 ${card} rounded-xl border ${bdr} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-bold ${t} flex items-center gap-2`}>
                  <FiClipboard className="w-4 h-4 text-blue-500" /> Recent Tasks
                </h3>
                {recentTasks.length > 5 && (
                  <button onClick={() => setShowAllTasks(!showAllTasks)} className={`text-[11px] font-medium ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} flex items-center gap-1`}>
                    {showAllTasks ? 'Show Less' : 'View All'} <FiArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              {recentTasks.length === 0 ? (
                <p className={`text-sm text-center py-6 ${tSub}`}>No tasks yet</p>
              ) : (
                <div className="space-y-2">
                  {(showAllTasks ? recentTasks : recentTasks.slice(0, 5)).map(task => (
                    <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border ${bdr} ${subBg}`}>
                      <div className={`w-1.5 h-10 rounded-full ${TASK_PRIORITY_COLORS[task.priority] ? '' : ''}`}
                        style={{ backgroundColor: task.priority === 'High' || task.priority === 'Urgent' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#94a3b8' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${t} truncate`}>{task.title}</p>
                        <div className={`flex items-center gap-2 mt-0.5 text-[10px] ${tSub}`}>
                          <span>{task.category}</span>
                          {task.dueDate && <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${TASK_STATUS_COLORS[task.status] || 'bg-slate-100 text-slate-600'}`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overdue + Recurring sidebar */}
            <div className="space-y-4">
              {/* Overdue */}
              <div className={`${card} rounded-xl border ${bdr} p-5`}>
                <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-3`}>
                  <FiAlertTriangle className="w-4 h-4 text-red-500" /> Overdue ({overdueTasks.length})
                </h3>
                {overdueTasks.length === 0 ? (
                  <div className={`text-center py-4 ${tSub}`}>
                    <FiCheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                    <p className="text-xs">All tasks on track!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {overdueTasks.slice(0, 5).map(task => (
                      <div key={task.id} className={`p-2.5 rounded-lg border border-red-200 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <p className={`text-xs font-semibold ${t} truncate`}>{task.title}</p>
                        <p className="text-[10px] text-red-500 mt-0.5">
                          Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recurring Tasks */}
              {recurringTasks.length > 0 && (
                <div className={`${card} rounded-xl border ${bdr} p-5`}>
                  <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-3`}>
                    <FiRepeat className="w-4 h-4 text-violet-500" /> Recurring ({recurringTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {recurringTasks.slice(0, 5).map(rc => (
                      <div key={rc.id} className={`flex items-center justify-between py-2 px-2.5 rounded-lg ${subBg}`}>
                        <span className={`text-xs font-medium ${t} truncate`}>{rc.title}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                          {rc.frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Requested Tasks */}
          {requestedTasks.length > 0 && (
            <div className={`${card} rounded-xl border ${bdr} p-5`}>
              <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-4`}>
                <FiFileText className="w-4 h-4 text-amber-500" /> Task Requests ({requestedTasks.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`text-[11px] font-semibold ${tSub} border-b ${bdr}`}>
                      <th className="pb-2.5 pr-4">Title</th>
                      <th className="pb-2.5 pr-4">Category</th>
                      <th className="pb-2.5 pr-4">Priority</th>
                      <th className="pb-2.5 pr-4">Status</th>
                      <th className="pb-2.5">Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestedTasks.slice(0, 10).map(rt => (
                      <tr key={rt.id} className={`border-b ${bdr} last:border-0`}>
                        <td className={`py-2.5 pr-4 text-xs font-medium ${t}`}>{rt.title}</td>
                        <td className={`py-2.5 pr-4 text-xs ${tSub}`}>{rt.category || '—'}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[rt.priority] || ''}`}>{rt.priority}</span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            rt.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                            rt.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {rt.status}
                          </span>
                        </td>
                        <td className={`py-2.5 text-[11px] ${tSub}`}>
                          {new Date(rt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Work Agreement */}
          {agreement && (
            <div className={`${card} rounded-xl border ${bdr} p-5`}>
              <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-3`}>
                <FiShield className="w-4 h-4 text-emerald-500" /> Service Agreement
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${t}`}>{agreement.title}</p>
                  <p className={`text-[11px] ${tSub} mt-1`}>
                    {agreement.startDate && `${new Date(agreement.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    {agreement.endDate && ` — ${new Date(agreement.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(agreement.scopes || []).map((scope, i) => (
                    <span key={i} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
              {agreement.maxTasks && (
                <p className={`text-[11px] mt-2 ${tSub}`}>
                  Max concurrent tasks: <span className={`font-bold ${t}`}>{agreement.maxTasks}</span>
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ ALL CANDIDATES TABLE ═══ */}
      {showRecruitment && candidates.length > 0 && (
        <div className={`${card} rounded-xl border ${bdr} p-5`}>
          <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-4`}>
            <FiUsers className="w-4 h-4 text-violet-500" /> All Candidates ({candidates.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[11px] font-semibold ${tSub} border-b ${bdr}`}>
                  <th className="pb-2.5 pr-4">Candidate</th>
                  <th className="pb-2.5 pr-4">Position</th>
                  <th className="pb-2.5 pr-4">Stage</th>
                  <th className="pb-2.5">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 20).map(c => {
                  const stageKey = Object.keys(STAGE_COLORS).find(k => STAGE_COLORS[k].label === c.stage);
                  return (
                    <tr key={c.id} className={`border-b ${bdr} last:border-0`}>
                      <td className={`py-2.5 pr-4 text-xs font-medium ${t}`}>{c.name}</td>
                      <td className={`py-2.5 pr-4 text-xs ${tSub}`}>{c.position || '—'}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STAGE_COLORS[stageKey]?.badge || 'bg-slate-100 text-slate-600'}`}>{c.stage}</span>
                      </td>
                      <td className={`py-2.5 text-[11px] ${tSub}`}>
                        {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {candidates.length > 20 && <p className={`text-[11px] text-center pt-3 ${tSub}`}>Showing 20 of {candidates.length}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat Card Component ── */
function StatCard({ icon: Icon, label, value, sub, gradient, isDarkMode }) {
  const card = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const bdr = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  return (
    <div className={`${card} rounded-xl border ${bdr} p-3.5 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-14 h-14 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-[2rem]`} />
      <div className={`inline-flex p-1.5 rounded-lg bg-gradient-to-br ${gradient} text-white mb-2`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label} <span className="opacity-60">• {sub}</span></p>
    </div>
  );
}
