import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiBarChart2,
  FiTrendingUp,
  FiTarget,
  FiClock,
  FiBell,
  FiEdit3,
  FiUserPlus,
  FiX,
  FiChevronDown,
  FiCheckSquare
} from "react-icons/fi";  

import { FaRupeeSign } from "react-icons/fa";
import AdminLayout, { StatCard } from './AdminLayout';
import MyProfileTab from './Tabs/Common/MyProfileTab';
import TeamsTab from './Tabs/Sales/TeamsTab';
import LeadsTab from './Tabs/Sales/LeadsTab';
import SalesCampaigns from "./Tabs/Sales/SalesCampaigns";
import MeetingsTab from './Tabs/Sales/MeetingsTab';
import NotesTab from './Tabs/KAM/NotesTab';
import SalesMISTab from './Tabs/Sales/SalesMISTab';
import FollowUpsTab from './Tabs/Sales/FollowUpsTab';
import ProposalsTab from './Tabs/Sales/ProposalsTab';
import ClosuresTab from './Tabs/Sales/ClosuresTab';
import SalesReportTab from './Tabs/Sales/SalesReportTab';
import TeamPerformanceTab from './Tabs/Sales/TeamPerformanceTab';
import GenericCampaignTab from './Tabs/Sales/GenericCampaignTab';
import TaskAssignmentTab from './Tabs/Common/TaskAssignmentTab';
import { getBDDashboardStats, getAllNotifications, markNotificationRead, markAllNotificationsRead } from '../service/api';

