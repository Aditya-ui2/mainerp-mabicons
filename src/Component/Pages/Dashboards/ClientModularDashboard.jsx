import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSettings,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiUsers,
  FiClipboard,
  FiHeart,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiBell,
  FiMenu,
  FiX,
  FiGrid,
  FiTarget,
  FiChevronRight,
  FiBriefcase,
  FiUserCheck,
  FiCalendar,
  FiCheckCircle,
  FiPlus,
  FiExternalLink,
  FiCheckSquare,
  FiHelpCircle
} from 'react-icons/fi';
import {
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Briefcase,
  Users as LuUsers,
  Target as LuTarget,
  Minus,
  Filter,
  Download,
  Grid as LuGrid,
} from 'lucide-react';
import AdminLayout, { StatCard } from './AdminLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { jwtDecode } from 'jwt-decode';
import logo from '../../../assets/images/mabicons logo blue.png';
import { getClientDetails, getClientDashboardOverview, getAllNotifications, markNotificationRead, markAllNotificationsRead } from '../service/api';
import { toast } from 'react-hot-toast';
import { FaRupeeSign } from 'react-icons/fa';
import { createPortal } from 'react-dom';

// Lazy load Client Tab Components
const ClientAttendanceTab = lazy(() => import('./Tabs/Client/ClientAttendanceTab'));
const ClientPayrollTab = lazy(() => import('./Tabs/Client/ClientPayrollTab'));
const ClientBillingTab = lazy(() => import('./Tabs/Client/ClientBillingTab'));
import ClientOnboardingForm from './Tabs/CRM/ClientOnboardingForm';
const ClientPolicyTab = lazy(() => import('./Tabs/Client/ClientPolicyTab'));
const ClientMasterDataTab = lazy(() => import('./Tabs/Client/ClientMasterDataTab'));
const ClientTaskTab = lazy(() => import('./Tabs/Client/ClientTaskTab'));
const ClientEngagementTab = lazy(() => import('./Tabs/Client/ClientEngagementTab'));
const ClientRecruitmentProgressTab = lazy(() => import('./Tabs/Client/ClientRecruitmentProgressTab'));
const ClientJobsTab = lazy(() => import('./Tabs/Client/recruitment/ClientJobsTab'));
const ClientCandidatesTab = lazy(() => import('./Tabs/Client/recruitment/ClientCandidatesTab'));
const ClientInterviewsTab = lazy(() => import('./Tabs/Client/recruitment/ClientInterviewsTab'));
const ClientFinalizedTab = lazy(() => import('./Tabs/Client/recruitment/ClientFinalizedTab'));
const ClientProfileTab = lazy(() => import('./Tabs/Client/ClientProfileTab'));
const ClientReviewTab = lazy(() => import('./Tabs/CRM/ClientReviewTab'));
import HelpSupportTab from './Tabs/Common/HelpSupportTab';
const AnnouncementsTab = lazy(() => import('./Tabs/Common/AnnouncementsTab'));
import AnnouncementsWidget from './Tabs/Common/AnnouncementsWidget';

/* ── Mock dashboard data ─────────────────────────────── */
// MOCK_DASHBOARD removed for live database integration
const MOCK_DASHBOARD = null;

/* ── Table Row ───────────────────────────────────────── */
const TableItem = ({ name, date, status }) => (
  <div className="grid grid-cols-4 gap-4 py-4 border-b border-[#F4F3EF] last:border-0 hover:bg-[#FAFAF8] transition-colors px-2 rounded-lg cursor-pointer group">
    <div className="col-span-2 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-xs font-bold">
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <p className="text-sm font-semibold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{name}</p>
    </div>
    <div className="text-sm text-[#9B9BAD] flex items-center">{date}</div>
    <div className="flex items-center">
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
        status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
          'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
        {status}
      </span>
    </div>
  </div>
);

