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
} from 'lucide-react';
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
import { getClientDetails, getClientDashboardOverview } from '../service/api';

// Lazy load Client Tab Components
const ClientAttendanceTab = lazy(() => import('./Tabs/Client/ClientAttendanceTab'));
const ClientPayrollTab = lazy(() => import('./Tabs/Client/ClientPayrollTab'));
const ClientPolicyTab = lazy(() => import('./Tabs/Client/ClientPolicyTab'));
const ClientMasterDataTab = lazy(() => import('./Tabs/Client/ClientMasterDataTab'));
const ClientTaskTab = lazy(() => import('./Tabs/Client/ClientTaskTab'));
const ClientEngagementTab = lazy(() => import('./Tabs/Client/ClientEngagementTab'));
const ClientRecruitmentProgressTab = lazy(() => import('./Tabs/Client/ClientRecruitmentProgressTab'));
const ClientJobsTab = lazy(() => import('./Tabs/Client/recruitment/ClientJobsTab'));
const ClientCandidatesTab = lazy(() => import('./Tabs/Client/recruitment/ClientCandidatesTab'));
const ClientInterviewsTab = lazy(() => import('./Tabs/Client/recruitment/ClientInterviewsTab'));
const ClientFinalizedTab = lazy(() => import('./Tabs/Client/recruitment/ClientFinalizedTab'));

