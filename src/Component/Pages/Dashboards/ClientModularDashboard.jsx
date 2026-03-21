import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import {
  FiSearch,
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
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import logo from '../../../assets/images/mabicons-logo.svg';
import { getClientDetails } from '../service/api';

// Lazy load Client Tab Components
const ClientAttendanceTab = lazy(() => import('./Tabs/Client/ClientAttendanceTab'));
const ClientPayrollTab = lazy(() => import('./Tabs/Client/ClientPayrollTab'));
const ClientPolicyTab = lazy(() => import('./Tabs/Client/ClientPolicyTab'));
const ClientMasterDataTab = lazy(() => import('./Tabs/Client/ClientMasterDataTab'));
const ClientTaskTab = lazy(() => import('./Tabs/Client/ClientTaskTab'));
const ClientEngagementTab = lazy(() => import('./Tabs/Client/ClientEngagementTab'));

/* ── Skeleton / Shimmer Loader ───────────────────────── */
const TabLoader = () => (
  <div className="animate-pulse space-y-6 p-2">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-52 rounded-lg bg-slate-200" />
        <div className="h-4 w-36 rounded-lg bg-slate-200 mt-2" />
      </div>
      <div className="h-10 w-32 rounded-lg bg-slate-200" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 rounded-xl bg-slate-200" />
      ))}
    </div>
    <div className="space-y-3">
      <div className="h-12 w-full rounded-lg bg-slate-200" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-16 w-full rounded-lg bg-slate-100" />
      ))}
    </div>
  </div>
);

