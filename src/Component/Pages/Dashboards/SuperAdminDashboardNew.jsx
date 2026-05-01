import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiCreditCard,
  FiClipboard,
  FiPieChart as FiChart,
  FiX,
  FiChevronRight,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiZap,
  FiSearch
} from 'react-icons/fi';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import AdminLayout, { StatCard, StatsBar, DataTable } from './AdminLayout';
import ClientsTab from './Tabs/CRM/ClientsTab';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import AdminTab from './Tabs/AdminTab';
import BdTab from './Tabs/BdTab';
import SettingsTab from './Tabs/SettingsTab';
import ClientPipelineTab from './Tabs/CRM/ClientPipelineTab';
import MyProfileTab from './Tabs/Common/MyProfileTab';
import { getAllClients, getAllTasks, getAllNotifications, logout } from '../service/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// Sidebar menu configuration matching User's Handwritten Notes
const sidebarConfig = [
  {
     
    items: [
      { id: 'Clients', title: 'Clients', icon: FiUsers },
      { id: 'Billing', title: 'Billing', icon: FiCreditCard },
      { id: 'My Team', title: 'My Team', icon: FiUsers },
      { id: 'Client Pipeline', title: 'Client Pipeline', icon: FiTrendingUp },
      { id: 'Employees', title: 'Employees', icon: FiUserPlus },
      { id: 'Team Leaders', title: 'Team Leaders', icon: FiUserPlus },
      { id: 'My Profile', title: 'My Profile', icon: FiUsers },
    ]
  }
];

