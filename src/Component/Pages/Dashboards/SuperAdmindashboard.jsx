import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { FiHome, FiUsers, FiBarChart2, FiCheckSquare, FiPieChart, FiSettings, FiSearch, FiBell, FiSun, FiMoon, FiUserPlus, FiFolder, FiDollarSign, FiTrendingUp, FiTarget, FiPhoneCall } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useSpring, animated } from 'react-spring';
import CustomersTab from './Tabs/CustomersTab';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import AdminTab from './Tabs/AdminTab';
import BdTab from './Tabs/BdTab';
import { createAdmin, createBDExecutive } from '../service/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const modules = [
  { name: 'Total Customers', icon: FiUsers, value: '0', change: '0%' },
  { name: 'Team Members', icon: FiUserPlus, value: '0', change: '0%' },
  { name: 'Active Projects', icon: FiFolder, value: '0', change: '0%' },
  { name: 'Tasks Completed', icon: FiCheckSquare, value: '0', change: '0%' },
];

const sidebarItems = [
  { name: 'Dashboard', icon: FiHome },
  { name: 'Customers', icon: FiUsers },
  { name: 'Manage Admins', icon: FiUserPlus },
  { name: 'Business Development', icon: FiTrendingUp },
];

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [isCreateBDModalOpen, setIsCreateBDModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
  });
  const [newBDData, setNewBDData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    targetRevenue: '',
    targetLeads: ''
  });
  const [createAdminError, setCreateAdminError] = useState(null);
  const [createAdminSuccess, setCreateAdminSuccess] = useState(false);
  const [createBDError, setCreateBDError] = useState(null);
  const [createBDSuccess, setCreateBDSuccess] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 19000, 15000, 22000, 18000, 25000],
        borderColor: isDarkMode ? '#fff' : '#000',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: isDarkMode ? '#333' : '#e0e0e0',
        },
      },
    },
  };

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

  const generateSpringProps = (idx) => {
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    
    const springConfig = {
      from: { transform: `translate(${randomX}vw, ${randomY}vh)` },
      to: async (next) => {
        while (true) {
          await next({ transform: `translate(${randomX + 5}vw, ${randomY + 5}vh)` });
          await next({ transform: `translate(${randomX}vw, ${randomY}vh)` });
        }
      },
      config: { duration: 20000 + idx * 2000 },
    };
    
    return useSpring(springConfig);
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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateAdminError(null);
    setCreateAdminSuccess(false);

    try {
      await createAdmin(newAdminData);
      setCreateAdminSuccess(true);
      setNewAdminData({ name: '', email: '' });
      setTimeout(() => {
        setIsCreateAdminModalOpen(false);
        setCreateAdminSuccess(false);
      }, 2000);
    } catch (error) {
      setCreateAdminError(error.message);
    }
  };

  const handleCreateBDExecutive = async (e) => {
    e.preventDefault();
    setCreateBDError(null);
    setCreateBDSuccess(false);

    try {
      await createBDExecutive(newBDData);
      setCreateBDSuccess(true);
      setIsCreateBDModalOpen(false);
      setNewBDData({
        name: '',
        email: '',
        password: '',
        phone: '',
        targetRevenue: '',
        targetLeads: ''
      });
    } catch (error) {
      setCreateBDError(error.message || 'Failed to create BD executive');
    }
  };

  const handleBDInputChange = (e) => {
    const { name, value } = e.target;
    setNewBDData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const quickActions = [
    {
      name: 'Add Customer',
      icon: FiUsers,
      action: () => console.log('Add Customer clicked')
    },
    {
      name: 'Create Admin',
      icon: FiUserPlus,
      action: () => setIsCreateAdminModalOpen(true)
    },
    {
      name: 'Create BD User',
      icon: FiTrendingUp,
      action: () => handleTabChange('Business Development')
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <motion.div 
            className="p-8"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {/* Modules */}
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={staggerChildren}>
              <AnimatePresence>
                {modules.map((module) => (
                  <motion.div
                    key={module.name}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } p-6 rounded-xl shadow-lg cursor-pointer ${
                      activeModule.name === module.name ? 'ring-2 ring-gray-500' : ''
                    }`}
                    onClick={() => setActiveModule(module)}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{module.name}</h3>
                      <module.icon className="text-2xl" style={{ color: module.color }} />
                    </div>
                    <p className="text-3xl font-bold mb-2">{module.value}</p>
                    <p className={`text-sm ${module.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {module.change}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Chart */}
            <motion.div
              variants={fadeInUp}
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}
            >
              <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
              <Line data={chartData} options={chartOptions} />
            </motion.div>

            {/* Recent Activities and Quick Actions */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" variants={staggerChildren}>
              {/* Recent Activities */}
              <motion.div
                variants={fadeInUp}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}
              >
                <h3 className="text-xl font-semibold mb-4">Recent Activities</h3>
                <ul className="space-y-4">
                  <li className="text-center text-gray-500">No recent activities</li>
                </ul>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                variants={fadeInUp}
                className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 rounded-xl shadow-lg`}
              >
                <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={staggerChildren}>
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.name}
                      variants={fadeInUp}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full py-4 px-6 ${
                        isDarkMode 
                          ? 'bg-white text-black hover:bg-gray-200' 
                          : 'bg-black text-white hover:bg-gray-800'
                      } rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md`}
                      onClick={action.action}
                    >
                      <action.icon className="mr-3 text-xl" />
                      <span className="text-lg font-medium">{action.name}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        );
      case 'Customers':
        return <CustomersTab isDarkMode={isDarkMode} />;
      case 'Manage Admins':
        return <AdminTab isDarkMode={isDarkMode} />;
      case 'Business Development':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Business Development</h2>
              <button
                onClick={() => setIsCreateBDModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <FiUserPlus className="h-5 w-5" />
                Add BD Executive
              </button>
            </div>
            <BdTab />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
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
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 ml-64">
          {/* Sticky Top bar */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-sm`}
          >
            <div className="flex justify-between items-center p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className={`pl-10 pr-4 py-2 rounded-full ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  {isDarkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-600" />}
                </button>
                <button className={`p-2 rounded-full ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                }`}>
                  <FiBell />
                </button>
                <button className={`p-2 rounded-full ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                }`}>
                  <FiSettings />
                </button>
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  RC
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard content */}
          {renderContent()}
        </main>
      </div>

      {/* Create Admin Modal */}
      {isCreateAdminModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-lg p-6 w-full max-w-md mx-4 shadow-xl`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create New Admin</h2>
              <button
                onClick={() => setIsCreateAdminModalOpen(false)}
                className={`p-2 rounded-full ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <input
                  type="password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Role
                </label>
                <select
                  value={newAdminData.role}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, role: e.target.value }))}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {createAdminError && (
                <div className="text-red-500 text-sm mt-2">
                  {createAdminError}
                </div>
              )}

              {createAdminSuccess && (
                <div className="text-green-500 text-sm mt-2">
                  Admin created successfully!
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminModalOpen(false)}
                  className={`px-4 py-2 rounded ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </motion.div>
        </div>  
      )}

      {/* Create BD Executive Modal */}
      <AnimatePresence>
        {isCreateBDModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Create BD Executive</h2>
              <form onSubmit={handleCreateBDExecutive} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newBDData.name}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newBDData.email}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={newBDData.password}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newBDData.phone}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Revenue</label>
                  <input
                    type="number"
                    name="targetRevenue"
                    value={newBDData.targetRevenue}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Leads</label>
                  <input
                    type="number"
                    name="targetLeads"
                    value={newBDData.targetLeads}
                    onChange={handleBDInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                {createBDError && (
                  <p className="text-red-500 text-sm mt-2">{createBDError}</p>
                )}

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateBDModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create BD Executive
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
