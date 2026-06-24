import { useState, useRef, useEffect, useMemo } from 'react';
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
import Loader from '../../Common/Loader';
import { markNotificationRead, getMyProfile, getAllNotifications } from '../service/api';
import { jwtDecode } from 'jwt-decode';

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
  showGlobalHeader = false,
  headerActions = null,
  showSearch = true,
  isLoading = false,
  bottomTabName = 'Settings',
  dashboardTabName = 'Dashboard',
  showNotifications = true,
  showBottomTab = true,
  hideDailyLogout = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabUpdates, setTabUpdates] = useState({});
  const [localNotifications, setLocalNotifications] = useState([]);

  const [localUserInfo, setLocalUserInfo] = useState(userInfo);

  useEffect(() => {
    setLocalUserInfo(userInfo);
  }, [userInfo]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const localPicture = localStorage.getItem('userPicture');
      const localName = localStorage.getItem('userName');
      const localRole = localStorage.getItem('userType') || localStorage.getItem('userRole');
      
      setLocalUserInfo(prev => ({
        ...prev,
        name: localName || prev.name,
        avatar: localPicture || prev.avatar,
        role: localRole || prev.role
      }));
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);
    handleProfileUpdate();

    return () => window.removeEventListener('profileUpdate', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const fetchLocalNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          let decoded = {};
          try {
            decoded = jwtDecode(token);
          } catch (e) {
            try {
              decoded = JSON.parse(atob(token.split('.')[1]));
            } catch (err) {}
          }
          const userId = decoded.id || decoded.userId || decoded._id;
          if (userId) {
            const res = await getAllNotifications(userId);
            setLocalNotifications(res?.data || []);
          }
        }
      } catch (e) {
        console.error("AdminLayout fetch notifications failed:", e);
      }
    };

    fetchLocalNotifications();
    const interval = setInterval(fetchLocalNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const mergeNotifications = (arr1, arr2) => {
    const map = new Map();
    // Process localNotifications (arr2) first, then override with parent notifications (arr1)
    // so that instant read state updates from parent overwrite stale local polling data
    [...(arr2 || []), ...(arr1 || [])].forEach(n => {
      const key = n._id || n.id || n.message;
      if (key) {
        // If it's already in the map and marked as read, preserve the read state!
        const existing = map.get(key);
        if (existing && (existing.read || existing.isRead)) {
          map.set(key, { ...n, read: true, isRead: true });
        } else {
          map.set(key, n);
        }
      }
    });
    const merged = Array.from(map.values());
    return merged;
  };

  const activeNotifications = useMemo(() => {
    return mergeNotifications(notifications, localNotifications);
  }, [notifications, localNotifications]);

  const getDisplayTitle = () => {
    if (!activeTab) return dashboardTitle;
    if (activeTab === dashboardTabName) return dashboardTabName;
    if (activeTab === bottomTabName) return bottomTabName;
    for (const section of sidebarItems) {
      if (section.items) {
        for (const item of section.items) {
          if (item.id === activeTab || item.title === activeTab) {
            return item.title;
          }
          if (item.submenu) {
            for (const sub of item.submenu) {
              if (sub.id === activeTab || sub.title === activeTab) {
                return sub.title;
              }
            }
          }
        }
      }
    }
    return activeTab;
  };

  const getNotificationTabs = (msg, type) => {
    const tabs = [];
    if (!msg) return tabs;
    const str = msg.toLowerCase();

    if (str.includes('employee') || str.includes('staff') || str.includes('team') || str.includes('member')) tabs.push('All Employees', 'My Team');
    if (str.includes('client') || str.includes('company') || str.includes('customer')) tabs.push('All Clients', 'Client Pipeline', 'Client Onboarding', 'Clients');
    if (str.includes('pipeline') || str.includes('lead') || str.includes('deal') || str.includes('crm')) tabs.push('Client Pipeline', 'CRM Management');
    if (str.includes('meeting') || str.includes('demo') || str.includes('discussion') || str.includes('call')) tabs.push('Client Meeting');
    if (str.includes('onboard') || str.includes('onboarding') || str.includes('onboarded')) tabs.push('Client Onboarding');
    if (str.includes('position') || str.includes('job') || str.includes('vacancy') || str.includes('opening')) tabs.push('Total Open Positions', 'Job Openings', 'Recruitment');
    if (str.includes('shortlist') || str.includes('candidate') || str.includes('applied') || str.includes('cv') || str.includes('resume')) tabs.push('Shortlisted Candidates', 'Candidate Pipeline', 'Resume Bank', 'Candidates', 'Recruitment');
    if (str.includes('interview') || str.includes('schedule') || str.includes('scheduled') || str.includes('round')) tabs.push('Interviews', 'Interview Schedule');
    if (str.includes('joined') || str.includes('hired') || str.includes('placed') || str.includes('joining')) tabs.push('Joined Candidates', 'Onboarding');
    if (type === 'task' || type === 'comment' || str.includes('task') || str.includes('allocation') || str.includes('assign') || str.includes('project')) tabs.push('Resource Allocation', 'Task Assignment', 'My Tasks', 'Tasks');
    if (str.includes('performance') || str.includes('target') || str.includes('kpi') || str.includes('metric')) tabs.push('Team Performance', 'Performance Tracking', 'Performance');
    if (str.includes('ticket') || str.includes('support') || str.includes('complaint') || str.includes('laptop') || str.includes('issue')) tabs.push('Help & Support', 'Internal', 'External');
    if (str.includes('announcement') || str.includes('broadcast') || str.includes('notice') || str.includes('update') || str.includes('announc')) tabs.push('Announcements');
    if (str.includes('bill') || str.includes('invoice') || str.includes('payment') || str.includes('outstanding') || str.includes('fee') || str.includes('subscription') || str.includes('revenue') || str.includes('account')) tabs.push('Billing & Invoices');
    if (str.includes('expense') || str.includes('vendor') || str.includes('purchase') || str.includes('procurement') || str.includes('supplier')) tabs.push('Expense & Vendors');
    if (str.includes('policy') || str.includes('directive') || str.includes('rules')) tabs.push('HR Policy');
    if (str.includes('note')) tabs.push('Notes');
    if (str.includes('document') || str.includes('verification') || str.includes('verify') || str.includes('aadhaar') || str.includes('pan') || str.includes('shield')) tabs.push('Document Verification');
    if (str.includes('activity') || str.includes('feed') || str.includes('log') || str.includes('recent') || str.includes('history')) tabs.push('Activity Feed');
    if (str.includes('report') || str.includes('mis') || str.includes('chart') || str.includes('stats') || str.includes('analysis')) tabs.push('Reports', 'Team MIS Reports', 'Team MIS Report');

    return tabs;
  };

  useEffect(() => {
    if (activeNotifications) {
      const updates = {};
      activeNotifications.forEach(n => {
        if (n.status !== 'read' && !n.isRead && !n.read) {
          const tabs = getNotificationTabs(n.message || n.text, n.type);
          tabs.forEach(t => {
            updates[t] = true;
          });
        }
      });
      setTabUpdates(prev => {
        const changed = Object.keys(updates).some(key => prev[key] !== true);
        if (changed) {
          return { ...prev, ...updates };
        }
        return prev;
      });
    }
  }, [activeNotifications]);

  useEffect(() => {
    getMyProfile()
      .then(res => {
        if (res && res.success && res.member) {
          const pic = res.member.picture || res.member.avatar || '';
          localStorage.setItem('userPicture', pic);
          if (res.member.name) {
            localStorage.setItem('userName', res.member.name);
          }
          window.dispatchEvent(new Event('profileUpdate'));
        }
      })
      .catch(err => console.error('Failed to sync profile in layout:', err));
  }, []);

  useEffect(() => {
    if (activeTab) {
      const visitedTabs = [activeTab];
      if (activeTab === 'Internal' || activeTab === 'External' || activeTab === 'Help & Support') visitedTabs.push('Help & Support', 'Internal', 'External');
      if (['Total Open Positions', 'Job Openings'].includes(activeTab)) visitedTabs.push('Total Open Positions', 'Job Openings');
      if (['Shortlisted Candidates', 'Candidate Pipeline', 'Resume Bank'].includes(activeTab)) visitedTabs.push('Shortlisted Candidates', 'Candidate Pipeline', 'Resume Bank');
      if (['Interviews', 'Interview Schedule'].includes(activeTab)) visitedTabs.push('Interviews', 'Interview Schedule');
      if (['All Employees', 'My Team'].includes(activeTab)) visitedTabs.push('All Employees', 'My Team');
      if (['Team Performance', 'Performance Tracking'].includes(activeTab)) visitedTabs.push('Team Performance', 'Performance Tracking');
      if (['Task Assignment', 'Resource Allocation', 'My Tasks'].includes(activeTab)) visitedTabs.push('Task Assignment', 'Resource Allocation', 'My Tasks');
      if (['Reports', 'Team MIS Reports', 'Team MIS Report'].includes(activeTab)) visitedTabs.push('Reports', 'Team MIS Reports', 'Team MIS Report');
      if (['All Clients', 'Clients'].includes(activeTab)) visitedTabs.push('All Clients', 'Clients');
      if (['Total Open Positions', 'Job Openings', 'Shortlisted Candidates', 'Candidate Pipeline', 'Resume Bank', 'Interviews', 'Interview Schedule', 'Joined Candidates'].includes(activeTab)) visitedTabs.push('Recruitment Management');
      if (['Performance Tracking', 'Team Performance', 'Resource Allocation', 'Task Assignment', 'My Tasks'].includes(activeTab)) visitedTabs.push('Operations Management');
      if (['Client Meeting', 'Client Pipeline', 'Client Onboarding', 'Clients'].includes(activeTab)) visitedTabs.push('CRM Management');

      // Clear dots locally
      const localUpdates = {};
      visitedTabs.forEach(t => {
        localUpdates[t] = false;
      });
      setTabUpdates(prev => {
        const changed = Object.keys(localUpdates).some(key => prev[key] !== false);
        if (changed) {
          return { ...prev, ...localUpdates };
        }
        return prev;
      });

      // Automatically mark related notifications as read in backend
      if (activeNotifications && activeNotifications.length > 0) {
        activeNotifications.forEach(n => {
          if (!n.read && !n.isRead) {
            const mappedTabs = getNotificationTabs(n.message || n.text, n.type);
            if (mappedTabs.some(t => visitedTabs.includes(t))) {
              try {
                markNotificationRead(n._id || n.id).catch(err => console.error("Auto-mark read failed:", err));
                n.read = true;
                n.isRead = true;
              } catch (e) { }
            }
          }
        });
      }
    }
  }, [activeTab, activeNotifications]);

  // Auto-expand sidebar folder when a sub-item becomes active (e.g. via quick action click)
  useEffect(() => {
    if (activeTab && sidebarItems) {
      sidebarItems.forEach(section => {
        if (section.items) {
          section.items.forEach(item => {
            if (item.submenu) {
              const hasActiveSub = item.submenu.some(
                sub => sub.id === activeTab || sub.title === activeTab
              );
              if (hasActiveSub) {
                setExpandedMenus(prev => {
                  if (!prev[item.id]) {
                    return { ...prev, [item.id]: true };
                  }
                  return prev;
                });
              }
            }
          });
        }
      });
    }
  }, [activeTab, sidebarItems]);



  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const megaMenuRef = useRef(null);
  const contentRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setMegaMenuOpen(false);
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

    // Clear all dashboard active tabs so the next login starts at 'Dashboard'
    const tabKeys = [
      'admin_active_tab',
      'crm_active_tab',
      'hroperations_active_tab',
      'rh_active_tab',
      'superadmin_active_tab'
    ];
    tabKeys.forEach(key => localStorage.removeItem(key));

    window.location.href = '/login';
  };

  const unreadNotifications = activeNotifications.filter(n => n.status !== 'read' && !n.isRead && !n.read).length;
  const hasAnyUnread = unreadNotifications > 0;

  return (
    <div className="flex h-screen bg-[#FDFDFD] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[999] lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Modern Sidebar Container */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-[1000]
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-16' : 'w-56'}
          bg-white dark:bg-gray-900 border-r border-[#F4F3EF] dark:border-gray-800
          flex flex-col transition-all duration-300 ease-in-out
        `}
      >
        {/* Superior Logo Header */}
        <div className={`h-20 flex items-center ${sidebarCollapsed ? 'px-2 justify-center' : 'px-4 justify-between gap-4'}`}>
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3">
                <img src={logo} alt="Mabicons" className="h-10 w-auto object-contain" />
              </div>
              <button
                onClick={() => {
                  setSidebarCollapsed(!sidebarCollapsed);
                  if (mobileSidebarOpen) setMobileSidebarOpen(false);
                }}
                className="p-2 text-[#6B6B7E] hover:text-[#1A1A2E] hover:bg-[#F8FAFF] rounded-xl transition-all relative"
                title="Collapse Sidebar"
              >
                <Menu size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-[#6B6B7E] hover:text-[#1A1A2E] hover:bg-[#F8FAFF] rounded-xl transition-all relative"
              title="Expand Sidebar"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Sidebar Nav Hub */}
        <nav className="flex-1 overflow-y-auto pt-6 custom-scrollbar">
          {/* Dashboard Item (Always First) */}
          {dashboardTabName && (
            <button
              onClick={() => { setActiveTab && setActiveTab(dashboardTabName); setMobileSidebarOpen(false); }}
              title={sidebarCollapsed ? dashboardTabName : undefined}
              className={`
                w-[calc(100%-16px)] flex items-center gap-3 px-3.5 py-3 mx-2 rounded-2xl transition-all duration-200 text-left relative group
                ${activeTab === dashboardTabName ? "bg-[#1B4DA0] text-white shadow-lg shadow-blue-500/20" : "text-[#6B6B7E] hover:text-[#1A1A2E] hover:bg-[#F8FAFF]"}
              `}
            >
              <LayoutDashboard size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-semibold">{dashboardTabName}</span>}
              {activeTab === dashboardTabName && sidebarCollapsed && (
                <div className="absolute left-[-8px] w-1.5 h-6 bg-[#1B4DA0] rounded-r-full" />
              )}
            </button>
          )}

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
                  if (item.type === 'custom') {
                    return (
                      <div key={item.id} className="my-2">
                        {!sidebarCollapsed && item.render()}
                      </div>
                    );
                  }

                  const Icon = item.icon || Grid;
                  const isActive = activeTab === item.id || activeTab === item.title;
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isSubExpanded = !!expandedMenus[item.id];
                  const isChildActive = hasSubmenu && item.submenu.some(sub => activeTab === sub.id || activeTab === sub.title);
                  const isHighlighted = isActive || (hasSubmenu && isChildActive);
                  const hasUpdate = tabUpdates[item.title] || tabUpdates[item.id] || (hasSubmenu && item.submenu.some(sub => tabUpdates[sub.title] || tabUpdates[sub.id]));

                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          if (hasSubmenu) toggleMenu(item.id);
                          else { setActiveTab && setActiveTab(item.title || item.id); setMobileSidebarOpen(false); }
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
                          {!sidebarCollapsed && hasUpdate && !hasSubmenu && (
                            <div className="flex h-2 w-2 relative shrink-0">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75" style={{ backgroundColor: '#fb7185' }}></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" style={{ backgroundColor: '#f43f5e' }}></span>
                            </div>
                          )}
                        </div>
                        {!sidebarCollapsed && hasSubmenu && (
                          <div className="flex items-center gap-2">
                            {hasUpdate && (
                              <div className="flex h-2 w-2 relative shrink-0">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75" style={{ backgroundColor: '#fb7185' }}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" style={{ backgroundColor: '#f43f5e' }}></span>
                              </div>
                            )}
                            <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isSubExpanded ? "rotate-90" : ""}`} />
                          </div>
                        )}
                        {sidebarCollapsed && hasUpdate && (
                          <div className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" style={{ backgroundColor: '#fb7185' }}></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" style={{ backgroundColor: '#f43f5e' }}></span>
                          </div>
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
                              const isSubActive = activeTab === sub.id || activeTab === sub.title;
                              const isSubUpdate = tabUpdates[sub.title] || tabUpdates[sub.id];
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => { setActiveTab && setActiveTab(sub.title || sub.id); setMobileSidebarOpen(false); }}
                                  className={`
                                    w-full flex items-center justify-between py-2 px-3 text-[13px] font-semibold transition-all duration-200 rounded-xl text-left
                                    ${isSubActive ? "bg-[#1B4DA0]/5 text-[#1B4DA0]" : "text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-[#F8FAFF]"}
                                  `}
                                >
                                  <span className="text-left flex-1">{sub.title}</span>
                                  {isSubUpdate && (
                                    <div className="flex h-2 w-2 relative shrink-0 ml-2">
                                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75" style={{ backgroundColor: '#fb7185' }}></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" style={{ backgroundColor: '#f43f5e' }}></span>
                                    </div>
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

          {/* Bottom Contextual Link (Settings/Profile) */}
          {showBottomTab && (
            <div className="mt-auto pt-4 border-t border-[#F4F3EF] dark:border-gray-800 mx-2 mb-2">
              <button
                onClick={() => { setActiveTab && setActiveTab(bottomTabName); setMobileSidebarOpen(false); }}
                title={sidebarCollapsed ? bottomTabName : undefined}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 text-left relative
                  ${activeTab === bottomTabName ? "bg-[#1B4DA0]/10 text-[#1B4DA0]" : "text-[#6B6B7E] hover:text-[#1A1A2E] hover:bg-[#F8FAFF]"}
                `}
              >
                {bottomTabName === 'My Profile' ? <User size={20} className="flex-shrink-0" /> : <Settings size={20} className="flex-shrink-0" />}
                {!sidebarCollapsed && <span className="text-sm font-semibold">{bottomTabName}</span>}
              </button>

              {!hideDailyLogout && (
                <button
                  onClick={handleLogout}
                  title={sidebarCollapsed ? "Daily Logout" : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-3 mt-1 rounded-2xl transition-all duration-200 text-left relative
                    text-[#7F1D1D]
                  `}
                >
                  <LogOut size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm font-semibold">Daily Logout</span>}
                </button>
              )}
            </div>
          )}
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-[#F4F3EF] dark:border-gray-800">
          <div className={`flex items-center gap-2.5 p-2 rounded-2xl transition-all ${sidebarCollapsed ? 'justify-center border-0' : 'bg-[#FAFAFA] dark:bg-gray-800/50 border border-[#F4F3EF] dark:border-gray-700'}`}>
            <div className="h-9 w-9 rounded-2xl bg-[#EEF2FB] text-[#1B4DA0] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm overflow-hidden border border-[#DBEAFE]">
              {localUserInfo.avatar && (localUserInfo.avatar.startsWith('data:image') || localUserInfo.avatar.startsWith('http://') || localUserInfo.avatar.startsWith('https://')) ? (
                <img src={localUserInfo.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                localUserInfo.avatar || localUserInfo.name?.charAt(0) || 'U'
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1A1A2E] dark:text-gray-100 truncate">{localUserInfo.name}</p>
                <p className="text-[10px] text-[#9B9BAD] dark:text-gray-500 truncate font-bold uppercase tracking-wider">{localUserInfo.role}</p>
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
        {showGlobalHeader ? (
          <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 border-b border-[#F4F3EF] dark:border-gray-800">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-[#6B6B7E] hover:text-[#1A1A2E] relative"
              >
                <Menu size={20} />
              </button>
              {/* Desktop Toggle moved to Sidebar */}
              <h2 className="text-lg font-bold text-[#1A1A2E] dark:text-white tracking-tight">
                {getDisplayTitle()}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Mega Menu / App Launcher */}
              <div className="relative" ref={megaMenuRef}>
                <button
                  onClick={() => {
                    setMegaMenuOpen(!megaMenuOpen);
                    setNotificationsOpen(false);
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${megaMenuOpen ? 'bg-[#1B4DA0] text-white shadow-lg' : 'bg-[#F8FAFF] dark:bg-gray-800 text-[#6B6B7E] hover:text-[#1B4DA0]'}`}
                  title="App Launcher"
                >
                  <Grid size={18} />
                </button>

                <AnimatePresence>
                  {megaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      className="absolute left-0 mt-3 w-[480px] bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#F4F3EF] dark:border-gray-700 overflow-hidden z-50 p-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold text-[#1A1A2E] dark:text-white uppercase tracking-widest">Main Modules</h3>
                        <button
                          onClick={() => setMegaMenuOpen(false)}
                          className="text-[#9B9BAD] hover:text-rose-500"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {/* Always include Dashboard */}
                        <button
                          onClick={() => { setActiveTab && setActiveTab(dashboardTabName || 'Dashboard'); setMegaMenuOpen(false); }}
                          className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-[#F8FAFF] dark:hover:bg-gray-700/50 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LayoutDashboard size={24} />
                          </div>
                          <span className="text-[11px] font-bold text-[#1A1A2E] dark:text-white uppercase tracking-wider">{dashboardTabName || 'Dashboard'}</span>
                        </button>

                        {/* Dynamic Sidebar Items */}
                        {sidebarItems.flatMap(section => section.items || []).map((item) => {
                          const Icon = item.icon || Grid;
                          return (
                            <button
                              key={item.id}
                              onClick={() => { setActiveTab && setActiveTab(item.title); setMegaMenuOpen(false); }}
                              className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-[#F8FAFF] dark:hover:bg-gray-700/50 transition-all group"
                            >
                              <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] dark:bg-gray-700 text-[#6B6B7E] dark:text-gray-400 flex items-center justify-center group-hover:bg-[#1B4DA0]/10 group-hover:text-[#1B4DA0] group-hover:scale-110 transition-all">
                                <Icon size={24} />
                              </div>
                              <span className="text-[11px] font-bold text-[#1A1A2E] dark:text-white uppercase tracking-wider text-center">{item.title}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#F4F3EF] dark:border-gray-700 flex justify-center">
                        <button className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-widest hover:underline">View All Apps</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {headerActions}
              {/* Search - Subtle */}
              {showSearch && (
                <div className="hidden sm:flex items-center gap-2 bg-[#F4F3EF] dark:bg-gray-800 px-3 py-2 rounded-xl border border-transparent focus-within:border-[#1B4DA0]/20 transition-all">
                  <Search size={14} className="text-[#9B9BAD]" />
                  <input type="text" placeholder="Search..." className="bg-transparent border-0 outline-none text-xs text-[#1A1A2E] dark:text-white w-32 focus:w-48 transition-all placeholder-[#9B9BAD]" />
                </div>
              )}

              {/* Notification Hub */}
              {showNotifications && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F8FAFF] dark:bg-gray-800 text-[#6B6B7E] hover:text-[#1B4DA0] transition-all relative"
                  >
                    <Bell size={18} />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 border-2 border-white dark:border-gray-900 rounded-full" style={{ backgroundColor: '#f43f5e' }}></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
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
                          {activeNotifications.length === 0 ? (
                            <div className="p-8 text-center text-[#9B9BAD]">
                              <Bell size={32} className="mx-auto mb-3 opacity-20" />
                              <p className="text-sm font-medium">No new alerts</p>
                            </div>
                          ) : (
                            activeNotifications.map((n, idx) => (
                              <div
                                key={idx}
                                onClick={() => onNotificationClick?.(n)}
                                className={`p-4 hover:bg-[#F8FAFF] dark:hover:bg-gray-700/50 cursor-pointer transition-colors flex items-start gap-3 ${(!n.read && !n.isRead) ? 'bg-[#EEF2FB]/30' : ''}`}
                              >
                                {(!n.read && !n.isRead) && (
                                  <span className="w-2 h-2 mt-1.5 bg-rose-500 rounded-full flex-shrink-0" style={{ backgroundColor: '#f43f5e' }}></span>
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                  <p className={`text-[13px] text-[#1A1A2E] dark:text-gray-100 leading-tight ${(!n.read && !n.isRead) ? 'font-bold' : 'font-medium'}`}>{n.message}</p>
                                  <p className="text-[10px] text-[#9B9BAD] mt-1 font-bold uppercase tracking-wider">{n.time}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {activeNotifications.length > 5 && (
                          <button className="w-full py-3 text-[10px] font-bold text-[#1B4DA0] hover:bg-[#F8FAFF] uppercase tracking-widest border-t border-[#F4F3EF]">View All</button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </header>
        ) : (
          <header className="lg:hidden h-14 bg-white dark:bg-gray-900 border-b border-[#F4F3EF] dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 -ml-2 text-[#6B6B7E] hover:text-[#1A1A2E] dark:hover:text-white rounded-lg transition-all relative"
                title="Open Menu"
              >
                <Menu size={20} />
              </button>
              <span className="text-sm font-bold text-[#1A1A2E] dark:text-white tracking-tight">
                {getDisplayTitle()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <img src={logo} alt="Mabicons" className="h-6 w-auto object-contain" />
            </div>
          </header>
        )}

        {/* Dynamic Page Surface */}
        <main ref={contentRef} className="flex-1 overflow-auto bg-[#FDFDFD] dark:bg-gray-950 p-4 lg:p-6 pb-20 relative">
          <div className="w-full">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-[#FDFDFD]/80 backdrop-blur-sm z-50"
                  style={{ minHeight: '400px' }}
                >
                  <Loader />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * StatCard - High Fidelity recruitment stat cards
 */
export const StatCard = ({ title, value, change, changeType = 'increase', icon: Icon, color = 'blue', onClick }) => {
  const colors = {
    blue: "bg-blue-100 text-[#1B4DA0]",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
    amber: "bg-amber-100 text-amber-600",
    violet: "bg-violet-100 text-violet-600",
    white: "bg-white text-black border border-[#F4F3EF] shadow-sm",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`bg-white rounded-[40px] p-8 shadow-sm border border-[#F4F3EF] transition-all duration-300 group ${onClick ? 'cursor-pointer active:scale-[0.98] hover:shadow-xl hover:shadow-blue-500/5 hover:border-transparent' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-[20px] ${colors[color] || colors.blue} transition-all duration-500 group-hover:bg-[#1B4DA0] group-hover:text-white group-hover:scale-110 shadow-sm`}>
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