// Clients Explorer Component - Standalone for Performance & Stability
const ClientsExplorerModal = ({ isOpen, onClose, clientsList }) => {
  const [selectedClient, setSelectedClient] = useState(null);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[1160px] bg-[#FFFFFF] rounded-[48px] shadow-2xl overflow-hidden border border-white flex h-[85vh]"
          >
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="px-12 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#FBFCFF]">
                <h3 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne text-left">
                  Clients
                </h3>
                <button 
                  onClick={onClose}
                  className="w-14 h-14 rounded-3xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm group/close"
                >
                  <FiX size={28} className="transition-transform duration-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-12 py-5 border-b border-[#F1F5F9] grid grid-cols-[2fr_1fr] gap-6 text-[11px] font-bold uppercase tracking-[2px] text-[#94A3B8]">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 flex-shrink-0" />
                    <span className="text-left">Client</span>
                  </div>
                  <div className="flex items-center justify-end pr-[58px]">Openings</div>
                </div>

                <div className="px-6">
                  {clientsList.map((client) => (
                    <div
                      key={client.id || client._id}
                      onClick={() => setSelectedClient(client)}
                      className="group grid grid-cols-[2fr_1fr] items-center gap-6 px-6 py-6 border-b border-[#F8FAFC] hover:bg-[#FBFDFF] transition-all cursor-pointer relative"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-[14px] bg-[#F8FAFC] text-[#475569] flex items-center justify-center font-bold text-sm border border-[#F1F5F9] group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-300">
                          {(client.name || 'C').slice(0, 2).toUpperCase()}
                        </div>
                        <h4 className="text-[15px] font-bold text-[#1e293b] group-hover:text-blue-600 transition-colors leading-tight">
                          {client.name}
                        </h4>
                      </div>
                      <div className="flex items-center justify-end gap-10">
                        <div className="text-right">
                          <p className="text-[14px] font-bold text-[#334155]">{client.jobCount || 0}</p>
                          <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-tighter">Active</p>
                        </div>
                        <FiChevronRight size={18} className="text-[#CBD5E1] group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {selectedClient && (
                <React.Fragment>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/40 backdrop-blur-md z-[55]"
                    onClick={() => setSelectedClient(null)}
                  />
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 35, stiffness: 250 }}
                    className="absolute inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[60] overflow-hidden"
                  >
                    <div className="p-6 border-b border-[#F4F3EF] bg-gradient-to-r from-blue-50/30 to-white flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Client Details</h3>
                      <button onClick={() => setSelectedClient(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm">
                        <FiX size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-8 space-y-10">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-[32px] bg-[#F8FAFC] text-[#475569] flex items-center justify-center text-3xl font-extrabold shadow-xl border border-[#F1F5F9] mb-6">
                          {(selectedClient.name || 'C').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedClient.name}</h4>
                          <p className="text-[14px] font-bold text-[#1B4DA0] tracking-tight uppercase tracking-[3px]">{selectedClient.industry || 'Technology'} Sector</p>
                        </div>
                      </div>

                      <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-10 space-y-8">
                        {[
                          { label: 'Location HQ', value: selectedClient.location || 'Bangalore / Remote' },
                          { label: 'Active Openings', value: `${selectedClient.jobCount || 0} Positions` },
                          { label: 'Total Hires', value: '0 Placements' },
                          { label: 'Hiring SPOC', value: selectedClient.spocName || 'N/A' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#9B9BAD]">{item.label}</span>
                            <span className="text-sm font-bold text-[#1A1A2E]">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4">
                        <button 
                          onClick={() => window.open(`mailto:contact@${selectedClient.name.toLowerCase().replace(/\s/g, '')}.com?subject=Inquiry from Super Admin`, '_blank')}
                          className="flex-1 flex items-center justify-center gap-3 py-4 bg-white border-2 border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#6B6B7E] hover:bg-slate-50 transition-all"
                        >
                          <FiMail size={16} /> Contact Client
                        </button>
                        <button 
                          onClick={() => window.open('https://meet.google.com/', '_blank')}
                          className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#0D47A1] rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-[#0a3a82] shadow-lg shadow-blue-500/10 transition-all"
                        >
                          <FiCalendar size={16} /> Schedule Call
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('superadmin_active_tab') || 'Dashboard');

  useEffect(() => {
    localStorage.setItem('superadmin_active_tab', activeTab);
  }, [activeTab]);

  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalRevenue: '₹24.5L',
    activeClients: 156,
    totalHiring: 42,
    activeEmployees: 128,
    totalAdmins: 5,
    totalKAMs: 12,
    retentionRate: '94%',
    outstandingPayment: '₹4.2L',
    totalMRR: '₹8.5L',
    projectedARR: '₹1.2Cr',
    totalSalaries: '₹12.8L',
    totalRent: '₹1.5L'
  });

  const [showClientsModal, setShowClientsModal] = useState(false);
  const [selectedClientForModal, setSelectedClientForModal] = useState(null);
  const [clientsList, setClientsList] = useState([]);

  const [userInfo, setUserInfo] = useState({ name: 'Ashish', role: 'Super Admin' });

  useEffect(() => {
    // Simulating API fetch for dashboard metrics
    setTimeout(() => {
      setLoading(false);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          setUserInfo({
            name: decoded.name || 'Ashish',
            role: 'Super Admin'
          });
        } catch (e) {}
      }

      // Fetch Clients for Modal
      const fetchClients = async () => {
        try {
          const response = await getAllClients();
          if (response && response.success) {
            setClientsList(response.data || []);
            setSummaryData(prev => ({
              ...prev,
              activeClients: response.data?.length || 0
            }));
          }
        } catch (error) {
          console.error("Failed to fetch clients:", error);
          // Fallback mockup data if API fails to keep UI premium
          setClientsList([
            { id: 1, name: 'Zomato', industry: 'Food Tech', location: 'Gurgaon', jobCount: 7 },
            { id: 2, name: 'TCS', industry: 'IT Services', location: 'Mumbai', jobCount: 15 },
            { id: 3, name: 'Infosys', industry: 'IT Services', location: 'Bangalore', jobCount: 12 },
            { id: 4, name: 'Wipro', industry: 'IT Services', location: 'Pune', jobCount: 8 }
          ]);
        }
      };
      fetchClients();
    }, 800);
  }, []);

  // Billing Chart Data
  const billingChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12, 15, 18, 14, 22, 24.5],
        borderColor: '#3D37F1',
        backgroundColor: 'rgba(61, 55, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: [8, 9, 10, 9, 11, 14.3],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Clients':
        return <ClientsTab />;
      
      case 'Billing':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard title="Outstanding" value={summaryData.outstandingPayment} icon={FiCreditCard} color="red" />
              <StatCard title="Monthly MRR" value={summaryData.totalMRR} icon={FiTrendingUp} color="blue" />
              <StatCard title="Projected ARR" value={summaryData.projectedARR} icon={FiDollarSign} color="emerald" />
              <StatCard title="Salaries" value={summaryData.totalSalaries} icon={FiUsers} color="orange" />
              <StatCard title="Rent" value={summaryData.totalRent} icon={FiHome} color="indigo" />
            </div>
            
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-8 font-syne">Financial Performance</h3>
              <div className="h-80">
                <Line 
                  data={billingChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { usePointStyle: true, font: { weight: 'bold' } } } }
                  }} 
                />
              </div>
            </div>
          </div>
        );

      case 'My Team':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-6 font-syne">Team Performance</h3>
                <div className="space-y-6">
                  {['Recruitment Team', 'Operations Team'].map((team, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-[#1A1A2E]">{team}</span>
                        <span className="text-[#3D37F1]">{idx === 0 ? '92%' : '88%'}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: idx === 0 ? '92%' : '88%' }} 
                          className={`h-full ${idx === 0 ? 'bg-[#3D37F1]' : 'bg-emerald-500'}`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-6 font-syne">Activity Check-ins</h3>
                <div className="space-y-4">
                  {[
                    { user: 'Priyanshi Sharma', action: 'Checked in at 09:15 AM', status: 'On Time' },
                    { user: 'Ramesh Head', action: 'Checked in at 09:45 AM', status: 'Late' },
                    { user: 'Sachin Head', action: 'Checked in at 09:00 AM', status: 'On Time' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-bold text-[#3D37F1]">
                          {item.user.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#1A1A2E]">{item.user}</p>
                          <p className="text-[11px] text-gray-400 font-medium">{item.action}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'On Time' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <TeamTabs />
          </div>
        );

      case 'Client Pipeline':
        return <ClientPipelineTab />;
      
      case 'Employees':
      case 'Team Leaders':
        return <TeamTabs />;
      
      case 'Settings':
      case 'My Profile':
        return <MyProfileTab />;

      default:
        return (
          <div className="space-y-8">
            {/* Notebook Requirements Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div onClick={() => setActiveTab('Billing')} className="cursor-pointer group">
                <StatCard
                  title="Total Revenue"
                  subtitle="This Month"
                  value={summaryData.totalRevenue}
                  icon={FiDollarSign}
                  color="blue"
                  change="+14.2%"
                  className="group-hover:translate-y-[-4px] transition-all duration-300 shadow-sm hover:shadow-xl"
                />
              </div>
              <div onClick={() => setShowClientsModal(true)} className="cursor-pointer group">
                <StatCard
                  title="Active Clients"
                  subtitle="Click to view list"
                  value={summaryData.activeClients}
                  icon={FiUsers}
                  color="emerald"
                  className="group-hover:translate-y-[-4px] transition-all duration-300 shadow-sm hover:shadow-xl"
                />
              </div>
              <div onClick={() => setActiveTab('Employees')} className="cursor-pointer group">
                <StatCard
                  title="Total Admins"
                  subtitle="Super Admin Team"
                  value={summaryData.totalAdmins}
                  icon={FiShield}
                  color="purple"
                  className="group-hover:translate-y-[-4px] transition-all duration-300 shadow-sm hover:shadow-xl"
                />
              </div>
              <div onClick={() => setActiveTab('Employees')} className="cursor-pointer group">
                <StatCard
                  title="Total KAMs"
                  subtitle="Key Accounts"
                  value={summaryData.totalKAMs}
                  icon={FiTarget}
                  color="orange"
                  className="group-hover:translate-y-[-4px] transition-all duration-300 shadow-sm hover:shadow-xl"
                />
              </div>
              <div onClick={() => setActiveTab('My Team')} className="cursor-pointer group">
                <StatCard
                  title="Active Employees"
                  subtitle="Team Overview"
                  value={summaryData.activeEmployees}
                  icon={FiActivity}
                  color="indigo"
                  className="group-hover:translate-y-[-4px] transition-all duration-300 shadow-sm hover:shadow-xl"
                />
              </div>
            </div>

            {/* Quick Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Revenue Trend</h3>
                  <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-500 outline-none">
                    <option>This Year</option>
                    <option>Last Year</option>
                  </select>
                </div>
                <div className="h-80">
                  <Bar 
                    data={billingChartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { x: { grid: { display: false } }, y: { border: { display: false } } }
                    }} 
                  />
                </div>
              </div>
              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-8 font-syne">Team Distribution</h3>
                <div className="h-64">
                  <Doughnut 
                    data={{
                      labels: ['Ops', 'Recruitment', 'Admin', 'BD'],
                      datasets: [{
                        data: [40, 35, 15, 10],
                        backgroundColor: ['#3D37F1', '#10B981', '#F59E0B', '#6366F1'],
                        borderWidth: 0,
                        cutout: '75%'
                      }]
                    }}
                    options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 10, weight: 'bold' } } } } }}
                  />
                </div>
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
      dashboardTitle={activeTab}
      userInfo={userInfo}
      isLoading={loading}
    >
      <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
        {renderContent()}
      {/* Clients List Modal - PORTAL Component Match */}
      <ClientsExplorerModal 
        isOpen={showClientsModal} 
        onClose={() => setShowClientsModal(false)} 
        clientsList={clientsList} 
      />
      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
