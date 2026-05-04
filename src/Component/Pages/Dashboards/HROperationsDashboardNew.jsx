import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAccessTo } from '../DepartmentProtectedRoute';
import { getDepartmentDashboardStats } from '../service/api';
import {
  FiClock,
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
  FiUser,
} from 'react-icons/fi';
import { FaIndianRupeeSign } from 'react-icons/fa6';
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
const OperationsNotesTab = lazy(() => import('./Tabs/Common/OperationsNotesTab'));
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
const ActivityFeedTab = lazy(() => import('./Tabs/Common/OperationsActivityFeedTab'));
const TaskAssignmentTab = lazy(() => import('./Tabs/Common/OperationsTaskAssignmentTab'));

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

const ComingSoonPlaceholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center">
    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
      <FiActivity className="w-10 h-10" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 max-w-md">We're working hard to bring you this feature. Stay tuned for updates!</p>
    <div className="mt-8 flex gap-3">
      <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold opacity-50 cursor-not-allowed">Coming Soon</div>
    </div>
  </div>
);

// Sidebar configuration
const sidebarConfig = [
  {
    heading: 'Core Operations',
    items: [
      { 
        id: 1, 
        title: 'Attendance & Leave', 
        icon: FiClock,
        submenu: [
          { id: 101, title: 'Monthly Attendance' },
          { id: 102, title: 'Correction & regularization' },
          { id: 103, title: 'Leave management' },
        ]
      },
      { 
        id: 2, 
        title: 'Payroll', 
        icon: FaIndianRupeeSign,
        submenu: [
          { id: 201, title: 'Payroll-setup' },
          { id: 202, title: 'Salary' },
          { id: 203, title: 'Payroll Process' },
          { id: 204, title: 'Verification' },
          { id: 205, title: 'Payout' },
          { id: 206, title: 'Payslip' },
        ]
      },
      { id: 3, title: 'Onboarding', icon: FiUserPlus },
      { id: 7, title: 'Offboarding', icon: FiUserMinus },
      { id: 8, title: 'FnF', icon: FiCheckSquare },
      { id: 5, title: 'Master Data', icon: FiUsers },
      { id: 22, title: 'Employee', icon: FiUser },
      {
        id: 9,
        title: 'Documentation',
        icon: FiFileText,
        submenu: [
          { id: 301, title: 'Document verify' },
          { id: 302, title: 'Policy Making' },
          { id: 303, title: 'Compliance Management' },
          { id: 304, title: 'Work Agreement' },
        ]
      },
      { id: 14, title: 'Compliance', icon: FiShield },
      { id: 10, title: 'Notes', icon: FiEdit3 },
      { id: 21, title: 'Task Assignment', icon: FiCheckSquare },
      { id: 19, title: 'Team Member', icon: FiUsers },
      { id: 20, title: 'Activity Feed', icon: FiActivity },
    ]
  },
];

const HROperationsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('hroperations_active_tab') || 'Dashboard');

  useEffect(() => {
    localStorage.setItem('hroperations_active_tab', activeTab);
  }, [activeTab]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'HR Operations', role: 'HR Operations Head' });

  // Summary stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeOnboarding: 0,
    pendingPayroll: 0,
    attendanceRate: '0%',
  });

  const [statsBarData, setStatsBarData] = useState([
    { label: 'Active Employees', value: '0', percentage: '0%', color: 'bg-blue-500' },
    { label: 'On Leave', value: '0', percentage: '0%', color: 'bg-yellow-500' },
    { label: 'Pending Actions', value: '0', percentage: '0%', color: 'bg-orange-500' },
    { label: 'Compliance Rate', value: '0%', percentage: '0%', color: 'bg-green-500' },
    { label: 'Satisfaction', value: '0/5', percentage: '0%', color: 'bg-purple-500' },
  ]);



  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await getDepartmentDashboardStats('HR Operations');
        if (response.success && response.stats) {
          const s = response.stats;
          setStats(s.overview);
          
          if (s.bar) {
            setStatsBarData([
              { label: 'Active Employees', value: s.bar.activeEmployees, percentage: '100%', color: 'bg-blue-500' },
              { label: 'On Leave', value: s.bar.onLeave, percentage: `${((s.bar.onLeave / (s.bar.activeEmployees || 1)) * 100).toFixed(0)}%`, color: 'bg-yellow-500' },
              { label: 'Pending Actions', value: s.bar.pendingActions, percentage: '15%', color: 'bg-orange-500' },
              { label: 'Compliance Rate', value: s.bar.complianceRate, percentage: '0%', color: 'bg-green-500' },
              { label: 'Satisfaction', value: s.bar.satisfaction, percentage: '0%', color: 'bg-purple-500' },
            ]);


          }

          if (s.recentActivities) {
            setRecentActivities(s.recentActivities);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

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
    
    fetchDashboardData();
  }, []);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'HR Operations', path: '/kam-operations-dashboard' },
    { label: activeTab }
  ];

  const statsBarDataMock = []; // Redundant with new state

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
            // Attendance & Leave Dropdown
            case 'Monthly Attendance':
              return <AttendanceTab />;
            case 'Correction & regularization':
              return <ComingSoonPlaceholder title="Correction & regularization" />;
            case 'Leave management':
              return <LeaveManagementTab />;

            // Payroll Dropdown
            case 'Payroll-setup':
              return <ComingSoonPlaceholder title="Payroll-setup" />;
            case 'Salary':
              return <ComingSoonPlaceholder title="Salary" />;
            case 'Payroll Process':
              return <ComingSoonPlaceholder title="Payroll Process" />;
            case 'Verification':
              return <ComingSoonPlaceholder title="Payroll Verification" />;
            case 'Payout':
              return <ComingSoonPlaceholder title="Payout Processing" />;
            case 'Payslip':
              return <ComingSoonPlaceholder title="Employee Payslips" />;

            // Core Items
            case 'Onboarding':
              return <OnboardingKamTab />;
            case 'Offboarding':
              return <OffboardingTab />;
            case 'FnF':
              return <FnFTab />;
            case 'Master Data':
              return <MasterDataTab />;
            case 'Employee':
              return <ComingSoonPlaceholder title="Employee Directory" />;

            // Documentation Dropdown
            case 'Document verify':
              return <DocumentVerifyTab />;
            case 'Policy Making':
              return <PolicyTab />;
            case 'Compliance Management':
              return <ComplianceTab />;
            case 'Work Agreement':
              return <WorkAgreementTab />;

            case 'Compliance':
              return <ComplianceTab />;
            case 'Notes':
              return <OperationsNotesTab />;
            case 'Task Assignment':
              return <TaskAssignmentTab department="HR Operations" />;
            case 'Team Member':
              return <TeamManagementTab department="HR Operations" />;
            case 'Activity Feed':
              return <ActivityFeedTab department="HR Operations" />;

            // Legacy mappings (for safety)
            case 'Attendance':
              return <AttendanceTab />;
            case 'Payroll':
              return <PayrollTab />;
            case 'Leave Management':
              return <LeaveManagementTab />;
            case 'Master Data (Emp)':
              return <MasterDataTab />;
            case 'Team Members':
              return <TeamManagementTab department="HR Operations" />;
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
                      change={stats.trends?.employees || '0'}
                      changeType={(stats.trends?.employees || '').startsWith('+') ? 'increase' : 'decrease'}
                      icon={FiUsers}
                      color="blue"
                      sparklineData={stats.sparklines?.employees || [0,0,0,0,0,0,0]}
                    />
                    <StatCard
                      title="Active Onboarding"
                      value={stats.activeOnboarding}
                      change={stats.trends?.onboarding || '0'}
                      changeType={(stats.trends?.onboarding || '').startsWith('+') ? 'increase' : 'decrease'}
                      icon={FiUserPlus}
                      color="teal"
                      sparklineData={stats.sparklines?.onboarding || [0,0,0,0,0,0,0]}
                    />
                    <StatCard
                      title="Pending Payroll"
                      value={stats.pendingPayroll}
                      change={stats.trends?.payroll || '0'}
                      changeType={(stats.trends?.payroll || '').startsWith('+') ? 'increase' : 'decrease'}
                      icon={FaIndianRupeeSign}
                      color="yellow"
                      sparklineData={stats.sparklines?.payroll || [0,0,0,0,0,0,0]}
                    />
                    <StatCard
                      title="Attendance Rate"
                      value={stats.attendanceRate}
                      change={stats.trends?.attendance || '0%'}
                      changeType={(stats.trends?.attendance || '').startsWith('+') ? 'increase' : 'decrease'}
                      icon={FiClock}
                      color="green"
                      sparklineData={stats.sparklines?.attendance || [0,0,0,0,0,0,0]}
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
                        {recentActivities && recentActivities.length > 0 ? (
                          recentActivities.map((activity, idx) => {
                            const Icon = activity.actionType === 'task' ? FiCheckSquare : 
                                         activity.actionType === 'leave' ? FiCalendar :
                                         activity.actionType === 'payroll' ? FaIndianRupeeSign :
                                         FiActivity;
                            const bgColor = activity.actionType === 'task' ? 'bg-violet-100' :
                                            activity.actionType === 'leave' ? 'bg-blue-100' :
                                            activity.actionType === 'payroll' ? 'bg-amber-100' :
                                            'bg-emerald-100';
                            const textColor = activity.actionType === 'task' ? 'text-violet-600' :
                                              activity.actionType === 'leave' ? 'text-blue-600' :
                                              activity.actionType === 'payroll' ? 'text-amber-600' :
                                              'text-emerald-600';

                            return (
                              <div key={activity.id || idx} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                                <div className={`p-2 rounded-lg ${bgColor} ${textColor}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800">{activity.description}</p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(activity.createdAt).toLocaleDateString()} - {activity.performedByName}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-gray-400">
                            No recent activities
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {(localStorage.getItem('userType') === 'superadmin' || localStorage.getItem('userEmail') === 'ashwin.mabicons@gmail.com') && (
                          <button
                            onClick={() => setActiveTab('Onboarding')}
                            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 text-left group"
                          >
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform">
                              <FiUserPlus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Add Employee</span>
                          </button>
                        )}
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
                            <FaIndianRupeeSign className="w-4 h-4" />
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
                    <DashboardOverviewTab 
                      onNavigate={setActiveTab} 
                      stats={stats} 
                      isDarkMode={false} 
                    />
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
      isLoading={loading}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default HROperationsDashboard;
