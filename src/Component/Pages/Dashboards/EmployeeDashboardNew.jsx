import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  FiCheckSquare,
  FiUserPlus,
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiTarget,
  FiFileText,
  FiBell,
  FiAward,
} from 'react-icons/fi';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import TaskTab from './Tabs/TaskTab';
import OnboardingTab from './Tabs/OnboardingTab';
import AnnouncementsTab from './Tabs/Common/AnnouncementsTab';
import AnnouncementsWidget from './Tabs/Common/AnnouncementsWidget';
import { getEmployeeTasks, getAllNotifications } from '../service/api';

// Sidebar configuration
const sidebarConfig = [
  {
    heading: 'WORK',
    items: [
      { id: 1, title: 'My Tasks', icon: FiCheckSquare },
      { id: 2, title: 'Onboarding', icon: FiUserPlus },
    ]
  },
  {
    heading: 'TIME',
    items: [
      { id: 3, title: 'Attendance', icon: FiClock },
      { id: 4, title: 'Leave Requests', icon: FiCalendar },
    ]
  },
  {
    heading: 'GROWTH',
    items: [
      { id: 5, title: 'Performance', icon: FiTrendingUp },
      { id: 6, title: 'Documents', icon: FiFileText },
      { id: 7, title: 'Announcements', icon: FiBell },
    ]
  },
];

const EmployeeDashboardNew = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('employee_active_tab') || 'Dashboard');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    localStorage.setItem('employee_active_tab', activeTab);
  }, [activeTab]);
  const [notifications, setNotifications] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: 'Employee', role: 'Employee' });

  const refreshUserInfo = useCallback(() => {
    const localName = localStorage.getItem('userName');
    const localRole = localStorage.getItem('userType');
    const localPicture = localStorage.getItem('userPicture');
    const localDept = localStorage.getItem('department');
    
    let fallbackName = 'Employee';
    let fallbackRole = 'Employee';
    let fallbackDept = 'All';
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        fallbackName = decoded.name || decoded.email?.split('@')[0] || 'Employee';
        fallbackRole = decoded.role || 'Employee';
        fallbackDept = decoded.department || 'All';
      }
    } catch (e) {}

    setUserInfo({
      name: localName || fallbackName,
      role: localRole || fallbackRole,
      department: localDept || fallbackDept,
      avatar: localPicture || '',
      picture: localPicture || ''
    });
  }, []);

  useEffect(() => {
    refreshUserInfo();
    window.addEventListener('profileUpdate', refreshUserInfo);
    return () => window.removeEventListener('profileUpdate', refreshUserInfo);
  }, [refreshUserInfo]);

  const fetchEmployeeTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const decoded = jwtDecode(token);
      const employeeId = decoded?.id;
      
      refreshUserInfo();

      if (!employeeId) {
        throw new Error('Employee ID not found in token');
      }

      const response = await getEmployeeTasks(employeeId);
      setTasks(response?.tasks || []);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [refreshUserInfo]);

  useEffect(() => {
    fetchEmployeeTasks();
  }, [fetchEmployeeTasks]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded?.id;
        if (!userId) return;

        const response = await getAllNotifications(userId);
        setNotifications(response?.data || []);
      } catch {
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  // Calculate task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => {
      const s = String(t.status || '').toLowerCase();
      return s === 'completed' || s === 'resolved';
    }).length,
    inProgress: tasks.filter(t => {
      const s = String(t.status || '').toLowerCase();
      return s === 'in_progress' || s === 'in progress' || s === 'work in progress' || s === 'review';
    }).length,
    pending: tasks.filter(t => {
      const s = String(t.status || '').toLowerCase();
      return s === 'pending' || s === 'active';
    }).length,
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Employee', path: '/employee-dashboard' },
    { label: activeTab }
  ];

  const statsBarData = [
    { label: 'Tasks Completed', value: `${taskStats.completed}`, percentage: `${taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%`, color: 'bg-green-500' },
    { label: 'In Progress', value: `${taskStats.inProgress}`, percentage: '50%', color: 'bg-blue-500' },
    { label: 'Pending', value: `${taskStats.pending}`, percentage: '30%', color: 'bg-yellow-500' },
    { label: 'On Time Rate', value: '95%', percentage: '95%', color: 'bg-purple-500' },
    { label: 'Rating', value: '4.5/5', percentage: '90%', color: 'bg-teal-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'My Tasks':
        return <TaskTab />;
      case 'Onboarding':
        return <OnboardingTab />;
      case 'Announcements':
        return <AnnouncementsTab department={userInfo.department || 'All'} isHead={false} />;
      case 'Attendance':
      case 'Leave Requests':
      case 'Performance':
      case 'Documents':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{activeTab}</h2>
            <p className="text-gray-500">This section is coming soon.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
              <div className="relative z-10">
                <h1 className="text-2xl lg:text-3xl font-bold">Good Morning, {userInfo.name} 👋</h1>
                <p className="mt-1 text-white/80">Here's your work summary for today</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Tasks"
                value={loading ? '...' : taskStats.total}
                change="+3"
                changeType="increase"
                icon={FiCheckSquare}
                color="blue"
                sparklineData={[5, 8, 6, 10, 9, 12, 11]}
              />
              <StatCard
                title="Completed"
                value={loading ? '...' : taskStats.completed}
                change="+2"
                changeType="increase"
                icon={FiTarget}
                color="green"
                sparklineData={[3, 5, 4, 7, 6, 8, 9]}
              />
              <StatCard
                title="In Progress"
                value={loading ? '...' : taskStats.inProgress}
                change="0"
                changeType="increase"
                icon={FiClock}
                color="yellow"
                sparklineData={[2, 3, 2, 4, 3, 3, 2]}
              />
              <StatCard
                title="Performance"
                value="95%"
                change="+5%"
                changeType="increase"
                icon={FiTrendingUp}
                color="purple"
                sparklineData={[80, 85, 82, 88, 90, 92, 95]}
              />
            </div>

            {/* Stats Bar */}
            <StatsBar stats={statsBarData} />

            {/* Grid Layout for Tasks & Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task List */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden h-fit">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">My Tasks</h3>
                  <button 
                    onClick={() => setActiveTab('My Tasks')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-500">{error}</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {tasks.slice(0, 5).map((task, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            (() => {
                              const s = String(task.status || '').toLowerCase();
                              if (s === 'completed' || s === 'resolved') return 'bg-green-100 text-green-600';
                              if (s === 'in_progress' || s === 'in progress' || s === 'work in progress' || s === 'review') return 'bg-blue-100 text-blue-600';
                              return 'bg-yellow-100 text-yellow-600';
                            })()
                          }`}>
                            <FiCheckSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{task.title || 'Untitled Task'}</p>
                            <p className="text-xs text-gray-500">{task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No deadline'}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          (() => {
                            const s = String(task.status || '').toLowerCase();
                            if (s === 'completed' || s === 'resolved') return 'bg-green-100 text-green-700';
                            if (s === 'in_progress' || s === 'in progress' || s === 'work in progress' || s === 'review') return 'bg-blue-100 text-blue-700';
                            return 'bg-yellow-100 text-yellow-700';
                          })()
                        }`}>
                          {task.status?.replace('_', ' ') || 'Pending'}
                        </span>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <FiCheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No tasks assigned yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Announcements Widget */}
              <div className="lg:col-span-1">
                <AnnouncementsWidget department={userInfo.department || 'All'} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout
      sidebarItems={sidebarConfig}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dashboardTitle="Employee Dashboard"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={notifications}
      isLoading={loading}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default EmployeeDashboardNew;
