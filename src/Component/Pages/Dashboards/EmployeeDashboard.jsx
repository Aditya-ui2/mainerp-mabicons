import { useCallback, useEffect, useState } from 'react';
import {
  FiHome,
  FiCheckSquare,
  FiUserPlus,
  FiSearch,
  FiBell,
  FiSettings,
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

import TaskTab from './Tabs/TaskTab';
import OnboardingTab from './Tabs/OnboardingTab';
import { getEmployeeTasks, getAllNotifications } from '../service/api';
import logo from '../../../assets/images/mabicons logo blue.png';
import taskErrorIllustration from '../../../assets/images/a-cheerful-professional-with-a-tidy-desk-and-an-op.svg';

const sidebarItems = [
  { name: 'Dashboard', icon: FiHome },
  { name: 'My Tasks', icon: FiCheckSquare },
  { name: 'Onboarding', icon: FiUserPlus },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchEmployeeTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const decoded = jwtDecode(token);
      const employeeId = decoded?.id;
      if (!employeeId) {
        throw new Error('Employee ID not found in token');
      }

      const response = await getEmployeeTasks(employeeId);
      setTasks(response?.tasks || []);
    } catch {
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('department');
    localStorage.removeItem('recruitmentTabAuth');
    window.location.href = '/login';
  };

  const renderDashboardState = () => {
    if (isLoading) {
      return (
        <div className="rounded-2xl border border-[#dfdbea] bg-white/85 min-h-[520px] flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-[#dfdbea] bg-white/85 min-h-[520px] px-8 py-10 shadow-[0_16px_40px_rgba(31,41,55,0.08)]">
          <div className="h-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-semibold text-slate-700">Failed to fetch tasks.</h2>
              <p className="mt-3 text-2xl text-slate-500">Please try again later.</p>
              <button
                onClick={fetchEmployeeTasks}
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-3 text-2xl font-medium text-white shadow-md hover:opacity-95"
              >
                Retry
              </button>
            </div>

            <img
              src={taskErrorIllustration}
              alt="Task fetch error"
              className="w-full max-w-[390px] opacity-95"
            />
          </div>
        </div>
      );
    }

    if (!tasks.length) {
      return (
        <div className="rounded-2xl border border-[#dfdbea] bg-white/85 min-h-[520px] flex items-center justify-center">
          <p className="text-3xl text-slate-500">No tasks found.</p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[#dfdbea] bg-white/85 min-h-[520px] p-8">
        <h2 className="text-3xl font-semibold text-slate-700 mb-6">My Tasks</h2>
        <div className="space-y-4">
          {tasks.slice(0, 8).map((task, index) => (
            <div key={task._id || index} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xl font-semibold text-slate-700">{task.title || 'Task'}</p>
              <p className="text-base text-slate-500 mt-1">{task.description || 'No description available'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f2f0fa] p-2 md:p-3">
      <div className="relative flex min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-[#dcd8ed] bg-[#f7f5fc]">
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#d9d2fb]/70 via-[#ebe7ff]/35 to-transparent" />
        <div className="absolute -bottom-10 left-10 h-44 w-96 rounded-full bg-[#e7e0ff]/60 blur-2xl" />
        <div className="absolute -bottom-14 right-24 h-52 w-[28rem] rounded-full bg-[#d6d0ff]/50 blur-2xl" />

        <aside className="relative z-10 w-[270px] border-r border-[#e0dcec] bg-gradient-to-b from-[#f4f1fd] via-[#f2effb] to-[#ddd5fa]/45 p-5 flex flex-col">
          <div className="flex items-center h-16 border-b border-slate-200 bg-white -mx-5 -mt-5 px-4 mb-4">
            <img src={logo} alt="Mabicons" className="h-8 w-auto object-contain" />
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                  activeTab === item.name ? 'bg-[#ece5ff] text-slate-700' : 'text-slate-600 hover:bg-white/45'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-lg leading-none font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 w-[155px] rounded-full bg-[#f13737] hover:bg-[#e53131] text-white py-3 text-[20px] leading-none font-medium"
          >
            Logout
          </button>
        </aside>

        <main className="relative z-10 flex-1 p-5 md:p-6">
          <div className="max-w-[1600px] mx-auto">


            {activeTab === 'Dashboard' && renderDashboardState()}
            {activeTab === 'My Tasks' && <TaskTab isDarkMode={false} />}
            {activeTab === 'Onboarding' && <OnboardingTab isDarkMode={false} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
