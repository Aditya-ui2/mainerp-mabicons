import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckSquare,
  FiActivity,
  FiUser,
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiMessageCircle,
  FiFileText,
  FiBell,
  FiFolder,
  FiBook,
  FiRepeat,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiUserPlus,
} from 'react-icons/fi';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import { getAllNotifications, markNotificationRead, getMyDepartmentTasks, getMyDepartmentStats } from '../service/api';

// Lazy load tab components
const MyTasksTab = lazy(() => import('./Tabs/Common/MyTasksTab'));
const ActivityFeedTab = lazy(() => import('./Tabs/Common/ActivityFeedTab'));
const MyProfileTab = lazy(() => import('./Tabs/Common/MyProfileTab'));
const LeaveRequestTab = lazy(() => import('./Tabs/Common/LeaveRequestTab'));
const AttendanceTab = lazy(() => import('./Tabs/Common/AttendanceTab'));
const PerformanceStatsTab = lazy(() => import('./Tabs/Common/PerformanceStatsTab'));
const TeamChatTab = lazy(() => import('./Tabs/Common/TeamChatTab'));
const CalendarTab = lazy(() => import('./Tabs/Common/CalendarTab'));
const DailyReportTab = lazy(() => import('./Tabs/Common/DailyReportTab'));
const AnnouncementsTab = lazy(() => import('./Tabs/Common/AnnouncementsTab'));
const DocumentsTab = lazy(() => import('./Tabs/Common/DocumentsTab'));
const TrainingTab = lazy(() => import('./Tabs/Common/TrainingTab'));
const PayslipsTab = lazy(() => import('./Tabs/Common/PayslipsTab'));

// Tab Loader Skeleton
const TabLoader = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-7 w-52 rounded-lg bg-gray-200" />
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

// Sidebar configuration for team members
const sidebarConfig = [
  {
    heading: 'WORKSPACE',
    items: [
      { id: 0, title: 'My Tasks', icon: FiCheckSquare },
      { id: 1, title: 'Activity Feed', icon: FiActivity },
      { id: 2, title: 'Daily Report', icon: FiFileText },
      { id: 3, title: 'Calendar', icon: FiCalendar },
    ]
  },
  {
    heading: 'PERSONAL',
    items: [
      { id: 4, title: 'My Profile', icon: FiUser },
      { id: 5, title: 'Attendance', icon: FiClock },
      { id: 6, title: 'Leave Requests', icon: FiCalendar },
      { id: 7, title: 'Performance', icon: FiBarChart2 },
    ]
  },
  {
    heading: 'DEPARTMENT',
    items: [
      { id: 8, title: 'Team Chat', icon: FiMessageCircle },
      { id: 10, title: 'Documents', icon: FiFolder },
      { id: 11, title: 'Training', icon: FiBook },
      { id: 12, title: 'Payslips', icon: FaIndianRupeeSign },
    ]
  },
];

const DepartmentMemberDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [userInfo, setUserInfo] = useState({ name: 'Team Member', role: 'Team Member' });
  const [department, setDepartment] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [dashStats, setDashStats] = useState({ totalTasks: 0, completed: 0, inProgress: 0, pending: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const dept = localStorage.getItem('department') || '';
    setDepartment(dept);

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const rawName = decoded.name || decoded.email?.split('@')[0] || 'Team Member';
        const cleanName = rawName.replace(/\s*\(.*?\)\s*$/, '').trim();
        setUserInfo({
          name: cleanName,
          role: decoded.role || 'Team Member'
        });
        if (decoded.department) {
          setDepartment(decoded.department);
        }
        fetchNotifications(decoded.id || decoded.userId);
      } catch (e) {
        console.log('Token decode error');
      }
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.allSettled([
        getMyDepartmentTasks(),
        getMyDepartmentStats(),
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value.stats) {
        const s = statsRes.value.stats;
        setDashStats({ totalTasks: s.total, completed: s.completed, inProgress: s.inProgress, pending: s.pending });
      }
      if (tasksRes.status === 'fulfilled') {
        const tasks = tasksRes.value.tasks || [];
        setAllTasks(tasks);
        setRecentTasks(tasks.slice(0, 5));
      }
    } catch { /* silent */ }
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

  // Compute time-based breakdowns for hover popups
  const getBreakdown = (statusFilter) => {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
    const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);

    const filtered = statusFilter === 'all' ? allTasks : allTasks.filter(t => t.status === statusFilter);
    const thisWeek = filtered.filter(t => new Date(t.createdAt) >= weekAgo).length;
    const thisMonth = filtered.filter(t => new Date(t.createdAt) >= monthAgo).length;
    const thisYear = filtered.filter(t => new Date(t.createdAt) >= yearAgo).length;
    const total = filtered.length;
    return { thisWeek, thisMonth, thisYear, total };
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: department || 'Department', path: '#' },
    { label: activeTab }
  ];

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
            case 'My Tasks':
              return <MyTasksTab initialFilter={taskFilter} />;
            case 'Activity Feed':
              return <ActivityFeedTab department={department} />;
            case 'Daily Report':
              return <DailyReportTab />;
            case 'Calendar':
              return <CalendarTab />;
            case 'My Profile':
              return <MyProfileTab />;
            case 'Attendance':
              return <AttendanceTab />;
            case 'Leave Requests':
              return <LeaveRequestTab />;
            case 'Performance':
              return <PerformanceStatsTab />;
            case 'Team Chat':
              return <TeamChatTab department={department} />;
            case 'Announcements':
              return <AnnouncementsTab department={department} />;
            case 'Documents':
              return <DocumentsTab department={department} />;
            case 'Training':
              return <TrainingTab />;
            case 'Payslips':
              return <PayslipsTab />;
            default:
              // Dashboard Overview - Rich layout matching Head dashboard
              return (
                <div className="space-y-8">
                  {/* Welcome Banner */}
                  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                    <div className="relative z-10">
                      <h1 className="text-3xl lg:text-4xl font-bold">Welcome, {userInfo.name} 👋</h1>
                      <p className="mt-2 text-lg text-purple-100">{department} - {userInfo.role}</p>
                      <p className="mt-1 text-sm text-purple-200">Check your assigned tasks and stay on top of your work</p>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { key: 'total', title: 'Total Tasks', value: dashStats.totalTasks, icon: FiCheckSquare, color: 'blue', filter: 'all', sparkline: [3, 5, 4, 7, 6, 8, dashStats.totalTasks || 1] },
                      { key: 'completed', title: 'Completed', value: dashStats.completed, icon: FiTarget, color: 'green', filter: 'Completed', sparkline: [1, 2, 3, 2, 4, 3, dashStats.completed || 1] },
                      { key: 'inprogress', title: 'In Progress', value: dashStats.inProgress, icon: FiTrendingUp, color: 'purple', filter: 'In Progress', sparkline: [2, 1, 3, 2, 3, 4, dashStats.inProgress || 1] },
                      { key: 'pending', title: 'Pending', value: dashStats.pending, icon: FiClock, color: 'yellow', filter: 'Pending', sparkline: [4, 3, 5, 4, 3, 2, dashStats.pending || 1] },
                    ].map((card) => {
                      const bd = getBreakdown(card.filter);
                      const colorMap = { blue: '#3b82f6', green: '#10b981', purple: '#8b5cf6', yellow: '#f59e0b' };
                      const accent = colorMap[card.color] || '#6366f1';
                      return (
                        <div
                          key={card.key}
                          className="cursor-pointer relative"
                          onClick={() => { setTaskFilter(card.filter); setActiveTab('My Tasks'); }}
                          onMouseEnter={() => setHoveredCard(card.key)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          <StatCard
                            title={card.title}
                            value={card.value}
                            icon={card.icon}
                            color={card.color}
                            sparklineData={card.sparkline}
                          />
                          {hoveredCard === card.key && (
                            <div
                              className="absolute left-1/2 -translate-x-1/2 z-50 w-64 rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                              style={{ top: '105%', background: '#fff' }}
                            >
                              <div className="px-4 py-3 text-white text-sm font-bold" style={{ background: accent }}>
                                {card.title} Breakdown
                              </div>
                              <div className="divide-y divide-gray-100">
                                {[
                                  { label: 'This Week', val: bd.thisWeek },
                                  { label: 'This Month', val: bd.thisMonth },
                                  { label: 'This Year', val: bd.thisYear },
                                  { label: 'All Time', val: bd.total },
                                ].map((row) => (
                                  <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                                    <span className="text-xs text-gray-500 font-medium">{row.label}</span>
                                    <span className="text-sm font-bold" style={{ color: accent }}>{row.val}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="px-4 py-2 text-center" style={{ background: '#f9fafb' }}>
                                <span className="text-[10px] text-gray-400">Click to view details</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Stats Bar */}
                  <StatsBar stats={[
                    { label: 'Completion Rate', value: dashStats.totalTasks > 0 ? `${Math.round((dashStats.completed / dashStats.totalTasks) * 100)}%` : '0%', percentage: dashStats.totalTasks > 0 ? `${Math.round((dashStats.completed / dashStats.totalTasks) * 100)}%` : '0%', color: 'bg-green-500' },
                    { label: 'In Progress', value: String(dashStats.inProgress), percentage: dashStats.totalTasks > 0 ? `${Math.round((dashStats.inProgress / dashStats.totalTasks) * 100)}%` : '0%', color: 'bg-blue-500' },
                    { label: 'Pending Tasks', value: String(dashStats.pending), percentage: dashStats.totalTasks > 0 ? `${Math.round((dashStats.pending / dashStats.totalTasks) * 100)}%` : '0%', color: 'bg-yellow-500' },
                    { label: 'Total Assigned', value: String(dashStats.totalTasks), percentage: '100%', color: 'bg-purple-500' },
                    { label: 'Productivity', value: dashStats.totalTasks > 0 ? `${Math.round(((dashStats.completed + dashStats.inProgress) / dashStats.totalTasks) * 100)}%` : '0%', percentage: dashStats.totalTasks > 0 ? `${Math.round(((dashStats.completed + dashStats.inProgress) / dashStats.totalTasks) * 100)}%` : '0%', color: 'bg-teal-500' },
                  ]} />

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-gray-900">Recent Tasks</h3>
                      </div>
                      {recentTasks.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No tasks assigned yet</div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {recentTasks.map((task, idx) => {
                            const statusMap = {
                              'Pending': { label: 'Pending', bg: '#fef3c7', color: '#f59e0b' },
                              'In Progress': { label: 'In Progress', bg: '#dbeafe', color: '#3b82f6' },
                              'Completed': { label: 'Completed', bg: '#d1fae5', color: '#10b981' },
                              'Overdue': { label: 'Overdue', bg: '#fee2e2', color: '#ef4444' },
                            };
                            const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981', High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
                            const sc = statusMap[task.status] || statusMap['Pending'];
                            return (
                              <div key={task.id || idx} className="p-5 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                                    style={{ background: priorityColors[task.priority] || '#6366f1' }}
                                  >
                                    {(task.title || 'T')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                                    <p className="text-xs text-gray-500">
                                      {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : 'No due date'}
                                      {task.priority && <span className="capitalize"> • {task.priority}</span>}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                  style={{ background: sc.bg, color: sc.color }}
                                >
                                  {sc.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="p-4 bg-gray-50 text-center">
                        <button
                          onClick={() => setActiveTab('My Tasks')}
                          className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          View All Tasks
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-5">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { tab: 'My Tasks', icon: FiCheckSquare, label: 'View Tasks', hoverBorder: 'hover:border-blue-300', hoverBg: 'hover:bg-blue-50/50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                          { tab: 'Attendance', icon: FiClock, label: 'Mark Attendance', hoverBorder: 'hover:border-emerald-300', hoverBg: 'hover:bg-emerald-50/50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                          { tab: 'Daily Report', icon: FiFileText, label: 'Submit Report', hoverBorder: 'hover:border-violet-300', hoverBg: 'hover:bg-violet-50/50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
                          { tab: 'Leave Requests', icon: FiCalendar, label: 'Apply Leave', hoverBorder: 'hover:border-amber-300', hoverBg: 'hover:bg-amber-50/50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
                          { tab: 'Team Chat', icon: FiMessageCircle, label: 'Team Chat', hoverBorder: 'hover:border-rose-300', hoverBg: 'hover:bg-rose-50/50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
                          { tab: 'Performance', icon: FiBarChart2, label: 'View Performance', hoverBorder: 'hover:border-cyan-300', hoverBg: 'hover:bg-cyan-50/50', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
                        ].map((action) => (
                          <button
                            key={action.tab}
                            onClick={() => setActiveTab(action.tab)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 ${action.hoverBorder} ${action.hoverBg} transition-all duration-200 text-left group`}
                          >
                            <div className={`p-2 rounded-lg ${action.iconBg} ${action.iconColor} group-hover:scale-105 transition-transform`}>
                              <action.icon style={{ width: '20px', height: '20px' }} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{action.label}</span>
                          </button>
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
    <AdminLayout
      sidebarItems={sidebarConfig}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dashboardTitle={`${department || 'Department'} - Member`}
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default DepartmentMemberDashboard;
