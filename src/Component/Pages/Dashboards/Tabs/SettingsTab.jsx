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
  FiActivity
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

const SettingsTab = () => {
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
  
  // Profile data synchronized with backend fields
  const [profileData, setProfileData] = useState({
    fullName: 'Sachin (HR Recruitment Head)',
    email: 'recruitment.mabicons@gmail.com',
    phone: '+91 9876543210',
    role: 'HR Recruitment Head',
    status: 'Active',
    joinDate: 'April 08, 2026',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Map token fields to profile data
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSaveMessage({ text: 'Profile updated successfully!', type: 'success' });
    setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';
  };

  return (
    <div className="min-h-screen pb-20 pt-4" style={{ fontFamily: "'Calibri', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-2 mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-[#1A1A2E] tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Account Settings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#9B9BAD] font-medium"
          >
            Manage your recruitment head profile and security credentials
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Identity Card */}
          <div className="md:col-span-5 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#1B4DA0]/5 to-[#6366F1]/5" />
              
              <div className="relative mt-4">
                <div className="w-28 h-28 rounded-[36px] bg-gradient-to-tr from-[#1B4DA0] to-[#6366F1] flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                  {getInitials(profileData.fullName)}
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-[#1B4DA0] hover:scale-110 transition-transform border border-gray-100">
                  <FiCamera size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-1">
                <h2 className="text-xl font-bold text-[#1A1A2E] font-syne">{profileData.fullName}</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{profileData.status}</span>
                </div>
              </div>

              <div className="w-full mt-8 pt-6 border-t border-gray-50 space-y-4">
                <div className="flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <FiShield size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest leading-none mb-1">Role Type</p>
                      <p className="text-sm font-bold text-[#1A1A2E]">{profileData.role}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <FiActivity size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest leading-none mb-1">Joined Date</p>
                      <p className="text-sm font-bold text-[#1A1A2E]">{profileData.joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Logout Action */}
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              className="w-full py-4 px-6 bg-white rounded-2xl border border-gray-100 text-rose-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors group"
            >
              <FiLogOut className="group-hover:-translate-x-1 transition-transform" />
              Sign Out from Account
            </motion.button>
          </div>

          {/* Right Side: Configuration Fields */}
          <div className="md:col-span-7 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 card-glow"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#F4F3EF] flex items-center justify-center text-[#1A1A2E]">
                  <FiUser size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Personal Information</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Legal Full Name</label>
                    <div className="relative group">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B4DA0] transition-colors" />
                      <input 
                        type="text" 
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/20 transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="email" 
                        value={profileData.email}
                        readOnly
                        className="w-full bg-[#F4F3EF]/50 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[#9B9BAD] cursor-not-allowed outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-[#9B9BAD] font-medium mt-1 ml-1">Login email cannot be changed for security</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Phone Number</label>
                    <div className="relative group">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B4DA0] transition-colors" />
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/20 transition-all outline-none"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 overflow-hidden relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <FiLock size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Security</h3>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#F4F3EF] rounded-2xl border border-dashed border-gray-200">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#1A1A2E]">Update Password</p>
                  <p className="text-xs text-[#9B9BAD] font-medium">Reset your credential frequently for better safety</p>
                </div>
                <button className="px-5 py-2.5 bg-white text-[#1A1A2E] font-bold text-xs rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2">
                  Reset Now <FiArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* Profile Action Bar */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button className="px-8 py-4 bg-transparent text-[#9B9BAD] font-bold text-sm hover:text-[#1A1A2E] transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                disabled={loading}
                className={`relative px-10 py-4 bg-[#1B4DA0] text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-[#153e82] transition-all flex items-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheckCircle size={18} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {saveMessage.text && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 ${
                saveMessage.type === 'success' ? 'bg-[#1A1A2E] text-white' : 'bg-rose-500 text-white'
              }`}
            >
              {saveMessage.type === 'success' && <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white"><FiCheckCircle size={14} /></div>}
              <span className="text-sm font-bold">{saveMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style jsx="true">{`
        .card-glow {
          position: relative;
        }
        .card-glow::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 32px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(27, 77, 160, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default SettingsTab;
