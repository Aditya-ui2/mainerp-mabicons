import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { FiHome, FiUsers, FiBarChart2, FiCheckSquare, FiPieChart, FiSettings, FiSearch, FiBell, FiSun, FiMoon, FiUserPlus, FiFolder, FiMessageSquare, FiInbox, FiTrendingUp, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import { useSpring, animated } from 'react-spring';
import TaskTab from './Tabs/TaskTab';
import { getEmployeeTasks, getAllNotifications, markNotificationRead, deleteNotification } from '../service/api';
import { jwtDecode } from 'jwt-decode';
import { updateEmployee } from '../service/api';
import OnboardingTab from './Tabs/OnboardingTab'; // Add this import

const modules = [
  { name: 'Team Performance', icon: FiUsers, value: '92%', change: '+5.2%' },
  { name: 'Active Members', icon: FiUserPlus, value: '42', change: '+2.4%' },
  { name: 'Pending Tasks', icon: FiCheckSquare, value: '18', change: '-3.1%' },
  { name: 'Team Efficiency', icon: FiTrendingUp, value: '87%', change: '+7.8%' },
];

const sidebarItems = [
  { name: 'Dashboard', icon: FiHome },
  { name: 'My Tasks', icon: FiCheckSquare },
  { name: 'Onboarding', icon: FiUserPlus },
];

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null); // Initialize profileImageUrl state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Safe token decoding with error handling
  let token = localStorage.getItem('token');
  let decoded = null;
  let employeeId = null;
  try {
    if (token) {
      decoded = jwtDecode(token);
      employeeId = decoded.id || 'mock-user-123';
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    employeeId = 'mock-user-123';
  }
  
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (updateFormData.newPassword !== updateFormData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    try {
      const result = await updateEmployee(employeeId, updateFormData.newPassword);
      console.log("Password changed successfully:", result);
      alert("Password changed successfully!");
      
      setUpdateFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password. Please try again.");
    }
  };
  const handleProfileImageUpload = async () => {
    if (!profileImage) {
      alert("Please select an image to upload.");
      return;
    }

    // Logic to upload the image goes here
    console.log("Uploading image:", profileImage);
    // Reset the profile image after upload
    setProfileImage(null);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const response = await getAllNotifications(userId);
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
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
      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  useEffect(() => {
    const fetchEmployeeTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const employeeId = decoded.id;
  
        const response = await getEmployeeTasks(employeeId);
        setTasks(response.tasks || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchEmployeeTasks();
  }, []);

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
    }
  };

  const handleTabChange = (tabName) => {
    setActiveSidebarItem(tabName);
    setActiveTab(tabName);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const renderTasks = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="text-center p-8 text-red-500">
          {error}
        </div>
      );
    }
  
    if (!tasks || tasks.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          No tasks found.
        </div>
      );
    }
  
    return tasks.map((task) => (
      <motion.div
        key={task._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        } rounded-xl p-6 transition-all duration-300 hover:shadow-md`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              {task.description}
            </p>
            {task.client && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                Client: {task.client.name}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            task.priority === 'High' 
              ? 'bg-red-100 text-red-600' 
              : task.priority === 'Medium'
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-green-100 text-green-600'
          }`}>
            {task.priority}
          </span>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`flex items-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } text-sm`}>
              <FiCheckSquare className="mr-2" />
              {task.status}
            </span>
            <span className={`flex items-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } text-sm`}>
              <FiCalendar className="mr-2" />
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    ));
  };

  const modalRef = useRef(null); // Create a ref for the modal

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsProfileModalOpen(false); // Close the modal if clicked outside
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex">
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className={`w-64 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 ease-in-out`}
        >
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>CRM Pro</h1>
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
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              Logout
            </button>
          </div>
        </motion.aside>

        <main className="flex-1 ml-64">
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-sm`}
          >
            <div className="flex justify-between items-center p-4">
              <div className="relative">
                
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700">
                  {isDarkMode ? <FiSun className="text-yellow-800" /> : <FiMoon className="text-gray-800" />}
                </button>
                <button
                  onClick={toggleNotifications}
                  className={`p-2 rounded-full ${
                    isDarkMode ? 'hover:bg-gray-200' : 'hover:bg-gray-200'
                  }`}
                >
                  <FiBell className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`} />
                </button>
                
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold" onClick={() => setIsProfileModalOpen(true)}>
                  p 
                </div>
              </div>
            </div>
          </motion.div>

          {showNotifications && (
            <div className="absolute top-0 right-0 mt-16 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
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
              <div className="max-h-[400px] overflow-y-auto">
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
                          notification.status === 'unread'
                            ? 'bg-blue-50/50 dark:bg-blue-900/10'
                            : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
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
          {isProfileModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div 
                ref={modalRef} // Attach the ref to the modal
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
                      <div className="w-32 h-32 rounded-full bg-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                        {/* Placeholder for initials or default text */}
                        {/* <span>No Image</span> */}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setProfileImage(e.target.files[0]);
                        setProfileImageUrl(URL.createObjectURL(e.target.files[0])); // Set the image URL for preview
                      }}
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
                        onClick={handleProfileImageUpload}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm"
                      >
                        Upload Image
                      </button>
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
          

          {activeTab === 'Dashboard' && (
            <motion.div className="p-8" variants={staggerChildren} initial="initial" animate="animate">
              <motion.div variants={fadeInUp} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-lg`}>
                <div className="flex justify-between items-center mb-8">
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    My Tasks
                  </h3>
                </div>

                <div className="grid gap-6">
                  {renderTasks()}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'My Tasks' && (
            <TaskTab isDarkMode={isDarkMode} />
          )}
          {activeTab === 'Onboarding' && (
            <OnboardingTab isDarkMode={isDarkMode} />
          )}
          
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
