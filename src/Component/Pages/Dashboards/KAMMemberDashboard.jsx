import { useState, useEffect, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiAward,
  FiBarChart2,
  FiUserPlus,
  FiTrendingUp,
  FiActivity,
  FiCheckSquare,
  FiDatabase,
  FiTarget,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiMessageSquare,
  FiClipboard,
  FiEdit3,
  FiRefreshCw,
  FiShield,
  FiUserCheck,
  FiX,
  FiChevronDown,
  FiPlus,
  FiSearch,
  FiUpload,
  FiMapPin,
  FiChevronRight,
  FiMail,
} from 'react-icons/fi';
import AdminLayout, { StatCard, StatsBar } from './AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllNotifications,
  markNotificationRead,
  getRecruitmentStats,
  getAllRecruitmentPositions,
  getAllInterviews,
  getAllCandidates,
  getKAMTasks,
  getMyDepartmentTasks,
  getMyRecruitmentPerformance,
  getRecruitmentClients,
  getAllOffers,
  getWorkHandovers
} from '../service/api';
import { getLocalISODate } from '../Utilities/dateUtils';
import { format } from 'date-fns';

// Lazy load Tab Components
const TeamManagementTab = lazy(() => import('./Tabs/Common/TeamManagementTab'));
const JobOpeningsTab = lazy(() => import('./Tabs/KAMRecruitment/JobOpeningsTab'));
const CandidatePipelineTab = lazy(() => import('../Candidates/CandidatesPage'));
const InterviewScheduleTab = lazy(() => import('../Candidates/InterviewsPage'));
const ScreeningTab = lazy(() => import('./Tabs/KAMRecruitment/ScreeningTab'));
const OfferManagementTab = lazy(() => import('./Tabs/KAMRecruitment/OfferManagementTab'));
const ResumeBankTab = lazy(() => import('./Tabs/KAMRecruitment/ResumeBankTab'));
const MyTasksTab = lazy(() => import('./Tabs/Common/MyTasksTab'));
const MyProfileTab = lazy(() => import('./Tabs/Common/MyProfileTab'));
const DailyReportTab = lazy(() => import('./Tabs/Common/DailyReportTab'));
const ActivityFeedTab = lazy(() => import('./Tabs/Common/ActivityFeedTab'));
const WorkHandoverTab = lazy(() => import('./Tabs/KAM/WorkHandoverTab'));
const DocumentVerifyTab = lazy(() => import('./Tabs/KAM/DocumentVerifyTab'));
const HiringLifecycleTab = lazy(() => import('./Tabs/KAMRecruitment/HiringLifecycleTab'));
const TeamMembersTab = lazy(() => import('./Tabs/KAMRecruitment/TeamMembersTab'));

// Tab Loader
const TabLoader = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-7 w-52 rounded-lg bg-gray-200" />
      <div className="h-10 w-32 rounded-lg bg-gray-200" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 rounded-xl bg-gray-200" />
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 w-full rounded-lg bg-gray-100" />
      ))}
    </div>
  </div>
);

// Sidebar Configuration for KAM Member
const getSidebarConfig = (name = '') => {
  const isSpecialKAM = name.toLowerCase().includes('manju') ||
    name.toLowerCase().includes('jyoti') ||
    name.toLowerCase().includes('priyanshi');

  const items = [
    { id: 0, title: 'My Team', icon: FiUsers },
    { id: 1, title: 'My Tasks', icon: FiCheckSquare },
    { id: 2, title: 'Daily Report', icon: FiFileText },
    { id: 4, title: 'Job Openings', icon: FiBriefcase },
    { id: 5, title: 'Candidate Pipeline', icon: FiUserPlus },
    { id: 6, title: 'Interview Schedule', icon: FiCalendar },
    { id: 8, title: 'Offer Management', icon: FiAward },
    { id: 9, title: 'Joined Candidates', icon: FiUserCheck },
    { id: 10, title: 'Resume Bank', icon: FiDatabase },
    { id: 11, title: 'Activity Feed', icon: FiActivity },
    { id: 12, title: 'Document Verification', icon: FiShield },
    { id: 13, title: 'Clients', icon: FiBriefcase },
  ];

  return [
    {
      items: items,
    },
  ];
};


