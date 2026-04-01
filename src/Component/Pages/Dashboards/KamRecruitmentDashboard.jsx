import { useState, useEffect, useRef, Suspense, lazy, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAccessTo } from '../DepartmentProtectedRoute';
import {
  FiSearch,
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiAward,
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiTarget,
  FiArrowLeft,
  FiUserPlus,
  FiCheckSquare,
  FiDatabase,
  FiRepeat,
} from 'react-icons/fi';
import logo from '../../../assets/images/mabicons logo blue.png';

// Eagerly load the 3 main tabs for instant render (no lazy = no Suspense delay)
import JobOpeningsTab from './Tabs/KAMRecruitment/JobOpeningsTab';
import CandidatePipelineTab from './Tabs/KAMRecruitment/CandidatePipelineTab';
import InterviewScheduleTab from './Tabs/KAMRecruitment/InterviewScheduleTab';

// Lazy load other tabs (loaded on demand)
const ScreeningTab = lazy(() => import('./Tabs/KAMRecruitment/ScreeningTab'));
const OfferManagementTab = lazy(() => import('./Tabs/KAMRecruitment/OfferManagementTab'));
const RecruitmentAnalyticsTab = lazy(() => import('./Tabs/KAMRecruitment/RecruitmentAnalyticsTab'));
const TeamMembersTab = lazy(() => import('./Tabs/KAMRecruitment/TeamMembersTab'));
const TaskAssignmentTab = lazy(() => import('./Tabs/KAMRecruitment/TaskAssignmentTab'));
const ResumeBankTab = lazy(() => import('./Tabs/KAMRecruitment/ResumeBankTab'));
const WorkHandoverTab = lazy(() => import('./Tabs/KAM/WorkHandoverTab'));

/* ── Skeleton / Shimmer Loader ───────────────────────── */
const TabLoader = () => (
  <div className="animate-pulse space-y-6 p-2">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-52 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-36 rounded-lg bg-slate-200 dark:bg-slate-700 mt-2" />
      </div>
      <div className="h-10 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
    {/* Stats skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700" />
      ))}
    </div>
    {/* Table skeleton */}
    <div className="space-y-3">
      <div className="h-12 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-16 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  </div>
);

/* ── Error Boundary ──────────────────────────────────── */
class TabErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Tab crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Something went wrong</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">This tab encountered an error while loading. Please try again.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Sidebar Items ───────────────────────────────────── */
const moduleItems = [
  { id: 1, title: 'Job Openings', short: 'Openings', icon: FiBriefcase },
  { id: 2, title: 'Candidate Pipeline', short: 'Pipeline', icon: FiUsers },
  { id: 3, title: 'Interview Schedule', short: 'Interviews', icon: FiCalendar },
  { id: 5, title: 'Offer Management', short: 'Offers', icon: FiAward },
  { id: 7, title: 'Resume Bank', short: 'Resumes', icon: FiDatabase },
  { id: 8, title: 'Team Members', short: 'Team', icon: FiUserPlus, section: 'TEAM' },
  { id: 9, title: 'Task Assignment', short: 'Tasks', icon: FiCheckSquare, section: 'TEAM' },
  { id: 10, title: 'Work Handover', short: 'Handover', icon: FiRepeat, section: 'TEAM' },
];

/* ── Page Transition Wrapper ─────────────────────────── */
const PageTransition = ({ children }) => (
  <div className="animate-[fadeIn_150ms_ease-out]">
    {children}
  </div>
);

