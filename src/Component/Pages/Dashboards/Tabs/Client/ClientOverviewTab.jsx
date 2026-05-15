import { useState, useEffect } from 'react';
import {
  FiTarget, FiBriefcase, FiUsers, FiCalendar, FiCheckCircle, FiClock,
  FiTrendingUp, FiChevronDown, FiChevronUp, FiMapPin, FiRefreshCw,
  FiClipboard, FiAlertTriangle, FiRepeat, FiShield, FiUser, FiPhone,
  FiMail, FiActivity, FiArrowRight, FiFileText, FiStar, FiPlay,
  FiAward, FiLayers, FiZap, FiPercent, FiX, FiDownload, FiExternalLink,
  FiDollarSign, FiBell,
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview, getCandidateById } from '../../../service/api';

/* ── Color configs ── */
const STAGE_COLORS = {
  screening: { label: 'Screening', gradient: 'from-slate-400 to-slate-500', badge: 'bg-slate-100 text-slate-700', hex: '#64748b', bg: 'bg-slate-50' },
  phoneInterview: { label: 'Phone Interview', gradient: 'from-blue-400 to-blue-600', badge: 'bg-blue-100 text-blue-700', hex: '#3b82f6', bg: 'bg-blue-50' },
  technical: { label: 'Technical Round', gradient: 'from-violet-400 to-violet-600', badge: 'bg-violet-100 text-violet-700', hex: '#8b5cf6', bg: 'bg-violet-50' },
  hrRound: { label: 'HR Round', gradient: 'from-purple-400 to-purple-600', badge: 'bg-purple-100 text-purple-700', hex: '#a855f7', bg: 'bg-purple-50' },
  clientInterview: { label: 'Client Interview', gradient: 'from-pink-400 to-pink-600', badge: 'bg-pink-100 text-pink-700', hex: '#ec4899', bg: 'bg-pink-50' },
  offerSent: { label: 'Offer Sent', gradient: 'from-amber-400 to-amber-600', badge: 'bg-amber-100 text-amber-700', hex: '#f59e0b', bg: 'bg-amber-50' },
  joined: { label: 'Joined', gradient: 'from-emerald-400 to-emerald-600', badge: 'bg-emerald-100 text-emerald-700', hex: '#10b981', bg: 'bg-emerald-50' },
  rejected: { label: 'Rejected', gradient: 'from-red-400 to-red-600', badge: 'bg-red-100 text-red-700', hex: '#ef4444', bg: 'bg-red-50' },
};

const STATUS_COLORS = {
  Open: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200', Urgent: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  'In Progress': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200', Closed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200', Hold: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
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
const ProgressRing = ({ value, max, size = 48, stroke = 3.5, color = '#8b5cf6', isDarkMode }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{pct}%</span>
    </div>
  );
};

/* ── Donut Chart for Task Progress ── */
const DonutChart = ({ segments, size = 120, strokeWidth = 14, isDarkMode }) => {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} strokeWidth={strokeWidth} />
        {segments.filter(s => s.count > 0).map((seg, i) => {
          const pct = seg.count / total;
          const dash = pct * c;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={seg.color} strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset} strokeLinecap="butt"
              className="transition-all duration-700" />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{total}</span>
        <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total</span>
      </div>
    </div>
  );
};

/* ── Mock data (temporary until API is fully implemented) ── */
// MOCK_DASHBOARD_DATA removed for live database integration
const MOCK_DASHBOARD_DATA = null;

