import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiCheckSquare,
  FiMessageSquare,
  FiInbox,
  FiBriefcase,
  FiUserPlus,
  FiTrendingUp,
  FiTarget,
  FiCalendar,
  FiAward,
} from 'react-icons/fi';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import MessagesTab from './Tabs/MessagesTab';
import RequestsTab from './Tabs/RequestsTab';
import RecruitmentTab from './Tabs/RecruitmentTab';

// Sidebar configuration
const sidebarConfig = [
  {
    heading: 'TEAM MANAGEMENT',
    items: [
      { id: 1, title: 'Team', icon: FiUsers },
      { id: 2, title: 'Tasks', icon: FiCheckSquare },
      { id: 3, title: 'Messages', icon: FiMessageSquare },
    ]
  },
  {
    heading: 'OPERATIONS',
    items: [
      { id: 4, title: 'Requests', icon: FiInbox },
      { id: 5, title: 'Recruitment', icon: FiBriefcase },
      { id: 6, title: 'Onboarding', icon: FiUserPlus },
    ]
  },
];

const TeamLeaderDashboardNew = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'Team Leader', role: 'Team Leader' });

  // Mock stats
  const [stats, setStats] = useState({
    teamSize: 12,
    activeTasks: 28,
    pendingRequests: 5,
    completionRate: '87%',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          name: decoded.name || decoded.email?.split('@')[0] || 'Team Leader',
          role: 'Team Leader'
        });
      } catch (e) {
        console.log('Token decode error');
      }
    }
  }, []);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Team Leader', path: '/teamleader-dashboard' },
    { label: activeTab }
  ];

  const statsBarData = [
    { label: 'Active Members', value: `${stats.teamSize}`, percentage: '100%', color: 'bg-blue-500' },
    { label: 'Tasks Assigned', value: `${stats.activeTasks}`, percentage: '75%', color: 'bg-purple-500' },
    { label: 'Completed', value: '24', percentage: '85%', color: 'bg-green-500' },
    { label: 'Pending', value: `${stats.pendingRequests}`, percentage: '20%', color: 'bg-yellow-500' },
    { label: 'Efficiency', value: stats.completionRate, percentage: '87%', color: 'bg-teal-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Team':
        return <TeamTabs isDarkMode={false} />;
      case 'Tasks':
        return <TaskTab isDarkMode={false} />;
      case 'Messages':
        return <MessagesTab isDarkMode={false} />;
      case 'Requests':
        return <RequestsTab isDarkMode={false} />;
      case 'Recruitment':
        return <RecruitmentTab isDarkMode={false} />;
      case 'Onboarding':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate Onboarding</h2>
            <p className="text-gray-500">Manage and track your candidate onboarding process.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
              <div className="relative z-10">
                <h1 className="text-2xl lg:text-3xl font-bold">Welcome, {userInfo.name} 👋</h1>
                <p className="mt-1 text-white/80">Lead your team to success</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Team Size"
                value={stats.teamSize}
                change="+2"
                changeType="increase"
                icon={FiUsers}
                color="blue"
                sparklineData={[8, 9, 10, 10, 11, 11, 12]}
              />
              <StatCard
                title="Active Tasks"
                value={stats.activeTasks}
                change="+5"
                changeType="increase"
                icon={FiCheckSquare}
                color="purple"
                sparklineData={[18, 20, 22, 24, 25, 26, 28]}
              />
              <StatCard
                title="Pending Requests"
                value={stats.pendingRequests}
                change="-3"
                changeType="decrease"
                icon={FiInbox}
                color="yellow"
                sparklineData={[12, 10, 8, 7, 6, 5, 5]}
              />
              <StatCard
                title="Completion Rate"
                value={stats.completionRate}
                change="+4%"
                changeType="increase"
                icon={FiTrendingUp}
                color="green"
                sparklineData={[75, 78, 80, 82, 84, 85, 87]}
              />
            </div>

            {/* Stats Bar */}
            <StatsBar stats={statsBarData} />

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Members */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Team Members</h3>
                  <button 
                    onClick={() => setActiveTab('Team')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { name: 'John Doe', role: 'Developer', status: 'Online' },
                    { name: 'Jane Smith', role: 'Designer', status: 'Online' },
                    { name: 'Mike Johnson', role: 'Developer', status: 'Away' },
                    { name: 'Sarah Williams', role: 'QA Engineer', status: 'Offline' },
                  ].map((member, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${
                        member.status === 'Online' ? 'bg-green-500' :
                        member.status === 'Away' ? 'bg-yellow-500' :
                        'bg-gray-300'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: FiCheckSquare, label: 'Assign Task', onClick: () => setActiveTab('Tasks') },
                    { icon: FiMessageSquare, label: 'Send Message', onClick: () => setActiveTab('Messages') },
                    { icon: FiInbox, label: 'Review Requests', onClick: () => setActiveTab('Requests') },
                    { icon: FiBriefcase, label: 'Recruitment', onClick: () => setActiveTab('Recruitment') },
                    { icon: FiUsers, label: 'Team Overview', onClick: () => setActiveTab('Team') },
                    { icon: FiUserPlus, label: 'Onboarding', onClick: () => setActiveTab('Onboarding') },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.onClick}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-colors text-left"
                    >
                      <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Assigned To</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { task: 'Complete API Integration', assignee: 'John Doe', status: 'In Progress', priority: 'High' },
                      { task: 'Design Dashboard UI', assignee: 'Jane Smith', status: 'Completed', priority: 'Medium' },
                      { task: 'Write Unit Tests', assignee: 'Mike Johnson', status: 'Pending', priority: 'Low' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.task}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.assignee}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.priority === 'High' ? 'bg-red-100 text-red-700' :
                            item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
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
      dashboardTitle="Team Leader Dashboard"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={[]}
      isLoading={loading}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default TeamLeaderDashboardNew;
