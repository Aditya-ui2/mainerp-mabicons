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
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import logo from '../../../assets/images/mabicons-logo.svg';
import { getClientDetails } from '../service/api';
import ClientOverviewTab from './Tabs/Client/ClientOverviewTab';

// Lazy load Client Tab Components
const ClientAttendanceTab = lazy(() => import('./Tabs/Client/ClientAttendanceTab'));
const ClientPayrollTab = lazy(() => import('./Tabs/Client/ClientPayrollTab'));
const ClientPolicyTab = lazy(() => import('./Tabs/Client/ClientPolicyTab'));
const ClientMasterDataTab = lazy(() => import('./Tabs/Client/ClientMasterDataTab'));
const ClientTaskTab = lazy(() => import('./Tabs/Client/ClientTaskTab'));
const ClientEngagementTab = lazy(() => import('./Tabs/Client/ClientEngagementTab'));
const ClientRecruitmentProgressTab = lazy(() => import('./Tabs/Client/ClientRecruitmentProgressTab'));

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
    items: [
      { id: 7, title: 'Recruitment Process', short: 'Recruitment', icon: FiTarget, service: 'recruitment' },
    ],
  },
  {
    heading: 'OPERATIONS',
    items: [
      { id: 1, title: 'Attendance Share / Review', short: 'Attendance', icon: FiClock, service: 'operations' },
      { id: 2, title: 'Payroll', short: 'Payroll', icon: FiDollarSign, service: 'operations' },
      { id: 5, title: 'Assign Task to KAM', short: 'Tasks', icon: FiClipboard, service: 'operations' },
    ],
  },
  {
    heading: 'DOCUMENTS',
    items: [
      { id: 3, title: 'Policy & Documents', short: 'Policies', icon: FiFileText, service: 'both' },
      { id: 4, title: 'Master Data', short: 'Master Data', icon: FiUsers, service: 'both' },
    ],
  },
  {
    heading: 'ENGAGEMENT',
    items: [
      { id: 6, title: 'Employee Engagement', short: 'Engagement', icon: FiHeart, service: 'both' },
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
  };

  const renderTabContent = () => {
    const tabProps = { isDarkMode, clientData };
    switch (activeTab) {
      case 'Dashboard Overview':        return <ClientOverviewTab {...tabProps} />;
      case 'Attendance Share / Review': return <ClientAttendanceTab {...tabProps} />;
      case 'Payroll':                   return <ClientPayrollTab {...tabProps} />;
      case 'Policy & Documents':        return <ClientPolicyTab {...tabProps} />;
      case 'Master Data':               return <ClientMasterDataTab {...tabProps} />;
      case 'Assign Task to KAM':        return <ClientTaskTab {...tabProps} />;
      case 'Employee Engagement':       return <ClientEngagementTab {...tabProps} />;
      case 'Recruitment Process':       return <ClientRecruitmentProgressTab {...tabProps} />;
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

      {/* ═══════ SIDEBAR ═══════ */}
      <motion.aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gradient-to-b from-[#0f1629] via-[#1a1f3c] to-[#1e2545] text-gray-300 flex flex-col transition-all duration-300
          shadow-2xl
        `}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={logo} alt="Mabicons" className="h-7 w-auto brightness-0 invert" />
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 group"
          >
            <FiMenu style={{ width: '20px', height: '20px' }} className="group-hover:text-blue-400 transition-colors" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Dashboard Button */}
        <div className="px-3 py-4">
          <button
            onClick={() => switchTab('Dashboard Overview')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${activeTab === 'Dashboard Overview'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-400 shadow-sm'
                : 'hover:bg-white/10 text-gray-400 hover:text-white'
              }
            `}
          >
            <FiGrid style={{ width: '20px', height: '20px', flexShrink: 0 }} className={activeTab === 'Dashboard Overview' ? 'text-blue-400' : ''} />
            {!sidebarCollapsed && <span className="text-sm font-semibold">Dashboard</span>}
          </button>
        </div>

        {/* Nav with Section Headings */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {sidebarConfig.map((section, sectionIdx) => {
            // Skip rendering the MAIN section (Dashboard is already rendered above)
            const items = section.items.filter(item => item.title !== 'Dashboard Overview');
            if (items.length === 0) return null;
            return (
              <div key={section.heading || sectionIdx} className="mb-4">
                {section.heading && !sidebarCollapsed && (
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-400/70">
                    {section.heading}
                  </div>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.title;
                  return (
                    <button
                      key={item.id}
                      onClick={() => switchTab(item.title)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1
                        transition-all duration-200 group
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                          : 'hover:bg-white/10 text-gray-400 hover:text-white'
                        }
                      `}
                    >
                      <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} className={`transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/20">
                {clientInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{clientName}</p>
                <p className="text-xs text-blue-400/80 truncate">Client</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-105"
                title="Logout"
              >
                <FiLogOut style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/20">
                {clientInitial}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200"
                title="Logout"
              >
                <FiLogOut style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ═══════ MAIN CONTENT AREA ═══════ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white flex items-center justify-between px-4 lg:px-6 shadow-sm">
          {/* Left: Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <FiMenu style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <FiBell style={{ width: '20px', height: '20px' }} />
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
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
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
