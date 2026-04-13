import { useEffect, useMemo, useState } from 'react';
import {
  FiHome,
  FiUsers,
  FiUserPlus,
  FiCheckSquare,
  FiBriefcase,
  FiSearch,
  FiBell,
  FiMoon,
  FiSettings,
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

import logo from '../../../assets/images/ERP LOGO.png';
import CustomersTab from './Tabs/CustomersTab';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import OnboardingTab from './Tabs/OnboardingTab';
import { getAllClients, getAllTasks, getAdminHierarchy } from '../service/api';

const sidebarItems = [
  { name: 'Dashboard', icon: FiHome },
  { name: 'Clients', icon: FiUsers },
  { name: 'Team', icon: FiUserPlus },
  { name: 'Tasks', icon: FiCheckSquare },
  { name: 'Onboarding', icon: FiBriefcase },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    teamMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);

  const modules = useMemo(
    () => [
      {
        name: 'Total Clients',
        value: stats.totalClients,
        icon: FiUsers,
        cardClass: 'from-blue-50 to-slate-100',
        iconBg: 'bg-blue-200/70 text-blue-800',
      },
      {
        name: 'Team Members',
        value: stats.teamMembers,
        icon: FiUserPlus,
        cardClass: 'from-purple-50 to-slate-100',
        iconBg: 'bg-purple-200/70 text-purple-800',
      },
      {
        name: 'Total Tasks',
        value: stats.totalTasks,
        icon: FiBriefcase,
        cardClass: 'from-emerald-50 to-slate-100',
        iconBg: 'bg-emerald-200/70 text-emerald-800',
      },
      {
        name: 'Tasks Completed',
        value: stats.completedTasks,
        icon: FiCheckSquare,
        cardClass: 'from-amber-50 to-slate-100',
        iconBg: 'bg-amber-200/70 text-amber-800',
      },
    ],
    [stats]
  );

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decoded = jwtDecode(token);
      const adminId = decoded?.id;
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
        completedTasks: tasks.filter(
          (task) => task.status === 'Resolved' || task.status === 'Completed'
        ).length,
      });

      const sortedTasks = [...tasks].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentTasks(sortedTasks.slice(0, 3));
    } catch {
      setStats({ totalClients: 0, teamMembers: 0, totalTasks: 0, completedTasks: 0 });
      setRecentTasks([]);
    }
  };

  useEffect(() => {
    if (activeTab !== 'Dashboard') return;
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(timer);
  }, [activeTab]);

  const renderDashboard = () => (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {modules.map((module) => (
          <div
            key={module.name}
            className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${module.cardClass} p-5 shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xl leading-none text-slate-500 font-medium">{module.name}</p>
                {module.value === 0 ? (
                  <div className="mt-4 h-8 w-20 rounded-md bg-slate-200/70 animate-pulse" />
                ) : (
                  <p className="mt-4 text-3xl leading-none font-bold text-slate-700">{module.value}</p>
                )}
              </div>
              <span className={`h-11 w-11 rounded-xl flex items-center justify-center ${module.iconBg}`}>
                <module.icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-[0_16px_40px_rgba(31,41,55,0.08)] min-h-[420px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl leading-none font-semibold text-slate-700">Recent Activities</h2>
          <span className="rounded-xl bg-slate-100 px-4 py-2 text-lg leading-none text-slate-500">Last 3 Tasks</span>
        </div>

        {recentTasks.length ? (
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task._id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-700">{task.title || 'Task'}</p>
                    <p className="text-sm text-slate-500 mt-2">{task.description || 'No description'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {task.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[250px] text-slate-400">
            <FiBriefcase className="h-16 w-16 mb-4" />
            <p className="text-2xl leading-none font-medium text-slate-500">No recent tasks available</p>
            <p className="text-lg leading-none mt-4">New tasks will appear here when created</p>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-[#f2f0fa] p-2 md:p-3`}>
      <div className="relative flex min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-[#dcd8ed] bg-[#f7f5fc]">
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#d9d2fb]/55 via-[#ebe7ff]/25 to-transparent" />
        <div className="absolute -bottom-8 left-12 h-28 w-64 rounded-full bg-[#e7e0ff]/45 blur-2xl" />
        <div className="absolute -bottom-10 right-28 h-32 w-80 rounded-full bg-[#d6d0ff]/40 blur-2xl" />

        <aside className="relative z-10 w-[245px] border-r border-[#e0dcec] bg-gradient-to-b from-[#f4f1fd] via-[#f2effb] to-[#ddd5fa]/45 p-5 flex flex-col">
          <div className="px-2 pt-1 pb-4">
            <img src={logo} alt="ERP" className="h-14 w-auto object-contain" />
          </div>

          <nav className="space-y-1.5">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                  activeTab === item.name ? 'bg-[#ece5ff] text-slate-700' : 'text-slate-600 hover:bg-white/45'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[16px] leading-none font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-[#ddd8ea] bg-white/70 p-4">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-[#ede8ff] text-violet-700 flex items-center justify-center font-bold text-lg">ERP</span>
              <div>
                <p className="text-[18px] leading-none font-semibold text-slate-700">ERP</p>
                <p className="text-[14px] leading-none text-slate-500 mt-2">Enterprise</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="relative z-10 flex-1 p-5 md:p-6">
          <div className="max-w-[1600px] mx-auto">


            {activeTab === 'Dashboard' && renderDashboard()}
            {activeTab === 'Clients' && <CustomersTab isDarkMode={isDarkMode} />}
            {activeTab === 'Team' && <TeamTabs isDarkMode={isDarkMode} />}
            {activeTab === 'Tasks' && <TaskTab isDarkMode={isDarkMode} />}
            {activeTab === 'Onboarding' && <OnboardingTab isDarkMode={isDarkMode} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