const sidebarConfig = [
  {
    items: [
      {
        id: 'Dashboard',
        title: 'Dashboard',
        icon: FiHome,
      },
      {
        id: 'My Team',
        title: 'My Team',
        icon: FiUsers,
      },
      {
        id: 'Leads',
        title: 'Leads',
        icon: FiUserPlus,
      },
      {
        id: 'Meetings',
        title: 'Meetings',
        icon: FiCalendar,
      },
      {
        id: 'follow-ups',
        title: 'Follow-ups',
        icon: FiClock,
      },
      {
        id: 'Proposals',
        title: 'Proposals',
        icon: FiFileText,
      },
      {
        id: 'Closures',
        title: 'Closures',
        icon: FiCheckCircle,
      },
      {
        id: 'Sales Report',
        title: 'Sales Report',
        icon: FiBarChart2,
      },
      {
        id: 'Team Performance',
        title: 'Team Performance',
        icon: FiTrendingUp,
      },
      {
        id: 'Notes',
        title: 'Notes',
        icon: FiEdit3,
      },
      {
        id: 'Add MIS',
        title: 'Add MIS',
        icon: FiFileText,
      },
      {
        id: 'Tasks',
        title: 'Tasks',
        icon: FiCheckSquare,
      },
    ]
  }
];

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('sales_admin_active_tab') || 'Dashboard');
  const [userInfo, setUserInfo] = useState({ name: 'Sales User', role: 'Sales Executive', avatar: '' });

  const refreshUserInfo = () => {
    const localName = localStorage.getItem('userName');
    const localRole = localStorage.getItem('userRole') || localStorage.getItem('userType');
    const localPicture = localStorage.getItem('userPicture');
    
    let fallbackName = 'Sales User';
    let fallbackRole = 'Sales Executive';
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        fallbackName = decoded.name || 'Sales User';
        fallbackRole = decoded.role || 'Sales Executive';
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
    stages: { new: 0, qualified: 0, proposal: 0, closed: 0 },
    teamPerformance: [],
    recentActivities: []
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
      const res = await getBDDashboardStats();
      if (res && res.success && res.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };


  useEffect(() => {
    refreshUserInfo();
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('sales_admin_active_tab', activeTab);
  }, [activeTab]);

  const renderNotificationBell = () => {
    return (
      <div className="relative inline-block text-left z-[9999]" ref={notificationRef}>
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFFDF9] to-[#FFF9E6] border border-[#F5E6C4] shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-[#D4AF37] hover:scale-105 active:scale-95 transition-all relative outline-none"
          title="Notifications"
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
      case 'Leads':
        return <LeadsTab notificationBell={renderNotificationBell()} />;
      case 'Meetings':
        return <MeetingsTab notificationBell={renderNotificationBell()} />;
      case 'Notes':
        return <NotesTab />;
      case 'My Team':
        return <TeamsTab />;
      case 'My Profile':
        return <MyProfileTab onProfileUpdate={refreshUserInfo} />;
      case 'Add MIS':
        return <SalesMISTab />;
      case 'Follow-ups':
        return <FollowUpsTab notificationBell={renderNotificationBell()} />;
      case 'Proposals':
        return <ProposalsTab notificationBell={renderNotificationBell()} />;
      case 'Closures':
        return <ClosuresTab notificationBell={renderNotificationBell()} />;
      case 'Sales Report':
        return <SalesReportTab notificationBell={renderNotificationBell()} />;
      case 'Team Performance':
        return <TeamPerformanceTab notificationBell={renderNotificationBell()} />;
      case 'Email Campaigns':
      case 'WhatsApp Campaigns':
      case 'Social Campaigns':
      case 'Lead Campaign Reports':
      case 'Ad Source Tracking':
        return <GenericCampaignTab campaignType={activeTab} notificationBell={renderNotificationBell()} />;
      case 'Campaigns':
        return <GenericCampaignTab campaignType="Email Campaigns" notificationBell={renderNotificationBell()} />;
      case 'Tasks':
        return <TaskAssignmentTab department="Sales" notificationBell={renderNotificationBell()} />;
      default:
      case 'Dashboard':
        return (
          <div className="space-y-12">
            {/* Sticky Welcome Header */}
            <div className="sticky top-0 z-[30] bg-[#FDFDFD]/80 backdrop-blur-md -mt-6 -mx-6 px-6 py-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50">
              <div className="flex flex-col items-start text-left">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">
                  Welcome {userInfo.name.split(' ')[0]}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {renderNotificationBell()}
              </div>
            </div>

            {/* Financial KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard
                title="Sales Pipeline"
                value={`₹${(stats.pipelineValue / 100000).toFixed(1)}L`}
                icon={FaRupeeSign}
                color="white"
                change="Total active deals"
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
                change="High priority clients"
              />
              <StatCard
                title="Revenue"
                value={`₹${(stats.revenue / 100000).toFixed(1)}L`}
                icon={FaRupeeSign}
                color="white"
                change="Monthly generated revenue"
              />
            </div>

            {/* Pipeline Section */}
            <div className="mt-10 bg-white rounded-[40px] p-8 border border-[#F4F3EF] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">
                  Sales Pipeline
                </h2>
                <div className="relative">
                  <select className="pl-5 pr-10 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold outline-none cursor-pointer appearance-none">
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="this_year">This Year</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm">
                  <p className="text-[#1A1A2E] font-bold">New Leads</p>
                  <h3 className="text-4xl font-black text-[#1A1A2E] mt-4">{stats.stages.new}</h3>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm">
                  <p className="text-[#1A1A2E] font-bold">Qualified</p>
                  <h3 className="text-4xl font-black text-[#1A1A2E] mt-4">{stats.stages.qualified}</h3>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm">
                  <p className="text-[#1A1A2E] font-bold">Proposal</p>
                  <h3 className="text-4xl font-black text-[#1A1A2E] mt-4">{stats.stages.proposal}</h3>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm">
                  <p className="text-[#1A1A2E] font-bold">Closed</p>
                  <h3 className="text-4xl font-black text-[#1A1A2E] mt-4">{stats.stages.closed}</h3>
                </div>
              </div>
            </div>

            {/* Bottom Cards */}
            <div className="grid md:grid-cols-2 gap-8 mt-10">
              <div className="bg-white rounded-[40px] p-8 border border-[#F4F3EF] shadow-sm">
                <h2 className="text-2xl font-bold text-[#1A1A2E] mb-8 font-syne">
                  Team Performance
                </h2>
                <div className="space-y-6 text-left">
                  {!stats.teamPerformance || stats.teamPerformance.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-[#F4F3EF]">
                        <FiUsers size={20} />
                      </div>
                      <p className="text-sm font-bold text-[#1A1A2E]">No team performance data</p>
                      <p className="text-xs text-[#6B6B7E] mt-1">Add BD executives to see their stats.</p>
                    </div>
                  ) : (
                    stats.teamPerformance.map((member, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-[#1A1A2E]">{member.name}</span>
                          <span className="font-bold text-[#1B4DA0]">{member.percentage}%</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-3 rounded-full bg-[#1B4DA0]" style={{ width: `${member.percentage}%` }}></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[40px] p-8 border border-[#F4F3EF] shadow-sm">
                <h2 className="text-2xl font-bold text-[#1A1A2E] mb-8 font-syne">
                  Recent Activities
                </h2>
                <div className="space-y-4 text-left">
                  {stats.recentActivities.map((act, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#F4F3EF] font-medium text-[#1A1A2E]">
                      {act}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes and Tasks Cards */}
            <div className="grid md:grid-cols-2 gap-8 mt-10">
              {/* Notes */}
              <div className="group bg-white rounded-[40px] shadow-sm border border-[#F4F3EF] overflow-hidden min-h-[380px] flex flex-col">
                <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F8FAFF] flex items-center justify-center text-[#1B4DA0]">
                      <FiEdit3 size={20} />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: '"Syne", sans-serif' }}>
                      Notes
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('Notes')}
                    className="text-[11px] font-black uppercase tracking-widest text-[#1B4DA0] hover:text-[#0D47A1] transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-3xl bg-[#F8FAFF] flex items-center justify-center mb-4 text-[#1B4DA0]">
                    <FiEdit3 size={24} />
                  </div>
                  <p className="text-lg font-bold text-[#1A1A2E] font-syne">
                    No Notes Found
                  </p>
                  <p className="text-sm font-medium text-[#6B6B7E] mt-2">
                    Team directives will appear here
                  </p>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-[40px] shadow-sm border border-[#F4F3EF] overflow-hidden min-h-[380px] flex flex-col">
                <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F8FAFF] flex items-center justify-center text-[#1B4DA0]">
                      <FiCheckSquare size={20} />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: '"Syne", sans-serif' }}>
                      Tasks
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('Tasks')}
                    className="text-[11px] font-black uppercase tracking-widest text-[#1B4DA0] hover:text-[#0D47A1] transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-3xl bg-[#F8FAFF] flex items-center justify-center mb-4 text-[#1B4DA0]">
                    <FiCheckSquare size={24} />
                  </div>
                  <p className="text-lg font-bold text-[#1A1A2E] font-syne">
                    No Pending Tasks
                  </p>
                  <p className="text-sm font-medium text-[#6B6B7E] mt-2">
                    You're all caught up!
                  </p>
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

export default SalesDashboard;