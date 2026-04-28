import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiUserPlus,
  FiBarChart2,
  FiBriefcase,
  FiTrendingUp,
  FiDollarSign,
  FiTarget,
  FiActivity,
  FiPieChart,
  FiShield,
  FiDatabase,
} from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import AdminLayout, { StatCard, StatsBar, DataTable } from './AdminLayout';
import CustomersTab from './Tabs/CustomersTab';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import AdminTab from './Tabs/AdminTab';
import BdTab from './Tabs/BdTab';
import SettingsTab from './Tabs/SettingsTab';
import { createAdmin, createBDExecutive, getAllClients, getAllTasks, getAllNotifications, logout } from '../service/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

// Sidebar menu configuration
const sidebarConfig = [
  {
    heading: 'ADMIN',
    items: [
      { id: 1, title: 'User Management', icon: FiUsers, submenu: [
        { id: 11, title: 'Clients' },
        { id: 12, title: 'Employees' },
        { id: 13, title: 'Team Leaders' },
      ]},
      { id: 2, title: 'Task Management', icon: FiBarChart2 },
      { id: 3, title: 'Admin Management', icon: FiShield, submenu: [
        { id: 31, title: 'Manage Admins' },
        { id: 32, title: 'Manage BD' },
      ]},
      { id: 4, title: 'Reports', icon: FiPieChart },
    ]
  },
  {
    heading: 'SETTINGS',
    items: [
      { id: 5, title: 'Settings', icon: FiSettings },
      { id: 6, title: 'Database', icon: FiDatabase },
    ]
  }
];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('superadmin_active_tab') || 'Dashboard');

  useEffect(() => {
    localStorage.setItem('superadmin_active_tab', activeTab);
  }, [activeTab]);
  const [chartRange, setChartRange] = useState('Month');
  
  // Data States
  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalEmployees: 0,
    totalClients: 0,
    totalTasks: 0,
    totalRevenue: 0,
  });
  const [userInfo, setUserInfo] = useState({ name: 'Manager', role: 'Manager' });

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const customersRes = await getAllClients();
        const customersData = customersRes.clients || customersRes || [];
        setCustomers(customersData);
        
        const tasksRes = await getAllTasks();
        const tasksData = tasksRes.tasks || tasksRes || [];
        setTasks(tasksData);
        
        const employeeCount = tasksData.reduce((acc, task) => {
          if (task.assignedUserId && !acc.includes(task.assignedUserId)) {
            acc.push(task.assignedUserId);
          }
          return acc;
        }, []).length;
        
        setSummaryData({
          totalEmployees: employeeCount || 24,
          totalClients: customersData.length || 156,
          totalTasks: tasksData.length || 89,
          totalRevenue: '₹12.5L',
        });
        
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            setUserInfo({
              name: decoded.name || decoded.email?.split('@')[0] || 'Manager',
              role: 'Manager'
            });
          } catch (e) {
            console.log('Token decode error');
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Chart data
  const trafficData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue',
        data: [65, 78, 90, 81, 106, 125, 140],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Tasks',
        data: [50, 60, 75, 72, 85, 95, 110],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, boxWidth: 6 }
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: '#f1f5f9' }
      },
      x: { 
        grid: { display: false }
      }
    }
  };

  const doughnutData = {
    labels: ['Completed', 'In Progress', 'Pending', 'On Hold'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      borderWidth: 0,
    }]
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/manager-dashboard' },
    { label: activeTab }
  ];

  const statsBarData = [
    { label: 'Active Users', value: '2,847', percentage: '75%', color: 'bg-green-500' },
    { label: 'New Clients', value: '156', percentage: '40%', color: 'bg-blue-500' },
    { label: 'Task Completion', value: '89%', percentage: '89%', color: 'bg-yellow-500' },
    { label: 'Revenue Growth', value: '+24.5%', percentage: '60%', color: 'bg-purple-500' },
    { label: 'Avg Response', value: '2.4h', percentage: '85%', color: 'bg-teal-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Clients':
        return <CustomersTab />;
      case 'Employees':
      case 'Team Leaders':
        return <TeamTabs />;
      case 'Task Management':
        return <TaskTab />;
      case 'Manage Admins':
        return <AdminTab />;
      case 'Manage BD':
        return <BdTab />;
      case 'Settings':
        return <SettingsTab />;
      case 'Reports':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports & Analytics</h2>
            <p className="text-gray-500">Detailed reports will be displayed here.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
              <div className="relative z-10">
                <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {userInfo.name} 👋</h1>
                <p className="mt-1 text-white/80">Here's what's happening with your business today</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={loading ? '...' : `${summaryData.totalEmployees}`}
                change="-12.4%"
                changeType="decrease"
                icon={FiUsers}
                color="blue"
                sparklineData={[30, 45, 32, 50, 40, 60, 45]}
              />
              <StatCard
                title="Total Revenue"
                value={summaryData.totalRevenue}
                change="40.9%"
                changeType="increase"
                icon={FiDollarSign}
                color="teal"
                sparklineData={[20, 35, 45, 30, 55, 65, 75]}
              />
              <StatCard
                title="Conversion Rate"
                value="2.49%"
                change="84.7%"
                changeType="increase"
                icon={FiTarget}
                color="yellow"
                sparklineData={[10, 20, 15, 25, 30, 28, 35]}
              />
              <StatCard
                title="Active Sessions"
                value={loading ? '...' : `${summaryData.totalClients}`}
                change="-23.6%"
                changeType="decrease"
                icon={FiActivity}
                color="pink"
                sparklineData={[50, 45, 60, 40, 55, 35, 45]}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Traffic Overview</h3>
                    <p className="text-sm text-gray-500">January - July 2026</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {['Day', 'Month', 'Year'].map((range) => (
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
                  <Line data={trafficData} options={chartOptions} />
                </div>
              </div>

              {/* Donut Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status</h3>
                <div className="h-56">
                  <Doughnut 
                    data={doughnutData} 
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

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Clients</h3>
                <button 
                  onClick={() => setActiveTab('Clients')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.slice(0, 5).map((customer, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                              {customer.name?.charAt(0) || 'C'}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{customer.name || 'Client'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{customer.email || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            customer.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {customer.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Recently'}
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          No clients found
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
      dashboardTitle="Manager Dashboard"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={notifications}
      isLoading={loading}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
