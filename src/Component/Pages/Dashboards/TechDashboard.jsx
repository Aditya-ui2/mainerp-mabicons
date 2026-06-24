import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiUserPlus,
  FiHelpCircle,
  FiFileText,
  FiUser,
  FiBell,
  FiCheckSquare
} from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import TechTeamTab from './Tabs/Tech/TechTeamTab';
import TechClientsTab from './Tabs/Tech/TechClientsTab';
import TechHelpSupportTab from './Tabs/Tech/TechHelpSupportTab';
import TechExternalSupportTab from './Tabs/Tech/TechExternalSupportTab';
import TechMyProfileTab from './Tabs/Tech/TechMyProfileTab';
import TaskAssignmentTab from './Tabs/Common/TaskAssignmentTab';
import { getAllNotifications, markNotificationRead, markAllNotificationsRead, getMyProfile } from '../service/api';

const sidebarConfig = [
  {
    items: [
      {
        id: 'All Employees',
        title: 'All Employees',
        icon: FiUsers,
      },
      {
        id: 'All Clients',
        title: 'All Clients',
        icon: FiUserPlus,
      },
      {
        id: 'Help & Support',
        title: 'Help & Support',
        icon: FiHelpCircle,
        submenu: [
          { id: 'Internal', title: 'Internal' },
          { id: 'External', title: 'External' },
        ]
      },
      {
        id: 'Tasks',
        title: 'Tasks',
        icon: FiCheckSquare,
      }
    ]
  }
];

const TechDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('tech_active_tab');
    return (saved && saved !== 'Dashboard') ? saved : 'All Employees';
  });
  const [userInfo, setUserInfo] = useState({ name: 'Tech User', role: 'Tech' });
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('tech_active_tab', activeTab);
  }, [activeTab]);

  const refreshUserInfo = () => {
    const localName = localStorage.getItem('userName');
    const localRole = localStorage.getItem('userType');
    const localPicture = localStorage.getItem('userPicture');
    setUserInfo({
      name: localName || 'Tech User',
      role: localRole || 'Tech',
      avatar: localPicture || '',
      picture: localPicture || ''
    });
  };

  useEffect(() => {
    refreshUserInfo();
    window.addEventListener('profileUpdate', refreshUserInfo);

    getMyProfile()
      .then(res => {
        if (res && res.success && res.member) {
          const pic = res.member.picture || res.member.avatar || '';
          localStorage.setItem('userPicture', pic);
          if (res.member.name) {
            localStorage.setItem('userName', res.member.name);
          }
          refreshUserInfo();
        }
      })
      .catch(err => console.error('Failed to sync profile on mount:', err));

    return () => window.removeEventListener('profileUpdate', refreshUserInfo);
  }, []);

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
    } catch (e) {}
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
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => n.status !== 'read' && !n.isRead && !n.read).length;

  const renderNotificationBell = () => {
    return (
      <div className="relative inline-block text-left animate-in fade-in duration-300 z-[9999]" ref={notificationRef}>
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFFDF9] to-[#FFF9E6] border border-[#F5E6C4] shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-[#D4AF37] hover:scale-105 active:scale-95 transition-all relative outline-none"
          title="Notifications"
        >
          <FiBell className="w-5 h-5" />
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
      case 'All Employees':
        return <TechTeamTab notificationBell={renderNotificationBell()} />;
      case 'All Clients':
        return <TechClientsTab notificationBell={renderNotificationBell()} />;
      case 'Help & Support':
      case 'Internal':
        return <TechHelpSupportTab userRole={userInfo.role} userName={userInfo.name} />;
      case 'External':
        return <TechExternalSupportTab notificationBell={renderNotificationBell()} />;
      case 'Tasks':
        return <TaskAssignmentTab department="Tech" notificationBell={renderNotificationBell()} />;
      case 'My Profile':
        return <TechMyProfileTab onProfileUpdate={refreshUserInfo} />;
      case 'Dashboard':
      default:
        return (
          <div className="space-y-12 animate-in fade-in duration-500 text-left">
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
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm p-8">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 text-blue-500">
                <FiHome size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Tech Dashboard</h2>
              <p className="text-slate-500 max-w-md mt-2">Manage all technology operations from this centralized dashboard.</p>
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
      userInfo={userInfo}
      bottomTabName="My Profile"
      dashboardTabName={null}
      notifications={notifications}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default TechDashboard;
