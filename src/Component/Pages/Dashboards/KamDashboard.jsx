import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAccessTo } from '../DepartmentProtectedRoute';
import {
  FiSearch,
  FiSettings,
  FiClock,
  FiDollarSign,
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
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiMessageSquare,
  FiRefreshCw,
  FiTarget,
} from 'react-icons/fi';
import logo from '../../../assets/images/mabicons-logo.svg';

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
    heading: 'HR Operations',
    items: [
      { id: 1, title: 'Attendance', short: 'Attendance', icon: FiClock },
      { id: 2, title: 'Payroll', short: 'Payroll', icon: FiDollarSign },
      { id: 13, title: 'Leave Management', short: 'Leaves', icon: FiCalendar },
      { id: 6, title: 'Performance', short: 'Performance', icon: FiTrendingUp },
    ]
  },
  {
    heading: 'Employee Lifecycle',
    items: [
      { id: 3, title: 'Onboarding', short: 'Onboarding', icon: FiUserPlus },
      { id: 7, title: 'Offboarding', short: 'Offboarding', icon: FiUserMinus },
      { id: 8, title: 'FnF', short: 'FnF', icon: FiCheckSquare },
      { id: 5, title: 'Master Data (Emp)', short: 'Employees', icon: FiUsers },
    ]
  },
  {
    heading: 'Documentation',
    items: [
      { id: 9, title: 'Document Verify', short: 'Documents', icon: FiFile },
      { id: 4, title: 'Policy Making', short: 'Policies', icon: FiFileText },
      { id: 14, title: 'Compliance Management', short: 'Compliance', icon: FiShield },
      { id: 16, title: 'Work Agreements', short: 'Agreements', icon: FiFileText },
    ]
  },
  {
    heading: 'Engagement & Tasks',
    items: [
      { id: 11, title: 'Employee Engagement', short: 'Engagement', icon: FiHeart },
      { id: 12, title: 'Task by Client', short: 'Tasks', icon: FiClipboard },
      { id: 10, title: 'Notes', short: 'Notes', icon: FiEdit3 },
    ]
  },
  {
    heading: 'Communication',
    items: [
      { id: 17, title: 'Client Chat', short: 'Chat', icon: FiMessageSquare },
      { id: 18, title: 'Work Handover', short: 'Handover', icon: FiRefreshCw },
      { id: 15, title: 'KAM Productivity', short: 'Productivity', icon: FiTrendingUp },
    ]
  },
];

// Dashboard item (separate from groups)
const dashboardItem = { id: 0, title: 'Dashboard', short: 'Dashboard', icon: FiTrendingUp };

