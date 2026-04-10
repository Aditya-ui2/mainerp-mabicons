import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  FiUsers,
  FiUserPlus,
  FiCheckSquare,
  FiBriefcase,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiTarget,
  FiActivity,
  FiSettings,
  FiPieChart,
} from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import CustomersTab from './Tabs/CustomersTab';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import OnboardingTab from './Tabs/OnboardingTab';
import SettingsTab from './Tabs/SettingsTab';
import { getAllClients, getAllTasks, getAdminHierarchy } from '../service/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// Sidebar menu configuration
const sidebarConfig = [
  {
    heading: 'MAIN',
    items: [
      {
        id: 'mgmt',
        title: 'MANAGEMENT',
        icon: FiBriefcase,
        submenu: [
          { id: 1, title: 'Clients' },
          { id: 2, title: 'Team' },
          { id: 3, title: 'Tasks' },
          { id: 4, title: 'Onboarding' },
        ]
      },
      {
        id: 'analytics',
        title: 'ANALYTICS',
        icon: FiPieChart,
        submenu: [
          { id: 5, title: 'Reports' },
          { id: 6, title: 'Performance' },
        ]
      },
    ]
  },
  {
    heading: 'OTHERS',
    items: [
      { id: 7, title: 'Settings', icon: FiSettings },
    ]
  }
];

const AdminDashboardNew = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [chartRange, setChartRange] = useState('Month');
  
  // Data States
  const [stats, setStats] = useState({
    totalClients: 0,
    teamMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: 'Admin', role: 'Administrator' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);
        const adminId = decoded?.id;
        
        setUserInfo({
          name: decoded.name || decoded.email?.split('@')[0] || 'Admin',
          role: 'Administrator'
        });

        if (!adminId) return;

        const [tasksResponse, clientsResponse, hierarchyResponse] = await Promise.all([
          getAllTasks(),
          getAllClients(),
          getAdminHierarchy(adminId, 'Admin'),
        ]);

        const tasks = tasksResponse?.tasks || [];
        const teamLeaders = hierarchyResponse?.adminHierarchy?.teamLeaders || [];
        const employees = teamLeaders.reduce(
          (sum, teamLeader) => sum + (teamLeader?.employees?.length || 0),
          0
        );

        setStats({
          totalClients: clientsResponse?.data?.clients?.length || 0,
          teamMembers: teamLeaders.length + employees,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
        });
        
        setRecentTasks(tasks.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart data
  const taskChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Created',
        data: [12, 19, 8, 15, 12, 8, 10],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Tasks Completed',
        data: [8, 15, 6, 12, 10, 5, 8],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 6,
      }
    ]
  };

  const performanceData = {
    labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
    datasets: [{
      data: [stats.completedTasks || 45, 25, 20, 10],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      borderWidth: 0,
    }]
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Admin', path: '/admin-dashboard' },
    { label: activeTab }
  ];

  const statsBarData = [
    { label: 'Active Clients', value: stats.totalClients || '0', percentage: '85%', color: 'bg-blue-500' },
    { label: 'Team Size', value: stats.teamMembers || '0', percentage: '60%', color: 'bg-purple-500' },
    { label: 'Open Tasks', value: stats.totalTasks - stats.completedTasks || '0', percentage: '45%', color: 'bg-yellow-500' },
    { label: 'Completion Rate', value: `${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`, percentage: `${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`, color: 'bg-green-500' },
    { label: 'Onboarded', value: '12', percentage: '75%', color: 'bg-teal-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Clients':
        return <CustomersTab />;
      case 'Team':
        return <TeamTabs />;
      case 'Tasks':
        return <TaskTab />;
      case 'Onboarding':
        return <OnboardingTab />;
      case 'Settings':
        return <SettingsTab />;
      case 'Reports':
      case 'Performance':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{activeTab}</h2>
            <p className="text-gray-500">Detailed {activeTab.toLowerCase()} will be displayed here.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-700 to-slate-700 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
              <div className="relative z-10">
                <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {userInfo.name} 👋</h1>
                <p className="mt-1 text-white/80">Manage your team and tasks efficiently</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Clients"
                value={loading ? '...' : stats.totalClients}
                change="+12%"
                changeType="increase"
                icon={FiUsers}
                color="blue"
                sparklineData={[20, 35, 25, 40, 35, 50, 45]}
              />
              <StatCard
                title="Team Members"
                value={loading ? '...' : stats.teamMembers}
                change="+5%"
                changeType="increase"
                icon={FiUserPlus}
                color="purple"
                sparklineData={[15, 25, 20, 30, 25, 35, 40]}
              />
              <StatCard
                title="Total Tasks"
                value={loading ? '...' : stats.totalTasks}
                change="+18%"
                changeType="increase"
                icon={FiCheckSquare}
                color="teal"
                sparklineData={[30, 45, 35, 50, 40, 55, 60]}
              />
              <StatCard
                title="Completed"
                value={loading ? '...' : stats.completedTasks}
                change="+24%"
                changeType="increase"
                icon={FiTarget}
                color="green"
                sparklineData={[25, 35, 30, 45, 40, 50, 55]}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Analytics Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Task Analytics</h3>
                    <p className="text-sm text-gray-500">Weekly task overview</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {['Day', 'Week', 'Month'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setChartRange(range)}
                        className={`px-3 py-1.5 text-sm rounded-md transition ${
                          chartRange === range 
                            ? 'bg-white shadow-sm text-gray-900 font-medium' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-72">
                  <Bar 
                    data={taskChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: { usePointStyle: true, boxWidth: 6 }
                        }
                      },
                      scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } }
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Performance Donut */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status</h3>
                <div className="h-56">
                  <Doughnut 
                    data={performanceData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      cutout: '70%',
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { usePointStyle: true, boxWidth: 6, padding: 15 }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <StatsBar stats={statsBarData} />

            {/* Recent Tasks Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Tasks</h3>
                <button 
                  onClick={() => setActiveTab('Tasks')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Task</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Assignee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentTasks.length > 0 ? recentTasks.map((task, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{task.title || 'Untitled Task'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-slate-700 flex items-center justify-center text-white text-xs font-medium">
                              {task.assignee?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm text-gray-600">{task.assignee || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-700' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {task.status?.replace('_', ' ') || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          No tasks found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
      dashboardTitle="Admin Dashboard"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={[]}
      isLoading={loading}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboardNew;
