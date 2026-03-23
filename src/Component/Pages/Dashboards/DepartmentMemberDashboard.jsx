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
} from 'react-icons/fi';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import AdminLayout from './AdminLayout';
import { getAllNotifications, markNotificationRead } from '../service/api';

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
      { id: 9, title: 'Announcements', icon: FiBell },
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const dept = localStorage.getItem('department') || '';
    setDepartment(dept);

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const rawName = decoded.name || decoded.email?.split('@')[0] || 'Team Member';
        // Strip parenthetical role from name if present (e.g. "Sachin (HR Head)" → "Sachin")
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
  }, []);

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
    { label: department || 'Department', path: '#' },
    { label: activeTab }
  ];

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
            case 'My Tasks':
              return <MyTasksTab />;
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
              // Dashboard Overview - Welcome + Quick Stats
              return (
                <div className="space-y-8">
                  {/* Welcome Banner */}
                  <div
                    className="rounded-2xl p-8 text-white relative overflow-hidden shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                    <div className="relative z-10">
                      <h1 className="text-3xl lg:text-4xl font-bold">Welcome, {userInfo.name} 👋</h1>
                      <p className="mt-2 text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {department} - {userInfo.role}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Check your assigned tasks and stay on top of your work
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                      { tab: 'My Tasks', icon: FiCheckSquare, label: 'My Tasks', desc: 'View and manage your assigned tasks', gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)' },
                      { tab: 'Activity Feed', icon: FiActivity, label: 'Activity Feed', desc: 'See recent department activities', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
                      { tab: 'Daily Report', icon: FiFileText, label: 'Daily Report', desc: 'Submit your daily updates', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
                      { tab: 'Attendance', icon: FiClock, label: 'Attendance', desc: 'Check in/out and track hours', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
                      { tab: 'Team Chat', icon: FiMessageCircle, label: 'Team Chat', desc: 'Chat with your team members', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
                      { tab: 'Leave Requests', icon: FiCalendar, label: 'Leave Requests', desc: 'Apply for and track leaves', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
                    ].map((card) => (
                      <button
                        key={card.tab}
                        onClick={() => setActiveTab(card.tab)}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="p-4 rounded-xl"
                            style={{ background: card.gradient }}
                          >
                            <card.icon style={{ width: '28px', height: '28px', color: '#fff' }} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {card.label}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {card.desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
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
