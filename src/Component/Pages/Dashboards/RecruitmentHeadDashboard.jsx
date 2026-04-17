import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  FiSave,
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
  FiShield,
  FiCheck,
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AdminLayout, { StatCard } from './AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
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
  createNote,
  updateNote,
  deleteNote,
  getRecruitmentClients,
  getAllOffers,
} from '../service/api';

// Lazy load Tab Components
const DocumentVerifyTab = lazy(() => import('./Tabs/KAM/DocumentVerifyTab'));
const WorkHandoverTab = lazy(() => import('./Tabs/KAM/WorkHandoverTab'));
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
const MyProfileTab = lazy(() => import('./Tabs/Common/MyProfileTab'));

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

const sidebarConfig = [
  {
    items: [
      { id: 'team-overview', title: 'My Team', icon: FiUsers },
      { id: 'kam-performance', title: 'Team Performance', icon: FiTrendingUp },
      { id: 'task-assignment', title: 'Task Assignment', icon: FiCheckSquare },
      { id: 'job-openings', title: 'Job Openings', icon: FiBriefcase },
      { id: 'candidates', title: 'Candidate Pipeline', icon: FiUserPlus },
      { id: 'interviews', title: 'Interview Schedule', icon: FiCalendar },
      { id: 'offers', title: 'Offer Management', icon: FiAward },
      { id: 'resume-bank', title: 'Resume Bank', icon: FiDatabase },
      { id: 'activity-feed', title: 'Activity Feed', icon: FiActivity },
      { id: 'mis-reports', title: 'Team MIS Reports', icon: FiBarChart2 },
      { id: 'notes', title: 'Notes', icon: FiEdit2 },
      { id: 'document-verification', title: 'Document Verification', icon: FiShield },
      { id: 'work-handover', title: 'Work Handover', icon: FiRefreshCw },
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
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>My Team</h1>

        </div>
        <div className="flex items-center gap-3">
          {onAddKAM && (
            <button
              onClick={onAddKAM}
              style={{ fontFamily: '"Syne", sans-serif' }}
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
        <div className="px-6 py-4 border-b border-gray-100">
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
  const [perfSearchQuery, setPerfSearchQuery] = useState('');
  const compactDateInputRef = useRef(null);
  const clientDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setShowDateFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowDateFilter, setShowClientDropdown]);

  const clientNames = ['All Client', ...clients.map(c => c.companyName || c.name)];

  const filteredData = (clientFilter === 'All Client'
    ? teamData
    : teamData.filter(kam => kam.client === clientFilter || (Array.isArray(kam.clients) && kam.clients.includes(clientFilter)))
  ).filter(kam => {
    if (!perfSearchQuery) return true;
    return (kam.name || '').toLowerCase().includes(perfSearchQuery.toLowerCase()) ||
      (kam.role || '').toLowerCase().includes(perfSearchQuery.toLowerCase());
  });

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
    { key: 'callsDone', label: 'Total Calling', color: '#ef4444', icon: FiPhone },
    { key: 'candidatesPipeline', label: 'Candidates', color: '#8b5cf6', icon: FiUserPlus },
    { key: 'interviewsScheduled', label: 'Interviews', color: '#3b82f6', icon: FiCalendar },
    { key: 'offersExtended', label: 'Offers', color: '#f59e0b', icon: FiAward },
    { key: 'thisWeekHires', label: 'Hires', color: '#10b981', icon: FiCheckCircle },
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
      <div className="space-y-8" style={{ fontFamily: "'Calibri', sans-serif" }}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-[#F4F3EF] rounded-2xl animate-pulse" />
            <div className="h-4 w-40 bg-[#F4F3EF] rounded-xl animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-[#F4F3EF] rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-[#F4F3EF] animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-[32px] bg-[#F4F3EF] animate-pulse" />
        <div className="h-96 rounded-[32px] bg-[#F4F3EF] animate-pulse" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      {/* ── Premium Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 relative z-[20]">
        <div className="text-left">
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-[#1A1A2E] tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Team Performance
          </motion.h1>

        </div>

        <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap">
          {/* Client Filter */}
          <div className="relative" ref={clientDropdownRef}>
            <button
              onClick={() => {
                setShowClientDropdown(prev => !prev);
                setShowDateFilter(false);
              }}
              className="px-4 py-2.5 bg-white border border-[#F4F3EF] text-[#1A1A2E] rounded-xl text-sm font-bold hover:border-[#E8E7E2] transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <FiBriefcase size={15} className="text-[#1B4DA0]" />
              <span className="whitespace-nowrap">{clientFilter}</span>
              <svg className={`w-3.5 h-3.5 ml-1 text-[#9B9BAD] transition-transform ${showClientDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {showClientDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-[#F4F3EF] z-[9999] overflow-hidden py-1.5"
                >
                  {clientNames.map((client) => (
                    <button
                      key={client}
                      onClick={() => {
                        setClientFilter(client);
                        setShowClientDropdown(false);
                        fetchDashboardData(dateFilter, 'All Team', client);
                        fetchKAMTeam(dateFilter, client);
                      }}
                      className={`w-full px-5 py-2.5 text-left text-[13px] transition-colors ${clientFilter === client ? 'bg-[#0D47A1]/5 text-[#0D47A1] font-bold' : 'text-[#4B4B5E] hover:bg-[#FAFAF8] font-medium'}`}
                    >
                      {client}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date Filter */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              onClick={() => {
                setShowDateFilter(prev => !prev);
                setShowClientDropdown(false);
              }}
              className="px-5 py-2.5 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2 active:scale-95 whitespace-nowrap min-w-max"
            >
              <FiCalendar size={15} />
              <span className="whitespace-nowrap">{getFilterLabel()}</span>
              <svg className={`w-3.5 h-3.5 ml-1 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {showDateFilter && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#F4F3EF] z-[9999] overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-[#F4F3EF] bg-[#FAFAF8]">
                    <p className="font-bold text-[#1A1A2E] text-left text-sm">Select Time Period</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex gap-1 p-1 bg-[#F4F3EF] rounded-xl">
                      {['all', 'last7days', 'year', 'month', 'date'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setDateFilter({ ...dateFilter, filterType: type })}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${dateFilter.filterType === type ? 'bg-white text-[#0D47A1] shadow-sm' : 'text-[#9B9BAD] hover:text-[#6B6B7E]'}`}
                        >
                          {type === 'all' ? 'All' : type === 'last7days' ? 'Last 7 Days' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    {(dateFilter.filterType === 'year' || dateFilter.filterType === 'month' || dateFilter.filterType === 'date') && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-left ml-1">Select Year</label>
                        <select
                          value={dateFilter.year}
                          onChange={(e) => setDateFilter({ ...dateFilter, year: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] bg-white focus:outline-none focus:border-[#1B4DA0] transition-colors cursor-pointer"
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(dateFilter.filterType === 'month' || dateFilter.filterType === 'date') && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-left ml-1">Select Month</label>
                        <select
                          value={dateFilter.month}
                          onChange={(e) => setDateFilter({ ...dateFilter, month: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] bg-white focus:outline-none focus:border-[#1B4DA0] transition-colors cursor-pointer"
                        >
                          {months.map((month, idx) => (
                            <option key={idx} value={idx}>{month}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {dateFilter.filterType === 'date' && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-left ml-1">Select Date</label>
                        <div
                          onClick={() => openDatePicker(compactDateInputRef)}
                          className="w-full px-4 py-3 border border-[#F4F3EF] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#E8E7E2] transition-all bg-white"
                        >
                          <input
                            ref={compactDateInputRef}
                            type="date"
                            value={dateFilter.date}
                            onChange={(e) => setDateFilter({ ...dateFilter, date: e.target.value })}
                            className="bg-transparent text-sm font-bold text-[#1A1A2E] outline-none flex-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <FiCalendar className="text-[#9B9BAD] w-4 h-4" />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setShowDateFilter(false)}
                      className="w-full py-3 bg-[#0D47A1] text-white rounded-xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all"
                    >
                      Apply Filter
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* KPI Stats Grid removed per user request */}

      {/* ── Top 3 Leaderboard ── */}
      {(() => {
        const topKAMs = [...teamData].sort((a, b) => b.stats.thisWeekHires - a.stats.thisWeekHires);
        if (topKAMs.length < 3) return null;

        const renderAvatar = (kam, size = 16) => {
          const isImage = kam.avatar && (String(kam.avatar).includes('http') || String(kam.avatar).includes('data:'));
          return isImage
            ? <img src={kam.avatar} className="w-full h-full object-cover" alt="" />
            : <span className="font-bold">{kam.avatar}</span>;
        };

        return (
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-[32px] border border-[#F4F3EF] p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8 text-left">

                <h3 className="text-lg font-bold text-[#1A1A2E]">Top Performers</h3>
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-auto">By Hires</span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                {/* 2nd Place */}
                <div
                  onClick={() => onViewPerformance(topKAMs[1])}
                  className="flex items-center gap-4 group cursor-pointer hover:bg-[#FAFAF8] p-4 rounded-2xl transition-all"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-[#F4F3EF] flex items-center justify-center text-[#1A1A2E] text-base border border-[#E8E7E2] overflow-hidden group-hover:border-[#0D47A1]/20 transition-colors">
                      {renderAvatar(topKAMs[1])}
                    </div>
                    <div className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-400 to-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-white font-black text-xs shadow-lg">2</div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#0D47A1] transition-colors">{topKAMs[1].name}</p>
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-wider">{topKAMs[1].stats.thisWeekHires} Hires</p>
                  </div>
                </div>

                {/* 1st Place — Hero */}
                <div
                  onClick={() => onViewPerformance(topKAMs[0])}
                  className="flex items-center gap-5 group py-5 px-8 bg-gradient-to-r from-[#0D47A1]/5 to-[#0D47A1]/10 rounded-[24px] border-2 border-[#0D47A1]/10 relative cursor-pointer hover:border-[#0D47A1]/25 transition-all shadow-sm"
                >
                  <div className="relative">
                    <div className="w-[72px] h-[72px] rounded-[22px] bg-white flex items-center justify-center text-[#0D47A1] text-2xl font-bold border-[3px] border-white shadow-xl overflow-hidden ring-4 ring-[#0D47A1]/5">
                      {renderAvatar(topKAMs[0])}
                    </div>
                    <div className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-400 to-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-white font-black text-xs shadow-lg">1</div>
                  </div>
                  <div className="text-left">
                    <p className="text-[17px] font-bold text-[#1A1A2E] leading-tight">{topKAMs[0].name}</p>
                    <p className="text-xs font-black text-[#0D47A1] uppercase tracking-widest mt-0.5">{topKAMs[0].stats.thisWeekHires} Hires</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <FiStar size={11} className="text-amber-500 fill-amber-500" />
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Top Performer</span>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div
                  onClick={() => onViewPerformance(topKAMs[2])}
                  className="flex items-center gap-4 group cursor-pointer hover:bg-[#FAFAF8] p-4 rounded-2xl transition-all"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-[#F4F3EF] flex items-center justify-center text-[#1A1A2E] text-base border border-[#E8E7E2] overflow-hidden group-hover:border-[#0D47A1]/20 transition-colors">
                      {renderAvatar(topKAMs[2])}
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-700 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white font-black text-[10px] shadow-sm">3</div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#0D47A1] transition-colors">{topKAMs[2].name}</p>
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-wider">{topKAMs[2].stats.thisWeekHires} Hires</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* ── Performance Rankings Table ── */}
      <motion.div variants={itemVariants} className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        {/* Table Header with Search */}
        <div className="px-8 py-5 border-b border-[#F4F3EF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* <div className="p-2 rounded-xl bg-[#0D47A1]/5 text-[#0D47A1]">
              <FiAward size={18} strokeWidth={2.5} />
            </div> */}
            <div className="text-left">
              <h2 className="text-lg font-bold text-[#1A1A2E]">Performance Rankings</h2>
              <p className="text-[11px] font-medium text-[#9B9BAD]">{filteredData.length} team members</p>
            </div>
          </div>
          <div className="bg-[#F4F3EF] rounded-2xl px-4 py-2.5 flex items-center gap-2 min-w-[220px]">
            <FiSearch size={15} className="text-[#9B9BAD] flex-shrink-0" />
            <input
              type="text"
              value={perfSearchQuery}
              onChange={(e) => setPerfSearchQuery(e.target.value)}
              placeholder="Search member..."
              className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3EF]">
                <th className="py-4 px-8 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Account Manager</th>
                <th className="py-4 px-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Current Hires</th>
                <th className="py-4 px-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Progress</th>
                <th className="py-4 px-6 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Calls</th>
                <th className="py-4 px-8 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-right">Offers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#9B9BAD] font-medium">No members found matching your search.</td>
                </tr>
              ) : (
                filteredData.map((kam, idx) => {
                  const targetPercentage = Math.min(Math.round((kam.stats.thisWeekHires / 5) * 100), 100);
                  return (
                    <tr
                      key={kam.id}
                      onClick={() => onViewPerformance(kam)}
                      className="hover:bg-[#FAFAF8] transition-all group cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-[42px] h-[42px] rounded-[14px] bg-[#F0F7FF] flex items-center justify-center text-[13px] font-bold text-[#1B4DA0] border border-[#E0E7FF] overflow-hidden flex-shrink-0 group-hover:border-[#1B4DA0]/30 transition-colors">
                            {String(kam.avatar).includes('http') || String(kam.avatar).includes('data:') ?
                              <img src={kam.avatar} alt="" className="w-full h-full object-cover" /> : kam.avatar}
                          </div>
                          <div className="text-left">
                            <p className="text-[14px] font-bold text-[#1A1A2E] group-hover:text-[#0D47A1] transition-colors">{kam.name}</p>
                            <p className="text-[11px] font-medium text-[#9B9BAD]">{kam.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-[15px] font-black text-[#1A1A2E]">{kam.stats.thisWeekHires}</span>
                          <span className="text-[12px] font-bold text-[#C5C5D2]">/ 5</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-28 h-[6px] bg-[#F4F3EF] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${targetPercentage}%` }}
                              transition={{ delay: idx * 0.05, duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: targetPercentage >= 80 ? '#10B981' : targetPercentage >= 40 ? '#0D47A1' : '#F59E0B' }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-[#9B9BAD]">{targetPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[14px] font-bold text-[#1A1A2E]">{kam.stats.callsDone || 0}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[12px] font-black border border-emerald-100">
                          +{kam.stats.offersExtended}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Metric Comparison Chart ── */}
      <motion.div variants={itemVariants} className="bg-white rounded-[32px] border border-[#F4F3EF] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-8">
          <div className="text-left">
            <h3 className="text-lg font-bold text-[#1A1A2E]">Metric Comparison</h3>
            <p className="text-[13px] text-[#9B9BAD] font-medium mt-0.5">Visualizing <span className="font-bold text-[#0D47A1]">{selectedMetric.label}</span> across team members</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {graphMetrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key)}
                className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${selectedMetric.key === metric.key
                  ? 'bg-[#0D47A1] text-white shadow-lg shadow-blue-500/10'
                  : 'bg-[#F4F3EF] text-[#6B6B7E] hover:bg-[#E8E7E2]'
                  }`}
              >
                <metric.icon size={13} />
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {sortedBySelectedMetric.map((kam, idx) => {
            const value = kam.stats?.[selectedMetric.key] || 0;
            const widthRatio = maxSelectedMetricValue > 0 ? (value / maxSelectedMetricValue) * 100 : 0;
            return (
              <div
                key={kam.id}
                onClick={() => onViewPerformance(kam)}
                className="flex items-center gap-4 group cursor-pointer py-2 px-3 -mx-3 rounded-xl hover:bg-[#FAFAF8] transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-[#F4F3EF] flex items-center justify-center text-[10px] font-black text-[#9B9BAD] border border-[#E8E7E2] flex-shrink-0 group-hover:bg-[#0D47A1]/5 group-hover:text-[#0D47A1] group-hover:border-[#0D47A1]/15 transition-colors">
                  {idx + 1}
                </div>
                <span className="w-28 text-[13px] font-bold text-[#1A1A2E] text-left truncate flex-shrink-0 group-hover:text-[#0D47A1] transition-colors">{kam.name}</span>
                <div className="flex-1 h-[10px] bg-[#F4F3EF] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthRatio}%` }}
                    transition={{ delay: idx * 0.04, duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: selectedMetric.color, opacity: 0.7 }}
                  />
                </div>
                <span className="w-10 text-[14px] font-black text-[#1A1A2E] text-right flex-shrink-0">{value}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Client Distribution Modal ── */
const ClientDistributionModal = ({ distribution, onClose }) => {
  const [selectedClient, setSelectedClient] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Root Modal Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-[1160px] bg-[#FFFFFF] rounded-[48px] shadow-2xl overflow-hidden border border-white flex h-[85vh] animate-in fade-in slide-in-from-bottom-8 duration-500"
      >
        {/* Detail Panel Backdrop (Internal to Modal) */}
        <AnimatePresence>
          {selectedClient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/40 backdrop-blur-md z-[50]"
              onClick={() => setSelectedClient(null)}
            />
          )}
        </AnimatePresence>

        {/* Main List Section */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-12 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#FBFCFF]">
            <div className="text-left">
              <h3 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne text-left">
                Clients
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-3xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm group/close"
            >
              <FiX size={28} className="transition-transform duration-300" />
            </button>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            {/* Table Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-12 py-5 border-b border-[#F1F5F9] grid grid-cols-[2fr_1fr] gap-6 text-[11px] font-bold uppercase tracking-[2px] text-[#94A3B8]">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 flex-shrink-0" /> {/* Spacer for avatar */}
                <span className="text-left">Client</span>
              </div>
              <div className="flex items-center justify-end pr-[58px]">Openings</div>
            </div>

            {/* Table Rows */}
            <div className="px-6">
              {distribution.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedClient(item)}
                  className="group grid grid-cols-[2fr_1fr] items-center gap-6 px-6 py-6 border-b border-[#F8FAFC] hover:bg-[#FBFDFF] transition-all cursor-pointer relative"
                >
                  {/* Client Column */}
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#F8FAFC] text-[#475569] flex items-center justify-center font-bold text-sm border border-[#F1F5F9] group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-300">
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1e293b] group-hover:text-blue-600 transition-colors leading-tight">
                        {item.name}
                      </h4>
                    </div>
                  </div>

                  {/* Openings Column */}
                  <div className="flex items-center justify-end gap-10">
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-[#334155]">{item.jobCount}</p>
                        <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-tighter">Active</p>
                      </div>
                    </div>
                    <FiChevronRight size={18} className="text-[#CBD5E1] group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 698px DETAIL PANEL (Right side drawer within modal) */}
        <AnimatePresence>
          {selectedClient && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 35, stiffness: 250 }}
              className="absolute inset-y-0 right-0 w-[550px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-[#F4F3EF] flex flex-col z-[60] overflow-hidden"
            >
              {/* Detail Header */}
              <div className="p-10 border-b border-[#F4F3EF] bg-white relative flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-left">
                    <h4 className="text-[28px] font-bold text-[#1e293b] tracking-tight leading-tight text-left">{selectedClient.name}</h4>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedClient(null)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12 bg-white">
                {/* Visual Stats Row - Matching reference pattern */}
                <div className="grid grid-cols-2 gap-y-10 gap-x-16 px-4">
                  <div>
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[2.5px] mb-3">Industry Segment</p>
                    <p className="text-lg font-bold text-[#334155]">{selectedClient.industry}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[2.5px] mb-3">Total Openings</p>
                    <p className="text-lg font-bold text-[#334155]">{selectedClient.jobCount} Positions</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[2.5px] mb-3">Total Hires</p>
                    <p className="text-lg font-bold text-[#334155]">{selectedClient.totalHired || '0'} Hires</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[2.5px] mb-3">Location HQ</p>
                    <p className="text-lg font-bold text-[#334155]">{selectedClient.location || 'Bangalore / Remote'}</p>
                  </div>
                </div>

                {/* Account Manager Card */}
                <div className="space-y-4">
                  <h5 className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[3px] ml-1">SPOC</h5>
                  <div className="p-8 rounded-[32px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#1e293b] text-lg font-bold border border-[#e2e8f0] shadow-sm">
                        {selectedClient.hiringManager.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#1e293b] leading-tight">{selectedClient.hiringManager}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1.5">Hiring Decision Maker</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-11 h-11 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                        <FiMail size={16} />
                      </button>
                      <button className="w-11 h-11 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                        <FiPhone size={16} />
                      </button>
                    </div>
                  </div>
                </div>


              </div>

              {/* Detail Footer */}
              <div className="p-10 border-t border-[#F4F3EF] bg-[#FBFBFF] flex gap-6">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="flex-1 py-5 bg-white border-2 border-[#F4F3EF] text-[#6B6B7E] rounded-[24px] text-[11px] font-black uppercase tracking-[2px] hover:bg-slate-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
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
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [upcomingJoinings, setUpcomingJoinings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedKAM, setSelectedKAM] = useState(null);
  const [showKAMModal, setShowKAMModal] = useState(false);
  const [showCallsBreakdownModal, setShowCallsBreakdownModal] = useState(false);
  const [showStatsInsightModal, setShowStatsInsightModal] = useState(false);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [selectedClientInModal, setSelectedClientInModal] = useState(null);
  const [clientJobDistribution, setClientJobDistribution] = useState([]);
  const [statsInsightType, setStatsInsightType] = useState(null);
  const [showKAMFormModal, setShowKAMFormModal] = useState(false);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableMember, setEditableMember] = useState(null);
  const [kamFormMode, setKamFormMode] = useState('add'); // 'add' or 'edit'
  const [kamFormData, setKamFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'KAM - Recruitment',
    profilePhoto: null,
    profilePhotoPreview: null
  });
  const [kamTeam, setKamTeam] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
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
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [noteSaving, setNoteSaving] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteEditForm, setNoteEditForm] = useState({ title: '', content: '' });
  const [isSavingNote, setIsSavingNote] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  // Live Time Display
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchUpcomingJoinings = async () => {
    try {
      const response = await getAllOffers();
      if (response && response.success) {
        const mapped = (response.data || [])
          .filter(o => o.status === 'Accepted' || o.status === 'Joined')
          .sort((a, b) => new Date(a.joiningDate) - new Date(b.joiningDate))
          .slice(0, 5)
          .map(o => ({
            id: o.id || o._id,
            candidate: o.candidateName || 'Unknown',
            position: o.position || 'Untitled',
            date: o.joiningDate,
            client: o.client || 'Internal',
            status: o.status
          }));
        setUpcomingJoinings(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard joinings:', error);
    }
  };

  const fetchUpcomingInterviews = async () => {
    try {
      const response = await getAllInterviews();
      if (response && response.success) {
        // Map to simpler format for dashboard widget
        const mapped = (response.data || [])
          .filter(i => i.status === 'Scheduled' || i.status === 'In-Progress')
          .sort((a, b) => new Date(`${a.interviewDate}T${a.startTime}`) - new Date(`${b.interviewDate}T${b.startTime}`))
          .slice(0, 5)
          .map(i => ({
            id: i.id || i._id,
            candidate: i.candidate?.name || 'Unknown',
            position: i.position?.title || 'Untitled',
            time: i.startTime,
            date: i.interviewDate,
            status: i.status,
            type: i.meetingType
          }));
        setUpcomingInterviews(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard interviews:', error);
    }
  };

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
    filterType: 'date', // Default to Today
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

  const handleCreateQuickNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) {
      showToast('Please enter both title and content', 'error');
      return;
    }

    try {
      setNoteSaving(true);
      const response = await createNote({
        title: newNote.title,
        content: newNote.content,
        department: 'HR Recruitment'
      });

      if (response.success || response.id) {
        showToast('Note added successfully!', 'success');
        setNewNote({ title: '', content: '' });
        setShowAddNoteModal(false);
        fetchRecentNotes();
      } else {
        throw new Error(response.message || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      showToast(error.message || 'Could not save note', 'error');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleUpdateSelectedNote = async () => {
    if (!noteEditForm.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    try {
      setIsSavingNote(true);
      const noteId = selectedNote._id || selectedNote.id;
      const response = await updateNote(noteId, {
        title: noteEditForm.title,
        content: noteEditForm.content,
        department: 'HR Recruitment'
      });

      if (response && (response.success || response.note)) {
        const updated = response.note || response.data;
        setSelectedNote(updated);
        // showToast('Note updated successfully', 'success'); // Removed toast for auto-save experience
        fetchRecentNotes(); // Refresh the list in overview
      }
    } catch (error) {
      console.error('Error updating note:', error);
      showToast(error.message || 'Could not update note', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this intelligence note?')) return;
    try {
      setIsSavingNote(true);
      await deleteNote(id);
      showToast('Note deleted successfully', 'success');
      setSelectedNote(null);
      fetchRecentNotes();
    } catch (err) {
      showToast(err.message || 'Failed to delete note', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  // New Team and Client Filter States content...
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
      if (kamTeam.length === 0) setTeamLoading(true);
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
        const clientList = res.data || [];
        setClients(clientList);

        // After fetching clients, fetch job distribution
        fetchClientJobDistribution(clientList);
      }
    } catch (e) {
      console.error('Failed to fetch clients:', e);
    }
  };

  const fetchClientJobDistribution = async (clientList) => {
    try {
      const res = await getAllRecruitmentPositions();
      let distribution = [];

      if (res.success) {
        const jobs = res.data || [];
        const apiClients = clientList.map((client, idx) => {
          const clientName = (client.companyName || client.name || '').toLowerCase();
          const jobCount = jobs.filter(job => {
            const jClient = job?.client?.companyName || job?.client?.name || (typeof job?.client === 'string' ? job.client : '') || '';
            return String(jClient).toLowerCase() === clientName;
          }).length;

          return {
            id: client.id || client._id,
            name: client.companyName || client.name,
            jobCount: jobCount,
            industry: client.industry || 'Technology',
            priority: 'Standard',
            lastActive: client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : 'N/A',
            hiringManager: client.contactPerson || 'N/A',
            topRoles: [],
            totalHired: 0
          };
        });

        distribution = apiClients.sort((a, b) => b.jobCount - a.jobCount);
      }

      setClientJobDistribution(distribution);
    } catch (e) {
      console.error('Failed to fetch job distribution:', e);
      setClientJobDistribution([]);
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
        fetchUpcomingInterviews();
        fetchUpcomingJoinings();
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
    // Refresh core dashboard data strictly on mount or when tab changes back to Dashboard
    if (activeTab === 'Dashboard') {
      fetchDashboardData(dateFilter, teamFilter, clientFilter);
      fetchRecentNotes();
    }
  }, [activeTab]);

  // Apply filter and refresh data
  const applyDateFilter = () => {
    setShowDateFilter(false);
    fetchDashboardData(dateFilter, teamFilter, clientFilter);
    fetchKAMTeam(dateFilter, clientFilter);
  };

  const fetchDashboardData = async (filter = dateFilter, team = teamFilter, client = clientFilter, activity = activityFilter) => {
    try {
      if (Object.keys(stats || {}).length === 0 || (stats.activePositions === 0 && stats.totalCandidates === 0)) setLoading(true);

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
    const memberData = {
      ...kam,
      stats: getEffectiveKamStats(kam),
      recentActivity: kam.recentActivity || []
    };
    setSelectedKAM(memberData);
    setEditableMember({ ...kam });
    setIsEditingInDetail(false);
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
      profilePhotoPreview: null,
      monthlyHiringTarget: ''
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
      profilePhotoPreview: kam.profilePhoto || null,
      monthlyHiringTarget: kam.monthlyHiringTarget || ''
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (1 MB limit)
    if (file.size > 1024 * 1024) {
      showToast('Photo size must be less than 1 MB', 'error');
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setKamFormData(prev => ({
        ...prev,
        profilePhoto: file,
        profilePhotoPreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
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
            avatar: newMember.profilePhoto || newMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            profilePhoto: newMember.profilePhoto,
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
              ? { ...k, name: kamFormData.name, email: kamFormData.email, phone: kamFormData.phone, role: kamFormData.role, profilePhoto: kamFormData.profilePhotoPreview, avatar: kamFormData.profilePhotoPreview || k.avatar }
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
            case 'My Team':
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
            case 'Team Performance':
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
            case 'notes':
              return <NotesTab isDarkMode={false} department="HR Recruitment" />;
            case 'Settings':
              return <SettingsTab />;
            case 'My Profile':
              return <MyProfileTab />;
            case 'Document Verification':
            case 'document-verification':
              return <DocumentVerifyTab isDarkMode={false} />;
            case 'Work Handover':
              return <WorkHandoverTab />;
            default:
              return (
                <>
                  {/* Simple Welcome Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col items-start text-left">
                      <h2 className="text-3xl font-bold text-slate-900 mb-1">
                        Welcome {userInfo.name.split(' (')[0]}
                      </h2>


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
                        <span>View Team</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                      title="All Clients"
                      value={clients.length || 0}
                      icon={FiUsers}
                      trend={`${clients.length > 0 ? 'Active' : 'No Clients'}`}
                      color="bg-rose-500"
                      onClick={() => setShowClientsModal(true)}
                    />
                    <StatCard
                      title="Active Positions"
                      value={stats.activePositions || 0}
                      icon={FiBriefcase}
                      trend="+2 this week"
                      color="bg-blue-500"
                      onClick={() => setActiveTab('Job Openings')}
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
                                      className={`w-full px-4 py-2.5 text-left text-[10px] font-bold transition-all font-syne ${teamFilter === team ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
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
                            <span className="text-4xl font-bold text-[#1A1A2E] font-sans">
                              {getPipelineChartData().reduce((acc, curr) => acc + curr.value, 0)}
                            </span>
                            <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.2em] mt-1 font-syne">IN PIPELINE</span>
                            {teamFilter !== 'All Team' && (
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">{teamFilter}</span>
                            )}
                          </div>
                        </div>

                        {/* Legend below chart - Styled like the requested image */}
                        <div className="w-full flex justify-center gap-16 mt-4">
                          {getPipelineChartData().map((entry) => (
                            <div key={entry.name} className="flex flex-col items-center group">
                              <div className="w-6 h-1.5 rounded-full mb-3 transition-transform group-hover:scale-x-125 shadow-sm" style={{ backgroundColor: entry.color }} />
                              <span className="text-xl font-bold text-[#1A1A2E] leading-none mb-1 font-sans">{entry.value}</span>
                              <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.1em] font-syne">{entry.name}</span>
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
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'Syne' }}
                              dy={15}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'Syne' }}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                padding: '12px 16px',
                                fontFamily: 'Syne',
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

                  {/* Interactive Sections Grid (2x2 Structure) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 w-full">
                    {/* Upcoming Interviews Section */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col h-full transition-all hover:shadow-xl hover:shadow-[#3FA9F5]/5">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-[#E3F2FD80] text-[#3FA9F5] shadow-sm">
                            <FiCalendar className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight font-syne text-left">Upcoming Interviews</h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 overflow-y-auto max-h-[450px] custom-scrollbar pr-3 -mr-2">
                        {upcomingInterviews.map((interview) => (
                          <div
                            key={interview.id}
                            onClick={() => setSelectedInterview(interview)}
                            className="w-full bg-[#FAFAFA]/70 border border-slate-100 rounded-[32px] p-6 group hover:bg-white hover:border-[#3FA9F5]/40 hover:shadow-xl hover:shadow-[#3FA9F5]/5 transition-all duration-300 cursor-pointer relative text-left flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-5">
                                <div className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${interview.status === 'In Progress' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                  }`}>
                                  {interview.status}
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-50">{interview.time}</span>
                              </div>

                              <div className="mb-4">
                                <h4 className="text-sm font-bold text-[#1A1A2E] tracking-tight group-hover:text-[#3FA9F5] transition-colors uppercase leading-tight">{interview.candidate}</h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-5 border-t border-slate-100/80">
                              <div className="w-5 h-5 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                <FiTarget size={10} />
                              </div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{interview.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming Joining Section */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col h-full transition-all hover:shadow-xl hover:shadow-emerald-500/5">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-[#E3F2FD80] border border-blue-100/50 text-[#1B4DA0] shadow-sm">
                            <FiUserPlus className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight font-syne text-left">Upcoming Joinings</h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 overflow-y-auto max-h-[450px] custom-scrollbar pr-3 -mr-2">
                        {upcomingJoinings.length > 0 ? upcomingJoinings.map((joining) => (
                          <div
                            key={joining.id}
                            className="w-full bg-[#FAFAFA]/70 border border-slate-100 rounded-[32px] p-6 group hover:bg-white hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer relative text-left flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-5">
                                <div className="px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                                  Confirmed
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-50">
                                  {new Date(joining.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>

                              <div className="mb-4">
                                <h4 className="text-sm font-bold text-[#1A1A2E] tracking-tight group-hover:text-emerald-600 transition-colors uppercase leading-tight">{joining.candidate}</h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-5 border-t border-slate-100/80">
                              <div className="w-5 h-5 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                <FiBriefcase size={10} />
                              </div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{joining.client}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="w-full py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No upcoming joiners this week</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Team Section */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col h-full transition-all hover:shadow-xl hover:shadow-blue-500/5">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50 text-[#1B4DA0] shadow-sm">
                            <FiUsers className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight font-syne">Active Team</h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 overflow-y-auto max-h-[450px] custom-scrollbar pr-3 -mr-2">
                        {kamTeam.map((kam) => {
                          const initials = (kam.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 1).toUpperCase();
                          const isActive = teamFilter === kam.name;
                          return (
                            <div
                              key={kam.id}
                              onClick={() => handleViewKAM(kam)}
                              className={`w-full p-2.5 rounded-[24px] flex items-center gap-4 transition-all duration-300 cursor-pointer border-2 ${isActive
                                ? 'bg-[#E3F2FD] border-blue-400 shadow-lg shadow-blue-500/10'
                                : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 shadow-sm'
                                }`}
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-colors ${isActive ? 'bg-white text-blue-600' : 'bg-[#E3F2FD80] text-[#1B4DA0]'
                                }`}>
                                {initials}
                              </div>
                              <div className="flex flex-col text-left overflow-hidden">
                                <p className={`text-sm font-bold tracking-tight transition-colors truncate ${isActive ? 'text-blue-700' : 'text-[#1A1A2E]'
                                  }`}>
                                  {kam.name}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live Notes Section */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                      <div className="p-8 flex items-center justify-between border-b border-slate-50">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => setActiveTab('Notes')}
                        >
                          <div className="p-3 rounded-2xl bg-[#E3F2FD80] border border-blue-100/50 text-[#1B4DA0] shadow-sm group-hover:bg-[#1B4DA0] group-hover:text-white transition-all">
                            <FiEdit3 className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-xl text-[#1A1A2E] tracking-tight font-syne leading-none text-left group-hover:text-[#1B4DA0] transition-colors">Notes</h3>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAddNoteModal(true)}
                          className="p-2 rounded-xl bg-[#FAFAF8] text-[#1B4DA0] hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm"
                        >
                          <FiPlus className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto flex-1 bg-white p-6 space-y-4 custom-scrollbar">
                        {notesLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Syncing records...</p>
                          </div>
                        ) : recentNotes.length > 0 ? (
                          recentNotes.map((note) => (
                            <div
                              key={note.id}
                              onClick={() => setSelectedNote(note)}
                              className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#F4F3EF] hover:bg-white hover:border-[#1B4DA0]/20 hover:shadow-md transition-all duration-300 group relative text-left cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-[14px] text-slate-800 tracking-tight transition-colors font-syne">{note.title}</h4>
                              </div>
                              <div className="flex items-center justify-end">
                                <button className="text-[#1B4DA0] hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                                  <FiArrowRight className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-slate-200">
                              <FiEdit3 size={24} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 mb-1">No Notes Found</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team directives will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
          }
        })()}
      </Suspense>
    );
  };

  // Removed auto-refresh interval to prevent flickering. Data refreshes on tab change.

  const dashboardStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
      transition: all 0.3s;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #e2e8f0 transparent;
    }
  `;

  return (
    <>
      <style>{dashboardStyles}</style>
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
        isLoading={loading}
        bottomTabName="My Profile"
      >
        {renderContent()}

        {/* Client Job Distribution Modal - Global */}
        <AnimatePresence>
          {showClientsModal && (
            <ClientDistributionModal
              distribution={clientJobDistribution}
              onClose={() => setShowClientsModal(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Note Detail Drawer Portal (Moved inside AdminLayout for reliable rendering) */}
        {createPortal(
          <AnimatePresence>
            {selectedNote && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    if (isEditingNote) handleUpdateSelectedNote();
                    setSelectedNote(null);
                    setIsEditingNote(false);
                  }}
                  className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 h-full w-full max-w-[650px] bg-white dark:bg-slate-950 z-[1101] shadow-2xl flex flex-col overflow-hidden"
                  style={{ boxShadow: '-20px 0 50px rgba(0,0,0,0.15)' }}
                >
                  {/* Header */}
                  <div className="p-10 border-b border-[#F4F3EF] dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between z-10">
                    <div className="text-left flex-1 mr-4">
                      {isEditingNote ? (
                        <input
                          autoFocus
                          type="text"
                          value={noteEditForm.title}
                          onChange={(e) => setNoteEditForm({ ...noteEditForm, title: e.target.value })}
                          className="text-2xl font-bold text-[#1A1A2E] dark:text-white font-syne bg-transparent border-none focus:ring-0 p-0 w-full"
                          placeholder="Note Title"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-[#1A1A2E] dark:text-white font-syne text-left">{selectedNote.title}</h2>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 justify-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E8E7E2]" />
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] text-left">
                          {new Date(selectedNote.updatedAt || selectedNote.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isEditingNote ? (
                        <button
                          onClick={() => {
                            setNoteEditForm({ title: selectedNote.title, content: selectedNote.content });
                            setIsEditingNote(true);
                          }}
                          className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-800 text-[#1B4DA0] hover:bg-blue-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center shadow-sm"
                          title="Edit Note"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleUpdateSelectedNote();
                            setIsEditingNote(false);
                          }}
                          className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all flex items-center justify-center shadow-sm"
                          title="Save Note"
                        >
                          <FiCheck size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (isEditingNote) handleUpdateSelectedNote();
                          setSelectedNote(null);
                          setIsEditingNote(false);
                        }}
                        className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-800 text-[#6B6B7E] hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center shadow-sm"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8 text-left">
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-900 flex items-center justify-center text-[#1B4DA0]">
                          <FiFileText size={16} />
                        </div>
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Description</span>
                      </div>

                      <div className="bg-[#FAFAFA] dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 p-10 min-h-[300px] transition-all duration-300">
                        {isEditingNote ? (
                          <textarea
                            value={noteEditForm.content}
                            onChange={(e) => setNoteEditForm({ ...noteEditForm, content: e.target.value })}
                            onBlur={handleUpdateSelectedNote}
                            className="w-full min-h-[250px] text-[15px] text-[#4B4B5E] dark:text-slate-300 font-medium leading-[1.8] bg-transparent border-none focus:ring-0 p-0 resize-none custom-scrollbar"
                            placeholder="Type note content here..."
                          />
                        ) : (
                          <div className="text-[15px] text-[#4B4B5E] dark:text-slate-300 font-medium leading-[1.8] whitespace-pre-wrap">
                            {selectedNote.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-10 border-t border-[#F4F3EF] dark:border-slate-800 bg-[#FBFBFF] dark:bg-slate-950 flex gap-4">
                    <button
                      onClick={() => {
                        if (isEditingNote) handleUpdateSelectedNote();
                        setSelectedNote(null);
                        setIsEditingNote(false);
                      }}
                      className="flex-[1] py-5 bg-white dark:bg-slate-900 border-2 border-[#F4F3EF] dark:border-slate-800 text-[#6B6B7E] rounded-[24px] text-[11px] font-black uppercase tracking-[2px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleDeleteNote(selectedNote?._id || selectedNote?.id)}
                      disabled={isSavingNote}
                      className="flex-[2] py-5 bg-white dark:bg-slate-900 border-2 border-red-50 text-red-500 rounded-[24px] text-[11px] font-black uppercase tracking-[2px] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <FiTrash2 size={14} />
                      Delete Intelligence Note
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
      </AdminLayout>


      {/* Create Note Modal */}
      <AnimatePresence>
        {showAddNoteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
              onClick={() => setShowAddNoteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-[5vh] -translate-x-1/2 w-full max-w-lg bg-white rounded-[40px] shadow-2xl z-[1101] flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50 flex flex-col items-center justify-center relative flex-shrink-0">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 font-syne tracking-tight">Create Note</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1.5">Strategy Protocol Entry</p>
                </div>
                <button
                  onClick={() => setShowAddNoteModal(false)}
                  className="absolute right-8 top-10 w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                <form onSubmit={handleCreateQuickNote} className="space-y-10">
                  <div className="space-y-4 text-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] block">Title *</label>
                    <input
                      autoFocus
                      type="text"
                      required
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className="w-full p-6 rounded-[24px] bg-[#F8F9FA] border border-slate-100 text-slate-900 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all outline-none placeholder:text-slate-300 text-center"
                      placeholder="Enter note title..."
                    />
                  </div>

                  <div className="space-y-4 text-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] block">Content *</label>
                    <textarea
                      required
                      rows={6}
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      className="w-full p-6 rounded-[24px] bg-[#F8F9FA] border border-slate-100 text-slate-900 font-medium text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all outline-none placeholder:text-slate-300 resize-none text-center"
                      placeholder="Write your note content here..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddNoteModal(false)}
                      className="flex-1 py-5 bg-white border-2 border-slate-100 text-slate-500 rounded-[24px] text-[11px] font-black uppercase tracking-[2px] hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={noteSaving}
                      className="flex-[2] py-5 bg-[#1B4DA0] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[2px] hover:bg-[#153e82] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group disabled:opacity-70"
                    >
                      {noteSaving ? (
                        <FiRefreshCw className="animate-spin w-4 h-4" />
                      ) : (
                        <FiPlus className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={3} />
                      )}
                      {noteSaving ? 'Processing...' : 'Create Note'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* KAM Detail Drawer */}
      <AnimatePresence>
        {showKAMModal && selectedKAM && (
          <>
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
              onClick={() => setShowKAMModal(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-[698px] bg-white z-[1101] shadow-2xl flex flex-col"
              style={{ boxShadow: "-12px 0 40px rgba(0,0,0,0.12)" }}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Member Details</h3>
                <div className="flex items-center gap-3">
                  {isEditingInDetail ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingInDetail(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B6B7E] bg-[#F4F3EF] hover:bg-[#E8E7E2] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isSavingDetail}
                        onClick={async () => {
                          try {
                            setIsSavingDetail(true);
                            await updateKAMMember(editableMember.id, editableMember);
                            setKamTeam(prev => prev.map(m => m.id === editableMember.id ? { ...m, ...editableMember } : m));
                            setSelectedKAM({ ...selectedKAM, ...editableMember });
                            setIsEditingInDetail(false);
                          } catch (error) {
                            showToast(error.message || 'Failed to update member', 'error');
                          } finally {
                            setIsSavingDetail(false);
                          }
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D47A1] hover:bg-[#0a3a82] transition-all flex items-center gap-2 shadow-md shadow-blue-500/10"
                      >
                        {isSavingDetail ? <FiRefreshCw className="animate-spin w-3.5 h-3.5" /> : <FiSave className="w-3.5 h-3.5" />}
                        {isSavingDetail ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingInDetail(true)}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-[#0D47A1] hover:bg-blue-50 transition-all duration-300"
                      title="Edit Member"
                    >
                      <FiEdit2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => setShowKAMModal(false)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-[28px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/20 overflow-hidden"
                    style={{ background: selectedKAM.color?.gradient || 'linear-gradient(to right, #3b82f6, #06b6d4)' }}>
                    {String(selectedKAM.avatar).includes('data:image') || String(selectedKAM.avatar).includes('http') ? (
                      <img src={selectedKAM.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedKAM.avatar || (selectedKAM.name || 'U')[0]
                    )}
                  </div>
                  <div>
                    {isEditingInDetail ? (
                      <input
                        type="text"
                        className="w-full text-2xl font-bold text-[#1A1A2E] bg-[#F4F3EF] border-none rounded-xl py-2 px-4 text-center focus:ring-2 focus:ring-[#0D47A1]/20 outline-none"
                        value={editableMember.name}
                        onChange={(e) => setEditableMember({ ...editableMember, name: e.target.value })}
                        placeholder="Full Name"
                      />
                    ) : (
                      <h4 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedKAM.name}</h4>
                    )}
                    {isEditingInDetail ? (
                      <input
                        type="text"
                        className="w-full text-sm font-semibold text-[#1B4DA0] bg-[#F4F3EF] border-none rounded-lg py-1 px-3 text-center focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none mt-2"
                        value={editableMember.role}
                        onChange={(e) => setEditableMember({ ...editableMember, role: e.target.value })}
                        placeholder="Role"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-[#1B4DA0] mt-1">{selectedKAM.role}</p>
                    )}
                  </div>
                </div>

                {/* Unified Info Container */}
                <div className="bg-[#FAFAF8] rounded-[24px] border border-[#F4F3EF] p-5 space-y-5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6B6B7E] font-medium">Department</span>
                      {isEditingInDetail ? (
                        <select
                          className="text-sm text-[#1A1A2E] font-bold bg-white border border-[#F4F3EF] rounded-lg px-2 py-1 outline-none"
                          value={editableMember.department}
                          onChange={(e) => setEditableMember({ ...editableMember, department: e.target.value })}
                        >
                          {['HR Recruitment', 'HR Operations', 'IT', 'Sales', 'Marketing', 'BD', 'Finance', 'Management'].map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-[#1A1A2E] font-bold">{selectedKAM.department || 'HR Recruitment'}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6B6B7E] font-medium">Status</span>
                      {isEditingInDetail ? (
                        <select
                          className="text-sm text-[#1A1A2E] font-bold bg-white border border-[#F4F3EF] rounded-lg px-2 py-1 outline-none"
                          value={editableMember.status}
                          onChange={(e) => setEditableMember({ ...editableMember, status: e.target.value })}
                        >
                          {['Active', 'Inactive', 'On Leave'].map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${selectedKAM.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>{selectedKAM.status}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6B6B7E] font-medium">Email</span>
                      {isEditingInDetail ? (
                        <input
                          type="email"
                          className="text-sm text-[#1A1A2E] font-bold bg-white border border-[#F4F3EF] rounded-lg px-2 py-1 outline-none text-right"
                          value={editableMember.email}
                          onChange={(e) => setEditableMember({ ...editableMember, email: e.target.value })}
                        />
                      ) : (
                        <span className="text-sm text-[#1A1A2E] font-bold">{selectedKAM.email}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6B6B7E] font-medium">Contact</span>
                      {isEditingInDetail ? (
                        <input
                          type="tel"
                          className="text-sm text-[#1A1A2E] font-bold bg-white border border-[#F4F3EF] rounded-lg px-2 py-1 outline-none text-right"
                          value={editableMember.phone}
                          onChange={(e) => setEditableMember({ ...editableMember, phone: e.target.value })}
                        />
                      ) : (
                        <span className="text-sm text-[#1A1A2E] font-bold">{selectedKAM.phone}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-[#F4F3EF]">
                      <p className="text-sm text-[#6B6B7E] font-medium">Total Hires</p>
                      <p className="text-sm text-[#1A1A2E] font-bold">{selectedKAM.stats?.thisWeekHires || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-[#F4F3EF] flex gap-3">
                {isEditingInDetail ? (
                  <>
                    <button
                      disabled={isSavingDetail}
                      onClick={async () => {
                        try {
                          setIsSavingDetail(true);
                          await updateKAMMember(editableMember.id, editableMember);
                          setKamTeam(prev => prev.map(m => m.id === editableMember.id ? { ...m, ...editableMember } : m));
                          setSelectedKAM({ ...selectedKAM, ...editableMember });
                          setIsEditingInDetail(false);
                        } catch (error) {
                          showToast(error.message || 'Failed to update member', 'error');
                        } finally {
                          setIsSavingDetail(false);
                        }
                      }}
                      className="flex-1 py-3 bg-[#0D47A1] text-white rounded-xl text-xs font-bold hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10"
                    >
                      {isSavingDetail ? <FiRefreshCw className="animate-spin w-3.5 h-3.5" /> : <FiSave className="w-3.5 h-3.5" />}
                      {isSavingDetail ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditingInDetail(false)}
                      className="flex-1 py-3 bg-[#F4F3EF] text-[#6B6B7E] rounded-xl text-xs font-bold hover:bg-[#EEF2FB] transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowKAMModal(false)}
                    className="flex-1 py-3 bg-[#F4F3EF] text-[#6B6B7E] rounded-xl text-xs font-bold hover:bg-[#EEF2FB] transition-all"
                  >
                    Close
                  </button>
                )}
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
            className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100] flex items-center justify-center p-4"
            onClick={() => setShowCallsBreakdownModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden z-[1101]"
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
                    className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                  >
                    <FiX size={18} />
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
                    className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center shadow-sm"
                  >
                    <FiX size={18} />
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
                  className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center shadow-sm"
                  disabled={formSubmitting}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmitKAMForm} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center justify-center pb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[32px] bg-[#F4F3EF] border-2 border-dashed border-[#C5C5D2] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#1B4DA0]/50">
                      {kamFormData.profilePhotoPreview ? (
                        <img src={kamFormData.profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FiUsers size={32} className="text-[#C5C5D2]" />
                      )}

                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <FiEdit2 className="text-white w-6 h-6 hover:scale-110 transition-transform" />
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} disabled={formSubmitting} />
                      </label>
                    </div>
                    {kamFormData.profilePhotoPreview && (
                      <button
                        type="button"
                        onClick={() => setKamFormData(prev => ({ ...prev, profilePhoto: null, profilePhotoPreview: null }))}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all scale-0 group-hover:scale-100"
                        disabled={formSubmitting}
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mt-3">Profile Photo (Max 1MB)</p>
                </div>

                {/* Personal Information */}


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Full Name *</label>
                    <div className="relative flex items-center">
                      <FiUsers className="absolute left-4 text-[#C5C5D2]" />
                      <input type="text" required placeholder="e.g. John Doe"
                        className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                        value={kamFormData.name} onChange={(e) => setKamFormData({ ...kamFormData, name: e.target.value })} disabled={formSubmitting} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Employee ID</label>
                    <div className="relative flex items-center">
                      <FiFileText className="absolute left-4 text-[#C5C5D2]" />
                      <input type="text" placeholder="e.g. MAB-0042"
                        className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                        value={kamFormData.employeeId || ''} onChange={(e) => setKamFormData({ ...kamFormData, employeeId: e.target.value })} disabled={formSubmitting} />
                    </div>
                  </div>
                </div>



                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email Address *</label>
                    <div className="relative flex items-center">
                      <FiMail className="absolute left-4 text-[#C5C5D2]" />
                      <input type="email" required placeholder="john@mabicons.com"
                        className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                        value={kamFormData.email} onChange={(e) => setKamFormData({ ...kamFormData, email: e.target.value })} disabled={formSubmitting} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Phone Number *</label>
                    <div className="relative flex items-center">
                      <FiPhone className="absolute left-4 text-[#C5C5D2]" />
                      <input type="tel" required placeholder="+91 9876543210"
                        className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                        value={kamFormData.phone} onChange={(e) => setKamFormData({ ...kamFormData, phone: e.target.value })} disabled={formSubmitting} />
                    </div>
                  </div>
                </div>



                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Department</label>
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
                    <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Joining Date</label>
                    <div className="relative flex items-center">
                      <FiCalendar className="absolute left-4 text-[#C5C5D2]" />
                      <input type="date"
                        className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                        value={kamFormData.joiningDate || ''} onChange={(e) => setKamFormData({ ...kamFormData, joiningDate: e.target.value })} disabled={formSubmitting} />
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Monthly Hiring Target</label>
                    <div className="relative flex items-center">
                      <FiTarget className="absolute left-4 text-[#C5C5D2]" />
                      <input type="number" placeholder="e.g. 5"
                        className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                        value={kamFormData.monthlyHiringTarget || ''} onChange={(e) => setKamFormData({ ...kamFormData, monthlyHiringTarget: e.target.value })} disabled={formSubmitting} />
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
              className="fixed right-0 top-0 h-full w-full max-w-[698px] bg-[#FAFAF8] z-[10000] shadow-2xl flex flex-col"
              style={{ boxShadow: "-12px 0 40px rgba(0,0,0,0.15)" }}
            >
              {/* Drawer Header */}
              <div className="p-6 bg-white border-b border-[#E8E7E2] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <FiAward className="text-[#1B4DA0]" size={24} />
                  <h3
                    className="text-xl font-bold text-[#1A1A2E]"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Performance Matrix
                  </h3>
                </div>

                <button
                  onClick={() => setPerformanceKam(null)}
                  className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center shadow-sm"
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
                    <h4
                      className="text-2xl font-bold text-[#1A1A2E]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {performanceKam.name}
                    </h4>
                  </div>

                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-[4px] mt-1 mb-8">
                    {performanceKam.role}
                  </p>

                  <div className="flex items-center gap-6 mt-2 w-full justify-center">
                    <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm min-w-[80px]">
                      <span className="text-xl font-bold text-[#1A1A2E]">
                        {performanceKam.stats.thisWeekHires}
                      </span>
                      <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[1px]">
                        Hires
                      </span>
                    </div>

                    <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm min-w-[80px]">
                      <span className="text-xl font-bold text-[#1A1A2E]">
                        {performanceKam.stats.interviewsScheduled}
                      </span>
                      <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[1px]">
                        Interviews
                      </span>
                    </div>

                    <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm min-w-[80px]">
                      <span className="text-xl font-bold text-emerald-500">
                        +{performanceKam.stats.offersExtended}
                      </span>
                      <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[1px]">
                        Offers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Table */}
                <div className="space-y-4 pt-4">
                  <h5 className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1">
                    Key Metrics
                  </h5>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        label: "Total Calling",
                        value: performanceKam.stats.callsDone || 0,
                        icon: FiPhone,
                        color: "text-blue-500",
                        bg: "bg-blue-50",
                      },
                      {
                        label: "Pipeline Size",
                        value: performanceKam.stats.candidatesPipeline || 0,
                        icon: FiUsers,
                        color: "text-indigo-500",
                        bg: "bg-indigo-50",
                      },
                      {
                        label: "Profiles Shared",
                        value: performanceKam.stats.profilesShared || 0,
                        icon: FiFileText,
                        color: "text-emerald-500",
                        bg: "bg-emerald-50",
                      },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E8E7E2] hover:border-[#1B4DA0]/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl ${m.bg} ${m.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                          >
                            <m.icon size={18} />
                          </div>

                          <span className="text-sm font-bold text-[#4B4B5E]">
                            {m.label}
                          </span>
                        </div>

                        <span className="text-base font-black text-[#1A1A2E]">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedInterview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInterview(null)}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[550px] bg-white shadow-2xl z-[1101] flex flex-col"
            >
              {/* Header - Sticky Style */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne text-left">{selectedInterview.candidate}</h2>
                  <div className="flex items-center gap-2 mt-1.5 justify-start">
                    <span className="text-[10px] font-bold text-[#3FA9F5] uppercase tracking-[3px] text-left">{selectedInterview.position}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8E7E2]" />
                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] text-left">{selectedInterview.type}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center shadow-sm"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Detailed Content - Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                {/* Snapshot Grid Grid - Pattern from Job Detail */}
                <div className="bg-[#FAFAFA] rounded-[32px] border border-[#F4F3EF] p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] text-left">Interview Time</p>
                      <p className="text-sm font-bold text-[#1A1A2E] text-left">{selectedInterview.time}</p>
                    </div>
                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] text-left">Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border text-left ${selectedInterview.status === 'In Progress' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-[#E3F2FD80] text-[#3FA9F5] border-blue-100'
                        }`}>
                        {selectedInterview.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] text-left">Round Type</p>
                      <p className="text-sm font-bold text-[#1A1A2E] text-left">{selectedInterview.type}</p>
                    </div>
                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] text-left">Mode</p>
                      <p className="text-sm font-bold text-[#1A1A2E] text-left">Remote (Teams)</p>
                    </div>
                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] text-left">Experience</p>
                      <p className="text-sm font-bold text-[#1A1A2E] text-left">4.5 Years</p>
                    </div>
                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] text-left">Interviewer</p>
                      <p className="text-sm font-bold text-[#1A1A2E] text-left">Aravind Swamy</p>
                    </div>
                  </div>

                  {/* Profile Summary */}
                  <div className="pt-8 border-t border-[#F4F3EF] text-left">
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] opacity-70 mb-3 text-left">Candidate Profile</p>
                    <p className="text-[14px] font-medium text-[#4B4B5E] leading-relaxed italic text-left">
                      "Professional developer with expertise in building high-performance systems and modern web technologies."
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="pt-8 border-t border-[#F4F3EF] text-left">
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] opacity-70 mb-4 text-left">Technical Skills</p>
                    <div className="flex flex-wrap gap-2 justify-start">
                      {['React.js', 'Node.js', 'System Design', 'Redux'].map(skill => (
                        <span key={skill} className="px-4 py-2 bg-white border border-[#F4F3EF] rounded-xl text-[11px] font-bold text-[#4B4B5E] shadow-sm">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Round Details */}
                  <div className="pt-8 border-t border-[#F4F3EF] text-left">
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] opacity-70 mb-4 text-left">Interview Context</p>
                    <ul className="space-y-3 text-left">
                      {[
                        'Performance optimization and profiling',
                        'System architecture and scaling',
                        'Team leadership qualities',
                        'Cultural alignment'
                      ].map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-[#4B4B5E] font-medium leading-relaxed justify-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3FA9F5] mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-10 border-t border-[#F4F3EF] bg-[#FBFBFF] flex gap-4">
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="flex-1 py-5 bg-white border-2 border-[#F4F3EF] text-[#6B6B7E] rounded-[24px] text-[11px] font-black uppercase tracking-[2px] hover:bg-slate-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
};

export default RecruitmentHeadDashboard;
