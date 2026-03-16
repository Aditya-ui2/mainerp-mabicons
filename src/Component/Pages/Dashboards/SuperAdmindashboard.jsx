import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import CustomersTab from './Tabs/CustomersTab';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import AdminTab from './Tabs/AdminTab';
import BdTab from './Tabs/BdTab';
import { createAdmin, createBDExecutive } from '../service/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const summaryCards = [
  {
    name: 'Total Customers',
    icon: FiUsers,
    value: '1,248',
    change: '↑ 12% this month',
    changeColor: 'text-green-600',
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
  {
    name: 'Revenue',
    icon: FiDollarSign,
    value: '$5,320',
    change: '↑ 8.5% this month',
    changeColor: 'text-green-600',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    name: 'Active Projects',
    icon: FiFolder,
    value: '5',
    change: '↑ 2 this week',
    changeColor: 'text-amber-600',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    name: 'Team Members',
    icon: FiUserPlus,
    value: '12',
    change: '↑ 3 this week',
    changeColor: 'text-indigo-600',
    iconBg: 'bg-violet-100 text-violet-600',
  },
];

const sidebarItems = [
  { name: 'Dashboard', tab: 'Dashboard', icon: FiHome },
  { name: 'Customers', tab: 'Customers', icon: FiUsers },
  { name: 'Team', tab: 'Team', icon: FiUserPlus },
  { name: 'Reports', tab: 'Reports', icon: FiBarChart2, showDot: true },
  { name: 'Projects', tab: 'Business Development', icon: FiBriefcase },
  { name: 'Settings', tab: 'Manage Admins', icon: FiSettings },
];

const recentActivities = [
  { title: 'John Doe', detail: 'was added as a new customer', time: '3 hours ago', color: 'bg-green-500', iconEl: '+' },
  { title: 'New project ·\u200bWebsite Redesign', detail: 'created', time: '2 hours ago', color: 'bg-amber-500', iconEl: '📁' },
  { title: 'Task', detail: '"Follow up with Tesla" completed', time: '3 hours ago', color: 'bg-cyan-500', iconEl: '✓' },
  { title: 'Invoice #0256', detail: 'was generated', time: '5 hours ago', color: 'bg-indigo-500', iconEl: '📄' },
  { title: 'Emma Smith', detail: 'changed her status to Lead', time: '1 day ago', color: 'bg-yellow-400', iconEl: '↗' },
];

const customerRows = [
  { name: 'John Doe', sub: 'Te a 0', company: 'Tesla', companyIcon: '📍', status: 'Converted', avatar: 'JD', avatarGrad: 'from-violet-400 to-indigo-500' },
  { name: 'Emma Smith', sub: 'Hopee', company: 'Apple', companyIcon: '🍎', status: 'Lead', avatar: 'ES', avatarGrad: 'from-pink-400 to-rose-500' },
  { name: 'Alex Johnson', sub: 'Serogi', company: 'Google', companyIcon: '🔴', status: 'Active', avatar: 'AJ', avatarGrad: 'from-cyan-400 to-blue-500' },
  { name: 'Sarah Williams', sub: 'W 1no:1301', company: 'Microsoft', companyIcon: '🪟', status: 'Lead', avatar: 'SW', avatarGrad: 'from-blue-400 to-indigo-500' },
];

const compactCustomers = [
  { name: 'John Doe', sub: 'Ta Lh', status: 'Converted', avatar: 'JD', avatarGrad: 'from-violet-400 to-indigo-500' },
  { name: 'Emma Smith', sub: 'Seip or', status: 'Lead', avatar: 'ES', avatarGrad: 'from-pink-400 to-rose-500' },
  { name: 'Alex Johnson', sub: 'lyopee', status: 'Active', avatar: 'AJ', avatarGrad: 'from-cyan-400 to-blue-500' },
];

