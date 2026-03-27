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
const CalendarTab = lazy(() => import('./Tabs/Common/CalendarTab'));
const DailyReportTab = lazy(() => import('./Tabs/Common/DailyReportTab'));
const AnnouncementsTab = lazy(() => import('./Tabs/Common/AnnouncementsTab'));
const PayslipsTab = lazy(() => import('./Tabs/Common/PayslipsTab'));
const InterviewScheduleTab = lazy(() => import('./Tabs/KAMRecruitment/InterviewScheduleTab'));
const ClientRecruitmentProgressTab = lazy(() => import('./Tabs/Client/ClientRecruitmentProgressTab'));

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
    ]
  },
  {
    heading: 'PERSONAL',
    items: [
      { id: 4, title: 'My Profile', icon: FiUser },
      { id: 7, title: 'Performance', icon: FiBarChart2 },
    ]
  },
  {
    heading: 'RECRUITMENT',
    items: [
      { id: 8, title: 'Interview Schedule', icon: FiCalendar },
      { id: 13, title: 'Recruitment Process', icon: FiTarget },
    ]
  },
  {
    heading: 'DEPARTMENT',
    items: [
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
  const [weekOffset, setWeekOffset] = useState(0);

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
  const getBreakdown = (statusFilter, offset = 0) => {
    const now = new Date();
    const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
    const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);

    const filtered = statusFilter === 'all' ? allTasks : allTasks.filter(t => t.status === statusFilter);
    const total = filtered.length;

    // Compute the week range based on offset (0 = current week, -1 = last week, etc.)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + (offset * 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    weekEnd.setHours(0, 0, 0, 0);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayDates = [];
    const dayCounts = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      dayDates.push({ name: dayNames[d.getDay()], date: d.getDate(), month: d.toLocaleString('en-IN', { month: 'short' }) });
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      dayCounts.push(filtered.filter(t => { const c = new Date(t.createdAt); return c >= dayStart && c <= dayEnd; }).length);
    }

    const weekTotal = dayCounts.reduce((a, b) => a + b, 0);
    const thisMonth = filtered.filter(t => new Date(t.createdAt) >= monthAgo).length;
    const thisYear = filtered.filter(t => new Date(t.createdAt) >= yearAgo).length;

    // Week label
    const wStart = new Date(weekStart);
    const wEnd = new Date(weekStart); wEnd.setDate(wStart.getDate() + 6);
    const weekLabel = `${wStart.getDate()} ${wStart.toLocaleString('en-IN', { month: 'short' })} - ${wEnd.getDate()} ${wEnd.toLocaleString('en-IN', { month: 'short' })}`;

    return { weekTotal, thisMonth, thisYear, total, dayDates, dayCounts, weekLabel };
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
            case 'Interview Schedule':
              return <InterviewScheduleTab />;
            case 'Recruitment Process':
              return <ClientRecruitmentProgressTab />;
            case 'Announcements':
              return <AnnouncementsTab department={department} />;
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
                      { key: 'total', title: 'Total Tasks', value: dashStats.totalTasks, icon: FiCheckSquare, color: 'blue', filter: 'all' },
                      { key: 'completed', title: 'Completed', value: dashStats.completed, icon: FiTarget, color: 'green', filter: 'Completed' },
                      { key: 'inprogress', title: 'In Progress', value: dashStats.inProgress, icon: FiTrendingUp, color: 'purple', filter: 'In Progress' },
                      { key: 'pending', title: 'Pending', value: dashStats.pending, icon: FiClock, color: 'yellow', filter: 'Pending' },
                    ].filter(card => card.value > 0 || card.key === 'total').map((card) => {
                      const bd = getBreakdown(card.filter, 0);
                      const sparkline = bd.dayCounts.length ? bd.dayCounts : [card.value || 1];
                      const bdHover = getBreakdown(card.filter, weekOffset);
                      const colorMap = { blue: '#3b82f6', green: '#10b981', purple: '#8b5cf6', yellow: '#f59e0b' };
                      const accent = colorMap[card.color] || '#6366f1';
                      return (
                        <div
                          key={card.key}
                          className="cursor-pointer relative"
                          onClick={() => { setTaskFilter(card.filter); setActiveTab('My Tasks'); }}
                          onMouseEnter={() => { setHoveredCard(card.key); setWeekOffset(0); }}
                          onMouseLeave={() => { setHoveredCard(null); setWeekOffset(0); }}
                        >
                          <StatCard
                            title={card.title}
                            value={card.value}
                            icon={card.icon}
                            color={card.color}
                            sparklineData={sparkline}
                          />
                          {hoveredCard === card.key && (
                            <div
                              className="absolute left-1/2 -translate-x-1/2 z-50 w-80 rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                              style={{ top: '105%', background: '#fff' }}
                            >
                              <div className="px-4 py-3 text-white text-sm font-bold" style={{ background: accent }}>
                                {card.title} Breakdown
                              </div>
                              {/* Week navigation + Day-wise bar chart */}
                              <div className="px-4 pt-3 pb-1">
                                <div className="flex items-center justify-between mb-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setWeekOffset(prev => prev - 1); }}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                  </button>
                                  <span className="text-[11px] font-semibold text-gray-600">{bdHover.weekLabel}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); if (weekOffset < 0) setWeekOffset(prev => prev + 1); }}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                    style={{ opacity: weekOffset >= 0 ? 0.3 : 1 }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                  </button>
                                </div>
                                <div className="flex items-end justify-between gap-1" style={{ height: '56px' }}>
                                  {bdHover.dayDates.map((day, i) => {
                                    const maxVal = Math.max(...bdHover.dayCounts, 1);
                                    const h = Math.max((bdHover.dayCounts[i] / maxVal) * 40, 4);
                                    return (
                                      <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                                        <span className="text-[9px] font-bold" style={{ color: bdHover.dayCounts[i] > 0 ? accent : '#d1d5db' }}>{bdHover.dayCounts[i]}</span>
                                        <div className="w-full rounded-sm" style={{ height: `${h}px`, background: bdHover.dayCounts[i] > 0 ? accent : '#e5e7eb', opacity: bdHover.dayCounts[i] > 0 ? 1 : 0.4 }} />
                                        <span className="text-[9px] text-gray-500 font-semibold">{day.name}</span>
                                        <span className="text-[8px] text-gray-400">{day.date}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="divide-y divide-gray-100 mt-1">
                                {[
                                  { label: 'This Week', val: bdHover.weekTotal },
                                  { label: 'This Month', val: bdHover.thisMonth },
                                  { label: 'This Year', val: bdHover.thisYear },
                                  { label: 'All Time', val: bdHover.total },
                                ].map((row) => (
                                  <div key={row.label} className="flex items-center justify-between px-4 py-2">
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
                          { tab: 'Interview Schedule', icon: FiCalendar, label: 'Interviews', hoverBorder: 'hover:border-rose-300', hoverBg: 'hover:bg-rose-50/50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
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
