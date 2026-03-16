import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { FiHome, FiUsers, FiBarChart2, FiCheckSquare, FiPieChart, FiSettings, FiSearch, FiBell, FiSun, FiMoon, FiUserPlus, FiFolder, FiBriefcase } from 'react-icons/fi';
import { useSpring, animated } from 'react-spring';
import CustomersTab from './Tabs/CustomersTab';
import logo from '../../../../public/ERP LOGO.png';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import RecruitmentTab from './Tabs/RecruitmentTab';
import { jwtDecode } from "jwt-decode";
import { updateAdmin } from '../service/api';
import axios from 'axios';
import { getUserProfileImage, uploadAdminProfileImage } from '../service/api';
import { getAllNotifications, markNotificationRead, deleteNotification } from '../service/api';
import { getAllTasks, getAllClients, getEmployeeTasks } from '../service/api';
import { getAdminHierarchy } from '../service/api';
import OnboardingTab from './Tabs/OnboardingTab';

// First, define the getModules function
const getModules = (stats) => [
  { 
    name: 'Total Client', 
    icon: FiUsers, 
    value: stats?.totalCustomers || '0', 
    change: '+5.2%',
    color: 'from-blue-500 to-blue-600',
    lightColor: 'from-blue-100 to-blue-200'
  },
  { 
    name: 'Team Members', 
    icon: FiUserPlus, 
    value: stats?.teamMembers || '0', 
    change: '+2.4%',
    color: 'from-purple-500 to-purple-600',
    lightColor: 'from-purple-100 to-purple-200'
  },
  { 
    name: 'Total Tasks',
    icon: FiFolder, 
    value: stats?.totalTasks || '0',
    change: '+3.1%',
    color: 'from-green-500 to-green-600',
    lightColor: 'from-green-100 to-green-200'
  },
  { 
    name: 'Tasks Completed', 
    icon: FiCheckSquare, 
    value: '0' || stats?.completedTasks , 
    change: '+7.8%',
    color: 'from-orange-500 to-orange-600',
    lightColor: 'from-orange-100 to-orange-200'
  },
];

// Get initial modules
const initialModules = getModules({});

const sidebarItems = [
  { name: 'Dashboard', icon: FiHome },
  { name: 'Clients', icon: FiUsers },
  { name: 'Team', icon: FiUserPlus },
  { name: 'Tasks', icon: FiCheckSquare },
  { name: 'Onboarding', icon: FiBriefcase },
  // { name: 'Recruitment', icon: FiBriefcase },
];

const Dashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModule, setActiveModule] = useState(initialModules[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    companyName: '',
    initials: ''
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    teamMembers: 0,
    activeProjects: 0,
    completedTasks: 0
  });
  const [modules, setModules] = useState(initialModules);
  const [latestTask, setLatestTask] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);

  const profileMenuRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const profileModalRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const initials = decoded.name
          ?.split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase() || 'CL';

        setUserProfile({
          name: decoded.name || '',
          email: decoded.email || '',
          companyName: decoded.companyName || '',
          initials: initials
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const role = decoded.role;
        const adminId = decoded.id;
        const data = await getUserProfileImage(role, adminId);
        
        // Use webContentLink but modify it for viewing instead of downloading
        if (data.webContentLink) {
          const fileId = data.webContentLink.split('id=')[1].split('&')[0];
          const directImageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
          setProfileImageUrl(directImageUrl);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };
  
    fetchProfileImage();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await getAllNotifications(userId);
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      
      // Fetch all relevant data
      const [tasksResponse, clientsResponse, hierarchyResponse] = await Promise.all([
        getAllTasks(),
        getAllClients(),
        getAdminHierarchy(decoded.id, 'Admin')
      ]);

      // Calculate total team members from hierarchy
      const teamLeadersCount = hierarchyResponse.adminHierarchy.teamLeaders.length;
      const employeesCount = hierarchyResponse.adminHierarchy.teamLeaders.reduce(
        (total, teamLeader) => total + (teamLeader.employees?.length || 0),
        0
      );
      const totalTeamMembers = teamLeadersCount + employeesCount;

      // Calculate statistics from the actual API responses
      const totalTasks = tasksResponse.tasks?.length || 0;
      const completedTasks = tasksResponse.tasks?.filter(task => 
        task.status === 'Resolved' || task.status === 'Completed'
      )?.length || 0;

      setDashboardStats({
        totalCustomers: clientsResponse.data.clients?.length || 0,
        teamMembers: totalTeamMembers,
        totalTasks: totalTasks,
        completedTasks: completedTasks
      });

      // Set the latest task
      if (tasksResponse.tasks && tasksResponse.tasks.length > 0) {
        const sortedTasks = tasksResponse.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLatestTask(sortedTasks[0]);
      }

      // Set the three most recent tasks
      if (tasksResponse.tasks && tasksResponse.tasks.length > 0) {
        const sortedTasks = tasksResponse.tasks.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentTasks(sortedTasks.slice(0, 3));
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Add useEffect to refresh stats when dashboard is active
  useEffect(() => {
    if (activeTab === 'Dashboard') {
      // Initial fetch
      fetchDashboardStats();

      // Set up interval for periodic refresh (every 30 seconds)
      const refreshInterval = setInterval(() => {
        fetchDashboardStats();
      }, 30000); // 30 seconds

      // Cleanup interval on component unmount or tab change
      return () => clearInterval(refreshInterval);
    }
  }, [activeTab]);

  // Add useEffect to refresh stats when switching to dashboard tab
  useEffect(() => {
    if (activeTab === 'Dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  // Update modules when dashboardStats changes
  useEffect(() => {
    const newModules = getModules(dashboardStats);
    setModules(newModules);
    // Also update activeModule if it's still showing the initial module
    if (activeModule.value === '0') {
      setActiveModule(newModules[0]);
    }
  }, [dashboardStats]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode); 

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async container => {
    await console.log(container);
  }, []);

  const particlesOptions = {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: isDarkMode ? "#ffffff" : "#000000"
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000"
        },
        polygon: {
          nb_sides: 5
        }
      },
      opacity: {
        value: 0.5,
        random: false,
        anim: {
          enable: false,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          size_min: 0.1,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: isDarkMode ? "#ffffff" : "#000000",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse"
        },
        onclick: {
          enable: true,
          mode: "push"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 400,
          line_linked: {
            opacity: 1
          }
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 8,
          speed: 3
        },
        repulse: {
          distance: 200,
          duration: 0.4
        },
        push: {
          particles_nb: 4
        },
        remove: {
          particles_nb: 2
        }
      }
    },
    retina_detect: true
  };

  const generateSpringProps = (index) => {
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    return useSpring({
      from: { transform: `translate(${randomX}vw, ${randomY}vh)` },
      to: async (next) => {
        while (true) {
          await next({ transform: `translate(${randomX + 5}vw, ${randomY + 5}vh)` });
          await next({ transform: `translate(${randomX}vw, ${randomY}vh)` });
        }
      },
      config: { duration: 20000 + index * 2000 },
    });
  };

  const circles = Array.from({ length: 5 }).map((_, index) => {
    const springProps = generateSpringProps(index);
    return (
      <animated.div
        key={index}
        style={{
          position: 'fixed',
          width: `${20 + index * 10}px`,
          height: `${20 + index * 10}px`,
          borderRadius: '50%',
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
          ...springProps,
        }}
      />
    );
  });

  const handleTabChange = (tabName) => {
    setActiveSidebarItem(tabName);
    setActiveTab(tabName);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = '/login';
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');

    if (updateFormData.newPassword !== updateFormData.confirmPassword) {
      setUpdateError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const adminId = decoded.id;

      await updateAdmin(adminId, {
        password: updateFormData.newPassword
      });
      
      setUpdateSuccess('Password updated successfully');
      setUpdateFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setIsProfileModalOpen(false);
        setUpdateSuccess('');
      }, 2000);
    } catch (error) {
      setUpdateError(error.message || 'Failed to update password');
    }
  };

  const handleProfileImageUpload = async () => {
    if (!profileImage) {
      setUploadStatus("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    formData.append("adminId", adminId);
    formData.append("image", profileImage);

    console.log("Profile Image:", profileImage);
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      setUploadStatus("Uploading...");
      
      const response = await axios.post(
        "https://erp-backend-d8tz.onrender.com/admin/uploadDP",
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Upload response:", response.data);

      if (response.data.success) {
        setUploadStatus("Image uploaded successfully");
        setUserProfile(prev => ({
          ...prev,
          profileImage: response.data.imageUrl
        }));
        setProfileImage(null);
      } else {
        setUploadStatus(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(error.response?.data?.message || "Upload failed. Please try again.");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, status: 'read' }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
        setIsProfileModalOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {circles}
      </div>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particlesOptions}
        className="absolute inset-0 z-0"
      />
      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside
          className={`w-64 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 ease-in-out`}
        >
          <div className="flex justify-center items-center">
            <img src={logo} alt="Logo" className="w-24 mt-4" />
          </div>
          <nav className="mt-8">
            {sidebarItems.map((item) => (
              <a
                key={item.name}
                href="#"
                onClick={() => handleTabChange(item.name)}
                className={`flex items-center px-6 py-4 ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-200'
                } transition-colors duration-200 ${
                  activeSidebarItem === item.name
                    ? isDarkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-black'
                    : ''
                }`}
              >
                <item.icon className={`mr-4 text-xl ${
                  activeSidebarItem === item.name
                    ? 'text-purple-500'
                    : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                }`} />
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-64">
          {/* Sticky Top bar */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className={`sticky top-0 z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-sm`}
          >
            <div className="flex justify-between items-center p-4">
              <div className="relative">
                
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  {isDarkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-600" />}
                </button>
                <div className="relative">
                  <button onClick={toggleNotifications} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <FiBell className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`} />
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div ref={notificationDropdownRef} className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700">
                      {/* Header */}
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Notifications
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 rounded-full">
                            {notifications.filter(n => n.status === 'unread').length} New
                          </span>
                        </div>
                      </div>

                      {/* Notification List */}
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <FiBell className="w-12 h-12 text-gray-400" />
                            <p className="mt-2 text-gray-500">No notifications yet</p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {notifications.map((notification) => (
                              <li
                                key={notification._id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                                  notification.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                      {notification.message}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        {new Date(notification.createdAt).toLocaleString()}
                                      </span>
                                      {notification.status === 'unread' && (
                                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {notification.status === 'unread' && (
                                      <button
                                        onClick={() => handleMarkAsRead(notification._id)}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                      >
                                        Mark as Read
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteNotification(notification._id)}
                                      className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
                          <button
                            className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => {
                              /* Handle clear all notifications */
                            }}
                          >
                            Clear all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button className={`p-2 rounded-full ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                }`}>
                </button>
                <div className="relative group">
                  <button 
                    className="flex items-center space-x-3"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {userProfile.initials || 'CL'}
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold">{userProfile.name}</p>
                      <p className="text-xs text-gray-500">{userProfile.companyName}</p>
                    </div>
                  </button>

                  <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      ref={profileMenuRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                      } ring-1 ring-black ring-opacity-5`}
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium">{userProfile.name}</p>
                        <p className="text-xs text-gray-500">{userProfile.email}</p>
                      </div>
                      <a
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setShowProfileMenu(false); // Add this line to close the menu
                        }}
                        className={`block px-4 py-2 text-sm ${
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        } cursor-pointer`}
                      >
                        Your Profile
                      </a>

                      {/* Additional menu items */}
                   
                        <div className="flex justify-center">
                          
                      <button
                        onClick={handleLogout}
                        className={`block px-4 py-2 text-sm w-44 bg-red-600 rounded-full text-white cursor-pointer transition-all duration-300 ease-in-out hover:bg-red-700 `}
                      >
                        Logout
                      </button>
                        </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard content */}
          {activeTab === 'Dashboard' && (
            <motion.div 
              className="p-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {/* Stats Cards */}
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={staggerChildren}>
                <AnimatePresence>
                  {modules.map((module, index) => (
                    <motion.div
                      key={module.name}
                      variants={fadeInUp}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative overflow-hidden rounded-2xl shadow-lg ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                      }`}
                    >
                      {/* Background gradient */}
                      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${
                        isDarkMode ? module.color : module.lightColor
                      }`} />
                      
                      <div className="relative p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {module.name}
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                              {module.value === '0' ? (
                                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" />
                              ) : (
                                module.value
                              )}
                            </h3>
                          </div>
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${
                            isDarkMode ? module.color : module.lightColor
                          }`}>
                            <module.icon className={`text-xl ${
                              isDarkMode ? 'text-white' : 'text-gray-800'
                            }`} />
                          </div>
                        </div>
                        
                       
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Recent Activity Section */}
              <motion.div
                variants={fadeInUp}
                className={`rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Recent Activities</h3>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Last 3 Tasks
                  </div>
                </div>

                {recentTasks.length > 0 ? (
                  <div className="space-y-6">
                    {recentTasks.map((task, index) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-5 rounded-xl ${
                          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        } transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1`}
                      >
                        {/* Colored status indicator line */}
                        <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
                          task.status === 'Completed' ? 'bg-green-500' :
                          task.status === 'In Progress' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`} />

                        <div className="ml-3">
                          {/* Task Header */}
                          <div className="flex justify-between items-start mb-3">
                            <h4 className={`font-semibold text-lg ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {task.title}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === 'Completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              task.status === 'In Progress' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}>
                              {task.status}
                            </span>
                          </div>

                          {/* Task Description */}
                          <p className={`text-sm mb-4 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {task.description?.slice(0, 150)}
                            {task.description?.length > 150 ? '...' : ''}
                          </p>

                          {/* Task Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Date */}
                              <div className={`flex items-center text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <svg 
                                  className="w-4 h-4 mr-1" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                  />
                                </svg>
                                {new Date(task.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>

                              {/* Priority if available */}
                              {task.priority && (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  task.priority === 'High' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                  task.priority === 'Medium'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                  {task.priority} Priority
                                </span>
                              )}
                            </div>

                            
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center py-12 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <svg 
                      className="w-16 h-16 mb-4 opacity-50" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                      />
                    </svg>
                    <p className="text-lg font-medium">No recent tasks available</p>
                    <p className="text-sm mt-2">New tasks will appear here when created</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'Clients' && (
            <CustomersTab isDarkMode={isDarkMode} />
          )}

          {activeTab === 'Team' && (
            <TeamTabs isDarkMode={isDarkMode} />
          )}

          {activeTab === 'Tasks' && (
            <TaskTab isDarkMode={isDarkMode} />
          )}

          {activeTab === 'Recruitment' && (
            <RecruitmentTab isDarkMode={isDarkMode} />
          )}

          {activeTab === 'Onboarding' && (
            <OnboardingTab isDarkMode={isDarkMode} />
          )}
        </main>
      </div>
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            ref={profileModalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Profile Details
              </h2>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Profile Section */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Profile Image Column */}
              <div className="col-span-1 flex flex-col items-center space-y-4">
                {profileImageUrl ? (
                  <div className="relative">
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-purple-300">
                    {userProfile.initials}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                  className="hidden"
                  id="profile-image-input"
                />
                <label
                  htmlFor="profile-image-input"
                  className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Choose Image
                </label>
                {profileImage && (
                  <button
                    onClick={async () => {
                      try {
                        setUploadStatus('Uploading...');
                        const token = localStorage.getItem('token');
                        const decoded = jwtDecode(token);
                        const response = await uploadAdminProfileImage(profileImage, decoded.id);
                        
                        if (response.success) {
                          setProfileImageUrl(response.imageUrl);
                          setUploadStatus('Image uploaded successfully');
                          setProfileImage(null);
                          const fileInput = document.getElementById('profile-image-input');
                          if (fileInput) fileInput.value = '';
                        }
                      } catch (error) {
                        setUploadStatus(error.message || 'Upload failed');
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm"
                  >
                    Upload Image
                  </button>
                )}
                {uploadStatus && (
                  <p className={`text-sm ${
                    uploadStatus.includes('success')
                      ? 'text-green-500'
                      : uploadStatus === 'Uploading...'
                      ? 'text-blue-500'
                      : 'text-red-500'
                  }`}>
                    {uploadStatus}
                  </p>
                )}
              </div>

              {/* Password Change Column */}
              <div className="col-span-2">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Change Password
                </h3>
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={updateFormData.currentPassword}
                      onChange={(e) => setUpdateFormData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      className={`col-span-2 p-2 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={updateFormData.newPassword}
                      onChange={(e) => setUpdateFormData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      className={`col-span-2 p-2 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={updateFormData.confirmPassword}
                      onChange={(e) => setUpdateFormData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className={`col-span-2 p-2 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  {updateError && (
                    <p className="text-red-500 text-sm">{updateError}</p>
                  )}
                  
                  {updateSuccess && (
                    <p className="text-green-500 text-sm">{updateSuccess}</p>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(false)}
                      className={`px-4 py-2 rounded-full ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    
  );
  
};

export default Dashboard;










  