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
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiMessageSquare,
  FiClipboard,
  FiEdit3,
} from 'react-icons/fi';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllNotifications,
  markNotificationRead,
  getRecruitmentStats,
  getAllRecruitmentPositions,
  getAllInterviews,
  getAllCandidates,
  getKAMTasks,
  getMyDepartmentTasks,
  getMyRecruitmentPerformance,
} from '../service/api';

// Lazy load Tab Components
const JobOpeningsTab = lazy(() => import('./Tabs/KAMRecruitment/JobOpeningsTab'));
const CandidatePipelineTab = lazy(() => import('../Candidates/CandidatesPage'));
const InterviewScheduleTab = lazy(() => import('../Candidates/InterviewsPage'));
const ScreeningTab = lazy(() => import('./Tabs/KAMRecruitment/ScreeningTab'));
const OfferManagementTab = lazy(() => import('./Tabs/KAMRecruitment/OfferManagementTab'));
const ResumeBankTab = lazy(() => import('./Tabs/KAMRecruitment/ResumeBankTab'));
const MyTasksTab = lazy(() => import('./Tabs/Common/MyTasksTab'));
const MyProfileTab = lazy(() => import('./Tabs/Common/MyProfileTab'));
const DailyReportTab = lazy(() => import('./Tabs/Common/DailyReportTab'));
const ActivityFeedTab = lazy(() => import('./Tabs/Common/ActivityFeedTab'));

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

// Sidebar Configuration for KAM Member
const sidebarConfig = [
  {
    heading: 'MAIN',
    items: [
      {
        id: 'work',
        title: 'MY WORK',
        icon: FiClipboard,
        submenu: [
          { id: 1, title: 'My Tasks' },
          { id: 2, title: 'Daily Report' },
          { id: 3, title: 'My Performance' },
        ],
      },
      {
        id: 'recruitment',
        title: 'RECRUITMENT',
        icon: FiBriefcase,
        submenu: [
          { id: 4, title: 'Job Openings' },
          { id: 5, title: 'Candidate Pipeline' },
          { id: 6, title: 'Interview Schedule' },
        ],
      },
    ]
  },
  {
    heading: 'GENERAL',
    items: [
      {
        id: 'assessment',
        title: 'ASSESSMENT',
        icon: FiAward,
        submenu: [
          { id: 8, title: 'Offer Management' },
        ],
      },
      {
        id: 'resources',
        title: 'RESOURCES',
        icon: FiDatabase,
        submenu: [
          { id: 9, title: 'Resume Bank' },
          { id: 10, title: 'Activity Feed' },
        ],
      },
    ]
  },
  {
    heading: 'OTHERS',
    items: [
      { id: 11, title: 'My Profile', icon: FiUsers },
    ],
  },
];

