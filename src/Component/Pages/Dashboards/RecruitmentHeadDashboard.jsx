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
  FiSend,
  FiEdit2,
  FiEye,
  FiShare2,
  FiRefreshCw,
  FiX,
  FiTrash2,
  FiPlus,
  FiEdit3,
} from 'react-icons/fi';
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
} from '../service/api';

// Lazy load Tab Components
const JobOpeningsTab = lazy(() => import('./Tabs/KAMRecruitment/JobOpeningsTab'));
const CandidatePipelineTab = lazy(() => import('./Tabs/KAMRecruitment/CandidatePipelineTab'));
const InterviewScheduleTab = lazy(() => import('./Tabs/KAMRecruitment/InterviewScheduleTab'));
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
  { gradient: 'linear-gradient(to right, #ec4899, #f43f5e)', from: '#ec4899', to: '#f43f5e' }, // pink-500 to rose-500
  { gradient: 'linear-gradient(to right, #8b5cf6, #a855f7)', from: '#8b5cf6', to: '#a855f7' }, // violet-500 to purple-500
  { gradient: 'linear-gradient(to right, #10b981, #14b8a6)', from: '#10b981', to: '#14b8a6' }, // emerald-500 to teal-500
  { gradient: 'linear-gradient(to right, #3b82f6, #06b6d4)', from: '#3b82f6', to: '#06b6d4' }, // blue-500 to cyan-500
  { gradient: 'linear-gradient(to right, #f59e0b, #f97316)', from: '#f59e0b', to: '#f97316' }, // amber-500 to orange-500
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
      {
        id: 'team',
        title: 'MY TEAM',
        icon: FiUsers,
        submenu: [
          { id: 1, title: 'Team Overview' },
          { id: 2, title: 'KAM Performance' },
          { id: 3, title: 'Task Assignment' },
        ]
      },
      {
        id: 'recruitment',
        title: 'RECRUITMENT',
        icon: FiBriefcase,
        submenu: [
          { id: 4, title: 'Job Openings' },
          { id: 5, title: 'Candidate Pipeline' },
          { id: 6, title: 'Interview Schedule' },
        ]
      },
      {
        id: 'assessment',
        title: 'ASSESSMENT',
        icon: FiAward,
        submenu: [
          { id: 8, title: 'Offer Management' },
        ]
      },
      {
        id: 'analytics',
        title: 'ANALYTICS',
        icon: FiTrendingUp,
        submenu: [
          { id: 10, title: 'Resume Bank' },
        ]
      },
      {
        id: 'activity',
        title: 'ACTIVITY',
        icon: FiActivity,
        submenu: [
          { id: 11, title: 'Activity Feed' },
          { id: 12, title: 'Team MIS Reports' },
          { id: 13, title: 'Notes' },
        ]
      },
    ],
  },
];