/* ══════════════════ KAM RECRUITMENT DASHBOARD ═══════════════════ */
const KamRecruitmentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Job Openings');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);
  const touchStartX = useRef(0);
  // Track which tabs have been visited to keep them mounted
  // All 3 main tabs are pre-loaded from the start for instant switching
  const [loadedTabs, setLoadedTabs] = useState(new Set(['Job Openings', 'Candidate Pipeline', 'Interview Schedule']));

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
      if (dx > 70 && touchStartX.current < 40) setSidebarOpen(true);
      if (dx < -70 && sidebarOpen) setSidebarOpen(false);
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
    setLoadedTabs(prev => new Set([...prev, title]));
    setSidebarOpen(false);
  };

  // Tabs that stay mounted once visited (the heavy data-fetching ones)
  const cachedTabs = ['Job Openings', 'Candidate Pipeline', 'Interview Schedule'];

  const renderTabContent = () => {
    const tabProps = { isDarkMode, selectedClient };

    // Render cached tabs with CSS display toggle (stay mounted once loaded)
    const cachedTabElements = cachedTabs
      .filter(tab => loadedTabs.has(tab))
      .map(tab => {
        let TabComponent;
        switch (tab) {
          case 'Job Openings': TabComponent = JobOpeningsTab; break;
          case 'Candidate Pipeline': TabComponent = CandidatePipelineTab; break;
          case 'Interview Schedule': TabComponent = InterviewScheduleTab; break;
          default: return null;
        }
        return (
          <div key={tab} style={{ display: activeTab === tab ? 'block' : 'none' }}>
            <TabComponent {...tabProps} />
          </div>
        );
      });

    // Non-cached tabs render normally (unmount on switch)
    let dynamicTab = null;
    if (!cachedTabs.includes(activeTab)) {
      switch (activeTab) {
        case 'Screening & Assessment': dynamicTab = <ScreeningTab {...tabProps} />; break;
        case 'Offer Management': dynamicTab = <OfferManagementTab {...tabProps} />; break;
        case 'Recruitment Analytics': dynamicTab = <RecruitmentAnalyticsTab {...tabProps} />; break;
        case 'Resume Bank': dynamicTab = <ResumeBankTab {...tabProps} />; break;
        case 'Team Members': dynamicTab = <TeamMembersTab {...tabProps} userRole="KAM" />; break;
        case 'Task Assignment': dynamicTab = <TaskAssignmentTab {...tabProps} userRole="KAM" />; break;
        case 'Work Handover': dynamicTab = <WorkHandoverTab {...tabProps} />; break;
        default: dynamicTab = <p className="text-xl text-slate-500 font-medium">{activeTab}</p>;
      }
    }

    return (
      <>
        {cachedTabElements}
        {dynamicTab && (
          <TabErrorBoundary key={activeTab}>
            <Suspense fallback={<TabLoader />}>
              <PageTransition>{dynamicTab}</PageTransition>
            </Suspense>
          </TabErrorBoundary>
        )}
      </>
    );
  };

  const activeModule = moduleItems.find(m => m.title === activeTab);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} p-0 md:p-3 select-none transition-colors duration-300`}>
      <div className={`relative flex min-h-screen md:min-h-[calc(100vh-1.5rem)] overflow-hidden md:rounded-2xl border-0 md:border ${isDarkMode ? 'border-slate-700 bg-slate-800/90' : 'border-slate-200 bg-slate-50'}`}>
        {/* ── Background blurs ── */}
        <div className={`absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t ${isDarkMode ? 'from-indigo-900/20' : 'from-indigo-100/50'} via-transparent to-transparent pointer-events-none`} />
        <div className={`hidden md:block absolute -bottom-10 left-10 h-44 w-96 rounded-full ${isDarkMode ? 'bg-indigo-800/20' : 'bg-indigo-100/40'} blur-2xl pointer-events-none`} />
        <div className={`hidden md:block absolute -bottom-14 right-24 h-52 w-[28rem] rounded-full ${isDarkMode ? 'bg-slate-700/20' : 'bg-slate-200/40'} blur-2xl pointer-events-none`} />

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
            w-[280px] border-r
            ${isDarkMode
              ? 'border-slate-700 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900/90'
              : 'border-slate-200 bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/50'
            }
            p-5 flex flex-col
            transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Logo + close */}
          <div className="flex items-center justify-between pb-4 pt-4 px-4 bg-white mb-4 -mx-5 -mt-5 border-b border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Mabicons" className="h-10 w-auto object-contain" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden rounded-lg p-1.5 hover:bg-slate-50 text-[#1E88E5] transition-colors"
            >
              <FiX className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Dashboard Type Badge */}
          <div className={`mb-4 px-4 py-3 rounded-xl ${isDarkMode ? 'bg-indigo-900/30 border border-indigo-800/50' : 'bg-indigo-100 border border-indigo-200'}`}>
            <div className="flex items-center gap-2">
              <FiTarget className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>HR Recruitment</span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Talent Acquisition Hub</p>
          </div>

          {/* Back to KAM Operations Dashboard - only show if user has HR Operations access */}
          {hasAccessTo('HR Operations') && (
            <button
              onClick={() => navigate('/kam-operations-dashboard')}
              className={`mb-4 w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to HR Operations
            </button>
          )}

          {/* Nav scrollable */}
          <nav className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {moduleItems.map((item) => {
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
                      ? isDarkMode
                        ? 'bg-indigo-900/50 text-indigo-300 shadow-sm shadow-indigo-500/20'
                        : 'bg-indigo-100 text-indigo-700 shadow-sm shadow-indigo-200/50'
                      : isDarkMode
                        ? 'text-slate-400 hover:bg-slate-700/50 active:scale-[0.98]'
                        : 'text-slate-600 hover:bg-white/50 active:scale-[0.98]'
                    }
                  `}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-indigo-500 transition-all duration-300" />
                  )}
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${isActive ? isDarkMode ? 'text-indigo-400' : 'text-indigo-600' : isDarkMode ? 'text-slate-500' : 'text-slate-400'} group-hover:${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
                  <span className="text-sm leading-none font-medium truncate">{item.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`mt-4 flex items-center justify-center gap-2 w-full rounded-xl ${isDarkMode ? 'bg-red-900/30 hover:bg-red-900/50 border-red-800 text-red-400' : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'} border py-3 text-sm font-medium transition-all duration-200 active:scale-[0.97]`}
          >
            <FiLogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        {/* ═══════ MAIN CONTENT ═══════ */}
        <main className="relative z-10 flex-1 flex flex-col min-w-0">
          {/* ── Top Bar ── */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3">
              {/* Left: Logo + Hamburger */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img src={logo} alt="Mabicons" className="h-9 w-auto md:hidden object-contain" />
              </div>

              {/* Right: theme toggle + profile + hamburger button */}
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-700 text-amber-400 hover:bg-slate-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'} transition-all`}
                >
                  {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>
                
                {/* Hamburger – mobile only */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden rounded-lg p-2 text-[#1E88E5] hover:bg-slate-50 transition-colors"
                >
                  <FiMenu className="w-7 h-7 stroke-[2.5]" />
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`flex items-center gap-2 rounded-xl ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-white/70 hover:bg-white'} px-3 py-2 transition-all`}
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-slate-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      KR
                    </div>
                    <span className={`hidden sm:block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>KAM User</span>
                    <FiChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileMenu && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-xl py-2 z-50`}>
                      <button className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'} transition-colors`}>
                        <FiUser className="w-4 h-4" /> Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'} transition-colors`}
                      >
                        <FiLogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            {activeModule && (
              <div className={`px-4 md:px-6 pb-3 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <activeModule.icon className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-violet-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{activeModule.title}</span>
              </div>
            )}
          </header>

          {/* ── Tab Content ── */}
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            {renderTabContent()}
          </section>
        </main>
      </div>
    </div>
  );
};

export default KamRecruitmentDashboard;
