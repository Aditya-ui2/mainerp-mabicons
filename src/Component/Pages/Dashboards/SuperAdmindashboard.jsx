import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiSearch,
  FiBell,
  FiUserPlus,
  FiFolder,
  FiBarChart2,
  FiBriefcase,
  FiChevronRight,
  FiMoreHorizontal,
  FiDollarSign,
  FiLogOut,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import CustomersTab from './Tabs/CustomersTab';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import AdminTab from './Tabs/AdminTab';
import BdTab from './Tabs/BdTab';
import SettingsTab from './Tabs/SettingsTab';
import TeamMISReportsTab from './Tabs/Common/TeamMISReportsTab';
import { createAdmin, createBDExecutive, getAllClients, getAllTasks, getAllNotifications, markNotificationRead, markAllNotificationsRead, logout } from '../service/api';
import { validatePhone } from '../../Utilities/validationUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Summary cards template - values will be populated from API
const summaryCardsTemplate = [
  {
    name: 'Total Employees',
    icon: FiUserPlus,
    key: 'totalEmployees',
    changeColor: 'text-green-600',
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
  {
    name: 'Total Clients',
    icon: FiUsers,
    key: 'totalClients',
    changeColor: 'text-amber-600',
    iconBg: 'bg-amber-100 text-amber-600',
  },
];

const sidebarItems = [
  { name: 'Dashboard', tab: 'Dashboard', icon: FiHome },
  { name: 'Clients', tab: 'Customers', icon: FiUsers },
  { name: 'Employee Work', tab: 'Reports', icon: FiBarChart2 },
  { name: 'MIS Reports', tab: 'MIS Reports', icon: FiFolder },
  { name: 'Add Admin', tab: 'Manage Admins', icon: FiUserPlus },
];

// Status badge styles
const avatarGradients = [
  'from-violet-400 to-indigo-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-blue-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
];

const getAvatarGradient = (index) => avatarGradients[index % avatarGradients.length];
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';

const statusBadge = {
  Converted: 'bg-emerald-100 text-emerald-700',
  Lead: 'bg-amber-100 text-amber-700',
  Active: 'bg-green-100 text-green-700',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState('Monthly');
  const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [isCreateBDModalOpen, setIsCreateBDModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  
  // API Data States
  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalEmployees: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');
  
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const [newBDData, setNewBDData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    targetRevenue: '',
    targetLeads: ''
  });
  const [createAdminError, setCreateAdminError] = useState(null);
  const [createAdminSuccess, setCreateAdminSuccess] = useState(false);
  const [createBDError, setCreateBDError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch customers
        const customersRes = await getAllClients();
        const customersData = customersRes.clients || customersRes || [];
        setCustomers(customersData);
        
        // Fetch tasks
        const tasksRes = await getAllTasks();
        const tasksData = tasksRes.tasks || tasksRes || [];
        setTasks(tasksData);
        
        // Fetch notifications
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            const notificationsRes = await getAllNotifications(userId);
            setNotifications(notificationsRes?.data || []);
          } catch (err) {
            console.log('No notifications found');
            setNotifications([]);
          }
        }
        
        // Calculate summary data
        // Count employees from tasks assignees or team data
        const employeeCount = tasksData.reduce((acc, task) => {
          if (task.assignedUserId && !acc.includes(task.assignedUserId)) {
            acc.push(task.assignedUserId);
          }
          return acc;
        }, []).length;
        
        setSummaryData({
          totalEmployees: employeeCount || 0,
          totalClients: customersData.length,
        });
        
        // Get user name from token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            setUserName(decoded.name || decoded.email?.split('@')[0] || 'Admin');
          } catch (e) {
            setUserName('Admin');
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('department');
    localStorage.removeItem('recruitmentTabAuth');
    window.location.href = '/login';
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        await markAllNotificationsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    }
  };

  const unreadCount = notifications.filter(n => n.status !== 'read' && !n.isRead && !n.read).length;

  const chartRangeData = {
    Monthly: {
      labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
      data: [7000, 11000, 10800, 11200, 13200, 17000, 18200, 25000],
    },
    Weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [4800, 6200, 5900, 7400],
    },
    Daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [850, 940, 790, 1020, 1180, 680, 760],
    },
  };

  const selectedChartRange = chartRangeData[chartRange];

  const chartData = {
    labels: selectedChartRange.labels,
    datasets: [
      {
        label: 'Revenue',
        data: selectedChartRange.data,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#8B5CF6',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
      },
    },
    scales: {
      x: {
        grid: {
          color: '#F1F5F9',
        },
        ticks: { color: '#6B7280' },
      },
      y: {
        grid: {
          color: '#EEF2FF',
        },
        ticks: { color: '#6B7280' },
      },
    },
  };

  const handleTabChange = (sidebarName, tabName) => {
    setActiveSidebarItem(sidebarName);
    setActiveTab(tabName);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateAdminError(null);
    setCreateAdminSuccess(false);

    try {
      await createAdmin(newAdminData);
      setCreateAdminSuccess(true);
      setNewAdminData({ name: '', email: '', password: '', role: '' });
      setTimeout(() => {
        setIsCreateAdminModalOpen(false);
        setCreateAdminSuccess(false);
      }, 2000);
    } catch (error) {
      setCreateAdminError(error.message);
    }
  };

  const handleCreateBDExecutive = async (e) => {
    e.preventDefault();
    setCreateBDError(null);

    if (!validatePhone(newBDData.phone)) {
      setCreateBDError("Phone number must be exactly 10 digits");
      return;
    }

    try {
      await createBDExecutive(newBDData);
      setIsCreateBDModalOpen(false);
      setNewBDData({
        name: '',
        email: '',
        password: '',
        phone: '',
        targetRevenue: '',
        targetLeads: ''
      });
    } catch (error) {
      setCreateBDError(error.message || 'Failed to create BD executive');
    }
  };

  const handleBDInputChange = (e) => {
    const { name, value } = e.target;
    setNewBDData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="space-y-6">
            <section className="rounded-[28px] px-6 md:px-8 py-7 text-white bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-400 relative overflow-hidden">
              <div className="absolute right-24 -top-16 h-48 w-48 rounded-full bg-white/15" />
              <div className="absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-white/15" />
              <div className="absolute left-1/2 top-8 h-36 w-72 -translate-x-1/2 rounded-[999px] bg-white/10 blur-sm" />
              <div className="flex items-center justify-between gap-4 relative z-10">
                <div>
                  <h1 className="text-3xl font-bold leading-tight">Welcome back, {userName} 👋</h1>
                  <p className="mt-1 text-indigo-100 text-sm">Here&apos;s your business performance today</p>
                </div>  
                <div className="rounded-2xl bg-white/20 backdrop-blur-sm px-3 py-2 flex items-center gap-4">
                  {['Monthly', 'Weekly', 'Daily'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className="flex items-center gap-2 text-sm transition"
                    >
                      <span className={`h-3.5 w-3.5 rounded-full border ${chartRange === range ? 'bg-indigo-600 border-indigo-500' : 'bg-violet-200/80 border-violet-200/80'}`} />
                      <span className={chartRange === range ? 'font-semibold text-white' : 'text-white/80'}>{range}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 -mt-10 relative z-10 px-1">
              {summaryCardsTemplate.map((card) => (
                <div key={card.name} className="bg-white rounded-2xl p-5 shadow-[0_14px_30px_rgba(99,102,241,0.08)] border border-slate-100/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">{card.name}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : summaryData[card.key]}</p>
                    </div>
                    <span className={`h-12 w-12 rounded-full flex items-center justify-center ${card.iconBg}`}>
                      <card.icon className="text-xl" />
                    </span>
                  </div>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[31px] leading-none font-semibold text-slate-800">Tasks Overview</h3>
                    <div className="flex items-center gap-2 text-sm">
                      {['Monthly', 'Weekly', 'Daily'].map((period) => (
                        <button
                          key={period}
                          onClick={() => setChartRange(period)}
                          className={`px-3 py-1 rounded-full transition ${
                            chartRange === period ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[280px]">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[31px] leading-none font-semibold text-slate-800">Recent Customers</h3>
                    <button onClick={() => handleTabChange('Customers', 'Customers')} className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                      View All
                      <FiChevronRight />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={4} className="text-center py-8 text-slate-500">Loading...</td></tr>
                        ) : customers.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-8 text-slate-500">No customers found</td></tr>
                        ) : customers.slice(0, 4).map((customer, index) => (
                          <tr key={customer._id || index} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarGradient(index)} text-white flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
                                  {getInitials(customer.name)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm leading-tight">{customer.name}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">{customer.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-slate-600 text-sm">{customer.companyName || 'N/A'}</span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${customer.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {customer.isVerified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-3 text-right text-slate-400">
                              <FiChevronRight className="inline" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[34px] leading-none font-semibold text-slate-800">Recent Tasks</h3>
                    <FiMoreHorizontal className="text-slate-400" />
                  </div>
                  <ul className="space-y-4">
                    {loading ? (
                      <li className="text-center py-4 text-slate-500">Loading...</li>
                    ) : tasks.length === 0 ? (
                      <li className="text-center py-4 text-slate-500">No tasks found</li>
                    ) : tasks.slice(0, 5).map((task, index) => (
                      <li key={task._id || index} className="flex items-start gap-3">
                        <span className={`h-8 w-8 rounded-full ${
                          task.status === 'Completed' || task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'In Progress' || task.status === 'active' ? 'bg-amber-500' : 'bg-cyan-500'
                        } text-white text-sm flex items-center justify-center mt-0.5 flex-shrink-0`}>
                          {task.status === 'Completed' || task.status === 'completed' ? '✓' : '📋'}
                        </span>
                        <div>
                          <p className="text-slate-700 text-sm">
                            <span className="font-semibold">{task.title}</span>{' '}<span className="text-slate-500">- {task.status}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[34px] leading-none font-semibold text-slate-800">Recent Customers</h3>
                    <FiMoreHorizontal className="text-slate-400" />
                  </div>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-4 text-slate-500">Loading...</div>
                    ) : customers.length === 0 ? (
                      <div className="text-center py-4 text-slate-500">No customers found</div>
                    ) : customers.slice(0, 3).map((customer, index) => (
                      <div key={customer._id || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(index)} text-white flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
                            {getInitials(customer.name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm leading-tight">{customer.name}</p>
                            <p className="text-xs text-slate-400">{customer.companyName || customer.email}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${customer.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {customer.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      case 'Customers':
        return <CustomersTab isDarkMode={false} />;
      case 'Team':
        return <TeamTabs isDarkMode={false} />;
      case 'Reports':
        return <TaskTab isDarkMode={false} />;
      case 'Manage Admins':
        return <AdminTab isDarkMode={false} />;
      case 'Business Development':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Business Development</h2>
              {(localStorage.getItem('userType') === 'superadmin' || localStorage.getItem('userEmail') === 'ashwin.mabicons@gmail.com') && (
                <button
                  onClick={() => setIsCreateBDModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <FiUserPlus className="h-5 w-5" />
                  Add BD Executive
                </button>
              )}
            </div>
            <BdTab />
          </div>
        );
      case 'MIS Reports':
        return <TeamMISReportsTab />;
      case 'Settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4fb] p-2 md:p-3">
      <div className="flex rounded-2xl overflow-hidden border border-slate-200/80 bg-[#f7f8fc] min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-1.5rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-[#f8f8fd] border-r border-slate-200 h-auto flex flex-col shrink-0">
          <div className="flex items-center h-16 border-b border-slate-200 bg-white px-4">
            <img src="/src/assets/images/mabicons logo blue.png" alt="Mabicons" className="h-8 w-auto object-contain" />
          </div>
          <nav className="mt-2 px-3 space-y-1.5 flex-1">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleTabChange(item.name, item.tab)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  activeSidebarItem === item.name
                    ? 'bg-indigo-100/80 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-700'
                }`}
              >
                <span className="flex items-center gap-3 font-medium text-[20px] leading-none">
                  <item.icon className={`text-lg ${activeSidebarItem === item.name ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {item.name}
                </span>
                {item.showDot && <span className={`h-2 w-2 rounded-full ${activeSidebarItem === item.name ? 'bg-indigo-400' : 'bg-slate-400'}`} />}
                {!item.showDot && item.name === 'Settings' && <FiChevronRight className="text-sm text-slate-400" />}
              </button>
            ))}
          </nav>
          <div className="px-3 py-4">
            <button className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-sm">
              <FiChevronRight className="rotate-180 text-base" />
              <FiChevronRight className="-ml-3 text-base" />
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-5 md:p-6">
          {/* Sticky Top bar */}


          {/* Dashboard content */}
          {renderContent()}
        </main>
      </div>

      {/* Create Admin Modal */}
      {isCreateAdminModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create New Admin</h2>
              <button
                onClick={() => setIsCreateAdminModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 rounded border bg-white border-gray-300"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 rounded border bg-white border-gray-300"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-2 rounded border bg-white border-gray-300"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Role
                </label>
                <select
                  value={newAdminData.role}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-2 rounded border bg-white border-gray-300"
                  required
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {createAdminError && (
                <div className="text-red-500 text-sm mt-2">
                  {createAdminError}
                </div>
              )}

              {createAdminSuccess && (
                <div className="text-green-500 text-sm mt-2">
                  Admin created successfully!
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create BD Executive Modal */}
      <AnimatePresence>
        {isCreateBDModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4">Create BD Executive</h2>
              <form onSubmit={handleCreateBDExecutive} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newBDData.name}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newBDData.email}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={newBDData.password}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newBDData.phone}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Revenue</label>
                  <input
                    type="number"
                    name="targetRevenue"
                    value={newBDData.targetRevenue}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Leads</label>
                  <input
                    type="number"
                    name="targetLeads"
                    value={newBDData.targetLeads}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {createBDError && (
                  <p className="text-red-500 text-sm mt-2">{createBDError}</p>
                )}

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateBDModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create BD Executive
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
