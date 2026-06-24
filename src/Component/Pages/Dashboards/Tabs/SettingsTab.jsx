import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiLock, 
  FiMail, 
  FiPhone, 
  FiShield, 
  FiCamera, 
  FiCheckCircle, 
  FiArrowRight,
  FiLogOut,
  FiActivity,
  FiBell,
  FiGlobe
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

const SettingsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
  
  const [profileData, setProfileData] = useState({
    fullName: 'Sachin (HR Recruitment Head)',
    email: 'recruitment.mabicons@gmail.com',
    phone: '+91 9876543210',
    role: 'HR Recruitment Head',
    status: 'Active',
    joinDate: 'April 08, 2026',
    location: 'Bangalore, India',
    timezone: 'UTC+5:30 (IST)'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setProfileData(prev => ({
          ...prev,
          fullName: decoded.name || prev.fullName,
          email: decoded.email || prev.email,
          role: decoded.role || decoded.userType || prev.role,
        }));
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);

  const handleSaveChanges = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSaveMessage({ text: 'Settings updated successfully!', type: 'success' });
    setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';
  };

  const tabs = [
    { id: 'profile', label: 'Personal Info', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notifications', label: 'Preferences', icon: FiBell },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ fontFamily: "'Calibri', sans-serif" }}>
      <div className="w-full px-2 lg:px-6 space-y-8">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#F4F3EF] pb-8">
          <div className="text-left">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-[#1A1A2E] tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Account Center
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[#9B9BAD] font-bold uppercase tracking-[0.2em] text-[10px] mt-2"
            >
              System Configuration & Identity Management
            </motion.p>
          </div>
          
          <div className="flex bg-[#F4F3EF] p-1 rounded-2xl border border-[#E8E7E2]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeSubTab === tab.id 
                  ? 'bg-white text-[#1B4DA0] shadow-sm' 
                  : 'text-[#9B9BAD] hover:text-[#1A1A2E]'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Left: Identity Sidebar */}
          <div className="md:col-span-4 space-y-6 text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] p-8 border border-[#F4F3EF] shadow-xl shadow-blue-900/[0.03] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1B4DA0] to-[#6366F1] opacity-[0.03] blur-3xl -mr-16 -mt-16" />
              
              <div className="relative flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[48px] bg-gradient-to-tr from-[#1B4DA0] to-[#6366F1] flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-white transition-transform duration-500 group-hover:rotate-6">
                    {getInitials(profileData.fullName)}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center text-[#1B4DA0] hover:scale-110 transition-all border border-[#F4F3EF]">
                    <FiCamera size={20} />
                  </button>
                </div>

                <div className="mt-8 text-center space-y-1">
                  <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne uppercase leading-tight">{profileData.fullName}</h2>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{profileData.status} Account</span>
                  </div>
                </div>

                <div className="w-full mt-10 space-y-4">
                  <div className="p-4 bg-[#F8FAFF] rounded-2xl border border-blue-50/50">
                    <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Administrative Role</p>
                    <p className="text-sm font-bold text-[#1B4DA0]">{profileData.role}</p>
                  </div>
                  <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#F4F3EF]">
                    <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">System Access Since</p>
                    <p className="text-sm font-bold text-[#1A1A2E]">{profileData.joinDate}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              className="w-full py-5 px-8 bg-rose-50 rounded-[32px] text-rose-500 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-rose-100 transition-all group border border-rose-100/50"
            >
              <FiLogOut className="group-hover:-translate-x-1 transition-transform" size={18} />
              Terminate Session
            </button>
          </div>

          {/* Right: Focused Content Area */}
          <div className="md:col-span-8">
            <AnimatePresence mode="wait">
              {activeSubTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[40px] p-10 border border-[#F4F3EF] shadow-xl shadow-blue-900/[0.03]"
                >
                  <div className="flex items-center gap-4 mb-10 text-left">
                    <div className="w-14 h-14 rounded-2xl bg-[#F4F3EF] flex items-center justify-center text-[#1A1A2E] shadow-inner">
                      <FiUser size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#1A1A2E] font-syne uppercase">Profile Details</h3>
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Identity & Global Contact Information</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                    <div className="space-y-2 sm:col-span-2">
                       <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] ml-1">Official Name</label>
                       <div className="relative group">
                         <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C5C5D2] group-focus-within:text-[#1B4DA0] transition-colors" />
                         <input 
                           type="text" 
                           value={profileData.fullName}
                           onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                           className="w-full bg-[#F4F3EF] border-none rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/10 transition-all outline-none"
                         />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] ml-1">Work Email</label>
                       <div className="relative">
                         <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C5C5D2]" />
                         <input 
                           type="email" 
                           value={profileData.email}
                           readOnly
                           className="w-full bg-[#F4F3EF]/50 border-none rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-[#9B9BAD] cursor-not-allowed outline-none"
                         />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] ml-1">Mobile Access</label>
                       <div className="relative group">
                         <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C5C5D2] group-focus-within:text-[#1B4DA0] transition-colors" />
                         <input 
                           type="tel" 
                           value={profileData.phone}
                           onChange={(e) => setProfileData({...profileData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                           className="w-full bg-[#F4F3EF] border-none rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/10 transition-all outline-none"
                         />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] ml-1">Primary Location</label>
                       <div className="relative group">
                         <FiGlobe className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C5C5D2] group-focus-within:text-[#1B4DA0] transition-colors" />
                         <input 
                           type="text" 
                           value={profileData.location}
                           onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                           className="w-full bg-[#F4F3EF] border-none rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/10 transition-all outline-none"
                         />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] ml-1">Timezone</label>
                       <div className="relative group">
                         <FiActivity className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C5C5D2] group-focus-within:text-[#1B4DA0] transition-colors" />
                         <input 
                           type="text" 
                           value={profileData.timezone}
                           onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                           className="w-full bg-[#F4F3EF] border-none rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/10 transition-all outline-none"
                         />
                       </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-12 gap-4">
                    <button className="px-8 py-4 text-[#9B9BAD] font-bold text-[11px] uppercase tracking-widest hover:text-[#1A1A2E] transition-all">Discard Changes</button>
                    <button 
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="px-10 py-4 bg-[#0D47A1] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-[#0a3a82] hover:scale-[1.02] transition-all flex items-center gap-3"
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheckCircle size={14} />}
                      Synchronize Profile
                    </button>
                  </div>
                </motion.div>
              )}

              {activeSubTab === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-[40px] p-10 border border-[#F4F3EF] shadow-xl shadow-blue-900/[0.03]">
                    <div className="flex items-center gap-4 mb-10 text-left">
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                        <FiLock size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[#1A1A2E] font-syne uppercase">Security Protocol</h3>
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Manage Credentials & Authentication Tiers</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-[#FAFAFA] rounded-3xl border border-[#F4F3EF] flex flex-col sm:flex-row items-center justify-between gap-6 text-left w-full">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#1A1A2E] shadow-sm border border-[#F4F3EF]">
                            <FiShield size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#1A1A2E] uppercase">Master Password</p>
                            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase mt-1">Last rotated 45 days ago</p>
                          </div>
                        </div>
                        <button className="whitespace-nowrap px-6 py-3 bg-white text-[#1A1A2E] font-black text-[10px] uppercase tracking-widest rounded-xl border border-[#F4F3EF] shadow-sm hover:bg-[#F4F3EF] hover:border-[#E8E7E2] transition-all flex items-center gap-2">
                          Update Key <FiArrowRight size={14} />
                        </button>
                      </div>

                      <div className="p-6 bg-[#FAFAFA] rounded-3xl border border-[#F4F3EF] flex flex-col sm:flex-row items-center justify-between gap-6 text-left w-full">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-[#F4F3EF]">
                            <FiCheckCircle size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#1A1A2E] uppercase">Two-Factor Authentication</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Active: Mobile Authenticator Attached</p>
                          </div>
                        </div>
                        <button className="whitespace-nowrap px-6 py-3 bg-white text-[#1A1A2E] font-black text-[10px] uppercase tracking-widest rounded-xl border border-[#F4F3EF] shadow-sm hover:bg-[#F4F3EF] hover:border-[#E8E7E2] transition-all">
                          Configure 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSubTab === 'notifications' && (
                <motion.div 
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[40px] p-10 border border-[#F4F3EF] shadow-xl shadow-blue-900/[0.03]"
                >
                  <div className="flex items-center gap-4 mb-10 text-left">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
                      <FiBell size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#1A1A2E] font-syne uppercase">System Preferences</h3>
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Alert Matrix & Interaction Protocols</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      { id: 'notify-email', label: 'Email Alerts', desc: 'Critical system updates & interview reminders', active: true },
                      { id: 'notify-browser', label: 'Browser Pulse', desc: 'Real-time pipeline status changes', active: true },
                      { id: 'notify-mobile', label: 'Mobile Sync', desc: 'Handover notifications & task alerts', active: false },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-6 bg-[#FAFAFA] rounded-3xl border border-[#F4F3EF] text-left">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-[#1A1A2E] uppercase leading-none">{item.label}</p>
                          <p className="text-[10px] font-bold text-[#9B9BAD] uppercase">{item.desc}</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${item.active ? 'bg-[#0D47A1]' : 'bg-[#E8E7E2]'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.active ? 'left-7' : 'left-1'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {saveMessage.text && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-5 bg-[#1A1A2E] text-white rounded-[24px] shadow-2xl flex items-center gap-4 z-50 border border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-emerald-500/20"><FiCheckCircle size={16} /></div>
              <span className="text-sm font-black uppercase tracking-widest">{saveMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsTab;