/* ══════════════════ CLIENT OVERVIEW TAB ═══════════════════ */
export default function ClientOverviewTab({ isDarkMode, clientData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('all');
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const t = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const tSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const card = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const bdr = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const subBg = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#f7f5fc]';
  
  // Fetch candidate details
  const handleCandidateClick = async (candidateId) => {
    setCandidateLoading(true);
    setShowCandidateModal(true);
    try {
      const res = await getCandidateById(candidateId);
      if (res?.success) {
        setSelectedCandidate(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch candidate:', err);
    } finally {
      setCandidateLoading(false);
    }
  };

  const closeCandidateModal = () => {
    setShowCandidateModal(false);
    setSelectedCandidate(null);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setData(MOCK_DASHBOARD_DATA);
        return;
      }
      const decoded = jwtDecode(token);
      const res = await getClientDashboardOverview(decoded.id);
      if (res?.success) setData(res.data);
      else setData(MOCK_DASHBOARD_DATA);
    } catch (err) {
      console.error('Failed to load dashboard, using mock data:', err);
      setData(MOCK_DASHBOARD_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-violet-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className={`text-sm font-medium ${tSub}`}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <FiAlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <p className={`text-sm ${tSub}`}>{error}</p>
        <button onClick={fetchData} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-violet-200/50 transition-all">
          <FiRefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { client, recruitment, operations, allowedServices = ['recruitment', 'operations'] } = data;
  const { summary: rSum, positions, funnel, upcomingInterviews, candidates } = recruitment;
  const { taskSummary, recentTasks, overdueTasks, requestedTasks, recurringTasks, agreement } = operations;

  // Service access flags from backend
  const canRecruitment = allowedServices.includes('recruitment');
  const canOperations = allowedServices.includes('operations');
  const hasBoth = canRecruitment && canOperations;

  const funnelStages = ['screening', 'phoneInterview', 'technical', 'hrRound', 'clientInterview', 'offerSent', 'joined'];
  const maxFunnel = Math.max(...funnelStages.map(s => funnel[s] || 0), 1);
  const totalFunnel = funnelStages.reduce((s, k) => s + (funnel[k] || 0), 0);

  // Only show toggle if client has both services
  const showRecruitment = canRecruitment && (activeSection === 'all' || activeSection === 'recruitment');
  const showOperations = canOperations && (activeSection === 'all' || activeSection === 'operations');

  const serviceLabel = hasBoth ? 'Recruitment & Operations' : canRecruitment ? 'Recruitment' : 'Operations';

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200/50">
            <FiActivity size={24} />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <h2 className={`text-xl font-extrabold ${t} tracking-tight`}>Dashboard Overview</h2>
              <p className={`text-xs ${tSub} mt-0.5`}>{client.companyName} — {serviceLabel} at a glance</p>
            </div>
            {/* Date Range Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${bdr} ${card} text-xs font-medium ${tSub} cursor-pointer hover:shadow-sm transition-all`}
              >
                <FiCalendar className="w-3.5 h-3.5" />
                <span>{dateRangeOptions.find(o => o.value === dateRange)?.label}</span>
                <FiChevronDown className={`w-3 h-3 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showDateDropdown && (
                <div className={`absolute top-full left-0 mt-1 ${card} border ${bdr} rounded-lg shadow-lg z-50 min-w-[140px] overflow-hidden`}>
                  {dateRangeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => { setDateRange(option.value); setShowDateDropdown(false); }}
                      className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors ${
                        dateRange === option.value 
                          ? 'bg-violet-500 text-white' 
                          : `${isDarkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-violet-50'}`
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Toggle buttons - Radio style */}
          {hasBoth && (
            <div className={`flex items-center rounded-full border ${bdr} overflow-hidden text-xs font-semibold shadow-sm ${card} p-1`}>
              {[
                { key: 'all', label: 'All', Icon: FiLayers },
                { key: 'recruitment', label: 'Recruitment', Icon: FiTarget },
                { key: 'operations', label: 'Operations', Icon: FiClipboard },
              ].map(s => (
                <button key={s.key} onClick={() => setActiveSection(s.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-200 ${activeSection === s.key
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700'}`
                  }`}
                >
                  <s.Icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
          )}
          <button onClick={fetchData} className={`p-2.5 rounded-full border ${bdr} ${card} ${tSub} hover:shadow-md hover:scale-105 active:scale-95 transition-all group`} title="Refresh">
            <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* ═══ HERO STATS - New Modern Design ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {showRecruitment && (
          <>
            {/* Open Positions Card */}
            <div className={`${card} rounded-2xl border ${bdr} p-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-600/30" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30">
                <svg width="50" height="40" viewBox="0 0 50 40">
                  <path d="M0 35 Q10 30, 15 25 T30 15 T50 8" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.5"/>
                  <path d="M0 38 Q10 35, 15 30 T30 22 T50 15" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.3"/>
                </svg>
              </div>
              <div className="relative">
                <div className="inline-flex p-2.5 rounded-xl text-white mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                  <FiBriefcase className="w-4 h-4" />
                </div>
                <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>{rSum.openPositions}</p>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Open Positions</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>{rSum.totalPositions} Active</p>
              </div>
            </div>

            {/* In Pipeline Card */}
            <div className={`${card} rounded-2xl border ${bdr} p-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-purple-400/20 to-purple-600/30" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 flex items-end gap-1 h-10">
                {[6, 4, 5, 3, 6, 4, 7].map((h, i) => (
                  <div key={i} className="w-2 rounded-t" style={{ height: `${h * 5}px`, background: `linear-gradient(to top, #8b5cf6, #a855f7)` }} />
                ))}
              </div>
              <div className="relative">
                <div className="inline-flex p-2.5 rounded-xl text-white mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                  <FiUsers className="w-4 h-4" />
                </div>
                <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>{rSum.inPipeline}</p>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>In Pipeline</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>{funnel.screening || 0} Screened, {funnel.offerSent || 0} Offered, {funnel.joined || 0} Joined</p>
              </div>
            </div>

            {/* Hired Card */}
            <div className={`${card} rounded-2xl border ${bdr} p-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/30" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30">
                <FiAward className="w-12 h-12 text-amber-500" />
              </div>
              <div className="relative">
                <div className="inline-flex p-2.5 rounded-xl text-white mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <FiAward className="w-4 h-4" />
                </div>
                <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>{rSum.hired}</p>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Hired</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>Last 30 Days</p>
              </div>
            </div>
          </>
        )}
        {showOperations && (
          <>
            {/* Active Tasks Card */}
            <div className={`${card} rounded-2xl border ${bdr} p-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-teal-400/20 to-teal-600/30" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30">
                <FiZap className="w-10 h-10 text-teal-500" />
              </div>
              <div className="relative">
                <div className="inline-flex p-2.5 rounded-xl text-white mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                  <FiZap className="w-4 h-4" />
                </div>
                <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>{taskSummary.active + taskSummary.wip}</p>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Active Tasks</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>Tasks: {taskSummary.total > 0 ? 'In Progress' : 'Awaiting'}</p>
              </div>
            </div>

            {/* Completed Card */}
            <div className={`${card} rounded-2xl border ${bdr} p-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/30" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30">
                <FiCheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="relative">
                <div className="inline-flex p-2.5 rounded-xl text-white mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>{taskSummary.resolved}</p>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Completed</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>{taskSummary.completionRate}% rate</p>
              </div>
            </div>

            {/* Overdue Card */}
            <div className={`${card} rounded-2xl border ${bdr} p-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-red-400/20 to-red-600/30" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30">
                <FiAlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <div className="relative">
                <div className="inline-flex p-2.5 rounded-xl text-white mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                  <FiAlertTriangle className="w-4 h-4" />
                </div>
                <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>{taskSummary.overdue}</p>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Overdue</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>{taskSummary.review > 0 ? `${taskSummary.review} in Review` : 'Awaiting Review'}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ KAM Info Card ═══ */}
      {client.kam && (
        <div className={`${card} rounded-2xl border ${bdr} p-5 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-full" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative">
            <div className="flex items-center gap-4 flex-1">
              <div 
                className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold text-lg shadow-lg"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #4f46e5)' }}
              >
                {client.kam.name?.charAt(0) || <FiUser className="w-5 h-5" />}
              </div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-violet-400' : 'text-violet-500'}`}>Your Account Manager</p>
                <p className={`text-base font-bold ${t} mt-0.5`}>{client.kam.name}</p>
              </div>
            </div>
            <div className={`flex items-center gap-5 text-xs ${tSub}`}>
              <a href={`mailto:${client.kam.email}`} className="flex items-center gap-1.5 hover:text-violet-500 transition-colors">
                <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-violet-50'}`}><FiMail className="w-3.5 h-3.5 text-violet-500" /></div>
                {client.kam.email}
              </a>
              {client.kam.phone && (
                <a href={`tel:${client.kam.phone}`} className="flex items-center gap-1.5 hover:text-violet-500 transition-colors">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-emerald-50'}`}><FiPhone className="w-3.5 h-3.5 text-emerald-500" /></div>
                  {client.kam.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ═══ RECRUITMENT SECTION ═══ */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showRecruitment && (
        <>
          <SectionDivider icon={FiTarget} label="Recruitment" color="violet" isDarkMode={isDarkMode} />

          {/* Pipeline Funnel — Visual Stepped Design */}
          <div className={`${card} rounded-2xl border ${bdr} p-6 relative overflow-hidden`}>
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br from-violet-500/5 to-indigo-500/5 blur-2xl" />
            <div className="flex items-center justify-between mb-5 relative">
              <h3 className={`text-sm font-bold ${t} flex items-center gap-2`}>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <FiTrendingUp className="w-4 h-4" />
                </div>
                Hiring Pipeline
              </h3>
              <div className={`flex items-center gap-2 text-xs ${tSub}`}>
                <span className="font-semibold">{totalFunnel} candidates</span>
                {funnel.rejected > 0 && <span className="text-red-500">• {funnel.rejected} rejected</span>}
              </div>
            </div>
            <div className="space-y-2.5 relative">
              {funnelStages.map((stage, idx) => {
                const count = funnel[stage] || 0;
                const width = Math.max((count / maxFunnel) * 100, 6);
                const cfg = STAGE_COLORS[stage];
                return (
                  <div key={stage} className="group">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 w-36 text-right`}>
                        <div className={`w-2 h-2 rounded-full ring-2 ring-offset-1 ${isDarkMode ? 'ring-slate-700 ring-offset-slate-800' : 'ring-white ring-offset-white'} group-hover:scale-125 transition-transform`}
                          style={{ background: cfg.hex, boxShadow: `0 0 6px ${cfg.hex}40` }}
                        />
                        <span className={`text-[11px] font-semibold ${tSub} transition-colors flex-1 text-right`}>{cfg.label}</span>
                      </div>
                      <div className={`flex-1 h-8 rounded-xl ${isDarkMode ? 'bg-slate-700/40' : 'bg-slate-100/80'} overflow-hidden relative`}>
                        <div className="h-full rounded-xl transition-all duration-700 ease-out flex items-center px-3 relative overflow-hidden group-hover:shadow-md"
                          style={{ width: `${width}%`, background: `linear-gradient(to right, ${cfg.hex}, ${cfg.hex}cc)`, boxShadow: count > 0 ? `0 2px 8px ${cfg.hex}30` : 'none' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10" />
                          {count > 0 && <span className="text-[11px] font-bold text-white relative z-10 drop-shadow-sm">{count}</span>}
                        </div>
                      </div>
                    </div>
                    {idx < funnelStages.length - 1 && (
                      <div className="ml-[4.5rem] w-px h-1.5 bg-gradient-to-b from-slate-300 to-transparent" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Positions + Interviews row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Positions — 3 cols */}
            <div className={`lg:col-span-3 ${card} rounded-2xl border ${bdr} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-sm font-bold ${t} flex items-center gap-2`}>
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <FiBriefcase className="w-4 h-4" />
                  </div>
                  Open Positions
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>{positions.length}</span>
                </h3>
              </div>
              {positions.length === 0 ? (
                <div className={`text-center py-12 ${tSub}`}>
                  <FiBriefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No positions yet</p>
                  <p className="text-xs mt-1 opacity-60">New positions will appear here</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {positions.map(pos => {
                    const isExp = expandedPosition === pos.id;
                    const posCands = candidates.filter(c => c.position === pos.title);
                    const fillPct = pos.openings ? Math.round((pos.filled / pos.openings) * 100) : 0;
                    return (
                      <div key={pos.id} className={`rounded-xl border ${bdr} overflow-hidden transition-all duration-200 ${isExp ? `shadow-md ${isDarkMode ? 'shadow-violet-900/20' : 'shadow-violet-100'}` : 'hover:shadow-sm'}`}>
                        <button onClick={() => setExpandedPosition(isExp ? null : pos.id)} className={`w-full flex items-center justify-between p-4 text-left ${subBg} hover:opacity-95 transition-all`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-bold ${t}`}>{pos.title}</span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[pos.status] || 'bg-slate-100 text-slate-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${pos.status === 'Urgent' ? 'bg-red-500 animate-pulse' : pos.status === 'Open' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {pos.status}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[pos.priority] || ''}`}>{pos.priority}</span>
                            </div>
                            <div className={`flex items-center gap-3 mt-1.5 text-[11px] ${tSub}`}>
                              {pos.location && <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{pos.location}</span>}
                              <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" />{pos.candidateCount} candidate{pos.candidateCount !== 1 ? 's' : ''}</span>
                              <span className="flex items-center gap-1"><FiLayers className="w-3 h-3" />{pos.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-3">
                            <div className="text-right mr-1">
                              <p className={`text-xs font-bold ${t}`}>{pos.filled}/{pos.openings}</p>
                              <p className={`text-[10px] ${tSub}`}>filled</p>
                            </div>
                            <ProgressRing value={pos.filled} max={pos.openings} isDarkMode={isDarkMode} color={fillPct >= 75 ? '#10b981' : fillPct >= 40 ? '#f59e0b' : '#8b5cf6'} />
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                              {isExp ? <FiChevronUp className={`w-4 h-4 ${tSub}`} /> : <FiChevronDown className={`w-4 h-4 ${tSub}`} />}
                            </div>
                          </div>
                        </button>
                        {isExp && (
                          <div className={`border-t ${bdr} p-4 ${card}`}>
                            {posCands.length > 0 ? (
                              <>
                                <p className={`text-[11px] font-bold mb-3 ${tSub} uppercase tracking-wider`}>Pipeline Candidates</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {posCands.map(c => {
                                    const stageKey = Object.keys(STAGE_COLORS).find(k => STAGE_COLORS[k].label === c.stage);
                                    const cfg = STAGE_COLORS[stageKey] || {};
                                    return (
                                      <button 
                                        key={c.id} 
                                        onClick={() => handleCandidateClick(c.id)}
                                        className={`flex items-center justify-between py-2.5 px-3 rounded-xl ${subBg} border ${bdr} cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left w-full group`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${cfg.gradient || 'from-slate-400 to-slate-500'} group-hover:scale-110 transition-transform`}>
                                            {c.name?.charAt(0)}
                                          </div>
                                          <span className={`text-xs font-semibold ${t} group-hover:text-violet-500 transition-colors`}>{c.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${cfg.badge || 'bg-slate-100 text-slate-600'}`}>{c.stage}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <div className={`text-center py-6 ${tSub}`}>
                                <FiUsers className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
                                <p className="text-xs">No candidates yet for this position</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Interviews — 2 cols */}
            <div className={`lg:col-span-2 ${card} rounded-2xl border ${bdr} p-6`}>
              <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-5`}>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  <FiCalendar className="w-4 h-4" />
                </div>
                Upcoming Interviews
                {upcomingInterviews?.length > 0 && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-cyan-900/40 text-cyan-300' : 'bg-cyan-50 text-cyan-600'}`}>{upcomingInterviews.length}</span>
                )}
              </h3>
              {(!upcomingInterviews || upcomingInterviews.length === 0) ? (
                <div className={`text-center py-12 ${tSub}`}>
                  <FiCalendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No upcoming interviews</p>
                  <p className="text-xs mt-1 opacity-60">Scheduled interviews will show here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingInterviews.map((iv, i) => {
                    const d = new Date(iv.interviewDate);
                    const isToday = d.toDateString() === new Date().toDateString();
                    const isTomorrow = d.toDateString() === new Date(Date.now() + 86400000).toDateString();
                    const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    return (
                      <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${bdr} ${subBg} transition-all hover:shadow-sm relative overflow-hidden`}>
                        {isToday && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-purple-600 rounded-r" />}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold ${
                          isToday
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200/40'
                            : isTomorrow
                              ? `${isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'}`
                              : `${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`
                        }`}>
                          <span className="text-[10px] leading-none">{d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</span>
                          <span className="text-base leading-none mt-0.5">{d.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${t}`}>{iv.candidateName}</p>
                          <p className={`text-[11px] ${tSub} mt-0.5`}>{iv.positionTitle}</p>
                          <div className={`flex items-center gap-2.5 mt-2 text-[10px] ${tSub}`}>
                            <span className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                              <FiClock className="w-3 h-3" />
                              {iv.startTime || 'TBD'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md font-semibold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-indigo-50 text-indigo-600'}`}>
                              {iv.interviewType || 'Video'}
                            </span>
                            {isToday && <span className="px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 font-bold animate-pulse">Live</span>}
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
            <div className={`${card} rounded-2xl border ${bdr} p-6`}>
              <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-5`}>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <FiUsers className="w-4 h-4" />
                </div>
                All Candidates
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>{candidates.length}</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border ${bdr}">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`text-[11px] font-bold uppercase tracking-wider ${tSub} ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Position</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.slice(0, 20).map((c, i) => {
                      const stageKey = Object.keys(STAGE_COLORS).find(k => STAGE_COLORS[k].label === c.stage);
                      const cfg = STAGE_COLORS[stageKey] || {};
                      return (
                        <tr 
                          key={c.id} 
                          onClick={() => handleCandidateClick(c.id)}
                          className={`border-t ${bdr} ${i % 2 === 0 ? '' : isDarkMode ? 'bg-slate-800/20' : 'bg-slate-50/50'} hover:${isDarkMode ? 'bg-slate-700/30' : 'bg-violet-50/50'} transition-colors cursor-pointer group`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${cfg.gradient || 'from-slate-400 to-slate-500'} group-hover:scale-110 transition-transform`}>
                                {c.name?.charAt(0)}
                              </div>
                              <span className={`text-xs font-semibold ${t} group-hover:text-violet-500 transition-colors`}>{c.name}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 text-xs ${tSub}`}>{c.position || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${cfg.badge || 'bg-slate-100 text-slate-600'}`}>{c.stage}</span>
                          </td>
                          <td className={`py-3 px-4 text-[11px] ${tSub}`}>
                            {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {candidates.length > 20 && (
                  <div className={`text-center py-3 border-t ${bdr}`}>
                    <p className={`text-[11px] font-medium ${tSub}`}>Showing 20 of {candidates.length} candidates</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ═══ OPERATIONS SECTION ═══ */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showOperations && (
        <>
          <SectionDivider icon={FiClipboard} label="Operations" color="blue" isDarkMode={isDarkMode} />

          {/* Task Progress — Donut + Legend */}
          <div className={`${card} rounded-2xl border ${bdr} p-6 relative overflow-hidden`}>
            <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-gradient-to-br from-blue-500/5 to-cyan-500/5 blur-2xl" />
            <h3 className={`text-sm font-bold ${t} mb-5 flex items-center gap-2 relative`}>
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <FiActivity className="w-4 h-4" />
              </div>
              Task Progress
              <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-lg ${isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                <FiPercent className="w-3 h-3 inline mr-1" />{taskSummary.completionRate}% Complete
              </span>
            </h3>
            {taskSummary.total === 0 ? (
              <div className={`text-center py-12 ${tSub}`}>
                <FiClipboard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No tasks assigned yet</p>
                <p className="text-xs mt-1 opacity-60">Tasks from your KAM will appear here</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-8 relative">
                <DonutChart
                  isDarkMode={isDarkMode}
                  segments={[
                    { count: taskSummary.resolved, color: '#10b981', label: 'Resolved' },
                    { count: taskSummary.review, color: '#f59e0b', label: 'Review' },
                    { count: taskSummary.wip, color: '#8b5cf6', label: 'In Progress' },
                    { count: taskSummary.active, color: '#3b82f6', label: 'Active' },
                    { count: taskSummary.pending, color: '#f97316', label: 'Pending' },
                  ]}
                />
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                  {[
                    { label: 'Resolved', color: '#10b981', bg: 'bg-emerald-50', count: taskSummary.resolved, icon: FiCheckCircle },
                    { label: 'Review', color: '#f59e0b', bg: 'bg-amber-50', count: taskSummary.review, icon: FiStar },
                    { label: 'In Progress', color: '#8b5cf6', bg: 'bg-violet-50', count: taskSummary.wip, icon: FiPlay },
                    { label: 'Active', color: '#3b82f6', bg: 'bg-blue-50', count: taskSummary.active, icon: FiZap },
                    { label: 'Pending', color: '#f97316', bg: 'bg-orange-50', count: taskSummary.pending, icon: FiClock },
                    { label: 'Overdue', color: '#ef4444', bg: 'bg-red-50', count: taskSummary.overdue, icon: FiAlertTriangle },
                  ].map(s => (
                    <div key={s.label} className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : s.bg} border ${bdr}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{s.count}</p>
                        <p className={`text-[10px] font-medium ${tSub}`}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Tasks + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Recent Tasks — 3 cols */}
            <div className={`lg:col-span-3 ${card} rounded-2xl border ${bdr} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-sm font-bold ${t} flex items-center gap-2`}>
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <FiClipboard className="w-4 h-4" />
                  </div>
                  Recent Tasks
                </h3>
                {recentTasks.length > 5 && (
                  <button onClick={() => setShowAllTasks(!showAllTasks)} className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${isDarkMode ? 'text-violet-400 hover:bg-violet-900/30' : 'text-violet-600 hover:bg-violet-50'}`}>
                    {showAllTasks ? 'Show Less' : 'View All'} <FiArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              {recentTasks.length === 0 ? (
                <div className={`text-center py-12 ${tSub}`}>
                  <FiClipboard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(showAllTasks ? recentTasks : recentTasks.slice(0, 5)).map((task, i) => (
                    <div key={task.id} className={`flex items-center gap-3 p-4 rounded-xl border ${bdr} ${subBg} hover:shadow-sm transition-all group`}>
                      <div className={`w-1.5 self-stretch rounded-full transition-all`}
                        style={{ backgroundColor: task.priority === 'High' || task.priority === 'Urgent' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#94a3b8' }}
                      />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-500'} shadow-sm`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${t} truncate group-hover:text-violet-500 transition-colors`}>{task.title}</p>
                        <div className={`flex items-center gap-2.5 mt-1 text-[10px] ${tSub}`}>
                          <span className={`px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>{task.category}</span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${TASK_STATUS_COLORS[task.status] || 'bg-slate-100 text-slate-600'}`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overdue + Recurring — 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              {/* Overdue */}
              <div className={`${card} rounded-2xl border ${bdr} p-6 ${overdueTasks.length > 0 ? (isDarkMode ? 'border-red-900/40' : 'border-red-100') : ''}`}>
                <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-4`}>
                  <div className={`p-1.5 rounded-lg ${overdueTasks.length > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'} text-white`}>
                    {overdueTasks.length > 0 ? <FiAlertTriangle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
                  </div>
                  Overdue Tasks
                  {overdueTasks.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">{overdueTasks.length}</span>
                  )}
                </h3>
                {overdueTasks.length === 0 ? (
                  <div className={`text-center py-6 ${tSub}`}>
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                      <FiCheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-xs font-semibold text-emerald-600">All tasks on track!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {overdueTasks.slice(0, 5).map(task => {
                      const daysOverdue = Math.ceil((new Date() - new Date(task.dueDate)) / 86400000);
                      return (
                        <div key={task.id} className={`p-3.5 rounded-xl border ${isDarkMode ? 'border-red-900/40 bg-red-900/10' : 'border-red-100 bg-red-50/50'} relative overflow-hidden`}>
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-rose-600 rounded-r" />
                          <p className={`text-xs font-bold ${t} truncate pl-2`}>{task.title}</p>
                          <div className="flex items-center justify-between mt-1.5 pl-2">
                            <p className="text-[10px] text-red-500 font-semibold">
                              Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              {daysOverdue}d overdue
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recurring Tasks */}
              {recurringTasks.length > 0 && (
                <div className={`${card} rounded-2xl border ${bdr} p-6`}>
                  <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-4`}>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                      <FiRepeat className="w-4 h-4" />
                    </div>
                    Recurring Tasks
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>{recurringTasks.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {recurringTasks.slice(0, 5).map(rc => (
                      <div key={rc.id} className={`flex items-center justify-between py-3 px-3.5 rounded-xl ${subBg} border ${bdr}`}>
                        <div className="flex items-center gap-2.5">
                          <FiRepeat className={`w-3.5 h-3.5 ${isDarkMode ? 'text-violet-400' : 'text-violet-500'}`} />
                          <span className={`text-xs font-semibold ${t} truncate`}>{rc.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${isDarkMode ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                          {rc.frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Task Requests Table */}
          {requestedTasks.length > 0 && (
            <div className={`${card} rounded-2xl border ${bdr} p-6`}>
              <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-5`}>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                  <FiFileText className="w-4 h-4" />
                </div>
                Task Requests
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>{requestedTasks.length}</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border ${bdr}">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`text-[11px] font-bold uppercase tracking-wider ${tSub} ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestedTasks.slice(0, 10).map((rt, i) => (
                      <tr key={rt.id} className={`border-t ${bdr} ${i % 2 === 0 ? '' : isDarkMode ? 'bg-slate-800/20' : 'bg-slate-50/50'} hover:${isDarkMode ? 'bg-slate-700/30' : 'bg-amber-50/50'} transition-colors`}>
                        <td className={`py-3 px-4 text-xs font-semibold ${t}`}>{rt.title}</td>
                        <td className={`py-3 px-4 text-xs ${tSub}`}>{rt.category || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${PRIORITY_COLORS[rt.priority] || ''}`}>{rt.priority}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                            rt.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                            rt.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {rt.status}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-[11px] ${tSub}`}>
                          {new Date(rt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Service Agreement */}
          {agreement && (
            <div className={`${card} rounded-2xl border ${bdr} p-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full" />
              <h3 className={`text-sm font-bold ${t} flex items-center gap-2 mb-4 relative`}>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <FiShield className="w-4 h-4" />
                </div>
                Service Agreement
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative">
                <div className="flex-1">
                  <p className={`text-base font-bold ${t}`}>{agreement.title}</p>
                  <p className={`text-xs ${tSub} mt-1.5 flex items-center gap-1.5`}>
                    <FiCalendar className="w-3.5 h-3.5" />
                    {agreement.startDate && `${new Date(agreement.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    {agreement.endDate && ` — ${new Date(agreement.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                  {agreement.maxTasks && (
                    <p className={`text-xs mt-2 ${tSub} flex items-center gap-1.5`}>
                      <FiLayers className="w-3.5 h-3.5" />
                      Max concurrent tasks: <span className={`font-bold ${t}`}>{agreement.maxTasks}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(agreement.scopes || []).map((scope, i) => (
                    <span key={i} className={`text-[11px] font-bold px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ CANDIDATE DETAIL MODAL ═══ */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCandidateModal} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${card} border ${bdr}`}>
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-5 border-b ${bdr} ${card}`}>
              <h3 className={`text-lg font-bold ${t}`}>Candidate Details</h3>
              <button onClick={closeCandidateModal} className={`p-2 rounded-xl hover:bg-gray-100 ${isDarkMode ? 'hover:bg-slate-700' : ''} transition-colors`}>
                <FiX className={`w-5 h-5 ${tSub}`} />
              </button>
            </div>

            {/* Modal Content */}
            {candidateLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className={`text-sm ${tSub}`}>Loading candidate details...</p>
              </div>
            ) : selectedCandidate ? (
              <div className="p-5 space-y-5">
                {/* Candidate Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg" 
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                    {selectedCandidate.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold ${t}`}>{selectedCandidate.name}</h4>
                    <p className={`text-sm ${tSub} mt-0.5`}>{selectedCandidate.position?.title || 'Position not assigned'}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {(() => {
                        const stageKey = Object.keys(STAGE_COLORS).find(k => STAGE_COLORS[k].label === selectedCandidate.stage);
                        const cfg = STAGE_COLORS[stageKey] || {};
                        return <span className={`text-xs font-bold px-3 py-1 rounded-lg ${cfg.badge || 'bg-slate-100 text-slate-600'}`}>{selectedCandidate.stage}</span>;
                      })()}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{selectedCandidate.status}</span>
                      {selectedCandidate.rating > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                          <FiStar className="w-3.5 h-3.5 fill-current" /> {selectedCandidate.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl ${subBg} border ${bdr}`}>
                  {selectedCandidate.email && (
                    <a href={`mailto:${selectedCandidate.email}`} className="flex items-center gap-2.5 text-sm hover:text-violet-500 transition-colors">
                      <div className="p-2 rounded-lg bg-violet-100"><FiMail className="w-4 h-4 text-violet-600" /></div>
                      <span className={t}>{selectedCandidate.email}</span>
                    </a>
                  )}
                  {selectedCandidate.phone && (
                    <a href={`tel:${selectedCandidate.phone}`} className="flex items-center gap-2.5 text-sm hover:text-emerald-500 transition-colors">
                      <div className="p-2 rounded-lg bg-emerald-100"><FiPhone className="w-4 h-4 text-emerald-600" /></div>
                      <span className={t}>{selectedCandidate.phone}</span>
                    </a>
                  )}
                  {selectedCandidate.location && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="p-2 rounded-lg bg-blue-100"><FiMapPin className="w-4 h-4 text-blue-600" /></div>
                      <span className={t}>{selectedCandidate.location}</span>
                    </div>
                  )}
                  {selectedCandidate.experience && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="p-2 rounded-lg bg-amber-100"><FiBriefcase className="w-4 h-4 text-amber-600" /></div>
                      <span className={t}>{selectedCandidate.experience} experience</span>
                    </div>
                  )}
                </div>

                {/* Salary & Notice Period */}
                {(selectedCandidate.currentSalary || selectedCandidate.expectedSalary || selectedCandidate.noticePeriod) && (
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3`}>
                    {selectedCandidate.currentSalary && (
                      <div className={`p-3 rounded-xl ${subBg} border ${bdr}`}>
                        <p className={`text-[10px] font-semibold uppercase ${tSub}`}>Current Salary</p>
                        <p className={`text-sm font-bold ${t} mt-1 flex items-center gap-1.5`}><FiDollarSign className="w-3.5 h-3.5 text-emerald-500" />{selectedCandidate.currentSalary}</p>
                      </div>
                    )}
                    {selectedCandidate.expectedSalary && (
                      <div className={`p-3 rounded-xl ${subBg} border ${bdr}`}>
                        <p className={`text-[10px] font-semibold uppercase ${tSub}`}>Expected Salary</p>
                        <p className={`text-sm font-bold ${t} mt-1 flex items-center gap-1.5`}><FiDollarSign className="w-3.5 h-3.5 text-violet-500" />{selectedCandidate.expectedSalary}</p>
                      </div>
                    )}
                    {selectedCandidate.noticePeriod && (
                      <div className={`p-3 rounded-xl ${subBg} border ${bdr}`}>
                        <p className={`text-[10px] font-semibold uppercase ${tSub}`}>Notice Period</p>
                        <p className={`text-sm font-bold ${t} mt-1 flex items-center gap-1.5`}><FiClock className="w-3.5 h-3.5 text-blue-500" />{selectedCandidate.noticePeriod}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills */}
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div>
                    <p className={`text-xs font-bold uppercase ${tSub} mb-2`}>Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, i) => (
                        <span key={i} className={`text-xs font-medium px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-violet-900/30 text-violet-300 border border-violet-800/40' : 'bg-violet-50 text-violet-700 border border-violet-200'}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Download */}
                {selectedCandidate.cvUrl && (
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-r from-violet-900/30 to-indigo-900/30 border border-violet-800/40' : 'bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200'}`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                          <FiFileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${t}`}>{selectedCandidate.cvFileName || 'Resume'}</p>
                          <p className={`text-xs ${tSub}`}>Click to view or download</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={selectedCandidate.cvUrl} target="_blank" rel="noopener noreferrer" 
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-violet-200/50 transition-all">
                          <FiExternalLink className="w-4 h-4" /> View Resume
                        </a>
                        <a href={selectedCandidate.cvUrl} download 
                          className={`p-2.5 rounded-xl border ${bdr} ${card} hover:shadow-md transition-all`} title="Download">
                          <FiDownload className={`w-4 h-4 ${tSub}`} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interview History */}
                {selectedCandidate.interviews && selectedCandidate.interviews.length > 0 && (
                  <div>
                    <p className={`text-xs font-bold uppercase ${tSub} mb-3`}>Interview History</p>
                    <div className="space-y-2">
                      {selectedCandidate.interviews.map((iv, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${subBg} border ${bdr}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${iv.status === 'Completed' ? 'bg-emerald-100' : iv.status === 'Scheduled' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                              <span className="text-[8px] font-bold text-slate-500">{new Date(iv.interviewDate).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</span>
                              <span className={`text-sm font-bold ${iv.status === 'Completed' ? 'text-emerald-600' : iv.status === 'Scheduled' ? 'text-blue-600' : 'text-slate-600'}`}>{new Date(iv.interviewDate).getDate()}</span>
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${t}`}>{iv.interviewType}</p>
                              <p className={`text-xs ${tSub}`}>{iv.startTime || 'Time TBD'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {iv.rating > 0 && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                                <FiStar className="w-3 h-3 fill-current" /> {iv.rating}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                              iv.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                              iv.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                              iv.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>{iv.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedCandidate.notes && (
                  <div>
                    <p className={`text-xs font-bold uppercase ${tSub} mb-2`}>Notes</p>
                    <div className={`p-4 rounded-xl ${subBg} border ${bdr}`}>
                      <p className={`text-sm ${t} whitespace-pre-wrap`}>{selectedCandidate.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-20 ${tSub}`}>
                <FiUser className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Failed to load candidate details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Hero Stat Card Component ── */
const GRADIENT_MAP = {
  'from-blue-500 to-indigo-600': 'linear-gradient(135deg, #3b82f6, #4f46e5)',
  'from-violet-500 to-purple-600': 'linear-gradient(135deg, #8b5cf6, #9333ea)',
  'from-emerald-500 to-teal-600': 'linear-gradient(135deg, #10b981, #0d9488)',
  'from-cyan-500 to-blue-600': 'linear-gradient(135deg, #06b6d4, #2563eb)',
  'from-green-500 to-emerald-600': 'linear-gradient(135deg, #22c55e, #059669)',
  'from-red-500 to-rose-600': 'linear-gradient(135deg, #ef4444, #e11d48)',
};

function HeroStatCard({ icon: Icon, label, value, sub, gradient, accent, isDarkMode }) {
  const card = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const bdr = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const bg = GRADIENT_MAP[gradient] || 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
  return (
    <div className={`${card} rounded-2xl border ${bdr} p-4 relative overflow-hidden group hover:shadow-lg transition-all duration-300`}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.08] group-hover:scale-150 transition-transform duration-500" style={{ background: bg }} />
      <div className="absolute bottom-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: bg }} />
      <div className="inline-flex p-2 rounded-xl text-white mb-3 shadow-lg" style={{ background: bg }}>
        <Icon className="w-4 h-4" />
      </div>
      <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>{value}</p>
      <p className={`text-[11px] font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>{label}</p>
      <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>{sub}</p>
    </div>
  );
}

/* ── Section Divider ── */
function SectionDivider({ icon: Icon, label, color, isDarkMode }) {
  const colors = {
    violet: { line: 'from-violet-300', text: 'text-violet-500', bg: isDarkMode ? 'bg-violet-900/30' : 'bg-violet-50' },
    blue: { line: 'from-blue-300', text: 'text-blue-500', bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50' },
  };
  const c = colors[color] || colors.violet;
  return (
    <div className="flex items-center gap-3 mt-3">
      <div className={`h-px flex-1 bg-gradient-to-r ${c.line} to-transparent`} />
      <span className={`text-[11px] font-black tracking-[0.15em] uppercase flex items-center gap-2 px-4 py-1.5 rounded-full ${c.bg} ${c.text}`}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
      <div className={`h-px flex-1 bg-gradient-to-l ${c.line} to-transparent`} />
    </div>
  );
}
