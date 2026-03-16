import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import logo from '../../../../public/ERP LOGO.png';
import RecruitmentTab from './Tabs/RecruitmentTab';
import OnboardingTab from './Tabs/OnboardingTab'; // Add this import

import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiCheckSquare,
  FiPieChart,
  FiSettings,
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiUserPlus,
  FiFolder,
  FiMessageSquare,
  FiInbox,
  FiTrendingUp,
  FiLogOut, // Import the Logout icon
  FiBriefcase, // Add this import

} from "react-icons/fi";
import { useSpring, animated } from "react-spring";
import CustomersTab from "./Tabs/CustomersTab";
import TeamTabs from "./Tabs/Teamtabs";
import TaskTab from "./Tabs/TaskTab";
import MessagesTab from "./Tabs/MessagesTab"; 
import RequestsTab from "./Tabs/RequestsTab";
import {
  getClientsForTeamLeader,
  getAllNotifications,
  markNotificationRead,
  deleteNotification,
} from "../../../Component/Pages/service/api"; // Import the API function
import { jwtDecode } from "jwt-decode"; // Corrected import for jwtDecode
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const modules = [
  { name: "Team Performance", icon: FiUsers, value: "92%", change: "+5.2%" },
  { name: "Active Members", icon: FiUserPlus, value: "42", change: "+2.4%" },
  { name: "Pending Tasks", icon: FiCheckSquare, value: "18", change: "-3.1%" },
  {
    name: "Team Efficiency",
    icon: FiTrendingUp,
    value: "87%",
    change: "+7.8%",
  },
];

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [assignedClients, setAssignedClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [recruitmentRequests, setRecruitmentRequests] = useState([]);

  
  const navigate = useNavigate(); // Initialize the navigate function

  const sidebarItems = [
    { name: "Dashboard", icon: FiHome },
    { name: "Team", icon: FiUserPlus },
    { name: "Tasks", icon: FiCheckSquare },
    { name: "Messages", icon: FiMessageSquare },
    { name: "Requests", icon: FiInbox, count: requestCount },
    { name: "Recruitment", icon: FiBriefcase }, // Add this line
    { name: "Onboarding", icon: FiBriefcase }, // Add this line
  ];

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = () => {
    // Clear the authentication token
    localStorage.removeItem("token");
    // Redirect to the login page
    navigate("/login"); // Adjust the path based on your routing
  };

  const fetchRequestCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const response = await getClientRequestedTasks(decoded.id);
      const pendingRequests = response.requestedTasks?.filter(
        task => task.status === 'Requested'
      ).length || 0;
      setRequestCount(pendingRequests);
    } catch (error) {
      console.error('Error fetching request count:', error);
    }
  }, []);

  useEffect(() => {
    // Fetch initially
    fetchRequestCount();

    // Set up 15-minute interval
    const interval = setInterval(fetchRequestCount, 15 * 60 * 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [fetchRequestCount]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const response = await getAllNotifications(userId);
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
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
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, status: "read" }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  }, []);

  const particlesOptions = {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: isDarkMode ? "#ffffff" : "#000000",
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000",
        },
        polygon: {
          nb_sides: 5,
        },
      },
      opacity: {
        value: 0.5,
        random: false,
        anim: {
          enable: false,
          speed: 1,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          size_min: 0.1,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: isDarkMode ? "#ffffff" : "#000000",
        opacity: 0.4,
        width: 1,
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
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse",
        },
        onclick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 400,
          line_linked: {
            opacity: 1,
          },
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 8,
          speed: 3,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          particles_nb: 4,
        },
        remove: {
          particles_nb: 2,
        },
      },
    },
    retina_detect: true,
  };

  const generateSpringProps = (index) => {
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    return useSpring({
      from: { transform: `translate(${randomX}vw, ${randomY}vh)` },
      to: async (next) => {
        while (true) {
          await next({
            transform: `translate(${randomX + 5}vw, ${randomY + 5}vh)`,
          });
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
          position: "fixed",
          width: `${20 + index * 10}px`,
          height: `${20 + index * 10}px`,
          borderRadius: "50%",
          backgroundColor: isDarkMode
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(0, 0, 0, 0.03)",
          ...springProps,
        }}
      />
    );
  });

  const handleTabChange = (tabName) => {
    setActiveSidebarItem(tabName);
    setActiveTab(tabName);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const decoded = jwtDecode(token);
        const teamLeaderId = decoded.id;

        const response = await getClientsForTeamLeader({ teamLeaderId });
        console.log("Fetched clients:", response.clients);

        setAssignedClients(response.clients || []);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
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
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className={`w-64 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-100"
          } h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col justify-between`}
        >
          <div>
            <div className="flex justify-center items-center">
              <img src="http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png" alt="Logo" className="w-24 mt-4" />
            </div>
            <nav className="mt-8">
              {sidebarItems.map((item) => (
                <a
                  key={item.name}
                  href="#"
                  onClick={() => handleTabChange(item.name)}
                  className={`flex items-center px-6 py-4 ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-600 hover:bg-gray-200"
                  } transition-colors duration-200 ${
                    activeSidebarItem === item.name
                      ? isDarkMode
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-black"
                      : ""
                  }`}
                >
                  <item.icon
                    className={`mr-4 text-xl ${
                      activeSidebarItem === item.name
                        ? "text-purple-500"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                  {item.count > 0 && (
                    <span className="ml-auto bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="px-6 py-4">
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-2 rounded-lg ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-200"
              } transition-colors duration-200`}
            >
              <FiLogOut
                className={`mr-4 text-xl ${
                  "text-gray-500"
                }`}
              />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 ml-64">
          {/* Sticky Top bar */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className={`sticky top-0 z-50 ${
              isDarkMode ? "bg-gray-900" : "bg-gray-100"
            } shadow-sm`}
          >
            <div className="flex justify-between items-center p-4">
              <div className="relative">
                {/* You can add search or other elements here */}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {isDarkMode ? (
                    <FiSun className="text-yellow-400" />
                  ) : (
                    <FiMoon className="text-gray-600" />
                  )}
                </button>
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FiBell />
                </button>
              
                <button
                  className={`p-2 rounded-full ${
                    isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                  }`}
                >
                  <FiSettings />
                </button>
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  RC
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard content */}
          {activeTab === "Dashboard" && (
            <motion.div
              className="p-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              <motion.div
                variants={fadeInUp}
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } p-8 rounded-2xl shadow-lg`}
              >
                <div className="flex justify-between items-center mb-8">
                  <h3
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    My Assigned Clients
                  </h3>
                  <span className="text-purple-500 font-medium">
                    Total: {assignedClients.length}
                  </span>
                </div>

                {showNotifications && (
                  <div className="absolute top-0 right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Notifications
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 rounded-full">
                          {
                            notifications.filter((n) => n.status === "unread")
                              .length
                          }{" "}
                          New
                        </span>
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <FiBell className="w-12 h-12 text-gray-400" />
                          <p className="mt-2 text-gray-500">
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                          {notifications.map((notification) => (
                            <li
                              key={notification._id}
                              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                                notification.status === "unread"
                                  ? "bg-blue-50/50 dark:bg-blue-900/10"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium ${
                                      isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {notification.message}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        notification.createdAt
                                      ).toLocaleString()}
                                    </span>
                                    {notification.status === "unread" && (
                                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {notification.status === "unread" && (
                                    <button
                                      onClick={() =>
                                        handleMarkAsRead(notification._id)
                                      }
                                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    >
                                      Mark as Read
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleDeleteNotification(notification._id)
                                    }
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

                {isLoading ? (
                  <p>Loading clients...</p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 text-gray-500 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium">Client Name</div>
                      <div className="text-center text-sm font-medium">
                        Status
                      </div>
                      <div className="text-right text-sm font-medium">
                        Last Contact
                      </div>
                    </div>

                    {assignedClients.map((client, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-3 py-6 border-b ${
                          isDarkMode
                            ? "border-gray-700 hover:bg-gray-700/50"
                            : "border-gray-100 hover:bg-gray-50"
                        } rounded-lg transition-all duration-300`}
                      >
                        <div
                          className={`font-medium pl-4 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {client.name}
                        </div>
                        <div className="flex justify-center">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                              client.status === "Accepted"
                                ? isDarkMode
                                  ? "bg-green-400/10 text-green-400 ring-1 ring-green-400/20"
                                  : "bg-green-100 text-green-700 ring-1 ring-green-200"
                                : isDarkMode
                                ? "bg-red-400/10 text-red-400 ring-1 ring-red-400/20"
                                : "bg-red-100 text-red-700 ring-1 ring-red-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                client.status === "Accepted"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {client.status}
                          </span>
                        </div>
                        <div
                          className={`text-right pr-4 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {new Date(client.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "Customers" && (
            <CustomersTab isDarkMode={isDarkMode} />
          )}

          {activeTab === "Team" && <TeamTabs isDarkMode={isDarkMode} />}

          {activeTab === "Tasks" && <TaskTab isDarkMode={isDarkMode} />}

          {activeTab === "Messages" && <MessagesTab isDarkMode={isDarkMode} />}

          {activeTab === "Requests" && <RequestsTab isDarkMode={isDarkMode} />}

          {activeTab === "Recruitment" && <RecruitmentTab isDarkMode={isDarkMode} />} {/* Add this line */}
          {activeTab === "Onboarding" && <OnboardingTab isDarkMode={isDarkMode} />}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;