/* ── Sidebar Items ───────────────────────────────────── */
const moduleItems = [
  { id: 1, title: 'Attendance Share / Review', short: 'Attendance', icon: FiClock },
  { id: 2, title: 'Payroll', short: 'Payroll', icon: FiDollarSign },
  { id: 3, title: 'Policy & Documents', short: 'Policies', icon: FiFileText },
  { id: 4, title: 'Master Data', short: 'Master Data', icon: FiUsers },
  { id: 5, title: 'Assign Task to KAM', short: 'Tasks', icon: FiClipboard },
  { id: 6, title: 'Employee Engagement', short: 'Engagement', icon: FiHeart },
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
  const [activeTab, setActiveTab] = useState(moduleItems[0].title);
  const [isDarkMode] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);
  const touchStartX = useRef(0);

  // Decode token to get client info
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        getClientDetails(decoded.id).then(res => {
          if (res?.data) setClientData(res.data);
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

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
    window.location.href = '/client-login';
  };

  const switchTab = (title) => {
    setActiveTab(title);
    setSidebarOpen(false);
  };

  const renderTabContent = () => {
    const tabProps = { isDarkMode, clientData };
    switch (activeTab) {
      case 'Attendance Share / Review': return <ClientAttendanceTab {...tabProps} />;
      case 'Payroll':                   return <ClientPayrollTab {...tabProps} />;
      case 'Policy & Documents':        return <ClientPolicyTab {...tabProps} />;
      case 'Master Data':               return <ClientMasterDataTab {...tabProps} />;
      case 'Assign Task to KAM':        return <ClientTaskTab {...tabProps} />;
      case 'Employee Engagement':       return <ClientEngagementTab {...tabProps} />;
      default: return <p className="text-xl text-slate-500 font-medium">{activeTab}</p>;
    }
  };

  const activeModule = moduleItems.find(m => m.title === activeTab);
  const clientName = clientData?.companyName || clientData?.name || 'Client';
  const clientInitial = clientName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#eef2fa] p-0 md:p-3 select-none">
      <div className="relative flex min-h-screen md:min-h-[calc(100vh-1.5rem)] overflow-hidden md:rounded-2xl border-0 md:border border-[#d5dced] bg-[#f5f7fc]">
        {/* ── Background blurs ── */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#c9d6fb]/70 via-[#e3eaff]/35 to-transparent pointer-events-none" />
        <div className="hidden md:block absolute -bottom-10 left-10 h-44 w-96 rounded-full bg-[#dce4ff]/60 blur-2xl pointer-events-none" />
        <div className="hidden md:block absolute -bottom-14 right-24 h-52 w-[28rem] rounded-full bg-[#c9d6ff]/50 blur-2xl pointer-events-none" />

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
            w-[280px] border-r border-[#d8dfec]
            bg-gradient-to-b from-[#f0f3fd] via-[#eef1fb] to-[#d5dffa]/45
            p-5 flex flex-col
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
                      ? 'bg-blue-100 text-blue-700 shadow-sm shadow-blue-200/50'
                      : 'text-slate-600 hover:bg-white/50 active:scale-[0.98]'
                    }
                  `}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-blue-500 transition-all duration-300" />
                  )}
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="text-sm leading-none font-medium truncate">{item.title}</span>
                </button>
              );
            })}
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
        <main className="relative z-10 flex-1 flex flex-col min-w-0">
          {/* ── Top Bar ── */}
          <header className="sticky top-0 z-30 bg-[#f5f7fc]/80 backdrop-blur-xl border-b border-[#e2e7f3]">
            <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3">
              {/* Left: hamburger + search */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden rounded-xl p-2.5 hover:bg-white/60 text-slate-600 transition-colors active:scale-95"
                >
                  <FiMenu className="w-5 h-5" />
                </button>

                <div className={`relative flex-1 max-w-xl transition-all duration-300 ${searchFocused ? 'scale-[1.01]' : ''}`}>
                  <input
                    type="text"
                    placeholder="Search..."
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`
                      w-full rounded-xl border bg-[#eff1f8] py-2.5 md:py-3 pl-10 pr-4
                      text-sm md:text-base leading-none text-slate-600
                      focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:bg-white
                      transition-all duration-300
                      ${searchFocused ? 'border-blue-300 shadow-lg shadow-blue-100' : 'border-[#dfe4ef]'}
                    `}
                  />
                  <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${searchFocused ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>
              </div>

              {/* Right: profile */}
              <div className="flex items-center gap-1.5 md:gap-3 text-slate-600 flex-shrink-0">
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 rounded-xl p-1.5 md:p-2 hover:bg-white/60 transition-all duration-200 active:scale-[0.97]"
                  >
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-200/50">
                      {clientInitial}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-slate-700">{clientName}</p>
                      <p className="text-[11px] text-slate-500 leading-tight">Client</p>
                    </div>
                    <FiChevronDown className={`hidden md:block h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`
                    absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white shadow-2xl shadow-slate-200/60 border border-slate-100 py-2 z-50
                    transition-all duration-200 origin-top-right
                    ${showProfileMenu ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                  `}>
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">{clientInitial}</div>
                        <div>
                          <p className="font-semibold text-slate-700 text-sm">{clientName}</p>
                          <p className="text-xs text-slate-500">{clientData?.email || 'client@company.com'}</p>
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
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                  <activeModule.icon className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700">{activeModule.short}</span>
                </div>
              )}
            </div>
          </header>

          {/* ── Content area ── */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6">
            <div className="max-w-[1600px] mx-auto">
              <div className="rounded-2xl border border-[#dbe1ea] bg-white/85 backdrop-blur-sm min-h-[420px] md:min-h-[520px] p-4 md:p-6 shadow-sm">
                <Suspense fallback={<TabLoader />}>
                  <PageTransition tabKey={activeTab}>
                    {renderTabContent()}
                  </PageTransition>
                </Suspense>
              </div>
            </div>
          </div>

          {/* ── Mobile Bottom Navigation ── */}
          <nav className="md:hidden sticky bottom-0 z-30 bg-white/90 backdrop-blur-xl border-t border-[#e2e7f3] px-2 py-1.5 safe-area-bottom">
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
                    <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-100 shadow-sm' : ''}`}>
                      <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>
                    <span className={`text-[10px] font-medium truncate max-w-[56px] transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {item.short}
                    </span>
                    {isActive && <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />}
                  </button>
                );
              })}
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

export default ClientModularDashboard;