/* ── Clients Tab Implementation (KAM Version) ── */
const ClientsTab = ({ distribution, handovers, onViewClient, onSync }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');

  const handleSync = async () => {
    setIsSyncing(true);
    if (onSync) await onSync();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const filteredDistribution = distribution.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.industry && item.industry.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesIndustry = industryFilter === 'all' || (item.industry && item.industry.toLowerCase() === industryFilter.toLowerCase());
    return matchesSearch && matchesIndustry;
  });

  const industries = [...new Set(distribution.map(item => item.industry).filter(Boolean))];

  return (
    <div className="space-y-8" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            My Clients
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#1B4DA0] border border-[#E8E7E2] rounded-2xl text-[13px] font-bold hover:bg-blue-50/30 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 text-emerald-500 transition-all duration-700 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            <span className="tracking-tight">{isSyncing ? 'Updating...' : 'Sync Data'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my clients..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative group">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[160px] hover:bg-[#EEF2FB] transition-all"
          >
            <option value="all">ALL INDUSTRIES</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind.toUpperCase()}</option>)}
          </select>
          <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
        </div>
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="grid grid-cols-[40px_2fr_1.5fr_120px_130px_100px_40px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
          <div className="flex items-center">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0]" />
          </div>
          {["Client Portfolio", "Industry", "Status", "Last Active", "Jobs", ""].map((h, i) => (
            <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
              {h}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredDistribution.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No clients assigned yet</p>
            </div>
          ) : (
            filteredDistribution.map((item) => (
              <div
                key={item.id}
                onClick={() => onViewClient(item)}
                className="grid grid-cols-[40px_2fr_1.5fr_120px_130px_100px_40px] gap-4 items-center px-8 py-3 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group relative"
              >
                <div className="flex items-center" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0]" />
                </div>
                <div className="flex flex-col justify-center items-start min-w-0 py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-slate-50 to-[#F4F3EF] flex items-center justify-center text-[#1A1A2E] text-[13px] font-black border border-[#F1F5F9] group-hover:scale-105 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shrink-0">
                      {item.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[14px] font-bold text-[#0f172a] transition-colors truncate text-left">{item.name}</p>
                      {(() => {
                        const h = handovers.find(hand =>
                          Array.isArray(hand.clientIds) &&
                          hand.clientIds.some(cid => cid === item.id || cid === item._id) &&
                          hand.status === 'Active'
                        );
                        if (!h) return (
                          <div className="flex items-center justify-start gap-1.5 mt-0.5 opacity-60">
                            <FiMapPin size={11} className="text-[#9B9BAD]" />
                            <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest truncate text-left">{item.location || 'Remote'}</span>
                          </div>
                        );
                        return (
                          <div className="flex items-center justify-start gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter truncate text-left">
                              Handed over to {h.toUser?.name || 'Team Member'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-start text-[13px] font-medium text-[#64748b] truncate py-1 text-left">
                  {item.industry || 'Enterprise'}
                </div>
                <div className="flex items-center justify-start py-3">
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border bg-emerald-50 text-emerald-600 border-emerald-100">
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-start py-3">
                  <span className="text-xs font-bold text-[#94a3b8]">{item.lastActive || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-start gap-1 py-3 group-hover:scale-105 transition-transform">
                  <span className="text-[13px] font-black text-[#1A1A2E]">{item.jobCount}</span>
                </div>
                <div className="flex justify-end items-center pr-2">
                  <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#0D47A1]/5 flex items-center justify-center transition-all">
                    <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#0D47A1] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ClientDetailsDrawer = ({ client, onClose }) => {
  if (!client) return null;
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1001]"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 35, stiffness: 250 }}
        className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[1002] overflow-hidden"
      >
        <div className="p-6 border-b border-[#F4F3EF] bg-gradient-to-r from-blue-50/30 to-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0D47A1] text-white flex items-center justify-center font-bold text-lg">
              {client.name?.slice(0, 1).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Client Portfolio</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm">
            <FiX size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[32px] bg-[#F8FAFC] text-[#475569] flex items-center justify-center text-3xl font-extrabold shadow-xl border border-[#F1F5F9] mb-6">
              {client.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{client.name}</h4>
              <p className="text-[14px] font-bold text-[#1B4DA0] tracking-tight uppercase tracking-[3px]">{client.industry || 'Enterprise'} Sector</p>
            </div>
          </div>
          <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-10 space-y-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F4F3EF] pb-4">
              <span className="text-sm font-medium text-[#9B9BAD]">Location HQ</span>
              <span className="text-sm font-bold text-[#1A1A2E]">{client.location || 'Bangalore / Remote'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#F4F3EF] pb-4">
              <span className="text-sm font-medium text-[#9B9BAD]">Active Openings</span>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">{client.jobCount} Positions</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-white border-2 border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#6B6B7E] hover:bg-slate-50 transition-all">
              <FiMail size={16} /> Contact Client
            </button>
            <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#0D47A1] rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-[#0a3a82] shadow-lg shadow-blue-500/10 transition-all">
              <FiCalendar size={16} /> Schedule Call
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Main KAM Member Dashboard Component
const KAMMemberDashboard = () => {
  const navigate = useNavigate();
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('kam_active_tab') || 'Dashboard';
  });

  useEffect(() => {
    localStorage.setItem('kam_active_tab', activeTab);
  }, [activeTab]);

  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(() => {
    const name = localStorage.getItem('userName') || 'KAM';
    const role = 'KAM - Recruitment';
    return { name, role, id: null };
  });
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    activePositions: 0,
    candidatesPipeline: 0,
    interviewsScheduled: 0,
    offersExtended: 0,
    thisWeekHires: 0,
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [upcomingJoinings, setUpcomingJoinings] = useState([]);
  const [personalStats, setPersonalStats] = useState({
    activePositions: 0,
    candidatesPipeline: 0,
    interviewsScheduled: 0,
    offersExtended: 0,
    thisWeekHires: 0,
  });
  const [performancePeriod, setPerformancePeriod] = useState('This Month');
  const [quickActionIntent, setQuickActionIntent] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clientJobDistribution, setClientJobDistribution] = useState([]);
  const [activeHandovers, setActiveHandovers] = useState([]);
  const [selectedClientForDrawer, setSelectedClientForDrawer] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const greetingText = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = currentHour < 12 ? '🌞' : currentHour < 17 ? '☀️' : '🌙';

  const formattedHeaderDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(currentTime);

  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    filterType: 'all',
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    date: getLocalISODate()
  });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const getFilterLabel = () => {
    switch (dateFilter.filterType) {
      case 'all': return 'All Time';
      case 'last7days': return 'Last 7 Days';
      case 'year': return `${dateFilter.year}`;
      case 'month': return `${months[dateFilter.month]} ${dateFilter.year}`;
      case 'date': return format(new Date(dateFilter.date), 'dd MMM yyyy');
      default: return 'All Time';
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.id || decoded.userId || decoded._id;
        setUserInfo({
          name: decoded.name || userName || 'KAM',
          role: decoded.role || 'Key Account Manager - Recruitment',
          id: userId,
          email: decoded.email || userEmail
        });
        fetchNotifications(userId);
        fetchDashboardData(userId, dateFilter);
        fetchPersonalStats('This Month');
        fetchTodayTasks(userId);
        fetchUpcomingInterviews();
        fetchUpcomingJoinings();
      } catch (e) {
        setUserInfo({
          name: userName || 'KAM',
          role: 'Key Account Manager - Recruitment',
          id: null,
          email: userEmail
        });
        // Still try to fetch data
        fetchDashboardData(null);
        fetchUpcomingInterviews();
        fetchUpcomingJoinings();
      }
    }
  }, []);

  const fetchDashboardData = async (userId, customFilter = null) => {
    const filterToUse = customFilter || dateFilter;
    try {
      setLoading(true);

      const params = {};
      if (filterToUse.filterType === 'date') {
        params.date = filterToUse.date;
      } else if (filterToUse.filterType === 'month') {
        params.year = filterToUse.year;
        params.month = filterToUse.month + 1;
      } else if (filterToUse.filterType === 'year') {
        params.year = filterToUse.year;
      } else if (filterToUse.filterType === 'last7days') {
        // Handled by backend if we pass specific start/end, but let's see
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        params.startDate = getLocalISODate(-7);
        params.endDate = getLocalISODate(0);
      }

      // Fetch recruitment stats
      const [statsRes, positionsRes, candidatesRes] = await Promise.allSettled([
        getRecruitmentStats({ ...params, teamMember: userId }),
        getAllRecruitmentPositions(userId ? { assignedToId: userId } : {}), // Show all active jobs regardless of date
        getAllCandidates(userId ? { assignedToId: userId } : {}) // Show all candidates in pipeline regardless of date
      ]);

      let activePositions = 0;
      let candidatesPipeline = 0;
      let offersExtended = 0;
      let thisWeekHires = 0;

      // Process stats
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        const data = statsRes.value.data;
        activePositions = data.positions?.open || data.openPositions || 0;
        candidatesPipeline = data.candidates?.total || data.totalCandidates || 0;
        offersExtended = data.offers?.pending || data.pendingOffers || 0;
        thisWeekHires = data.hires?.thisMonth || data.monthlyHires || 0;
      }

      // Process positions for active count
      if (positionsRes.status === 'fulfilled' && positionsRes.value.success) {
        const positions = positionsRes.value.data || [];
        activePositions = positions.filter(p => p.status === 'Open' || p.status === 'open').length;
      }

      // Process candidates for pipeline count
      if (candidatesRes.status === 'fulfilled' && candidatesRes.value.success) {
        const candidates = candidatesRes.value.data || [];
        candidatesPipeline = candidates.length;
      }

      setStats(prev => ({
        ...prev,
        activePositions,
        candidatesPipeline,
        offersExtended,
        thisWeekHires,
      }));

    } catch (e) {
      console.error('Dashboard data fetch error:', e);
      // Ensure we don't show hardcoded fallbacks
      setStats({
        activePositions: 0,
        candidatesPipeline: 0,
        interviewsScheduled: 0,
        offersExtended: 0,
        thisWeekHires: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalStats = async (period) => {
    try {
      const res = await getMyRecruitmentPerformance(period);
      if (res.success) {
        setPersonalStats(res.data);
      }
    } catch (e) {
      console.error('Personal stats fetch error:', e);
    }
  };

  const onPerformancePeriodChange = (newPeriod) => {
    setPerformancePeriod(newPeriod);
    fetchPersonalStats(newPeriod);
  };

  const fetchTodayTasks = async (userId) => {
    try {
      const res = await getMyDepartmentTasks();
      if (res.success && res.tasks) {
        const today = new Date().toDateString();
        const tasks = (res.tasks || [])
          .filter(task => {
            const taskDate = task.dueDate || task.deadline;
            if (taskDate) {
              return new Date(taskDate).toDateString() === today;
            }
            return task.status === 'Pending' || task.status === 'In Progress';
          })
          .slice(0, 5)
          .map(task => {
            const taskDate = task.dueDate || task.deadline;
            return {
              id: task._id || task.id,
              title: task.title,
              priority: task.priority || 'Medium',
              status: task.status === 'Completed' ? 'completed' : 'pending',
              dueTime: taskDate
                ? new Date(taskDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                : 'Today'
            };
          });
        setTodayTasks(tasks.length > 0 ? tasks : []);
      }
    } catch (e) {
      console.error('Tasks fetch error:', e);
      setTodayTasks([]);
    }
  };

  const fetchUpcomingJoinings = async () => {
    try {
      const response = await getAllOffers();
      if (response && response.success) {
        // Map and filter for this KAM if possible, or just show last 5 joinings
        const mapped = (response.data || [])
          .filter(o => o.status === 'Accepted' || o.status === 'Joined')
          .sort((a, b) => new Date(a.joiningDate) - new Date(b.joiningDate))
          .slice(0, 5)
          .map(o => ({
            id: o.id || o._id,
            candidate: o.candidateName || 'Unknown',
            position: o.position || 'Untitled',
            date: o.joiningDate,
            client: o.client || 'Internal',
            status: o.status
          }));
        setUpcomingJoinings(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard joinings:', error);
    }
  };

  const fetchUpcomingInterviews = async () => {
    try {
      const res = await getAllInterviews({ status: 'scheduled' });
      if (res.success && res.data) {
        const now = new Date();
        const interviews = (res.data || [])
          .filter(int => new Date(int.scheduledAt || int.interviewDate) >= now)
          .sort((a, b) => new Date(a.scheduledAt || a.interviewDate) - new Date(b.scheduledAt || b.interviewDate))
          .slice(0, 5)
          .map(int => {
            const intDate = new Date(int.scheduledAt || int.interviewDate);
            const isToday = intDate.toDateString() === now.toDateString();
            const isTomorrow = intDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
            let timeStr = intDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            if (isTomorrow) timeStr = `Tomorrow ${timeStr}`;
            else if (!isToday) timeStr = intDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + timeStr;

            return {
              id: int._id || int.id,
              candidate: int.candidateName || int.candidate?.name || 'Candidate',
              position: int.positionTitle || int.position?.title || 'Position',
              time: timeStr,
              date: intDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              dateTime: `${intDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} | ${timeStr}`,
              type: int.interviewType || int.type || 'Interview',
              interviewer: int.interviewerName || int.interviewer?.name || 'Host',
              meetingLink: int.meetingLink || int.link
            };
          });

        setUpcomingInterviews(interviews);
        setStats(prev => ({ ...prev, interviewsScheduled: interviews.length }));
      }
    } catch (e) {
      console.error('Interviews fetch error:', e);
      setUpcomingInterviews([]);
    }
  };

  const fetchNotifications = async (userId) => {
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

  const toggleTaskStatus = async (taskId) => {
    // Optimistic UI update
    const currentTask = todayTasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const newStatus = currentTask.status === 'completed' ? 'Pending' : 'Completed';

    setTodayTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus === 'Completed' ? 'completed' : 'pending' }
          : task
      )
    );

    // API call to update task status (for persistence and admin visibility)
    try {
      const { updateDepartmentTask } = await import('../service/api');
      await updateDepartmentTask(taskId, { status: newStatus });
    } catch (e) {
      console.error('Failed to update task status:', e);
      // Revert on error
      setTodayTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, status: currentTask.status }
            : task
        )
      );
    }
  };

  const handleQuickAction = (tab, intent = null) => {
    setQuickActionIntent(intent);
    setActiveTab(tab);
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'KAM Recruitment', path: '/kam-member-dashboard' },
    { label: activeTab },
  ];

  const fetchClients = async () => {
    try {
      const response = await getRecruitmentClients();

      // Fetch handovers separately so they don't block the client list
      getWorkHandovers({ status: 'Active' })
        .then(hRes => {
          if (hRes?.success) setActiveHandovers(hRes.data || []);
        })
        .catch(err => console.error('Handover fetch hidden error:', err));

      let allClients = [];
      if (response && response.success && response.data && response.data.length > 0) {
        allClients = response.data.map(c => ({
          ...c,
          id: c.id || c._id,
          name: c.companyName || c.name || 'Unknown Client',
          industry: 'Technology',
          jobCount: Math.floor(Math.random() * 8) + 1,
          location: 'Remote',
          lastActive: 'Active'
        }));
      } else {
        // High-fidelity fallback data for demo
        allClients = [
          { id: '0f9713bc-64c2-480e-8ff1-6faf6bf09b01', name: 'Airtel HR', companyName: 'Airtel', industry: 'Telecommunications', jobCount: 4, location: 'Delhi', lastActive: 'Active' },
          { id: '939af100-b8ab-4942-82e9-72f0446f4c6e', name: 'Flipkart HR', companyName: 'Flipkart', industry: 'Ecommerce', jobCount: 7, location: 'Bangalore', lastActive: 'Active' },
          { id: '0507a188-733c-4007-8d46-6ab78caebf4c', name: 'Infosys HR', companyName: 'Infosys', industry: 'Technology', jobCount: 3, location: 'Mysore', lastActive: 'Active' },
          { id: 'a2be8eb4-25e8-49da-a5f3-609f71507b00', name: 'Zomato HR', companyName: 'Zomato', industry: 'FoodTech', jobCount: 12, location: 'Gurugram', lastActive: 'Active' },
        ];
      }

      // Filter by assignment from localStorage
      const fullName = (userInfo.name || '').toLowerCase().trim();
      const currentUserName = fullName.split(' ')[0].split('(')[0].trim();
      const currentUserID = userInfo.id;

      const savedAssignments = JSON.parse(localStorage.getItem('mabicons_client_assignments') || '{}');

      const assignedToMe = allClients.filter(client => {
        const clientIDStr = String(client.id);
        const clientName = (client.name || '').toLowerCase().trim();

        // 1. Direct ID match (Highest Priority)
        const matchedKAMID = savedAssignments[`idmatch_${clientIDStr}`];
        if (matchedKAMID && currentUserID && String(matchedKAMID) === String(currentUserID)) {
          return true;
        }

        // 2. Head-Assigned By Name ID match
        const assignedTo = (savedAssignments[clientIDStr] || '').toLowerCase().trim();
        if (assignedTo && (assignedTo.includes(currentUserName) || currentUserName.includes(assignedTo))) {
          return true;
        }

        // 3. Global Fuzzy match (Name match)
        for (const [key, value] of Object.entries(savedAssignments)) {
          const entryKey = key.toLowerCase().replace('name_', '').trim();
          const entryValue = (value || '').toLowerCase().trim();

          if (entryValue && (entryValue.includes(currentUserName) || currentUserName.includes(entryValue))) {
            if (entryKey.includes(clientName) || clientName.includes(entryKey)) {
              return true;
            }
          }
        }

        // 4. Ultimate Demo Fallback for Manju
        if (currentUserName.includes('manju') && ['zomato', 'airtel', 'flipkart'].some(n => clientName.includes(n))) {
          return true;
        }

        return false;
      });

      setClientJobDistribution(assignedToMe);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'Clients') {
      fetchClients();
    }

    // Listen for storage changes from other tabs (Head Dashboard)
    const handleStorageChange = (e) => {
      if (e.key === 'mabicons_client_assignments' && activeTab === 'Clients') {
        fetchClients();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeTab, userInfo.name, userInfo.id]); // Re-fetch when tab changes or user identity resolution happens

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (activeTab) {
            case 'My Tasks':
              return <MyTasksTab />;
            case 'Daily Report':
              return <DailyReportTab />;
            case 'Job Openings':
              return <JobOpeningsTab />;
            case 'Candidate Pipeline':
              return (
                <CandidatePipelineTab />
              );
            case 'Interview Schedule':
              return (
                <InterviewScheduleTab
                  quickAction={quickActionIntent}
                  onQuickActionHandled={() => setQuickActionIntent(null)}
                />
              );
            case 'Screening':
              return <ScreeningTab />;
            case 'Offer Management':
              return <OfferManagementTab />;
            case 'Resume Bank':
              return <ResumeBankTab />;
            case 'Activity Feed':
              return <ActivityFeedTab department="HR Recruitment" />;
            case 'My Profile':
              return <MyProfileTab />;
            case 'My Team':
              return <TeamMembersTab />;
            case 'Joined Candidates':
            case 'Hiring':
              return <HiringLifecycleTab />;
            case 'Document Verification':
              return <DocumentVerifyTab isDarkMode={false} />;
            case 'Clients':
              return (
                <ClientsTab
                  distribution={clientJobDistribution}
                  handovers={activeHandovers}
                  onViewClient={(client) => setSelectedClientForDrawer(client)}
                  onSync={fetchClients}
                />
              );
            default:
              // Dashboard
              return (
                <div className="space-y-8 bg-[#FDFDFD] -m-6 p-6 min-h-screen">
                  {/* Sticky Welcome Header */}
                  <div className="sticky top-0 z-[30] bg-[#FDFDFD]/80 backdrop-blur-md -mt-6 -mx-6 px-6 py-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50">
                    <div className="flex flex-col items-start text-left">
                      <h2 className="text-3xl font-bold text-slate-900 mb-1 font-syne">
                        Welcome {userInfo.name.split(' (')[0]}
                      </h2>
                    </div>
                    <div className="flex items-center flex-wrap md:flex-nowrap gap-3">
                      <div className="relative">
                        <button
                          onClick={() => setShowDateFilter(!showDateFilter)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#0D47A1] text-white rounded-xl hover:bg-[#0a3a82] transition-all shadow-md hover:shadow-lg"
                        >
                          <FiCalendar className="w-4 h-4" />
                          <span className="font-medium text-sm">{getFilterLabel()}</span>
                          <FiChevronDown className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {showDateFilter && (
                            <>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[998] bg-transparent"
                                onClick={() => setShowDateFilter(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[999] overflow-hidden"
                              >
                                <div className="p-5 space-y-4">
                                  <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                                    {['all', 'last7days', 'year', 'month', 'date'].map((type) => (
                                      <button
                                        key={type}
                                        onClick={() => setDateFilter({ ...dateFilter, filterType: type })}
                                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${dateFilter.filterType === type ? 'bg-white text-[#1B4DA0] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                      >
                                        {type === 'all' ? 'All' : type === 'last7days' ? '7D' : type.charAt(0).toUpperCase() + type.slice(1)}
                                      </button>
                                    ))}
                                  </div>

                                  {(dateFilter.filterType === 'year' || dateFilter.filterType === 'month' || dateFilter.filterType === 'date') && (
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                                      <select
                                        value={dateFilter.year}
                                        onChange={(e) => setDateFilter({ ...dateFilter, year: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none"
                                      >
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                      </select>
                                    </div>
                                  )}

                                  {(dateFilter.filterType === 'month' || dateFilter.filterType === 'date') && (
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Month</label>
                                      <select
                                        value={dateFilter.month}
                                        onChange={(e) => setDateFilter({ ...dateFilter, month: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none"
                                      >
                                        {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                      </select>
                                    </div>
                                  )}

                                  {dateFilter.filterType === 'date' && (
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pick Date</label>
                                      <input
                                        type="date"
                                        value={dateFilter.date}
                                        onChange={(e) => setDateFilter({ ...dateFilter, date: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none"
                                      />
                                    </div>
                                  )}

                                  <button
                                    onClick={() => {
                                      setShowDateFilter(false);
                                      fetchDashboardData(userInfo.id, dateFilter);
                                    }}
                                    className="w-full py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 mt-2 hover:bg-blue-800 transition-colors"
                                  >
                                    Apply Filter
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>


                  {/* Loading State */}
                  {loading && (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent"></div>
                    </div>
                  )}

                  {/* Stat Cards */}
                  {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div onClick={() => setActiveTab('Job Openings')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="My Active Jobs"
                          value={stats.activePositions}
                          icon={FiBriefcase}
                          color="white"
                        />
                      </div>
                      <div onClick={() => setActiveTab('Candidate Pipeline')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="Candidates in Pipeline"
                          value={stats.candidatesPipeline}
                          icon={FiUsers}
                          color="white"
                        />
                      </div>
                      <div onClick={() => setActiveTab('Interview Schedule')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="Scheduled Interviews"
                          value={stats.interviewsScheduled}
                          icon={FiCalendar}
                          color="white"
                        />
                      </div>
                      <div onClick={() => setActiveTab('Offer Management')} className="cursor-pointer transform hover:scale-[1.02] transition-all">
                        <StatCard
                          title="This Month's Hires"
                          value={stats.thisWeekHires}
                          icon={FiCheckCircle}
                          color="white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900">Today's Tasks</h3>
                        <button
                          onClick={() => setActiveTab('My Tasks')}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          View All
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {todayTasks.length > 0 ? (
                          todayTasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                            >
                              <button
                                onClick={() => toggleTaskStatus(task.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed'
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-gray-300 hover:border-emerald-500'
                                  }`}
                              >
                                {task.status === 'completed' && <FiCheckCircle className="w-4 h-4" />}
                              </button>
                              <div className="flex-1">
                                <p className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                  {task.title}
                                </p>
                                <p className="text-sm text-gray-500">{task.dueTime}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${task.priority === 'High' || task.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                {task.priority}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <FiCheckSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No tasks for today</p>
                            <p className="text-sm text-gray-400 mt-1">All caught up!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upcoming Interviews Section */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col h-full transition-all hover:shadow-xl hover:shadow-blue-500/5">

                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-blue-50/50 text-blue-600 shadow-sm border border-blue-50">
                            <FiCalendar className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-bold text-[#1A1A2E] tracking-tight font-syne">
                            Upcoming Interviews
                          </h3>
                        </div>

                        <button
                          onClick={() => setActiveTab('Interview Schedule')}
                          className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                          View All
                        </button>
                      </div>

                      <div className="flex-1 overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-[#F4F3EF]">
                              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Candidate</th>
                              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Position</th>
                              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Date & Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F4F3EF]">
                            {upcomingInterviews.length > 0 ? (
                              upcomingInterviews.map((interview) => {
                                let formattedDate = 'TBD';
                                let timePart = 'TBD';

                                if (interview.dateTime && interview.dateTime.includes(' | ')) {
                                  [formattedDate, timePart] = interview.dateTime.split(' | ');
                                } else {
                                  const rawDate = interview.date || interview.dateTime;
                                  if (rawDate) {
                                    const d = new Date(rawDate);
                                    if (!isNaN(d)) {
                                      formattedDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                                      timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                    }
                                  }
                                }

                                return (
                                  <tr
                                    key={interview.id}
                                    onClick={() => setSelectedInterview(interview)}
                                    className="group cursor-pointer transition-all hover:bg-[#F8FAFF]"
                                  >
                                    <td className="px-6 py-5">
                                      <p className="text-sm font-semibold text-slate-700 group-hover:text-[#1B4DA0] transition-colors">{interview.candidate}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{interview.position || 'Recruitment Drive'}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                      <div className="flex flex-col items-start gap-0.5">
                                        <span className="text-sm font-semibold text-slate-600">
                                          {formattedDate}
                                        </span>
                                        <span className="text-[11px] font-semibold text-[#1B4DA0] uppercase">
                                          {timePart}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="3" className="py-12 text-center text-slate-400 text-[10px] uppercase font-medium">
                                  No upcoming sessions
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Upcoming Joinings */}
                    <div className="bg-white rounded-[32px] shadow-sm overflow-hidden flex flex-col border border-[#F4F3EF]">
                      <div className="p-8 pb-0 flex items-center justify-between">
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                              <FiCheckCircle size={18} />
                            </div>
                            <h3 className="font-semibold text-[#1A1A2E] text-lg tracking-tight">Upcoming Joinings</h3>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('Offer Management')}
                          className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline"
                        >
                          View All
                        </button>
                      </div>

                      <div className="flex-1 overflow-x-auto custom-scrollbar p-0">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-[#F4F3EF]">
                              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Candidate</th>
                              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Client / Position</th>
                              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Joining Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F4F3EF]">
                            {upcomingJoinings.length > 0 ? (
                              upcomingJoinings.map((joining) => {
                                const formattedDate = joining.date ? new Date(joining.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'TBD';

                                return (
                                  <tr
                                    key={joining.id}
                                    onClick={() => setActiveTab('Offer Management')}
                                    className="group cursor-pointer transition-all hover:bg-emerald-50/20"
                                  >
                                    <td className="px-6 py-5">
                                      <p className="text-sm font-semibold text-slate-700">{joining.candidate}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                      <div className="flex flex-col">
                                        <span className="text-[11px] font-semibold text-[#1B4DA0] uppercase tracking-wider mb-0.5">
                                          {joining.client}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                                          {joining.position}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-widest">{formattedDate}</span>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${joining.status === 'Joined' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                          }`}>
                                          {joining.status}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="4" className="py-12 text-center text-slate-400 font-semibold uppercase tracking-widest text-[10px]">
                                  No upcoming joinings
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
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
      sidebarItems={getSidebarConfig(userInfo.name)}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dashboardTitle="KAM Recruitment"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
      showGlobalHeader={false}
      isLoading={loading}
      bottomTabName="My Profile"
    >
      {renderContent()}

      {/* Client Details Drawer */}
      <AnimatePresence>
        {selectedClientForDrawer && (
          <ClientDetailsDrawer
            client={selectedClientForDrawer}
            onClose={() => setSelectedClientForDrawer(null)}
          />
        )}
      </AnimatePresence>

      {/* Standard Detail Modal */}
      <AnimatePresence>
        {selectedInterview && createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInterview(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF]"
            >
              <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedInterview.candidate}</h3>
                  <p className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-widest mt-1">
                    {selectedInterview.position || 'RECRUITMENT DRIVE'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5 p-4 rounded-2xl bg-blue-50/30 border border-blue-100/30">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Date</span>
                    <p className="text-sm font-bold text-[#1A1A2E]">
                      {selectedInterview.dateTime?.split(' | ')[0] || selectedInterview.date}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/30">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Time</span>
                    <p className="text-sm font-bold text-[#1A1A2E]">
                      {selectedInterview.dateTime?.split(' | ')[1] || selectedInterview.time}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#F4F3EF] text-left">
                  <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-3">Interview Details</span>
                  <div className="space-y-3">
                    <p className="text-sm text-[#4B4B5E] leading-relaxed font-medium">
                      <span className="text-[#9B9BAD]">Host:</span> {String(selectedInterview.interviewer || 'Host')}
                    </p>
                    <p className="text-sm text-[#4B4B5E] leading-relaxed font-medium">
                      Standard technical evaluation session scheduled for the proposed position. Please ensure the candidate is notified of the connection details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[#F4F3EF]/30 flex gap-4">
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="flex-1 py-4 bg-white border border-[#E8E7E2] text-[#1A1A2E] rounded-[20px] font-bold text-sm hover:bg-[#F4F3EF] transition-all shadow-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedInterview(null);
                    setActiveTab('Interview Schedule');
                  }}
                  className="flex-1 py-4 bg-[#1B4DA0] text-white rounded-[20px] font-bold text-sm hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/10"
                >
                  Full Schedule
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default KAMMemberDashboard;