/* ── Mock dashboard data ─────────────────────────────── */
const MOCK_DASHBOARD = {
  kpis: {
    activeRoles: 250, activeRolesChange: '+12', activeRolesUp: true,
    totalApplications: '1,2k', totalApplicationsChange: 'Stable', totalApplicationsUp: null,
    interviewsDone: 38, interviewsDoneChange: '+4', interviewsDoneUp: true,
    departments: 8, departmentsChange: 'Static', departmentsUp: null,
  },
  applicationData: [
    { name: 'Pending', value: 100, color: '#8b5cf6' },
    { name: 'Approved', value: 60, color: '#f59e0b' },
    { name: 'Rejected', value: 40, color: '#f43f5e' },
  ],
  annualSummaryData: [
    { name: '30 Sep', applicants: 400, interviews: 240, offers: 100 },
    { name: '10 Oct', applicants: 300, interviews: 139, offers: 150 },
    { name: '20 Oct', applicants: 200, interviews: 480, offers: 180 },
    { name: '30 Oct', applicants: 500, interviews: 390, offers: 250 },
    { name: '10 Nov', applicants: 450, interviews: 430, offers: 220 },
  ],
  totalAcquisitionData: [
    { name: '30 Sep', value: 2000000 },
    { name: '10 Oct', value: 5000000 },
    { name: '20 Oct', value: 4000000 },
    { name: '30 Oct', value: 8000000 },
    { name: '10 Nov', value: 11800000 },
  ],
  recentApplicants: [
    { name: 'Sarah Jenkins', date: '25/11/2024', status: 'Pending' },
    { name: 'Michael Ross', date: '24/11/2024', status: 'Approved' },
    { name: 'Emily Blunt', date: '23/11/2024', status: 'Rejected' },
  ],
  jobProgress: [
    { name: 'Frontend Lead', date: '142', status: 'Approved' },
    { name: 'Product Org', date: '85', status: 'Pending' },
    { name: 'System Design', date: '42', status: 'Approved' },
  ],
};

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
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
        status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
        status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
        'bg-rose-50 text-rose-600 border border-rose-100'
      }`}>
        {status}
      </span>
    </div>
  </div>
);

/* ── Premium Overview Dashboard ──────────────────────── */
const PremiumOverview = ({ clientData }) => {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [staffDateFilter, setStaffDateFilter] = useState('all');
  const filterPanelRef = useRef(null);

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

        const res = await getClientDashboardOverview(decoded.id);
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

          // ── Bar chart: build from real monthly data if available, else summary ──
          const annualSummary = [
            { name: 'Screening', applicants: funnel.screening || 0, interviews: funnel.phoneInterview || 0, offers: funnel.offerSent || 0 },
            { name: 'Phone', applicants: funnel.phoneInterview || 0, interviews: funnel.technical || 0, offers: funnel.hrRound || 0 },
            { name: 'Technical', applicants: funnel.technical || 0, interviews: funnel.hrRound || 0, offers: funnel.clientInterview || 0 },
            { name: 'HR/Client', applicants: funnel.hrRound || 0, interviews: funnel.clientInterview || 0, offers: funnel.offerSent || 0 },
            { name: 'Final', applicants: funnel.clientInterview || 0, interviews: funnel.offerSent || 0, offers: funnel.joined || 0 },
          ];

          // ── Area chart: task progress over time ──
          const totalTasks = taskSummary.total || 0;
          const resolvedTasks = taskSummary.resolved || 0;
          const activeTasks = taskSummary.active || 0;
          const wipTasks = taskSummary.wip || 0;

          const acquisitionData = [
            { name: 'Active', value: activeTasks },
            { name: 'In Progress', value: wipTasks },
            { name: 'Review', value: taskSummary.review || 0 },
            { name: 'Pending', value: taskSummary.pending || 0 },
            { name: 'Resolved', value: resolvedTasks },
          ];

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
            recentApplicants: recentApplicants.length > 0 ? recentApplicants : MOCK_DASHBOARD.recentApplicants,
            jobProgress: jobProg.length > 0 ? jobProg : MOCK_DASHBOARD.jobProgress,
            // Pass extra real data for display
            _real: {
              totalTasks,
              completionRate: taskSummary.completionRate || 0,
              overdue: taskSummary.overdue || 0,
              recentTasks,
              upcomingInterviews,
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
  }, []);

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

  const kpiCards = [
    { label: 'Active Roles', value: String(kpis.activeRoles), change: kpis.activeRolesChange, up: kpis.activeRolesUp, color: 'text-amber-600', icon: Briefcase },
    { label: 'Total Candidates', value: String(kpis.totalApplications), change: kpis.totalApplicationsChange, up: kpis.totalApplicationsUp, color: 'text-blue-500', icon: LuUsers },
    { label: 'Interviews Done', value: String(kpis.interviewsDone), change: kpis.interviewsDoneChange, up: kpis.interviewsDoneUp, color: 'text-purple-500', icon: LuTarget },
    { label: 'Hired', value: String(kpis.departments), change: kpis.departmentsChange, up: kpis.departmentsUp, color: 'text-emerald-500', icon: UserCheck },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Detached Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Welcome Back, {cName}!</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1 flex items-center gap-2">
            <FiCalendar className="text-[#1B4DA0]" /> {dateStr}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Main Actions */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={filterPanelRef}>
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition-all ${filterStatus !== 'All' ? 'bg-blue-50 border-[#1B4DA0]/30 text-[#1B4DA0]' : 'bg-white border-[#E8E7E2] text-[#1A1A2E] hover:bg-[#F4F3EF]'}`}
              >
                <Filter className="w-4 h-4" />
                {filterStatus !== 'All' ? filterStatus : 'Filter Scope'}
              </button>
              {showFilterPanel && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#E8E7E2] rounded-[20px] shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                  {['All', 'Approved', 'Pending', 'Rejected'].map((s) => (
                    <div
                      key={s}
                      onClick={() => { setFilterStatus(s); setShowFilterPanel(false); }}
                      className={`px-5 py-2.5 hover:bg-[#F4F3EF] cursor-pointer text-xs font-bold ${filterStatus === s ? 'bg-blue-50 text-[#1B4DA0]' : 'text-[#6B6B7E]'}`}
                    >
                      {s} Registry
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-[#1A1A2E] text-white rounded-2xl text-xs font-bold shadow-lg shadow-gray-400/20 hover:bg-[#000] transition-all active:scale-95"
            >
              <Download size={16} /> Export Data
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-[24px] border border-[#E8E7E2] shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center bg-[#F4F3EF] ${kpi.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-4xl font-extrabold text-[#1A1A2E] mb-1">{kpi.value}</p>
              <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest mb-3">{kpi.label}</p>
              <div className="flex items-center gap-1.5 mt-auto">
                {kpi.up === true ? (
                  <ArrowUpRight size={14} className="text-emerald-500" />
                ) : kpi.up === false ? (
                  <ArrowDownRight size={14} className="text-rose-500" />
                ) : (
                  <Minus size={14} className="text-[#C5C5D2]" />
                )}
                <span className={`text-[10px] font-bold ${kpi.up === null ? 'text-[#9B9BAD]' : 'text-emerald-500'}`}>{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut - Staff Applications */}
        <div className="lg:col-span-4 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-8">
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
          <div className="grid grid-cols-3 gap-6 mt-8 w-full">
            {applicationData.map((dd, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full" style={{ background: dd.color }} />
                <span className="text-xl font-bold text-[#1A1A2E]">{dd.value}</span>
                <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{dd.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar - Annual Recruitment Summary */}
        <div className="lg:col-span-8 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Recruitment pipeline</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualSummaryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9B9BAD', fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9B9BAD', fontSize: 10, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: '#F4F3EF' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" align="left" iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
                <Bar dataKey="applicants" name="Applicants" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="interviews" name="Interviews" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="offers" name="Offers" fill="#1B4DA0" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area - Task Operations Overview */}
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
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={totalAcquisitionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9B9BAD', fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9B9BAD', fontSize: 10, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: '#F4F3EF' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" name="Tasks" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table - Recent Applicants */}
        <div className="lg:col-span-6 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Recent Applicants</h2>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-4 pb-4 text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] border-b border-[#F4F3EF]">
              <div className="col-span-2">Candidate</div>
              <div>Date</div>
              <div>Status</div>
            </div>
            {filteredApplicants.map((item, i) => (
              <TableItem key={i} name={item.name} date={item.date} status={item.status} />
            ))}
          </div>
        </div>

        {/* Table - Job Progress */}
        <div className="lg:col-span-6 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Job Progress History</h2>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-4 pb-4 text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] border-b border-[#F4F3EF]">
              <div className="col-span-2">Position</div>
              <div>Applicants</div>
              <div>Status</div>
            </div>
            {filteredJobs.map((item, i) => (
              <TableItem key={i} name={item.name} date={item.date} status={item.status} />
            ))}
          </div>
        </div>
      </div>
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
      { id: 9, title: 'Candidates', short: 'Candidates', icon: FiUsers, service: 'recruitment' },
      { id: 10, title: 'Interviews', short: 'Interviews', icon: FiCalendar, service: 'recruitment' },
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
      className={`transition-all duration-300 ease-out ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {children}
    </div>
  );
};

/* ══════════════════ CLIENT MODULAR DASHBOARD ═══════════════════ */
const ClientModularDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard Overview');
  const [isDarkMode] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [allowedServices, setAllowedServices] = useState(['recruitment', 'operations']);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['RECRUITMENT']);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Decode token to get client info
  useEffect(() => {
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
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setShowNotifications(false);
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

  // Filter sidebar sections based on client's allowed services
  const sidebarConfig = allSidebarConfig
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.service === 'both' || allowedServices.includes(item.service)
      ),
    }))
    .filter(section => section.items.length > 0);

  const switchTab = (title) => {
    setActiveTab(title);
    setMobileSidebarOpen(false);
    // Auto-expand the section containing this tab
    const parentSection = sidebarConfig.find(s => s.items.some(i => i.title === title));
    if (parentSection?.collapsible && !expandedSections.includes(parentSection.heading)) {
      setExpandedSections(prev => [...prev, parentSection.heading]);
    }
  };

  const toggleSection = (heading) => {
    setExpandedSections(prev =>
      prev.includes(heading) ? prev.filter(h => h !== heading) : [...prev, heading]
    );
  };

  const renderTabContent = () => {
    const tabProps = { isDarkMode, clientData };
    switch (activeTab) {
      case 'Dashboard Overview':        return <PremiumOverview clientData={clientData} />;
      case 'Attendance Share / Review': return <ClientAttendanceTab {...tabProps} />;
      case 'Payroll':                   return <ClientPayrollTab {...tabProps} />;
      case 'Policy & Documents':        return <ClientPolicyTab {...tabProps} />;
      case 'Master Data':               return <ClientMasterDataTab {...tabProps} />;
      case 'Assign Task to KAM':        return <ClientTaskTab {...tabProps} />;

      case 'Recruitment Overview':      return <ClientRecruitmentProgressTab {...tabProps} />;
      case 'Job Positions':              return <ClientJobsTab {...tabProps} />;
      case 'Candidates':                 return <ClientCandidatesTab {...tabProps} />;
      case 'Interviews':                 return <ClientInterviewsTab {...tabProps} />;
      case 'Finalized & Offers':         return <ClientFinalizedTab {...tabProps} />;
      default: return <p className="text-xl text-slate-500 font-medium">{activeTab}</p>;
    }
  };

  const clientName = clientData?.companyName || clientData?.name || 'Client';
  const clientInitial = clientName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══════ SIDEBAR (AdminLayout Clean Style) ═══════ */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white border-r border-slate-200 flex flex-col
          transition-transform duration-300
        `}
      >
        {/* Logo & Toggle */}
        <div className={`flex items-center h-20 px-6 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between w-full h-10">
              <img src={logo} alt="Mabicons" className="h-[44px] w-auto object-contain" />
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-[#3FA9F5] transition-all"
              title="Expand Menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="h-[1px] bg-slate-100 mx-6 mb-4 opacity-50" />

        {/* Dashboard Link */}
        <div className="px-4 py-2">
          <button
            onClick={() => switchTab('Dashboard Overview')}
            title={sidebarCollapsed ? 'Dashboard' : undefined}
            className={`
              w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative
              ${activeTab === 'Dashboard Overview'
                ? 'bg-[#3FA9F5]/10 text-[#3FA9F5] ring-1 ring-[#3FA9F5]/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }
            `}
          >
            {activeTab === 'Dashboard Overview' && (
              <motion.div
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 bg-[#3FA9F5] rounded-r-full"
              />
            )}
            <div className="flex items-center gap-3 min-w-0">
              <FiGrid className={`w-5 h-5 flex-shrink-0 transition-colors ${activeTab === 'Dashboard Overview' ? 'text-[#3FA9F5]' : 'text-slate-400 group-hover:text-slate-500'}`} />
              {!sidebarCollapsed && <span className={`text-sm font-semibold truncate ${activeTab === 'Dashboard Overview' ? 'text-slate-800' : 'text-slate-600'}`}>Dashboard</span>}
            </div>
            {!sidebarCollapsed && activeTab === 'Dashboard Overview' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3FA9F5]" />}
          </button>
        </div>

        {/* Scrollable Menu */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
          {sidebarConfig.map((section, sectionIdx) => {
            const items = section.items.filter(item => item.title !== 'Dashboard Overview');
            if (items.length === 0) return null;

            // Collapsible folder-style section
            if (section.collapsible) {
              const SectionIcon = section.icon;
              const isExpanded = expandedSections.includes(section.heading);
              const hasActiveChild = items.some(i => activeTab === i.title);

              return (
                <div key={section.heading} className="mb-2">
                  {/* Section toggle button — full blue pill when expanded/active */}
                  <div className="px-2">
                    <button
                      onClick={() => toggleSection(section.heading)}
                      title={sidebarCollapsed ? section.label : undefined}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl
                        transition-all duration-200 group mt-1
                        ${isExpanded || hasActiveChild
                          ? 'bg-[#3FA9F5] text-white shadow-md shadow-[#3FA9F5]/25'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <SectionIcon
                          className={`w-[20px] h-[20px] flex-shrink-0 stroke-[1.8]
                            ${isExpanded || hasActiveChild ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}
                          `}
                        />
                        {!sidebarCollapsed && (
                          <span className={`text-[13.5px] font-bold uppercase tracking-wider truncate
                            ${isExpanded || hasActiveChild ? 'text-white' : 'text-slate-600'}
                          `}>
                            {section.label}
                          </span>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <FiChevronDown
                          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          } ${isExpanded || hasActiveChild ? 'text-white' : 'text-slate-400'}`}
                        />
                      )}
                    </button>
                  </div>

                  {/* Sub-items with bullet dot for active */}
                  {!sidebarCollapsed && (
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-8 py-1">
                        {items.map((item) => {
                          const isActive = activeTab === item.title;
                          return (
                            <button
                              key={item.id}
                              onClick={() => switchTab(item.title)}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                transition-all duration-200 text-left
                                ${isActive
                                  ? ''
                                  : 'hover:bg-slate-50'
                                }
                              `}
                            >
                              {/* Bullet dot */}
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200 ${
                                isActive ? 'bg-[#3FA9F5]' : 'bg-transparent'
                              }`} />
                              <span className={`text-[14px] truncate transition-colors duration-200
                                ${isActive ? 'text-[#3FA9F5] font-semibold' : 'text-slate-600 font-medium'}
                              `}>
                                {item.short || item.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Collapsed: show icon-only */}
                  {sidebarCollapsed && isExpanded && (
                    <div className="flex flex-col items-center gap-1 mt-1">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.title;
                        return (
                          <button
                            key={item.id}
                            onClick={() => switchTab(item.title)}
                            title={item.title}
                            className={`
                              w-9 h-9 flex items-center justify-center rounded-lg transition-all
                              ${isActive ? 'bg-[#3FA9F5]/10 text-[#3FA9F5]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
                            `}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Non-collapsible (flat) sections
            return (
              <div key={section.heading || sectionIdx} className="mb-2">
                {section.heading && !sidebarCollapsed && (
                  <p className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase select-none">
                    {section.heading}
                  </p>
                )}
                {section.heading && sidebarCollapsed && (
                  <div className="my-2 mx-3 h-[1px] bg-slate-100" />
                )}

                <div className="flex flex-col gap-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.title;
                    return (
                      <div key={item.id} className="px-2">
                        <button
                          onClick={() => switchTab(item.title)}
                          title={sidebarCollapsed ? item.title : undefined}
                          className={`
                            w-full flex items-center justify-between px-4 py-2.5 rounded-xl
                            transition-all duration-300 group mb-1
                            ${isActive
                              ? 'bg-[#3FA9F5]/10 text-[#3FA9F5]'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`w-[20px] h-[20px] flex-shrink-0 transition-colors duration-300 stroke-[1.8]
                                ${isActive ? 'text-[#3FA9F5]' : 'text-slate-400 group-hover:text-slate-600'}
                              `}
                            />
                            {!sidebarCollapsed && (
                              <span className={`text-[13.5px] font-medium truncate transition-colors duration-300
                                ${isActive ? 'text-slate-800' : 'text-slate-600'}
                              `}>
                                {item.title}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 mt-auto border-t border-slate-100">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group relative">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-bold text-blue-600">
                  {clientInitial}
                </div>
                <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-800 truncate">{clientName}</span>
                </div>
                <span className="text-[10px] text-slate-400 truncate leading-none">Client</span>
              </div>
              <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all" />
              <button
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-50 text-red-500 shadow-sm transition-all"
                title="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="relative group h-10 w-10"
              >
                <div className="h-full w-full rounded-xl bg-gradient-to-br from-[#3FA9F5] to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-100">
                  {clientInitial}
                </div>
                <div className="absolute -right-1 -bottom-1 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all duration-200"
                title="Logout"
              >
                <FiLogOut style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ═══════ MAIN CONTENT AREA ═══════ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white flex items-center justify-between px-6 shadow-sm border-b border-slate-100 sticky top-0 z-40">
          {/* Left: Tab Title + Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-[#3FA9F5] transition-all"
              aria-label="Open menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h2 className="text-[18px] font-semibold text-slate-800 tracking-tight leading-tight">{activeTab}</h2>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-[#3FA9F5] transition-all"
              >
                <FiBell className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="p-8 text-center text-gray-500">
                      <FiBell style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.5 }} />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold border-2 border-white shadow-sm">
                  {clientInitial}
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{clientName}</p>
                      <p className="text-sm text-gray-500">Client</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <FiUser style={{ width: '16px', height: '16px' }} />
                        My Profile
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <FiSettings style={{ width: '16px', height: '16px' }} />
                        Settings
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <FiLogOut style={{ width: '16px', height: '16px' }} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-4 lg:p-6">
          <Suspense fallback={<TabLoader />}>
            <PageTransition tabKey={activeTab}>
              {renderTabContent()}
            </PageTransition>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default ClientModularDashboard;