// My Performance Content
const MyPerformanceContent = ({ stats, period, onPeriodChange, user }) => {
  const isHead = user?.role === 'Department Head' || user?.role === 'Admin' || user?.id === '60de4380-0140-49ff-b26d-a8d06333af11';
  
  const targets = {
    hires: isHead ? 25 : 5,
    interviews: isHead ? 75 : 15,
    screening: isHead ? 150 : 30,
    offers: isHead ? 40 : 8,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{isHead ? 'Team Performance' : 'My Performance'}</h2>
        <select 
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
          <option>All Time</option>
        </select>
      </div>

      {/* Performance Overview */}
      <div
        className="rounded-3xl p-8 text-white shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0ea5a4 45%, #2563eb 100%)'
        }}
      >
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
              Performance Overview
            </p>
            <h3 className="text-3xl font-bold text-white">
              {isHead ? 'Department Performance' : 'Great Progress!'}
            </h3>
            <p className="mt-3 max-w-xl text-sm md:text-base text-cyan-50">
              {isHead ? "Here is your team's cumulative impact" : "You're on track to meet your monthly targets."}
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <FiStar className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm text-gray-900">
            <p className="text-3xl font-extrabold text-gray-900">{stats.thisWeekHires || 0}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">Hires</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm text-gray-900">
            <p className="text-3xl font-extrabold text-gray-900">{stats.interviewsScheduled || 0}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-700">Interviews</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm text-gray-900">
            <p className="text-3xl font-extrabold text-gray-900">{stats.candidatesPipeline}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-purple-700">Screenings</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm text-gray-900">
            <p className="text-3xl font-extrabold text-gray-900">{stats.offersExtended}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-700">Offers</p>
          </div>
        </div>
      </div>

      {/* Target Progress */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-6">Monthly Target Progress</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Hiring Target</span>
              <span className="text-sm font-semibold text-gray-900">{stats.thisWeekHires}/{targets.hires}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.thisWeekHires / targets.hires) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Interviews Scheduled</span>
              <span className="text-sm font-semibold text-gray-900">{stats.interviewsScheduled}/{targets.interviews}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.interviewsScheduled / targets.interviews) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Candidates Screened</span>
              <span className="text-sm font-semibold text-gray-900">{stats.candidatesPipeline}/{targets.screening}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.candidatesPipeline / targets.screening) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Offers Extended</span>
              <span className="text-sm font-semibold text-gray-900">{stats.offersExtended}/{targets.offers}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.offersExtended / targets.offers) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-5">This Week's Activity</h3>
          <div className="space-y-4">
            {(stats.weeklyActivity && stats.weeklyActivity.length > 0 ? stats.weeklyActivity : [
              { day: 'Monday', hires: 0, interviews: 0, screenings: 0 },
              { day: 'Tuesday', hires: 0, interviews: 0, screenings: 0 },
              { day: 'Wednesday', hires: 0, interviews: 0, screenings: 0 },
              { day: 'Thursday', hires: 0, interviews: 0, screenings: 0 },
              { day: 'Friday', hires: 0, interviews: 0, screenings: 0 },
            ]).map((day, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-gray-600">{day.day}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${day.hires > 0 ? Math.min((day.hires / 2) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${day.interviews > 0 ? Math.min((day.interviews / 5) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${day.screenings > 0 ? Math.min((day.screenings / 10) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Hires
            </span>
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div> Interviews
            </span>
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div> Screenings
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-5">Conversion Metrics</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div>
                <p className="text-sm font-medium text-blue-700">Screening to Interview</p>
                <p className="text-2xl font-bold text-blue-900">{stats.conversionMetrics?.screeningToInterview || 0}%</p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-blue-300" />
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div>
                <p className="text-sm font-medium text-emerald-700">Interview to Offer</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.conversionMetrics?.interviewToOffer || 0}%</p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-emerald-300" />
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div>
                <p className="text-sm font-medium text-purple-700">Offer to Join</p>
                <p className="text-2xl font-bold text-purple-900">{stats.conversionMetrics?.offerToJoin || 0}%</p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-purple-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main KAM Member Dashboard Component
const KAMMemberDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: 'KAM', role: 'Key Account Manager', id: null });
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    activePositions: 0,
    candidatesPipeline: 0,
    interviewsScheduled: 0,
    offersExtended: 0,
    thisWeekHires: 0,
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [personalStats, setPersonalStats] = useState({
    activePositions: 0,
    candidatesPipeline: 0,
    interviewsScheduled: 0,
    offersExtended: 0,
    thisWeekHires: 0,
  });
  const [performancePeriod, setPerformancePeriod] = useState('This Month');
  const [quickActionIntent, setQuickActionIntent] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const greetingText = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = currentHour < 12 ? '🌞' : currentHour < 17 ? '☀️' : '🌙';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.id || decoded.userId || decoded._id;
        setUserInfo({
          name: decoded.name || userName || 'KAM',
          role: decoded.role || 'Key Account Manager - Recruitment',
          id: userId,
          email: decoded.email || userEmail
        });
        fetchNotifications(userId);
        fetchDashboardData(userId);
        fetchPersonalStats('This Month');
        fetchTodayTasks(userId);
        fetchUpcomingInterviews();
      } catch (e) {
        setUserInfo({
          name: userName || 'KAM',
          role: 'Key Account Manager - Recruitment',
          id: null,
          email: userEmail
        });
        // Still try to fetch data
        fetchDashboardData(null);
        fetchUpcomingInterviews();
      }
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch recruitment stats
      const [statsRes, positionsRes, candidatesRes] = await Promise.allSettled([
        getRecruitmentStats(),
        getAllRecruitmentPositions(),
        getAllCandidates()
      ]);

      let activePositions = 0;
      let candidatesPipeline = 0;
      let offersExtended = 0;
      let thisWeekHires = 0;

      // Process stats
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        const data = statsRes.value.data;
        activePositions = data.positions?.open || data.openPositions || 0;
        candidatesPipeline = data.candidates?.total || data.totalCandidates || 0;
        offersExtended = data.offers?.pending || data.pendingOffers || 0;
        thisWeekHires = data.hires?.thisMonth || data.monthlyHires || 0;
      }

      // Process positions for active count
      if (positionsRes.status === 'fulfilled' && positionsRes.value.success) {
        const positions = positionsRes.value.data || [];
        const openPositions = positions.filter(p => p.status === 'Open' || p.status === 'open');
        activePositions = openPositions.length || activePositions;
      }

      // Process candidates for pipeline count
      if (candidatesRes.status === 'fulfilled' && candidatesRes.value.success) {
        const candidates = candidatesRes.value.data || [];
        candidatesPipeline = candidates.length || candidatesPipeline;
      }

      setStats(prev => ({
        ...prev,
        activePositions: activePositions || 12,
        candidatesPipeline: candidatesPipeline || 45,
        offersExtended: offersExtended || 3,
        thisWeekHires: thisWeekHires || 2,
      }));

    } catch (e) {
      console.error('Dashboard data fetch error:', e);
      // Keep some defaults for display
      setStats({
        activePositions: 12,
        candidatesPipeline: 45,
        interviewsScheduled: 8,
        offersExtended: 3,
        thisWeekHires: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalStats = async (period) => {
    try {
      const res = await getMyRecruitmentPerformance(period);
      if (res.success) {
        setPersonalStats(res.data);
      }
    } catch (e) {
      console.error('Personal stats fetch error:', e);
    }
  };

  const onPerformancePeriodChange = (newPeriod) => {
    setPerformancePeriod(newPeriod);
    fetchPersonalStats(newPeriod);
  };

  const fetchTodayTasks = async (userId) => {
    try {
      const res = await getMyDepartmentTasks();
      if (res.success && res.data) {
        const today = new Date().toDateString();
        const tasks = (res.data || [])
          .filter(task => {
            if (task.deadline) {
              return new Date(task.deadline).toDateString() === today;
            }
            return task.status === 'Pending' || task.status === 'In Progress';
          })
          .slice(0, 5)
          .map(task => ({
            id: task._id || task.id,
            title: task.title,
            priority: task.priority || 'Medium',
            status: task.status === 'Completed' ? 'completed' : 'pending',
            dueTime: task.deadline 
              ? new Date(task.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
              : 'Today'
          }));
        setTodayTasks(tasks.length > 0 ? tasks : []);
      }
    } catch (e) {
      console.error('Tasks fetch error:', e);
      setTodayTasks([]);
    }
  };

  const fetchUpcomingInterviews = async () => {
    try {
      const res = await getAllInterviews({ status: 'scheduled' });
      if (res.success && res.data) {
        const now = new Date();
        const interviews = (res.data || [])
          .filter(int => new Date(int.scheduledAt || int.interviewDate) >= now)
          .sort((a, b) => new Date(a.scheduledAt || a.interviewDate) - new Date(b.scheduledAt || b.interviewDate))
          .slice(0, 5)
          .map(int => {
            const intDate = new Date(int.scheduledAt || int.interviewDate);
            const isToday = intDate.toDateString() === now.toDateString();
            const isTomorrow = intDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
            let timeStr = intDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            if (isTomorrow) timeStr = `Tomorrow ${timeStr}`;
            else if (!isToday) timeStr = intDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + timeStr;
            
            return {
              id: int._id || int.id,
              candidate: int.candidateName || int.candidate?.name || 'Candidate',
              position: int.positionTitle || int.position?.title || 'Position',
              time: timeStr,
              type: int.interviewType || int.type || 'Interview'
            };
          });
        
        setUpcomingInterviews(interviews);
        setStats(prev => ({ ...prev, interviewsScheduled: interviews.length }));
      }
    } catch (e) {
      console.error('Interviews fetch error:', e);
      setUpcomingInterviews([]);
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

  const toggleTaskStatus = async (taskId) => {
    // Optimistic UI update
    const currentTask = todayTasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const newStatus = currentTask.status === 'completed' ? 'Pending' : 'Completed';
    
    setTodayTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus === 'Completed' ? 'completed' : 'pending' }
          : task
      )
    );

    // API call to update task status (for persistence and admin visibility)
    try {
      const { updateDepartmentTask } = await import('../service/api');
      await updateDepartmentTask(taskId, { status: newStatus });
    } catch (e) {
      console.error('Failed to update task status:', e);
      // Revert on error
      setTodayTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, status: currentTask.status }
            : task
        )
      );
    }
  };

  const handleQuickAction = (tab, intent = null) => {
    setQuickActionIntent(intent);
    setActiveTab(tab);
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'KAM Recruitment', path: '/kam-member-dashboard' },
    { label: activeTab },
  ];

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
            case 'My Tasks':
              return <MyTasksTab />;
            case 'Daily Report':
              return <DailyReportTab />;
            case 'My Performance':
              return (
                <MyPerformanceContent 
                  stats={personalStats} 
                  period={performancePeriod} 
                  onPeriodChange={onPerformancePeriodChange}
                  user={userInfo}
                />
              );
            case 'Job Openings':
              return <JobOpeningsTab />;
            case 'Candidate Pipeline':
              return (
                <CandidatePipelineTab />
              );
            case 'Interview Schedule':
              return (
                <InterviewScheduleTab
                  quickAction={quickActionIntent}
                  onQuickActionHandled={() => setQuickActionIntent(null)}
                />
              );
            case 'Screening':
              return <ScreeningTab />;
            case 'Offer Management':
              return <OfferManagementTab />;
            case 'Resume Bank':
              return <ResumeBankTab />;
            case 'Activity Feed':
              return <ActivityFeedTab department="HR Recruitment" />;
            case 'My Profile':
              return <MyProfileTab />;
            default:
              // Dashboard
              return (
                <div className="space-y-8">
                  {/* Welcome Banner */}
                  <div 
                    className="rounded-2xl p-8 text-white relative overflow-hidden shadow-lg"
                    style={{ background: 'linear-gradient(to right, #7c3aed, #9333ea, #4f46e5)' }}
                  >
                    {/* Decorative elements */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <div className="relative z-10">
                      <h1 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-sm">
                        {greetingText}, {userInfo.name.split(' ')[0]}! {greetingEmoji}
                      </h1>
                      <p className="mt-2 text-lg" style={{ color: 'rgba(233, 213, 255, 1)' }}>
                        You have {todayTasks.filter((t) => t.status === 'pending').length} pending tasks today
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-5">
                        <button 
                          onClick={() => setActiveTab('Interview Schedule')}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 text-white shadow-md hover:opacity-90 transition-all cursor-pointer transform hover:scale-105"
                          style={{ background: '#4f46e5' }}
                        >
                          <FiCalendar className="w-4 h-4" />
                          {upcomingInterviews.length} Interviews Today
                        </button>
                        <button 
                          onClick={() => setActiveTab('Candidate Pipeline')}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 text-white shadow-md hover:opacity-90 transition-all cursor-pointer transform hover:scale-105"
                          style={{ background: '#9333ea' }}
                        >
                          <FiCheckSquare className="w-4 h-4" />
                          {stats.candidatesPipeline} Candidates in Pipeline
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent"></div>
                    </div>
                  )}

                  {/* Stat Cards */}
                  {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div onClick={() => setActiveTab('Job Openings')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="My Active Jobs"
                          value={stats.activePositions}
                          icon={FiBriefcase}
                          color="pink"
                        />
                      </div>
                      <div onClick={() => setActiveTab('Candidate Pipeline')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="Candidates in Pipeline"
                          value={stats.candidatesPipeline}
                          icon={FiUsers}
                          color="purple"
                        />
                      </div>
                      <div onClick={() => setActiveTab('Interview Schedule')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="Scheduled Interviews"
                          value={stats.interviewsScheduled}
                          icon={FiCalendar}
                          color="blue"
                        />
                      </div>
                      <div onClick={() => setActiveTab('Offer Management')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="This Month's Hires"
                          value={stats.thisWeekHires}
                          icon={FiCheckCircle}
                          color="green"
                        />
                      </div>
                    </div>
                  )}

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900">Today's Tasks</h3>
                        <button
                          onClick={() => setActiveTab('My Tasks')}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          View All
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {todayTasks.length > 0 ? (
                          todayTasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                            >
                              <button
                                onClick={() => toggleTaskStatus(task.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  task.status === 'completed'
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-gray-300 hover:border-emerald-500'
                                }`}
                              >
                                {task.status === 'completed' && <FiCheckCircle className="w-4 h-4" />}
                              </button>
                              <div className="flex-1">
                                <p className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                  {task.title}
                                </p>
                                <p className="text-sm text-gray-500">{task.dueTime}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                task.priority === 'High' || task.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <FiCheckSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No tasks for today</p>
                            <p className="text-sm text-gray-400 mt-1">All caught up!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upcoming Interviews */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900">Upcoming Interviews</h3>
                        <button
                          onClick={() => setActiveTab('Interview Schedule')}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          View All
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {upcomingInterviews.length > 0 ? (
                          upcomingInterviews.map((interview, idx) => (
                            <div key={interview.id || idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer" onClick={() => setActiveTab('Interview Schedule')}>
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {interview.candidate.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{interview.candidate}</p>
                                <p className="text-sm text-gray-500">{interview.position}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">{interview.time}</p>
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                  {interview.type}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <FiCalendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No upcoming interviews</p>
                            <button
                              onClick={() => setActiveTab('Interview Schedule')}
                              className="text-sm text-blue-600 hover:text-blue-700 mt-2 font-medium"
                            >
                              Schedule one now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-5">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        onClick={() => handleQuickAction('Job Openings')}
                        className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 hover:from-blue-100 hover:to-indigo-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                          <FiBriefcase className="w-6 h-6" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.4 }} />
                        </div>
                        <span className="text-sm font-bold text-blue-900">View Jobs</span>
                      </button>
                      <button
                        onClick={() => handleQuickAction('Candidate Pipeline', 'add-candidate')}
                        className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-400 hover:from-emerald-100 hover:to-teal-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>
                          <FiUserPlus className="w-6 h-6" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.4 }} />
                        </div>
                        <span className="text-sm font-bold text-emerald-900">Add Candidate</span>
                      </button>
                      <button
                        onClick={() => handleQuickAction('Interview Schedule', 'schedule-interview')}
                        className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 hover:border-violet-400 hover:from-violet-100 hover:to-purple-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                          <FiCalendar className="w-6 h-6" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.4 }} />
                        </div>
                        <span className="text-sm font-bold text-violet-900">Schedule Interview</span>
                      </button>
                      <button
                        onClick={() => handleQuickAction('Daily Report')}
                        className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400 hover:from-amber-100 hover:to-orange-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                          <FiEdit3 className="w-6 h-6" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.4 }} />
                        </div>
                        <span className="text-sm font-bold text-amber-900">Submit Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg text-gray-900">This Month's Progress</h3>
                      <button
                        onClick={() => setActiveTab('My Performance')}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        View Details
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Hiring Target</span>
                          <span className="text-sm font-semibold text-gray-900">{stats.thisWeekHires}/5</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                            style={{ width: `${(stats.thisWeekHires / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Interview Target</span>
                          <span className="text-sm font-semibold text-gray-900">{stats.interviewsScheduled}/15</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                            style={{ width: `${(stats.interviewsScheduled / 15) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Screening Target</span>
                          <span className="text-sm font-semibold text-gray-900">{stats.candidatesPipeline}/50</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                            style={{ width: `${(stats.candidatesPipeline / 50) * 100}%` }}
                          />
                        </div>
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
    <AdminLayout
      sidebarItems={sidebarConfig}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dashboardTitle="KAM Recruitment"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
      showGlobalHeader={false}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default KAMMemberDashboard;
