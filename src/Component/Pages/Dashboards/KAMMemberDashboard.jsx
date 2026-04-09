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
    items: [
      { id: 1, title: 'My Tasks', icon: FiCheckSquare },
      { id: 2, title: 'Daily Report', icon: FiFileText },
      { id: 4, title: 'Job Openings', icon: FiBriefcase },
      { id: 5, title: 'Candidate Pipeline', icon: FiUserPlus },
      { id: 6, title: 'Interview Schedule', icon: FiCalendar },
      { id: 8, title: 'Offer Management', icon: FiAward },
      { id: 9, title: 'Resume Bank', icon: FiDatabase },
      { id: 10, title: 'Activity Feed', icon: FiActivity },
      { id: 11, title: 'My Profile', icon: FiUsers },
    ],
  },
];


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

  const formattedHeaderDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(currentTime);

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
                  {/* Modern Header Section */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-jakarta">
                        Welcome {userInfo.name.split(' ')[0]}
                      </h1>
                      <p className="text-slate-500 font-medium mt-1">
                        Today is {formattedHeaderDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('Interview Schedule')}
                        className="flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                      >
                        <FiCalendar className="w-4 h-4 text-white/90" />
                        <span>{upcomingInterviews.length} Interviews Today</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('Candidate Pipeline')}
                        className="flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                      >
                        <FiUserPlus className="w-4 h-4 text-white/90" />
                        <span>{stats.candidatesPipeline} Candidates in Pipeline</span>
                      </button>
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
                          color="white"
                        />
                      </div>
                      <div onClick={() => setActiveTab('Candidate Pipeline')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="Candidates in Pipeline"
                          value={stats.candidatesPipeline}
                          icon={FiUsers}
                          color="white"
                        />
                      </div>
                      <div onClick={() => setActiveTab('Interview Schedule')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="Scheduled Interviews"
                          value={stats.interviewsScheduled}
                          icon={FiCalendar}
                          color="white"
                        />
                      </div>
                      <div onClick={() => setActiveTab('Offer Management')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="This Month's Hires"
                          value={stats.thisWeekHires}
                          icon={FiCheckCircle}
                          color="white"
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
                  <div className="bg-white rounded-[32px] shadow-sm p-8 border border-[#F4F3EF]">
                    <div className="flex flex-col items-start mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-[#1B4DA0]">
                          <FiActivity size={18} />
                        </div>
                        <h3 className="font-bold text-[#1A1A2E] text-lg tracking-tight">Quick Actions</h3>
                      </div>
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.15em] ml-1">COMMON RECRUITMENT TASKS</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* View Jobs */}
                      <button
                        onClick={() => handleQuickAction('Job Openings')}
                        className="flex items-center gap-4 p-4 rounded-3xl border border-[#F4F3EF] bg-white hover:border-[#1B4DA0] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group text-left"
                      >
                        <div className="w-12 h-12 flex-shrink-0 rounded-2xl border border-[#F4F3EF] bg-white flex items-center justify-center text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors shadow-sm">
                          <FiBriefcase className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-wider">Job Openings</span>
                          <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-tight mt-0.5">{stats.activePositions} Open Positions</span>
                        </div>
                      </button>

                      {/* Add Candidate */}
                      <button
                        onClick={() => handleQuickAction('Candidate Pipeline', 'add-candidate')}
                        className="flex items-center gap-4 p-4 rounded-3xl border border-[#F4F3EF] bg-white hover:border-[#1B4DA0] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group text-left"
                      >
                        <div className="w-12 h-12 flex-shrink-0 rounded-2xl border border-[#F4F3EF] bg-white flex items-center justify-center text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors shadow-sm">
                          <FiUserPlus className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-wider">Candidate Pipeline</span>
                          <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-tight mt-0.5">{stats.candidatesPipeline} Total</span>
                        </div>
                      </button>

                      {/* Schedule Interview */}
                      <button
                        onClick={() => handleQuickAction('Interview Schedule', 'schedule-interview')}
                        className="flex items-center gap-4 p-4 rounded-3xl border border-[#F4F3EF] bg-white hover:border-[#1B4DA0] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group text-left"
                      >
                        <div className="w-12 h-12 flex-shrink-0 rounded-2xl border border-[#F4F3EF] bg-white flex items-center justify-center text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors shadow-sm">
                          <FiCalendar className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-wider">Interviews</span>
                          <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-tight mt-0.5">{stats.interviewsScheduled} Scheduled Today</span>
                        </div>
                      </button>

                      {/* Submit Report */}
                      <button
                        onClick={() => handleQuickAction('Daily Report')}
                        className="flex items-center gap-4 p-4 rounded-3xl border border-[#F4F3EF] bg-white hover:border-[#1B4DA0] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group text-left"
                      >
                        <div className="w-12 h-12 flex-shrink-0 rounded-2xl border border-[#F4F3EF] bg-white flex items-center justify-center text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors shadow-sm">
                          <FiEdit3 className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-wider">Daily Report</span>
                          <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-tight mt-0.5">Submit MIS</span>
                        </div>
                      </button>
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
