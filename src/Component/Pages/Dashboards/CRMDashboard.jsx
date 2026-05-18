import { useEffect, useMemo, useState, useRef, lazy, Suspense, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiUserPlus,
  FiTrendingUp,
  FiTarget,
  FiDollarSign,
  FiRefreshCw,
  FiDownload,
  FiX,
  FiPlus,
  FiSearch,
  FiFilePlus,
  FiChevronDown,
  FiChevronRight,
  FiUpload,
  FiMail,
  FiLock,
  FiPhone,
  FiTrash,
  FiFileText,
  FiBriefcase,
  FiCalendar,
  FiEdit3,
  FiGrid,
  FiLayout,
  FiLayers,
  FiClipboard,
  FiShare2,
  FiUser,
  FiActivity,
  FiZap,
  FiCheckSquare,
  FiMapPin,
  FiClock,
  FiHelpCircle,
  FiBell,
} from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import AdminLayout, { StatCard, StatsBar, DataTable } from './AdminLayout';
import { getAllClients, getAllLeads, getBDMetrics, clientSignup, getAllNotifications, markNotificationRead, markAllNotificationsRead } from '../service/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ClientPipelineTab from './Tabs/CRM/ClientPipelineTab';
import CRMTeamTab from './Tabs/CRM/CRMTeamTab';
import MyProfileTab from './Tabs/Common/MyProfileTab';
import AccountsTab from './Tabs/CRM/AccountsTab';
const MeetingWithClientTab = lazy(() => import('./Tabs/CRM/MeetingWithClientTab'));
const NotesTab = lazy(() => import('./Tabs/KAM/NotesTab'));
const ClientReportingTab = lazy(() => import('./Tabs/CRM/ClientReportingTab'));
const CompleteOnboardingTab = lazy(() => import('./Tabs/CRM/CompleteOnboardingTab'));
const ClientsTab = lazy(() => import('./Tabs/CRM/ClientsTab'));
const EmployeeHelpSupportTab = lazy(() => import('./Tabs/Common/EmployeeHelpSupportTab'));
const PolicyTab = lazy(() => import('./Tabs/KAM/PolicyTab'));
const SuperAdminInternalSupportTab = lazy(() => import('./Tabs/Common/SuperAdminInternalSupportTab'));
const SuperAdminExternalSupportTab = lazy(() => import('./Tabs/Common/SuperAdminExternalSupportTab'));

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const INITIAL_PIPELINE_CLIENTS = [
  {
    id: "1",
    companyName: "TechNova Solutions",
    contactPerson: "Rajesh Kumar",
    email: "rajesh@technova.com",
    phone: "+91 98765 43210",
    industry: "Information Technology",
    value: "₹25,00,000",
    stage: "Finalize",
    location: "Bangalore",
    lastContact: "2024-03-20",
    avatar: "TN",
    owner: "Sanya Gupta"
  },
  {
    id: "2",
    companyName: "Global Retail Corp",
    contactPerson: "Anita Sharma",
    email: "anita.s@globalretail.com",
    phone: "+91 87654 32109",
    industry: "Retail",
    value: "₹12,50,000",
    stage: "All Clients",
    location: "Delhi",
    lastContact: "2024-03-21",
    avatar: "GR",
    owner: "Rahul Mehta"
  },
  {
    id: "3",
    companyName: "Zenith Manufacturing",
    contactPerson: "Vikram Singh",
    email: "vikram@zenithmfg.in",
    phone: "+91 76543 21098",
    industry: "Manufacturing",
    value: "₹45,00,000",
    stage: "Finalize",
    location: "Pune",
    lastContact: "2024-03-18",
    avatar: "ZM",
    owner: "Sanya Gupta"
  },
  {
    id: "4",
    companyName: "BlueSky Logistics",
    contactPerson: "Priya Verma",
    email: "p.verma@bluesky.com",
    phone: "+91 65432 10987",
    industry: "Logistics",
    value: "₹8,00,000",
    stage: "All Clients",
    location: "Hyderabad",
    lastContact: "2024-03-22",
    avatar: "BL",
    owner: "Rahul Mehta"
  },
  {
    id: "5",
    companyName: "Evergreen Wellness",
    contactPerson: "Dr. Arun Joshi",
    email: "arun@evergreen.org",
    phone: "+91 54321 09876",
    industry: "Healthcare",
    value: "₹30,00,000",
    stage: "Generate Password",
    location: "Chennai",
    lastContact: "2024-03-15",
    avatar: "EW",
    owner: "Sanya Gupta",
    portalPassword: 'AB123',
    portalEmail: 'evergreen.admin@mabicons.com'
  }
];

const sidebarConfig = [
  {
    items: [
      { id: 6, title: 'All Employees', icon: FiUsers },
      { id: 12, title: 'All Clients', icon: FiBriefcase },
      { id: 3, title: 'Client Pipeline', icon: FiActivity },
      { id: 5, title: 'Reports', icon: FiClipboard },
      {
        id: 'Help & Support',
        title: 'Help & Support',
        icon: FiHelpCircle,
        submenu: [
          { id: 'Internal', title: 'Internal' },
          { id: 'External', title: 'External' },
        ]
      },
      { id: 'HR Policy', title: 'HR Policy', icon: FiClipboard },
      { id: 8, title: 'Notes', icon: FiFileText },
    ]
  }
];

const STAGE_COLORS = {
  "All Clients": {
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
    count: "bg-slate-100 text-slate-600",
  },
  "Finalize": {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    count: "bg-amber-100 text-amber-600",
  },
  "Generate Password": {
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-400",
    count: "bg-purple-100 text-purple-600",
  },
};

const getAvatarColor = (name) => {
  // Returns a consistent light blue theme
  return 'bg-[#EEF2FB] text-[#1B4DA0]';
};

const dashboardStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
    transition: all 0.3s;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #e2e8f0 transparent;
  }
