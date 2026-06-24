import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAccessTo } from '../DepartmentProtectedRoute';
import {
  FiRefreshCw,
  FiTarget,
  FiChevronRight,
  FiGrid,
  FiDatabase,
} from 'react-icons/fi';
import logo from '../../../assets/images/mabicons logo blue.png';

// Lazy load KAM Tab Components
const DashboardOverviewTab = lazy(() => import('./Tabs/KAM/DashboardOverviewTab'));
const AttendanceTab = lazy(() => import('./Tabs/KAM/AttendanceTab'));
const PayrollTab = lazy(() => import('./Tabs/KAM/PayrollTab'));
const OnboardingKamTab = lazy(() => import('./Tabs/KAM/OnboardingKamTab'));
const PolicyTab = lazy(() => import('./Tabs/KAM/PolicyTab'));
const MasterDataTab = lazy(() => import('./Tabs/KAM/MasterDataTab'));
const PerformanceTab = lazy(() => import('./Tabs/KAM/PerformanceTab'));
const OffboardingTab = lazy(() => import('./Tabs/KAM/OffboardingTab'));
const FnFTab = lazy(() => import('./Tabs/KAM/FnFTab'));
const DocumentVerifyTab = lazy(() => import('./Tabs/KAM/DocumentVerifyTab'));
const NotesTab = lazy(() => import('./Tabs/KAM/NotesTab'));
const EmployeeEngagementTab = lazy(() => import('./Tabs/KAM/EmployeeEngagementTab'));
const TaskByClientTab = lazy(() => import('./Tabs/KAM/TaskByClientTab'));
const LeaveManagementTab = lazy(() => import('./Tabs/KAM/LeaveManagementTab'));
const ComplianceTab = lazy(() => import('./Tabs/KAM/ComplianceTab'));
const KamProductivityTab = lazy(() => import('./Tabs/KAM/KamProductivityTab'));
const WorkAgreementTab = lazy(() => import('./Tabs/KAM/WorkAgreementTab'));
const ChatUpdatesTab = lazy(() => import('./Tabs/KAM/ChatUpdatesTab'));
const WorkHandoverTab = lazy(() => import('./Tabs/KAM/WorkHandoverTab'));

/* ── Skeleton / Shimmer Loader ───────────────────────── */
const TabLoader = () => (
  <div className="animate-pulse space-y-6 p-2">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-52 rounded-lg bg-slate-200" />
        <div className="h-4 w-36 rounded-lg bg-slate-200 mt-2" />
      </div>
      <div className="h-10 w-32 rounded-lg bg-slate-200" />
    </div>
    {/* Stats skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 rounded-xl bg-slate-200" />
      ))}
    </div>
    {/* Table skeleton */}
    <div className="space-y-3">
      <div className="h-12 w-full rounded-lg bg-slate-200" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-16 w-full rounded-lg bg-slate-100" />
      ))}
    </div>
  </div>
);

/* ── Sidebar Items with Categories ───────────────────────────────────── */
const sidebarGroups = [
  {
    heading: 'Main',
    items: [
      { id: 0, title: 'Dashboard', short: 'Dash', icon: FiGrid },
      { id: 1, title: 'Attendance', short: 'Attend', icon: FiClock },
      { id: 2, title: 'Payroll', short: 'Payroll', icon: FiDollarSign },
      { id: 13, title: 'Leave Management', short: 'Leaves', icon: FiCalendar },
      { id: 6, title: 'Performance', short: 'Perf', icon: FiTrendingUp },
    ]
  },
  {
    heading: 'Employee Lifecycle',
    items: [
      { id: 3, title: 'Onboarding', short: 'Onboard', icon: FiUserPlus },
      { id: 7, title: 'Offboarding', short: 'Offboard', icon: FiUserMinus },
      { id: 8, title: 'FnF', short: 'FnF', icon: FiCheckSquare },
      { id: 5, title: 'Master Data (Emp)', short: 'Master', icon: FiUsers },
    ]
  },
  {
    heading: 'Documentation',
    items: [
      { id: 9, title: 'Document Verify', short: 'Verify', icon: FiFile },
      { id: 4, title: 'HR Policy', short: 'HR Policy', icon: FiFileText },
      { id: 14, title: 'Compliance Management', short: 'Compl', icon: FiShield },
      { id: 16, title: 'Work Agreements', short: 'Agreem', icon: FiFileText },
    ]
  },
  {
    heading: 'Others',
    items: [
      { id: 12, title: 'Task by Client', short: 'Tasks', icon: FiClipboard },
      { id: 10, title: 'Notes', short: 'Notes', icon: FiEdit3 },
      { id: 18, title: 'Work Handover', short: 'Handov', icon: FiRefreshCw },
      { id: 15, title: 'KAM Productivity', short: 'Product', icon: FiTrendingUp },
    ]
  },
];

