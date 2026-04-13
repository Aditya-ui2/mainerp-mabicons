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
    { name: 'Screening', count: 40, color: '#f59e0b' },
    { name: 'Phone', count: 30, color: '#f43f5e' },
    { name: 'Technical', count: 20, color: '#8b5cf6' },
    { name: 'Final Rounds', count: 50, color: '#1B4DA0' },
    { name: 'Hired', count: 45, color: '#10b981' },
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
const PremiumOverview = ({ clientData, setActiveTab }) => {
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
          <h2 className="text-3xl font-bold text-[#1E293B] mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Welcome, {cName}!</h2>
          <p className="text-base font-medium text-[#64748b]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            {dateStr}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Main Actions */}
          <div className="flex items-center gap-3">

            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-2xl text-xs font-bold hover:bg-[#0a3a82] transition-all active:scale-95 shadow-lg shadow-blue-500/20"
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
            <div key={i} className="bg-white p-7 rounded-[28px] border border-[#F0F0F2] shadow-sm hover:shadow-md transition-all duration-300 group text-left h-[236px]">
              {/* Icon Box */}
              <div className="w-12 h-12 rounded-[16px] flex items-center justify-center bg-[#F0F7FF] text-[#1B4DA0] mb-6 transition-transform group-hover:scale-105 duration-300">
                <Icon size={24} strokeWidth={2.2} />
              </div>
              
              {/* Label */}
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.05em] mb-2">
                {kpi.label}
              </p>
              
              {/* Value */}
              <h3 className="text-[32px] font-bold text-[#1E293B] leading-none tracking-tight">
                {kpi.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut - Staff Applications */}
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

        {/* Bar - Annual Recruitment Summary */}
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

        {/* Table - Recent Applicants */}
        <div className="lg:col-span-6 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Recent Applicants</h2>
            <button 
              onClick={() => setActiveTab('Candidates')}
              className="text-sm font-bold text-[#3FA9F5] hover:text-[#2d8cd3] transition-colors flex items-center gap-1"
            >
              View All <FiExternalLink size={14} />
            </button>
          </div>
          <div className="space-y-1 flex-1">
            <div className="grid grid-cols-4 gap-4 px-2 mb-2">
              <p className="col-span-2 text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Candidate</p>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Date</p>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider text-right">Status</p>
            </div>
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((app, idx) => (
                <TableItem key={idx} {...app} />
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <FiUsers className="text-slate-300" size={24} />
                </div>
                <p className="text-sm font-medium text-slate-400">No recent applicants found</p>
              </div>
            )}
          </div>
        </div>

        {/* Table - Job Progress History */}
        <div className="lg:col-span-6 bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Job Progress History</h2>
            <button 
              onClick={() => setActiveTab('Job Positions')}
              className="text-sm font-bold text-[#3FA9F5] hover:text-[#2d8cd3] transition-colors flex items-center gap-1"
            >
              View All <FiExternalLink size={14} />
            </button>
          </div>
          <div className="space-y-1 flex-1">
            <div className="grid grid-cols-4 gap-4 px-2 mb-2">
              <p className="col-span-2 text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Position</p>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Applicants</p>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider text-right">Status</p>
            </div>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, idx) => (
                <TableItem key={idx} {...job} />
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <FiBriefcase className="text-slate-300" size={24} />
                </div>
                <p className="text-sm font-medium text-slate-400">No job progress recorded</p>
              </div>
            )}
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
      case 'Dashboard Overview':        return <PremiumOverview clientData={clientData} setActiveTab={setActiveTab} />;
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
    <div className="flex h-screen bg-[#FDFDFD] overflow-hidden">
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


        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#FDFDFD] p-4 lg:p-6">
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
