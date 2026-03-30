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
} from '../service/api';

// Lazy load Tab Components
const JobOpeningsTab = lazy(() => import('./Tabs/KAMRecruitment/JobOpeningsTab'));
const CandidatePipelineTab = lazy(() => import('./Tabs/KAMRecruitment/CandidatePipelineTab'));
const InterviewScheduleTab = lazy(() => import('./Tabs/KAMRecruitment/InterviewScheduleTab'));
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
    heading: 'MY WORK',
    items: [
      { id: 1, title: 'My Tasks', icon: FiCheckSquare },
      { id: 2, title: 'Daily Report', icon: FiClipboard },
      { id: 3, title: 'My Performance', icon: FiTrendingUp },
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
      { id: 7, title: 'Screening', icon: FiFileText },
      { id: 8, title: 'Offer Management', icon: FiAward },
    ],
  },
  {
    heading: 'RESOURCES',
    items: [
      { id: 9, title: 'Resume Bank', icon: FiDatabase },
      { id: 10, title: 'Activity Feed', icon: FiActivity },
    ],
  },
  {
    heading: 'PROFILE',
    items: [
      { id: 11, title: 'My Profile', icon: FiUsers },
    ],
  },
];

// My Performance Content
const MyPerformanceContent = ({ stats }) => {
  const targets = {
    hires: 5,
    interviews: 15,
    screening: 30,
    offers: 8,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Performance</h2>
        <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
        </select>
      </div>

      {/* Performance Overview */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Great Progress!</h3>
            <p className="text-emerald-100">You're on track to meet your monthly targets</p>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <FiStar className="w-8 h-8" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{stats.thisWeekHires || 2}</p>
            <p className="text-sm text-emerald-100">Hires This Month</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{stats.interviewsScheduled || 8}</p>
            <p className="text-sm text-emerald-100">Interviews Done</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{stats.candidatesPipeline || 25}</p>
            <p className="text-sm text-emerald-100">Candidates Screened</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{stats.offersExtended || 3}</p>
            <p className="text-sm text-emerald-100">Offers Extended</p>
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
              <span className="text-sm font-semibold text-gray-900">{stats.thisWeekHires || 2}/{targets.hires}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${((stats.thisWeekHires || 2) / targets.hires) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Interviews Scheduled</span>
              <span className="text-sm font-semibold text-gray-900">{stats.interviewsScheduled || 8}/{targets.interviews}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${((stats.interviewsScheduled || 8) / targets.interviews) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Candidates Screened</span>
              <span className="text-sm font-semibold text-gray-900">{stats.candidatesPipeline || 25}/{targets.screening}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${((stats.candidatesPipeline || 25) / targets.screening) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Offers Extended</span>
              <span className="text-sm font-semibold text-gray-900">{stats.offersExtended || 3}/{targets.offers}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${((stats.offersExtended || 3) / targets.offers) * 100}%` }}
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
            {[
              { day: 'Monday', hires: 0, interviews: 2, screenings: 5 },
              { day: 'Tuesday', hires: 1, interviews: 3, screenings: 4 },
              { day: 'Wednesday', hires: 0, interviews: 1, screenings: 6 },
              { day: 'Thursday', hires: 1, interviews: 2, screenings: 3 },
              { day: 'Friday', hires: 0, interviews: 0, screenings: 2 },
            ].map((day, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-gray-600">{day.day}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(day.hires / 2) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(day.interviews / 5) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(day.screenings / 10) * 100}%` }}
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
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Screening to Interview</p>
                <p className="text-2xl font-bold text-blue-600">32%</p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Interview to Offer</p>
                <p className="text-2xl font-bold text-emerald-600">38%</p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Offer to Join</p>
                <p className="text-2xl font-bold text-purple-600">67%</p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-purple-400" />
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
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'KAM', role: 'Key Account Manager' });
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    activePositions: 12,
    candidatesPipeline: 45,
    interviewsScheduled: 8,
    offersExtended: 3,
    thisWeekHires: 2,
  });
  const [todayTasks, setTodayTasks] = useState([
    { id: 1, title: 'Screen applications for Senior Developer', priority: 'High', status: 'pending', dueTime: '11:00 AM' },
    { id: 2, title: 'Interview with Rahul Kumar', priority: 'High', status: 'pending', dueTime: '02:00 PM' },
    { id: 3, title: 'Update candidate pipeline', priority: 'Medium', status: 'completed', dueTime: '04:00 PM' },
    { id: 4, title: 'Send interview feedback', priority: 'Medium', status: 'pending', dueTime: '05:00 PM' },
  ]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([
    { candidate: 'Rahul Kumar', position: 'Senior Developer', time: '02:00 PM', type: 'Technical' },
    { candidate: 'Priya Singh', position: 'HR Executive', time: '04:30 PM', type: 'HR Round' },
    { candidate: 'Amit Verma', position: 'Project Manager', time: 'Tomorrow 10:00 AM', type: 'Final' },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          name: decoded.name || userName || 'KAM',
          role: 'Key Account Manager - Recruitment'
        });
        fetchNotifications(decoded.id || decoded.userId);
        fetchDashboardData();
      } catch (e) {
        setUserInfo({
          name: userName || 'KAM',
          role: 'Key Account Manager - Recruitment'
        });
      }
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await getRecruitmentStats();
      if (statsRes.success) {
        // Use user-specific stats if available
        setStats((prev) => ({
          ...prev,
          activePositions: statsRes.data.positions?.open || prev.activePositions,
          candidatesPipeline: statsRes.data.candidates?.total || prev.candidatesPipeline,
        }));
      }
    } catch (e) {
      // Keep default stats
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

  const toggleTaskStatus = (taskId) => {
    setTodayTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
          : task
      )
    );
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
              return <MyPerformanceContent stats={stats} />;
            case 'Job Openings':
              return <JobOpeningsTab />;
            case 'Candidate Pipeline':
              return <CandidatePipelineTab />;
            case 'Interview Schedule':
              return <InterviewScheduleTab />;
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
                  <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                    <div className="relative z-10">
                      <h1 className="text-3xl lg:text-4xl font-bold">Good Morning, {userInfo.name.split(' ')[0]}! 🌟</h1>
                      <p className="mt-2 text-lg text-purple-100">
                        You have {todayTasks.filter((t) => t.status === 'pending').length} pending tasks today
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold flex items-center gap-2">
                          <FiCalendar className="w-4 h-4" />
                          {upcomingInterviews.length} Interviews Today
                        </span>
                        <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold flex items-center gap-2">
                          <FiCheckSquare className="w-4 h-4" />
                          {stats.candidatesPipeline} Candidates in Pipeline
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                      title="My Active Jobs"
                      value={stats.activePositions}
                      icon={FiBriefcase}
                      color="pink"
                    />
                    <StatCard
                      title="Candidates in Pipeline"
                      value={stats.candidatesPipeline}
                      icon={FiUsers}
                      color="purple"
                    />
                    <StatCard
                      title="Scheduled Interviews"
                      value={stats.interviewsScheduled}
                      icon={FiCalendar}
                      color="blue"
                    />
                    <StatCard
                      title="This Month's Hires"
                      value={stats.thisWeekHires}
                      icon={FiCheckCircle}
                      color="green"
                    />
                  </div>

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
                        {todayTasks.map((task) => (
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
                              task.priority === 'High' ? 'bg-red-100 text-red-700' :
                              task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        ))}
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
                        {upcomingInterviews.map((interview, idx) => (
                          <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                              {interview.candidate.split(' ').map((n) => n[0]).join('')}
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
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-5">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        onClick={() => setActiveTab('Job Openings')}
                        className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                      >
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                          <FiBriefcase className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">View Jobs</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('Candidate Pipeline')}
                        className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                      >
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                          <FiUserPlus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Add Candidate</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('Interview Schedule')}
                        className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all group"
                      >
                        <div className="p-3 rounded-xl bg-violet-100 text-violet-600 group-hover:scale-110 transition-transform">
                          <FiCalendar className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Schedule Interview</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('Daily Report')}
                        className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all group"
                      >
                        <div className="p-3 rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
                          <FiEdit3 className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Submit Report</span>
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
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default KAMMemberDashboard;
