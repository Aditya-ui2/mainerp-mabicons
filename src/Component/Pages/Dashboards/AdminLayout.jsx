import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ChevronRight, 
  ChevronLeft, 
  LogOut, 
  Bell, 
  Menu, 
  Search,
  Settings,
  X,
  Grid,
  List,
  Target,
  User,
  HelpCircle
} from 'lucide-react';
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
 * @param {React.ReactNode} props.headerActions - Optional actions rendered in the right side of top header
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
  showGlobalHeader = true,
  headerActions = null,
  showSearch = true,
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
    <div className="flex h-screen bg-[#FDFDFD] dark:bg-gray-950 overflow-hidden font-['Plus_Jakarta_Sans']">
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

      {/* Sidebar - Consolidated Unified Component */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col h-full bg-white dark:bg-gray-900 border-r border-[#E8E7E2] dark:border-gray-800 transition-all duration-300 ease-in-out
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarCollapsed ? "w-[72px]" : "w-[240px]"}
        `}
        style={{ boxShadow: "2px 0 12px rgba(0,0,0,0.02)" }}
      >
        {/* Logo & Toggle */}
        <div className={`h-16 flex items-center flex-shrink-0 border-b border-[#F4F3EF] dark:border-gray-800 ${
          sidebarCollapsed ? "justify-center px-0" : "px-5 justify-between"
        }`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <img src={logo} alt="mabicons" className="h-8 w-auto object-contain" />
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-[#EEF2FB] transition-all duration-200 ${
              sidebarCollapsed ? "mx-auto" : ""
            }`}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-none flex flex-col gap-1">
          {/* Dashboard Item (Always First) */}
          <button
            onClick={() => { setActiveTab && setActiveTab('Dashboard'); setMobileSidebarOpen(false); }}
            title={sidebarCollapsed ? 'Dashboard' : undefined}
            className={`
              w-[calc(100%-16px)] flex items-center gap-3 px-3.5 py-3 mx-2 rounded-2xl transition-all duration-200 text-left relative group
              ${activeTab === 'Dashboard' ? "bg-[#1B4DA0] text-white shadow-lg shadow-blue-500/20" : "text-[#6B6B7E] hover:text-[#1A1A2E] hover:bg-[#F8FAFF]"}
            `}
          >
            <LayoutDashboard size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-semibold">Dashboard</span>}
            {activeTab === 'Dashboard' && sidebarCollapsed && (
              <div className="absolute left-[-8px] w-1.5 h-6 bg-[#1B4DA0] rounded-r-full" />
            )}
          </button>

          {/* Dynamic Sidebar Items */}
          {sidebarItems.map((section, sectionIdx) => (
            <div key={section.heading || sectionIdx} className="mt-2">
              {section.heading && !sidebarCollapsed && (
                <p className="px-6 pt-4 pb-2 text-[10px] font-bold tracking-[0.1em] text-[#9B9BAD] uppercase select-none opacity-50">
                  {section.heading}
                </p>
              )}
              {section.heading && sidebarCollapsed && (
                <div className="my-3 mx-4 h-[1px] bg-[#F4F3EF] dark:bg-gray-800" />
              )}
              
              <div className="flex flex-col gap-1 px-2">
                {section.items?.map((item) => {
                  const Icon = item.icon || Grid;
                  const isActive = activeTab === item.title;
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isSubExpanded = !!expandedMenus[item.id];
                  const isChildActive = hasSubmenu && item.submenu.some(sub => activeTab === sub.title);
                  const isHighlighted = isActive || (hasSubmenu && isChildActive);

                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          if (hasSubmenu) toggleMenu(item.id);
                          else { setActiveTab && setActiveTab(item.title); setMobileSidebarOpen(false); }
                        }}
                        title={sidebarCollapsed ? item.title : undefined}
                        className={`
                          w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 text-left relative
                          ${sidebarCollapsed ? 'justify-center' : 'justify-between'}
                          ${isHighlighted ? "bg-[#1B4DA0]/10 text-[#1B4DA0]" : "text-[#6B6B7E] hover:text-[#1A1A2E] hover:bg-[#F8FAFF]"}
                        `}
                      >
                        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                          <Icon size={20} className="flex-shrink-0" />
                          {!sidebarCollapsed && (
                            <span className={`text-sm font-semibold ${isHighlighted ? "font-bold" : ""}`}>
                              {item.title}
                            </span>
                          )}
                        </div>
                        {!sidebarCollapsed && hasSubmenu && (
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isSubExpanded ? "rotate-90" : ""}`} />
                        )}
                        {isHighlighted && sidebarCollapsed && (
                          <div className="absolute left-[-8px] w-1.5 h-6 bg-[#1B4DA0] rounded-r-full" />
                        )}
                      </button>

                      {/* Sub-items Animation */}
                      <AnimatePresence initial={false}>
                        {hasSubmenu && isSubExpanded && !sidebarCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-8 mt-1 border-l border-[#F4F3EF] flex flex-col gap-1 pl-2 mb-2"
                          >
                            {item.submenu.map((sub) => {
                              const isSubActive = activeTab === sub.title;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => { setActiveTab && setActiveTab(sub.title); setMobileSidebarOpen(false); }}
                                  className={`
                                    w-full text-left py-2 px-3 text-[13px] font-semibold transition-all duration-200 rounded-xl
                                    ${isSubActive ? "bg-[#1B4DA0]/5 text-[#1B4DA0]" : "text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-[#F8FAFF]"}
                                  `}
                                >
                                  {sub.title}
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

          {/* Bottom Settings Link */}
          <div className="mt-auto pt-4 border-t border-[#F4F3EF] dark:border-gray-800 mx-2 mb-2">
            <button
              onClick={() => { setActiveTab && setActiveTab('Settings'); setMobileSidebarOpen(false); }}
              title={sidebarCollapsed ? 'Settings' : undefined}
              className={`
                w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 text-left relative
                ${activeTab === 'Settings' ? "bg-[#1B4DA0]/10 text-[#1B4DA0]" : "text-[#6B6B7E] hover:text-[#1A1A2E] hover:bg-[#F8FAFF]"}
              `}
            >
              <Settings size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-semibold">Settings</span>}
            </button>
          </div>
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-[#F4F3EF] dark:border-gray-800">
          <div className={`flex items-center gap-2.5 p-2 rounded-2xl transition-all ${sidebarCollapsed ? 'justify-center border-0' : 'bg-[#FAFAFA] dark:bg-gray-800/50 border border-[#F4F3EF] dark:border-gray-700'}`}>
            <div className="h-9 w-9 rounded-xl bg-[#1B4DA0] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-blue-500/20">
              {userInfo.name?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1A1A2E] dark:text-gray-100 truncate">{userInfo.name}</p>
                <p className="text-[10px] text-[#9B9BAD] dark:text-gray-500 truncate font-bold uppercase tracking-wider">{userInfo.role}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button 
                onClick={handleLogout} 
                className="p-1.5 rounded-xl hover:bg-rose-50 text-[#9B9BAD] hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Hub */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Modern Top Header */}
        {showGlobalHeader && (
           <header className="h-16 bg-transparent sticky top-0 z-30 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-[#6B6B7E] hover:text-[#1A1A2E]"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-lg font-bold text-[#1A1A2E] dark:text-white tracking-tight">
                {activeTab || dashboardTitle}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {headerActions}
               {/* Search - Subtle */}
               {showSearch && (
                 <div className="hidden sm:flex items-center gap-2 bg-[#F4F3EF] dark:bg-gray-800 px-3 py-2 rounded-xl border border-transparent focus-within:border-[#1B4DA0]/20 transition-all">
                    <Search size={14} className="text-[#9B9BAD]" />
                    <input type="text" placeholder="Search..." className="bg-transparent border-0 outline-none text-xs text-[#1A1A2E] dark:text-white w-32 focus:w-48 transition-all placeholder-[#9B9BAD]" />
                 </div>
               )}

              {/* Notification Hub */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F8FAFF] dark:bg-gray-800 text-[#6B6B7E] hover:text-[#1B4DA0] transition-all relative"
                >
                  <Bell size={18} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#F4F3EF] dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-[#F4F3EF] dark:border-gray-700 bg-[#FAFAFA] dark:bg-gray-900/50 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#1A1A2E] dark:text-white uppercase tracking-widest">Notifications</h3>
                        <button className="text-[10px] font-bold text-[#1B4DA0] hover:underline">Mark all read</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F3EF] dark:divide-gray-700">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-[#9B9BAD]">
                            <Bell size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">No new alerts</p>
                          </div>
                        ) : (
                          notifications.map((n, idx) => (
                            <div
                              key={idx}
                              onClick={() => onNotificationClick?.(n)}
                              className={`p-4 hover:bg-[#F8FAFF] dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!n.read ? 'bg-[#EEF2FB]/30' : ''}`}
                            >
                              <p className="text-[13px] text-[#1A1A2E] dark:text-gray-100 font-semibold">{n.message}</p>
                              <p className="text-[10px] text-[#9B9BAD] mt-1 font-bold uppercase tracking-wider">{n.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 5 && (
                        <button className="w-full py-3 text-[10px] font-bold text-[#1B4DA0] hover:bg-[#F8FAFF] uppercase tracking-widest border-t border-[#F4F3EF]">View All</button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Page Surface */}
        <main ref={contentRef} className="flex-1 overflow-auto bg-[#FDFDFD] dark:bg-gray-950 p-4 lg:p-6 pb-20">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * StatCard - High Fidelity recruitment stat cards
 */
export const StatCard = ({ title, value, change, changeType = 'increase', icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: "bg-blue-50/50 text-[#1B4DA0]",
    emerald: "bg-emerald-50/50 text-emerald-600",
    rose: "bg-rose-50/50 text-rose-600",
    amber: "bg-amber-50/50 text-amber-600",
    violet: "bg-violet-50/50 text-violet-600",
    white: "bg-white text-[#1A1A2E] border border-[#F4F3EF] shadow-sm",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF] transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-2xl ${colors[color] || colors.blue} transition-all duration-300`}>
          {Icon && <Icon size={24} />}
        </div>
        {change && (
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${changeType === 'increase' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {changeType === 'increase' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <div className="mt-6 text-left">
        <p className="text-[#9B9BAD] text-[10px] font-black uppercase tracking-[2px]">{title}</p>
        <p className="text-3xl font-black text-[#1A1A2E] mt-2 tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
};

export const StatsBar = ({ stats }) => (
  <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
    <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#F4F3EF]">
      {stats.map((stat, idx) => (
        <div key={idx} className="p-8 text-center hover:bg-[#F8FAFF] transition-all cursor-default">
          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2">{stat.label}</p>
          <p className="text-2xl font-black text-[#1A1A2E]">{stat.value}</p>
          {stat.percentage && (
            <div className="mt-4 h-1.5 bg-[#F4F3EF] rounded-full overflow-hidden max-w-[80px] mx-auto">
              <div className={`h-full rounded-full ${stat.color || 'bg-[#1B4DA0]'}`} style={{ width: stat.percentage }} />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const DataTable = ({ columns, data, title, actions }) => (
  <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
    {title && (
      <div className="px-8 py-6 border-b border-[#F4F3EF] flex items-center justify-between bg-[#FAFAFA]/50">
        <h3 className="font-bold text-[#1A1A2E]">{title}</h3>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#FAFAFA]">
            {columns.map((col, idx) => (
              <th key={idx} className="px-8 py-4 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.1em]">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F4F3EF]">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-[#F8FAFF] transition-colors group">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-8 py-4.5 text-sm font-semibold text-[#6B6B7E] group-hover:text-[#1A1A2E]">
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

export default AdminLayout;
