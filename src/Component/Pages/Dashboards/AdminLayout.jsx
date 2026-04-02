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
  FiChevronsLeft,
  FiChevronsRight,
  FiLogOut,
  FiBell,
  FiUser,
  FiSearch,
  FiHelpCircle,
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
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white border-r border-slate-200 flex flex-col
          transition-transform duration-300
        `}
      >
        {/* Logo & Toggle - Inside Sidebar */}
        <div className={`flex items-center h-20 px-6 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between w-full h-10">
              <img src={logo} alt="Mabicons Logo" className="h-[44px] w-auto object-contain" />
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400"
              >
                <FiMenu className="w-5 h-5" />
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
            onClick={() => setActiveTab && setActiveTab('Dashboard')}
            title={sidebarCollapsed ? 'Dashboard' : undefined}
            className={`
              w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative
              ${activeTab === 'Dashboard'
                ? 'bg-[#3FA9F5]/10 text-[#3FA9F5] ring-1 ring-[#3FA9F5]/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }
            `}
          >
            {activeTab === 'Dashboard' && (
              <motion.div
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 bg-[#3FA9F5] rounded-r-full"
              />
            )}
            <div className="flex items-center gap-3 min-w-0">
              <FiGrid className={`w-5 h-5 flex-shrink-0 transition-colors ${activeTab === 'Dashboard' ? 'text-[#3FA9F5]' : 'text-slate-400 group-hover:text-slate-500'}`} />
              {!sidebarCollapsed && <span className={`text-sm font-semibold truncate ${activeTab === 'Dashboard' ? 'text-slate-800' : 'text-slate-600'}`}>Dashboard</span>}
            </div>
            {!sidebarCollapsed && activeTab === 'Dashboard' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3FA9F5]" />}
          </button>
        </div>

        {/* Scrollable Menu */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
          {sidebarItems.map((section, sectionIdx) => (
            <div key={section.heading || sectionIdx} className="mb-2">
              {/* Section Heading — plain label, always visible, never clickable */}
              {section.heading && !sidebarCollapsed && (
                <p className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase select-none">
                  {section.heading}
                </p>
              )}
              {section.heading && sidebarCollapsed && (
                <div className="my-2 mx-3 h-[1px] bg-slate-100" />
              )}

              {/* Section Items — always visible */}
              <div className="flex flex-col gap-0.5">
                {section.items?.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.title;
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isSubExpanded = !!expandedMenus[item.id];
                  const isChildActive = hasSubmenu && item.submenu.some(sub => activeTab === sub.title);
                  const isHighlighted = isActive || (hasSubmenu && isChildActive);

                  return (
                    <div key={item.id} className="px-2">
                      <button
                        onClick={() => {
                          if (hasSubmenu) {
                            toggleMenu(item.id);
                          } else {
                            setActiveTab && setActiveTab(item.title);
                            setMobileSidebarOpen(false);
                          }
                        }}
                        title={sidebarCollapsed ? item.title : undefined}
                        className={`
                          w-full flex items-center justify-between px-4 py-2.5 rounded-xl
                          transition-all duration-300 group mb-1
                          ${isSubExpanded && !sidebarCollapsed
                            ? 'bg-[#3FA9F5] text-white shadow-md shadow-blue-100'
                            : isHighlighted
                              ? 'bg-[#3FA9F5]/10 text-[#3FA9F5]'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-[20px] h-[20px] flex-shrink-0 transition-colors duration-300 stroke-[1.8]
                              ${isSubExpanded && !sidebarCollapsed ? 'text-white' : isHighlighted ? 'text-[#3FA9F5]' : 'text-slate-400 group-hover:text-slate-600'}
                            `}
                          />
                          {!sidebarCollapsed && (
                            <span className={`text-[13.5px] font-medium truncate transition-colors duration-300 font-['Inter']
                              ${isSubExpanded && !sidebarCollapsed ? 'text-white' : isHighlighted ? 'text-slate-800' : 'text-slate-600'}
                            `}>
                              {item.title}
                            </span>
                          )}
                        </div>
                        {!sidebarCollapsed && hasSubmenu && (
                          <motion.div
                            animate={{ rotate: isSubExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiChevronRight className={`w-3.5 h-3.5 flex-shrink-0 stroke-[2.5] ${isSubExpanded ? 'text-white' : 'text-slate-400'}`} />
                          </motion.div>
                        )}
                      </button>

                      {/* Sub-items with Connectors */}
                      <AnimatePresence initial={false}>
                        {hasSubmenu && isSubExpanded && !sidebarCollapsed && (
                          <motion.div
                            key="submenu"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="relative ml-[34px] pl-4 border-l border-slate-100 flex flex-col gap-0.5 my-1"
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
                                  className="relative w-full text-left py-2.5 px-3 group"
                                >
                                  {/* Connector Line */}
                                  <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-slate-100" />
                                  <span className={`
                                    text-[13px] font-semibold transition-all duration-200 font-['Inter']
                                    ${isSubActive
                                      ? 'text-[#3FA9F5] translate-x-1'
                                      : 'text-slate-400 hover:text-slate-800 hover:translate-x-1'
                                    }
                                  `}>
                                    {subItem.title}
                                  </span>
                                  {isSubActive && (
                                    <motion.div
                                      layoutId={`sub-dot-${item.id}`}
                                      className="absolute -left-[18.2px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#3FA9F5] z-10"
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* OTHERS SECTION */}
        <div className="px-3 mb-2 border-t border-slate-50 pt-4">
          {!sidebarCollapsed && (
            <p className="px-3 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase select-none font-['Inter']">
              OTHERS
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            <button
               onClick={() => setActiveTab && setActiveTab('Settings')}
               className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 group
                  ${activeTab === 'Settings' ? 'bg-[#3FA9F5]/10 text-[#3FA9F5]' : 'text-slate-500 hover:bg-slate-50'}
               `}
            >
               <FiSettings className={`w-5 h-5 flex-shrink-0 ${activeTab === 'Settings' ? 'text-[#3FA9F5]' : 'text-slate-400 group-hover:text-slate-600'}`} />
               {!sidebarCollapsed && <span className="ml-3 text-[13.5px] font-medium font-['Inter']">Settings</span>}
            </button>
          </div>
        </div>

        {/* User Profile Footer (Enhanced Emma Style) */}
        <div className="p-4 mt-auto border-t border-slate-100">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-bold text-blue-600">
                  {userInfo.name?.charAt(0) || 'A'}
                </div>
                <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-800 truncate font-['Inter']">{userInfo.name}</span>
                  <div className="h-3 w-3 bg-sky-400 rounded-full flex items-center justify-center">
                    <span className="text-[6px] text-white italic font-bold leading-none">✓</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 truncate leading-none font-['Inter']">{userInfo.role || 'Administrator'}</span>
              </div>
              <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all" />

              {/* Secret logout tool visible only on hover or click */}
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
                  {userInfo.name?.charAt(0) || 'A'}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white flex items-center justify-between px-6 shadow-sm border-b border-slate-100 sticky top-0 z-40">
          {/* Left: Desktop/Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h2 className="text-[18px] font-semibold text-slate-800 tracking-tight leading-tight font-['Outfit']">{activeTab || dashboardTitle}</h2>
            </div>
          </div>

          {/* Right: Actions - Decluttered */}
          <div className="flex items-center gap-3">
             {/* Only Notification Bell remains for minimalism */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-[#3FA9F5] transition-all"
              >
                <FiBell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-pink-500 border border-white rounded-full"></span>
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
          <div className={`p-2 rounded-lg ${isHighlighted
            ? 'bg-[#3FA9F5]'
            : 'bg-gray-100 group-hover:bg-gray-200'
            }`}>
            <Icon className={`${isHighlighted ? 'text-white' : 'text-gray-500'
              }`} />
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
