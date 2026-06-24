import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiBarChart2,
  FiTarget,
  FiDollarSign,
  FiClock,
  FiBell,
  FiClipboard,
  FiX,
  FiChevronDown,
  FiCheckSquare
} from "react-icons/fi";
import AdminLayout, { StatCard } from "./AdminLayout";
import MyProfileTab from './Tabs/Common/MyProfileTab';
import LeadsTab from "./Tabs/Sales/LeadsTab";
import MeetingsTab from "./Tabs/Sales/MeetingsTab";
import FollowUpsTab from "./Tabs/Sales/FollowUpsTab";
import ProposalsTab from "./Tabs/Sales/ProposalsTab";
import ClosuresTab from "./Tabs/Sales/ClosuresTab";
import SalesReportTab from "./Tabs/Sales/SalesReportTab";
import SalesCampaigns from "./Tabs/Sales/SalesCampaigns";
import DailySalesReportTab from "./Tabs/KAMSales/DailySalesReportTab";
import TaskAssignmentTab from './Tabs/Common/TaskAssignmentTab';
import { getAllNotifications, markNotificationRead, markAllNotificationsRead } from "../service/api";
import { getKAMDashboard } from "../service/salesKamApi";
import PolicyTab from './Tabs/KAM/PolicyTab';

const sidebarConfig = [
  {
    items: [
      {
        id: "Dashboard",
        title: "Dashboard",
        icon: FiHome,
      },
      {
        id: "Leads",
        title: "Leads",
        icon: FiUsers,
      },
      {
        id: "Meetings",
        title: "Meetings",
        icon: FiCalendar,
      },
      {
        id: "Follow-ups",
        title: "Follow-ups",
        icon: FiClock,
      },
      {
        id: "Proposals",
        title: "Proposals",
        icon: FiFileText,
      },
      {
        id: "Closures",
        title: "Closures",
        icon: FiCheckCircle,
      },
      {
        id: "Sales Report",
        title: "Sales Report",
        icon: FiBarChart2,
      },
      {
        id: "Daily MIS",
        title: "Daily MIS",
        icon: FiClipboard,
      },
      {
        id: "Tasks",
        title: "Tasks",
        icon: FiCheckSquare,
      },
      {
        id: "HR Policy",
        title: "HR Policy",
        icon: FiFileText,
      },
    ],
  },
];

const SalesKamDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('sales_kam_active_tab') || 'Dashboard');
  const [userInfo, setUserInfo] = useState({
    name: "KAM User",
    role: "Key Account Manager",
    avatar: "",
  });



  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    hotLeads: 0,
    closedLeads: 0,
    pipelineValue: 0,
    revenue: 0,
    stages: { new: 0, qualified: 0, proposal: 0, closed: 0 }
  });

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.id || decoded.userId;
        if (userId) {
          const res = await getAllNotifications(userId);
          setNotifications(res?.data || []);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id || n.id === id ? { ...n, isRead: true, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.id || decoded.userId;
        if (userId) {
          await markAllNotificationsRead(userId);
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => n.status !== 'read' && !n.isRead && !n.read).length;

  const loadStats = async () => {
    try {
      const res = await getKAMDashboard();
      if (res && res.success && res.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const refreshUserInfo = () => {
    const localName = localStorage.getItem('userName');
    const localRole = localStorage.getItem('userRole') || localStorage.getItem('userType');
    const localPicture = localStorage.getItem('userPicture');
    
    let fallbackName = 'KAM User';
    let fallbackRole = 'Key Account Manager';
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        fallbackName = decoded.name || 'KAM User';
        fallbackRole = decoded.role || 'Key Account Manager';
      }
    } catch (e) {}

    setUserInfo({
      name: localName || fallbackName,
      role: localRole || fallbackRole,
      avatar: localPicture || '',
      picture: localPicture || ''
    });
  };

  useEffect(() => {
    refreshUserInfo();
    window.addEventListener('profileUpdate', refreshUserInfo);
    return () => window.removeEventListener('profileUpdate', refreshUserInfo);
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('sales_kam_active_tab', activeTab);
  }, [activeTab]);

  const renderNotificationBell = () => {
    return (
      <div className="relative inline-block text-left z-[9999]" ref={notificationRef}>
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFFDF9] to-[#FFF9E6] border border-[#F5E6C4] shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-[#D4AF37] hover:scale-105 active:scale-95 transition-all relative outline-none"
        >
          <FiBell className="w-5 h-5 animate-pulse" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-[#D4AF37] text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#F4F3EF] overflow-hidden z-[99999]"
            >
              <div className="p-4 border-b border-[#F4F3EF] bg-[#FFFDF9] flex items-center justify-between">
                <h3 className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[3px]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[9px] font-black text-[#1B4DA0] uppercase tracking-wider hover:underline bg-transparent border-none p-0 cursor-pointer text-left"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F3EF] custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#9B9BAD]">
                    <FiBell size={32} className="mx-auto mb-3 opacity-20 text-[#D4AF37]" />
                    <p className="text-xs font-bold">No new alerts</p>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div
                      key={n._id || n.id || idx}
                      onClick={() => handleMarkRead(n._id || n.id)}
                      className={`p-4 hover:bg-[#FFFDF9]/40 cursor-pointer transition-colors text-left ${(!n.isRead && !n.read) ? 'bg-[#FFFDF9]/70' : ''}`}
                    >
                      <p className={`text-[12px] text-[#1A1A2E] leading-tight ${(!n.isRead && !n.read) ? 'font-bold' : 'font-medium'}`}>{n.message}</p>
                      <p className="text-[9px] text-[#9B9BAD] mt-1.5 font-bold uppercase tracking-wider">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : n.time || 'JUST NOW'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "My Profile":
        return <MyProfileTab onProfileUpdate={refreshUserInfo} />;
      case "Leads":
        return <LeadsTab notificationBell={renderNotificationBell()} />;

      case "Campaigns":
        return <SalesCampaigns />;

      case "Meetings":
        return <MeetingsTab notificationBell={renderNotificationBell()} />;

      case "Follow-ups":
        return <FollowUpsTab notificationBell={renderNotificationBell()} />;

      case "Proposals":
        return <ProposalsTab notificationBell={renderNotificationBell()} />;

      case "Closures":
        return <ClosuresTab notificationBell={renderNotificationBell()} />;

      case "Sales Report":
        return <SalesReportTab notificationBell={renderNotificationBell()} />;

      case "Daily MIS":
        return <DailySalesReportTab />;

      case "Tasks":
        return <TaskAssignmentTab department="Sales" notificationBell={renderNotificationBell()} />;
      case "HR Policy":
        return <PolicyTab isReadOnly={true} notificationBell={renderNotificationBell()} />;

      default:
      case "Dashboard":
        return (
          <div className="space-y-12">
            {/* Header */}
            <div className="sticky top-0 z-[30] bg-[#FDFDFD]/80 backdrop-blur-md -mt-6 -mx-6 px-6 py-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">
                  Welcome {userInfo.name.split(" ")[0]}
                </h2>


              </div>

              <div className="flex items-center gap-3">
                {renderNotificationBell()}
              </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Sales Pipeline"
                value={`₹${(stats.pipelineValue / 100000).toFixed(1)}L`}
                icon={FiDollarSign}
                color="white"
                change="Current active pipeline"
              />

              <StatCard
                title="New Leads"
                value={stats.newLeads.toString()}
                icon={FiUsers}
                color="white"
                change="Fresh incoming leads"
              />

              <StatCard
                title="Hot Leads"
                value={stats.hotLeads.toString()}
                icon={FiTarget}
                color="white"
                change="High conversion clients"
              />

              <StatCard
                title="Closures"
                value={stats.closedLeads.toString()}
                icon={FiCheckCircle}
                color="white"
                change="Successful closed deals"
              />
            </div>

            {/* Pipeline */}
            <div className="bg-white rounded-[40px] p-8 border border-[#F4F3EF] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">
                  KAM Pipeline Overview
                </h2>

                <div className="relative">
                  <select className="pl-5 pr-10 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold outline-none cursor-pointer border-r-8 border-transparent appearance-none">
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="this_year">This Year</option>
                    <option value="custom">Custom date range</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="bg-white rounded-[28px] p-8 border border-[#F4F3EF] shadow-sm">
                  <p className="font-bold text-[#1A1A2E]">Leads</p>
                  <h3 className="text-4xl font-black text-[#1A1A2E] mt-4">
                    {stats.stages.new}
                  </h3>
                </div>

                <div className="bg-white rounded-[28px] p-8 border border-[#F4F3EF] shadow-sm">
                  <p className="font-bold text-[#1A1A2E]">Meetings</p>
                  <h3 className="text-4xl font-black text-[#1A1A2E] mt-4">
                    {stats.stages.qualified}
                  </h3>
                </div>

                <div className="bg-white rounded-[28px] p-8 border border-[#F4F3EF] shadow-sm">
                  <p className="font-bold text-[#1A1A2E]">Proposals</p>
                  <h3 className="text-4xl font-black text-[#1A1A2E] mt-4">
                    {stats.stages.proposal}
                  </h3>
                </div>

                <div className="bg-white rounded-[28px] p-8 border border-[#F4F3EF] shadow-sm">
                  <p className="font-bold text-[#1A1A2E]">Closures</p>
                  <h3 className="text-4xl font-black text-[#1A1A2E] mt-4">
                    {stats.stages.closed}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout
      sidebarItems={sidebarConfig}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dashboardTitle={activeTab}
      userInfo={userInfo}
      dashboardTabName={null}
      bottomTabName="My Profile"
      showBottomTab={true}
      showGlobalHeader={false}
      notifications={notifications}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default SalesKamDashboard;