import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiTrendingUp,
  FiTarget,
  FiDollarSign,
  FiPhone,
  FiMail,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiFileText,
} from 'react-icons/fi';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import { getAllLeads, createLead, updateLead, deleteLead, sendProposal, sendProfile } from '../service/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Sidebar configuration
const sidebarConfig = [
  {
    heading: 'SALES',
    items: [
      { id: 1, title: 'Leads', icon: FiUsers },
      { id: 2, title: 'Reports', icon: FiBarChart2 },
    ]
  },
  {
    heading: 'SETTINGS',
    items: [
      { id: 3, title: 'Settings', icon: FiSettings },
    ]
  },
];

const BDDashboardNew = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: 'BD Executive', role: 'Business Development' });

  // Stats
  const [stats, setStats] = useState({
    totalLeads: 0,
    converted: 0,
    inProgress: 0,
    revenue: '₹0',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAllLeads();
        const leadsData = response?.leads || [];
        setLeads(leadsData);
        
        setStats({
          totalLeads: leadsData.length,
          converted: leadsData.filter(l => l.status === 'Converted').length,
          inProgress: leadsData.filter(l => l.status === 'In Progress' || l.status === 'Follow Up').length,
          revenue: '₹12.5L',
        });
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          name: decoded.name || decoded.email?.split('@')[0] || 'BD Executive',
          role: 'Business Development'
        });
      } catch (e) {
        console.log('Token decode error');
      }
    }
  }, []);

  // Chart data
  const pieData = {
    labels: ['Converted', 'In Progress', 'New Leads', 'Lost'],
    datasets: [{
      data: [stats.converted || 12, stats.inProgress || 18, 15, 5],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      borderWidth: 0,
    }]
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [150000, 220000, 180000, 280000, 320000, 450000],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'BD', path: '/bd-dashboard' },
    { label: activeTab }
  ];

  const statsBarData = [
    { label: 'New Leads', value: '15', percentage: '30%', color: 'bg-yellow-500' },
    { label: 'In Progress', value: `${stats.inProgress}`, percentage: '45%', color: 'bg-blue-500' },
    { label: 'Converted', value: `${stats.converted}`, percentage: '80%', color: 'bg-green-500' },
    { label: 'Conversion Rate', value: '24%', percentage: '24%', color: 'bg-purple-500' },
    { label: 'Avg Deal Size', value: '₹2.5L', percentage: '65%', color: 'bg-teal-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Leads':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Lead Management</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FiPlus className="w-4 h-4" />
                Add Lead
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.length > 0 ? leads.map((lead, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{lead.companyName || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{lead.contactPerson || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{lead.email || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            lead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                            lead.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            lead.status === 'Lost' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {lead.status || 'New'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{lead.dealValue || '0'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                              <FiSend className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          No leads found. Add your first lead!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'Reports':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
                <div className="h-64">
                  <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <div className="h-64">
                  <Line 
                    data={lineData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-500">Settings will be displayed here.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
              <div className="relative z-10">
                <h1 className="text-2xl lg:text-3xl font-bold">Welcome, {userInfo.name} 👋</h1>
                <p className="mt-1 text-white/80">Track your leads and close more deals</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Leads"
                value={loading ? '...' : stats.totalLeads}
                change="+12"
                changeType="increase"
                icon={FiUsers}
                color="blue"
                sparklineData={[30, 35, 40, 38, 45, 50, 55]}
              />
              <StatCard
                title="Revenue"
                value={stats.revenue}
                change="+18%"
                changeType="increase"
                icon={FiDollarSign}
                color="green"
                sparklineData={[100, 150, 120, 180, 200, 250, 300]}
              />
              <StatCard
                title="Converted"
                value={loading ? '...' : stats.converted}
                change="+5"
                changeType="increase"
                icon={FiTarget}
                color="teal"
                sparklineData={[8, 10, 9, 12, 11, 14, 15]}
              />
              <StatCard
                title="Conversion Rate"
                value="24%"
                change="+3%"
                changeType="increase"
                icon={FiTrendingUp}
                color="purple"
                sparklineData={[18, 19, 20, 21, 22, 23, 24]}
              />
            </div>

            {/* Stats Bar */}
            <StatsBar stats={statsBarData} />

            {/* Charts & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <div className="h-64">
                  <Line 
                    data={lineData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } }
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status</h3>
                <div className="h-56">
                  <Pie 
                    data={pieData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
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

            {/* Recent Leads */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Leads</h3>
                <button 
                  onClick={() => setActiveTab('Leads')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.slice(0, 5).map((lead, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.companyName || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.contactPerson || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            lead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                            lead.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {lead.status || 'New'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{lead.dealValue || '0'}</td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          No leads yet
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
      dashboardTitle="BD Dashboard"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={[]}
      isLoading={loading}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default BDDashboardNew;