// Flatten for utility functions
const moduleItems = sidebarGroups.flatMap(group => group.items);

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

/* ══════════════════ KAM DASHBOARD ═══════════════════ */
const KamDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);
  const touchStartX = useRef(0);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Swipe to open sidebar on mobile
  useEffect(() => {
    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (dx > 70 && touchStartX.current < 40) setSidebarOpen(true); // swipe right from left edge
      if (dx < -70 && sidebarOpen) setSidebarOpen(false); // swipe left to close
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('department');
    localStorage.removeItem('recruitmentTabAuth');
    window.location.href = '/login';
  };

  const switchTab = (title) => {
    setActiveTab(title);
    setSidebarOpen(false); // close mobile sidebar on nav
  };

  const renderTabContent = () => {
    const tabProps = { isDarkMode, selectedClient };
    switch (activeTab) {
      case 'Dashboard': return <DashboardOverviewTab {...tabProps} onNavigate={switchTab} />;
      case 'Attendance': return <AttendanceTab {...tabProps} />;
      case 'Payroll': return <PayrollTab {...tabProps} />;
      case 'Onboarding': return <OnboardingKamTab {...tabProps} />;
      case 'HR Policy': return <PolicyTab {...tabProps} isReadOnly={true} />;
      case 'Master Data (Emp)': return <MasterDataTab {...tabProps} />;
      case 'Performance': return <PerformanceTab {...tabProps} />;
      case 'Offboarding': return <OffboardingTab {...tabProps} />;
      case 'FnF': return <FnFTab {...tabProps} />;
      case 'Document Verify': return <DocumentVerifyTab {...tabProps} />;
      case 'Notes': return <NotesTab {...tabProps} />;
      case 'Task by Client': return <TaskByClientTab {...tabProps} />;
      case 'Leave Management': return <LeaveManagementTab {...tabProps} />;
      case 'Compliance Management': return <ComplianceTab {...tabProps} />;
      case 'KAM Productivity': return <KamProductivityTab {...tabProps} />;
      case 'Work Agreements': return <WorkAgreementTab {...tabProps} />;
      case 'Work Handover': return <WorkHandoverTab {...tabProps} />;
      default: return <p className="text-xl text-slate-500 font-medium">{activeTab}</p>;
    }
  };

  /* ── Active module meta (for header breadcrumb) ──── */
  const activeModule = moduleItems.find(m => m.title === activeTab);

  return (
    <div className="h-screen bg-slate-100 p-0 md:p-3 select-none overflow-hidden">
      <div className="relative flex h-full md:h-[calc(100vh-1.5rem)] md:rounded-2xl border-0 md:border border-slate-200 bg-slate-50 overflow-hidden">
        {/* ── Background blurs ── */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-indigo-100/50 via-slate-100/20 to-transparent pointer-events-none" />
        <div className="hidden md:block absolute -bottom-10 left-10 h-44 w-96 rounded-full bg-indigo-100/40 blur-2xl pointer-events-none" />
        <div className="hidden md:block absolute -bottom-14 right-24 h-52 w-[28rem] rounded-full bg-slate-200/40 blur-2xl pointer-events-none" />

        {/* ═══════ MOBILE OVERLAY ═══════ */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══════ SIDEBAR ═══════ */}
        <aside
          ref={sidebarRef}
          className={`
            fixed md:relative z-50 md:z-10 top-0 left-0 h-full
            w-[260px] border-r border-slate-200 bg-white
            flex flex-col shadow-sm
            transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Logo Section (VANTUS Style) */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <FiTarget className="text-white text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-800 leading-tight tracking-tight">MABICONS</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">ERP Solution</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden rounded-lg p-1.5 hover:bg-slate-50 text-slate-400 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
            {/* VANTUS style toggle decoration */}
            <div className="hidden md:flex h-6 w-6 items-center justify-center rounded bg-slate-50 border border-slate-100">
              <div className="h-1 w-1 bg-slate-300 rounded-full mx-[1px]" />
              <div className="h-1 w-1 bg-slate-300 rounded-full mx-[1px]" />
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 mx-6 mb-6" />

          {/* Nav scrollable */}
          <nav className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-thin">
            {sidebarGroups.map((section) => (
              <div key={section.heading} className="space-y-1.5">
                <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {section.heading}
                </h3>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.title;
                  return (
                    <button
                      key={item.id}
                      onClick={() => switchTab(item.title)}
                      className={`
                        group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                        transition-all duration-200
                        ${isActive
                          ? 'bg-[#00B4FF] text-white shadow-lg shadow-sky-100'
                          : 'text-slate-500 hover:bg-slate-50'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className={`text-sm font-semibold flex-1 ${isActive ? 'text-white' : 'text-slate-600'}`}>{item.title}</span>
                      {!isActive && <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Profile Footer (Emma Style) */}
          <div className="p-4 mt-auto border-t border-slate-100">
            <div className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-bold text-orange-600">
                  {localStorage.getItem('userName')?.charAt(0) || 'K'}
                </div>
                <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-800 truncate">{localStorage.getItem('userName') || 'KAM User'}</span>
                  <div className="h-3 w-3 bg-sky-400 rounded-full flex items-center justify-center">
                    <span className="text-[6px] text-white italic">✓</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 truncate leading-none">{localStorage.getItem('userEmail') || 'kam@mabicons.com'}</span>
              </div>
              <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </aside>

        {/* ═══════ MAIN CONTENT ═══════ */}
        <main className="relative z-10 flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* ── Top Bar ── */}
          <header className="flex-shrink-0 z-30 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3">
              {/* Left: Logo + Hamburger */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`md:hidden flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 active:scale-95 border border-slate-200 shadow-sm ${sidebarOpen
                    ? 'bg-slate-50 text-slate-400'
                    : 'bg-white text-indigo-600 hover:shadow-md'
                    }`}
                  aria-label="Toggle Menu"
                >
                  <FiMenu className="w-5 h-5 stroke-[2]" />
                </button>
                <img src={logo} alt="Mabicons" className="h-7 md:hidden object-contain" />
              </div>
            </div>
          </header>

          {/* ── Content area ── */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6 scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-transparent hover:scrollbar-thumb-violet-400">
            <div className="max-w-[1600px] mx-auto">
              <div className="rounded-2xl border border-[#dfdbea] bg-white/85 backdrop-blur-sm min-h-[420px] md:min-h-[520px] p-4 md:p-6 shadow-sm">
                <Suspense fallback={<TabLoader />}>
                  <PageTransition tabKey={activeTab}>
                    {renderTabContent()}
                  </PageTransition>
                </Suspense>
              </div>
            </div>
          </div>

          {/* ── Mobile Bottom Navigation (quick access to top 5 modules) ── */}
          <nav className="md:hidden sticky bottom-0 z-30 bg-white/90 backdrop-blur-xl border-t border-[#e8e4f3] px-2 py-1.5 safe-area-bottom">
            <div className="flex items-center justify-around">
              {moduleItems.slice(0, 5).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.title;
                return (
                  <button
                    key={item.id}
                    onClick={() => switchTab(item.title)}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200 active:scale-90 min-w-0"
                  >
                    <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-violet-100 shadow-sm' : ''}`}>
                      <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                    </div>
                    <span className={`text-[10px] font-medium truncate max-w-[56px] transition-colors duration-200 ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>
                      {item.short}
                    </span>
                    {/* Active dot */}
                    {isActive && <span className="w-1 h-1 rounded-full bg-violet-500 mt-0.5" />}
                  </button>
                );
              })}
              {/* More button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200 active:scale-90"
              >
                <div className="p-1.5 rounded-lg">
                  <FiMenu className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">More</span>
              </button>
            </div>
          </nav>
        </main>
      </div>
    </div>
  );
};

export default KamDashboard;
