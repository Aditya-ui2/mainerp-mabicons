import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiAward,
  FiBarChart2,
  FiUserPlus,
  FiTrendingUp,
  FiActivity,
  FiCheckSquare,
  FiDatabase,
  FiTarget,
  FiMail,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiMoreVertical,
  FiMoreHorizontal,
  FiSend,
  FiEdit2,
  FiEye,
  FiShare2,
  FiRefreshCw,
  FiX,
  FiTrash2,
  FiPlus,
  FiEdit3,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiDownload,
  FiZap,
  FiStar,
  FiExternalLink,
  FiArrowRight,
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalISODate } from '../Utilities/dateUtils';
import {
  getAllNotifications,
  markNotificationRead,
  getRecruitmentStats,
  getAllRecruitmentPositions,
  getAllInterviews,
  getAllKAMMembers,
  getTeamPerformance,
  assignTaskToKAM,
  createKAMMember,
  updateKAMMember,
  deleteKAMMember,
  getDeptNotes,
  getRecruitmentClients,
} from '../service/api';


// Lazy load Tab Components
const JobOpeningsTab = lazy(() => import('./Tabs/KAMRecruitment/JobOpeningsTab'));
const CandidatePipelineTab = lazy(() => import('../Candidates/CandidatesPage'));
const InterviewScheduleTab = lazy(() => import('../Candidates/InterviewsPage'));
const ScreeningTab = lazy(() => import('./Tabs/KAMRecruitment/ScreeningTab'));
const OfferManagementTab = lazy(() => import('./Tabs/KAMRecruitment/OfferManagementTab'));
const RecruitmentAnalyticsTab = lazy(() => import('./Tabs/KAMRecruitment/RecruitmentAnalyticsTab'));
const ResumeBankTab = lazy(() => import('./Tabs/KAMRecruitment/ResumeBankTab'));
const TeamManagementTab = lazy(() => import('./Tabs/Common/TeamManagementTab'));
const ActivityFeedTab = lazy(() => import('./Tabs/Common/ActivityFeedTab'));
const TaskAssignmentTab = lazy(() => import('./Tabs/Common/TaskAssignmentTab'));
const TeamMISReportsTab = lazy(() => import('./Tabs/Common/TeamMISReportsTab'));
const NotesTab = lazy(() => import('./Tabs/KAM/NotesTab'));
const SettingsTab = lazy(() => import('./Tabs/SettingsTab'));
const SelectionMISTab = lazy(() => import('./Tabs/KAMRecruitment/SelectionMISTab'));

// Tab Loader
const TabLoader = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-7 w-52 rounded-lg bg-gray-200" />
      <div className="h-10 w-32 rounded-lg bg-gray-200" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 rounded-xl bg-gray-200" />
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 w-full rounded-lg bg-gray-100" />
      ))}
    </div>
  </div>
);

