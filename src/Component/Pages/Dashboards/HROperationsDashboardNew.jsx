import { useState, useEffect, Suspense, lazy, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { hasAccessTo } from '../DepartmentProtectedRoute';
import {
  getDepartmentDashboardStats,
  getMyProfile,
  getAllNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAllKAMMembers,
  getDeptNotes,
  createDeptNote,
  updateDeptNote,
  deleteDeptNote,
  getAllClients,
} from '../service/api';
import {
  FiClock,
  FiUserPlus,
  FiFileText,
  FiUsers,
  FiTrendingUp,
  FiUserMinus,
  FiCheckSquare,
  FiFile,
  FiEdit3,
  FiHeart,
  FiClipboard,
  FiCalendar,
  FiShield,
  FiMessageSquare,
  FiRefreshCw,
  FiTarget,
  FiActivity,
  FiBriefcase,
  FiUser,
  FiBell,
  FiAward,
  FiX,
  FiTrash2,
  FiEdit2,
  FiLoader,
  FiCheck,
  FiArrowRight,
  FiPlus,
  FiChevronDown,
  FiSearch,
} from 'react-icons/fi';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalISODate } from '../Utilities/dateUtils';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';

const AttendanceTab = lazy(() => import('./Tabs/KAM/AttendanceTab'));
const CorrectionRegularizationTab = lazy(() => import('./Tabs/KAM/CorrectionRegularizationTab'));
const PayrollTab = lazy(() => import('./Tabs/KAM/PayrollTab'));
const OnboardingKamTab = lazy(() => import('./Tabs/KAM/OnboardingKamTab'));
const PolicyTab = lazy(() => import('./Tabs/KAM/PolicyTab'));
const MasterDataTab = lazy(() => import('./Tabs/KAM/MasterDataTab'));
const PerformanceTab = lazy(() => import('./Tabs/KAM/PerformanceTab'));
const OffboardingTab = lazy(() => import('./Tabs/KAM/OffboardingTab'));
const FnFTab = lazy(() => import('./Tabs/KAM/FnFTab'));
const DocumentVerifyTab = lazy(() => import('./Tabs/KAM/DocumentVerifyTab'));
const OperationsNotesTab = lazy(() => import('./Tabs/Common/OperationsNotesTab'));
const EmployeeEngagementTab = lazy(() => import('./Tabs/KAM/EmployeeEngagementTab'));
const TaskByClientTab = lazy(() => import('./Tabs/KAM/TaskByClientTab'));
const LeaveManagementTab = lazy(() => import('./Tabs/KAM/LeaveManagementTab'));
const ComplianceTab = lazy(() => import('./Tabs/KAM/ComplianceTab'));
const KamProductivityTab = lazy(() => import('./Tabs/KAM/KamProductivityTab'));
const WorkAgreementTab = lazy(() => import('./Tabs/KAM/WorkAgreementTab'));
const ChatUpdatesTab = lazy(() => import('./Tabs/KAM/ChatUpdatesTab'));
const WorkHandoverTab = lazy(() => import('./Tabs/KAM/WorkHandoverTab'));

// New Payroll Suite tabs
const PayrollSetupTab = lazy(() => import('./Tabs/KAM/PayrollSetupTab'));
const SalaryTab = lazy(() => import('./Tabs/KAM/SalaryTab'));
const PayrollVerificationTab = lazy(() => import('./Tabs/KAM/PayrollVerificationTab'));
const PayoutProcessingTab = lazy(() => import('./Tabs/KAM/PayoutProcessingTab'));
const EmployeePayslipsTab = lazy(() => import('./Tabs/KAM/EmployeePayslipsTab'));

// Operations Head specific Tabs
const OperationsMyTeamTab = lazy(() => import('./Tabs/Operations/OperationsMyTeamTab'));
const OperationsTaskAssignmentTab = lazy(() => import('./Tabs/Operations/OperationsTaskAssignmentTab'));
const OperationsHelpSupportTab = lazy(() => import('./Tabs/Operations/OperationsHelpSupportTab'));
const OperationsMISReportsTab = lazy(() => import('./Tabs/Operations/OperationsMISReportsTab'));
const OperationsHeadNotesTab = lazy(() => import('./Tabs/Operations/OperationsHeadNotesTab'));
const OperationsMyProfileTab = lazy(() => import('./Tabs/Operations/OperationsMyProfileTab'));
const OperationsClientsTab = lazy(() => import('./Tabs/Operations/OperationsClientsTab'));

// Team Management Tabs
const TeamManagementTab = lazy(() => import('./Tabs/Common/TeamManagementTab'));
const ActivityFeedTab = lazy(() => import('./Tabs/Common/OperationsActivityFeedTab'));
const TaskAssignmentTab = lazy(() => import('./Tabs/Common/TaskAssignmentTab'));
const AnnouncementsTab = lazy(() => import('./Tabs/Common/AnnouncementsTab'));
const ClientReviewTab = lazy(() => import('./Tabs/CRM/ClientReviewTab'));
import AnnouncementsWidget from './Tabs/Common/AnnouncementsWidget';

