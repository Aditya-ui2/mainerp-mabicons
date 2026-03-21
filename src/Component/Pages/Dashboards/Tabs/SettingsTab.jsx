import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMoon, FiSun, FiUser, FiLock, FiBell, FiGlobe, FiCamera, FiShield, FiClock, FiChevronDown, FiCheck } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

const SettingsTab = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Profile data
  const [profileData, setProfileData] = useState({
    fullName: 'Admin User',
    email: 'superadmin@crmpro.com',
    recoveryEmail: '',
    statusTag: 'Super Admin',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  });
  
  const [language, setLanguage] = useState('English (US)');
  const [timezone, setTimezone] = useState('(GMT-05:00) Eastern Time');
  
  // Recent activity (mock data that would come from API)
  const [recentActivity, setRecentActivity] = useState([
    { action: 'Updated Client Record', entity: 'client-id-123', datetime: new Date().toLocaleString(), status: 'Success' },
    { action: 'Created Admin', entity: 'admin-id-456', datetime: new Date().toLocaleString(), status: 'Success' },
  ]);

  useEffect(() => {
    // Load dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // Load profile data from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setProfileData(prev => ({
          ...prev,
          fullName: decoded.name || 'Admin User',
          email: decoded.email || 'superadmin@crmpro.com',
          createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
        }));
      } catch (e) {
        console.log('Error decoding token');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AA';
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setSaveMessage('');
    
    try {
      // Here you would call the API to save changes
      // await updateSuperAdmin(profileData);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      setSaveMessage('Changes saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    // Trigger password reset flow
    alert('Password reset email will be sent to your email address.');
  };

  const Toggle = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        enabled ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
          enabled ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <div className="text-center px-2">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-xs sm:text-base text-slate-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Section Header */}
      <div className="text-center">
        <h3 className="text-base sm:text-xl font-semibold text-slate-700">Profile</h3>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        
        {/* Identity & Security */}
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-slate-100 overflow-hidden">
          <h4 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Identity & Security</h4>
          <p className="text-[10px] sm:text-sm text-slate-500 mb-3 sm:mb-6">Update your contact details and credentials.</p>
          
          {/* Avatar */}
          <div className="flex flex-col items-center mb-3 sm:mb-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xl sm:text-3xl font-bold">
              {getInitials(profileData.fullName)}
            </div>
            <button className="mt-2 sm:mt-3 bg-indigo-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs flex items-center gap-1 hover:bg-indigo-700 transition-colors">
              <FiCamera className="text-xs sm:text-sm" />
              Upload
            </button>
          </div>
          
          {/* Form Fields */}
          <div className="space-y-2 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={profileData.email}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-slate-50 truncate"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1">Recovery Email</label>
              <input
                type="email"
                value={profileData.recoveryEmail}
                onChange={(e) => setProfileData(prev => ({ ...prev, recoveryEmail: e.target.value }))}
                placeholder="Recovery Email"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5">Login Security</label>
              <p className="text-[10px] sm:text-sm text-slate-500 break-words">Last Login: {new Date(profileData.lastLogin).toLocaleDateString()}</p>
            </div>
            
            <div>
              <button
                onClick={handlePasswordReset}
                className="w-full flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-[10px] sm:text-sm"
              >
                <FiLock className="flex-shrink-0 text-xs sm:text-sm" />
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* Role & Status */}
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-slate-100 overflow-hidden">
          <h4 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Role & Status</h4>
          <p className="text-[10px] sm:text-sm text-slate-500 mb-3 sm:mb-6">Your admin permissions overview.</p>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1">Status:</label>
              <span className="inline-block px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-sm font-medium">
                {profileData.statusTag}
              </span>
            </div>
            
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5">Created</label>
              <p className="text-[10px] sm:text-sm text-slate-500">{new Date(profileData.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Permissions</label>
              <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-sm text-slate-600">
                <li className="flex items-center gap-1.5 sm:gap-2">
                  <FiShield className="text-amber-500 flex-shrink-0 text-xs sm:text-sm" />
                  <span className="truncate">System Settings</span>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2">
                  <FiUser className="text-blue-500 flex-shrink-0 text-xs sm:text-sm" />
                  <span className="truncate">User Management</span>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2">
                  <FiBell className="text-green-500 flex-shrink-0 text-xs sm:text-sm" />
                  <span className="truncate">Client Access</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* My Preferences */}
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-slate-100 overflow-hidden">
          <h4 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Preferences</h4>
          <p className="text-[10px] sm:text-sm text-slate-500 mb-3 sm:mb-6">Customize your experience.</p>
          
          <div className="space-y-2 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1">Language</label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white pr-8"
                >
                  <option>English (US)</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>
                <FiChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm" />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1">Timezone</label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white pr-8"
                >
                  <option>Eastern Time</option>
                  <option>India (IST)</option>
                  <option>UTC</option>
                </select>
                <FiChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm" />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-3">Notifications</label>
              <div className="space-y-1.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-sm text-slate-600">Push</span>
                  <Toggle enabled={pushNotifications} onToggle={() => setPushNotifications(!pushNotifications)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-sm text-slate-600">Email</span>
                  <Toggle enabled={emailNotifications} onToggle={() => setEmailNotifications(!emailNotifications)} />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-3">Theme</label>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-sm text-slate-600 flex items-center gap-1 sm:gap-2">
                  {darkMode ? <FiMoon className="text-xs sm:text-sm" /> : <FiSun className="text-xs sm:text-sm" />}
                  Dark Mode
                </span>
                <Toggle enabled={darkMode} onToggle={toggleDarkMode} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-slate-100 overflow-hidden">
        <h4 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Recent Activity</h4>
        <p className="text-[10px] sm:text-sm text-slate-500 mb-3 sm:mb-4">Your last actions.</p>
        
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Entity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Datetime</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-700">{activity.action}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{activity.entity}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{activity.datetime}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      activity.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="sm:hidden space-y-2">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-2 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="text-[11px] font-medium text-slate-700 flex-1 truncate">{activity.action}</span>
                <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium ${
                  activity.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {activity.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{new Date(activity.datetime).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="flex justify-center pb-4 px-1">
        <button
          onClick={handleSaveChanges}
          disabled={loading}
          className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center justify-center gap-2 text-xs sm:text-base"
        >
          {loading ? (
            <>
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
      
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-2 px-4 rounded-lg ${
            saveMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {saveMessage}
        </motion.div>
      )}
    </div>
  );
};

export default SettingsTab;
