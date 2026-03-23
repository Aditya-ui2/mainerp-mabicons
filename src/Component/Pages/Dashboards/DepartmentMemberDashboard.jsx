import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckSquare,
  FiActivity,
  FiUser,
  FiBarChart2,
} from 'react-icons/fi';
import AdminLayout from './AdminLayout';

// Lazy load tab components
const MyTasksTab = lazy(() => import('./Tabs/Common/MyTasksTab'));
const ActivityFeedTab = lazy(() => import('./Tabs/Common/ActivityFeedTab'));

// Tab Loader Skeleton
const TabLoader = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-7 w-52 rounded-lg bg-gray-200" />
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

// Sidebar configuration for team members
const sidebarConfig = [
  {
    heading: 'WORKSPACE',
    items: [
      { id: 0, title: 'My Tasks', icon: FiCheckSquare },
      { id: 1, title: 'Activity Feed', icon: FiActivity },
    ]
  },
];

const DepartmentMemberDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [userInfo, setUserInfo] = useState({ name: 'Team Member', role: 'Team Member' });
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const dept = localStorage.getItem('department') || '';
    setDepartment(dept);

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          name: decoded.name || decoded.email?.split('@')[0] || 'Team Member',
          role: decoded.role || 'Team Member'
        });
        if (decoded.department) {
          setDepartment(decoded.department);
        }
      } catch (e) {
        console.log('Token decode error');
      }
    }
  }, []);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: department || 'Department', path: '#' },
    { label: activeTab }
  ];

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
            case 'My Tasks':
              return <MyTasksTab />;
            case 'Activity Feed':
              return <ActivityFeedTab department={department} />;
            default:
              // Dashboard Overview - Welcome + Quick Stats
              return (
                <div className="space-y-8">
                  {/* Welcome Banner */}
                  <div
                    className="rounded-2xl p-8 text-white relative overflow-hidden shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                    <div className="relative z-10">
                      <h1 className="text-3xl lg:text-4xl font-bold">Welcome, {userInfo.name} 👋</h1>
                      <p className="mt-2 text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {department} - {userInfo.role}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Check your assigned tasks and stay on top of your work
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <button
                      onClick={() => setActiveTab('My Tasks')}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="p-4 rounded-xl"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                        >
                          <FiCheckSquare style={{ width: '28px', height: '28px', color: '#fff' }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            My Tasks
                          </h3>
                          <p className="text-sm text-gray-500">
                            View and manage your assigned tasks
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('Activity Feed')}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="p-4 rounded-xl"
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        >
                          <FiActivity style={{ width: '28px', height: '28px', color: '#fff' }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            Activity Feed
                          </h3>
                          <p className="text-sm text-gray-500">
                            See recent department activities
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
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
      dashboardTitle={`${department || 'Department'} - Member`}
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default DepartmentMemberDashboard;
