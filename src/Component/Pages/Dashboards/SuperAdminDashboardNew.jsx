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
  FiUser,
  FiChevronRight,
  FiChevronDown,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiZap,
  FiSearch,
  FiHelpCircle,
  FiLock,
  FiList,
  FiBell
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
import HiringLifecycleTab from './Tabs/KAMRecruitment/HiringLifecycleTab';
import TeamPerformanceTab from './Tabs/TeamPerformanceTab';
import AnnouncementsTab from './Tabs/Common/AnnouncementsTab';
import SuperAdminTotalOpenPositionsTab from './Tabs/Common/SuperAdminTotalOpenPositionsTab';
import SuperAdminInterviewsTab from './Tabs/Common/SuperAdminInterviewsTab';
import { getAllClients, getAllTasks, getAllNotifications, logout } from '../service/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// Sidebar menu configuration matching User's Handwritten Notes
const sidebarConfig = [
  {
    items: [
      {
        id: 'Dashboard',
        title: 'Dashboard',
        icon: FiHome,
      },
      {
        id: 'All Employees',
        title: 'All Employees',
        icon: FiUsers,
      },
      {
        id: 'All Clients',
        title: 'All Clients',
        icon: FiUserPlus,
      },
      {
        id: 'Billing & Accounts',
        title: 'Billing & Accounts',
        icon: FiCreditCard,
      },
      {
        id: 'Announcements',
        title: 'Announcements',
        icon: FiBell,
      },
      {
        id: 'Recruitment Management',
        title: 'Recruitment Management',
        icon: FiBriefcase,
        submenu: [
          { id: 'Total Open Positions', title: 'Total Open Positions' },
          { id: 'Shortlisted Candidates', title: 'Shortlisted Candidates' },
          { id: 'Interviews', title: 'Interviews' },
          { id: 'Joined Candidates', title: 'Joined Candidates' },
        ]
      },
      {
        id: 'Operations Management',
        title: 'Operations Management',
        icon: FiActivity,
        submenu: [
          { id: 'Performance Tracking', title: 'Performance Tracking' },
          { id: 'Resource Allocation', title: 'Resource Allocation' },
        ]
      },
      {
        id: 'CRM Management',
        title: 'CRM Management',
        icon: FiTarget,
        submenu: [
          { id: 'Client Meeting', title: 'Client Meeting' },
          { id: 'Client Pipeline', title: 'Client Pipeline' },
          { id: 'Client Onboarding', title: 'Client Onboarding' },
        ]
      },
      {
        id: 'Help & Support',
        title: 'Help & Support',
        icon: FiHelpCircle,
        submenu: [
          { id: 'Internal', title: 'Internal' },
          { id: 'External', title: 'External' },
        ]
      },
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

// Mock Data for KPI Popups
const kpiMockData = {
  'Outstanding': {
    title: 'Outstanding Payments',
    total: '₹4.2L',
    details: [
      { name: 'Zomato', amount: '₹1.5L', status: 'Pending', dueDate: 'Due in 5 days' },
      { name: 'TCS', amount: '₹0.8L', status: 'Overdue', dueDate: '5 days ago' },
      { name: 'Infosys', amount: '₹1.9L', status: 'Pending', dueDate: 'Due in 12 days' },
    ]
  },
  'Monthly MRR': {
    title: 'Monthly Recurring Revenue',
    total: '₹8.5L',
    details: [
      { name: 'Active Subscriptions', count: 42, amount: '₹6.2L' },
      { name: 'New MRR (This Month)', count: 5, amount: '₹1.5L' },
      { name: 'Expansion MRR', count: 3, amount: '₹0.8L' },
    ]
  },
  'Projected ARR': {
    title: 'Projected Annual Revenue',
    total: '₹1.2Cr',
    details: [
      { category: 'Contracted ARR', amount: '₹85L' },
      { category: 'Pipeline Potential', amount: '₹35L' },
      { category: 'Expected Renewals', amount: '₹10L' },
    ]
  },
  'Salaries': {
    title: 'Employee Salaries',
    total: '₹12.8L',
    details: [
      { department: 'Operations', count: 40, amount: '₹4.5L' },
      { department: 'Recruitment', count: 35, amount: '₹3.8L' },
      { department: 'Admin', count: 15, amount: '₹2.5L' },
      { department: 'Management', count: 5, amount: '₹2.0L' },
    ]
  },
  'Rent': {
    title: 'Office Rent & Maintenance',
    total: '₹1.5L',
    details: [
      { location: 'Gurgaon HQ', amount: '₹85K', type: 'Main Branch' },
      { location: 'Bangalore Hub', amount: '₹45K', type: 'Satellite Office' },
      { location: 'Maintenance/Utils', amount: '₹20K', type: 'Facility Costs' },
    ]
  }
};

const KpiDetailModal = ({ isOpen, onClose, kpiType }) => {
  const data = kpiMockData[kpiType];
  if (!data) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF] z-[200001]"
          >
            <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/20 to-white">
              <div className="text-left">
                <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">{data.title}</h3>
                <p className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-widest mt-1">Detailed Breakdown</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] hover:text-red-500 transition-all flex items-center justify-center">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-[#FAFAF8] rounded-3xl p-6 border border-[#F4F3EF] text-center">
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-4xl font-black text-[#1A1A2E] tracking-tight">{data.total}</p>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {data.details.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#F4F3EF] hover:border-blue-100 transition-all group text-left">
                      <div>
                        <p className="text-sm font-bold text-[#1A1A2E]">{item.name || item.department || item.category || item.location}</p>
                        <p className="text-[10px] font-medium text-[#9B9BAD]">
                          {item.status || item.dueDate || (item.count ? `${item.count} Units` : item.type) || ''}
                        </p>
                      </div>
                      <p className="text-sm font-black text-[#1B4DA0] group-hover:scale-110 transition-transform">{item.amount}</p>
                   </div>
                ))}
              </div>
            </div>
            
            <div className="p-8 bg-[#F8FAFC] border-t border-[#F4F3EF] flex justify-end">
              <button onClick={onClose} className="px-8 py-4 bg-white border border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 transition-all shadow-sm">
                Close Report
              </button>
            </div>
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
  const [selectedKpi, setSelectedKpi] = useState(null);

  useEffect(() => {
    localStorage.setItem('superadmin_active_tab', activeTab);
  }, [activeTab]);

  const [loading, setLoading] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState('This Year');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [customMonth, setCustomMonth] = useState('');
  const [customYear, setCustomYear] = useState('');
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
        } catch (e) { }
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
      case 'All Clients':
        return <ClientsTab />;

      case 'Recruitment Management':
        return <HiringLifecycleTab />;
      case 'Total Open Positions':
        return <SuperAdminTotalOpenPositionsTab />;
      case 'Interviews':
        return <SuperAdminInterviewsTab />;
      case 'Shortlisted Candidates':
      case 'Joined Candidates':
        return <HiringLifecycleTab />;

      case 'Team Performance':
        return <TeamPerformanceTab />;

      case 'Billing & Accounts':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8 text-left">
              <div className="flex flex-col text-left">
                <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Billing & Accounts</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard title="Outstanding" value={summaryData.outstandingPayment} icon={FiCreditCard} color="white" onClick={() => setSelectedKpi('Outstanding')} />
              <StatCard title="Monthly MRR" value={summaryData.totalMRR} icon={FiTrendingUp} color="white" onClick={() => setSelectedKpi('Monthly MRR')} />
              <StatCard title="Projected ARR" value={summaryData.projectedARR} icon={FiDollarSign} color="white" onClick={() => setSelectedKpi('Projected ARR')} />
              <StatCard title="Salaries" value={summaryData.totalSalaries} icon={FiUsers} color="white" onClick={() => setSelectedKpi('Salaries')} />
              <StatCard title="Rent" value={summaryData.totalRent} icon={FiHome} color="white" onClick={() => setSelectedKpi('Rent')} />
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-8 font-syne text-left">Financial Performance</h3>
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

      case 'Company Overview':
      case 'Analytics':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <FiPieChart size={64} className="text-blue-500 mb-4 opacity-20" />
            <h2 className="text-2xl font-bold text-slate-800">Analytics & Insights</h2>
            <p className="text-slate-500 max-w-md mt-2">Comprehensive business analytics and company-wide overview reports are being generated.</p>
          </div>
        );

      case 'All Employees':
        return <TeamTabs />;

      case 'Operations Management':
      case 'Performance Tracking':
      case 'Resource Allocation':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <FiActivity size={64} className="text-blue-500 mb-4 opacity-20" />
            <h2 className="text-2xl font-bold text-slate-800">Operations Management</h2>
            <p className="text-slate-500 max-w-md mt-2">Resource allocation, performance tracking, and operational efficiency modules are being prepared.</p>
          </div>
        );

      case 'CRM Management':
      case 'Client Meeting':
      case 'Client Pipeline':
      case 'Client Onboarding':
        return <ClientPipelineTab />;

      case 'Help & Support':
      case 'Internal':
      case 'External':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <FiHelpCircle size={64} className="text-purple-500 mb-4 opacity-20" />
            <h2 className="text-2xl font-bold text-slate-800">Help & Support</h2>
            <p className="text-slate-500 max-w-md mt-2">Access internal and external support resources, documentation, and helpdesk services.</p>
          </div>
        );

      case 'Announcements':
        return <AnnouncementsTab department="All" isHead={true} />;

      case 'Settings':
      case 'My Profile':
        return <MyProfileTab />;

      default:
      case 'Dashboard':
      case 'Total Revenue':
      case 'Total Clients':
      case 'Active Employees':
        return (
          <div className="space-y-12">
            {/* Sticky Welcome Header */}
            <div className="sticky top-0 z-[30] bg-[#FDFDFD]/80 backdrop-blur-md -mt-6 -mx-6 px-6 py-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50">
              <div className="flex flex-col items-start text-left">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">
                  Welcome {userInfo.name.split(' ')[0]}
                </h2>
              </div>
            </div>

            {/* Notebook Requirements Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Total Revenue"
                value={summaryData.totalRevenue}
                icon={FiDollarSign}
                color="white"
                change="+14.2%"
                onClick={() => setActiveTab('Billing')}
              />
              <StatCard
                title="Active Clients"
                value={summaryData.activeClients}
                icon={FiUsers}
                color="white"
                onClick={() => setShowClientsModal(true)}
              />
              <StatCard
                title="Total Admins"
                value={summaryData.totalAdmins}
                icon={FiShield}
                color="white"
                onClick={() => setActiveTab('Employees')}
              />
              <StatCard
                title="Total KAMs"
                value={summaryData.totalKAMs}
                icon={FiTarget}
                color="white"
                onClick={() => setActiveTab('Employees')}
              />
              <StatCard
                title="Active Employees"
                value={summaryData.activeEmployees}
                icon={FiActivity}
                color="white"
                onClick={() => setActiveTab('My Team')}
              />
            </div>

            {/* Quick Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Revenue Trend</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <AnimatePresence mode="wait">
                      {revenueFilter === 'Custom Date' && (
                        <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex gap-2 items-center overflow-hidden">
                          <input type="date" className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 outline-none focus:border-blue-500 transition-colors" value={customDateRange.start} onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })} />
                          <span className="text-gray-400 font-bold">-</span>
                          <input type="date" className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 outline-none focus:border-blue-500 transition-colors" value={customDateRange.end} onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })} />
                        </motion.div>
                      )}
                      {revenueFilter === 'Month' && (
                        <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
                          <input type="month" className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 outline-none focus:border-blue-500 transition-colors" value={customMonth} onChange={(e) => setCustomMonth(e.target.value)} />
                        </motion.div>
                      )}
                      {revenueFilter === 'Year' && (
                        <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
                          <input type="number" min="2000" max="2100" placeholder="YYYY" className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 outline-none w-24 focus:border-blue-500 transition-colors" value={customYear} onChange={(e) => setCustomYear(e.target.value)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="relative">
                      <select 
                        value={revenueFilter}
                        onChange={(e) => setRevenueFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-8 py-2 text-xs font-bold text-gray-600 outline-none cursor-pointer appearance-none shadow-sm hover:bg-gray-100 transition-colors"
                      >
                        <option value="This Year">This Year</option>
                        <option value="Last Year">Last Year</option>
                        <option value="This Week">This Week</option>
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                        <option value="Custom Date">Custom Date</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>
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
      dashboardTabName={null}
      showBottomTab={false}
      showGlobalHeader={false}
    >
      {renderContent()}
      {/* Clients List Modal - PORTAL Component Match */}
      <ClientsExplorerModal
        isOpen={showClientsModal}
        onClose={() => setShowClientsModal(false)}
        clientsList={clientsList}
      />
      
      {/* KPI Detail Modal */}
      <KpiDetailModal 
        isOpen={!!selectedKpi}
        onClose={() => setSelectedKpi(null)}
        kpiType={selectedKpi}
      />
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