// Color assignment for team members - using inline gradients for reliable rendering
const AVATAR_COLORS = [
  { gradient: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  { gradient: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { gradient: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  { gradient: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  { gradient: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
];

const hasMeaningfulStats = (stats = {}) =>
  (stats.activePositions || 0) > 0 ||
  (stats.candidatesPipeline || 0) > 0 ||
  (stats.interviewsScheduled || 0) > 0 ||
  (stats.offersExtended || 0) > 0 ||
  (stats.thisWeekHires || 0) > 0 ||
  (stats.profilesShared || 0) > 0 ||
  (stats.callsDone || 0) > 0 ||
  (stats.pendingTasks || 0) > 0 ||
  (stats.completedTasks || 0) > 0;

const getEffectiveKamStats = (kam) =>
  hasMeaningfulStats(kam?.stats)
    ? kam.stats
    : {
      activePositions: 0,
      candidatesPipeline: 0,
      interviewsScheduled: 0,
      offersExtended: 0,
      thisWeekHires: 0,
      profilesShared: 0,
      callsDone: 0,
      pendingTasks: 0,
      completedTasks: 0,
    };

const getKamCallsBreakdown = (teamData = []) =>
  teamData
    .map((kam) => {
      const effectiveStats = getEffectiveKamStats(kam);

      return {
        ...kam,
        totalCalls: effectiveStats.callsDone || 0,
        activePositions: effectiveStats.activePositions || 0,
        candidatesPipeline: effectiveStats.candidatesPipeline || 0,
      };
    })
    .sort((firstKam, secondKam) => secondKam.totalCalls - firstKam.totalCalls);

const getKamMetricBreakdown = (teamData = [], metricKey) =>
  teamData
    .map((kam) => {
      const effectiveStats = getEffectiveKamStats(kam);

      return {
        ...kam,
        metricValue: effectiveStats[metricKey] || 0,
        effectiveStats,
      };
    })
    .sort((firstKam, secondKam) => secondKam.metricValue - firstKam.metricValue);

// Transform API response to component format
const transformKAMData = (apiData) => {
  if (!Array.isArray(apiData)) return [];

  return apiData.map((member, idx) => ({
    id: member.id || `kam-${idx + 1}`,
    name: member.name || 'Unknown',
    email: member.email || '',
    phone: member.phone || '',
    role: member.role || 'KAM - Recruitment',
    avatar: member.avatar || (member.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    status: member.status || 'Active',
    color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    stats: {
      activePositions: member.stats?.activePositions || 0,
      candidatesPipeline: member.stats?.candidatesPipeline || 0,
      interviewsScheduled: member.stats?.interviewsScheduled || 0,
      offersExtended: member.stats?.offersExtended || 0,
      thisWeekHires: member.stats?.thisWeekHires || 0,
      profilesShared: member.stats?.profilesShared || 0,
      callsDone: member.stats?.callsDone || 0,
      pendingTasks: member.stats?.pendingTasks || 0,
      completedTasks: member.stats?.completedTasks || 0,
    },
    recentActivity: Array.isArray(member.recentActivity) ? member.recentActivity : [],
  }));
};

// Sidebar Configuration for Recruitment Head
const sidebarConfig = [
  {
    items: [
      { id: 'team-overview', title: 'Team Overview', icon: FiUsers },
      { id: 'task-assignment', title: 'Task Assignment', icon: FiCheckSquare },
      { id: 'job-openings', title: 'Job Openings', icon: FiBriefcase },
      { id: 'candidates', title: 'Candidate Pipeline', icon: FiUserPlus },
      { id: 'interviews', title: 'Interview Schedule', icon: FiCalendar },
      { id: 'offers', title: 'Offer Management', icon: FiAward },
      { id: 'resume-bank', title: 'Resume Bank', icon: FiDatabase },
      { id: 'activity-feed', title: 'Activity Feed', icon: FiActivity },
      { id: 'mis-reports', title: 'Team MIS Reports', icon: FiBarChart2 },
      { id: 'notes', title: 'Notes', icon: FiEdit2 },

    ],
  },
];

// KAM Card Component
const KAMCard = ({ kam, onViewDetails, onAssignTask, onMessage, index = 0 }) => {
  const [showMenu, setShowMenu] = useState(false);

  const CARD_BG_COLORS = [
    '#F8FAFC', // slate-50
    '#F1F5F9', // slate-100
    '#EFF6FF', // blue-50
    '#F0FDF4', // emerald-50
    '#F5F3FF', // violet-50
  ];
  const cardBg = CARD_BG_COLORS[index % CARD_BG_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onViewDetails(kam)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails(kam);
        }
      }}
    >
      {/* Header with gradient */}
      <div
        className="h-20 relative"
        style={{ backgroundColor: cardBg }}
      >
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 border-4 border-white">
            {kam.avatar}
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${kam.status === 'Active' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'
            }`}>
            {kam.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 px-6 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{kam.name}</h3>
            <p className="text-sm text-gray-500">{kam.role}</p>
          </div>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiMoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails(kam); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FiEye className="w-4 h-4" /> View Details
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAssignTask(kam); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FiCheckSquare className="w-4 h-4" /> Assign Task
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onMessage(kam); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FiSend className="w-4 h-4" /> Send Message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm text-gray-500 mb-5">
          <div className="flex items-center gap-2">
            <FiMail className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span className="truncate" title={kam.email}>{kam.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiPhone className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>{kam.phone}</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

// Team Overview Tab Content
const TeamOverviewContent = ({ teamData, loading, onViewKAM, onAssignTask, onMessage, onRefresh, onAddKAM, onEditKAM, onDeleteMultiple, globalStats, onViewCallsBreakdown }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedKAMs, setSelectedKAMs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSelection = (id) => setSelectedKAMs(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  const toggleAll = () => setSelectedKAMs(selectedKAMs.length === filteredTeamData.length && filteredTeamData.length > 0 ? [] : filteredTeamData.map(k => k.id));

  const filteredTeamData = teamData.filter(kam => {
    if (activeFilter !== 'All') {
      const role = kam.role?.toLowerCase() || '';
      if (activeFilter === 'Recruiters' && !(role.includes('recruit') || role.includes('hr'))) return false;
      if (activeFilter === 'KAMs' && !role.includes('kam')) return false;
      if (activeFilter === 'Admins' && !(role.includes('admin') || role.includes('manager'))) return false;
      if (activeFilter === 'Engineering' && !(role.includes('engin') || role.includes('dev'))) return false;
    }
    if (searchQuery && !kam.name.toLowerCase().includes(searchQuery.toLowerCase()) && !kam.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const teamAggregatedStats = teamData.reduce(
    (acc, kam) => ({
      activePositions: acc.activePositions + (kam.stats?.activePositions || 0),
      candidatesPipeline: acc.candidatesPipeline + (kam.stats?.candidatesPipeline || 0),
      interviewsScheduled: acc.interviewsScheduled + (kam.stats?.interviewsScheduled || 0),
      offersExtended: acc.offersExtended + (kam.stats?.offersExtended || 0),
      thisWeekHires: acc.thisWeekHires + (kam.stats?.thisWeekHires || 0),
      profilesShared: acc.profilesShared + (kam.stats?.profilesShared || 0),
      callsDone: acc.callsDone + (kam.stats?.callsDone || 0),
    }),
    { activePositions: 0, candidatesPipeline: 0, interviewsScheduled: 0, offersExtended: 0, thisWeekHires: 0, profilesShared: 0, callsDone: 0 }
  );

  // Use global stats if available, otherwise fallback to team aggregation
  const displayStats = {
    activePositions: globalStats?.activePositions ?? teamAggregatedStats.activePositions,
    candidatesPipeline: globalStats?.totalCandidates ?? teamAggregatedStats.candidatesPipeline,
    interviewsScheduled: globalStats?.scheduledInterviews ?? teamAggregatedStats.interviewsScheduled,
    offersExtended: globalStats?.pendingOffers ?? teamAggregatedStats.offersExtended,
    thisWeekHires: globalStats?.thisWeekHires ?? teamAggregatedStats.thisWeekHires,
    profilesShared: globalStats?.sharedProfiles ?? teamAggregatedStats.profilesShared,
    callsDone: globalStats?.phoneScreeningCalls ?? teamAggregatedStats.callsDone,
  };
  return (
    <div className="space-y-6" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Detached Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Team Overview</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Manage and track your recruitment team efficiency</p>
        </div>
        <div className="flex items-center gap-3">
          {onAddKAM && (
            <button
              onClick={onAddKAM}
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B4DA0] hover:bg-[#153b7a] text-white rounded-xl text-sm font-semibold transition-all shadow-sm whitespace-nowrap"
            >
              <FiPlus className="w-4 h-4" strokeWidth="3" />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Team Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden relative">
        <div className="px-6 py-5 border-b border-gray-100 space-y-4">
          <h2 className="text-[17px] font-bold text-[#0f172a]">Team Directory</h2>
          <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm">
            <div className="flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-5 py-3">
              <FiSearch className="w-[18px] h-[18px] text-[#9B9BAD] flex-shrink-0" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, email..."
                className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-transparent">
                <th className="py-4 pl-6 pr-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedKAMs.length > 0 && selectedKAMs.length === filteredTeamData.length}
                    onChange={toggleAll}
                    style={{ accentColor: '#2563eb' }}
                    className="w-4 h-4 rounded text-[#2563eb] cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Member</th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Role</th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Email Address</th>
                <th className="py-4 pl-4 pr-6 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest w-24">Contact</th>
                <th className="py-4 pr-6 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-left">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#94a3b8] font-medium">Loading members...</td>
                </tr>
              ) : filteredTeamData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#94a3b8] font-medium">No members found matching your filters.</td>
                </tr>
              ) : (
                filteredTeamData.map((kam) => (
                  <tr key={kam.id} onClick={() => onViewKAM(kam)} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="py-4 pl-6 pr-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedKAMs.includes(kam.id)}
                        onChange={() => toggleSelection(kam.id)}
                        style={{ accentColor: '#2563eb' }}
                        className="w-4 h-4 rounded text-[#2563eb] cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        {kam.profilePhoto ? (
                          <img src={kam.profilePhoto} alt={kam.name} className="w-[42px] h-[42px] rounded-[14px] object-cover border border-[#E0E7FF] flex-shrink-0" />
                        ) : (
                          <div className="w-[42px] h-[42px] rounded-[14px] bg-[#F0F7FF] flex items-center justify-center text-[13px] font-bold text-[#1B4DA0] border border-[#E0E7FF] flex-shrink-0">
                            {kam.avatar}
                          </div>
                        )}
                        <span className="text-[14px] font-bold text-[#0f172a]">{kam.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[13px] font-medium text-[#64748b]">{kam.role}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[13px] font-medium text-[#64748b]">{kam.email}</span>
                    </td>
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center gap-3">
                        <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors"><FiMail className="w-[15px] h-[15px] stroke-[2.5]" /></button>
                        <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors"><FiPhone className="w-[15px] h-[15px] stroke-[2.5]" /></button>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditKAM && onEditKAM(kam); }}
                        className="px-3 py-1.5 text-[11px] font-bold text-[#1B4DA0] bg-[#F0F7FF] hover:bg-[#E0EDFF] border border-[#E0E7FF] rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5"
                      >
                        <FiEdit2 className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Action Bar */}
        <AnimatePresence>
          {selectedKAMs.length > 0 && (
            <div className="absolute bottom-6 left-0 w-full flex justify-center z-[100] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="bg-[#111827] text-white px-5 py-2.5 rounded-[12px] shadow-2xl flex items-center pointer-events-auto"
              >
                <div className="flex items-center">
                  <span className="text-[13.5px] font-semibold pr-4 border-r border-[#374151]">
                    {selectedKAMs.length} members selected
                  </span>
                  <div className="flex items-center gap-5 pl-4 text-[13px] font-semibold">

                    <button
                      onClick={async () => {
                        const success = await onDeleteMultiple(selectedKAMs);
                        if (success) setSelectedKAMs([]);
                      }}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 stroke-[2.5]" /> Remove
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedKAMs([])}
                    className="ml-6 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
                    title="Clear Selection"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

// KAM Performance Tab Content
const KAMPerformanceContent = ({
  teamData,
  loading,
  dateFilter,
  setDateFilter,
  months,
  years,
  getFilterLabel,
  showDateFilter,
  setShowDateFilter,
  onViewPerformance,
  clientFilter,
  setClientFilter,
  clients,
  fetchDashboardData,
  fetchKAMTeam
}) => {
  const [activeMetric, setActiveMetric] = useState('callsDone');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const compactDateInputRef = useRef(null);

  const clientNames = ['All Client', ...clients.map(c => c.companyName || c.name)];

  const filteredData = clientFilter === 'All Client'
    ? teamData
    : teamData.filter(kam => kam.client === clientFilter || (Array.isArray(kam.clients) && kam.clients.includes(clientFilter)));

  const openDatePicker = (ref) => {
    if (ref && ref.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try { ref.current.showPicker(); } catch (e) { ref.current.focus(); }
      } else { ref.current.focus(); }
    }
  };

  const totals = filteredData.reduce(
    (acc, kam) => ({
      activePositions: acc.activePositions + (kam.stats?.activePositions || 0),
      candidatesPipeline: acc.candidatesPipeline + (kam.stats?.candidatesPipeline || 0),
      interviewsScheduled: acc.interviewsScheduled + (kam.stats?.interviewsScheduled || 0),
      offersExtended: acc.offersExtended + (kam.stats?.offersExtended || 0),
      thisWeekHires: acc.thisWeekHires + (kam.stats?.thisWeekHires || 0),
      profilesShared: acc.profilesShared + (kam.stats?.profilesShared || 0),
      callsDone: acc.callsDone + (kam.stats?.callsDone || 0),
    }),
    { activePositions: 0, candidatesPipeline: 0, interviewsScheduled: 0, offersExtended: 0, thisWeekHires: 0, profilesShared: 0, callsDone: 0 }
  );

  const graphMetrics = [
    { key: 'callsDone', label: 'Total Calling', color: '#ef4444', bg: 'bg-rose-100', text: 'text-rose-700' },
    { key: 'candidatesPipeline', label: 'Candidates', color: '#8b5cf6', bg: 'bg-violet-100', text: 'text-violet-700' },
    { key: 'interviewsScheduled', label: 'Interviews', color: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-700' },
    { key: 'offersExtended', label: 'Offers', color: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-700' },
    { key: 'thisWeekHires', label: 'Hires', color: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  ];

  const selectedMetric = graphMetrics.find((metric) => metric.key === activeMetric) || graphMetrics[0];
  const sortedBySelectedMetric = [...filteredData].sort(
    (firstKam, secondKam) => (secondKam.stats?.[selectedMetric.key] || 0) - (firstKam.stats?.[selectedMetric.key] || 0)
  );
  const maxSelectedMetricValue = Math.max(
    ...sortedBySelectedMetric.map((kam) => kam.stats?.[selectedMetric.key] || 0),
    1
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gray-200" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-gray-100 rounded-full" />
                <div className="h-2 bg-gray-100 rounded-full" />
                <div className="h-2 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="text-left w-full">
          <h1 className="text-3xl font-bold text-[#1A1A2E] text-left" style={{ fontFamily: "'Syne', sans-serif" }}>KAM Performance</h1>
          <p className="text-[#6B6B7E] text-sm mt-1 font-medium text-left">Real-time performance metrics and key account health tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Client Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowClientDropdown(!showClientDropdown)}
              className="px-4 py-2.5 bg-white border border-[#E8E7E2] text-[#1A1A2E] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <FiBriefcase size={16} className="text-[#1B4DA0]" />
              <span className="whitespace-nowrap">{clientFilter}</span>
              <svg className={`w-4 h-4 ml-1 transition-transform ${showClientDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showClientDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                {clientNames.map((client) => (
                  <button
                    key={client}
                    onClick={() => {
                      setClientFilter(client);
                      setShowClientDropdown(false);
                      fetchDashboardData(dateFilter, 'All Team', client);
                      fetchKAMTeam(dateFilter, client);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${clientFilter === client ? 'bg-[#1B4DA0]/5 text-[#1B4DA0] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {client}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="px-5 py-2.5 bg-[#1B4DA0] text-white rounded-xl text-sm font-semibold hover:bg-[#153e82] transition-all shadow-md flex items-center gap-2 active:scale-95 relative z-40 whitespace-nowrap min-w-max"
            >
              <FiCalendar size={16} />
              <span className="whitespace-nowrap inline-flex items-center gap-2">{getFilterLabel()}</span>
              <svg className={`w-4 h-4 ml-1 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Filter Dropdown */}
            {showDateFilter && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <p className="font-semibold text-gray-900">Select Time Period</p>
                </div>

                {/* Filter Type Tabs */}
                <div className="flex border-b border-gray-100">
                  {[
                    { key: 'all', label: 'All Time' },
                    { key: 'last7days', label: 'Last 7 Days' },
                    { key: 'year', label: 'Year' },
                    { key: 'month', label: 'Month' },
                    { key: 'date', label: 'Date' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setDateFilter({ ...dateFilter, filterType: tab.key })}
                      className={`flex-1 px-3 py-3 text-sm font-medium transition-all ${dateFilter.filterType === tab.key
                        ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Filter Options */}
                <div className="p-4 space-y-4">
                  {dateFilter.filterType === 'year' && (
                    <select
                      value={dateFilter.year}
                      onChange={(e) => setDateFilter({ ...dateFilter, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  )}

                  {dateFilter.filterType === 'month' && (
                    <>
                      <select
                        value={dateFilter.year}
                        onChange={(e) => setDateFilter({ ...dateFilter, year: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <select
                        value={dateFilter.month}
                        onChange={(e) => setDateFilter({ ...dateFilter, month: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {months.map((month, idx) => (
                          <option key={idx} value={idx}>{month}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {dateFilter.filterType === 'date' && (
                    <>
                      <div
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer"
                        onClick={() => openDatePicker(compactDateInputRef)}
                      >
                        <input
                          ref={compactDateInputRef}
                          type="date"
                          value={dateFilter.date}
                          onChange={(e) => setDateFilter({ ...dateFilter, date: e.target.value })}
                          className="w-full bg-transparent border-0 p-0 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDateFilter({ ...dateFilter, date: getLocalISODate() })}
                          className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => {
                            setDateFilter({ ...dateFilter, date: getLocalISODate(-1) });
                          }}
                          className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          Yesterday
                        </button>
                        <button
                          onClick={() => setDateFilter({ ...dateFilter, filterType: 'last7days' })}
                          className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          Last 7 Days
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Jobs", value: totals.activePositions, icon: FiBriefcase },
          { label: "Candidates", value: totals.candidatesPipeline, icon: FiTarget },
          { label: "Interviews", value: totals.interviewsScheduled, icon: FiTrendingUp },
          { label: "Offers", value: totals.offersExtended, icon: FiZap },
          { label: "Hires", value: totals.thisWeekHires, icon: FiAward },
          { label: "Profiles", value: totals.profilesShared, icon: FiUsers },
          { label: "Calling", value: totals.callsDone, icon: FiPhone },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E8E7E2] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F4F3EF] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500 opacity-50" />
            <div className="relative z-10 flex flex-col items-start text-left">
              <div className="p-2.5 rounded-xl bg-white text-black group-hover:text-[#0D47A1] transition-colors duration-300 w-fit mb-3">
                <kpi.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-[#1A1A2E] leading-none mb-1">{kpi.value}</p>
              <p className="text-xs font-medium text-[#6B6B7E]">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {(() => {
        const topKAMs = [...teamData].sort((a, b) => b.stats.thisWeekHires - a.stats.thisWeekHires);
        return (
          <>
            {/* Compact Leaderboard Podium */}
            {topKAMs.length >= 3 && (
              <div className="mb-10">
                <div className="bg-white rounded-[32px] border border-[#E8E7E2] p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-around gap-8">
                  <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-transparent via-[#1B4DA0]/20 to-transparent" />

                  {/* 2nd Place */}
                  <div className="flex items-center gap-4 group">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-[22px] bg-[#F0F7FF] flex items-center justify-center text-[#1B4DA0] font-bold border border-[#E0E7FF] shadow-sm transform group-hover:scale-105 transition-transform text-lg">
                        {topKAMs[1].avatar}
                      </div>
                      <div className="absolute -top-2 -right-2 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white font-bold text-[10px]">2</div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A2E]">{topKAMs[1].name}</p>
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Hires: {topKAMs[1].stats.thisWeekHires}</p>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex items-center gap-5 group py-4 px-8 bg-[#1B4DA0]/5 rounded-[28px] border border-[#1B4DA0]/10 relative">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-[28px] flex items-center justify-center text-[#1B4DA0] text-2xl font-bold border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform bg-[#F0F7FF]">
                        {topKAMs[0].avatar}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 animate-pulse">
                          <FiAward size={32} className="fill-amber-400" />
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-amber-400 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white font-bold text-xs shadow-md">1</div>
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#1A1A2E]">{topKAMs[0].name}</p>
                      <p className="text-xs font-bold text-[#1B4DA0] uppercase tracking-widest">Hires: {topKAMs[0].stats.thisWeekHires}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <FiStar size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase">Top Performer</span>
                      </div>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex items-center gap-4 group">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-[22px] bg-[#F0F7FF] flex items-center justify-center text-[#1B4DA0] font-bold border border-[#E0E7FF] shadow-sm transform group-hover:scale-105 transition-transform text-lg">
                        {topKAMs[2].avatar}
                      </div>
                      <div className="absolute -top-2 -right-2 bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white font-bold text-[10px]">3</div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A2E]">{topKAMs[2].name}</p>
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Hires: {topKAMs[2].stats.thisWeekHires}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </>
        );
      })()}

      {/* Top Performers Table */}
      <div className="bg-white rounded-[24px] border border-[#E8E7E2] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAward className="text-[#1B4DA0]" size={22} />
            <h2 className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Top Performers</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center bg-[#F4F3EF] rounded-xl px-3 py-2 border border-transparent focus-within:border-[#1B4DA0]/20 transition-all">
              <FiSearch size={14} className="text-[#9B9BAD] mr-2" />
              <input type="text" placeholder="Search KAM..." className="bg-transparent text-xs outline-none w-32 border-0 focus:ring-0 font-medium" />
            </div>
            <button className="p-2 bg-[#F4F3EF] rounded-xl text-[#6B6B7E] hover:bg-[#E8E7E2] transition-colors">
              <FiFilter size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAF8] text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">
                <th className="px-10 py-4">Account Manager</th>
                <th className="px-10 py-4 text-right">Hiring Target</th>
                <th className="px-10 py-4 text-right">Conv. Rate</th>
                <th className="pl-10 pr-6 py-4 text-right">Target Accomp.</th>
                <th className="px-10 py-4 text-right">Offers Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredData.map((kam) => {
                const convRate = kam.stats.interviewsScheduled > 0 ? Math.round((kam.stats.offersExtended / kam.stats.interviewsScheduled) * 100) : 0;
                const targetPercentage = Math.min((kam.stats.thisWeekHires / 5) * 100, 100);

                return (
                  <tr
                    key={kam.id}
                    onClick={() => onViewPerformance(kam)}
                    className="hover:bg-[#FAFAF8] transition-all group cursor-pointer"
                  >
                    <td className="px-10 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-[16px] flex items-center justify-center text-[#1B4DA0] font-bold text-lg shadow-sm group-hover:scale-110 transition-transform bg-[#F0F7FF] border border-[#E0E7FF]">
                            {kam.avatar}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-[#1A1A2E]">{kam.name}</span>
                          </div>
                          <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{kam.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <FiStar size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-[#1A1A2E]">{kam.stats.thisWeekHires} <span className="text-[#9B9BAD]">/ 5</span></span>
                      </div>
                    </td>
                    <td className="px-10 py-4 text-sm text-[#4B4B5E] font-semibold text-right">{convRate}%</td>
                    <td className="pl-10 pr-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="relative w-11 h-11 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="22" cy="22" r="19" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-[#F4F3EF]" />
                            <circle cx="22" cy="22" r="19" stroke="currentColor" strokeWidth="3.5" fill="transparent" strokeDasharray={119} strokeDashoffset={119 - (119 * targetPercentage) / 100} className="text-[#1B4DA0]" />
                          </svg>
                          <span className="absolute text-[10px] font-bold text-[#1B4DA0]">{targetPercentage}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-emerald-600">
                        <FiTrendingUp size={14} />
                        <span className="text-sm font-bold">+{kam.stats.offersExtended}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performer Detail Drawer - MOVED TO GLOBAL Dashboard LEVEL */}

      {/* Graphical Comparison */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left w-full lg:w-auto flex flex-col items-start">
            <h3 className="text-xl font-bold text-slate-900 text-left">KAM Comparison Graph</h3>
            <p className="text-sm text-slate-600 text-left mt-1">Visual comparison by selected metric for {getFilterLabel()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {graphMetrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${selectedMetric.key === metric.key
                  ? `${metric.bg} ${metric.text} ring-2 ring-white shadow`
                  : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white/90 p-4 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Metric</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{selectedMetric.label}</p>
          </div>
          <div className="rounded-xl bg-white/90 p-4 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Team Total</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{totals[selectedMetric.key] || 0}</p>
          </div>
          <div className="rounded-xl bg-white/90 p-4 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Performer</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{sortedBySelectedMetric[0]?.name || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-5">
          <div className="mb-4 grid grid-cols-[120px_1fr_56px] gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <p>KAM</p>
            <p>Performance Bar</p>
            <p className="text-right">Value</p>
          </div>

          <div className="space-y-3">
            {sortedBySelectedMetric.map((kam) => {
              const value = kam.stats?.[selectedMetric.key] || 0;
              const widthPercent = Math.max((value / maxSelectedMetricValue) * 100, value > 0 ? 8 : 0);

              return (
                <div key={`${selectedMetric.key}-${kam.id}`} className="grid grid-cols-[120px_1fr_56px] items-center gap-3">
                  <p className="truncate text-xs font-semibold text-slate-700" title={kam.name}>{kam.name}</p>
                  <div className="relative h-8 overflow-hidden rounded-lg bg-slate-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                      style={{ width: `${widthPercent}%`, backgroundColor: '#0D47A1' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white">
                      {maxSelectedMetricValue > 0 ? `${Math.round((value / maxSelectedMetricValue) * 100)}% of top` : '0%'}
                    </div>
                  </div>
                  <p className="text-right text-sm font-bold text-slate-900">{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const Icon = type === 'success' ? FiCheckCircle : type === 'error' ? FiAlertCircle : FiAlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 12, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-[200] ${bgColor} text-white px-8 py-4 rounded-b-2xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md border-b border-x border-white/20`}
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors">
        <FiX className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Main Dashboard Component
const RecruitmentHeadDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'Sachin', role: 'Recruitment Head' });
  const [notifications, setNotifications] = useState([]);
  const [selectedKAM, setSelectedKAM] = useState(null);
  const [showKAMModal, setShowKAMModal] = useState(false);
  const [showCallsBreakdownModal, setShowCallsBreakdownModal] = useState(false);
  const [showStatsInsightModal, setShowStatsInsightModal] = useState(false);
  const [statsInsightType, setStatsInsightType] = useState(null);
  const [showKAMFormModal, setShowKAMFormModal] = useState(false);
  const [kamFormMode, setKamFormMode] = useState('add'); // 'add' or 'edit'
  const [kamFormData, setKamFormData] = useState({ name: '', email: '', phone: '', role: 'KAM - Recruitment' });
  const [kamTeam, setKamTeam] = useState([]);
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }
  const [performanceKam, setPerformanceKam] = useState(null);
  const [stats, setStats] = useState({
    activePositions: 0,
    totalCandidates: 0,
    scheduledInterviews: 0,
    pendingOffers: 0,
    sharedProfiles: 0,
    phoneScreeningCalls: 0,
    selected: 0,
    totalHires: 0,
    acceptedOffers: 0,
    rejectedOffers: 0,
    pendingTasks: 0,
    totalNotes: 0,
    candidates: { total: 0, shortlisted: 0, rejected: 0, selected: 0 },
    interviews: { total: 0, scheduled: 0, pending: 0, rejected: 0 },
    annualSummary: [],
  });
  const [statsBarData, setStatsBarData] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  // Live Time Display
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDateFull = (date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const kamCallsBreakdown = getKamCallsBreakdown(kamTeam);
  const teamCallsTotal = kamCallsBreakdown.reduce((sum, kam) => sum + kam.totalCalls, 0);
  const activePositionsBreakdown = getKamMetricBreakdown(kamTeam, 'activePositions');
  const candidatesBreakdown = getKamMetricBreakdown(kamTeam, 'candidatesPipeline');
  const profilesSharedBreakdown = getKamMetricBreakdown(kamTeam, 'profilesShared');
  const offersBreakdown = getKamMetricBreakdown(kamTeam, 'offersExtended');
  const hiresBreakdown = getKamMetricBreakdown(kamTeam, 'thisWeekHires');

  // Date Filter State - Default to All Time for total visibility
  const [dateFilter, setDateFilter] = useState({
    filterType: 'all', // Default to all time
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    date: getLocalISODate(),
  });


  const chartDateInputRef = useRef(null);


  // Activity filter state
  const [activityFilter, setActivityFilter] = useState('Calls');
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const activityDropdownRef = useRef(null);

  const [showDateFilter, setShowDateFilter] = useState(false);
  const compactDateInputRef = useRef(null);
  const dashboardDateInputRef = useRef(null);

  // New Team and Client Filter States
  const [teamFilter, setTeamFilter] = useState('All Team');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const teamDropdownRef = useRef(null);

  const [clientFilter, setClientFilter] = useState('All Client');
  const [clients, setClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientDropdownRef = useRef(null);

  // Generate years from 2020 to current year + 1
  const years = Array.from({ length: new Date().getFullYear() - 2019 + 1 }, (_, i) => 2020 + i);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Get filter label for display
  const getFilterLabel = () => {
    switch (dateFilter.filterType) {
      case 'last7days':
        return 'Last 7 Days';
      case 'year':
        return `Year: ${dateFilter.year}`;
      case 'month':
        return `${months[dateFilter.month]} ${dateFilter.year}`;
      case 'date':
        return new Date(dateFilter.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      default:
        return 'All Time';
    }
  };

  // Helper for dynamic Summary Chart data
  const getSummaryChartData = () => {
    return stats.annualSummary || [];
  };

  // Helper for dynamic Pipeline Chart data
  const getPipelineChartData = () => {
    // Stage counts from stats state
    const { total = 0, selected = 0, rejected = 0 } = stats.candidates || {};
    const pending = Math.max(0, total - (selected + rejected));

    return [
      { name: 'PENDING', value: pending, color: '#8B5CF6' },
      { name: 'APPROVED', value: selected, color: '#F59E0B' },
      { name: 'REJECTED', value: rejected, color: '#EE4266' },
    ];
  };

  const buildDateFilterParams = (filter = dateFilter) => {
    if (filter.filterType === 'last7days') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      return {
        startDate: getLocalISODate(-6),
        endDate: getLocalISODate(),
      };
    }

    if (filter.filterType === 'year') {
      return { year: filter.year };
    }

    if (filter.filterType === 'month') {
      return { year: filter.year, month: filter.month + 1 };
    }

    if (filter.filterType === 'date') {
      return { date: filter.date };
    }

    return {};
  };

  // Click outside listener for filters
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Date dropdown logic

      // Activity dropdown logic
      if (activityDropdownRef.current && !activityDropdownRef.current.contains(event.target)) {
        setShowActivityDropdown(false);
      }
      // Team dropdown logic
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target)) {
        setShowTeamDropdown(false);
      }
      // Client dropdown logic
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openDatePicker = (inputRef) => {
    const input = inputRef?.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  // Fetch KAM Team data from API
  const fetchKAMTeam = async (filter = dateFilter, client = clientFilter) => {
    try {
      setTeamLoading(true);
      const filterParams = buildDateFilterParams(filter);

      // Inject client filter if selected
      if (client && client !== 'All Client') {
        // Find existing client ID from clients list
        const clientObj = clients.find(c => (c.companyName || c.name) === client);
        if (clientObj) {
          filterParams.client = clientObj.id;
        }
      }

      console.log('Fetching KAM team with filter:', filterParams);
      const response = await getAllKAMMembers(filterParams);
      if (response.success && response.data?.length > 0) {
        const transformedData = transformKAMData(response.data);
        setKamTeam(transformedData);
        console.log('KAM team loaded from API:', transformedData.length, 'members');
      }
    } catch (error) {
      console.error('Failed to fetch KAM team:', error.message);
      // Keep mock data if necessary, but we target live data
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchClientList = async () => {
    try {
      const res = await getRecruitmentClients();
      if (res.success) {
        setClients(res.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch clients:', e);
    }
  };

  const fetchRecentNotes = async () => {
    try {
      setNotesLoading(true);
      const response = await getDeptNotes({ department: 'HR Recruitment', limit: 5 });
      if (response?.success) {
        setRecentNotes(response.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent notes:', error);
      setRecentNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          name: decoded.name || localStorage.getItem('userName') || 'Sachin',
          role: 'Recruitment Head'
        });
        fetchNotifications(decoded.id || decoded.userId);
        fetchDashboardData();
        fetchKAMTeam();
        fetchClientList();
        fetchRecentNotes();
      } catch (e) {
        console.log('Token decode error');
        setUserInfo({ name: localStorage.getItem('userName') || 'Sachin', role: 'Recruitment Head' });
        fetchKAMTeam();
        fetchClientList();
        fetchRecentNotes();
      }
    } else {
      fetchKAMTeam();
      fetchClientList();
      fetchRecentNotes();
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'Dashboard') return;
    const timer = setInterval(() => {
      fetchRecentNotes();
    }, 30000);
    return () => clearInterval(timer);
  }, [activeTab]);

  // Apply filter and refresh data
  const applyDateFilter = () => {
    setShowDateFilter(false);
    fetchDashboardData(dateFilter, teamFilter, clientFilter);
    fetchKAMTeam(dateFilter, clientFilter);
  };

  const fetchDashboardData = async (filter = dateFilter, team = teamFilter, client = clientFilter, activity = activityFilter) => {
    try {
      setLoading(true);

      // Build filter params for API
      const filterParams = buildDateFilterParams(filter);
      if (team && team !== 'All Team') {
        const member = kamTeam.find(k => k.name === team);
        if (member) {
          filterParams.teamMember = member.id;
        }
      }

      // Inject client filter if selected
      if (client && client !== 'All Client') {
        const clientObj = clients.find(c => (c.companyName || c.name) === client);
        if (clientObj) {
          filterParams.client = clientObj.id;
        }
      }

      // Inject activity type
      if (activity) {
        filterParams.activityType = activity;
      }

      console.log('Fetching stats with filter:', filterParams);
      const statsRes = await getRecruitmentStats(filterParams);
      console.log('Stats response:', statsRes);

      if (statsRes.success) {
        const s = statsRes.data;
        // Use actual values, not fallbacks - show 0 if no data for filtered period
        setStats({
          activePositions: s.positions?.open ?? 0,
          totalCandidates: s.candidates?.total ?? 0,
          scheduledInterviews: s.interviews?.scheduled ?? 0,
          pendingOffers: s.funnel?.offerSent ?? 0,
          sharedProfiles: s.candidates?.sharedCVs ?? 0,
          phoneScreeningCalls: s.funnel?.phoneInterview ?? 0,
          selected: s.candidates?.selected ?? 0,
          totalHires: s.funnel?.joined ?? 0,
          acceptedOffers: s.funnel?.joined ?? 0,
          rejectedOffers: s.funnel?.rejected ?? 0,
          pendingTasks: s.pendingTasks ?? 0,
          totalNotes: s.totalNotes ?? 0,
          candidates: s.candidates || { total: 0, shortlisted: 0, rejected: 0, selected: 0 },
          interviews: s.interviews || { total: 0, scheduled: 0, pending: 0, rejected: 0 },
          annualSummary: s.annualSummary || [],
        });

        const total = s.candidates?.total ?? 0;
        const screening = s.funnel?.screening ?? 0;
        const interviewed = (s.funnel?.phoneInterview || 0) + (s.funnel?.technical || 0) + (s.funnel?.hrRound || 0) + (s.funnel?.clientInterview || 0);
        const selected = s.candidates?.selected ?? 0;

        const barData = [
          { label: 'TOTAL CANDIDATES', value: total, percentage: '100%', color: 'bg-blue-500' },
          { label: 'IN INTERVIEW', value: interviewed || s.candidates?.shortlisted || 0, percentage: total > 0 ? `${Math.round(((interviewed || s.candidates?.shortlisted || 0) / total) * 100)}%` : '0%', color: 'bg-purple-500' },
          { label: 'OFFERS EXTENDED', value: selected, percentage: total > 0 ? `${Math.round((selected / total) * 100)}%` : '0%', color: 'bg-emerald-500' },
        ];
        setStatsBarData(barData);
      }
    } catch (e) {
      console.error('Failed to fetch global stats:', e);
      // Fallback to aggregation if global API fails
      const totalStats = kamTeam.reduce(
        (acc, kam) => ({
          activePositions: acc.activePositions + (kam.stats?.activePositions || 0),
          totalCandidates: acc.totalCandidates + (kam.stats?.candidatesPipeline || 0),
          scheduledInterviews: acc.scheduledInterviews + (kam.stats?.interviewsScheduled || 0),
          pendingOffers: acc.pendingOffers + (kam.stats?.offersExtended || 0),
          thisWeekHires: acc.thisWeekHires + (kam.stats?.thisWeekHires || 0),
          sharedProfiles: acc.sharedProfiles + (kam.stats?.profilesShared || 0),
          phoneScreeningCalls: acc.phoneScreeningCalls + (kam.stats?.callsDone || 0),
        }),
        {
          activePositions: 0,
          totalCandidates: 0,
          scheduledInterviews: 0,
          pendingOffers: 0,
          thisWeekHires: 0,
          sharedProfiles: 0,
          phoneScreeningCalls: 0,
        }
      );
      setStats(totalStats);

      setStatsBarData([
        { label: 'Total Candidates', value: totalStats.totalCandidates, percentage: '100%', color: 'bg-blue-500' },
        { label: 'In Interview', value: totalStats.scheduledInterviews, percentage: '17%', color: 'bg-purple-500' },
        { label: 'Offers Extended', value: totalStats.pendingOffers, percentage: '8%', color: 'bg-green-500' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const res = await getAllNotifications(userId);
      const notifs = (res.data || []).map((n) => ({
        id: n.id,
        text: n.message,
        time: new Date(n.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        read: n.status === 'read',
        type: n.type,
      }));
      setNotifications(notifs);
    } catch (e) {
      console.log('Notification fetch error');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (e) {
        /* ignore */
      }
    }
  };

  const handleViewKAM = (kam) => {
    setSelectedKAM({
      ...kam,
      stats: getEffectiveKamStats(kam),
      recentActivity: kam.recentActivity || []
    });
    setShowKAMModal(true);
  };

  const handleViewCallsBreakdown = () => {
    setShowCallsBreakdownModal(true);
  };

  const handleOpenStatsInsight = (type) => {
    setStatsInsightType(type);
    setShowStatsInsightModal(true);
  };

  const statsInsightConfig = {
    activePositions: {
      title: 'Active Positions Breakdown',
      subtitle: 'KAM-wise open positions and current recruitment load.',
      summaries: [
        { label: 'Active Positions', value: stats.activePositions || 0, tone: 'text-pink-600' },
        { label: 'Team Tracked', value: activePositionsBreakdown.reduce((sum, kam) => sum + kam.metricValue, 0), tone: 'text-indigo-600' },
        { label: 'Active KAMs', value: activePositionsBreakdown.filter((kam) => kam.metricValue > 0).length, tone: 'text-emerald-600' },
      ],
      rows: activePositionsBreakdown,
      valueLabel: 'Open Positions',
      renderMeta: (kam) => `${kam.effectiveStats.candidatesPipeline || 0} candidates Â· ${kam.effectiveStats.interviewsScheduled || 0} interviews`,
    },
    totalCandidates: {
      title: 'Candidate Pipeline Breakdown',
      subtitle: 'KAM-wise candidate ownership across the pipeline.',
      summaries: [
        { label: 'Total Candidates', value: stats.totalCandidates || 0, tone: 'text-slate-900' },
        { label: 'Selected', value: stats.selected || 0, tone: 'text-emerald-600' },
        { label: 'Interviewed', value: stats.scheduledInterviews || 0, tone: 'text-blue-600' },
      ],
      rows: candidatesBreakdown,
      valueLabel: 'Candidates',
      renderMeta: (kam) => `${kam.effectiveStats.profilesShared || 0} shared Â· ${kam.effectiveStats.callsDone || 0} calls`,
    },
    sharedProfiles: {
      title: 'Profiles Shared Breakdown',
      subtitle: 'Client shared profiles across each KAM.',
      summaries: [
        { label: 'Profiles Shared', value: stats.sharedProfiles || 0, tone: 'text-cyan-600' },
        { label: 'Team Shared', value: profilesSharedBreakdown.reduce((sum, kam) => sum + kam.metricValue, 0), tone: 'text-indigo-600' },
        { label: 'Contributing KAMs', value: profilesSharedBreakdown.filter((kam) => kam.metricValue > 0).length, tone: 'text-emerald-600' },
      ],
      rows: profilesSharedBreakdown,
      valueLabel: 'Profiles Shared',
      renderMeta: (kam) => `${kam.effectiveStats.candidatesPipeline || 0} candidates Â· ${kam.effectiveStats.activePositions || 0} jobs`,
    },
    candidatesSummary: {
      title: 'Candidates Summary',
      subtitle: 'Overall hiring funnel snapshot with KAM-wise contribution.',
      summaries: [
        { label: 'Total Candidates', value: stats.totalCandidates || 0, tone: 'text-slate-900' },
        { label: 'Candidates Selected', value: stats.selected || 0, tone: 'text-indigo-600' },
        { label: 'Total Hires', value: stats.totalHires || 0, tone: 'text-emerald-600' },
      ],
      rows: hiresBreakdown,
      valueLabel: 'Hires',
      renderMeta: (kam) => `${kam.effectiveStats.candidatesPipeline || 0} candidates Â· ${kam.effectiveStats.interviewsScheduled || 0} interviews`,
    },
    offersManagement: {
      title: 'Offers Management Summary',
      subtitle: 'Offer pipeline status with KAM-level pending offer activity.',
      summaries: [
        { label: 'Pending', value: stats.pendingOffers || 0, tone: 'text-amber-600' },
        { label: 'Accepted', value: stats.acceptedOffers || 0, tone: 'text-emerald-600' },
        { label: 'Rejected', value: stats.rejectedOffers || 0, tone: 'text-red-500' },
      ],
      rows: offersBreakdown,
      valueLabel: 'Pending Offers',
      renderMeta: (kam) => `${kam.effectiveStats.thisWeekHires || 0} hires Â· ${kam.effectiveStats.interviewsScheduled || 0} interviews`,
    },
  };
  const activeStatsInsight = statsInsightType ? statsInsightConfig[statsInsightType] : null;

  const handleAssignTask = (kam) => {
    setActiveTab('Task Assignment');
  };

  const handleMessage = (kam) => {
    alert(`Opening chat with ${kam.name}`);
  };

  // Add KAM handler
  const handleAddKAM = () => {
    setKamFormMode('add');
    setKamFormData({
      name: '',
      email: '',
      phone: '',
      role: 'KAM - Recruitment',
      department: 'HR Recruitment',
      designation: '',
      reportingTo: '',
      joiningDate: new Date().toISOString().split('T')[0],
      employeeId: '',
      location: '',
      password: 'Mabicons@123',
      profilePhoto: null,
      profilePhotoPreview: null
    });
    setShowKAMFormModal(true);
  };

  // Edit KAM handler
  const handleEditKAM = (kam) => {
    setKamFormMode('edit');
    setKamFormData({
      id: kam.id,
      name: kam.name,
      email: kam.email,
      phone: kam.phone,
      role: kam.role || 'KAM - Recruitment',
      department: kam.department || 'HR Recruitment',
      designation: kam.designation || '',
      reportingTo: kam.reportingTo || '',
      joiningDate: kam.joiningDate || new Date().toISOString().split('T')[0],
      employeeId: kam.employeeId || '',
      location: kam.location || '',
      profilePhoto: null,
      profilePhotoPreview: kam.profilePhoto || null
    });
    setShowKAMModal(false);
    setShowKAMFormModal(true);
  };

  // Delete KAM handler
  const handleDeleteKAM = async (kam) => {
    if (!window.confirm(`Are you sure you want to remove ${kam.name} from the team?`)) return;

    try {
      await deleteKAMMember(kam.id);
      setKamTeam(prev => prev.filter(k => k.id !== kam.id));
      setShowKAMModal(false);
      showToast(`${kam.name} has been removed from the team.`, 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete KAM member', 'error');
    }
  };

  // Bulk delete KAM handler
  const handleDeleteMultipleKAMs = async (ids) => {
    if (!window.confirm(`Are you sure you want to remove ${ids.length} selected members from the team?`)) return false;

    try {
      setLoading(true);
      // Sequentially delete to avoid overwhelming the server or causing race conditions in state updates
      for (const id of ids) {
        await deleteKAMMember(id);
      }
      setKamTeam(prev => prev.filter(k => !ids.includes(k.id)));
      showToast(`Successfully removed ${ids.length} members from the team.`, 'success');
      return true;
    } catch (error) {
      showToast(error.message || 'Failed to remove some members', 'error');
      // Even if some failed, we should still refresh the list to see what remains
      const response = await getAllKAMMembers(dateFilter);
      if (response.success) setKamTeam(transformKAMData(response.data));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Submit KAM form (add/edit)
  const handleSubmitKAMForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (kamFormMode === 'add') {
        const response = await createKAMMember(kamFormData);
        if (response.success || response.data) {
          const newMember = response.data || kamFormData;
          const colorIndex = kamTeam.length % AVATAR_COLORS.length;
          setKamTeam(prev => [...prev, {
            id: newMember._id || `kam-${Date.now()}`,
            name: newMember.name,
            email: newMember.email,
            phone: newMember.phone,
            role: newMember.role || 'KAM - Recruitment',
            avatar: newMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            status: 'Active',
            color: AVATAR_COLORS[colorIndex],
            stats: { activePositions: 0, candidatesPipeline: 0, interviewsScheduled: 0, offersExtended: 0, thisWeekHires: 0 },
            recentActivity: [{ action: 'Joined team', candidate: '', time: 'Just now' }],
          }]);
          showToast(`${kamFormData.name} has been added to the team!`, 'success');
        }
      } else {
        const response = await updateKAMMember(kamFormData.id, kamFormData);
        if (response.success || response.data) {
          setKamTeam(prev => prev.map(k =>
            k.id === kamFormData.id
              ? { ...k, name: kamFormData.name, email: kamFormData.email, phone: kamFormData.phone, role: kamFormData.role }
              : k
          ));
          showToast(`${kamFormData.name}'s details have been updated!`, 'success');
        }
      }
      setShowKAMFormModal(false);
      fetchKAMTeam(); // Refresh the list
    } catch (error) {
      console.error(`Error in ${kamFormMode} KAM:`, error);
      const errorMessage = error.error || error.message || `Failed to ${kamFormMode} KAM member`;
      const details = error.details ? ` (${error.details.join(', ')})` : '';
      showToast(`${errorMessage}${details}`, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Recruitment Head', path: '/recruitment-head-dashboard' },
    { label: activeTab },
  ];

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
            case 'Team Overview':
              return (
                <TeamOverviewContent
                  onDeleteMultiple={handleDeleteMultipleKAMs}
                  teamData={kamTeam}
                  loading={teamLoading}
                  onViewKAM={handleViewKAM}
                  onAssignTask={handleAssignTask}
                  onMessage={handleMessage}
                  onRefresh={fetchKAMTeam}
                  onAddKAM={handleAddKAM}
                  onEditKAM={handleEditKAM}
                  globalStats={stats}
                  onViewCallsBreakdown={handleViewCallsBreakdown}
                />
              );
            case 'KAM Performance':
              return <KAMPerformanceContent
                teamData={kamTeam}
                loading={teamLoading}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                months={months}
                years={years}
                getFilterLabel={getFilterLabel}
                showDateFilter={showDateFilter}
                setShowDateFilter={setShowDateFilter}
                onViewPerformance={setPerformanceKam}
                clientFilter={clientFilter}
                setClientFilter={setClientFilter}
                clients={clients}
                fetchDashboardData={fetchDashboardData}
                fetchKAMTeam={fetchKAMTeam}
              />;
            case 'Task Assignment':
              return <TaskAssignmentTab department="HR Recruitment" />;
            case 'Job Openings':
              return <JobOpeningsTab isDarkMode={false} />;
            case 'Candidate Pipeline':
              return <CandidatePipelineTab setActiveTab={setActiveTab} />;
            case 'Interview Schedule':
              return <InterviewScheduleTab isDarkMode={false} />;
            case 'Screening & Assessment':
              return <ScreeningTab isDarkMode={false} />;
            case 'Offer Management':
              return <OfferManagementTab isDarkMode={false} />;
            case 'Recruitment Analytics':
              return <RecruitmentAnalyticsTab isDarkMode={false} />;
            case 'Resume Bank':
              return <ResumeBankTab isDarkMode={false} />;
            case 'Selection MIS':
              return <SelectionMISTab />;
            case 'Activity Feed':
              return <ActivityFeedTab department="HR Recruitment" />;
            case 'Team MIS Reports':
              return <TeamMISReportsTab />;
            case 'Notes':
              return <NotesTab isDarkMode={false} />;
            case 'Settings':
              return <SettingsTab />;
            default:
              // Dashboard
              return (
                <div className="space-y-6">
                  {/* Simple Welcome Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col items-start text-left">
                      <h2 className="text-3xl font-bold text-slate-900 mb-1">
                        Welcome {userInfo.name.split(' (')[0]}
                      </h2>
                      <p className="text-slate-500 font-medium">
                        Today is {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center flex-wrap md:flex-nowrap gap-3">
                      {/* Date Filter */}
                      <div className="relative">
                        <button
                          onClick={() => setShowDateFilter(!showDateFilter)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#0D47A1] text-white rounded-xl hover:bg-[#0a3a82] transition-all shadow-md hover:shadow-lg"
                        >
                          <FiCalendar className="w-4 h-4" />
                          <span className="font-medium">{getFilterLabel()}</span>
                          <svg className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Filter Dropdown */}
                        {showDateFilter && (
                          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden text-left">
                            <div className="p-4 border-b border-gray-100 bg-blue-50/50">
                              <p className="font-semibold text-gray-900">Select Time Period</p>
                            </div>

                            {/* Filter Type Tabs */}
                            <div className="flex border-b border-gray-100">
                              {[
                                { key: 'all', label: 'All Time' },
                                { key: 'last7days', label: 'Last 7 Days' },
                                { key: 'year', label: 'Year' },
                                { key: 'month', label: 'Month' },
                                { key: 'date', label: 'Date' },
                              ].map((tab) => (
                                <button
                                  key={tab.key}
                                  onClick={() => setDateFilter({ ...dateFilter, filterType: tab.key })}
                                  className={`flex-1 px-3 py-3 text-sm font-medium transition-all ${dateFilter.filterType === tab.key
                                    ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>

                            <div className="p-4">
                              {/* Year Selector */}
                              {(dateFilter.filterType === 'year' || dateFilter.filterType === 'month' || dateFilter.filterType === 'date') && (
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-600 mb-2">Year</label>
                                  <select
                                    value={dateFilter.year}
                                    onChange={(e) => setDateFilter({ ...dateFilter, year: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                                  >
                                    {years.map((year) => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Month Selector */}
                              {(dateFilter.filterType === 'month' || dateFilter.filterType === 'date') && (
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-600 mb-2">Month</label>
                                  <select
                                    value={dateFilter.month}
                                    onChange={(e) => setDateFilter({ ...dateFilter, month: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                                  >
                                    {months.map((month, idx) => (
                                      <option key={idx} value={idx}>{month}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Date Selector */}
                              {dateFilter.filterType === 'date' && (
                                <div className="mb-3">
                                  <label
                                    className="block text-xs font-medium text-gray-600 mb-2 cursor-pointer"
                                    onClick={() => openDatePicker(dashboardDateInputRef)}
                                  >
                                    Select Date
                                  </label>
                                  <div
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent cursor-pointer"
                                    onClick={() => openDatePicker(dashboardDateInputRef)}
                                  >
                                    <input
                                      ref={dashboardDateInputRef}
                                      type="date"
                                      value={dateFilter.date}
                                      onChange={(e) => setDateFilter({ ...dateFilter, date: e.target.value })}
                                      className="w-full bg-transparent border-0 p-0 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Quick Date Buttons */}
                              {dateFilter.filterType === 'date' && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <button
                                    onClick={() => setDateFilter({ ...dateFilter, date: getLocalISODate() })}
                                    className="px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                                  >
                                    Today
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDateFilter({ ...dateFilter, date: getLocalISODate(-1) });
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Yesterday
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDateFilter({ ...dateFilter, filterType: 'last7days' });
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Last 7 Days
                                  </button>
                                </div>
                              )}

                              {/* Apply Button */}
                              <button
                                onClick={applyDateFilter}
                                className="w-full px-4 py-2.5 bg-[#0D47A1] text-white rounded-xl font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-blue-100 mt-2"
                              >
                                Apply Filter
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveTab('Team Overview')}
                        className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] hover:bg-[#0a3a82] text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg font-bold whitespace-nowrap"
                      >
                        <FiUsers className="w-5 h-5" />
                        <span>View Team</span>
                      </button>
                    </div>
                  </div>

                  {/* Modern Stat Cards Grid */}
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                      title="Active Positions"
                      value={stats.activePositions || 0}
                      icon={FiBriefcase}
                      trend="+2 this week"
                      color="bg-blue-500"
                      onClick={() => setActiveTab('Job Openings')}
                    />
                    <StatCard
                      title="Candidates Pipeline"
                      value={stats.candidatesPipeline || 0}
                      icon={FiTarget}
                      trend="+12 new"
                      color="bg-emerald-500"
                      onClick={() => setActiveTab('Candidate Pipeline')}
                    />
                    <StatCard
                      title="Interviews Scheduled"
                      value={stats.interviewsScheduled || 0}
                      icon={FiCalendar}
                      trend="4 today"
                      color="bg-amber-500"
                      onClick={() => setActiveTab('Interview Schedule')}
                    />
                    <StatCard
                      title="Monthly Hires"
                      value={stats.thisMonthHires || 0}
                      icon={FiAward}
                      trend="On track"
                      color="bg-indigo-500"
                      onClick={() => setActiveTab('KAM Performance')}
                    />
                  </div>
                  {/* Chart Section Container - Side-by-Side Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 pb-4 border-b border-slate-50 relative">
                    {/* Staff applications card - left */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col p-8 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                      <div className="flex items-center justify-between mb-6 w-full">
                        <div className="flex flex-col text-left">
                          <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Staff Applications Pipeline</h3>
                          <p className="text-[#6B6B7E] text-xs font-medium">Real-time tracking of candidate progression</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Team Filter */}
                          <div className="relative" ref={teamDropdownRef}>
                            <button
                              onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                              className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] border border-slate-100 text-slate-600 rounded-xl hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all text-[10px] font-bold group"
                            >
                              <FiUsers className="w-3 h-3 text-blue-500" />
                              <span className="tracking-tight">{teamFilter}</span>
                            </button>
                            <AnimatePresence>
                              {showTeamDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute left-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-50 z-50 overflow-hidden py-1"
                                >
                                  {['All Team', ...kamTeam.map(k => k.name)].map((team) => (
                                    <button
                                      key={team}
                                      onClick={() => {
                                        setTeamFilter(team);
                                        setShowTeamDropdown(false);
                                        fetchDashboardData(dateFilter, team);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-[10px] font-bold transition-all font-jakarta ${teamFilter === team ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                      {team}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Client Filter */}
                          <div className="relative" ref={clientDropdownRef}>
                            <button
                              onClick={() => setShowClientDropdown(!showClientDropdown)}
                              className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] border border-slate-100 text-slate-600 rounded-xl hover:bg-white hover:border-rose-200 hover:shadow-sm transition-all text-[10px] font-bold group"
                            >
                              <FiTarget className="w-3 h-3 text-rose-500" />
                              <span className="tracking-tight">{clientFilter}</span>
                            </button>
                            <AnimatePresence>
                              {showClientDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute left-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-50 z-50 overflow-hidden py-1"
                                >
                                  {['All Client', ...clients.map(c => c.companyName || c.name)].map((client) => (
                                    <button
                                      key={client}
                                      onClick={() => {
                                        setClientFilter(client);
                                        setShowClientDropdown(false);
                                        fetchDashboardData(dateFilter, teamFilter, client);
                                        fetchKAMTeam(dateFilter, client);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-[10px] font-bold transition-all ${clientFilter === client ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                      {client}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-6">
                        <div className="relative w-full h-[260px] flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getPipelineChartData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={105}
                                paddingAngle={6}
                                dataKey="value"
                                stroke="none"
                                animationDuration={1500}
                              >
                                {getPipelineChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-extrabold text-[#1A1A2E] tracking-tighter font-jakarta">
                              {getPipelineChartData().reduce((acc, curr) => acc + curr.value, 0)}
                            </span>
                            <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.2em] mt-1 font-jakarta">IN PIPELINE</span>
                            {teamFilter !== 'All Team' && (
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">{teamFilter}</span>
                            )}
                          </div>
                        </div>

                        {/* Legend below chart - Styled like the requested image */}
                        <div className="w-full grid grid-cols-3 gap-2 mt-4">
                          {getPipelineChartData().map((entry) => (
                            <div key={entry.name} className="flex flex-col items-center group">
                              <div className="w-6 h-1.5 rounded-full mb-3 transition-transform group-hover:scale-x-125 shadow-sm" style={{ backgroundColor: entry.color }} />
                              <span className="text-xl font-bold text-[#1A1A2E] leading-none tracking-tight mb-1 font-jakarta">{entry.value}</span>
                              <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.1em] font-jakarta">{entry.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Annual recruitment summary - right */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col p-8 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 w-full gap-4">
                        <div className="flex flex-col text-left">
                          <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Annual Recruitment Summary</h3>
                          <p className="text-[#6B6B7E] text-xs font-medium">Yearly hiring performance and trend analysis</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative" ref={activityDropdownRef}>
                            <button
                              onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                              className="flex items-center gap-2 px-4 py-2 bg-[#F1F1F1] hover:bg-white text-slate-700 rounded-xl transition-all border border-transparent shadow-sm text-[10px] font-bold group"
                            >
                              <span className="tracking-tight">{activityFilter}</span>
                              <FiActivity className="w-3 h-3 text-indigo-500" />
                            </button>
                            <AnimatePresence>
                              {showActivityDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-50 z-50 overflow-hidden py-1"
                                >
                                  {['Calls', 'Hiring', 'Meeting', 'Interview Count', 'Offers', 'Rejected'].map((option) => (
                                    <button
                                      key={option}
                                      onClick={() => {
                                        setActivityFilter(option);
                                        setShowActivityDropdown(false);
                                        fetchDashboardData(dateFilter, teamFilter, clientFilter, option);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-[10px] font-bold transition-all ${activityFilter === option ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>


                        </div>
                      </div>

                      <div className="w-full h-[300px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getSummaryChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'Plus Jakarta Sans' }}
                              dy={15}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'Plus Jakarta Sans' }}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                padding: '12px 16px',
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}
                              cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                            />
                            {getSummaryChartData().length > 0 &&
                              Object.keys(getSummaryChartData()[0])
                                .filter(k => k !== 'name' && k !== 'sortKey')
                                .map((key, i) => (
                                  <Bar
                                    key={key}
                                    dataKey={key}
                                    name={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                                    fill={['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#F43F5E', '#1A1A2E'][i % 7]}
                                    radius={[2, 2, 0, 0]}
                                    barSize={8}
                                  />
                                ))
                            }
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Active Team Section - Full Width Carousel */}
                  <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 mb-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500">
                          <FiUsers className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight font-syne">Active Team</h3>
                      </div>
                    </div>

                    <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 scroll-smooth">
                      {kamTeam.map((kam, idx) => {
                        const initials = kam.avatar || (kam.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        return (
                          <div
                            key={kam.id}
                            onClick={() => handleViewKAM(kam)}
                            className="min-w-[280px] bg-white border border-slate-100 rounded-[24px] p-5 flex items-center justify-between group hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-[18px] bg-[#E3F2FD] border border-[#BBDEFB] flex items-center justify-center font-bold text-[#1976D2] text-sm shadow-sm group-hover:scale-105 transition-transform">
                                {initials}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{kam.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{kam.stats?.activePositions} OPEN POSITIONS</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xl font-black text-slate-900 leading-none">{kam.stats?.thisWeekHires}</span>
                              <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter mt-1">HIRES</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Actions Section - Full Width Carousel */}
                  <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 mb-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/50 text-indigo-500">
                            <FiActivity className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Quick Actions</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1">COMMON RECRUITMENT TASKS</p>
                      </div>
                    </div>

                    <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 scroll-smooth">
                      {[
                        { title: 'JOB OPENINGS', desc: `${stats.activePositions} OPEN POSITIONS`, icon: FiBriefcase, color: 'bg-white text-slate-800 border-slate-100 group-hover:text-[#0D47A1]', tab: 'Job Openings' },
                        { title: 'CANDIDATE PIPELINE', desc: `${stats.totalCandidates} TOTAL`, icon: FiTarget, color: 'bg-white text-slate-800 border-slate-100 group-hover:text-[#0D47A1]', tab: 'Candidate Pipeline' },
                        { title: 'TASKS', desc: `${stats.pendingTasks} PENDING`, icon: FiCheckSquare, color: 'bg-white text-slate-800 border-slate-100 group-hover:text-[#0D47A1]', tab: 'Task Assignment' },
                        { title: 'SHARED NOTES', desc: `${stats.totalNotes} ACTIVE NOTES`, icon: FiEdit3, color: 'bg-white text-slate-800 border-slate-100 group-hover:text-[#0D47A1]', tab: 'Notes' }
                      ].map((action, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveTab(action.tab)}
                          className="min-w-[280px] bg-white border border-slate-100 rounded-[24px] p-6 flex items-center gap-5 group hover:border-[#0D47A1]/30 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer"
                        >
                          <div className={`w-14 h-14 rounded-[18px] ${action.color} border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                            <action.icon className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 tracking-wide group-hover:text-indigo-600 transition-colors uppercase">{action.title}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{action.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Notes */}
                  <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-indigo-500 shadow-sm">
                          <FiEdit3 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[#1A1A2E] tracking-tight font-syne leading-none">Strategy Notes</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Directives and guidelines</p>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-[450px] overflow-y-auto flex-1 bg-white p-4 space-y-4 no-scrollbar">
                      {notesLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                          <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing records...</p>
                        </div>
                      ) : recentNotes.length > 0 ? (
                        recentNotes.map((note) => (
                          <div key={note.id} className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#F4F3EF] hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-full scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-[15px] text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors font-syne">{note.title}</h4>
                              <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <FiClock className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                  {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            </div>
                            <p className="text-[13px] text-slate-600 leading-relaxed font-medium mb-4">{note.content}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-[#1B4DA0] flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-blue-500/20">
                                  {note.createdByName?.[0] || 'S'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-none">{note.createdByName || 'System Office'}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">HOD - Recruitment</span>
                                </div>
                              </div>
                              <button className="p-2 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-indigo-500 hover:border-indigo-100 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                                <FiArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-slate-200">
                            <FiEdit3 size={24} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 mb-1">No Strategy Notes Found</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team directives will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
          }
        })()}
      </Suspense>
    );
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      </AnimatePresence>

      <AdminLayout
        showGlobalHeader={false}
        sidebarItems={sidebarConfig}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dashboardTitle="Recruitment Head"
        breadcrumbs={breadcrumbs}
        userInfo={userInfo}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      >
        {renderContent()}
      </AdminLayout>

      {/* KAM Detail Drawer */}
      <AnimatePresence>
        {showKAMModal && selectedKAM && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1A2E]/20 backdrop-blur-[1px] z-[110]"
              onClick={() => setShowKAMModal(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-[120] shadow-2xl flex flex-col"
              style={{ boxShadow: "-12px 0 40px rgba(0,0,0,0.12)" }}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Member Details</h3>
                <button
                  onClick={() => setShowKAMModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-[#F4F3EF] transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-[28px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/20"
                    style={{ background: selectedKAM.color?.gradient || 'linear-gradient(to right, #3b82f6, #06b6d4)' }}>
                    {selectedKAM.avatar || (selectedKAM.name || 'U')[0]}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedKAM.name}</h4>
                    <p className="text-sm font-semibold text-[#1B4DA0] mt-1">{selectedKAM.role}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#F4F3EF]">
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-3">Professional Info</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6B6B7E] font-medium">Department</span>
                        <span className="text-sm text-[#1A1A2E] font-bold">{selectedKAM.department || 'HR Recruitment'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6B6B7E] font-medium">Status</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${selectedKAM.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>{selectedKAM.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#F4F3EF]">
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-3">Contact Details</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#9B9BAD] border border-[#E8E7E2]">
                          <FiMail className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-[#1A1A2E] font-medium">{selectedKAM.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#9B9BAD] border border-[#E8E7E2]">
                          <FiPhone className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-[#1A1A2E] font-medium">{selectedKAM.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Mini-Card */}
                <div className="p-5 bg-[#1B4DA0] text-white rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/20 transition-all" />
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Total Hires</p>
                      <p className="text-2xl font-bold">{selectedKAM.stats?.thisWeekHires || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Interviews</p>
                      <p className="text-2xl font-bold">{selectedKAM.stats?.interviewsScheduled || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-[#F4F3EF] flex gap-3">
                <button
                  onClick={() => {
                    setShowKAMModal(false);
                    handleAssignTask(selectedKAM);
                  }}
                  className="flex-1 py-3 bg-[#1B4DA0] text-white rounded-xl text-xs font-bold hover:bg-[#153e82] transition-all"
                >
                  Assign Task
                </button>
                <button
                  onClick={() => handleMessage(selectedKAM)}
                  className="w-12 h-12 flex items-center justify-center bg-[#F4F3EF] text-[#1B4DA0] rounded-xl hover:bg-[#EEF2FB] transition-all"
                >
                  <FiMail className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calls Breakdown Modal */}
      <AnimatePresence>
        {showCallsBreakdownModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCallsBreakdownModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-10 py-8 border-b border-[#F4F3EF] bg-gradient-to-r from-white to-[#F8FAFF]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Call Summary</p>
                    <h2 className="text-2xl font-bold text-[#1A1A2E] mt-2 font-syne">Phone Calls By KAM</h2>
                    <p className="text-sm text-[#6B6B7E] mt-1">Total and member-wise phone screening calls for the recruitment team.</p>
                  </div>
                  <button
                    onClick={() => setShowCallsBreakdownModal(false)}
                    className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div className="rounded-2xl bg-[#F4F3EF] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9B9BAD]">Dashboard Total</p>
                    <p className="text-2xl font-bold text-[#1A1A2E] mt-1">{stats.phoneScreeningCalls || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F4F3EF] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9B9BAD]">KAM Tracked Calls</p>
                    <p className="text-2xl font-bold text-[#1A1A2E] mt-1">{teamCallsTotal}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F4F3EF] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9B9BAD]">Active KAMs</p>
                    <p className="text-2xl font-bold text-[#1A1A2E] mt-1">{kamCallsBreakdown.length}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 max-h-[60vh] overflow-y-auto">
                {kamCallsBreakdown.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                      <FiPhone className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No KAM call data available</h3>
                    <p className="text-sm text-slate-500 mt-2">Once call statistics are available, you will see a detailed breakdown for each KAM here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {kamCallsBreakdown.map((kam, index) => (
                      <button
                        key={kam.id}
                        type="button"
                        onClick={() => {
                          handleViewKAM(kam);
                          setShowCallsBreakdownModal(false);
                        }}
                        className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-4 text-left hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
                              style={{ background: kam.color?.gradient || 'linear-gradient(to right, #3b82f6, #06b6d4)' }}
                            >
                              {kam.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-slate-900 truncate">{kam.name}</p>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">#{index + 1}</span>
                              </div>
                              <p className="text-sm text-slate-500 truncate">{kam.role}</p>
                              <p className="text-xs text-slate-400 mt-1">{kam.activePositions} jobs Â· {kam.candidatesPipeline} candidates</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Calls</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{kam.totalCalls}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStatsInsightModal && activeStatsInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowStatsInsightModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-[#F4F3EF]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-10 py-8 border-b border-[#F4F3EF] bg-gradient-to-r from-white to-[#F8FAFF]">
                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[3px] text-[#9B9BAD]">Dashboard Insight</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A2E] mt-2 leading-tight font-syne">{activeStatsInsight.title}</h2>
                    <p className="text-sm md:text-base text-[#6B6B7E] mt-2 leading-6">{activeStatsInsight.subtitle}</p>
                  </div>
                  <button
                    onClick={() => setShowStatsInsightModal(false)}
                    className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-7 bg-white max-h-[66vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {activeStatsInsight.summaries.map((summary, summaryIndex) => (
                    <div
                      key={summary.label}
                      className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-200"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{summary.label}</p>
                      <p className={`text-3xl font-bold mt-2 ${summary.tone || 'text-slate-900'}`}>{summary.value}</p>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${summaryIndex === 0 ? 'bg-indigo-600' : summaryIndex === 1 ? 'bg-cyan-500' : 'bg-emerald-500'}`}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {activeStatsInsight.rows.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                    <h3 className="text-lg font-semibold text-slate-900">No breakdown available</h3>
                    <p className="text-sm text-slate-500 mt-2">No team-level data is currently available for this metric.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeStatsInsight.rows.map((kam, index) => (
                      <button
                        key={kam.id}
                        type="button"
                        onClick={() => {
                          handleViewKAM(kam);
                          setShowStatsInsightModal(false);
                        }}
                        className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-4 text-left hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
                              style={{ background: kam.color?.gradient || 'linear-gradient(to right, #3b82f6, #06b6d4)' }}
                            >
                              {kam.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-slate-900 truncate">{kam.name}</p>
                              </div>
                              <p className="text-sm text-slate-500 truncate">{kam.role}</p>
                              <p className="text-xs text-slate-400 mt-1">{activeStatsInsight.renderMeta(kam)}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 min-w-[108px]">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{activeStatsInsight.valueLabel}</p>
                            <p className="text-3xl font-bold text-indigo-600 mt-1">{kam.metricValue}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite/Edit Modal Overlay */}
      <AnimatePresence>
        {showKAMFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {kamFormMode === 'add' ? 'Invite Team Member' : 'Edit Member Details'}
                  </h2>
                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">
                    {kamFormMode === 'add' ? 'Send an invitation to join the team' : 'Update member details'}
                  </p>
                </div>
                <button
                  onClick={() => setShowKAMFormModal(false)}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                  disabled={formSubmitting}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmitKAMForm} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Profile Photo Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    {kamFormData.profilePhotoPreview ? (
                      <img src={kamFormData.profilePhotoPreview} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E0E7FF]" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-[#F0F7FF] border-2 border-dashed border-[#C5C5D2] flex items-center justify-center text-[24px] font-bold text-[#1B4DA0]">
                        {kamFormData.name ? kamFormData.name.charAt(0).toUpperCase() : <FiUsers className="w-6 h-6 text-[#C5C5D2]" />}
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <FiEdit2 className="w-5 h-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setKamFormData({ ...kamFormData, profilePhoto: file, profilePhotoPreview: ev.target.result });
                          reader.readAsDataURL(file);
                        }
                      }} disabled={formSubmitting} />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">Profile Photo</p>
                    <p className="text-[11px] text-[#9B9BAD] mt-0.5">Upload a photo (JPG, PNG). Max 2MB.</p>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center text-white shadow-xl"><FiUsers className="w-4 h-4" /></div>
                    <h4 className="text-xl font-bold text-[#1A1A2E] font-syne">Personal Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Full Name *</label>
                      <div className="relative flex items-center">
                        <FiUsers className="absolute left-4 text-[#C5C5D2]" />
                        <input type="text" required placeholder="e.g. John Doe"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                          value={kamFormData.name} onChange={(e) => setKamFormData({ ...kamFormData, name: e.target.value })} disabled={formSubmitting} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Employee ID</label>
                      <div className="relative flex items-center">
                        <FiFileText className="absolute left-4 text-[#C5C5D2]" />
                        <input type="text" placeholder="e.g. MAB-0042"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                          value={kamFormData.employeeId || ''} onChange={(e) => setKamFormData({ ...kamFormData, employeeId: e.target.value })} disabled={formSubmitting} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#3b82f6] rounded-xl flex items-center justify-center text-white shadow-xl"><FiMail className="w-4 h-4" /></div>
                    <h4 className="text-xl font-bold text-[#1A1A2E] font-syne">Contact Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email Address *</label>
                      <div className="relative flex items-center">
                        <FiMail className="absolute left-4 text-[#C5C5D2]" />
                        <input type="email" required placeholder="john@mabicons.com"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                          value={kamFormData.email} onChange={(e) => setKamFormData({ ...kamFormData, email: e.target.value })} disabled={formSubmitting} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Phone Number *</label>
                      <div className="relative flex items-center">
                        <FiPhone className="absolute left-4 text-[#C5C5D2]" />
                        <input type="tel" required placeholder="+91 9876543210"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                          value={kamFormData.phone} onChange={(e) => setKamFormData({ ...kamFormData, phone: e.target.value })} disabled={formSubmitting} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role & Department */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-white shadow-xl"><FiBriefcase className="w-4 h-4" /></div>
                    <h4 className="text-xl font-bold text-[#1A1A2E] font-syne">Role & Department</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Role *</label>
                      <div className="relative flex items-center">
                        <FiBriefcase className="absolute left-4 text-[#C5C5D2]" />
                        <select
                          className="w-full pl-11 pr-12 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 appearance-none cursor-pointer"
                          value={kamFormData.role} onChange={(e) => setKamFormData({ ...kamFormData, role: e.target.value })} disabled={formSubmitting}>
                          <option value="KAM - Recruitment">KAM - Recruitment</option>
                          <option value="HR Executive">HR Executive</option>
                          <option value="Senior KAM">Senior KAM</option>
                          <option value="KAM Lead">KAM Lead</option>
                          <option value="Recruiter">Recruiter</option>
                          <option value="Team Lead">Team Lead</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Department</label>
                      <div className="relative flex items-center">
                        <FiLayers className="absolute left-4 text-[#C5C5D2]" />
                        <select
                          className="w-full pl-11 pr-12 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 appearance-none cursor-pointer"
                          value={kamFormData.department || 'HR Recruitment'} onChange={(e) => setKamFormData({ ...kamFormData, department: e.target.value })} disabled={formSubmitting}>
                          <option value="HR Recruitment">HR Recruitment</option>
                          <option value="HR Operations">HR Operations</option>
                          <option value="IT">IT</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="BD">Business Development</option>
                          <option value="Finance">Finance</option>
                          <option value="Management">Management</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Designation</label>
                      <div className="relative flex items-center">
                        <FiAward className="absolute left-4 text-[#C5C5D2]" />
                        <input type="text" placeholder="e.g. Senior Executive"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                          value={kamFormData.designation || ''} onChange={(e) => setKamFormData({ ...kamFormData, designation: e.target.value })} disabled={formSubmitting} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Reporting To</label>
                      <div className="relative flex items-center">
                        <FiUsers className="absolute left-4 text-[#C5C5D2]" />
                        <input type="text" placeholder="e.g. Sachin Rawat"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                          value={kamFormData.reportingTo || ''} onChange={(e) => setKamFormData({ ...kamFormData, reportingTo: e.target.value })} disabled={formSubmitting} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center text-white shadow-xl"><FiCalendar className="w-4 h-4" /></div>
                    <h4 className="text-xl font-bold text-[#1A1A2E] font-syne">Additional Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Joining Date</label>
                      <div className="relative flex items-center">
                        <FiCalendar className="absolute left-4 text-[#C5C5D2]" />
                        <input type="date"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                          value={kamFormData.joiningDate || ''} onChange={(e) => setKamFormData({ ...kamFormData, joiningDate: e.target.value })} disabled={formSubmitting} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Location</label>
                      <div className="relative flex items-center">
                        <FiExternalLink className="absolute left-4 text-[#C5C5D2]" />
                        <input type="text" placeholder="e.g. Jaipur"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                          value={kamFormData.location || ''} onChange={(e) => setKamFormData({ ...kamFormData, location: e.target.value })} disabled={formSubmitting} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowKAMFormModal(false)}
                    disabled={formSubmitting}
                    className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-[2] py-5 bg-[#1B4DA0] text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {formSubmitting ? (
                      <>
                        <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>{kamFormMode === 'add' ? 'Send Invitation' : 'Save Changes'}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Detail Drawer (Global Scope for Full Coverage) */}
      <AnimatePresence>
        {performanceKam && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-[4px] z-[9999]"
              onClick={() => setPerformanceKam(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-[#FAFAF8] z-[10000] shadow-2xl flex flex-col"
              style={{ boxShadow: "-12px 0 40px rgba(0,0,0,0.15)" }}
            >
              {/* Drawer Header */}
              <div className="p-6 bg-white border-b border-[#E8E7E2] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <FiAward className="text-[#1B4DA0]" size={24} />
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Performance Matrix</h3>
                </div>
                <button
                  onClick={() => setPerformanceKam(null)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-[#F4F3EF] transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Identity Section */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-[#1B4DA0] text-4xl font-extrabold shadow-xl mb-6 bg-[#F0F7FF] border-4 border-white transition-transform hover:scale-105 duration-300">
                    {performanceKam.avatar}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{performanceKam.name}</h4>
                  </div>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-[4px] mt-1 mb-8">{performanceKam.role}</p>

                  <div className="flex items-center gap-6 mt-2 w-full justify-center">
                    <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm min-w-[80px]">
                      <span className="text-xl font-bold text-[#1A1A2E]">{performanceKam.stats.thisWeekHires}</span>
                      <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[1px]">Hires</span>
                    </div>
                    <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm min-w-[80px]">
                      <span className="text-xl font-bold text-[#1A1A2E]">{performanceKam.stats.interviewsScheduled}</span>
                      <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[1px]">Interviews</span>
                    </div>
                    <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm min-w-[80px]">
                      <span className="text-xl font-bold text-emerald-500">+{performanceKam.stats.offersExtended}</span>
                      <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[1px]">Offers</span>
                    </div>
                  </div>
                </div>

                {/* Stats Table */}
                <div className="space-y-4 pt-4">
                  <h5 className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1">Key Metrics</h5>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: "Total Calling", value: performanceKam.stats.callsDone || 0, icon: FiPhone, color: "text-blue-500", bg: "bg-blue-50" },
                      { label: "Pipeline Size", value: performanceKam.stats.candidatesPipeline || 0, icon: FiUsers, color: "text-indigo-500", bg: "bg-indigo-50" },
                      { label: "Profiles Shared", value: performanceKam.stats.profilesShared || 0, icon: FiFileText, color: "text-emerald-500", bg: "bg-emerald-50" },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E8E7E2] hover:border-[#1B4DA0]/30 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${m.bg} ${m.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <m.icon size={18} />
                          </div>
                          <span className="text-sm font-bold text-[#4B4B5E]">{m.label}</span>
                        </div>
                        <span className="text-base font-black text-[#1A1A2E]">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecruitmentHeadDashboard;
