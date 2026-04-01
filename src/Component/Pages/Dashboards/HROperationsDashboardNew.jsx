import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAccessTo } from '../DepartmentProtectedRoute';
import {
  FiClock,
  FiDollarSign,
  FiUserPlus,
  FiFileText,
  FiUsers,
  FiTrendingUp,
  FiUserMinus,
  FiCheckSquare,
  FiFile,
  FiEdit3,
  FiHeart,
  FiClipboard,
  FiCalendar,
  FiShield,
  FiMessageSquare,
  FiRefreshCw,
  FiTarget,
  FiActivity,
  FiBriefcase,
} from 'react-icons/fi';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';

// Lazy load KAM Tab Components
const DashboardOverviewTab = lazy(() => import('./Tabs/KAM/DashboardOverviewTab'));
const AttendanceTab = lazy(() => import('./Tabs/KAM/AttendanceTab'));
const PayrollTab = lazy(() => import('./Tabs/KAM/PayrollTab'));
const OnboardingKamTab = lazy(() => import('./Tabs/KAM/OnboardingKamTab'));
const PolicyTab = lazy(() => import('./Tabs/KAM/PolicyTab'));
const MasterDataTab = lazy(() => import('./Tabs/KAM/MasterDataTab'));
const PerformanceTab = lazy(() => import('./Tabs/KAM/PerformanceTab'));
const OffboardingTab = lazy(() => import('./Tabs/KAM/OffboardingTab'));
const FnFTab = lazy(() => import('./Tabs/KAM/FnFTab'));
const DocumentVerifyTab = lazy(() => import('./Tabs/KAM/DocumentVerifyTab'));
const NotesTab = lazy(() => import('./Tabs/KAM/NotesTab'));
const EmployeeEngagementTab = lazy(() => import('./Tabs/KAM/EmployeeEngagementTab'));
const TaskByClientTab = lazy(() => import('./Tabs/KAM/TaskByClientTab'));
const LeaveManagementTab = lazy(() => import('./Tabs/KAM/LeaveManagementTab'));
const ComplianceTab = lazy(() => import('./Tabs/KAM/ComplianceTab'));
const KamProductivityTab = lazy(() => import('./Tabs/KAM/KamProductivityTab'));
const WorkAgreementTab = lazy(() => import('./Tabs/KAM/WorkAgreementTab'));
const ChatUpdatesTab = lazy(() => import('./Tabs/KAM/ChatUpdatesTab'));
const WorkHandoverTab = lazy(() => import('./Tabs/KAM/WorkHandoverTab'));

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
    heading: 'HR OPERATIONS',
    items: [
      { id: 1, title: 'Attendance', icon: FiClock },
      { id: 2, title: 'Payroll', icon: FiDollarSign },
      { id: 13, title: 'Leave Management', icon: FiCalendar },
      { id: 6, title: 'Performance', icon: FiTrendingUp },
    ]
  },
  {
    heading: 'EMPLOYEE LIFECYCLE',
    items: [
      { id: 3, title: 'Onboarding', icon: FiUserPlus },
      { id: 7, title: 'Offboarding', icon: FiUserMinus },
      { id: 8, title: 'FnF', icon: FiCheckSquare },
      { id: 5, title: 'Master Data (Emp)', icon: FiUsers },
    ]
  },
  {
    heading: 'DOCUMENTATION',
    items: [
      { id: 9, title: 'Document Verify', icon: FiFile },
      { id: 4, title: 'Policy Making', icon: FiFileText },
      { id: 14, title: 'Compliance Management', icon: FiShield },
      { id: 16, title: 'Work Agreements', icon: FiFileText },
    ]
  },
  {
    heading: 'ENGAGEMENT',
    items: [
      { id: 11, title: 'Employee Engagement', icon: FiHeart },
      { id: 12, title: 'Task by Client', icon: FiClipboard },
      { id: 10, title: 'Notes', icon: FiEdit3 },
    ]
  },
  {
    heading: 'COMMUNICATION',
    items: [
      { id: 17, title: 'Client Chat', icon: FiMessageSquare },
      { id: 18, title: 'Work Handover', icon: FiRefreshCw },
      { id: 15, title: 'KAM Productivity', icon: FiTrendingUp },
    ]
  },
  {
    heading: 'TEAM',
    items: [
      { id: 19, title: 'Team Members', icon: FiUsers },
      { id: 20, title: 'Activity Feed', icon: FiActivity },
      { id: 21, title: 'Task Assignment', icon: FiCheckSquare },
    ]
  },
];

const HROperationsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'HR Operations', role: 'HR Operations Head' });

  // Summary stats
  const [stats, setStats] = useState({
    totalEmployees: 156,
    activeOnboarding: 12,
    pendingPayroll: 8,
    attendanceRate: '94.5%',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          name: decoded.name || decoded.email?.split('@')[0] || 'HR Operations',
          role: 'HR Operations Head'
        });
      } catch (e) {
        console.log('Token decode error');
      }
    }
  }, []);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'HR Operations', path: '/kam-operations-dashboard' },
    { label: activeTab }
  ];

  const statsBarData = [
    { label: 'Active Employees', value: '156', percentage: '92%', color: 'bg-blue-500' },
    { label: 'On Leave', value: '12', percentage: '8%', color: 'bg-yellow-500' },
    { label: 'Pending Actions', value: '23', percentage: '15%', color: 'bg-orange-500' },
    { label: 'Compliance Rate', value: '98%', percentage: '98%', color: 'bg-green-500' },
    { label: 'Satisfaction', value: '4.2/5', percentage: '84%', color: 'bg-purple-500' },
  ];

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
            case 'Attendance':
              return <AttendanceTab />;
            case 'Payroll':
              return <PayrollTab />;
            case 'Onboarding':
              return <OnboardingKamTab />;
            case 'Policy Making':
              return <PolicyTab />;
            case 'Master Data (Emp)':
              return <MasterDataTab />;
            case 'Performance':
              return <PerformanceTab />;
            case 'Offboarding':
              return <OffboardingTab />;
            case 'FnF':
              return <FnFTab />;
            case 'Document Verify':
              return <DocumentVerifyTab />;
            case 'Notes':
              return <NotesTab />;
            case 'Employee Engagement':
              return <EmployeeEngagementTab />;
            case 'Task by Client':
              return <TaskByClientTab />;
            case 'Leave Management':
              return <LeaveManagementTab />;
            case 'Compliance Management':
              return <ComplianceTab />;
            case 'KAM Productivity':
              return <KamProductivityTab />;
            case 'Work Agreements':
              return <WorkAgreementTab />;
            case 'Client Chat':
              return <ChatUpdatesTab />;
            case 'Work Handover':
              return <WorkHandoverTab />;
            case 'Team Members':
              return <TeamManagementTab department="HR Operations" />;
            case 'Activity Feed':
              return <ActivityFeedTab department="HR Operations" />;
            case 'Task Assignment':
              return <TaskAssignmentTab department="HR Operations" />;
            default:
              // Dashboard Overview
              return (
                <div className="space-y-6">
                  {/* Welcome Banner */}
                  <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl lg:text-3xl font-bold">Welcome, {userInfo.name} 👋</h1>
                        <p className="mt-1 text-blue-100">HR Operations Dashboard - Manage your workforce efficiently</p>
                      </div>
                      {hasAccessTo('HR Recruitment') && (
                        <button
                          onClick={() => navigate('/kam-recruitment-dashboard')}
                          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg transition-all duration-200"
                        >
                          <FiTarget className="w-4 h-4" />
                          <span className="font-medium">HR Recruitment</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Total Employees"
                      value={stats.totalEmployees}
                      change="+8%"
                      changeType="increase"
                      icon={FiUsers}
                      color="blue"
                      sparklineData={[120, 135, 128, 145, 140, 156, 160]}
                    />
                    <StatCard
                      title="Active Onboarding"
                      value={stats.activeOnboarding}
                      change="+3"
                      changeType="increase"
                      icon={FiUserPlus}
                      color="teal"
                      sparklineData={[5, 8, 6, 10, 9, 12, 11]}
                    />
                    <StatCard
                      title="Pending Payroll"
                      value={stats.pendingPayroll}
                      change="-2"
                      changeType="decrease"
                      icon={FiDollarSign}
                      color="yellow"
                      sparklineData={[15, 12, 10, 14, 11, 8, 9]}
                    />
                    <StatCard
                      title="Attendance Rate"
                      value={stats.attendanceRate}
                      change="+2.1%"
                      changeType="increase"
                      icon={FiClock}
                      color="green"
                      sparklineData={[88, 90, 91, 93, 92, 94, 95]}
                    />
                  </div>

                  {/* Stats Bar */}
                  <StatsBar stats={statsBarData} />

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activities */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Recent Activities</h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50">
                          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                            <FiUserPlus className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">New employee onboarded - John Doe</p>
                            <p className="text-xs text-gray-400">2 hours ago</p>
                          </div>
                        </div>
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <FiCalendar className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">Leave approved - Sarah Smith</p>
                            <p className="text-xs text-gray-400">4 hours ago</p>
                          </div>
                        </div>
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50">
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                            <FiDollarSign className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">Payroll processed for March</p>
                            <p className="text-xs text-gray-400">1 day ago</p>
                          </div>
                        </div>
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50">
                          <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
                            <FiFile className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">Documents verified - Mike Johnson</p>
                            <p className="text-xs text-gray-400">2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setActiveTab('Onboarding')}
                          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform">
                            <FiUserPlus className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Add Employee</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Attendance')}
                          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform">
                            <FiClock className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Payroll')}
                          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-600 group-hover:scale-105 transition-transform">
                            <FiDollarSign className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Process Payroll</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Leave Management')}
                          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-violet-100 text-violet-600 group-hover:scale-105 transition-transform">
                            <FiCalendar className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Manage Leaves</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Document Verify')}
                          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-rose-100 text-rose-600 group-hover:scale-105 transition-transform">
                            <FiFile className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Verify Documents</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Performance')}
                          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 group-hover:scale-105 transition-transform">
                            <FiTrendingUp className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">View Performance</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Try loading the actual overview tab if it exists */}
                  <Suspense fallback={null}>
                    <DashboardOverviewTab onNavigate={setActiveTab} />
                  </Suspense>
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
      dashboardTitle="HR Operations"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={[]}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default HROperationsDashboard;