// Flatten for backwards compatibility
const moduleItems = [dashboardItem, ...sidebarGroups.flatMap(group => group.items)];

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
      case 'Policy Making': return <PolicyTab {...tabProps} />;
      case 'Master Data (Emp)': return <MasterDataTab {...tabProps} />;
      case 'Performance': return <PerformanceTab {...tabProps} />;
      case 'Offboarding': return <OffboardingTab {...tabProps} />;
      case 'FnF': return <FnFTab {...tabProps} />;
      case 'Document Verify': return <DocumentVerifyTab {...tabProps} />;
      case 'Notes': return <NotesTab {...tabProps} />;
      case 'Employee Engagement': return <EmployeeEngagementTab {...tabProps} />;
      case 'Task by Client': return <TaskByClientTab {...tabProps} />;
      case 'Leave Management': return <LeaveManagementTab {...tabProps} />;
      case 'Compliance Management': return <ComplianceTab {...tabProps} />;
      case 'KAM Productivity': return <KamProductivityTab {...tabProps} />;
      case 'Work Agreements': return <WorkAgreementTab {...tabProps} />;
      case 'Client Chat': return <ChatUpdatesTab {...tabProps} />;
      case 'Work Handover': return <WorkHandoverTab {...tabProps} />;
      default: return <p className="text-xl text-slate-500 font-medium">{activeTab}</p>;
    }
  };

  /* ── Active module meta (for header breadcrumb) ──── */
  const activeModule = moduleItems.find(m => m.title === activeTab);

  return (
    <div className="h-screen bg-[#f2f0fa] p-0 md:p-3 select-none overflow-hidden">
      <div className="relative flex h-full md:h-[calc(100vh-1.5rem)] md:rounded-2xl border-0 md:border border-[#dcd8ed] bg-[#f7f5fc] overflow-hidden">
        {/* ── Background blurs ── */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#d9d2fb]/70 via-[#ebe7ff]/35 to-transparent pointer-events-none" />
        <div className="hidden md:block absolute -bottom-10 left-10 h-44 w-96 rounded-full bg-[#e7e0ff]/60 blur-2xl pointer-events-none" />
        <div className="hidden md:block absolute -bottom-14 right-24 h-52 w-[28rem] rounded-full bg-[#d6d0ff]/50 blur-2xl pointer-events-none" />

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
            w-[280px] border-r border-[#e0dcec]
            bg-gradient-to-b from-[#f4f1fd] via-[#f2effb] to-[#ddd5fa]/45
            p-5 flex flex-col overflow-hidden flex-shrink-0
            transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Logo + close */}
          <div className="flex items-center justify-between pb-5 pt-1 px-1">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Mabicons" className="h-10 w-auto object-contain" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden rounded-lg p-1.5 hover:bg-white/60 text-slate-500 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Nav scrollable */}
          <nav className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-transparent hover:scrollbar-thumb-violet-400">
            {/* Dashboard Button - Always on top */}
            <div className="mb-3 space-y-2">
              <button
                onClick={() => switchTab('Dashboard')}
                className={`
                  group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                  transition-all duration-200 relative overflow-hidden
                  ${activeTab === 'Dashboard'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                    : 'text-slate-600 hover:bg-white/50 active:scale-[0.98] border-2 border-dashed border-violet-200 hover:border-violet-300'
                  }
                `}
              >
                <FiTrendingUp className={`w-5 h-5 flex-shrink-0 ${activeTab === 'Dashboard' ? 'text-white' : 'text-violet-500'}`} />
                <span className="text-sm font-bold truncate">Dashboard Overview</span>
              </button>

              {/* HR Recruitment Dashboard Link - Only show if user has access */}
              {hasAccessTo('HR Recruitment') && (
                <button
                  onClick={() => navigate('/kam-recruitment-dashboard')}
                  className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FiTarget className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-bold truncate">HR Recruitment</span>
                </button>
              )}
            </div>

            {/* Grouped Navigation */}
            {sidebarGroups.map((group, groupIdx) => (
              <div key={group.heading} className={groupIdx > 0 ? 'mt-4' : ''}>
                {/* Group Heading */}
                <h3 className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.heading}
                </h3>
                {/* Group Items */}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.title;
                    return (
                      <button
                        key={item.id}
                        onClick={() => switchTab(item.title)}
                        className={`
                          group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left
                          transition-all duration-200 relative overflow-hidden
                          ${isActive
                            ? 'bg-violet-100 text-violet-700 shadow-sm shadow-violet-200/50'
                            : 'text-slate-600 hover:bg-white/50 active:scale-[0.98]'
                          }
                        `}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-violet-500 transition-all duration-300" />
                        )}
                        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="text-sm leading-none font-medium truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.97]"
          >
            <FiLogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        {/* ═══════ MAIN CONTENT ═══════ */}
        <main className="relative z-10 flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* ── Top Bar ── */}
          <header className="flex-shrink-0 z-30 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3">
              {/* Left: Logo + Hamburger */}
              <div className="flex items-center justify-between w-full">
                <img src={logo} alt="Mabicons" className="h-8 md:hidden object-contain" />
                
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`md:hidden p-2 transition-all duration-300 rounded-xl active:scale-95 ${
                    sidebarOpen 
                    ? 'bg-[#0f1629] text-white shadow-lg shadow-blue-900/20' 
                    : 'text-[#1E88E5] bg-transparent'
                  }`}
                >
                  <FiMenu className="w-6 h-6" />
                </button>
              </div>

              {/* Right: profile */}
              <div className="flex items-center gap-1.5 md:gap-3 text-slate-600 flex-shrink-0">
                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 rounded-xl p-1.5 md:p-2 hover:bg-white/60 transition-all duration-200 active:scale-[0.97]"
                  >
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-violet-200/50">
                      K
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-slate-700">KAM User</p>
                      <p className="text-[11px] text-slate-500 leading-tight">Key Account Manager</p>
                    </div>
                    <FiChevronDown className={`hidden md:block h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  <div className={`
                    absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white shadow-2xl shadow-slate-200/60 border border-slate-100 py-2 z-50
                    transition-all duration-200 origin-top-right
                    ${showProfileMenu ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                  `}>
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">K</div>
                        <div>
                          <p className="font-semibold text-slate-700 text-sm">KAM User</p>
                          <p className="text-xs text-slate-500">kam@mabicons.com</p>
                        </div>
                      </div>
                    </div>
                    {[
                      { icon: FiUser, label: 'My Profile' },
                      { icon: FiSettings, label: 'Settings' },
                    ].map(item => (
                      <button key={item.label} className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-slate-600 hover:bg-slate-50 transition-colors active:bg-slate-100">
                        <item.icon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="h-4 w-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile: Active tab breadcrumb ── */}
            <div className="md:hidden flex items-center gap-2 px-4 pb-3 -mt-1">
              {activeModule && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100">
                  <activeModule.icon className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-xs font-semibold text-violet-700">{activeModule.short}</span>
                </div>
              )}
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
