import { useState, useEffect, Suspense, lazy } from 'react';
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
  FiRefreshCw,
  FiX,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
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

// Color assignment for team members
const AVATAR_COLORS = [
  'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500',
  'from-amber-500 to-orange-500',
];

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
    },
    recentActivity: member.recentActivity || [
      { action: 'No recent activity', candidate: '', time: 'N/A' }
    ],
  }));
};

// Sidebar Configuration for Recruitment Head
const sidebarConfig = [
  {
    heading: 'MY TEAM',
    items: [
      { id: 1, title: 'Team Overview', icon: FiUsers },
      { id: 2, title: 'KAM Performance', icon: FiTrendingUp },
      { id: 3, title: 'Task Assignment', icon: FiCheckSquare },
    ],
  },
  {
    heading: 'RECRUITMENT',
    items: [
      { id: 4, title: 'Job Openings', icon: FiBriefcase },
      { id: 5, title: 'Candidate Pipeline', icon: FiUsers },
      { id: 6, title: 'Interview Schedule', icon: FiCalendar },
    ],
  },
  {
    heading: 'ASSESSMENT',
    items: [
      { id: 7, title: 'Screening & Assessment', icon: FiFileText },
      { id: 8, title: 'Offer Management', icon: FiAward },
    ],
  },
  {
    heading: 'ANALYTICS',
    items: [
      { id: 9, title: 'Recruitment Analytics', icon: FiBarChart2 },
      { id: 10, title: 'Resume Bank', icon: FiDatabase },
    ],
  },
  {
    heading: 'ACTIVITY',
    items: [
      { id: 11, title: 'Activity Feed', icon: FiActivity },
    ],
  },
];

