import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  Briefcase,
  Users as LuUsers,
  Target as LuTarget,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview } from '../../../service/api';

/* ── Stage color config ── */
const STAGE_CONFIG = {
  screening: { label: 'Screening', hex: ['#cbd5e1', '#b0bec5'], bg: 'bg-slate-100 text-slate-600' },
  phoneInterview: { label: 'Phone Interview', hex: ['#fef08a', '#fde68a'], bg: 'bg-yellow-50 text-yellow-600' },
  technical: { label: 'Technical Round', hex: ['#fde68a', '#fcd34d'], bg: 'bg-amber-50 text-amber-600' },
  hrRound: { label: 'HR Round', hex: ['#fed7aa', '#fdba74'], bg: 'bg-orange-50 text-orange-600' },
  clientInterview: { label: 'Client Interview', hex: ['#fdba74', '#fbbf24'], bg: 'bg-orange-50 text-orange-600' },
  offerSent: { label: 'Offer Sent', hex: ['#ddd6fe', '#c4b5fd'], bg: 'bg-purple-50 text-purple-600' },
  joined: { label: 'Joined', hex: ['#93c5fd', '#60a5fa'], bg: 'bg-blue-50 text-blue-600' },
  rejected: { label: 'Rejected', hex: ['#d1d5db', '#b0b5be'], bg: 'bg-gray-50 text-gray-500' },
};

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const config = {
    Open: 'bg-blue-50 text-[#1B4DA0] border border-blue-100',
    Urgent: 'bg-amber-50 text-amber-700 border border-amber-100',
    'In Progress': 'bg-slate-50 text-slate-600 border border-slate-100',
    Closed: 'bg-gray-50 text-gray-500 border border-gray-100',
    Hold: 'bg-amber-50 text-amber-600 border border-amber-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${config[status] || 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
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
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${config[priority] || config.Medium}`}>{priority}</span>;
};

/* ══════════════════ CLIENT RECRUITMENT PROGRESS ═══════════════════ */
export default function ClientRecruitmentProgressTab({ isDarkMode, clientData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [datePreset, setDatePreset] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Close date picker on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) setShowDatePicker(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Date range helper
  const getDateRange = () => {
    const now = new Date();
    const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    switch (datePreset) {
      case 'today': return { from: startOfDay(now), to: now };
      case 'week': { const d = startOfDay(now); d.setDate(d.getDate() - d.getDay()); return { from: d, to: now }; }
      case 'month': return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
      case 'quarter': { const qm = Math.floor(now.getMonth() / 3) * 3; return { from: new Date(now.getFullYear(), qm, 1), to: now }; }
      case 'year': return { from: new Date(now.getFullYear(), 0, 1), to: now };
      case 'custom': return { from: customFrom ? new Date(customFrom) : null, to: customTo ? new Date(customTo + 'T23:59:59') : null };
      default: return null;
    }
  };

  const filterByDate = (items, dateField = 'updatedAt') => {
    const range = getDateRange();
    if (!range || (!range.from && !range.to)) return items;
    return items.filter(item => {
      const d = item[dateField] ? new Date(item[dateField]) : null;
      if (!d) return true;
      if (range.from && d < range.from) return false;
      if (range.to && d > range.to) return false;
      return true;
    });
  };

  const datePresetLabel = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    quarter: 'This Quarter',
    year: 'This Year',
    custom: customFrom || customTo ? `${customFrom || '...'} → ${customTo || '...'}` : 'Custom Range',
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const decoded = jwtDecode(token);
      const res = await getClientDashboardOverview(decoded.id);
      if (res?.success && res.data?.recruitment) {
        const r = res.data.recruitment;
        setData({
          summary: r.summary || {},
          positions: r.positions || [],
          funnel: r.funnel || {},
          upcomingInterviews: r.upcomingInterviews || [],
          candidates: r.candidates || [],
        });
        return;
      }
      // API returned but success was false — use empty data as fallback
      setData({
        summary: { openPositions: 0, totalPositions: 0, inPipeline: 0, totalCandidates: 0, scheduledInterviews: 0, totalInterviews: 0, hired: 0 },
        positions: [],
        funnel: { screening: 0, phoneInterview: 0, technical: 0, hrRound: 0, clientInterview: 0, offerSent: 0, joined: 0, rejected: 0 },
        upcomingInterviews: [],
        candidates: [],
      });
    } catch (err) {
      console.error('Failed to load recruitment progress:', err);
      // Fallback to empty data so the UI still renders
      setData({
        summary: { openPositions: 0, totalPositions: 0, inPipeline: 0, totalCandidates: 0, scheduledInterviews: 0, totalInterviews: 0, hired: 0 },
        positions: [],
        funnel: { screening: 0, phoneInterview: 0, technical: 0, hrRound: 0, clientInterview: 0, offerSent: 0, joined: 0, rejected: 0 },
        upcomingInterviews: [],
        candidates: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading recruitment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-[#9B9BAD]">{error}</p>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#1B4DA0] rounded-xl hover:bg-[#153e82] transition-all">
          <FiRefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, positions, funnel, upcomingInterviews, candidates } = data;

  // Apply date filter to candidates, positions, and interviews
  const dateFilteredCandidates = filterByDate(candidates, 'updatedAt');
  const dateFilteredPositions = filterByDate(positions, 'createdAt');
  const dateFilteredInterviews = filterByDate(upcomingInterviews || [], 'interviewDate');

  // Recompute funnel from date-filtered candidates
  const stageMap = {
    'Screening': 'screening',
    'Phone Interview': 'phoneInterview',
    'Technical Round': 'technical',
    'HR Round': 'hrRound',
    'Client Interview': 'clientInterview',
    'Offer Sent': 'offerSent',
    'Joined': 'joined',
    'Rejected': 'rejected',
  };
  const isDateFiltered = datePreset !== 'all';
  const computedFunnel = isDateFiltered
    ? dateFilteredCandidates.reduce((acc, c) => {
        const key = stageMap[c.stage] || 'screening';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, { screening: 0, phoneInterview: 0, technical: 0, hrRound: 0, clientInterview: 0, offerSent: 0, joined: 0, rejected: 0 })
    : funnel;

  // Recompute KPI summary from filtered data
  const computedSummary = isDateFiltered
    ? {
        openPositions: dateFilteredPositions.filter(p => p.status === 'Open' || p.status === 'Urgent').length,
        totalPositions: dateFilteredPositions.length,
        inPipeline: dateFilteredCandidates.filter(c => c.stage !== 'Rejected' && c.stage !== 'Joined').length,
        totalCandidates: dateFilteredCandidates.length,
        scheduledInterviews: dateFilteredInterviews.length,
        totalInterviews: dateFilteredInterviews.length,
        hired: dateFilteredCandidates.filter(c => c.stage === 'Joined').length,
      }
    : summary;

  // Filter positions by status
  const filteredPositions = filterStatus === 'all'
    ? dateFilteredPositions
    : dateFilteredPositions.filter(p => p.status === filterStatus);

  // Funnel stages in order
  const funnelStages = ['screening', 'phoneInterview', 'technical', 'hrRound', 'clientInterview', 'offerSent', 'joined'];
  const maxFunnel = Math.max(...funnelStages.map(s => computedFunnel[s] || 0), 1);

  const kpiCards = [
    { label: 'Open Positions', value: computedSummary.openPositions, change: `${computedSummary.totalPositions} total`, up: computedSummary.openPositions > 0, icon: Briefcase },
    { label: 'Candidates', value: computedSummary.inPipeline, change: `${computedSummary.totalCandidates} total`, up: computedSummary.inPipeline > 0 ? true : null, icon: LuUsers },
    { label: 'Interviews', value: computedSummary.scheduledInterviews, change: `${computedSummary.totalInterviews} total`, up: computedSummary.scheduledInterviews > 0, icon: LuTarget },
    { label: 'Hired', value: computedSummary.hired, change: `${computedSummary.totalCandidates} total`, up: computedSummary.hired > 0, icon: UserCheck },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Detached Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Recruitment Overview</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Track your hiring pipeline and candidate progress</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                datePreset !== 'all'
                  ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white border-[#E8E7E2] text-[#1A1A2E] hover:bg-[#F4F3EF]'
              } shadow-sm active:scale-95`}
            >
              <FiCalendar className={`w-4 h-4 ${datePreset !== 'all' ? 'text-white' : 'text-[#1B4DA0]'}`} />
              <span className="max-w-[180px] truncate">{datePresetLabel[datePreset]}</span>
              <FiChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDatePicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-72 bg-white border border-[#E8E7E2] rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  {/* Quick presets */}
                  <div className="p-2 border-b border-[#F4F3EF]">
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest px-3 py-1.5">Quick Filter</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['all', 'today', 'week', 'month', 'quarter', 'year'].map(preset => (
                        <button
                          key={preset}
                          onClick={() => { setDatePreset(preset); if (preset !== 'custom') setShowDatePicker(false); fetchData(); }}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                            datePreset === preset
                              ? 'bg-[#1B4DA0] text-white'
                              : 'text-[#1A1A2E] hover:bg-[#F4F3EF]'
                          }`}
                        >
                          {{ all: 'All Time', today: 'Today', week: 'This Week', month: 'This Month', quarter: 'This Quarter', year: 'This Year' }[preset]}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Custom date range */}
                  <div className="p-3">
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-2">Custom Range</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-[#9B9BAD] block mb-1">From</label>
                        <input
                          type="date"
                          value={customFrom}
                          onChange={(e) => { setCustomFrom(e.target.value); setDatePreset('custom'); }}
                          className="w-full px-2.5 py-1.5 text-xs border border-[#E8E7E2] rounded-lg bg-[#FAFAF8] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <span className="text-[#9B9BAD] text-xs mt-4">→</span>
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-[#9B9BAD] block mb-1">To</label>
                        <input
                          type="date"
                          value={customTo}
                          onChange={(e) => { setCustomTo(e.target.value); setDatePreset('custom'); }}
                          className="w-full px-2.5 py-1.5 text-xs border border-[#E8E7E2] rounded-lg bg-[#FAFAF8] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => { setDatePreset('all'); setCustomFrom(''); setCustomTo(''); setShowDatePicker(false); fetchData(); }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600"
                      >
                        Clear Filter
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-3 py-1.5 text-[10px] font-bold text-white bg-[#1B4DA0] rounded-lg hover:bg-[#153e82] transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E7E2] rounded-xl text-sm font-semibold text-[#1A1A2E] hover:bg-[#F4F3EF] transition-all shadow-sm active:scale-95"
          >
            <FiRefreshCw className={`w-4 h-4 text-[#1B4DA0] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards — same style as Dashboard Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-[24px] border border-[#E8E7E2] shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-[#F4F3EF] text-black group-hover:text-[#5B9DF0] transition-colors duration-300">
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-4xl font-extrabold text-[#1A1A2E] mb-1">{kpi.value}</p>
              <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest mb-3">{kpi.label}</p>
              <div className="flex items-center gap-1.5 mt-auto">
                {kpi.up === true ? (
                  <ArrowUpRight size={14} className="text-[#1B4DA0]" />
                ) : kpi.up === false ? (
                  <ArrowDownRight size={14} className="text-slate-400" />
                ) : (
                  <Minus size={14} className="text-[#C5C5D2]" />
                )}
                <span className={`text-[10px] font-bold ${kpi.up === null ? 'text-[#9B9BAD]' : 'text-[#1B4DA0]'}`}>{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidates Pie Chart */}
      {(() => {
        const pieColors = ['#cbd5e1', '#fde68a', '#fcd34d', '#fdba74', '#fbbf24', '#c4b5fd', '#93c5fd'];
        const chartData = funnelStages
          .map((stage, i) => ({
            name: STAGE_CONFIG[stage].label,
            value: computedFunnel[stage] || 0,
            fill: pieColors[i],
          }))
          .filter(d => d.value > 0);

        const totalCandidates = chartData.reduce((sum, d) => sum + d.value, 0);

        return (
          <div className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                <FiUsers className="w-5 h-5 text-[#1B4DA0]" /> Candidates
              </h2>
              <span className="text-sm font-semibold text-[#9B9BAD]">{totalCandidates} total</span>
            </div>
            {totalCandidates === 0 ? (
              <div className="flex flex-col items-center justify-center h-[280px]">
                <FiUsers className="w-10 h-10 text-[#E8E7E2] mb-3" />
                <p className="text-sm text-[#9B9BAD]">No candidates in pipeline</p>
              </div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E8E7E2', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px', fontWeight: 600, padding: '8px 14px' }}
                      formatter={(value, name) => [`${value} candidates`, name]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#6B6B7E' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {computedFunnel.rejected > 0 && (
              <p className="text-xs mt-2 text-[#9B9BAD] text-center">
                <span className="text-red-500 font-bold">{computedFunnel.rejected}</span> candidate{computedFunnel.rejected > 1 ? 's' : ''} rejected
              </p>
            )}
          </div>
        );
      })()}

      {/* Positions & Upcoming Interviews Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Positions List */}
        <div className="lg:col-span-8 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              <FiBriefcase className="w-5 h-5 text-amber-500" /> Positions ({filteredPositions.length})
            </h2>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E8E7E2] bg-[#F4F3EF] text-[#1A1A2E] outline-none cursor-pointer focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Urgent">Urgent</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {filteredPositions.length === 0 ? (
            <p className="text-sm text-center py-8 text-[#9B9BAD]">No positions found</p>
          ) : (
            <div className="space-y-3">
              {filteredPositions.map(pos => {
                const isExpanded = expandedPosition === pos.id;
                const progress = pos.openings ? Math.round((pos.filled / pos.openings) * 100) : 0;
                const posCandidates = dateFilteredCandidates.filter(c => c.position === pos.title);

                return (
                  <div key={pos.id} className="rounded-2xl border border-[#E8E7E2] bg-[#FAFAF8] overflow-hidden hover:shadow-sm transition-all">
                    <button
                      onClick={() => setExpandedPosition(isExpanded ? null : pos.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F4F3EF] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#1A1A2E] truncate">{pos.title}</span>
                          <StatusBadge status={pos.status} />
                          <PriorityBadge priority={pos.priority} />
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#9B9BAD] font-medium">
                          {pos.location && <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{pos.location}</span>}
                          <span>{pos.type}</span>
                          <span>{pos.candidateCount} candidate{pos.candidateCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Progress ring */}
                        <div className="relative w-10 h-10">
                          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8E7E2" strokeWidth="3" />
                            <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1B4DA0" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#1A1A2E]">{pos.filled}/{pos.openings}</span>
                        </div>
                        {isExpanded ? <FiChevronUp className="w-4 h-4 text-[#9B9BAD]" /> : <FiChevronDown className="w-4 h-4 text-[#9B9BAD]" />}
                      </div>
                    </button>

                    {isExpanded && posCandidates.length > 0 && (
                      <div className="border-t border-[#E8E7E2] p-4">
                        <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-3">Candidates in Pipeline</p>
                        <div className="space-y-2">
                          {posCandidates.map(c => (
                            <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-[#E8E7E2]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-[10px] font-bold">
                                  {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="text-xs font-semibold text-[#1A1A2E]">{c.name}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${STAGE_CONFIG[Object.keys(STAGE_CONFIG).find(k => STAGE_CONFIG[k].label === c.stage)]?.bg || 'bg-slate-100 text-slate-600'}`}>
                                {c.stage}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isExpanded && posCandidates.length === 0 && (
                      <div className="border-t border-[#E8E7E2] p-4">
                        <p className="text-xs text-center text-[#9B9BAD]">No candidates yet for this position</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="lg:col-span-4 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            <FiCalendar className="w-5 h-5 text-[#1B4DA0]" /> Upcoming Interviews
          </h2>
          {(!dateFilteredInterviews || dateFilteredInterviews.length === 0) ? (
            <div className="text-center py-12">
              <FiCalendar className="w-10 h-10 mx-auto mb-3 text-[#E8E7E2]" />
              <p className="text-sm text-[#9B9BAD]">No upcoming interviews</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dateFilteredInterviews.map((iv, i) => {
                const date = new Date(iv.interviewDate);
                const isToday = date.toDateString() === new Date().toDateString();
                const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
                const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                return (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#E8E7E2] bg-[#FAFAF8] hover:shadow-sm transition-all">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${isToday ? 'text-white shadow-lg shadow-blue-500/20' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
                      style={isToday ? { background: '#1B4DA0' } : {}}
                    >
                      <span className="text-[10px] font-bold leading-none">{dateLabel}</span>
                      {!isToday && !isTomorrow && <span className="text-[8px] text-[#9B9BAD]">{date.getFullYear()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1A1A2E] truncate">{iv.candidateName}</p>
                      <p className="text-[10px] text-[#9B9BAD] truncate font-medium">{iv.positionTitle}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#9B9BAD]">
                        <FiClock className="w-3 h-3" />
                        <span className="font-medium">{iv.startTime || 'TBD'}</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-[#F4F3EF] text-[#1A1A2E] font-bold text-[9px]">
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
      {dateFilteredCandidates.length > 0 && (
        <div className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            <FiUsers className="w-5 h-5 text-[#1B4DA0]" /> All Candidates ({dateFilteredCandidates.length})
          </h2>
          <div className="overflow-x-auto">
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-4 pb-4 text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] border-b border-[#F4F3EF]">
                <div>Candidate</div>
                <div>Position</div>
                <div>Stage</div>
                <div>Last Updated</div>
              </div>
              {dateFilteredCandidates.slice(0, 20).map(c => (
                <div key={c.id} className="grid grid-cols-4 gap-4 py-3.5 border-b border-[#F4F3EF] last:border-0 hover:bg-[#FAFAF8] transition-colors px-2 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-xs font-bold">
                      {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-semibold text-[#1A1A2E]">{c.name}</span>
                  </div>
                  <div className="text-sm text-[#9B9BAD] flex items-center">{c.position || '—'}</div>
                  <div className="flex items-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${STAGE_CONFIG[Object.keys(STAGE_CONFIG).find(k => STAGE_CONFIG[k].label === c.stage)]?.bg || 'bg-slate-100 text-slate-600'}`}>
                      {c.stage}
                    </span>
                  </div>
                  <div className="text-sm text-[#9B9BAD] flex items-center">
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </div>
                </div>
              ))}
            </div>
            {dateFilteredCandidates.length > 20 && (
              <p className="text-xs text-center pt-4 text-[#9B9BAD] font-medium">Showing 20 of {dateFilteredCandidates.length} candidates</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