`;

const CRMDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('crm_active_tab') || 'Dashboard');
  const [loading, setLoading] = useState(true);

  // Notifications State & Logic
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.id || decoded.userId;
        if (userId) {
          const res = await getAllNotifications(userId);
          setNotifications(res?.notifications || res || []);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id || n.id === id ? { ...n, isRead: true, read: true } : n));
    } catch (e) {
      console.error(e);
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
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length;

  const renderNotificationBell = () => {
    return (
      <div className="relative" ref={notificationRef}>
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFFDF9] to-[#FFF9E6] border border-[#F5E6C4] shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-[#D4AF37] hover:scale-105 active:scale-95 transition-all relative outline-none"
          title="Notifications"
        >
          <FiBell className="w-5 h-5 animate-pulse" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
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
                    className="text-[9px] font-black text-[#1B4DA0] uppercase tracking-wider hover:underline"
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
                      key={n._id || n.id || idx}
                      onClick={() => handleMarkRead(n._id || n.id)}
                      className={`p-4 hover:bg-[#FFFDF9]/40 cursor-pointer transition-colors text-left ${(!n.isRead && !n.read) ? 'bg-[#FFFDF9]/70' : ''}`}
                    >
                      <p className={`text-[12px] text-[#1A1A2E] leading-tight ${(!n.isRead && !n.read) ? 'font-bold' : 'font-medium'}`}>{n.message}</p>
                      <p className="text-[9px] text-[#9B9BAD] mt-1.5 font-bold uppercase tracking-wider">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : n.time || 'JUST NOW'}
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

  useEffect(() => {
    localStorage.setItem('crm_active_tab', activeTab);
  }, [activeTab]);
  const [clients, setClients] = useState([]);
  const [pipelineClients, setPipelineClients] = useState(INITIAL_PIPELINE_CLIENTS);
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    rep: 'All',
    segment: 'All',
  });
  const [userInfo, setUserInfo] = useState({ name: 'User', role: 'CRM', picture: '' });

  const refreshUserInfo = () => {
    setUserInfo({
      name: localStorage.getItem('userName') || 'User',
      role: localStorage.getItem('userType') || 'CRM',
      picture: localStorage.getItem('userPicture') || ''
    });
  };

  useEffect(() => {
    refreshUserInfo();
  }, []);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    filterType: 'all',
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    date: new Date().toISOString().split('T')[0],
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const mainDateFilterRef = useRef(null);
  const dashboardDateInputRef = useRef(null);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getLocalISODate = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const parseDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const d = new Date(value);
    if (!isNaN(d)) return d;
    return null;
  };

  const inRange = useCallback((date) => {
    const d = parseDate(date);
    if (!d) return true;
    const s = filters.startDate ? new Date(filters.startDate) : null;
    const e = filters.endDate ? new Date(filters.endDate) : null;
    if (s && d < s) return false;
    if (e && d > e) return false;
    return true;
  }, [filters.startDate, filters.endDate]);

  const getRepName = (lead) => {
    return lead.owner?.name || lead.bdOwner?.name || lead.assignedTo?.name || lead.owner || lead.bdOwner || lead.assignedTo || 'Unassigned';
  };

  const getSegment = (lead) => {
    return lead.segment || lead.status || 'Unknown';
  };

  const getFilterLabel = () => {
    switch (dateFilter.filterType) {
      case 'all': return 'All Time';
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'quarter': return 'This Quarter';
      case 'last7days': return 'Last 7 Days';
      case 'year': return `${dateFilter.year}`;
      case 'month': return `${months[dateFilter.month]} ${dateFilter.year}`;
      case 'date': return new Date(dateFilter.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      case 'range': return 'Custom Range';
      default: return 'All Time';
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const created = l.createdAt || l.created_on || l.date || l.created_at || null;
      if (!inRange(created)) return false;
      if (filters.rep !== 'All' && getRepName(l) !== filters.rep) return false;
      if (filters.segment !== 'All' && getSegment(l) !== filters.segment) return false;

      const leadDate = parseDate(created);
      if (!leadDate) return true;

      if (dateFilter.filterType === 'today') {
        const today = new Date();
        return leadDate.toDateString() === today.toDateString();
      }
      if (dateFilter.filterType === 'week') {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return leadDate >= weekStart;
      }
      if (dateFilter.filterType === 'quarter') {
        const now = new Date();
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const itemQuarter = Math.floor(leadDate.getMonth() / 3);
        return itemQuarter === currentQuarter && leadDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter.filterType === 'last7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return leadDate >= sevenDaysAgo;
      }
      if (dateFilter.filterType === 'year') {
        return leadDate.getFullYear() === dateFilter.year;
      }
      if (dateFilter.filterType === 'month') {
        return leadDate.getFullYear() === dateFilter.year && leadDate.getMonth() === dateFilter.month;
      }
      if (dateFilter.filterType === 'date') {
        const filterDateString = dateFilter.date; // YYYY-MM-DD
        const leadDateString = leadDate.toISOString().split('T')[0];
        return leadDateString === filterDateString;
      }
      if (dateFilter.filterType === 'range') {
        const start = new Date(dateFilter.startDate);
        const end = new Date(dateFilter.endDate);
        end.setHours(23, 59, 59, 999);
        return leadDate >= start && leadDate <= end;
      }

      return true;
    });
  }, [leads, filters, dateFilter, inRange]);

  const openDatePicker = (ref) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === 'function') {
        ref.current.showPicker();
      } else {
        ref.current.focus();
        ref.current.click();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mainDateFilterRef.current && !mainDateFilterRef.current.contains(event.target)) {
        setShowDateFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [clientQuery, setClientQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [offerData, setOfferData] = useState({
    candidateName: '',
    candidateEmail: '',
    client: '',
    ctc: '',
    joiningDate: '',
    address: '',
    offerDate: new Date().toISOString().split('T')[0]
  });
  const logoInputRef = useRef(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewClient(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const [newClient, setNewClient] = useState({
    companyName: '',
    corporateAddress: '',
    contactNumber: '',
    gstNumber: '',
    numberOfCompanies: '',
    website: '',
    logoUrl: '',
    spocName: '',
    spocEmail: '',
    spocContact: '',
    authorizedSignatoryName: '',
    authorizedSignatoryEmail: '',
    authorizedSignatoryContact: '',
    ownerName: '',
    ownerEmail: '',
    ownerContact: '',
    category: [],
    documents: [],
  });

  const validateField = (name, value) => {
    let error = '';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case 'companyName':
        if (!value?.trim()) error = 'Company Name is required';
        break;
      case 'spocEmail':
      case 'authorizedSignatoryEmail':
      case 'ownerEmail':
        if (value && !emailRe.test(value)) error = 'Invalid email format';
        if (name === 'spocEmail' && !value) error = 'SPOC Email is required';
        break;
      case 'spocName':
        if (!value?.trim()) error = 'SPOC Name is required';
        break;
      case 'gstNumber':
        if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
          error = 'Invalid GST format';
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const checkDuplicate = () => {
    const exists = clients.find(c =>
      (c.companyName?.toLowerCase() === newClient.companyName?.toLowerCase()) ||
      (newClient.gstNumber && c.gstNumber === newClient.gstNumber)
    );
    if (exists) {
      toast.error(`Client already exists: ${exists.companyName}`);
      return true;
    }
    return false;
  };

  const nextStep = () => {
    let canProceed = true;
    if (formStep === 1) {
      canProceed = validateField('companyName', newClient.companyName);
    } else if (formStep === 2) {
      canProceed = validateField('spocName', newClient.spocName) && validateField('spocEmail', newClient.spocEmail);
    }
    if (canProceed) setFormStep(prev => prev + 1);
  };

  const prevStep = () => setFormStep(prev => prev - 1);

  const toggleSelection = (id) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedClients.length > 0 && selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c._id || c.id));
    }
  };

  const deleteMultipleClients = async (ids) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} clients?`)) return;
    toast.success(`Deleted ${ids.length} clients`);
    fetchData();
    setSelectedClients([]);
  };

  useEffect(() => {
    const rawToken = localStorage.getItem('token');
    if (rawToken) {
      try {
        const token = String(rawToken).replace(/^"|"$/g, '').trim();
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = JSON.parse(window.atob(base64));
          setUserInfo({
            name: decoded.name || decoded.email?.split('@')[0] || 'User',
            role: decoded.role || 'CRM',
          });
        }
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, leadsRes] = await Promise.allSettled([
        getAllClients(),
        getAllLeads(),
      ]);
      const bdMetricsRes = await Promise.allSettled([getBDMetrics()]);

      const clientList = clientsRes.status === 'fulfilled'
        ? (clientsRes.value.data?.clients || clientsRes.value.clients || clientsRes.value || [])
        : [];
      setClients(Array.isArray(clientList) ? clientList : []);

      const leadList = leadsRes.status === 'fulfilled'
        ? (leadsRes.value.data?.leads || leadsRes.value.leads || leadsRes.value || [])
        : [];
      setLeads(Array.isArray(leadList) ? leadList : []);

      const m = bdMetricsRes[0].status === 'fulfilled'
        ? (bdMetricsRes[0].value.data || bdMetricsRes[0].value || null)
        : null;
      setMetrics(m);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCustomers = clients.length;
  const totalLeads = filteredLeads.length;
  const converted = filteredLeads.filter(l => String(l.status || '').toLowerCase() === 'converted').length;
  const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;
  const pipelineOpen = filteredLeads.filter(l => {
    const s = String(l.status || '').toLowerCase();
    return ['in progress', 'follow up', 'proposal', 'negotiation', 'open', 'new', 'qualified'].includes(s);
  }).length;
  const cac = metrics?.cac || metrics?.customerAcquisitionCost || null;
  const ltv = metrics?.ltv || metrics?.lifetimeValue || null;

  const reps = useMemo(() => {
    const set = new Set(leads.map(getRepName).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [leads]);

  const segments = useMemo(() => {
    const set = new Set(leads.map(getSegment).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [leads]);

  const monthlySeries = useMemo(() => {
    const map = new Map();
    filteredLeads.forEach(l => {
      const d = parseDate(l.createdAt || l.created_on || l.date || l.created_at) || new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    const keys = Array.from(map.keys()).sort();
    const values = keys.map(k => map.get(k));
    return { labels: keys, values };
  }, [filteredLeads]);

  const statusCounts = useMemo(() => {
    const map = new Map();
    filteredLeads.forEach(l => {
      const s = l.status || 'Unknown';
      map.set(s, (map.get(s) || 0) + 1);
    });
    const labels = Array.from(map.keys());
    const values = labels.map(l => map.get(l));
    return { labels, values };
  }, [filteredLeads]);

  const repPerf = useMemo(() => {
    const map = new Map();
    filteredLeads.forEach(l => {
      const rep = getRepName(l);
      const isConverted = String(l.status || '').toLowerCase() === 'converted' ? 1 : 0;
      const obj = map.get(rep) || { leads: 0, converted: 0 };
      obj.leads += 1;
      obj.converted += isConverted;
      map.set(rep, obj);
    });
    const labels = Array.from(map.keys());
    const leadsData = labels.map(r => map.get(r).leads);
    const convData = labels.map(r => map.get(r).converted);
    return { labels, leadsData, convData };
  }, [filteredLeads]);

  const pieData = {
    labels: statusCounts.labels,
    datasets: [{
      data: statusCounts.values,
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#94A3B8'],
      borderWidth: 0,
    }]
  };

  const lineData = {
    labels: monthlySeries.labels,
    datasets: [{
      label: 'Leads',
      data: monthlySeries.values,
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.35,
    }]
  };

  const barData = {
    labels: repPerf.labels,
    datasets: [
      {
        label: 'Leads',
        data: repPerf.leadsData,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
      },
      {
        label: 'Converted',
        data: repPerf.convData,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      }
    ]
  };

  const statsBarData = [
    { label: 'New Leads', value: String(totalLeads), percentage: totalLeads ? '100%' : '0%', color: 'bg-blue-500' },
    { label: 'Pipeline Open', value: String(pipelineOpen), percentage: totalLeads ? `${Math.round(pipelineOpen / totalLeads * 100)}%` : '0%', color: 'bg-indigo-500' },
    { label: 'Converted', value: String(converted), percentage: totalLeads ? `${Math.round(converted / totalLeads * 100)}%` : '0%', color: 'bg-green-500' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, percentage: `${conversionRate}%`, color: 'bg-purple-500' },
    { label: 'Reps', value: String(Math.max(0, reps.length - 1)), percentage: '100%', color: 'bg-teal-500' },
  ];

  const handleExport = () => {
    const rows = [['Section', 'Name', 'Value']];
    rows.push(['KPI', 'Total Customers', totalCustomers]);
    rows.push(['KPI', 'New Leads', totalLeads]);
    rows.push(['KPI', 'Converted', converted]);
    rows.push(['KPI', 'Conversion Rate', `${conversionRate}%`]);
    rows.push(['KPI', 'Pipeline Open', pipelineOpen]);
    rows.push(['KPI', 'CAC', cac ?? '']);
    rows.push(['KPI', 'LTV', ltv ?? '']);
    statusCounts.labels.forEach((l, i) => rows.push(['Pipeline', l, statusCounts.values[i]]));
    monthlySeries.labels.forEach((l, i) => rows.push(['Trend', l, monthlySeries.values[i]]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'CRM', path: '/crm-dashboard' },
    { label: activeTab }
  ];

  const handleClientInput = (e) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleCreateClient = async () => {
    if (checkDuplicate()) return;

    setSubmitting(true);
    try {
      toast.dismiss();
      toast.loading('Onboarding client...');

      const payload = {
        name: newClient.spocName,
        email: newClient.spocEmail,
        companyName: newClient.companyName,
        corporateAddress: newClient.corporateAddress,
        contactNumber: newClient.spocContact || newClient.contactNumber,
        gstNumber: newClient.gstNumber,
        panNumber: newClient.panNumber,
        cinNumber: newClient.cinNumber,
        numberOfCompanies: newClient.numberOfCompanies,
        website: newClient.website || null,
        authorizedSignatory: {
          name: newClient.authorizedSignatoryName,
          email: newClient.authorizedSignatoryEmail,
          contact: newClient.authorizedSignatoryContact,
        },
        ownerDirectorDetails: [
          {
            name: newClient.ownerName,
            email: newClient.ownerEmail,
            contact: newClient.ownerContact,
          }
        ],
        logoUrl: newClient.logoUrl || null,
        category: newClient.category,
      };

      const res = await clientSignup(payload);
      if (res.status === 'success' || res.success) {
        toast.dismiss();
        toast.success('Client onboarded successfully!');

        // Simulate sending credentials to client email
        setTimeout(() => {
          toast.success(`Credentials sent to ${newClient.spocEmail}`, {
            icon: '📧',
            duration: 5000,
          });
        }, 1500);

        setShowSuccess(true);
        fetchData();
      } else {
        throw new Error(res.message || 'Failed to onboard client');
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Error connecting to server');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      sidebarItems={sidebarConfig}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dashboardTitle="CRM Dashboard"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      showSearch={false}
      showGlobalHeader={false}
      isLoading={loading}
      bottomTabName="My Profile"
      notifications={notifications}
    >
      <div style={{ fontFamily: "'Calibri', sans-serif" }}>
        <style>{dashboardStyles}</style>
        <div className="space-y-6 pt-0">
          <AnimatePresence mode="wait">
            {/* Other tabs will render placeholders below */}

            {activeTab === 'Dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Sticky Welcome Header */}
                <div className="sticky top-0 z-[30] bg-[#FDFDFD]/80 backdrop-blur-md -mt-4 lg:-mt-6 -mx-4 lg:-mx-6 px-4 lg:px-8 py-6 border-b border-[#F4F3EF] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-left">
                    <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>
                      Welcome {userInfo.name.split(' ')[0]}
                    </h1>
                  </div>
                  <div className="flex items-center flex-wrap md:flex-nowrap gap-3">
                    {renderNotificationBell()}
                    {/* Date Filter Component */}
                    <div className="relative" ref={mainDateFilterRef}>
                      <button
                        onClick={() => setShowDateFilter(!showDateFilter)}
                        className="px-5 py-2.5 bg-white border border-[#F4F3EF] text-[#1A1A2E] rounded-xl text-sm font-bold shadow-sm hover:border-[#E8E7E2] transition-all flex items-center gap-2 active:scale-95"
                      >
                        <FiCalendar className="w-4 h-4 text-[#1B4DA0]" />
                        <span className="whitespace-nowrap">{getFilterLabel()}</span>
                        <FiChevronDown className={`w-3.5 h-3.5 ml-1 text-[#9B9BAD] transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown UI */}
                      <AnimatePresence>
                        {showDateFilter && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#F4F3EF] z-50 overflow-hidden text-left"
                          >
                            <div className="p-6 border-b border-[#F4F3EF] bg-[#FAFAFA]">
                              <p className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Select Time Period</p>
                            </div>

                            <div className="flex border-b border-[#F4F3EF] bg-[#FDFDFD]">
                              {[
                                { key: 'all', label: 'All' },
                                { key: 'today', label: 'Today' },
                                { key: 'week', label: 'Week' },
                                { key: 'last7days', label: '7 Days' },
                                { key: 'month', label: 'Month' },
                                { key: 'quarter', label: 'Quarter' },
                                { key: 'year', label: 'Year' },
                                { key: 'date', label: 'Day' }
                              ].map((tab) => (
                                <button
                                  key={tab.key}
                                  onClick={() => setDateFilter({ ...dateFilter, filterType: tab.key })}
                                  className={`flex-1 px-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${dateFilter.filterType === tab.key
                                    ? 'text-[#1B4DA0] bg-white border-b-2 border-[#1B4DA0]'
                                    : 'text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-[#F4F3EF]'
                                    }`}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>

                            <div className="p-6 space-y-6">
                              {dateFilter.filterType === 'all' && (
                                <div className="py-4 text-center">
                                  <p className="text-xs font-bold text-[#6B6B7E]">Showing all available data.</p>
                                </div>
                              )}

                              {dateFilter.filterType === 'last7days' && (
                                <div className="py-4 text-center">
                                  <p className="text-xs font-bold text-[#6B6B7E]">Showing data from last 7 days.</p>
                                </div>
                              )}

                              {(dateFilter.filterType === 'year' || dateFilter.filterType === 'month' || dateFilter.filterType === 'date') && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Year</label>
                                    <select
                                      value={dateFilter.year}
                                      onChange={(e) => setDateFilter({ ...dateFilter, year: parseInt(e.target.value) })}
                                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3 text-sm font-bold text-[#1A1A2E] outline-none transition-all appearance-none cursor-pointer"
                                    >
                                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                  </div>

                                  {(dateFilter.filterType === 'month' || dateFilter.filterType === 'date') && (
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Month</label>
                                      <select
                                        value={dateFilter.month}
                                        onChange={(e) => setDateFilter({ ...dateFilter, month: parseInt(e.target.value) })}
                                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3 text-sm font-bold text-[#1A1A2E] outline-none transition-all appearance-none cursor-pointer"
                                      >
                                        {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                      </select>
                                    </div>
                                  )}

                                  {dateFilter.filterType === 'date' && (
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Select Date</label>
                                        <input
                                          type="date"
                                          value={dateFilter.date}
                                          onChange={(e) => setDateFilter({ ...dateFilter, date: e.target.value })}
                                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3 text-sm font-bold text-[#1A1A2E] outline-none"
                                        />
                                      </div>
                                      <div className="flex flex-wrap gap-2 pt-2">
                                        <button onClick={() => setDateFilter({ ...dateFilter, date: getLocalISODate(), filterType: 'date' })} className="flex-1 px-3 py-2 bg-[#F4F3EF] text-[#1A1A2E] rounded-xl text-[9px] font-black uppercase hover:bg-blue-50 transition-all">Today</button>
                                        <button onClick={() => setDateFilter({ ...dateFilter, date: getLocalISODate(-1), filterType: 'date' })} className="flex-1 px-3 py-2 bg-[#F4F3EF] text-[#1A1A2E] rounded-xl text-[9px] font-black uppercase hover:bg-blue-50 transition-all">Yesterday</button>
                                        <button onClick={() => setDateFilter({ ...dateFilter, filterType: 'last7days' })} className="flex-1 px-3 py-2 bg-[#F4F3EF] text-[#1A1A2E] rounded-xl text-[9px] font-black uppercase hover:bg-blue-50 transition-all">7 Days</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <button
                                onClick={() => setShowDateFilter(false)}
                                className="w-full py-4 bg-[#1B4DA0] text-white rounded-[20px] text-xs font-black uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:bg-[#0D47A1] transition-all"
                              >
                                Apply Filter
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={() => setActiveTab('My Team')}
                      className="px-6 py-2.5 bg-[#0D47A1] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 hover:bg-[#0a3a82] transition-all flex items-center justify-center min-w-max active:scale-95"
                    >
                      View Team
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <StatCard
                    title="New Leads"
                    value={totalLeads}
                    icon={FiTrendingUp}
                    color="white"
                  />
                  <StatCard
                    title="Pipeline Open"
                    value={pipelineOpen}
                    icon={FiActivity}
                    color="white"
                    change={totalLeads ? `${Math.round(pipelineOpen / totalLeads * 100)}%` : '0%'}
                  />
                  <StatCard
                    title="Converted"
                    value={converted}
                    icon={FiZap}
                    color="white"
                    change={totalLeads ? `${Math.round(converted / totalLeads * 100)}%` : '0%'}
                  />
                  <StatCard
                    title="Conv. Rate"
                    value={`${conversionRate}%`}
                    icon={FiTarget}
                    color="white"
                  />
                  <StatCard
                    title="Sales Reps"
                    value={Math.max(0, reps.length - 1)}
                    icon={FiUsers}
                    color="white"
                  />
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
                    <div className="flex items-center justify-between mb-8 text-left">
                      <div>
                        <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Performance Trend</h3>

                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#F8FAFF] flex items-center justify-center text-[#1B4DA0]">
                        <FiActivity size={20} />
                      </div>
                    </div>
                    <div className="h-80">
                      <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                  </div>
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
                    <div className="flex items-center justify-between mb-8 text-left">
                      <div>
                        <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Market Segmentation</h3>

                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#F8FAFF] flex items-center justify-center text-[#1B4DA0]">
                        <FiGrid size={20} />
                      </div>
                    </div>
                    <div className="h-80">
                      <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 25, font: { weight: 'bold', size: 10, family: 'Calibri' } } } } }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
                  <div className="flex items-center justify-between mb-8 text-left">
                    <div>
                      <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Team Performance Analysis</h3>

                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                        <span className="text-[10px] font-bold text-[#6B6B7E] uppercase">Total Leads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-bold text-[#6B6B7E] uppercase">Converted</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-96">
                    <Bar
                      data={barData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { stacked: false, grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#F4F3EF' } } },
                      }}
                    />
                  </div>
                </div>

                {/* Recent Leads Section */}
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-[#F4F3EF]">
                  <div className="flex items-center justify-between mb-8 text-left">
                    <div>
                      <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Recent Leads</h3>
                    </div>

                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#F4F3EF]">
                          {["Company", "Contact", "Status", "Date"].map((h, i) => (
                            <th key={i} className="pb-4 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F4F3EF]">
                        {filteredLeads.slice(0, 5).map((l) => (
                          <tr
                            key={l._id || l.id}
                            onClick={() => setSelectedLeadDetail(l)}
                            className="group cursor-pointer hover:bg-[#F8FAFF] transition-all"
                          >
                            <td className="py-4 text-left">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${getAvatarColor(l.companyDetails?.name || l.companyName)}`}>
                                  {(l.companyDetails?.name || l.companyName || 'L').substring(0, 1).toUpperCase()}
                                </div>
                                <span className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">
                                  {l.companyDetails?.name || l.companyName || 'Unknown'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-sm font-medium text-[#6B6B7E] text-left">
                              {l.contactPerson?.name || l.personName || 'N/A'}
                            </td>
                            <td className="py-4 text-left">
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                                {l.status || 'New'}
                              </span>
                            </td>
                            <td className="py-4 text-[13px] font-bold text-[#1A1A2E] text-left">
                              <div className="flex flex-col">
                                <span>{new Date(l.createdAt || l.date || Date.now()).toLocaleDateString()}</span>
                                <span className="text-[10px] text-[#9B9BAD] font-medium">{new Date(l.createdAt || l.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'Client Pipeline' && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ClientPipelineTab clients={pipelineClients} setClients={setPipelineClients} notificationBell={renderNotificationBell()} />
              </motion.div>
            )}

            {activeTab === 'All Clients' && (
              <motion.div
                key="all-clients"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<div className="py-20 text-center"><div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
                  <ClientsTab notificationBell={renderNotificationBell()} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'All Employees' && (
              <motion.div
                key="all-employees"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CRMTeamTab department="" notificationBell={renderNotificationBell()} />
              </motion.div>
            )}

            {activeTab === 'Reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<div className="p-12 text-center text-[#9B9BAD]">Preparing Analytics...</div>}>
                  <ClientReportingTab clients={clients} notificationBell={renderNotificationBell()} />
                </Suspense>
              </motion.div>
            )}

            {(activeTab === 'Help & Support' || activeTab === 'Internal') && (
              <motion.div
                key="internal-support"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<div className="py-20 text-center"><div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
                  <SuperAdminInternalSupportTab notificationBell={renderNotificationBell()} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'External' && (
              <motion.div
                key="external-support"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<div className="py-20 text-center"><div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
                  <SuperAdminExternalSupportTab notificationBell={renderNotificationBell()} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'HR Policy' && (
              <motion.div
                key="hr-policy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<div className="py-20 text-center"><div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
                  <PolicyTab isDarkMode={false} notificationBell={renderNotificationBell()} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'Notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<div className="py-20 text-center"><div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
                  <NotesTab notificationBell={renderNotificationBell()} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'My Profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <MyProfileTab onProfileUpdate={refreshUserInfo} />
              </motion.div>
            )}



            {activeTab === 'Leads' && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-left">
                    <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Business Leads</h1>
                    <p className="text-sm font-medium text-[#9B9BAD] mt-1">Manage and track potential business opportunities</p>
                  </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden relative">
                  <div className="overflow-x-auto min-h-[400px]">
                    <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1.5fr_80px] gap-4 px-8 py-5 border-b border-[#F4F3EF] bg-transparent">
                      {["Company", "Contact", "Source", "Status", "Created At", ""].map((h, i) => (
                        <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">
                          {h}
                        </div>
                      ))}
                    </div>

                    {filteredLeads.length > 0 ? filteredLeads.map((l) => (
                      <div
                        key={l._id || l.id}
                        onClick={() => setSelectedLeadDetail(l)}
                        className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1.5fr_80px] gap-4 items-center px-8 py-4 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${getAvatarColor(l.companyDetails?.name || l.companyName || 'Lead')}`}>
                            {(l.companyDetails?.name || l.companyName || 'L').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#1B4DA0] transition-colors">{l.companyDetails?.name || l.companyName || 'Unknown'}</p>
                            <p className="text-[11px] text-[#64748b] truncate font-medium">{l.companyDetails?.location || l.location || 'Remote'}</p>
                          </div>
                        </div>

                        <div className="text-left">
                          <p className="text-[13px] font-bold text-[#0f172a]">{l.contactPerson?.name || l.personName || 'N/A'}</p>
                          <p className="text-[11px] text-[#64748b] truncate">{l.contactPerson?.email || l.personEmail || ''}</p>
                        </div>

                        <div className="text-left text-[12px] font-bold text-[#64748b] uppercase tracking-wider">
                          {l.source || 'Direct'}
                        </div>

                        <div className="text-left">
                          <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                            {l.status || 'New'}
                          </span>
                        </div>

                        <div className="text-left text-[12px] font-bold text-[#64748b]">
                          {new Date(l.createdAt || l.date || Date.now()).toLocaleDateString()}
                        </div>

                        <div className="flex justify-end">
                          <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#1B4DA0] transition-all" />
                        </div>
                      </div>
                    )) : (
                      <div className="py-24 text-center">
                        <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">No leads found in this period</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isAddOpen && createPortal(
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  {/* Header with Progress */}
                  <div className="sticky top-0 z-20 px-10 py-10 border-b border-[#F4F3EF] bg-white">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-black text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>
                          {showSuccess ? 'Onboarding Complete' : 'Create New Client'}
                        </h2>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[4px] mt-2">
                          {showSuccess ? 'Detailed Summary' : `Step ${formStep} of 4: ${['Company Info', 'Contacts', 'Preferences', 'Documents'][formStep - 1]}`}
                        </p>
                      </div>
                      {!submitting && (
                        <button
                          onClick={() => setIsAddOpen(false)}
                          className="w-14 h-14 rounded-2xl bg-[#F4F3EF] text-[#1A1A2E] hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center shadow-sm border border-[#E8E7E2]"
                        >
                          <FiX className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                    {!showSuccess && (
                      <div className="flex gap-3 h-2 w-full bg-[#F4F3EF] rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map(s => (
                          <div key={s} className={`flex-1 transition-all duration-700 ease-out ${formStep >= s ? 'bg-[#0D47A1]' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {showSuccess ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 text-center py-6">
                        <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                          <FiTarget className="w-14 h-14" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-3xl font-black text-[#1A1A2E] tracking-tight">{newClient.companyName}</h3>
                          <p className="text-sm font-black text-[#9B9BAD] uppercase tracking-[2px]">Successfully onboarded to ecosystem</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-left max-w-lg mx-auto bg-[#FAFAF9] p-10 rounded-[40px] border border-[#F4F3EF] shadow-sm">
                          <div>
                            <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 px-1">GST Registry</p>
                            <p className="text-sm font-bold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF]">{newClient.gstNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 px-1">Lead SPOC</p>
                            <p className="text-sm font-bold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF]">{newClient.spocName}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 px-1">Account Mail</p>
                            <p className="text-sm font-bold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF]">{newClient.spocEmail}</p>
                          </div>
                          <div className="col-span-2 pt-6 border-t border-[#F4F3EF] mt-2">
                            <div className="flex items-center gap-3 text-emerald-600 mb-2">
                              <FiMail className="w-4 h-4" />
                              <p className="text-[10px] font-black uppercase tracking-[2px]">Credentials Dispatched</p>
                            </div>
                            <p className="text-[11px] text-[#6B6B7E] font-medium leading-relaxed">System access details has been securely dispatched to the SPOC's registered email address.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setIsAddOpen(false); setShowSuccess(false); setFormStep(1); }}
                          className="px-14 py-5 bg-[#0D47A1] text-white rounded-2xl text-[11px] font-black uppercase tracking-[3px] shadow-xl shadow-blue-500/20 hover:bg-[#0a3a82] active:scale-95 transition-all"
                        >
                          Access Directory
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={e => e.preventDefault()} className="space-y-12">
                        <AnimatePresence mode="wait">
                          {formStep === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Company Name *</label>
                                  <input name="companyName" value={newClient.companyName} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner ${errors.companyName ? 'border-red-500/20 bg-red-50/10' : ''}`} placeholder="e.g. Rominios Pizza" />
                                  {errors.companyName && <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-widest">{errors.companyName}</p>}
                                </div>
                                <div className="space-y-3">
                                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">GST Number</label>
                                  <input name="gstNumber" value={newClient.gstNumber} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner ${errors.gstNumber ? 'border-red-500/20 bg-red-50/10' : ''}`} placeholder="22AAAAA0000A1Z5" />
                                  {errors.gstNumber && <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-widest">{errors.gstNumber}</p>}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Digital Website</label>
                                  <input name="website" value={newClient.website} onChange={handleClientInput} className="w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner" placeholder="https://..." />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">HQ Corporate Address</label>
                                <textarea name="corporateAddress" value={newClient.corporateAddress} onChange={handleClientInput} rows={3} className="w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner resize-none min-h-[120px]" placeholder="Enter full physical address..." />
                              </div>
                            </motion.div>
                          )}

                          {formStep === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                              <div className="space-y-8">
                                <h4 className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[4px] pl-1 border-l-4 border-[#0D47A1] leading-none mb-6">Primary Contact Node</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Node Name *</label>
                                    <input name="spocName" value={newClient.spocName} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner ${errors.spocName ? 'border-red-500/20 bg-red-50/10' : ''}`} placeholder="Full Name" />
                                    {errors.spocName && <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-widest">{errors.spocName}</p>}
                                  </div>
                                  <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Email Terminal *</label>
                                    <input name="spocEmail" type="email" value={newClient.spocEmail} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner ${errors.spocEmail ? 'border-red-500/20 bg-red-50/10' : ''}`} placeholder="email@example.com" />
                                    {errors.spocEmail && <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-widest">{errors.spocEmail}</p>}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-8 pt-10 border-t border-[#F4F3EF]">
                                <h4 className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[4px] pl-1 border-l-4 border-[#0D47A1] leading-none mb-6">Commercial Stakeholder</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <input name="ownerName" value={newClient.ownerName} onChange={handleClientInput} className="bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10" placeholder="Owner Name" />
                                  <input name="ownerEmail" value={newClient.ownerEmail} onChange={handleClientInput} className="bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10" placeholder="Owner Email" />
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {formStep === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Brand Assets</label>
                                <div className="flex items-center gap-10 p-10 bg-[#FAFAF9] rounded-[48px] border-2 border-dashed border-[#F4F3EF] group hover:border-[#0D47A1]/20 transition-all">
                                  <div
                                    onClick={() => logoInputRef.current?.click()}
                                    className="w-32 h-32 rounded-[32px] bg-white flex items-center justify-center border-2 border-[#F4F3EF] overflow-hidden group hover:border-[#0D47A1]/40 transition-all cursor-pointer relative shadow-sm"
                                  >
                                    {newClient.logoUrl ? (
                                      <>
                                        <img src={newClient.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <FiRefreshCw className="text-white w-8 h-8 animate-spin-slow" />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-2xl bg-[#F8FAFF] flex items-center justify-center text-[#9B9BAD] group-hover:text-[#0D47A1] transition-all">
                                          <FiUpload size={24} />
                                        </div>
                                        <span className="text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest">Brand Logo</span>
                                      </div>
                                    )}
                                    <input
                                      type="file"
                                      ref={logoInputRef}
                                      onChange={handleLogoChange}
                                      accept="image/*"
                                      className="hidden"
                                    />
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <p className="text-lg font-black text-[#1A1A2E] tracking-tight">Identity Canvas</p>
                                      {newClient.logoUrl && (
                                        <button
                                          onClick={() => setNewClient(p => ({ ...p, logoUrl: '' }))}
                                          className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all"
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-[2px] leading-relaxed">
                                      Maximum resolution: 2048px.<br />
                                      Formats: Transparent PNG, SVG, JPG.
                                    </p>
                                    {newClient.logoUrl && (
                                      <div className="flex items-center gap-2 text-emerald-600 bg-white px-4 py-2 rounded-xl border border-emerald-100 w-fit">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Asset Locked</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-6">
                                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Strategic Markets</label>
                                <div className="flex flex-wrap gap-3">
                                  {['Retail', 'Tech', 'Healthcare', 'Finance', 'Logistics', 'Food', 'Auto', 'EdTech'].map(cat => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => {
                                        const has = newClient.category.includes(cat);
                                        setNewClient(p => ({ ...p, category: has ? p.category.filter(c => c !== cat) : [...p.category, cat] }));
                                      }}
                                      className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[3px] border-2 transition-all duration-300 ${newClient.category.includes(cat) ? 'bg-[#0D47A1] border-[#0D47A1] text-white shadow-xl shadow-blue-500/10 -translate-y-1' : 'bg-white border-[#F4F3EF] text-[#9B9BAD] hover:border-[#0D47A1]/20 hover:text-[#1A1A2E]'}`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {formStep === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                              <div className="border-2 border-dashed border-[#F4F3EF] rounded-[48px] p-16 text-center space-y-6 hover:border-[#0D47A1]/20 transition-all cursor-pointer bg-[#FAFAF9] group">
                                <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mx-auto text-[#0D47A1] group-hover:scale-110 transition-transform">
                                  <FiDownload className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xl font-black text-[#1A1A2E] tracking-tight">Contractual Repository</p>
                                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">PDF Archive, DOCX up to 15MB</p>
                                </div>
                              </div>
                              <div className="bg-amber-50/50 p-8 rounded-[32px] border border-amber-100 flex gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-amber-100/50 shrink-0">
                                  <FiTarget className="w-7 h-7" />
                                </div>
                                <div className="space-y-1 pt-1">
                                  <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest pl-1">Compliance Check</p>
                                  <p className="text-xs font-bold text-amber-800 leading-relaxed opacity-80">Final submission acknowledges that all data adheres to corporate vetting standards.</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Footer Actions */}
                        <div className="flex gap-6 pt-10 border-t border-[#F4F3EF]">
                          {formStep > 1 ? (
                            <button type="button" onClick={prevStep} className="flex-1 h-16 rounded-[24px] border-2 border-[#F4F3EF] text-[11px] font-black uppercase tracking-[3px] text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Previous Phase</button>
                          ) : (
                            <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 h-16 rounded-[24px] border-2 border-[#F4F3EF] text-[11px] font-black uppercase tracking-[3px] text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Abort Action</button>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98, y: 0 }}
                            type="button"
                            onClick={formStep < 4 ? nextStep : handleCreateClient}
                            disabled={submitting}
                            className={`flex-[2] h-16 bg-[#0D47A1] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[3px] shadow-2xl shadow-blue-500/30 hover:bg-[#0a3a82] transition-all ${submitting ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                          >
                            {submitting ? 'Synchronizing Node...' : (formStep < 4 ? 'Advance Phase' : 'Commit Onboarding')}
                          </motion.button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              </div>,
              document.body
            )}
          </AnimatePresence>

          {/* Generate Offer Modal */}
          <AnimatePresence>
            {isOfferOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOfferOpen(false)}
                  className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="relative w-full max-w-6xl bg-[#F8FAFF] rounded-[48px] shadow-2xl overflow-hidden flex h-[85vh]"
                >
                  {/* Left: Form */}
                  <div className="w-1/2 p-8 overflow-y-auto bg-white space-y-6 relative" style={{ fontFamily: "'Calibri', sans-serif" }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Generate New Offer</h3>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mt-1">Offer Lifecycle Management</p>
                      </div>
                      <button onClick={() => setIsOfferOpen(false)} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#1A1A2E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                        <FiX size={20} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Candidate Name</label>
                          <div className="relative">
                            <FiUserPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              value={offerData.candidateName}
                              onChange={e => setOfferData(p => ({ ...p, candidateName: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10"
                              placeholder="Search candidate..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email Address</label>
                          <div className="relative">
                            <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              value={offerData.candidateEmail}
                              onChange={e => setOfferData(p => ({ ...p, candidateEmail: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10"
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Hiring Client</label>
                          <div className="relative">
                            <FiBriefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <select
                              value={offerData.client}
                              onChange={e => setOfferData(p => ({ ...p, client: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-10 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select Client</option>
                              {clients.map(c => <option key={c.id} value={c.companyName}>{c.companyName}</option>)}
                              <option value="Voltiq Energy">Voltiq Energy</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Proposed CTC (Monthly)</label>
                          <div className="relative">
                            <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              value={offerData.ctc}
                              onChange={e => setOfferData(p => ({ ...p, ctc: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10"
                              placeholder="e.g. 15,000"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Offer Date</label>
                          <div className="relative">
                            <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              type="date"
                              value={offerData.offerDate}
                              onChange={e => setOfferData(p => ({ ...p, offerDate: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Joining Date</label>
                          <div className="relative">
                            <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              type="date"
                              value={offerData.joiningDate}
                              onChange={e => setOfferData(p => ({ ...p, joiningDate: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Permanent Address</label>
                        <textarea
                          value={offerData.address}
                          onChange={e => setOfferData(p => ({ ...p, address: e.target.value }))}
                          rows={3}
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none resize-none"
                          placeholder="Naga road, kali mandir, Raxaul..."
                        />
                      </div>

                      <div className="pt-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            toast.success('Offer Letter generated and sent to ' + offerData.candidateEmail);
                            setIsOfferOpen(false);
                          }}
                          className="w-full py-5 bg-[#0D47A1] text-white rounded-[24px] font-black uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-3"
                        >
                          <FiMail size={18} />
                          Generate & Send to Candidate
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Right: PDF Preview */}
                  <div className="w-1/2 bg-[#525659] p-12 overflow-y-auto flex justify-center">
                    <div className="w-[595px] h-[842px] bg-white shadow-2xl relative p-12 font-serif text-[#1A1A2E] text-[11px] leading-relaxed">
                      {/* Template Header */}
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-32">
                          {offerData.client === 'Voltiq Energy' ? (
                            <div className="space-y-1">
                              <div className="text-[#2E7D32] font-black text-2xl flex items-center gap-1">
                                voltiq <div className="w-4 h-4 bg-[#0D47A1] rounded-full" />
                              </div>
                              <p className="text-[8px] font-bold text-[#9B9BAD] uppercase tracking-widest">Energy Solutions</p>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-[#F4F3EF] rounded-xl flex items-center justify-center text-[#9B9BAD] font-bold">Logo</div>
                          )}
                        </div>
                        <div className="text-right text-[8px] text-[#9B9BAD] space-y-0.5">
                          <p className="font-bold text-[#1A1A2E]">{offerData.client || 'Company Name'}</p>
                          <p>GSTIN: 08AABFV3593B1ZM</p>
                          <p>Phone: +91 7300435820</p>
                          <p>Mail: info@voltiqenergy.com</p>
                          <p>ADDRESS: 5th Floor, 89, HNB, New</p>
                          <p>Aatish Market, Mansarovar, Jaipur- 302021</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <p className="font-bold">Date: {offerData.offerDate ? new Date(offerData.offerDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</p>
                          <p className="font-bold">Mr. {offerData.candidateName || 'Candidate Name'}</p>
                        </div>

                        <div>
                          <p className="font-bold text-[9px] uppercase tracking-widest text-[#9B9BAD]">Permanent address:-</p>
                          <p className="whitespace-pre-line">{offerData.address || '—'}</p>
                        </div>

                        <div className="text-center py-2 border-y border-[#F4F3EF]">
                          <p className="font-bold uppercase tracking-widest">Subject: Appointment Letter – {offerData.client || 'Company'}</p>
                        </div>

                        <p>Dear {offerData.candidateName?.split(' ')[0] || 'Candidate'},</p>

                        <p>
                          Further to the Offer Letter dated {offerData.offerDate ? new Date(offerData.offerDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}, we are pleased to formally appoint you as "<span className="font-bold text-[#0D47A1]">Sales Partner</span>" with {offerData.client || 'Company'} on a full-time basis. Your date of joining is {offerData.joiningDate ? new Date(offerData.joiningDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}.
                        </p>

                        <p>
                          You will be on a probation period of 3 (three) months from the date of joining. Upon successful completion of probation, you will be confirmed as a permanent employee. During probation, the Company reserves the right to terminate employment with 7 days' notice or salary in lieu thereof. You will be paid a salary of <span className="font-bold">₹{offerData.ctc || '0'} (Rupees {offerData.ctc ? 'Fifteen Thousand Only' : '—'})</span> per month conditional to the target given by the company.
                        </p>

                        <p>
                          Your reporting time is 9:30 AM daily, with working hours from 9:30 AM to 6:00 PM, Monday to Saturday. You are eligible for 1 casual leave during the period of your probation, with leave applications to be submitted at least one day in advance.
                        </p>

                        <div className="flex justify-between items-end pt-12">
                          <div className="space-y-1">
                            <p className="font-bold border-t border-[#1A1A2E] pt-2">{offerData.candidateName || 'Candidate Name'}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-[#0D47A1]">Kushagra Tandon</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest">Partner</p>
                            <p className="text-[9px] text-[#9B9BAD]">{offerData.client || 'Company'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Template Decoration */}
                      <div className="absolute top-0 right-0 w-32 h-1 bg-[#0D47A1]" />
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1A1A2E]" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Client Detail Drawer */}
          <AnimatePresence>
            {selectedClientDetail && createPortal(
              <>
                <motion.div
                  key="client-drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[12px] z-[99998]"
                  onClick={() => setSelectedClientDetail(null)}
                />
                <motion.div
                  key="client-drawer-content"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed right-0 top-0 h-full w-full sm:w-[680px] bg-white z-[99999] overflow-y-auto shadow-[-20px_0_80px_rgba(0,0,0,0.2)] flex flex-col"
                >
                  {/* Sticky Header */}
                  <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
                    <div className="flex-1 text-left">
                      <h2 className="text-2xl font-bold text-[#1A1A2E] leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Client Profile
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedClientDetail(null)}
                      className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm outline-none"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  <div className="flex-1 p-8 space-y-10 custom-scrollbar">
                    <div className="space-y-10">
                      {/* Hero Profile Section */}
                      <div className="flex flex-col items-center justify-center text-center py-4">
                        <div className="relative group">
                          <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-transform duration-500 border-4 border-white ${getAvatarColor(selectedClientDetail.companyName || selectedClientDetail.company || selectedClientDetail.name)}`}>
                            {String(selectedClientDetail.companyName || selectedClientDetail.company || selectedClientDetail.name || 'C').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-[#E8E7E2] shadow-lg flex items-center justify-center text-emerald-500">
                            <div className="absolute inset-0 bg-emerald-500 rounded-2xl flex items-center justify-center">
                              <FiCheckSquare size={18} className="text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 space-y-1 w-full text-center">
                          <h3 className="text-3xl font-black text-[#1A1A2E] tracking-tight flex items-center justify-center gap-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                            {selectedClientDetail.companyName || selectedClientDetail.company || selectedClientDetail.name}
                          </h3>
                          <div className="flex items-center justify-center gap-3 mt-1.5 overflow-hidden">
                            <span className="text-[12px] font-black text-[#1B4DA0] uppercase tracking-[4px]">{selectedClientDetail.industry || 'CLIENT'}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E8E7E2]" />
                            <span className={`text-[11px] font-black uppercase tracking-[4px] ${STAGE_COLORS[selectedClientDetail.stage]?.count?.split(' ')[1] || 'text-slate-600'}`}>
                              {selectedClientDetail.stage || 'ALL CLIENTS'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Information Grid Container */}
                      <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-10 space-y-10 shadow-sm">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                          <div className="space-y-2 text-left">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Location</span>
                            <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                              <FiMapPin size={16} className="text-[#1B4DA0] shrink-0" /> {selectedClientDetail.location || "Not specified"}
                            </p>
                          </div>
                          <div className="space-y-2 text-left">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Contact Person</span>
                            <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                              <FiUser size={16} className="text-[#1B4DA0] shrink-0" /> {selectedClientDetail.contactPerson || selectedClientDetail.owner || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-2 text-left">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Deal Value</span>
                            <p className="text-base font-black text-emerald-600 flex items-center gap-2">
                              <FiDollarSign size={16} className="shrink-0" /> {selectedClientDetail.value || '₹0'}
                            </p>
                          </div>
                          <div className="space-y-2 text-left">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Last Activity</span>
                            <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                              <FiClock size={16} className="text-[#1B4DA0] shrink-0" /> {selectedClientDetail.lastContact || "Updated Today"}
                            </p>
                          </div>
                        </div>

                        {/* Credentials Display */}
                        {(selectedClientDetail.portalPassword || selectedClientDetail.portalEmail) && (
                          <div className="p-8 bg-purple-50 rounded-[40px] border border-purple-100/50 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/30 rounded-bl-[80px] -mr-8 -mt-8" />
                            <div className="flex items-center gap-3 relative z-10">
                              <FiZap className="text-purple-500 fill-purple-500" size={20} />
                              <h4 className="text-base font-black text-purple-700 uppercase tracking-widest text-left">Portal Access Summary</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 text-left">
                              <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm text-left">
                                <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 text-left">User Email</p>
                                <p className="text-sm font-bold text-gray-800 break-all">{selectedClientDetail.portalEmail}</p>
                              </div>
                              <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm text-left">
                                <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">Default Password</p>
                                <p className="text-sm font-black text-purple-600 tracking-[4px]">{selectedClientDetail.portalPassword}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-8 bg-[#FAFAF9] rounded-[32px] border border-[#F4F3EF] gap-6">
                        <div className="flex items-center gap-4 flex-1 text-left">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0]">
                            <FiMail size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Official Email</p>
                            <p className="text-sm font-black text-[#1A1A2E] leading-tight break-all">{selectedClientDetail.email || selectedClientDetail.portalEmail || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-1 text-left">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0]">
                            <FiPhone size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Phone Record</p>
                            <p className="text-sm font-black text-[#1A1A2E]">{selectedClientDetail.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>,
              document.body
            )}
          </AnimatePresence>

          {/* Lead Detail Drawer */}
          <AnimatePresence>
            {selectedLeadDetail && createPortal(
              <>
                <motion.div
                  key="lead-drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[12px] z-[99998]"
                  onClick={() => setSelectedLeadDetail(null)}
                />
                <motion.div
                  key="lead-drawer-content"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed right-0 top-0 h-full w-full sm:w-[680px] bg-white z-[99999] overflow-y-auto shadow-[-20px_0_80px_rgba(0,0,0,0.2)] flex flex-col"
                >
                  <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
                    <div className="flex-1 text-left">
                      <h2 className="text-2xl font-bold text-[#1A1A2E] leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Lead Details
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedLeadDetail(null)}
                      className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm outline-none"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  <div className="flex-1 p-8 space-y-10 custom-scrollbar">
                    <div className="flex flex-col items-center justify-center text-center py-4">
                      <div className="relative group">
                        <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-transform duration-500 border-4 border-white ${getAvatarColor(selectedLeadDetail.companyDetails?.name || selectedLeadDetail.companyName)}`}>
                          {(selectedLeadDetail.companyDetails?.name || selectedLeadDetail.companyName || 'L').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#1B4DA0] border-4 border-white shadow-lg flex items-center justify-center text-white">
                          <FiTarget size={18} />
                        </div>
                      </div>
                      <div className="mt-8 space-y-1 w-full text-center">
                        <h3 className="text-3xl font-black text-[#1A1A2E] tracking-tight text-center" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {selectedLeadDetail.companyDetails?.name || selectedLeadDetail.companyName}
                        </h3>
                        <div className="flex items-center justify-center gap-3 mt-1.5 overflow-hidden">
                          <span className="text-[12px] font-black text-[#1B4DA0] uppercase tracking-[4px]">{selectedLeadDetail.status || 'NEW LEAD'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8E7E2]" />
                          <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[4px]">{selectedLeadDetail.source || 'DIRECT'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-10 space-y-10 shadow-sm">
                      <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Company Website</span>
                          <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                            <FiActivity size={16} className="text-[#1B4DA0] shrink-0" /> {selectedLeadDetail.companyDetails?.website || selectedLeadDetail.website || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Primary Location</span>
                          <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                            <FiMapPin size={16} className="text-[#1B4DA0] shrink-0" /> {selectedLeadDetail.companyDetails?.location || selectedLeadDetail.location || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Contact Person</span>
                          <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                            <FiUser size={16} className="text-[#1B4DA0] shrink-0" /> {selectedLeadDetail.contactPerson?.name || selectedLeadDetail.personName || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Est. Deal Value</span>
                          <p className="text-base font-black text-emerald-600 flex items-center gap-2">
                            <FiDollarSign size={16} className="shrink-0" /> {selectedLeadDetail.dealValue?.estimatedValue || selectedLeadDetail.value || '₹0'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-8 bg-[#FAFAF9] rounded-[32px] border border-[#F4F3EF] gap-6">
                      <div className="flex items-center gap-4 flex-1 text-left text-left">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0]">
                          <FiMail size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email Address</p>
                          <p className="text-sm font-black text-[#1A1A2E] leading-tight break-all">{selectedLeadDetail.contactPerson?.email || selectedLeadDetail.personEmail || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>,
              document.body
            )}
          </AnimatePresence>

          {/* Floating Notification Bell */}
          {!['Dashboard', 'Client Pipeline', 'All Clients', 'All Employees', 'Reports', 'Help & Support', 'Internal', 'External', 'HR Policy', 'Notes', 'My Profile'].includes(activeTab) && (
            <div className="fixed top-5 right-5 lg:right-6 z-[9999]" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFFDF9] to-[#FFF9E6] border border-[#F5E6C4] shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-[#D4AF37] hover:scale-105 active:scale-95 transition-all relative outline-none"
                title="Notifications"
              >
                <FiBell className="w-5 h-5 animate-pulse" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
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
                          className="text-[9px] font-black text-[#1B4DA0] uppercase tracking-wider hover:underline"
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
                            key={n._id || n.id || idx}
                            onClick={() => handleMarkRead(n._id || n.id)}
                            className={`p-4 hover:bg-[#FFFDF9]/40 cursor-pointer transition-colors text-left ${(!n.isRead && !n.read) ? 'bg-[#FFFDF9]/70' : ''}`}
                          >
                            <p className={`text-[12px] text-[#1A1A2E] leading-tight ${(!n.isRead && !n.read) ? 'font-bold' : 'font-medium'}`}>{n.message}</p>
                            <p className="text-[9px] text-[#9B9BAD] mt-1.5 font-bold uppercase tracking-wider">
                              {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : n.time || 'JUST NOW'}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CRMDashboard;  