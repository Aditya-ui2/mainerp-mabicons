import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiMenu,
  FiX,
  FiGrid,
  FiList,
  FiTarget,
  FiChevronRight,
  FiChevronDown,
  FiLogOut,
  FiBell,
  FiUser,
} from 'react-icons/fi';
import logo from '../../../assets/images/mabicons logo blue.png';

/**
 * AdminLayout - GroceryMart Style Dashboard Layout
 * @param {Object} props
 * @param {React.ReactNode} props.children - Main content
 * @param {Array} props.sidebarItems - Sidebar menu configuration
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.setActiveTab - Function to change active tab
 * @param {string} props.dashboardTitle - Dashboard title displayed in header
 * @param {Array} props.breadcrumbs - Breadcrumb items [{label, path}]
 * @param {Object} props.userInfo - User information {name, role, avatar}
 */
const AdminLayout = ({
  children,
  sidebarItems = [],
  activeTab = 'Dashboard',
  setActiveTab,
  dashboardTitle = 'Dashboard',
  breadcrumbs = [{ label: 'Home', path: '/' }],
  userInfo = { name: 'Admin', role: 'Administrator' },
  notifications = [],
  onNotificationClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const contentRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const toggleSection = (heading) => {
    setExpandedSections(prev => ({
      ...prev,
      [heading]: !prev[heading]
    }));
  };

  // Initialize expandedSections to false (closed) for all on mount
  useEffect(() => {
    const initialSections = {};
    sidebarItems.forEach(section => {
      if (section.heading) initialSections[section.heading] = false;
    });
    setExpandedSections(initialSections);
  }, [sidebarItems]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('department');
    localStorage.removeItem('recruitmentTabAuth');
    window.location.href = '/login';
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

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

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${sidebarCollapsed ? 'w-20' : 'w-[260px]'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white border-r border-slate-200 flex flex-col transition-all duration-300
          shadow-sm
        `}
      >
        {/* Logo Section (VANTUS Style) */}
        <div className={`flex items-center h-20 px-6 ${sidebarCollapsed ? 'justify-center overflow-hidden' : 'justify-between'}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-start w-full h-10">
              <img
                src={logo}
                alt="Mabicons Logo"
                className="h-full w-auto max-w-[160px] object-contain transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="group flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              title="Expand sidebar"
            >
              <FiMenu className="w-5 h-5 text-[#3FA9F5] group-hover:scale-110 transition-transform" />
            </button>
          )}

          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 hover:bg-slate-50 border border-transparent hover:border-slate-100 shadow-sm sm:shadow-none"
              title="Collapse sidebar"
            >
              <FiMenu className="w-5 h-5 text-[#3FA9F5] group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        <div className="h-[1px] bg-slate-100 mx-6 mb-4" />

        {/* Dashboard Link */}
        <div className="px-4 py-2">
          <button
            onClick={() => setActiveTab && setActiveTab('Dashboard')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${activeTab === 'Dashboard'
                ? 'bg-slate-100/80 text-[#3FA9F5] shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
              }
            `}
          >
            <FiGrid style={{ width: '20px', height: '20px', flexShrink: 0 }} className={activeTab === 'Dashboard' ? 'text-[#3FA9F5]' : ''} />
            {!sidebarCollapsed && <span style={{ fontFamily: 'Calibri, sans-serif' }} className={`text-sm font-semibold ${activeTab === 'Dashboard' ? 'text-slate-800' : ''}`}>Dashboard</span>}
          </button>
        </div>

        {/* Scrollable Menu */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
          {sidebarItems.map((section, sectionIdx) => {
            const isExpanded = !!expandedSections[section.heading];

            return (
              <div key={section.heading || sectionIdx} className="mb-4">
                {/* Section Heading Dropdown */}
                {section.heading && !sidebarCollapsed && (
                  <button
                    onClick={() => toggleSection(section.heading)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors group mb-1"
                  >
                    <span style={{ fontFamily: 'Calibri, sans-serif' }}>{section.heading}</span>
                    <FiChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}

                {/* Collapsible Section Items */}
                <AnimatePresence initial={false}>
                  {(isExpanded || sidebarCollapsed) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      {section.items?.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.title;
                        const hasSubmenu = item.submenu && item.submenu.length > 0;
                        const isChildActive = hasSubmenu && item.submenu.some(sub => activeTab === sub.title);
                        const isParentHighlighted = (isActive && !hasSubmenu) || (hasSubmenu && (isSubExpanded || isChildActive));

                        return (
                          <div key={item.id}>
                            <button
                              onClick={() => {
                                if (hasSubmenu) {
                                  toggleMenu(item.id);
                                } else {
                                  setActiveTab && setActiveTab(item.title);
                                  setMobileSidebarOpen(false);
                                }
                              }}
                              className={`
                                w-full flex items-center justify-between px-3 py-2 rounded-full mb-1
                                transition-all duration-300 group
                                ${isParentHighlighted
                                  ? 'bg-[#3FA9F5] text-white shadow-md'
                                  : 'text-slate-500 hover:bg-slate-50'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <Icon
                                  style={{ width: '20px', height: '20px', flexShrink: 0 }}
                                  className={`transition-colors duration-300 ${isParentHighlighted ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                                />
                                {!sidebarCollapsed && (
                                  <span
                                    style={{ fontFamily: 'Calibri, sans-serif' }}
                                    className={`text-sm font-semibold transition-colors duration-300 ${isParentHighlighted ? 'text-white' : 'text-slate-600'}`}
                                  >
                                    {item.title}
                                  </span>
                                )}
                              </div>
                              {!sidebarCollapsed && (
                                hasSubmenu ? (
                                  <FiChevronDown
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      transition: 'all 0.3s',
                                      transform: isSubExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                      color: isParentHighlighted ? '#fff' : '#cbd5e1'
                                    }}
                                  />
                                ) : !isParentHighlighted && (
                                  <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                                )
                              )}
                            </button>

                            {/* Submenu */}
                            {hasSubmenu && isSubExpanded && !sidebarCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-[22px] pl-4 border-l border-slate-200 flex flex-col my-1"
                              >
                                {item.submenu.map((subItem) => {
                                  const isSubActive = activeTab === subItem.title;
                                  return (
                                    <button
                                      key={subItem.id}
                                      onClick={() => {
                                        setActiveTab && setActiveTab(subItem.title);
                                        setMobileSidebarOpen(false);
                                      }}
                                      className={`
                                        relative w-full text-left px-3 py-2 text-sm
                                        transition-all duration-200
                                        ${isSubActive
                                          ? 'text-[#3FA9F5] font-bold'
                                          : 'text-slate-500 hover:text-slate-900'
                                        }
                                      `}
                                    >
                                      {/* Horizontal branch line */}
                                      <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-3.5 h-[1px] bg-slate-200" />
                                      
                                      <span style={{ fontFamily: 'Calibri, sans-serif' }}>
                                        {subItem.title}
                                      </span>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User Profile Footer (Emma Style) */}
        <div className="p-4 mt-auto border-t border-slate-100">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-bold text-orange-600">
                  {userInfo.name?.charAt(0) || 'A'}
                </div>
                <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span style={{ fontFamily: 'Calibri, sans-serif' }} className="text-sm font-bold text-slate-800 truncate">{userInfo.name}</span>
                  <div className="h-3 w-3 bg-sky-400 rounded-full flex items-center justify-center">
                    <span className="text-[6px] text-white italic font-bold leading-none">✓</span>
                  </div>
                </div>
                <span style={{ fontFamily: 'Calibri, sans-serif' }} className="text-[10px] text-slate-400 truncate leading-none">{userInfo.role || 'Administrator'}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-200">
                  {userInfo.name?.charAt(0) || 'A'}
                </div>
                <div className="absolute -right-1 -bottom-1 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white flex items-center justify-between px-4 lg:px-6 shadow-sm border-b border-slate-200 relative z-10">
          {/* Left: Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-white text-[#1E88E5] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 border border-slate-200"
              aria-label="Open menu"
            >
              <FiMenu style={{ width: '22px', height: '22px' }} className="stroke-[2]" />
            </button>
            <img src={logo} alt="Mabicons" className="lg:hidden h-7 w-auto object-contain" />
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
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
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
                      <span className="text-xs text-blue-600 cursor-pointer hover:underline">
                        Mark all as read
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <FiBell style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.5 }} />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification, idx) => (
                          <div
                            key={idx}
                            onClick={() => onNotificationClick && onNotificationClick(notification)}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                          >
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 5 && (
                      <div className="p-3 text-center border-t border-gray-100">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {userInfo.name?.charAt(0) || 'A'}
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
                      <p className="font-medium text-gray-900">{userInfo.name}</p>
                      <p className="text-sm text-gray-500">{userInfo.role}</p>
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
        <main ref={contentRef} className="flex-1 overflow-auto bg-gray-100 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * StatCard - Clean professional stat card component
 */
export const StatCard = ({
  title,
  value,
  change,
  changeType = 'increase', // 'increase' | 'decrease'
  icon: Icon,
  color = 'blue', // 'blue' | 'teal' | 'yellow' | 'pink' | 'purple' | 'green'
  sparklineData,
}) => {
  const colorConfig = {
    blue: { accent: 'bg-blue-500', iconStyle: { background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', boxShadow: '0 8px 18px rgba(37, 99, 235, 0.28)' } },
    teal: { accent: 'bg-cyan-500', iconStyle: { background: 'linear-gradient(135deg, #0f766e, #0369a1)', boxShadow: '0 8px 18px rgba(8, 145, 178, 0.28)' } },
    yellow: { accent: 'bg-amber-500', iconStyle: { background: 'linear-gradient(135deg, #b45309, #c2410c)', boxShadow: '0 8px 18px rgba(180, 83, 9, 0.28)' } },
    pink: { accent: 'bg-rose-500', iconStyle: { background: 'linear-gradient(135deg, #be123c, #be185d)', boxShadow: '0 8px 18px rgba(190, 24, 93, 0.26)' } },
    purple: { accent: 'bg-violet-500', iconStyle: { background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 8px 18px rgba(109, 40, 217, 0.28)' } },
    green: { accent: 'bg-emerald-500', iconStyle: { background: 'linear-gradient(135deg, #047857, #059669)', boxShadow: '0 8px 18px rgba(5, 150, 105, 0.28)' } },
  };

  const colors = colorConfig[color] || colorConfig.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {change && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${changeType === 'increase'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
                }`}>
                {changeType === 'increase' ? '+' : ''}{change}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={colors.iconStyle}>
            <Icon className="h-5 w-5" style={{ color: '#ffffff', stroke: '#ffffff', strokeWidth: 2.4, opacity: 1 }} />
          </div>
        )}
      </div>

      {/* Mini Sparkline */}
      {sparklineData && (
        <div className="mt-4 h-10 flex items-end gap-0.5">
          {sparklineData.map((val, idx) => (
            <div
              key={idx}
              className={`flex-1 ${colors.accent} rounded-t opacity-70 hover:opacity-100 transition-opacity`}
              style={{ height: `${(val / Math.max(...sparklineData)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

/**
 * TrafficChart - Area chart component for traffic visualization
 */
export const TrafficChart = ({ data, title = 'Traffic', subtitle }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Day</button>
          <button className="px-3 py-1.5 text-sm bg-white rounded-md shadow-sm text-gray-900 font-medium">Month</button>
          <button className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Year</button>
        </div>
      </div>

      {/* Chart Placeholder - Replace with actual chart */}
      <div className="h-64 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white rounded-lg border border-gray-100">
        <p className="text-gray-400">Chart Component Here</p>
      </div>
    </div>
  );
};

/**
 * StatsBar - Bottom stats bar component
 */
export const StatsBar = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
            {stat.percentage && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${stat.color || 'bg-blue-500'}`}
                  style={{ width: stat.percentage }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * DataTable - Clean data table component
 */
export const DataTable = ({ columns, data, title, actions }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {title && (
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-3 text-sm text-gray-700">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLayout;
