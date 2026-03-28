import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAccessTo } from '../DepartmentProtectedRoute';
import {
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiAward,
  FiBarChart2,
  FiTarget,
  FiTrendingUp,
  FiUserPlus,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiCheckSquare,
  FiDatabase,
} from 'react-icons/fi';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import { getAllNotifications, markNotificationRead, getRecruitmentStats, getAllRecruitmentPositions, getAllInterviews } from '../service/api';

// Lazy load Recruitment Tab Components
const JobOpeningsTab = lazy(() => import('./Tabs/KAMRecruitment/JobOpeningsTab'));
const CandidatePipelineTab = lazy(() => import('./Tabs/KAMRecruitment/CandidatePipelineTab'));
const InterviewScheduleTab = lazy(() => import('./Tabs/KAMRecruitment/InterviewScheduleTab'));
const ScreeningTab = lazy(() => import('./Tabs/KAMRecruitment/ScreeningTab'));
const OfferManagementTab = lazy(() => import('./Tabs/KAMRecruitment/OfferManagementTab'));
const RecruitmentAnalyticsTab = lazy(() => import('./Tabs/KAMRecruitment/RecruitmentAnalyticsTab'));
const ResumeBankTab = lazy(() => import('./Tabs/KAMRecruitment/ResumeBankTab'));

// Team Management Tabs
const TeamManagementTab = lazy(() => import('./Tabs/Common/TeamManagementTab'));
const ActivityFeedTab = lazy(() => import('./Tabs/Common/ActivityFeedTab'));
const TaskAssignmentTab = lazy(() => import('./Tabs/Common/TaskAssignmentTab'));

// Tab Loader Skeleton
const TabLoader = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-7 w-52 rounded-lg bg-gray-200" />
      <div className="h-10 w-32 rounded-lg bg-gray-200" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 rounded-xl bg-gray-200" />
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-16 w-full rounded-lg bg-gray-100" />
      ))}
    </div>
  </div>
);

// Sidebar configuration
const sidebarConfig = [
  {
    heading: 'RECRUITMENT',
    items: [
      { id: 1, title: 'Job Openings', icon: FiBriefcase },
      { id: 2, title: 'Candidate Pipeline', icon: FiUsers },
      { id: 3, title: 'Interview Schedule', icon: FiCalendar },
    ]
  },
  {
    heading: 'ASSESSMENT',
    items: [
      { id: 4, title: 'Screening & Assessment', icon: FiFileText },
      { id: 5, title: 'Offer Management', icon: FiAward },
    ]
  },
  {
    heading: 'ANALYTICS',
    items: [
      { id: 6, title: 'Recruitment Analytics', icon: FiBarChart2 },
      { id: 7, title: 'Resume Bank', icon: FiDatabase },
    ]
  },
  {
    heading: 'TEAM',
    items: [
      { id: 8, title: 'Team Members', icon: FiUsers },
      { id: 9, title: 'Activity Feed', icon: FiActivity },
      { id: 10, title: 'Task Assignment', icon: FiCheckSquare },
    ]
  },
];

const HRRecruitmentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'HR Recruitment', role: 'HR Recruitment Head' });
  const [notifications, setNotifications] = useState([]);

  // Summary stats
  const [stats, setStats] = useState({
    activePositions: 0,
    totalCandidates: 0,
    scheduledInterviews: 0,
    pendingOffers: 0,
  });
  const [statsBarData, setStatsBarData] = useState([]);
  const [todayInterviews, setTodayInterviews] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          name: decoded.name || decoded.email?.split('@')[0] || 'HR Recruitment',
          role: 'HR Recruitment Head'
        });
        fetchNotifications(decoded.id || decoded.userId);
        fetchDashboardData();
      } catch (e) {
        console.log('Token decode error');
      }
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 1. Fetch recruitment stats
      const statsRes = await getRecruitmentStats();
      if (statsRes.success) {
        const s = statsRes.data;
        setStats({
          activePositions: s.positions.open || 0,
          totalCandidates: s.candidates.total || 0,
          scheduledInterviews: s.candidates.shortlisted || 0,
          pendingOffers: s.funnel.offerSent || 0,
        });

        // Map stats bar data with relative percentages
        const total = s.candidates.total || 1;
        const interviewed = (s.funnel.technical || 0) + (s.funnel.hrRound || 0) + (s.funnel.clientInterview || 0);
        
        const barData = [
          { label: 'New Applications', value: s.candidates.total || '0', percentage: '100%', color: 'bg-blue-500' },
          { label: 'In Screening', value: s.funnel.screening || '0', percentage: `${((s.funnel.screening || 0) / total * 100).toFixed(0)}%`, color: 'bg-yellow-500' },
          { label: 'Interviewed', value: interviewed || '0', percentage: `${(interviewed / total * 100).toFixed(0)}%`, color: 'bg-purple-500' },
          { label: 'Selected', value: s.candidates.selected || '0', percentage: `${((s.candidates.selected || 0) / total * 100).toFixed(0)}%`, color: 'bg-green-500' },
          { label: 'Conversion Rate', value: `${((s.candidates.selected / total) * 100).toFixed(1)}%`, percentage: `${((s.candidates.selected / total) * 100).toFixed(0)}%`, color: 'bg-teal-500' },
        ];
        setStatsBarData(barData);
      }

      // 2. Fetch today's interviews
      const today = new Date().toISOString().split('T')[0];
      const interviewRes = await getAllInterviews({ date: today });
      if (interviewRes.success) {
        setTodayInterviews(interviewRes.data.slice(0, 5)); // Top 5 for today
      }

      // 3. Fetch active job openings
      const jobsRes = await getAllRecruitmentPositions({ status: 'Open' });
      if (jobsRes.success) {
        setActiveJobs(jobsRes.data.slice(0, 4));
      }

    } catch (e) {
      console.error('Error fetching dashboard data:', e);
      if (e?.status === 401 || e?.response?.status === 401) {
        alert("Session expired. Redirecting to login...");
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const res = await getAllNotifications(userId);
      const notifs = (res.data || []).map(n => ({
        id: n.id,
        text: n.message,
        time: new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
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
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      } catch (e) { /* ignore */ }
    }
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'HR Recruitment', path: '/kam-recruitment-dashboard' },
    { label: activeTab }
  ];

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
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
            case 'Team Members':
              return <TeamManagementTab department="HR Recruitment" />;
            case 'Activity Feed':
              return <ActivityFeedTab department="HR Recruitment" />;
            case 'Task Assignment':
              return <TaskAssignmentTab department="HR Recruitment" />;
            default:
              // Dashboard Overview
              return (
                <div className="space-y-8">
                  {/* Welcome Banner */}
                  <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl lg:text-4xl font-bold">Welcome, {userInfo.name} 👋</h1>
                        <p className="mt-2 text-lg text-blue-100 italic">
                          {loading ? "Connecting to Live Backend..." : stats.totalCandidates === 0 && stats.activePositions === 0 ? "Backend Connected (No live data found)" : "HR Recruitment Dashboard - Build your dream team"}
                        </p>
                      </div>
                      {hasAccessTo('HR Operations') && (
                        <button
                          onClick={() => navigate('/kam-operations-dashboard')}
                          className="flex items-center gap-3 px-5 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition-all duration-200"
                        >
                          <FiUsers className="w-5 h-5" />
                          <span className="font-semibold text-base">HR Operations</span>
                        </button>
                      )}
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

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's Schedule */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-gray-900">Today's Interviews</h3>
                      </div>
                      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {todayInterviews.length > 0 ? todayInterviews.map((interview, idx) => (
                          <div key={idx} className="p-5 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                                {interview.candidateName ? interview.candidateName.charAt(0) : 'C'}
                              </div>
                              <div>
                                <p className="text-base font-semibold text-gray-900">{interview.candidateName}</p>
                                <p className="text-sm text-gray-500">{interview.positionTitle || 'Position'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-semibold text-gray-900">{interview.startTime || 'Scheduled'}</p>
                              <span className="text-sm px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">Upcoming</span>
                            </div>
                          </div>
                        )) : (
                          <div className="p-10 text-center text-gray-500">No interviews scheduled for today</div>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 text-center">
                        <button 
                          onClick={() => setActiveTab('Interview Schedule')}
                          className="text-base text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          View All Interviews
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions - Streamlined */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-5">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setActiveTab('Job Openings')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform">
                            <FiBriefcase className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Post New Job</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Candidate Pipeline')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform">
                            <FiUserPlus className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Add Candidate</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Interview Schedule')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-violet-100 text-violet-600 group-hover:scale-105 transition-transform">
                            <FiCalendar className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Schedule Interview</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Screening & Assessment')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-600 group-hover:scale-105 transition-transform">
                            <FiFileText className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Screen Candidate</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Offer Management')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-rose-100 text-rose-600 group-hover:scale-105 transition-transform">
                            <FiAward className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Send Offer</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Recruitment Analytics')}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 group-hover:scale-105 transition-transform">
                            <FiBarChart2 className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">View Analytics</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Job Openings */}
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-gray-900">Active Job Openings</h3>
                      <button 
                        onClick={() => setActiveTab('Job Openings')}
                        className="text-base text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        
                        View All
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-600 uppercase">Position</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-600 uppercase">Department</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-600 uppercase">Candidates</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-600 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {activeJobs.length > 0 ? activeJobs.map((job, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-5 py-4">
                                <span className="text-base font-semibold text-gray-900">{job.title}</span>
                              </td>
                              <td className="px-5 py-4 text-base text-gray-600">{job.clientName || 'N/A'}</td>
                              <td className="px-5 py-4">
                                <span className="text-base font-semibold text-gray-900">{job.candidateCount || 0}</span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${
                                  job.status === 'Active' || job.status === 'Open' ? 'bg-green-100 text-green-700' :
                                  job.status === 'Urgent' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {job.status}
                                </span>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="4" className="px-5 py-10 text-center text-gray-500 italic">No active job openings found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
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
      dashboardTitle="HR Recruitment"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default HRRecruitmentDashboard;