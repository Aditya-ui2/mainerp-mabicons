import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiSearch,
  FiBell,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
  FiGrid,
  FiList,
} from 'react-icons/fi';
import logo from '../../../assets/images/mabicons-logo.svg';

/**
 * AdminLayout - GroceryMart Style Dashboard Layout
 * 
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

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
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
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gradient-to-b from-[#0f1629] via-[#1a1f3c] to-[#1e2545] text-gray-300 flex flex-col transition-all duration-300
          shadow-2xl
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            {sidebarCollapsed ? (
              <img src={logo} alt="Mabicons" className="h-8 w-auto brightness-0 invert" />
            ) : (
              <img src={logo} alt="Mabicons" className="h-7 w-auto brightness-0 invert" />
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 group"
          >
            <FiMenu className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Link */}
        <div className="px-3 py-4">
          <button
            onClick={() => setActiveTab && setActiveTab('Dashboard')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${activeTab === 'Dashboard' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 text-gray-300 hover:text-white'
              }
            `}
          >
            <FiHome className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
          </button>
        </div>

        {/* Scrollable Menu */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {sidebarItems.map((section, sectionIdx) => (
            <div key={section.heading || sectionIdx} className="mb-4">
              {/* Section Heading */}
              {section.heading && !sidebarCollapsed && (
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-400/70">
                  {section.heading}
                </div>
              )}

              {/* Menu Items */}
              {section.items?.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.title;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isExpanded = expandedMenus[item.id];

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
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1
                        transition-all duration-200 group
                        ${isActive && !hasSubmenu
                          ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                          : 'hover:bg-white/10 text-gray-400 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
                        {!sidebarCollapsed && (
                          <span className="text-sm font-medium">{item.title}</span>
                        )}
                      </div>
                      {hasSubmenu && !sidebarCollapsed && (
                        <FiChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    {/* Submenu */}
                    {hasSubmenu && isExpanded && !sidebarCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-4 pl-4 border-l border-blue-500/30"
                      >
                        {item.submenu.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setActiveTab && setActiveTab(subItem.title);
                              setMobileSidebarOpen(false);
                            }}
                            className={`
                              w-full text-left px-3 py-2 text-sm rounded-lg mb-0.5
                              transition-all duration-200
                              ${activeTab === subItem.title
                                ? 'text-blue-400 bg-blue-600/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                              }
                            `}
                          >
                            {subItem.title}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/20">
                {userInfo.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userInfo.name}</p>
                <p className="text-xs text-blue-400/80 truncate">{userInfo.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-105"
                title="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/20">
                {userInfo.name?.charAt(0) || 'A'}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200"
                title="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shadow-sm">
          {/* Left: Mobile Menu + Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  {idx > 0 && <FiChevronRight className="w-4 h-4 text-gray-400" />}
                  <span
                    className={`${idx === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700 cursor-pointer'}`}
                    onClick={() => crumb.path && navigate(crumb.path)}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          {/* Right: Search + Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <FiSearch className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 bg-transparent border-none outline-none text-sm w-40 lg:w-56"
              />
            </div>

            {/* View Toggle */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button className="p-1.5 rounded bg-white shadow-sm">
                <FiGrid className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1.5 rounded hover:bg-gray-200">
                <FiList className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <FiBell className="w-5 h-5" />
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
                          <FiBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
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
                        <FiUser className="w-4 h-4" />
                        My Profile
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <FiSettings className="w-4 h-4" />
                        Settings
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <FiLogOut className="w-4 h-4" />
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
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', accent: 'bg-blue-500', text: 'text-blue-600' },
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-600', accent: 'bg-teal-500', text: 'text-teal-600' },
    yellow: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', accent: 'bg-amber-500', text: 'text-amber-600' },
    pink: { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', accent: 'bg-rose-500', text: 'text-rose-600' },
    purple: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', accent: 'bg-violet-500', text: 'text-violet-600' },
    green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', accent: 'bg-emerald-500', text: 'text-emerald-600' },
  };

  const colors = colorConfig[color] || colorConfig.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {change && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                changeType === 'increase' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {changeType === 'increase' ? '+' : ''}{change}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colors.icon}`}>
            <Icon className="w-5 h-5" />
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