// Tab Loader Skeleton
const TabLoader = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-7 w-52 rounded-lg bg-gray-200" />
      <div className="h-10 w-32 rounded-lg bg-gray-200" />
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

const ComingSoonPlaceholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center">
    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
      <FiActivity className="w-10 h-10" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 max-w-md">We're working hard to bring you this feature. Stay tuned for updates!</p>
    <div className="mt-8 flex gap-3">
      <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold opacity-50 cursor-not-allowed">Coming Soon</div>
    </div>
  </div>
);



const HROperationsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('hroperations_active_tab') || 'Dashboard');

  const [clientsList, setClientsList] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [clientsFetchError, setClientsFetchError] = useState(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [selectedService, setSelectedService] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  const fetchClients = async () => {
    try {
      setClientsFetchError(null);
      const res = await getAllClients({ service: 'operations' });
      const clientList = res?.data?.clients || res?.clients || [];

      const servicesList = ['eSSL', 'greytHR', 'Emgage', 'HROne'];
      const getClientService = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('flipkart')) return 'eSSL';
        if (lowerName.includes('amazon')) return 'greytHR';
        if (lowerName.includes('google')) return 'Emgage';
        if (lowerName.includes('microsoft')) return 'HROne';

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const idx = Math.abs(hash) % servicesList.length;
        return servicesList[idx];
      };

      const mappedClients = clientList.map((client) => {
        const clientName = client.companyName || client.name || '';
        return {
          ...client,
          service: client.service || getClientService(clientName)
        };
      });

      setClientsList(mappedClients);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setClientsFetchError(err.message || 'Failed to load clients');
      setClientsList([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const sidebarConfig = [
    {
      items: [
        { id: 'my-team', title: 'My Team', icon: FiUsers },
        { id: 'clients', title: 'Clients', icon: FiBriefcase },
        { id: 'task-assignment', title: 'Task Assignment', icon: FiCheckSquare },
        { id: 'help-support', title: 'Help & Support', icon: FiMessageSquare },
        { id: 'mis-reports', title: 'MIS Reports', icon: FiFileText },
        { id: 'notes', title: 'Notes', icon: FiEdit3 },
        {
          id: 'client-selector',
          type: 'custom',
          render: () => {
            const filteredClients = clientsList.filter(client => {
              if (selectedService && client.service !== selectedService) {
                return false;
              }
              const name = (client.companyName || client.name || '').toLowerCase();
              return name.includes(clientSearchQuery.toLowerCase());
            });

            return (
              <div className="px-4 py-2 mt-2 border-t border-[#F4F3EF] dark:border-gray-800 pt-4 relative text-left space-y-4">

                {/* 1. SELECT SERVICE */}
                <div className="relative">
                  <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.1em] mb-2 pl-1">Select Service</label>

                  <div className="relative">
                    {/* Service Select button trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowServiceDropdown(!showServiceDropdown);
                        setShowClientDropdown(false);
                      }}
                      className="w-full bg-[#F8FAFF] dark:bg-gray-800 hover:bg-[#F0F7FF] dark:hover:bg-gray-700 border border-[#F4F3EF] dark:border-gray-700 hover:border-[#1B4DA0]/30 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1A1A2E] dark:text-white outline-none flex items-center justify-between transition-all shadow-sm focus:ring-2 focus:ring-[#1B4DA0]/20"
                    >
                      <span className="truncate">{selectedService || 'All Services'}</span>
                      <FiChevronDown className="w-4 h-4 text-[#9B9BAD]" />
                    </button>

                    {/* Service Dropdown panel */}
                    {showServiceDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-[#F4F3EF] dark:border-gray-700 rounded-xl shadow-xl z-[999] p-2 space-y-2">
                        {/* Search box inside service dropdown */}
                        <div className="relative">
                          <input
                            type="text"
                            value={serviceSearchQuery}
                            onChange={(e) => setServiceSearchQuery(e.target.value)}
                            placeholder="Search services..."
                            className="w-full bg-[#F4F3EF] dark:bg-gray-900 border-none rounded-lg py-2 pl-8 pr-4 text-xs font-semibold text-[#1A1A2E] dark:text-white outline-none placeholder:text-[#9B9BAD]"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                            <FiSearch className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Services List */}
                        <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                          <div
                            onClick={() => {
                              setSelectedService('');
                              setServiceSearchQuery('');
                              setShowServiceDropdown(false);
                              setSelectedClient('');
                            }}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-slate-500`}
                          >
                            -- All Services --
                          </div>

                          {['eSSL', 'greytHR', 'Emgage', 'HROne']
                            .filter(s => s.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
                            .map((serviceName) => {
                              const isSelected = selectedService === serviceName;
                              return (
                                <div
                                  key={serviceName}
                                  onClick={() => {
                                    setSelectedService(serviceName);
                                    setShowServiceDropdown(false);
                                    setServiceSearchQuery('');

                                    // Reset selected client if they belong to a different service
                                    const currentClientObj = clientsList.find(c => (c.companyName || c.name) === selectedClient);
                                    if (currentClientObj && currentClientObj.service !== serviceName) {
                                      setSelectedClient('');
                                    }
                                  }}
                                  className={`px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${isSelected
                                      ? 'bg-[#0D47A1] text-white'
                                      : 'hover:bg-blue-50 dark:hover:bg-gray-700 text-[#1A1A2E] dark:text-white'
                                    }`}
                                >
                                  {serviceName}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. SELECT CLIENT */}
                <div className="relative">
                  <label className="block text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.1em] mb-2 pl-1">Select Client</label>
                  {clientsFetchError && <p className="text-[10px] text-rose-500 font-bold mb-2 pl-1">{clientsFetchError}</p>}

                  <div className="relative">
                    {/* Client Select button trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowClientDropdown(!showClientDropdown);
                        setShowServiceDropdown(false);
                      }}
                      className="w-full bg-[#F8FAFF] dark:bg-gray-800 hover:bg-[#F0F7FF] dark:hover:bg-gray-700 border border-[#F4F3EF] dark:border-gray-700 hover:border-[#1B4DA0]/30 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1A1A2E] dark:text-white outline-none flex items-center justify-between transition-all shadow-sm focus:ring-2 focus:ring-[#1B4DA0]/20"
                    >
                      <span className="truncate">{selectedClient || '-- Select a Client --'}</span>
                      <FiChevronDown className="w-4 h-4 text-[#9B9BAD]" />
                    </button>

                    {/* Client Dropdown panel */}
                    {showClientDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-[#F4F3EF] dark:border-gray-700 rounded-xl shadow-xl z-[999] p-2 space-y-2">
                        {/* Search box inside dropdown */}
                        <div className="relative">
                          <input
                            type="text"
                            value={clientSearchQuery}
                            onChange={(e) => setClientSearchQuery(e.target.value)}
                            placeholder="Search clients..."
                            className="w-full bg-[#F4F3EF] dark:bg-gray-900 border-none rounded-lg py-2 pl-8 pr-4 text-xs font-semibold text-[#1A1A2E] dark:text-white outline-none placeholder:text-[#9B9BAD]"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                            <FiSearch className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Client List */}
                        <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                          <div
                            onClick={() => {
                              setSelectedClient('');
                              setClientSearchQuery('');
                              setShowClientDropdown(false);
                            }}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-slate-500`}
                          >
                            -- None / Select a Client --
                          </div>

                          {filteredClients.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-slate-400 font-bold">
                              No clients found
                            </div>
                          ) : (
                            filteredClients.map((client) => {
                              const clientVal = client.companyName || client.name;
                              const isSelected = selectedClient === clientVal;
                              return (
                                <div
                                  key={client._id || client.id}
                                  onClick={() => {
                                    setSelectedClient(clientVal);
                                    setShowClientDropdown(false);
                                    setClientSearchQuery('');
                                  }}
                                  className={`px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center justify-between ${isSelected
                                      ? 'bg-[#0D47A1] text-white'
                                      : 'hover:bg-blue-50 dark:hover:bg-gray-700 text-[#1A1A2E] dark:text-white'
                                    }`}
                                >
                                  <span className="truncate">{clientVal}</span>
                                  {client.service && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isSelected
                                        ? 'bg-white/20 text-white'
                                        : 'bg-[#F4F3EF] dark:bg-gray-700 text-[#9B9BAD]'
                                      }`}>
                                      {client.service}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          }
        }
      ]
    },
    ...(selectedClient ? [{
      heading: 'Core Operations',
      items: [
        {
          id: 1,
          title: 'Attendance & Leave',
          icon: FiClock,
          submenu: [
            { id: 101, title: 'Monthly Attendance' },
            { id: 102, title: 'Correction & regularization' },
            { id: 103, title: 'Leave management' },
          ]
        },
        {
          id: 2,
          title: 'Payroll',
          icon: FaIndianRupeeSign,
          submenu: [
            { id: 201, title: 'Payroll-setup' },
            { id: 202, title: 'Salary' },
            { id: 203, title: 'Payroll Process' },
            { id: 204, title: 'Verification' },
            { id: 205, title: 'Payout' },
            { id: 206, title: 'Payslip' },
          ]
        },
        { id: 3, title: 'Onboarding', icon: FiUserPlus },
        { id: 7, title: 'Offboarding', icon: FiUserMinus },
        { id: 8, title: 'FnF', icon: FiCheckSquare },
        { id: 5, title: 'Master Data', icon: FiUsers },
        { id: 22, title: 'Employee', icon: FiUser },
        { id: 6, title: 'Performance', icon: FiTrendingUp },
        {
          id: 9,
          title: 'Documentation',
          icon: FiFileText,
          submenu: [
            { id: 301, title: 'Document verify' },
            { id: 302, title: 'Policy Making' },
            { id: 303, title: 'Compliance Management' },
            { id: 304, title: 'Work Agreement' },
          ]
        },
        { id: 14, title: 'Compliance', icon: FiShield },
        { id: 25, title: 'Client Review', icon: FiCheckSquare },
        { id: 19, title: 'Team Member', icon: FiUsers },
        { id: 20, title: 'Activity Feed', icon: FiActivity },
        { id: 23, title: 'Announcements', icon: FiBell },
      ]
    }] : [])
  ];

  useEffect(() => {
    localStorage.setItem('hroperations_active_tab', activeTab);
  }, [activeTab]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ id: '', name: 'HR Operations', role: 'HR Operations Head', avatar: '' });

  // Summary stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeOnboarding: 0,
    pendingPayroll: 0,
    attendanceRate: '0%',
  });

  const [statsBarData, setStatsBarData] = useState([
    { label: 'Active Employees', value: '0', percentage: '0%', color: 'bg-blue-500' },
    { label: 'On Leave', value: '0', percentage: '0%', color: 'bg-yellow-500' },
    { label: 'Pending Actions', value: '0', percentage: '0%', color: 'bg-orange-500' },
    { label: 'Compliance Rate', value: '0%', percentage: '0%', color: 'bg-green-500' },
    { label: 'Satisfaction', value: '0/5', percentage: '0%', color: 'bg-purple-500' },
  ]);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  // Date Filter State
  const [dateFilter, setDateFilter] = useState({
    filterType: 'all',
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    date: getLocalISODate(),
    startDate: '',
    endDate: ''
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const mainDateFilterRef = useRef(null);
  const dashboardDateInputRef = useRef(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  // Notes and Team States
  const [recentNotes, setRecentNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [noteSaving, setNoteSaving] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteEditForm, setNoteEditForm] = useState({ title: '', content: '' });
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [kamTeam, setKamTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  // Toast State & Helpers
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  // Generate years from 2020 to current year + 1
  const years = Array.from({ length: new Date().getFullYear() - 2019 + 1 }, (_, i) => 2020 + i);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Get filter label for display
  const getFilterLabel = () => {
    switch (dateFilter.filterType) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'quarter':
        return 'This Quarter';
      case 'last7days':
        return 'Last 7 Days';
      case 'year':
        return `Year: ${dateFilter.year}`;
      case 'month':
        return `${months[dateFilter.month]} ${dateFilter.year}`;
      case 'date':
        return new Date(dateFilter.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      case 'custom':
        return 'Custom Range';
      default:
        return 'All Time';
    }
  };

  const buildDateFilterParams = (filter = dateFilter) => {
    if (filter.filterType === 'today') {
      return { date: getLocalISODate() };
    }
    if (filter.filterType === 'week' || filter.filterType === 'last7days') {
      return {
        startDate: getLocalISODate(-6),
        endDate: getLocalISODate()
      };
    }
    if (filter.filterType === 'month') {
      return {
        year: filter.year,
        month: filter.month + 1
      };
    }
    if (filter.filterType === 'year') {
      return { year: filter.year };
    }
    if (filter.filterType === 'date') {
      return { date: filter.date };
    }
    if (filter.filterType === 'custom') {
      return {
        startDate: filter.startDate,
        endDate: filter.endDate
      };
    }
    return {};
  };

  const fetchNotifications = async (userId) => {
    if (!userId) return;
    try {
      const res = await getAllNotifications(userId);
      const notifs = (res.data || []).map((n) => ({
        id: n.id,
        text: n.message,
        time: new Date(n.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        read: n.status === 'read',
        type: n.type,
      }));
      setNotifications(notifs);
    } catch (e) {
      console.log('Notification fetch error');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (e) {
        /* ignore */
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.id || decoded.userId;
        if (userId) {
          await markAllNotificationsRead(userId);
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshUserInfo = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userRole = localStorage.getItem('userRole') || localStorage.getItem('userType') || decoded.role || decoded.userType || 'HR Operations Head';
        setUserInfo({
          id: decoded.id || decoded.userId || '',
          name: localStorage.getItem('userName') || decoded.name || '',
          email: decoded.email || localStorage.getItem('userEmail') || '',
          role: userRole,
          avatar: localStorage.getItem('userPicture') || decoded.picture || ''
        });
      } catch (e) {
        setUserInfo({ id: '', name: localStorage.getItem('userName') || 'HR Operations', role: localStorage.getItem('userRole') || 'HR Operations Head', avatar: localStorage.getItem('userPicture') || '' });
      }
    } else {
      setUserInfo({ id: '', name: localStorage.getItem('userName') || 'HR Operations', role: 'HR Operations Head', avatar: localStorage.getItem('userPicture') || '' });
    }
  };

  const fetchDashboardData = async (filter = dateFilter) => {
    setLoading(true);
    try {
      const filterParams = buildDateFilterParams(filter);
      const response = await getDepartmentDashboardStats('HR Operations', filterParams);
      if (response.success && response.stats) {
        const s = response.stats;
        setDashboardStats(s);

        setStats({
          totalEmployees: s.overview?.totalEmployees || 0,
          activeOnboarding: s.quickStats?.openPositions || 0,
          pendingPayroll: (s.payroll?.total || 0) - (s.payroll?.processed || 0),
          attendanceRate: s.overview?.attendanceRate || '0%',
        });

        if (s.bar) {
          setStatsBarData([
            { label: 'Active Employees', value: s.overview?.totalEmployees || 0, percentage: '100%', color: 'bg-blue-500' },
            { label: 'On Leave', value: s.bar.onLeave || 0, percentage: `${(((s.bar.onLeave || 0) / (s.overview?.totalEmployees || 1)) * 100).toFixed(0)}%`, color: 'bg-yellow-500' },
            { label: 'Pending Actions', value: s.bar.pendingActions || 0, percentage: '15%', color: 'bg-orange-500' },
            { label: 'Compliance Rate', value: `${s.quickStats?.docsVerified || 0}%`, percentage: `${s.quickStats?.docsVerified || 0}%`, color: 'bg-green-500' },
            { label: 'Satisfaction', value: s.bar.satisfaction || '0/5', percentage: '100%', color: 'bg-purple-500' },
          ]);
        }

        if (s.recentActivities) {
          setRecentActivities(s.recentActivities);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = () => {
    setShowDateFilter(false);
    fetchDashboardData(dateFilter);
  };

  const fetchKAMTeam = async () => {
    try {
      setTeamLoading(true);
      const res = await getAllKAMMembers('HR Operations');
      if (res && res.success) {
        setKamTeam(res.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch KAM team:', e);
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchRecentNotes = async () => {
    try {
      setNotesLoading(true);
      const response = await getDeptNotes({ department: 'HR Operations', limit: 5 });
      if (response?.success) {
        setRecentNotes(response.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent notes:', error);
      setRecentNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleCreateQuickNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) {
      showToast('Please enter both title and content', 'error');
      return;
    }

    try {
      setNoteSaving(true);
      const response = await createDeptNote({
        title: newNote.title,
        content: newNote.content,
        department: 'HR Operations'
      });

      if (response.success || response.id) {
        showToast('Note added successfully!', 'success');
        setNewNote({ title: '', content: '' });
        setShowAddNoteModal(false);
        fetchRecentNotes();
      } else {
        throw new Error(response.message || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      showToast(error.message || 'Could not save note', 'error');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleUpdateSelectedNote = async () => {
    if (!noteEditForm.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    try {
      setIsSavingNote(true);
      const noteId = selectedNote._id || selectedNote.id;
      const response = await updateDeptNote(noteId, {
        title: noteEditForm.title,
        content: noteEditForm.content,
        department: 'HR Operations'
      });

      if (response && (response.success || response.note)) {
        const updated = response.note || response.data;
        setSelectedNote(updated);
        fetchRecentNotes();
      }
    } catch (error) {
      console.error('Error updating note:', error);
      showToast(error.message || 'Could not update note', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      setIsSavingNote(true);
      await deleteDeptNote(id);
      showToast('Note deleted successfully', 'success');
      setSelectedNote(null);
      fetchRecentNotes();
    } catch (err) {
      showToast(err.message || 'Failed to delete note', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (mainDateFilterRef.current && !mainDateFilterRef.current.contains(event.target)) {
        setShowDateFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    refreshUserInfo();
    window.addEventListener('profileUpdate', refreshUserInfo);

    // Sync latest user profile from backend on mount
    getMyProfile()
      .then(res => {
        if (res && res.success && res.member) {
          const pic = res.member.picture || res.member.avatar || '';
          localStorage.setItem('userPicture', pic);
          if (res.member.name) {
            localStorage.setItem('userName', res.member.name);
          }
          refreshUserInfo();
        }
      })
      .catch(err => console.error('Failed to sync profile on mount:', err));

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        fetchNotifications(decoded.id || decoded.userId);
        fetchDashboardData(dateFilter);
        fetchRecentNotes();
        fetchKAMTeam();
      } catch (e) {
        console.log('Token decode error');
        fetchDashboardData(dateFilter);
        fetchRecentNotes();
        fetchKAMTeam();
      }
    } else {
      fetchDashboardData(dateFilter);
      fetchRecentNotes();
      fetchKAMTeam();
    }

    return () => window.removeEventListener('profileUpdate', refreshUserInfo);
  }, []);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'HR Operations', path: '/kam-operations-dashboard' },
    { label: activeTab }
  ];

  const getPipelineChartData = () => {
    const active = stats.totalEmployees || 0;
    const onLeave = dashboardStats?.bar?.onLeave || 0;
    const onboarding = stats.activeOnboarding || 0;
    return [
      { name: 'ACTIVE', value: active, color: '#6366F1' },
      { name: 'ON LEAVE', value: onLeave, color: '#F59E0B' },
      { name: 'ONBOARDING', value: onboarding, color: '#10B981' },
    ];
  };

  const getSummaryChartData = () => {
    const monthsShort = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const values = dashboardStats?.attendanceTrend || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    return monthsShort.map((month, idx) => ({
      name: month,
      'Attendance Rate': parseFloat(values[idx] || 0)
    }));
  };

  const renderNotificationBell = () => {
    const unreadCount = notifications.filter(n => n.status !== 'read' && !n.isRead && !n.read).length;
    return (
      <div className="relative inline-block text-left z-[9999]" ref={notificationRef}>
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFFDF9] to-[#FFF9E6] border border-[#F5E6C4] shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-[#D4AF37] hover:scale-105 active:scale-95 transition-all relative outline-none animate-none"
          title="Notifications"
        >
          <FiBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-[#D4AF37] text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#F4F3EF] overflow-hidden z-[99999]"
            >
              <div className="p-4 border-b border-[#F4F3EF] bg-[#FFFDF9] flex items-center justify-between">
                <h3 className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[3px]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[9px] font-black text-[#1B4DA0] uppercase tracking-wider hover:underline bg-transparent border-none p-0 cursor-pointer text-left font-syne"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F3EF] custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#9B9BAD]">
                    <FiBell size={32} className="mx-auto mb-3 opacity-20 text-[#D4AF37]" />
                    <p className="text-xs font-bold">No new alerts</p>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div
                      key={n.id || idx}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 hover:bg-[#FFFDF9]/40 cursor-pointer transition-colors text-left ${!n.read ? 'bg-[#FFFDF9]/70' : ''}`}
                    >
                      <p className={`text-[12px] text-[#1A1A2E] leading-tight ${!n.read ? 'font-bold' : 'font-medium'}`}>{n.text}</p>
                      <p className="text-[9px] text-[#9B9BAD] mt-1.5 font-bold uppercase tracking-wider">
                        {n.time || 'JUST NOW'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const statsBarDataMock = []; // Redundant with new state

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
            // Attendance & Leave Dropdown
            case 'Monthly Attendance':
              return <AttendanceTab selectedClient={selectedClient} />;
            case 'Correction & regularization':
              return <CorrectionRegularizationTab selectedClient={selectedClient} />;
            case 'Leave management':
              return <LeaveManagementTab selectedClient={selectedClient} />;

            // Payroll Dropdown
            case 'Payroll-setup':
              return <PayrollSetupTab isDarkMode={false} selectedClient={selectedClient} />;
            case 'Salary':
              return <SalaryTab isDarkMode={false} selectedClient={selectedClient} />;
            case 'Payroll Process':
              return <PayrollTab isDarkMode={false} selectedClient={selectedClient} />;
            case 'Verification':
              return <PayrollVerificationTab isDarkMode={false} selectedClient={selectedClient} />;
            case 'Payout':
              return <PayoutProcessingTab isDarkMode={false} selectedClient={selectedClient} />;
            case 'Payslip':
              return <EmployeePayslipsTab isDarkMode={false} selectedClient={selectedClient} />;

            // Core Items
            case 'Onboarding':
              return <OnboardingKamTab selectedClient={selectedClient} />;
            case 'Offboarding':
              return <OffboardingTab selectedClient={selectedClient} />;
            case 'FnF':
              return <FnFTab selectedClient={selectedClient} />;
            case 'Master Data':
              return <MasterDataTab selectedClient={selectedClient} />;
            case 'Performance':
              return <PerformanceTab isDarkMode={false} selectedClient={selectedClient} />;
            case 'Employee':
              return <ComingSoonPlaceholder title="Employee Directory" />;

            // Documentation Dropdown
            case 'Document verify':
              return <DocumentVerifyTab selectedClient={selectedClient} />;
            case 'Policy Making':
              return <PolicyTab selectedClient={selectedClient} />;
            case 'Compliance Management':
              return <ComplianceTab selectedClient={selectedClient} />;
            case 'Work Agreement':
              return <WorkAgreementTab selectedClient={selectedClient} />;

            case 'Compliance':
              return <ComplianceTab selectedClient={selectedClient} />;
            case 'Client Review':
              return <ClientReviewTab notificationBell={null} />;
            case 'Team Member':
              return <TeamManagementTab department="HR Operations" />;
            case 'Activity Feed':
              return <ActivityFeedTab department="HR Operations" />;
            case 'Announcements':
              return <AnnouncementsTab department="HR Operations" isHead={true} />;

            // Operations Head Specific Tabs
            case 'My Team':
              return <OperationsMyTeamTab department="HR Operations" isHead={true} />;
            case 'Task Assignment':
              return <OperationsTaskAssignmentTab department="HR Operations" />;
            case 'Help & Support':
              return <OperationsHelpSupportTab />;
            case 'MIS Reports':
              return <OperationsMISReportsTab department="HR Operations" />;
            case 'Notes':
              return <OperationsHeadNotesTab />;
            case 'My Profile':
              return <OperationsMyProfileTab onProfileUpdate={refreshUserInfo} />;
            case 'Clients':
              return <OperationsClientsTab notificationBell={null} />;

            // Legacy mappings (for safety)
            case 'Attendance':
              return <AttendanceTab selectedClient={selectedClient} />;
            case 'Payroll':
              return <PayrollTab selectedClient={selectedClient} />;
            case 'Leave Management':
              return <LeaveManagementTab selectedClient={selectedClient} />;
            case 'Master Data (Emp)':
              return <MasterDataTab selectedClient={selectedClient} />;
            case 'Team Members':
              return <TeamManagementTab department="HR Operations" />;
            default:
              // Dashboard Overview
              return (
                <div className="space-y-6">
                  {/* Sticky Welcome Header */}
                  <div className="sticky top-0 z-[30] bg-[#FDFDFD]/80 backdrop-blur-md -mt-6 -mx-6 px-6 py-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50">
                    <div className="flex flex-col items-start text-left">
                      <h2 className="text-3xl font-bold text-slate-900 mb-1">
                        Welcome {userInfo.name.split(' (')[0]}
                      </h2>
                    </div>
                    <div className="flex items-center flex-wrap md:flex-nowrap gap-3">
                      {renderNotificationBell()}

                      {/* Date Filter */}
                      <div className="relative" ref={mainDateFilterRef}>
                        <button
                          onClick={() => setShowDateFilter(!showDateFilter)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#0D47A1] text-white rounded-xl hover:bg-[#0a3a82] transition-all shadow-md hover:shadow-lg"
                        >
                          <FiCalendar className="w-4 h-4" />
                          <span className="font-medium">{getFilterLabel()}</span>
                          <svg className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Filter Dropdown */}
                        {showDateFilter && (
                          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden text-left">
                            <div className="p-4 border-b border-gray-100 bg-blue-50/50">
                              <p className="font-semibold text-gray-900">Select Time Period</p>
                            </div>

                            {/* Filter Type Tabs */}
                            <div className="flex border-b border-gray-100 flex-wrap">
                              {[
                                { key: 'all', label: 'All Time' },
                                { key: 'today', label: 'Today' },
                                { key: 'week', label: 'Week' },
                                { key: 'last7days', label: '7 Days' },
                                { key: 'month', label: 'Month' },
                                { key: 'year', label: 'Year' },
                                { key: 'custom', label: 'Custom' },
                              ].map((tab) => (
                                <button
                                  key={tab.key}
                                  onClick={() => setDateFilter({ ...dateFilter, filterType: tab.key })}
                                  className={`px-3 py-2 text-xs font-semibold transition-all ${dateFilter.filterType === tab.key
                                    ? 'text-[#0D47A1] border-b-2 border-[#0D47A1] bg-[#0D47A1]/10'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>

                            <div className="p-4">
                              {/* Year Selector */}
                              {(dateFilter.filterType === 'year' || dateFilter.filterType === 'month') && (
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-600 mb-2">Year</label>
                                  <select
                                    value={dateFilter.year}
                                    onChange={(e) => setDateFilter({ ...dateFilter, year: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                                  >
                                    {years.map((year) => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Month Selector */}
                              {dateFilter.filterType === 'month' && (
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-600 mb-2">Month</label>
                                  <select
                                    value={dateFilter.month}
                                    onChange={(e) => setDateFilter({ ...dateFilter, month: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                                  >
                                    {months.map((month, idx) => (
                                      <option key={idx} value={idx}>{month}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {dateFilter.filterType === 'custom' && (
                                <div className="space-y-3 mb-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Start Date</label>
                                    <input
                                      type="date"
                                      value={dateFilter.startDate}
                                      onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                                      className="w-full bg-[#F8FAFC] border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">End Date</label>
                                    <input
                                      type="date"
                                      value={dateFilter.endDate}
                                      onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                                      className="w-full bg-[#F8FAFC] border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Apply Button */}
                              <button
                                onClick={applyDateFilter}
                                className="w-full px-4 py-2.5 bg-[#0D47A1] text-white rounded-xl font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-blue-100 mt-2"
                              >
                                Apply Filter
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveTab('My Team')}
                        className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] hover:bg-[#0a3a82] text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg font-bold whitespace-nowrap"
                      >
                        <span>View Team</span>
                      </button>
                    </div>
                  </div>

                  {/* Stat Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard
                      title="Total Employees"
                      value={stats.totalEmployees}
                      icon={FiUsers}
                      trend="Active Employees"
                      color="white"
                    />
                    <StatCard
                      title="Active Onboarding"
                      value={stats.activeOnboarding}
                      icon={FiUserPlus}
                      trend="Onboarding"
                      color="white"
                    />
                    <StatCard
                      title="Pending Payroll"
                      value={stats.pendingPayroll}
                      icon={FaIndianRupeeSign}
                      trend="Pending Payments"
                      color="white"
                    />
                    <StatCard
                      title="Attendance Rate"
                      value={stats.attendanceRate}
                      icon={FiClock}
                      trend="Attendance Rate"
                      color="white"
                    />
                    <StatCard
                      title="Compliance Rate"
                      value={`${dashboardStats?.quickStats?.docsVerified || 92}%`}
                      icon={FiShield}
                      trend="Compliance Rate"
                      color="white"
                    />
                  </div>

                  {/* Chart Section Container - Side-by-Side Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 pb-4 border-b border-slate-50 relative">
                    {/* Workforce status card - left */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col p-8 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                      <div className="flex items-center justify-between mb-6 w-full">
                        <div className="flex flex-col text-left">
                          <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Workforce Pipeline</h3>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-6">
                        <div className="relative w-full h-[260px] flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getPipelineChartData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={105}
                                paddingAngle={6}
                                dataKey="value"
                                stroke="none"
                                animationDuration={1500}
                              >
                                {getPipelineChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-bold text-[#1A1A2E] font-sans">
                              {getPipelineChartData().reduce((acc, curr) => acc + curr.value, 0)}
                            </span>
                            <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.2em] mt-1 font-syne">TOTAL WORKFORCE</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="w-full flex justify-center gap-8 flex-wrap mt-4">
                          {getPipelineChartData().map((entry) => (
                            <div key={entry.name} className="flex flex-col items-center group">
                              <div className="w-6 h-1.5 rounded-full mb-3 transition-transform group-hover:scale-x-125 shadow-sm" style={{ backgroundColor: entry.color }} />
                              <span className="text-xl font-bold text-[#1A1A2E] leading-none mb-1 font-sans">{entry.value}</span>
                              <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.1em] font-syne">{entry.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Attendance Trend card - right */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col p-8 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 w-full gap-4">
                        <div className="flex flex-col text-left">
                          <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Attendance Trend</h3>
                        </div>
                      </div>

                      <div className="w-full h-[300px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getSummaryChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'Syne' }}
                              dy={15}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: 'Syne' }}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                padding: '12px 16px',
                                fontFamily: 'Syne',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}
                              cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                            />
                            <Bar
                              dataKey="Attendance Rate"
                              fill="#6366F1"
                              radius={[4, 4, 0, 0]}
                              barSize={12}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Sections Grid (3-column layout) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 w-full">
                    {/* Recent Activities */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col h-full transition-all hover:shadow-xl hover:shadow-[#3FA9F5]/5">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-[#E3F2FD80] text-[#3FA9F5] shadow-sm">
                            <FiActivity className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight font-syne text-left">Recent Activities</h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[360px] pr-2">
                        {recentActivities && recentActivities.length > 0 ? (
                          <div className="space-y-4">
                            {recentActivities.map((activity, idx) => {
                              const Icon = activity.actionType === 'task' ? FiCheckSquare :
                                activity.actionType === 'leave' ? FiCalendar :
                                  activity.actionType === 'payroll' ? FaIndianRupeeSign :
                                    FiActivity;
                              const bgColor = activity.actionType === 'task' ? 'bg-violet-100 text-violet-600' :
                                activity.actionType === 'leave' ? 'bg-blue-100 text-blue-600' :
                                  activity.actionType === 'payroll' ? 'bg-amber-100 text-amber-600' :
                                    'bg-emerald-100 text-emerald-600';

                              return (
                                <div key={activity.id || idx} className="flex gap-4 items-start p-3 rounded-2xl hover:bg-slate-50 transition-all text-left">
                                  <div className={`p-2 rounded-xl ${bgColor} flex-shrink-0`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-700 leading-tight">{activity.description}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">
                                      {new Date(activity.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {activity.performedByName}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-gray-400 text-xs">
                            No recent activities
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col h-full transition-all hover:shadow-xl hover:shadow-emerald-500/5">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-[#E3F2FD80] text-[#1B4DA0] shadow-sm">
                            <FiCheckSquare className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight font-syne text-left">Quick Actions</h3>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(localStorage.getItem('userType') === 'superadmin' || localStorage.getItem('userEmail') === 'ashwin.mabicons@gmail.com') && (
                          <button
                            onClick={() => setActiveTab('Onboarding')}
                            className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 text-left group"
                          >
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform">
                              <FiUserPlus className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-gray-700">Add Employee</span>
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTab('Monthly Attendance')}
                          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform">
                            <FiClock className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">Mark Attendance</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Payroll Process')}
                          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-600 group-hover:scale-105 transition-transform">
                            <FaIndianRupeeSign className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">Process Payroll</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Leave management')}
                          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-violet-300 hover:bg-violet-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-violet-100 text-violet-600 group-hover:scale-105 transition-transform">
                            <FiCalendar className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">Manage Leaves</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Document verify')}
                          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-rose-300 hover:bg-rose-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-rose-100 text-rose-600 group-hover:scale-105 transition-transform">
                            <FiFile className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">Verify Documents</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('Performance')}
                          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all duration-200 text-left group"
                        >
                          <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 group-hover:scale-105 transition-transform">
                            <FiTrendingUp className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">View Performance</span>
                        </button>
                      </div>
                    </div>

                    {/* Announcements Widget */}
                    <div>
                      <AnnouncementsWidget department="HR Operations" />
                    </div>
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
      dashboardTitle="HR Operations"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={[]}
      isLoading={loading}
      bottomTabName="My Profile"
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default HROperationsDashboard;