// KAM Card Component
const KAMCard = ({ kam, onViewDetails, onAssignTask, onMessage, index = 0 }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  // Hardcoded gradients for each card index
  const CARD_GRADIENTS = [
    'linear-gradient(to right, #ec4899, #f43f5e)', // pink
    'linear-gradient(to right, #8b5cf6, #a855f7)', // violet
    'linear-gradient(to right, #10b981, #14b8a6)', // emerald
    'linear-gradient(to right, #3b82f6, #06b6d4)', // blue
    'linear-gradient(to right, #f59e0b, #f97316)', // amber
  ];
  const cardGradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

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
        className="h-24 relative"
        style={{ background: cardGradient }}
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
const TeamOverviewContent = ({ teamData, loading, onViewKAM, onAssignTask, onMessage, onRefresh, onAddKAM, globalStats, onViewCallsBreakdown }) => {
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
    <div className="space-y-8">
      {/* Team Stats Summary */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">KAM Team Dashboard</h1>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Refresh team data"
              >
                <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
          <p className="text-blue-100 mb-6">Manage your Key Account Managers and track their recruitment performance</p>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{teamData.length}</p>
              <p className="text-sm text-blue-100">KAMs</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{displayStats.activePositions}</p>
              <p className="text-sm text-blue-100">Total Jobs</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{displayStats.candidatesPipeline}</p>
              <p className="text-sm text-blue-100">Candidates</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{displayStats.interviewsScheduled}</p>
              <p className="text-sm text-blue-100">Interviews</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{displayStats.thisWeekHires}</p>
              <p className="text-sm text-blue-100">This Week</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{displayStats.profilesShared}</p>
              <p className="text-sm text-blue-100">Profiles Shared</p>
            </div>
            <button
              type="button"
              onClick={onViewCallsBreakdown}
              className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/25 transition-colors"
            >
              <p className="text-3xl font-bold">{displayStats.callsDone}</p>
              <p className="text-sm text-blue-100">Phone Calls</p>
            </button>
          </div>
        </div>
      </div>

      {/* KAM Cards */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">My Team ({teamData.length} KAMs)</h2>
          {onAddKAM && (
            <button
              onClick={onAddKAM}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              <FiPlus className="w-4 h-4" /> Add KAM
            </button>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-24 bg-gray-200 rounded-xl mb-6" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-gray-100 rounded-xl" />
                  <div className="h-16 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : teamData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUsers className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No KAM Members Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start building your recruitment team by adding Key Account Managers to manage positions and candidates.
            </p>
            {onAddKAM && (
              <button
                onClick={onAddKAM}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                <FiPlus className="w-5 h-5" /> Add Your First KAM
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamData.map((kam, idx) => (
              <KAMCard
                key={kam.id}
                kam={kam}
                index={idx}
                onViewDetails={onViewKAM}
                onAssignTask={onAssignTask}
                onMessage={onMessage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Team Pending Tasks */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Team Pending Actions</h3>
          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
            {5} Pending
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="p-5 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold">PS</div>
              <div>
                <p className="font-semibold text-gray-900">Review 5 pending applications</p>
                <p className="text-sm text-gray-500">Priyanshi Sharma · Senior Developer position</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Due Today</span>
          </div>
          <div className="p-5 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold">M</div>
              <div>
                <p className="font-semibold text-gray-900">Schedule interviews for shortlisted candidates</p>
                <p className="text-sm text-gray-500">Manju · HR Executive position</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Overdue</span>
          </div>
          <div className="p-5 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">J</div>
              <div>
                <p className="font-semibold text-gray-900">Send offer letters to selected candidates</p>
                <p className="text-sm text-gray-500">Jyoti · Multiple positions</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Tomorrow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// KAM Performance Tab Content
const KAMPerformanceContent = ({ teamData, loading, dateFilter, setDateFilter, months, years, getFilterLabel, showDateFilter, setShowDateFilter }) => {
  const [activeMetric, setActiveMetric] = useState('callsDone');

  const totals = teamData.reduce(
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
  const sortedBySelectedMetric = [...teamData].sort(
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">KAM Performance Dashboard</h2>
        <div className="relative">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <FiCalendar className="w-4 h-4" />
            <span className="font-medium">{getFilterLabel()}</span>
            <svg className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className={`flex-1 px-3 py-3 text-sm font-medium transition-all ${
                      dateFilter.filterType === tab.key
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

              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setShowDateFilter(false)}
                  className="w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Jobs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.activePositions}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Candidates</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.candidatesPipeline}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Interviews</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.interviewsScheduled}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Offers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.offersExtended}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hires</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.thisWeekHires}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Profiles Shared</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.profilesShared}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Calling</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.callsDone}</p>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {teamData.map((kam, idx) => (
          <motion.div
            key={kam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                style={{ background: kam.color?.gradient || 'linear-gradient(to right, #3b82f6, #06b6d4)' }}
              >
                {kam.avatar}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{kam.name}</h3>
                <p className="text-sm text-gray-500">{kam.role}</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Hiring Target</span>
                  <span className="text-sm font-semibold text-gray-900">{kam.stats.thisWeekHires}/5</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ 
                      width: `${Math.min((kam.stats.thisWeekHires / 5) * 100, 100)}%`,
                      background: kam.color?.gradient || 'linear-gradient(to right, #3b82f6, #06b6d4)'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Interview Conversion</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {kam.stats.interviewsScheduled > 0
                      ? Math.round((kam.stats.offersExtended / kam.stats.interviewsScheduled) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${kam.stats.interviewsScheduled > 0
                        ? (kam.stats.offersExtended / kam.stats.interviewsScheduled) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Pipeline Efficiency</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {kam.stats.candidatesPipeline > 0
                      ? Math.round((kam.stats.interviewsScheduled / kam.stats.candidatesPipeline) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${kam.stats.candidatesPipeline > 0
                        ? (kam.stats.interviewsScheduled / kam.stats.candidatesPipeline) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{kam.stats.offersExtended}</p>
                <p className="text-xs text-gray-500">Offers Sent</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{kam.stats.thisWeekHires}</p>
                <p className="text-xs text-gray-500">Hired</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{kam.stats.callsDone || 0}</p>
                <p className="text-xs text-gray-500">Total Calling</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{kam.stats.interviewsScheduled || 0}</p>
                <p className="text-xs text-gray-500">Interviews</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{kam.stats.candidatesPipeline || 0}</p>
                <p className="text-xs text-gray-500">Candidates</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{kam.stats.profilesShared || 0}</p>
                <p className="text-xs text-gray-500">Profiles Shared</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Graphical Comparison */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">KAM Comparison Graph</h3>
            <p className="text-sm text-slate-600">Visual comparison by selected metric for {getFilterLabel()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {graphMetrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedMetric.key === metric.key
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
                      style={{ width: `${widthPercent}%`, backgroundColor: selectedMetric.color }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-700">
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

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">Team Leaderboard - {getFilterLabel()}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-600">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-600">KAM</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Hires</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Interviews</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Offers</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...teamData]
                .sort((a, b) => b.stats.thisWeekHires - a.stats.thisWeekHires)
                .map((kam, idx) => (
                  <tr key={kam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ background: kam.color?.gradient || 'linear-gradient(to right, #3b82f6, #06b6d4)' }}
                        >
                          {kam.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{kam.name}</p>
                          <p className="text-sm text-gray-500">{kam.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-emerald-600">{kam.stats.thisWeekHires}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-700">{kam.stats.interviewsScheduled}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-700">{kam.stats.offersExtended}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                        {(kam.stats.thisWeekHires * 10) + (kam.stats.offersExtended * 5) + (kam.stats.interviewsScheduled * 2)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`fixed top-6 right-6 z-[100] ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md`}
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
  const [stats, setStats] = useState({
    activePositions: 0,
    totalCandidates: 0,
    scheduledInterviews: 0,
    pendingOffers: 0,
    sharedProfiles: 0,
    phoneScreeningCalls: 0,
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
  
  // Date Filter State - Default to Today
  const [dateFilter, setDateFilter] = useState({
    filterType: 'date', // 'all', 'year', 'month', 'date' - Default to date (today)
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    date: getLocalISODate(),
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
    const compactDateInputRef = useRef(null);
    const dashboardDateInputRef = useRef(null);
  
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
  const fetchKAMTeam = async (filter = dateFilter) => {
    try {
      setTeamLoading(true);
      const filterParams = buildDateFilterParams(filter);
      const response = await getAllKAMMembers(filterParams);
      if (response.success && response.data?.length > 0) {
        const transformedData = transformKAMData(response.data);
        setKamTeam(transformedData);
        console.log('KAM team loaded from API:', transformedData.length, 'members');
      } else {
        console.log('No KAM members found');
        setKamTeam([]);
      }
    } catch (error) {
      console.error('Failed to fetch KAM team:', error.message);
      setKamTeam([]);
    } finally {
      setTeamLoading(false);
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
        fetchRecentNotes();
      } catch (e) {
        console.log('Token decode error');
        setUserInfo({ name: localStorage.getItem('userName') || 'Sachin', role: 'Recruitment Head' });
        fetchKAMTeam();
        fetchRecentNotes();
      }
    } else {
      fetchKAMTeam();
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
    fetchDashboardData(dateFilter);
    fetchKAMTeam(dateFilter);
  };

  const fetchDashboardData = async (filter = dateFilter) => {
    try {
      setLoading(true);
      
      // Build filter params for API
      const filterParams = buildDateFilterParams(filter);
      
      console.log('Fetching stats with filter:', filterParams);
      const statsRes = await getRecruitmentStats(filterParams);
      console.log('Stats response:', statsRes);
      
      if (statsRes.success) {
        const s = statsRes.data;
        // Use actual values, not fallbacks - show 0 if no data for filtered period
        setStats({
          activePositions: s.positions?.open ?? 0,
          totalCandidates: s.candidates?.total ?? 0,
          scheduledInterviews: s.candidates?.shortlisted ?? 0,
          pendingOffers: s.funnel?.offerSent ?? 0,
          sharedProfiles: s.candidates?.sharedCVs ?? 0,
          phoneScreeningCalls: s.funnel?.phoneInterview ?? 0,
          selected: s.candidates?.selected ?? 0,
          totalHires: s.funnel?.joined ?? 0,
          acceptedOffers: s.funnel?.joined ?? 0,
          rejectedOffers: s.funnel?.rejected ?? 0,
        });

        const total = s.candidates?.total ?? 0;
        const screening = s.funnel?.screening ?? 0;
        const interviewed = (s.funnel?.phoneInterview || 0) + (s.funnel?.technical || 0) + (s.funnel?.hrRound || 0) + (s.funnel?.clientInterview || 0);
        const selected = s.candidates?.selected ?? 0;
        
        const barData = [
          { label: 'New Applications', value: total, percentage: '100%', color: 'bg-blue-500' },
          { label: 'Screening', value: screening, percentage: total > 0 ? `${Math.round((screening/total)*100)}%` : '0%', color: 'bg-yellow-500' },
          { label: 'Interviewed', value: interviewed || s.candidates?.shortlisted || 0, percentage: total > 0 ? `${Math.round(((interviewed || s.candidates?.shortlisted || 0)/total)*100)}%` : '0%', color: 'bg-purple-500' },
          { label: 'Selected', value: selected, percentage: total > 0 ? `${Math.round((selected/total)*100)}%` : '0%', color: 'bg-green-500' },
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
      renderMeta: (kam) => `${kam.effectiveStats.candidatesPipeline || 0} candidates · ${kam.effectiveStats.interviewsScheduled || 0} interviews`,
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
      renderMeta: (kam) => `${kam.effectiveStats.profilesShared || 0} shared · ${kam.effectiveStats.callsDone || 0} calls`,
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
      renderMeta: (kam) => `${kam.effectiveStats.candidatesPipeline || 0} candidates · ${kam.effectiveStats.activePositions || 0} jobs`,
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
      renderMeta: (kam) => `${kam.effectiveStats.candidatesPipeline || 0} candidates · ${kam.effectiveStats.interviewsScheduled || 0} interviews`,
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
      renderMeta: (kam) => `${kam.effectiveStats.thisWeekHires || 0} hires · ${kam.effectiveStats.interviewsScheduled || 0} interviews`,
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
      password: 'Mabicons@123' // Default password for new members
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
                  teamData={kamTeam}
                  loading={teamLoading}
                  onViewKAM={handleViewKAM}
                  onAssignTask={handleAssignTask}
                  onMessage={handleMessage}
                  onRefresh={fetchKAMTeam}
                  onAddKAM={handleAddKAM}
                  globalStats={stats}
                  onViewCallsBreakdown={handleViewCallsBreakdown}
                />
              );
            case 'KAM Performance':
              return <KAMPerformanceContent teamData={kamTeam} loading={teamLoading} dateFilter={dateFilter} setDateFilter={setDateFilter} months={months} years={years} getFilterLabel={getFilterLabel} showDateFilter={showDateFilter} setShowDateFilter={setShowDateFilter} />;
            case 'Task Assignment':
              return <TaskAssignmentTab department="HR Recruitment" />;
            case 'Job Openings':
              return <JobOpeningsTab isDarkMode={false} />;
            case 'Candidate Pipeline':
              return <CandidatePipelineTab isDarkMode={false} setActiveTab={setActiveTab} />;
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
                  {/* Welcome Banner - Enhanced */}
                  <div className="relative rounded-3xl overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="relative z-10 p-8 lg:p-10">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm font-medium text-white/80">Online Now</span>
                          </div>
                          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                            Welcome back, {userInfo.name} <span className="inline-block animate-bounce">👋</span>
                          </h1>
                          <p className="text-lg text-white/80">
                            Recruitment Head Dashboard - Managing {kamTeam.length} KAMs
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-5">
                            <button 
                              onClick={() => setActiveTab('Job Openings')}
                              className="px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-semibold text-white border border-white/20 flex items-center gap-2 hover:bg-white/20 hover:scale-105 transition-all cursor-pointer"
                            >
                              <FiBriefcase className="w-4 h-4" /> {stats.activePositions} Active Positions
                            </button>
                            <button 
                              onClick={() => setActiveTab('Candidate Pipeline')}
                              className="px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-semibold text-white border border-white/20 flex items-center gap-2 hover:bg-white/20 hover:scale-105 transition-all cursor-pointer"
                            >
                              <FiUsers className="w-4 h-4" /> {stats.totalCandidates} Total Candidates
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-4 lg:gap-4">
                          {/* Live Time Display */}
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 group hover:bg-white/20 transition-all">
                            <div className="flex items-center gap-3">
                              <FiClock className="w-5 h-5 text-cyan-300 group-hover:animate-spin" />
                              <div className="text-right">
                                <div className="text-lg font-bold text-white tabular-nums font-mono">
                                  {formatTime(currentTime)}
                                </div>
                                <div className="text-xs text-white/70 font-medium">
                                  {formatDateFull(currentTime)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('Team Overview')}
                            className="flex items-center gap-3 px-6 py-3.5 bg-white hover:bg-white/90 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group"
                          >
                            <FiUsers className="w-5 h-5 text-indigo-600" />
                            <span className="font-bold text-indigo-600">View Team</span>
                            <FiTrendingUp className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Filter Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: '#e0e7ff' }}>
                          <FiCalendar className="w-5 h-5" style={{ color: '#4f46e5', stroke: '#4f46e5', strokeWidth: 2.5 }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Dashboard Filter</p>
                          <p className="text-xs text-gray-500">Showing data for: <span className="font-medium text-indigo-600">{getFilterLabel()}</span></p>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowDateFilter(!showDateFilter)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <FiCalendar className="w-4 h-4" />
                          <span className="font-medium">{getFilterLabel()}</span>
                          <svg className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                  className={`flex-1 px-3 py-3 text-sm font-medium transition-all ${
                                    dateFilter.filterType === tab.key
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
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                              >
                                Apply Filter
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stat Cards - Clean Simple Design */}
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Active Positions */}
                    <div 
                      onClick={() => handleOpenStatsInsight('activePositions')}
                      className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-pink-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Positions</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activePositions}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <FiTrendingUp className="w-3.5 h-3.5" style={{ color: '#10b981', stroke: '#10b981' }} />
                            <span className="text-xs font-semibold text-emerald-600">+12%</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg" style={{ background: '#fce7f3' }}>
                          <FiBriefcase className="w-5 h-5" style={{ color: '#db2777', stroke: '#db2777', strokeWidth: 2.5 }} />
                        </div>
                      </div>
                    </div>

                    {/* Total Candidates */}
                    <div 
                      onClick={() => handleOpenStatsInsight('totalCandidates')}
                      className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-400 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Candidates</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCandidates}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <FiTrendingUp className="w-3.5 h-3.5" style={{ color: '#10b981', stroke: '#10b981' }} />
                            <span className="text-xs font-semibold text-emerald-600">+8%</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg" style={{ background: '#f3f4f6' }}>
                          <FiUsers className="w-5 h-5" style={{ color: '#4b5563', stroke: '#4b5563', strokeWidth: 2.5 }} />
                        </div>
                      </div>
                    </div>

                    {/* Profiles Shared */}
                    <div 
                      onClick={() => handleOpenStatsInsight('sharedProfiles')}
                      className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-cyan-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profiles Shared</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.sharedProfiles || 0}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <FiShare2 className="w-3.5 h-3.5" style={{ color: '#0891b2', stroke: '#0891b2' }} />
                            <span className="text-xs font-semibold text-cyan-600">Client Shared</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg" style={{ background: '#ecfeff' }}>
                          <FiShare2 className="w-5 h-5" style={{ color: '#0891b2', stroke: '#0891b2', strokeWidth: 2.5 }} />
                        </div>
                      </div>
                    </div>

                    {/* Phone Screening Calls */}
                    <div 
                      onClick={handleViewCallsBreakdown}
                      className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Calls</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.phoneScreeningCalls || 0}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <FiClock className="w-3.5 h-3.5" style={{ color: '#3b82f6', stroke: '#3b82f6' }} />
                            <span className="text-xs font-semibold text-blue-600">Phone Screening</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg" style={{ background: '#dbeafe' }}>
                          <FiClock className="w-5 h-5" style={{ color: '#2563eb', stroke: '#2563eb', strokeWidth: 2.5 }} />
                        </div>
                      </div>
                    </div>

                    {/* Candidates Summary */}
                    <div 
                      onClick={() => handleOpenStatsInsight('candidatesSummary')}
                      className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Total Candidates</span>
                            <span className="text-sm font-bold text-gray-900">{stats.totalCandidates}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Candidates Selected</span>
                            <span className="text-sm font-bold text-gray-900">{stats.selected ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Total Hires</span>
                            <span className="text-sm font-bold text-gray-900">{stats.totalHires || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Offers Management */}
                    <div 
                      onClick={() => handleOpenStatsInsight('offersManagement')}
                      className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-amber-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Offers Management</p>
                        <div className="p-2 rounded-lg" style={{ background: '#fef3c7' }}>
                          <FiAward className="w-5 h-5" style={{ color: '#d97706', stroke: '#d97706', strokeWidth: 2.5 }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="text-center">
                          <p className="text-xl font-bold text-amber-600">{stats.pendingOffers ?? 0}</p>
                          <p className="text-[10px] text-gray-500">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-emerald-600">{stats.acceptedOffers ?? 0}</p>
                          <p className="text-[10px] text-gray-500">Accepted</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-red-500">{stats.rejectedOffers ?? 0}</p>
                          <p className="text-[10px] text-gray-500">Rejected</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Bar - Enhanced */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-lg text-gray-900">Recruitment Pipeline</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Last 30 days</span>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <FiRefreshCw className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {statsBarData.map((stat, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setActiveTab('Candidate Pipeline')}
                          className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-all"
                        >
                          <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                          <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${stat.color} rounded-full transition-all duration-500`} style={{ width: stat.percentage }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Quick View - Enhanced */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: '#e0e7ff' }}>
                          <FiUsers className="w-5 h-5" style={{ color: '#4f46e5', stroke: '#4f46e5', strokeWidth: 2.5 }} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">My KAM Team</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('Team Overview')}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        View All <FiTrendingUp className="w-4 h-4" style={{ color: 'currentColor', stroke: 'currentColor' }} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
                      {kamTeam.slice(0, 4).map((kam, idx) => {
                        const gradients = [
                          'linear-gradient(135deg, #ec4899, #f43f5e)',
                          'linear-gradient(135deg, #8b5cf6, #a855f7)', 
                          'linear-gradient(135deg, #10b981, #14b8a6)',
                          'linear-gradient(135deg, #3b82f6, #06b6d4)',
                          'linear-gradient(135deg, #f59e0b, #f97316)'
                        ];
                        const avatarInitials = kam.avatar || kam.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'KM';
                        
                        return (
                          <div
                            key={kam.id}
                            className="p-5 bg-white hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-white cursor-pointer transition-all"
                            onClick={() => handleViewKAM(kam)}
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-sm"
                                style={{ background: gradients[idx % 5] }}
                              >
                                {avatarInitials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">{kam.name}</h4>
                                <p className="text-xs text-gray-500">{kam.stats?.activePositions || 0} jobs · {kam.stats?.candidatesPipeline || 0} candidates</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-emerald-600">{kam.stats?.thisWeekHires || 0}</p>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Hires</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Actions & Recent Activity - Enhanced */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                          <FiTarget className="w-5 h-5" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.5 }} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Quick Actions</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setActiveTab('Job Openings')}
                          className="flex items-center gap-3 p-4 rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-left group"
                          style={{ borderColor: '#bfdbfe', background: 'linear-gradient(135deg, #f8fbff, #eef4ff)' }}
                        >
                          <div className="p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                            <FiBriefcase className="w-5 h-5" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.5 }} />
                          </div>
                          <div>
                            <span className="text-sm font-bold block" style={{ color: '#1e3a8a' }}>View Jobs</span>
                            <span className="text-[10px] font-semibold" style={{ color: '#334155' }}>{stats.activePositions} Open</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('Candidate Pipeline')}
                          className="flex items-center gap-3 p-4 rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-left group"
                          style={{ borderColor: '#99f6e4', background: 'linear-gradient(135deg, #f4fffc, #ecfdf5)' }}
                        >
                          <div className="p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                            <FiUserPlus className="w-5 h-5" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.5 }} />
                          </div>
                          <div>
                            <span className="text-sm font-bold block" style={{ color: '#064e3b' }}>Pipeline</span>
                            <span className="text-[10px] font-semibold" style={{ color: '#334155' }}>{stats.totalCandidates} Total</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('Task Assignment')}
                          className="flex items-center gap-3 p-4 rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-left group"
                          style={{ borderColor: '#c4b5fd', background: 'linear-gradient(135deg, #fbf9ff, #f5f3ff)' }}
                        >
                          <div className="p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}>
                            <FiCheckSquare className="w-5 h-5" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.5 }} />
                          </div>
                          <div>
                            <span className="text-sm font-bold block" style={{ color: '#2e1065' }}>Assign Tasks</span>
                            <span className="text-[10px] font-semibold" style={{ color: '#334155' }}>To KAMs</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('Notes')}
                          className="flex items-center gap-3 p-4 rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-left group"
                          style={{ borderColor: '#fcd34d', background: 'linear-gradient(135deg, #fffaf0, #fff7ed)' }}
                        >
                          <div className="p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #d97706, #ea580c)' }}>
                            <FiEdit3 className="w-5 h-5" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.5 }} />
                          </div>
                          <div>
                            <span className="text-sm font-bold block" style={{ color: '#451a03' }}>Notes</span>
                            <span className="text-[10px] font-semibold" style={{ color: '#334155' }}>Open Notes Tab</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Recent Activity - Enhanced */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                            <FiActivity className="w-5 h-5" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.5 }} />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900">Recent Team Activity</h3>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Live</span>
                      </div>
                      <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                        {kamTeam
                          .flatMap((kam) =>
                            (kam.recentActivity || [])
                              .filter((activity) => activity?.action && activity.action !== 'No recent activity')
                              .slice(0, 1)
                              .map((activity) => ({
                                ...activity,
                                kamName: kam.name,
                                avatar: kam.avatar,
                                color: kam.color,
                              }))
                          )
                          .map((activity, idx) => (
                            <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-white transition-colors">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                                style={{ background: activity.color?.gradient || 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
                              >
                                {activity.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">
                                  <span className="font-bold">{activity.kamName}</span>{' '}
                                  <span className="text-gray-600">{activity.action}:</span>{' '}
                                  <span className="font-medium text-indigo-600">{activity.candidate || activity.position}</span>
                                </p>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <FiClock className="w-3 h-3" /> {activity.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        {kamTeam.flatMap((kam) =>
                          (kam.recentActivity || []).filter((activity) => activity?.action && activity.action !== 'No recent activity').slice(0, 1)
                        ).length === 0 && (
                          <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <FiActivity className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500">No recent team activity found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Live Notes */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                          <FiEdit3 className="w-5 h-5" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.5 }} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Live Notes</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('Notes')}
                        className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold hover:bg-amber-200 transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[280px] overflow-y-auto">
                      {notesLoading ? (
                        <div className="p-5 text-sm text-gray-500">Loading notes...</div>
                      ) : recentNotes.length > 0 ? (
                        recentNotes.map((note) => (
                          <div key={note.id} className="p-4 hover:bg-amber-50/40 transition-colors">
                            <p className="font-semibold text-gray-900 line-clamp-1">{note.title}</p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span>{note.createdByName || 'System'}</span>
                              <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-sm text-gray-500">
                          No notes yet. Add notes from the Notes tab.
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

      {/* KAM Detail Modal */}
      <AnimatePresence>
        {showKAMModal && selectedKAM && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowKAMModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div 
                className="h-32 relative"
                style={{ background: selectedKAM.color?.gradient || 'linear-gradient(to right, #3b82f6, #06b6d4)' }}
              >
                <button
                  onClick={() => setShowKAMModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
                <div className="absolute -bottom-10 left-8">
                  <div className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-gray-700 border-4 border-white">
                    {selectedKAM.avatar}
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="pt-14 px-8 pb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedKAM.name}</h2>
                  <p className="text-gray-500">{selectedKAM.role}</p>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FiMail className="w-4 h-4" /> {selectedKAM.email}
                  </span>
                  <span className="flex items-center gap-2 text-gray-600">
                    <FiPhone className="w-4 h-4" /> {selectedKAM.phone}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{selectedKAM.stats.activePositions}</p>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">{selectedKAM.stats.candidatesPipeline}</p>
                    <p className="text-sm text-gray-600">Candidates</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">{selectedKAM.stats.interviewsScheduled}</p>
                    <p className="text-sm text-gray-600">Interviews</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-600">{selectedKAM.stats.thisWeekHires}</p>
                    <p className="text-sm text-gray-600">Hires</p>
                  </div>
                  <div className="bg-cyan-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-cyan-600">{selectedKAM.stats.profilesShared || 0}</p>
                    <p className="text-sm text-gray-600">Profiles Shared</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-rose-600">{selectedKAM.stats.callsDone || 0}</p>
                    <p className="text-sm text-gray-600">Phone Calls</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {selectedKAM.recentActivity.length > 0 ? selectedKAM.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.action}: {activity.candidate || activity.position}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    )) : (
                      <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-500">
                        No recent activity found
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { setShowKAMModal(false); handleAssignTask(selectedKAM); }}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Assign Task
                  </button>
                  <button
                    onClick={() => handleEditKAM(selectedKAM)}
                    className="px-4 py-3 border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-xl font-semibold transition-colors flex items-center gap-2"
                  >
                    <FiEdit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteKAM(selectedKAM)}
                    className="px-4 py-3 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-semibold transition-colors flex items-center gap-2"
                  >
                    <FiTrash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                <div className="absolute inset-0 opacity-25">
                  <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/25 blur-3xl" />
                  <div className="absolute -bottom-12 left-8 w-32 h-32 rounded-full bg-cyan-300/30 blur-2xl" />
                </div>
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Call Summary</p>
                    <h2 className="text-2xl font-bold text-white mt-2">Phone Calls By KAM</h2>
                    <p className="text-sm text-blue-100 mt-1">Recruitment team ke total aur member-wise phone screening calls.</p>
                  </div>
                  <button
                    onClick={() => setShowCallsBreakdownModal(false)}
                    className="p-2 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-blue-100">Dashboard Total</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.phoneScreeningCalls || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-blue-100">KAM Tracked Calls</p>
                    <p className="text-3xl font-bold text-white mt-1">{teamCallsTotal}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-blue-100">Active KAMs</p>
                    <p className="text-3xl font-bold text-white mt-1">{kamCallsBreakdown.length}</p>
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
                    <p className="text-sm text-slate-500 mt-2">Jab call stats aayenge, yahan har KAM ka breakdown dikh jayega.</p>
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
                              <p className="text-xs text-slate-400 mt-1">{kam.activePositions} jobs · {kam.candidatesPipeline} candidates</p>
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowStatsInsightModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-[28px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative overflow-hidden px-7 py-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute -top-12 -right-10 w-48 h-48 rounded-full bg-cyan-400/20 blur-3xl" />
                  <div className="absolute -bottom-12 left-8 w-40 h-40 rounded-full bg-indigo-400/20 blur-3xl" />
                </div>
                <div className="relative flex items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/90">Dashboard Insight</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mt-2 leading-tight">{activeStatsInsight.title}</h2>
                    <p className="text-sm md:text-base text-slate-200 mt-2 leading-6">{activeStatsInsight.subtitle}</p>
                  </div>
                  <button
                    onClick={() => setShowStatsInsightModal(false)}
                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors border border-white/10"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-7 bg-gradient-to-b from-slate-100 to-white max-h-[66vh] overflow-y-auto">
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
                    <p className="text-sm text-slate-500 mt-2">Is metric ke liye abhi koi team-level data available nahi hai.</p>
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

      {/* KAM Add/Edit Form Modal */}
      <AnimatePresence>
        {showKAMFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowKAMFormModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/30 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />
                </div>
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <FiUserPlus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {kamFormMode === 'add' ? 'Add New KAM' : 'Edit KAM Details'}
                        </h2>
                        <p className="text-white/80 text-sm">
                          {kamFormMode === 'add' ? 'Add a team member to your recruitment team' : 'Update team member information'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowKAMFormModal(false)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors backdrop-blur-sm"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitKAMForm} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={kamFormData.name}
                      onChange={(e) => setKamFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition-all"
                      required
                      disabled={formSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={kamFormData.email}
                      onChange={(e) => setKamFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="name@company.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition-all"
                      required
                      disabled={formSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={kamFormData.phone}
                      onChange={(e) => setKamFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition-all"
                      required
                      disabled={formSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={kamFormData.role}
                      onChange={(e) => setKamFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                      disabled={formSubmitting}
                    >
                      <option value="KAM - Recruitment">KAM - Recruitment</option>
                      <option value="HR Executive">HR Executive</option>
                      <option value="Senior KAM">Senior KAM</option>
                      <option value="KAM Lead">KAM Lead</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowKAMFormModal(false)}
                    disabled={formSubmitting}
                    className="flex-1 px-5 py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formSubmitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>{kamFormMode === 'add' ? 'Add KAM' : 'Save Changes'}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecruitmentHeadDashboard;