const statusBadge = {
  Converted: 'bg-emerald-100 text-emerald-700',
  Lead: 'bg-amber-100 text-amber-700',
  Active: 'bg-green-100 text-green-700',
};

const Dashboard = () => {
  const [chartRange, setChartRange] = useState('Monthly');
  const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [isCreateBDModalOpen, setIsCreateBDModalOpen] = useState(false);
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
                  <h1 className="text-3xl font-bold leading-tight">Welcome back, Abhinav 👋</h1>
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
              {summaryCards.map((card) => (
                <div key={card.name} className="bg-white rounded-2xl p-5 shadow-[0_14px_30px_rgba(99,102,241,0.08)] border border-slate-100/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">{card.name}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>
                    <span className={`h-12 w-12 rounded-full flex items-center justify-center ${card.iconBg}`}>
                      <card.icon className="text-xl" />
                    </span>
                  </div>
                  <p className={`mt-3 text-sm font-semibold ${card.changeColor}`}>{card.change}</p>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[31px] leading-none font-semibold text-slate-800">Sales Overview</h3>
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
                    <button className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                      View All
                      <FiChevronRight />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <tbody>
                        {customerRows.map((customer) => (
                          <tr key={customer.name} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${customer.avatarGrad} text-white flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
                                  {customer.avatar}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm leading-tight">{customer.name}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">{customer.sub}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="text-base leading-none">{customer.companyIcon}</span>
                                <span className="text-slate-600 text-sm">{customer.company}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${statusBadge[customer.status]}`}>
                                {customer.status}
                              </span>
                            </td>
                            <td className="py-3 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  customer.status === 'Converted' ? 'bg-emerald-500' :
                                  customer.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'
                                }`} />
                                <span className="text-xs text-slate-500">{customer.status}</span>
                              </div>
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
                    <h3 className="text-[34px] leading-none font-semibold text-slate-800">Recent Activity</h3>
                    <FiMoreHorizontal className="text-slate-400" />
                  </div>
                  <ul className="space-y-4">
                    {recentActivities.map((activity) => (
                      <li key={`${activity.title}-${activity.time}`} className="flex items-start gap-3">
                        <span className={`h-8 w-8 rounded-full ${activity.color} text-white text-sm flex items-center justify-center mt-0.5 flex-shrink-0`}>
                          {activity.iconEl}
                        </span>
                        <div>
                          <p className="text-slate-700 text-sm">
                            <span className="font-semibold">{activity.title}</span>{' '}{activity.detail}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
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
                    {compactCustomers.map((customer) => (
                      <div key={customer.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${customer.avatarGrad} text-white flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
                            {customer.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm leading-tight">{customer.name}</p>
                            <p className="text-xs text-slate-400">{customer.sub}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[customer.status]}`}>
                          {customer.status}
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
              <button
                onClick={() => setIsCreateBDModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <FiUserPlus className="h-5 w-5" />
                Add BD Executive
              </button>
            </div>
            <BdTab />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4fb] p-2 md:p-3">
      <div className="flex rounded-2xl overflow-hidden border border-slate-200/80 bg-[#f7f8fc] min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-1.5rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-[#f8f8fd] border-r border-slate-200 h-auto flex flex-col shrink-0">
          <div className="p-6">
            <h1 className="text-[37px] font-bold text-slate-800 flex items-center gap-3 leading-none">
              <span className="h-8 w-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
                <FiHome className="text-sm" />
              </span>
              CRM Pro
            </h1>
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
          <div className="sticky top-0 z-20 mb-6">
            <div className="bg-[#f7f8fc] rounded-2xl p-2 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-3xl">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f0f1f7] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <button className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600">
                    <FiBell />
                  </button>
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <button className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600">
                  <FiSettings />
                </button>
                <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1 border border-slate-200">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    RC
                  </div>
                  <span className="text-xs text-slate-500 font-semibold pr-1">RC</span>
                </div>
              </div>
            </div>
          </div>

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