/* ── Premium Overview Dashboard ──────────────────────── */
const PremiumOverview = ({ clientData, setActiveTab, notificationBell }) => {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [staffDateFilter, setStaffDateFilter] = useState('today');
  const filterPanelRef = useRef(null);

  // Onboarding progress state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const onboardingFields = [
    { key: 'companyName', label: 'Identity' },
    { key: 'gstNumber', label: 'GST Info' },
    { key: 'pinCode', label: 'Location' },
    { key: 'state', label: 'State' },
    { key: 'city', label: 'City' },
    { key: 'serviceType', label: 'Service Type' },
    { key: 'registeredAddress', label: 'Address' },
    { key: 'ownerName', label: 'Ownership' },
    { key: 'ownerEmail', label: 'Owner Contact' },
    { key: 'spocName', label: 'SPOC' },
    { key: 'spocPhone', label: 'SPOC Phone' }
  ];

  const completedFieldsCount = onboardingFields.filter(f => clientData && clientData[f.key]).length;
  const totalFieldsCount = onboardingFields.length;
  const progressPercentage = Math.round((completedFieldsCount / totalFieldsCount) * 100);
  const remainingCount = totalFieldsCount - completedFieldsCount;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) setShowFilterPanel(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Export dashboard data as CSV
  const handleExport = () => {
    if (!dashData) return;
    const rows = [['Section', 'Name', 'Value', 'Status']];
    // KPIs
    const kpiLabels = ['Active Roles', 'Total Candidates', 'Interviews Done', 'Hired'];
    const kpiValues = [dashData.kpis.activeRoles, dashData.kpis.totalApplications, dashData.kpis.interviewsDone, dashData.kpis.departments];
    kpiLabels.forEach((l, i) => rows.push(['KPI', l, kpiValues[i], '']));
    // Application data
    dashData.applicationData.forEach(d => rows.push(['Applications', d.name, d.value, '']));
    // Pipeline data
    dashData.annualSummaryData.forEach(d => rows.push(['Pipeline', d.name, `Apps:${d.applicants} Int:${d.interviews} Off:${d.offers}`, '']));
    // Task data
    dashData.totalAcquisitionData.forEach(d => rows.push(['Tasks', d.name, d.value, '']));
    // Applicants
    dashData.recentApplicants.forEach(d => rows.push(['Recent Applicant', d.name, d.date, d.status]));
    // Jobs
    dashData.jobProgress.forEach(d => rows.push(['Job Progress', d.name, d.date, d.status]));

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) { setDashData(MOCK_DASHBOARD); return; }
        let decoded;
        try {
          decoded = jwtDecode(token);
          if (!decoded?.id) throw new Error("Invalid token");
        } catch (e) {
          console.error("JWT Decode failed:", e);
          setDashData(MOCK_DASHBOARD);
          setLoading(false);
          return;
        }

        const res = await getClientDashboardOverview(decoded.id, staffDateFilter);
        if (res?.success && res.data && typeof res.data === 'object') {
          const rd = res.data;
          const recruitment = rd.recruitment || {};
          const rSum = recruitment.summary || {};
          const funnel = recruitment.funnel || {};
          const positions = recruitment.positions || [];
          const candidatesList = recruitment.candidates || [];
          const upcomingInterviews = recruitment.upcomingInterviews || [];
          const ops = rd.operations || {};
          const taskSummary = ops.taskSummary || {};
          const recentTasks = ops.recentTasks || [];

          // ── KPIs from real data ──
          const activeRoles = rSum.openPositions || 0;
          const totalApps = rSum.totalCandidates || 0;
          const interviewsDone = rSum.completedInterviews || 0;
          const hired = rSum.hired || 0;
          const inPipeline = rSum.inPipeline || 0;
          const scheduledInterviews = rSum.scheduledInterviews || 0;

          // ── Application donut from real funnel ──
          const pending = (funnel.screening || 0) + (funnel.phoneInterview || 0) + (funnel.technical || 0) + (funnel.hrRound || 0) + (funnel.clientInterview || 0);
          const approved = (funnel.offerSent || 0) + (funnel.joined || 0);
          const rejected = funnel.rejected || 0;

          // ── Recent candidates from recruitment.candidates ──
          const recentApplicants = candidatesList.slice(0, 5).map(c => ({
            name: c.name || 'Unknown',
            date: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB') : '-',
            status: c.stage === 'Rejected' ? 'Rejected'
              : (c.stage === 'Joined' || c.stage === 'Offer Sent') ? 'Approved'
                : 'Pending',
          }));

          // ── Job progress from positions ──
          const jobProg = positions.slice(0, 5).map(p => ({
            name: p.title || 'Untitled',
            date: String(p.candidateCount || 0),
            status: p.status === 'Open' || p.status === 'Urgent' ? 'Approved'
              : p.status === 'Closed' ? 'Rejected'
                : 'Pending',
          }));

          // ── Bar chart: current candidate pipeline snapshot ──
          const annualSummary = [
            { name: 'Screening', count: funnel.screening || 0, color: '#f59e0b' },
            { name: 'Phone', count: funnel.phoneInterview || 0, color: '#f43f5e' },
            { name: 'Technical', count: funnel.technical || 0, color: '#8b5cf6' },
            { name: 'Final Rounds', count: (funnel.hrRound || 0) + (funnel.clientInterview || 0), color: '#1B4DA0' },
            { name: 'Hired', count: funnel.joined || 0, color: '#10b981' },
          ];

          // ── Area chart: task progress over time ──
          const totalTasks = taskSummary.total || 0;
          const resolvedTasks = taskSummary.resolved || 0;
          const activeTasks = taskSummary.active || 0;
          const wipTasks = taskSummary.wip || 0;

          const acquisitionData = [
            { name: 'Requested', value: taskSummary.requested || 0 },
            { name: 'Active', value: activeTasks },
            { name: 'In Progress', value: wipTasks },
            { name: 'Review', value: taskSummary.review || 0 },
            { name: 'Pending', value: taskSummary.pending || 0 },
            { name: 'Resolved', value: resolvedTasks },
          ];

          // ── Upcoming / Recent joinings ──
          const upcomingJ = candidatesList
            .filter(c => c.stage === 'Joined' || c.stage === 'Offer Sent' || c.stage === 'Offer Accepted' || c.joiningDate)
            .sort((a, b) => new Date(a.joiningDate) - new Date(b.joiningDate))
            .slice(0, 5)
            .map(c => ({
              id: c.id,
              candidate: c.name || 'Unknown',
              position: c.position || 'Untitled',
              date: c.joiningDate,
              status: c.joiningStatus || c.stage || 'Pending'
            }));

          setDashData({
            kpis: {
              activeRoles: activeRoles,
              activeRolesChange: `${rSum.totalPositions || 0} total`,
              activeRolesUp: activeRoles > 0,
              totalApplications: String(totalApps),
              totalApplicationsChange: `${inPipeline} in pipeline`,
              totalApplicationsUp: totalApps > 0 ? true : null,
              interviewsDone: interviewsDone,
              interviewsDoneChange: `${scheduledInterviews} upcoming`,
              interviewsDoneUp: scheduledInterviews > 0,
              departments: hired,
              departmentsChange: `${positions.length} positions`,
              departmentsUp: hired > 0,
            },
            applicationData: [
              { name: 'In Pipeline', value: pending || 0, color: '#8b5cf6' },
              { name: 'Approved', value: approved || 0, color: '#f59e0b' },
              { name: 'Rejected', value: rejected || 0, color: '#f43f5e' },
            ],
            annualSummaryData: annualSummary,
            totalAcquisitionData: acquisitionData,
            recentApplicants: recentApplicants,
            jobProgress: jobProg,
            // Pass extra real data for display
            _real: {
              totalTasks,
              completionRate: taskSummary.completionRate || 0,
              overdue: taskSummary.overdue || 0,
              recentTasks,
              upcomingInterviews,
              upcomingJoinings: upcomingJ,
            },
          });
        } else {
          setDashData(MOCK_DASHBOARD);
        }
      } catch {
        setDashData(MOCK_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [staffDateFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashData) return null;

  const { kpis, applicationData, annualSummaryData, totalAcquisitionData, recentApplicants, jobProgress } = dashData;
  const applicationTotal = applicationData.reduce((s, d) => s + d.value, 0);
  const totalTaskValue = totalAcquisitionData.reduce((s, d) => s + d.value, 0);

  // Apply filter
  const filteredApplicants = filterStatus === 'All' ? recentApplicants : recentApplicants.filter(a => a.status === filterStatus);
  const filteredJobs = filterStatus === 'All' ? jobProgress : jobProgress.filter(j => j.status === filterStatus);

  const cName = clientData?.companyName || clientData?.name || 'User';
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const d = today.getDate();
  const suf = d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';
  const dateStr = `Today is ${days[today.getDay()]}, ${d}${suf} ${months[today.getMonth()]} ${today.getFullYear()}`;

  const allowed = clientData?.allowedServices || ['recruitment', 'operations'];
  const hasRec = allowed.includes('recruitment');
  const hasOps = allowed.includes('operations');

  const kpiCards = [];
  if (hasRec) {
    kpiCards.push(
      { label: 'Active Roles', value: String(kpis.activeRoles), icon: Briefcase },
      { label: 'Total Candidates', value: String(kpis.totalApplications), icon: LuUsers },
      { label: 'Interviews Scheduled', value: String(dashData._real?.upcomingInterviews?.length || kpis.interviewsDone), icon: LuTarget },
      { label: 'Hired Candidates', value: String(kpis.departments), icon: UserCheck }
    );
  }
  if (hasOps) {
    const totalTasks = dashData._real?.totalTasks || 0;
    const resolvedTasks = dashData._real?.resolved || 0;
    const completionRate = dashData._real?.completionRate || 0;
    kpiCards.push(
      { label: 'Total Tasks', value: String(totalTasks), icon: FiClipboard },
      { label: 'Active Tasks', value: String(dashData._real?.recentTasks?.filter(t => t.status === 'Active' || t.status === 'In Progress').length || 0), icon: FiClock },
      { label: 'Completed Tasks', value: String(resolvedTasks), icon: FiCheckCircle },
      { label: 'Completion Rate', value: `${completionRate}%`, icon: FiHeart }
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Sticky Welcome Header */}
      <div className="sticky top-0 z-[30] bg-[#FDFDFD]/80 backdrop-blur-md -mt-6 -mx-6 px-6 py-6 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50">
        <div className="flex flex-col items-start text-left">
          <h2 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>
            Welcome, {cName}!
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Actions */}
          <div className="flex items-center gap-3">
            {notificationBell}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#475569] border border-[#E2E8F0] rounded-2xl text-xs font-bold hover:bg-[#F8FAFC] transition-all active:scale-95 shadow-sm"
            >
              <Download size={16} /> Export Data
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, i) => (
          <StatCard
            key={i}
            title={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            color="white"
          />
        ))}
      </div>

      {/* Onboarding Progress Section */}
      <div className="bg-white rounded-[28px] border border-[#F0F0F2] shadow-sm p-8 flex items-center justify-between mt-2">
        <div className="flex-1 mr-12 text-left">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: '"Syne", sans-serif' }}>Onboarding Progress</h3>
              {progressPercentage < 100 && (
                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">Action Required</span>
              )}
              {progressPercentage === 100 && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Completed</span>
              )}
            </div>
            <p className="text-sm font-bold text-[#1B4DA0]">{progressPercentage}% Completed</p>
          </div>
          <div className="w-full bg-[#F4F3EF] rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="bg-[#1B4DA0] h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>

        </div>
        <button
          onClick={() => setIsDocModalOpen(true)}
          disabled={remainingCount === 0}
          className={`flex-shrink-0 flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 ${remainingCount === 0
            ? 'bg-[#F4F3EF] text-[#9B9BAD] shadow-none cursor-not-allowed'
            : 'bg-[#1A1A2E] text-white hover:bg-[#2A2A4A]'
            }`}
        >
          <FiPlus size={18} />
          <span>Add Document</span>
        </button>
      </div>

        {/* Charts & Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Donut - Staff Applications */}
          {hasRec && (
          <div className="lg:col-span-4 bg-white rounded-[32px] p-6 border border-[#E8E7E2] shadow-sm flex flex-col items-center h-fit">
            <div className="w-full flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Staff applications card</h2>
              <select
                value={staffDateFilter}
                onChange={(e) => setStaffDateFilter(e.target.value)}
                className="text-xs font-semibold text-[#1A1A2E] bg-[#F4F3EF] border border-[#E8E7E2] rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="relative w-full h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={applicationData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                    {applicationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <p className="text-4xl font-extrabold text-[#1A1A2E]">{applicationTotal}</p>
                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">Total Volume</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-4 w-full">
              {applicationData.map((dd, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full" style={{ background: dd.color }} />
                  <span className="text-xl font-bold text-[#1A1A2E]">{dd.value}</span>
                  <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{dd.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bar - Annual Recruitment Summary */}
        {hasRec && (
          <div className="lg:col-span-8 bg-white rounded-[32px] p-6 border border-[#E8E7E2] shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Recruitment pipeline</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annualSummaryData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9B9BAD', fontSize: 10, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9B9BAD', fontSize: 10, fontWeight: 600 }} />
                  <Tooltip
                    cursor={{ fill: '#F4F3EF' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [value, 'Candidates']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={45}>
                    {annualSummaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Area - Task Operations Overview */}
        {hasOps && (
          <div className="lg:col-span-12 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Task operations overview</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-5xl font-extrabold text-[#1A1A2E] tracking-tighter">
                    {totalTaskValue}
                  </p>
                  <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                    {dashData._real ? (
                      <><ArrowUpRight size={14} /> {dashData._real.completionRate}% COMPLETION</>
                    ) : (
                      <><ArrowUpRight size={14} /> TASKS</>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full relative">
              {totalTaskValue === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 p-6 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <FiClipboard className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No Task Activity Found</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-6 max-w-[280px]">
                    You haven't requested or been assigned any tasks for the selected period.
                  </p>
                  <button
                    onClick={() => setActiveTab('Assign Task to KAM')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#8b5cf6] text-white rounded-xl font-bold text-sm hover:bg-[#7c4dff] transition-all shadow-lg shadow-indigo-100 active:scale-95"
                  >
                    <FiPlus size={16} /> Create New Task
                  </button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={totalAcquisitionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9B9BAD', fontSize: 10, fontWeight: 700 }}
                      dy={12}
                      interval={0}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9B9BAD', fontSize: 10, fontWeight: 600 }} />
                    <Tooltip
                      cursor={{ fill: '#F4F3EF' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" name="Tasks" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Interviews cards */}
        {hasRec && (
          <div className="lg:col-span-4 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50/50 text-blue-600 shadow-sm border border-blue-50">
                <FiCalendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Upcoming Interviews</h2>
            </div>
            <button
              onClick={() => setActiveTab('Interviews')}
              className="text-xs font-black text-[#3FA9F5] uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              Manage <FiExternalLink size={12} />
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
                {dashData._real?.upcomingInterviews?.length > 0 ? (
                  dashData._real.upcomingInterviews.map((int, idx) => {
                    const dateStr = (int.date?.includes('T') ? int.date.split('T')[0] : int.date) || '2026-04-30';
                    const formattedDate = new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

                    return (
                      <motion.tr
                        key={idx}
                        whileHover={{ backgroundColor: '#F8FAFF' }}
                        onClick={() => setActiveTab('Interviews')}
                        className="group cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-6">
                          <span className="text-[15px] font-semibold text-[#1A1A2E] group-hover:text-blue-600 transition-colors uppercase tracking-tight font-syne">
                            {int.candidate}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                            {int.position}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-1.5 font-syne">
                            <span className="text-sm font-semibold text-blue-600">{int.time}</span>
                            <div className="flex items-center gap-1.5 text-[#9B9BAD]">
                              <FiCalendar size={12} className="opacity-70" />
                              <span className="text-[10px] font-semibold uppercase tracking-widest">{formattedDate}</span>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-200">
                          <FiCalendar size={24} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Scheduled Sessions</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Recent Tasks Section */}
        {hasOps && (
          <div className="lg:col-span-12 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex flex-col mt-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <FiClipboard size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Recent Tasks</h2>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-10">Active Operations Requests</p>
              </div>
              <button
                onClick={() => setActiveTab('Assign Task to KAM')}
                className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
              >
                View All Tasks <FiExternalLink size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#F4F3EF]">
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Task Detail</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Category</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Due Date</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {dashData._real?.recentTasks?.length > 0 ? (
                    dashData._real.recentTasks.map((task, idx) => {
                      const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'TBD';
                      const priorityColor = task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100';

                      const statusColor = task.status === 'Resolved' || task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        task.status === 'In Progress' || task.status === 'Active' || task.status === 'wip' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        task.status === 'Pending' || task.status === 'Review' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-slate-50 text-slate-600 border border-slate-100';

                      return (
                        <motion.tr
                          key={idx}
                          whileHover={{ backgroundColor: '#FAF9FE' }}
                          onClick={() => setActiveTab('Assign Task to KAM')}
                          className="group cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-6">
                            <span className="text-[15px] font-semibold text-[#1A1A2E] group-hover:text-purple-600 transition-colors uppercase tracking-tight font-syne">
                              {task.title}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                              {task.category || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${priorityColor}`}>
                              {task.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <FiCalendar size={12} className="opacity-70" />
                              <span className="text-xs font-semibold">{formattedDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                              {task.status || 'Active'}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-[24px] bg-purple-50 flex items-center justify-center text-purple-200">
                            <FiClipboard size={24} />
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Recent Tasks Found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upcoming Joinings Section */}
        {/* Joinings Overview Section */}
        {hasRec && (
          <div className="lg:col-span-12 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex flex-col mt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <FiCheckCircle size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Joinings Overview</h2>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-10">Candidates Onboarding Schedule</p>
            </div>
            <button
              onClick={() => setActiveTab('Finalized & Offers')}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              View All <FiExternalLink size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F4F3EF]">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Candidate</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Position</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD]">Joining Date</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9BAD] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3EF]">
                {dashData._real?.upcomingJoinings?.length > 0 ? (
                  dashData._real.upcomingJoinings.map((join, idx) => {
                    const formattedDate = join.date ? new Date(join.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD';

                    return (
                      <motion.tr
                        key={idx}
                        whileHover={{ backgroundColor: '#F8FAFF' }}
                        onClick={() => setActiveTab('Finalized & Offers')}
                        className="group cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-6">
                          <span className="text-[15px] font-semibold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors uppercase tracking-tight font-syne">
                            {join.candidate}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                            {join.position}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-slate-600">{formattedDate}</span>
                            {join.status === 'Rescheduled' && (
                              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Rescheduled</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                            join.status === 'Joined'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : join.status === 'Not Joined'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : join.status === 'Rescheduled'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-blue-50 text-[#1B4DA0] border-blue-100'
                          }`}>
                            {join.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-[24px] bg-emerald-50 flex items-center justify-center text-emerald-200">
                          <FiCheckCircle size={24} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Joinings Scheduled</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Table - Active Positions */}
        {hasRec && (
          <div className="lg:col-span-4 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Open Positions</h2>
            <button
              onClick={() => setActiveTab('Job Positions')}
              className="text-sm font-bold text-[#3FA9F5] hover:text-[#2d8cd3] transition-colors flex items-center gap-1"
            >
              View All <FiExternalLink size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F4F3EF]">
                  <th className="pb-4 text-left text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Position</th>
                  <th className="pb-4 text-left text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Pipeline</th>
                  <th className="pb-4 text-right text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3EF]">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, idx) => (
                    <tr key={idx} className="group cursor-pointer hover:bg-[#FAFAF8] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                            <FiBriefcase size={16} />
                          </div>
                          <p className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{job.name}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-[#1A1A2E]">{job.date}</p>
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active Candidates</p>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${job.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          job.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                          {job.status === 'Approved' ? 'ACTIVE' : job.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-20 text-center opacity-40">
                      <FiBriefcase className="mx-auto text-slate-300 mb-4" size={40} />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active vacancies</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Announcements Widget */}
        <div className={`${hasRec ? 'lg:col-span-4' : 'lg:col-span-12'} flex flex-col min-h-[500px]`}>
          <AnnouncementsWidget department="All" />
        </div>
      </div>

      {/* Document Upload Modal */}
      <ClientOnboardingForm
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        mode="full"
        clientMode={true}
        initialData={clientData}
        onComplete={async (data) => {
          // Handle client onboarding form completion if needed
          toast.success("Document information updated successfully!");
          setIsDocModalOpen(false);
        }}
      />
    </div>
  );
};

/* ── Skeleton / Shimmer Loader ───────────────────────── */
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

/* ── Sidebar Config (sectioned like AdminLayout) ─────── */
const allSidebarConfig = [
  {
    heading: 'MAIN',
    items: [
      { id: 0, title: 'Dashboard Overview', short: 'Overview', icon: FiGrid, service: 'both' },
      { id: 100, title: 'Feedback', short: 'Feedback', icon: FiCheckSquare, service: 'both' },
    ],
  },
  {
    heading: 'BILLING',
    collapsible: true,
    icon: FaRupeeSign,
    label: 'Billing & Payments',
    service: 'both',
    items: [
      { id: 6, title: 'Billing & Payments', short: 'Billing', icon: FaRupeeSign, service: 'both' },
    ],
  },
  {
    heading: 'RECRUITMENT',
    collapsible: true,
    icon: FiTarget,
    label: 'Recruitment',
    service: 'recruitment',
    items: [
      { id: 7, title: 'Recruitment Overview', short: 'Overview', icon: FiTarget, service: 'recruitment' },
      { id: 8, title: 'Job Positions', short: 'Jobs', icon: FiBriefcase, service: 'recruitment' },
      { id: 10, title: 'Interviews', short: 'Interviews', icon: FiCalendar, service: 'recruitment' },
      { id: 12, title: 'Shortlisted Candidates', short: 'Shortlisted', icon: FiUserCheck, service: 'recruitment' },
      { id: 11, title: 'Finalized & Offers', short: 'Finalized', icon: FiCheckCircle, service: 'recruitment' },
    ],
  },
  {
    heading: 'OPERATIONS',
    collapsible: true,
    icon: FiClipboard,
    label: 'Operations',
    service: 'operations',
    items: [
      { id: 1, title: 'Attendance Share / Review', short: 'Attendance', icon: FiClock, service: 'operations' },
      { id: 2, title: 'Payroll', short: 'Payroll', icon: FiDollarSign, service: 'operations' },
      { id: 5, title: 'Assign Task to KAM', short: 'Tasks', icon: FiClipboard, service: 'operations' },
    ],
  },
  {
    heading: 'DOCUMENTS',
    collapsible: true,
    icon: FiFileText,
    label: 'Documents',
    service: 'both',
    items: [
      { id: 3, title: 'Policy & Documents', short: 'Policies', icon: FiFileText, service: 'both' },
      { id: 4, title: 'Master Data', short: 'Master Data', icon: FiUsers, service: 'both' },
    ],
  },
  {
    heading: 'SUPPORT',
    collapsible: true,
    icon: FiHelpCircle,
    label: 'Support',
    service: 'both',
    items: [
      { id: 50, title: 'Help & Support', short: 'Support', icon: FiHelpCircle, service: 'both' },
    ],
  },

];

/* ── Page Transition Wrapper ─────────────────────────── */
const PageTransition = ({ children, tabKey }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, [tabKey]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${show ? 'opacity-100' : 'opacity-0 translate-y-3'
        }`}
    >
      {children}
    </div>
  );
};

/* ══════════════════ CLIENT MODULAR DASHBOARD ═══════════════════ */
const ClientModularDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('client_active_tab') || 'Dashboard Overview');
  const [isDarkMode] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [allowedServices, setAllowedServices] = useState(['recruitment', 'operations']);

  useEffect(() => {
    localStorage.setItem('client_active_tab', activeTab);
  }, [activeTab]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['RECRUITMENT']);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        const userId = decoded.id || decoded.userId;
        if (userId) {
          const res = await getAllNotifications(userId);
          setNotifications(res?.data || []);
        }
      }
    } catch (e) {
      console.error('[Notifications] Fetch error:', e);
    }
  };

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
        const decoded = jwtDecode(token);
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

  const unreadCount = notifications.filter(n => n.status !== 'read' && !n.isRead && !n.read).length;

  const renderNotificationBell = () => {
    return (
      <div className="relative inline-block text-left z-[9999]" ref={notificationRef}>
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFFDF9] to-[#FFF9E6] border border-[#F5E6C4] shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-[#D4AF37] hover:scale-105 active:scale-95 transition-all relative outline-none"
          title="Notifications"
        >
          <FiBell className="w-5 h-5 animate-pulse" />
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
                    className="text-[9px] font-black text-[#1B4DA0] uppercase tracking-wider hover:underline bg-transparent border-none p-0 cursor-pointer text-left"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F3EF] custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#9B9BAD]">
                    <FiBell size={32} className="mx-auto mb-3 opacity-20 text-[#1B4DA0]" />
                    <p className="text-xs font-bold">No new alerts</p>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div
                      key={n._id || n.id || idx}
                      onClick={() => handleMarkRead(n._id || n.id)}
                      className={`p-4 hover:bg-[#F3F7FC]/40 cursor-pointer transition-colors text-left ${(!n.isRead && !n.read) ? 'bg-[#F3F7FC]/70' : ''}`}
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

  const fetchClientData = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        getClientDetails(decoded.id).then(res => {
          if (res?.data) {
            setClientData(res.data);
            if (res.data.allowedServices) {
              setAllowedServices(res.data.allowedServices);
            }
          }
        }).catch(() => { });
      }
    } catch {
      // ignore
    }
  };

  // Decode token to get client info and load notifications
  useEffect(() => {
    fetchClientData();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const renderTabContent = () => {
    const tabProps = { isDarkMode, clientData };
    const bell = renderNotificationBell();
    switch (activeTab) {
      case 'Dashboard Overview': return <PremiumOverview clientData={clientData} setActiveTab={setActiveTab} notificationBell={bell} />;
      case 'Attendance Share / Review': return <ClientAttendanceTab {...tabProps} />;
      case 'Payroll': return <ClientPayrollTab {...tabProps} />;
      case 'Billing & Payments': return <ClientBillingTab {...tabProps} notificationBell={bell} />;
      case 'Policy & Documents': return <ClientPolicyTab {...tabProps} />;
      case 'Master Data': return <ClientMasterDataTab {...tabProps} />;
      case 'Assign Task to KAM': return <ClientTaskTab {...tabProps} />;

      case 'Recruitment Overview': return <ClientRecruitmentProgressTab {...tabProps} setActiveTab={setActiveTab} />;
      case 'Job Positions': return <ClientJobsTab {...tabProps} />;
      case 'Shortlisted Candidates': return <ClientCandidatesTab {...tabProps} shortlistedOnly={true} />;
      case 'Interviews': return <ClientInterviewsTab {...tabProps} />;
      case 'Finalized & Offers': return <ClientFinalizedTab {...tabProps} />;
      case 'Help & Support': return <HelpSupportTab userRole="Client" userName={clientName} notificationBell={bell} />;
      case 'My Profile': return <ClientProfileTab isDarkMode={isDarkMode} onProfileUpdate={fetchClientData} />;
      case 'Announcements': return <AnnouncementsTab department="All" isHead={false} notificationBell={bell} />;
      case 'Feedback': return <ClientReviewTab
          clientData={clientData}
          clientId={clientData?._id}
          notificationBell={bell}
      />;
      default: return <p className="text-xl text-slate-500 font-medium">{activeTab}</p>;
    }
  };

  const clientName = clientData?.companyName || clientData?.name || 'Client';

  const sidebarConfig = [
    {
      items: [
        { id: 'Announcements', title: 'Announcements', icon: FiBell },
        ...allSidebarConfig
          .filter(section => section.heading !== 'MAIN')
          .map(section => {
            const filteredItems = section.items.filter(item =>
              item.service === 'both' || allowedServices.includes(item.service)
            );
            if (filteredItems.length === 0) return null;

            if (section.heading === 'BILLING') {
              return {
                id: filteredItems[0].title,
                title: filteredItems[0].title,
                icon: filteredItems[0].icon || section.icon || LuGrid
              };
            }

            return {
              id: section.heading,
              title: section.label || section.heading,
              icon: section.icon || LuGrid,
              submenu: filteredItems.map(i => ({
                id: i.id,
                title: i.title,
                icon: i.icon
              }))
            };
          })
          .filter(Boolean),
        { id: 'Feedback', title: 'Feedback', icon: FiCheckSquare }
      ]
    }
  ];

  const userInfo = {
    name: clientName,
    role: 'Client',
    avatar: clientData?.profilePicture || clientData?.logo || clientName.charAt(0).toUpperCase()
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebarItems={sidebarConfig}
      userInfo={userInfo}
      dashboardTitle="Client Dashboard"
      bottomTabName="My Profile"
      dashboardTabName="Dashboard Overview"
      notifications={notifications}
    >
      <Suspense fallback={<TabLoader />}>
        <PageTransition tabKey={activeTab}>
          {renderTabContent()}
        </PageTransition>
      </Suspense>
    </AdminLayout>
  );
};

export default ClientModularDashboard;