// KAM Card Component
const KAMCard = ({ kam, onViewDetails, onAssignTask, onMessage }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Header with gradient */}
      <div className={`h-24 bg-gradient-to-r ${kam.color} relative`}>
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 border-4 border-white">
            {kam.avatar}
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            kam.status === 'Active' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'
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
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
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
                    onClick={() => { onViewDetails(kam); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FiEye className="w-4 h-4" /> View Details
                  </button>
                  <button
                    onClick={() => { onAssignTask(kam); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FiCheckSquare className="w-4 h-4" /> Assign Task
                  </button>
                  <button
                    onClick={() => { onMessage(kam); setShowMenu(false); }}
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
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
          <span className="flex items-center gap-1">
            <FiMail className="w-4 h-4" />
            {kam.email.split('@')[0]}
          </span>
          <span className="flex items-center gap-1">
            <FiPhone className="w-4 h-4" />
            {kam.phone.slice(-5)}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{kam.stats.activePositions}</p>
            <p className="text-xs text-gray-600">Active Jobs</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{kam.stats.candidatesPipeline}</p>
            <p className="text-xs text-gray-600">Candidates</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{kam.stats.interviewsScheduled}</p>
            <p className="text-xs text-gray-600">Interviews</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{kam.stats.thisWeekHires}</p>
            <p className="text-xs text-gray-600">This Week Hires</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {kam.recentActivity.slice(0, 2).map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-700 truncate flex-1">
                  {activity.action}: {activity.candidate || activity.position}
                </span>
                <span className="text-gray-400 text-xs whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Team Overview Tab Content
const TeamOverviewContent = ({ teamData, loading, onViewKAM, onAssignTask, onMessage, onRefresh, onAddKAM, globalStats }) => {
  const teamAggregatedStats = teamData.reduce(
    (acc, kam) => ({
      activePositions: acc.activePositions + (kam.stats?.activePositions || 0),
      candidatesPipeline: acc.candidatesPipeline + (kam.stats?.candidatesPipeline || 0),
      interviewsScheduled: acc.interviewsScheduled + (kam.stats?.interviewsScheduled || 0),
      offersExtended: acc.offersExtended + (kam.stats?.offersExtended || 0),
      thisWeekHires: acc.thisWeekHires + (kam.stats?.thisWeekHires || 0),
    }),
    { activePositions: 0, candidatesPipeline: 0, interviewsScheduled: 0, offersExtended: 0, thisWeekHires: 0 }
  );

  // Use global stats if available, otherwise fallback to team aggregation
  const displayStats = {
    activePositions: globalStats?.activePositions || teamAggregatedStats.activePositions,
    candidatesPipeline: globalStats?.totalCandidates || teamAggregatedStats.candidatesPipeline,
    interviewsScheduled: globalStats?.scheduledInterviews || teamAggregatedStats.interviewsScheduled,
    offersExtended: globalStats?.pendingOffers || teamAggregatedStats.offersExtended,
    thisWeekHires: globalStats?.thisWeekHires || teamAggregatedStats.thisWeekHires,
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
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            {teamData.map((kam) => (
              <KAMCard
                key={kam.id}
                kam={kam}
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
const KAMPerformanceContent = ({ teamData, loading }) => {
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
        <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
        </select>
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
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${kam.color} flex items-center justify-center text-white text-xl font-bold`}>
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
                    className={`h-full bg-gradient-to-r ${kam.color} rounded-full`}
                    style={{ width: `${Math.min((kam.stats.thisWeekHires / 5) * 100, 100)}%` }}
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
                    style={{ width: `${kam.stats.interviewsScheduled > 0 
                      ? (kam.stats.offersExtended / kam.stats.interviewsScheduled) * 100 
                      : 0}%` }}
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
                    style={{ width: `${kam.stats.candidatesPipeline > 0
                      ? (kam.stats.interviewsScheduled / kam.stats.candidatesPipeline) * 100
                      : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{kam.stats.offersExtended}</p>
                <p className="text-xs text-gray-500">Offers Sent</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{kam.stats.thisWeekHires}</p>
                <p className="text-xs text-gray-500">Hired</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">Team Leaderboard - This Month</h3>
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
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${kam.color} flex items-center justify-center text-white font-bold`}>
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
  const [showKAMFormModal, setShowKAMFormModal] = useState(false);
  const [kamFormMode, setKamFormMode] = useState('add'); // 'add' or 'edit'
  const [kamFormData, setKamFormData] = useState({ name: '', email: '', phone: '', role: 'KAM - Recruitment' });
  const [kamTeam, setKamTeam] = useState([]);
  const [stats, setStats] = useState({
    activePositions: 0,
    totalCandidates: 0,
    scheduledInterviews: 0,
    pendingOffers: 0,
  });
  const [statsBarData, setStatsBarData] = useState([]);

  // Fetch KAM Team data from API
  const fetchKAMTeam = async () => {
    try {
      setTeamLoading(true);
      const response = await getAllKAMMembers();
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
      } catch (e) {
        console.log('Token decode error');
        setUserInfo({ name: localStorage.getItem('userName') || 'Sachin', role: 'Recruitment Head' });
        fetchKAMTeam();
      }
    } else {
      fetchKAMTeam();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await getRecruitmentStats();
      if (statsRes.success) {
        const s = statsRes.data;
        setStats({
          activePositions: s.positions?.open || 30,
          totalCandidates: s.candidates?.total || 115,
          scheduledInterviews: s.candidates?.shortlisted || 19,
          pendingOffers: s.funnel?.offerSent || 9,
        });

        const total = s.candidates?.total || 115;
        const barData = [
          { label: 'New Applications', value: total, percentage: '100%', color: 'bg-blue-500' },
          { label: 'Screening', value: s.funnel?.screening || 45, percentage: '39%', color: 'bg-yellow-500' },
          { label: 'Interviewed', value: 25, percentage: '22%', color: 'bg-purple-500' },
          { label: 'Selected', value: s.candidates?.selected || 12, percentage: '10%', color: 'bg-green-500' },
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
        }),
        { activePositions: 0, totalCandidates: 0, scheduledInterviews: 0, pendingOffers: 0, thisWeekHires: 0 }
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
    setSelectedKAM(kam);
    setShowKAMModal(true);
  };

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
      alert(`${kam.name} has been removed from the team.`);
    } catch (error) {
      alert(error.message || 'Failed to delete KAM member');
    }
  };

  // Submit KAM form (add/edit)
  const handleSubmitKAMForm = async (e) => {
    e.preventDefault();
    
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
          alert(`${kamFormData.name} has been added to the team!`);
        }
      } else {
        const response = await updateKAMMember(kamFormData.id, kamFormData);
        if (response.success || response.data) {
          setKamTeam(prev => prev.map(k => 
            k.id === kamFormData.id 
              ? { ...k, name: kamFormData.name, email: kamFormData.email, phone: kamFormData.phone, role: kamFormData.role }
              : k
          ));
          alert(`${kamFormData.name}'s details have been updated!`);
        }
      }
      setShowKAMFormModal(false);
      fetchKAMTeam(); // Refresh the list
    } catch (error) {
      console.error(`Error in ${kamFormMode} KAM:`, error);
      const errorMessage = error.error || error.message || `Failed to ${kamFormMode} KAM member`;
      const details = error.details ? `\nDetails: ${error.details.join(', ')}` : '';
      alert(`${errorMessage}${details}`);
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
                />
              );
            case 'KAM Performance':
              return <KAMPerformanceContent teamData={kamTeam} loading={teamLoading} />;
            case 'Task Assignment':
              return <TaskAssignmentTab department="HR Recruitment" />;
            case 'Job Openings':
              return <JobOpeningsTab />;
            case 'Candidate Pipeline':
              return <CandidatePipelineTab />;
            case 'Interview Schedule':
              return <InterviewScheduleTab />;
            case 'Screening & Assessment':
              return <ScreeningTab />;
            case 'Offer Management':
              return <OfferManagementTab />;
            case 'Recruitment Analytics':
              return <RecruitmentAnalyticsTab />;
            case 'Resume Bank':
              return <ResumeBankTab />;
            case 'Activity Feed':
              return <ActivityFeedTab department="HR Recruitment" />;
            default:
              // Dashboard
              return (
                <div className="space-y-8">
                  {/* Welcome Banner */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl lg:text-4xl font-bold">Welcome back, {userInfo.name} 👋</h1>
                        <p className="mt-2 text-lg text-blue-100">
                          Recruitment Head Dashboard - Managing {kamTeam.length} KAMs
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                          <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold">
                            {stats.activePositions} Active Positions
                          </span>
                          <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold">
                            {stats.totalCandidates} Total Candidates
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('Team Overview')}
                        className="flex items-center gap-3 px-5 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition-all duration-200"
                      >
                        <FiUsers className="w-5 h-5" />
                        <span className="font-semibold text-base">View Team</span>
                      </button>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                      title="Active Positions"
                      value={stats.activePositions}
                      icon={FiBriefcase}
                      color="pink"
                    />
                    <StatCard
                      title="Total Candidates"
                      value={stats.totalCandidates}
                      icon={FiUsers}
                      color="purple"
                    />
                    <StatCard
                      title="Scheduled Interviews"
                      value={stats.scheduledInterviews}
                      icon={FiCalendar}
                      color="blue"
                    />
                    <StatCard
                      title="Pending Offers"
                      value={stats.pendingOffers}
                      icon={FiAward}
                      color="yellow"
                    />
                  </div>

                  {/* Stats Bar */}
                  <StatsBar stats={statsBarData} />

                  {/* Team Quick View */}
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-gray-900">My KAM Team</h3>
                      <button
                        onClick={() => setActiveTab('Team Overview')}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        View All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                      {kamTeam.map((kam) => (
                        <div
                          key={kam.id}
                          className="p-5 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleViewKAM(kam)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${kam.color} flex items-center justify-center text-white font-bold`}>
                              {kam.avatar}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{kam.name}</h4>
                              <p className="text-sm text-gray-500">{kam.stats.activePositions} jobs · {kam.stats.candidatesPipeline} candidates</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-emerald-600">{kam.stats.thisWeekHires}</p>
                              <p className="text-xs text-gray-500">Hires</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-5">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setActiveTab('Job Openings')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <FiBriefcase className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">View Jobs</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Candidate Pipeline')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left"
                        >
                          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                            <FiUserPlus className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Pipeline</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Task Assignment')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-left"
                        >
                          <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
                            <FiCheckSquare className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Assign Tasks</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Recruitment Analytics')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left"
                        >
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                            <FiBarChart2 className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Analytics</span>
                        </button>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-gray-900">Recent Team Activity</h3>
                      </div>
                      <div className="divide-y divide-gray-50 max-h-[280px] overflow-y-auto">
                        {kamTeam.flatMap((kam) =>
                          kam.recentActivity.slice(0, 1).map((activity, idx) => ({
                            ...activity,
                            kamName: kam.name,
                            avatar: kam.avatar,
                            color: kam.color,
                          }))
                        ).map((activity, idx) => (
                          <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${activity.color} flex items-center justify-center text-white font-semibold text-sm`}>
                              {activity.avatar}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                <span className="font-semibold">{activity.kamName}</span>{' '}
                                {activity.action}: {activity.candidate || activity.position}
                              </p>
                              <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
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
              <div className={`h-32 bg-gradient-to-r ${selectedKAM.color} relative`}>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                </div>

                {/* Recent Activity */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {selectedKAM.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.action}: {activity.candidate || activity.position}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {kamFormMode === 'add' ? 'Add New KAM' : 'Edit KAM Details'}
                  </h2>
                  <button
                    onClick={() => setShowKAMFormModal(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  {kamFormMode === 'add' ? 'Add a new team member to your recruitment team' : 'Update team member information'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitKAMForm} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={kamFormData.name}
                    onChange={(e) => setKamFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={kamFormData.email}
                    onChange={(e) => setKamFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={kamFormData.phone}
                    onChange={(e) => setKamFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={kamFormData.role}
                    onChange={(e) => setKamFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="KAM - Recruitment">KAM - Recruitment</option>
                    <option value="Senior KAM">Senior KAM</option>
                    <option value="KAM Lead">KAM Lead</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowKAMFormModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    {kamFormMode === 'add' ? 'Add KAM' : 'Save Changes'}
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
