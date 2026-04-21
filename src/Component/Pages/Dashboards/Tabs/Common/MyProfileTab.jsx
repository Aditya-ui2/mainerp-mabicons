import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiEdit3,
  FiSave,
  FiX,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiImage,
  FiLock,
  FiZap,
  FiChevronRight,
  FiFileText,
  FiActivity,
  FiSettings,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiUnlock
} from 'react-icons/fi';
import { getMyProfile, updateMyProfile } from '../../../service/api';

const MyProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const localPicture = localStorage.getItem('userPicture');
      const localName = localStorage.getItem('userName');
      const localEmail = localStorage.getItem('userEmail');
      const localRole = localStorage.getItem('userType');
      const localDept = localStorage.getItem('department');

      try {
        const res = await getMyProfile();
        if (res && res.member) {
          const mergedProfile = {
            ...res.member,
            name: res.member.name || localName,
            picture: res.member.picture || localPicture,
            email: res.member.email || localEmail,
            role: res.member.role || localRole,
            department: res.member.department || localDept
          };
          setProfile(mergedProfile);
          setForm({
            name: mergedProfile.name || '',
            email: mergedProfile.email || '',
            role: mergedProfile.role || '',
            department: mergedProfile.department || '',
            phone: mergedProfile.phone || '',
            address: mergedProfile.address || '',
          });
          return;
        }
      } catch (apiErr) {
        console.warn('Profile API failed, using local data');
      }

      const fallbackProfile = {
        name: localName || 'User',
        picture: localPicture || '',
        email: localEmail || 'Email not set',
        role: localRole || 'Member',
        department: localDept || 'Department not set',
        phone: '',
        address: '',
        createdAt: null
      };
      setProfile(fallbackProfile);
      setForm({
        name: localName || 'User',
        email: localEmail || 'Email not set',
        role: localRole || 'Member',
        department: localDept || 'Department not set',
        phone: '',
        address: '',
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateMyProfile(form);
      showToast('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100" />)}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiZap },
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'documents', label: 'Documents', icon: FiFileText },
    { id: 'activity', label: 'Activity', icon: FiActivity },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  const infoList = [
    { icon: FiMail, label: 'Email Address', value: profile?.email, key: 'email', type: 'text' },
    { icon: FiPhone, label: 'Phone Number', value: profile?.phone || 'Not set', key: 'phone', type: 'tel' },
    { icon: FiBriefcase, label: 'Department Name', value: profile?.department, key: 'department', type: 'text' },
    { icon: FiShield, label: 'Company Designation', value: profile?.role, key: 'role', type: 'text' },
    { icon: FiMapPin, label: 'Office Address', value: profile?.address || 'Not set', key: 'address', type: 'text' },
  ];

  const renderOverview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {infoList.slice(0, 4).map((item, idx) => (
        <div key={idx} className="bg-white p-8 rounded-[32px] border border-[#F4F3EF] shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 group">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center group-hover:scale-110 transition-transform">
              <item.icon size={20} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] mb-1">{item.label}</p>
              <p className="text-sm font-bold text-[#1A1A2E]">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="md:col-span-2 bg-white p-8 rounded-[32px] border border-[#F4F3EF] shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 group">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center group-hover:scale-110 transition-transform">
            <FiMapPin size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] mb-1">Office Address</p>
            <p className="text-sm font-bold text-[#1A1A2E]">{infoList[4].value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderPersonalInfo = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between px-4">
        <h3 className="text-xl font-bold text-[#1A1A2E]">Profile Configuration</h3>
        <button 
          onClick={() => editing ? handleSave() : setEditing(true)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
            editing ? 'bg-[#1A1A2E] text-white shadow-xl shadow-blue-900/20' : 'bg-blue-50 text-[#1B4DA0] hover:bg-blue-100'
          }`}
        >
          {editing ? (saving ? <FiSave className="animate-spin text-white" /> : <FiSave size={14} />) : <FiEdit3 size={14} />}
          {editing ? (saving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-8 rounded-[32px] border border-[#F4F3EF] shadow-sm">
        {infoList.map((item, idx) => (
          <div key={idx} className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1">{item.label}</label>
            {editing ? (
              <input 
                type={item.type}
                value={form[item.key] || ''}
                onChange={(e) => setForm({...form, [item.key]: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-[#9B9BAD]/50"
              />
            ) : (
              <div className="w-full bg-white border border-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] opacity-70">
                {item.value}
              </div>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="flex justify-center">
          <button onClick={() => setEditing(false)} className="text-[11px] font-bold uppercase tracking-widest text-[#9B9BAD] hover:text-rose-500 transition-colors">Discard Alterations</button>
        </div>
      )}
    </motion.div>
  );

  const renderDocuments = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {[
        { name: 'Resume_Updated.pdf', size: '2.4 MB', date: '21 Apr 2024' },
        { name: 'Govt_ID_Proof.jpg', size: '1.1 MB', date: '10 Feb 2024' },
        { name: 'Degree_Certificate.pdf', size: '4.8 MB', date: '15 Jan 2024' },
      ].map((file, idx) => (
        <div key={idx} className="bg-white p-6 rounded-[24px] border border-[#F4F3EF] flex items-center justify-between group hover:border-[#1B4DA0]/30 transition-all">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
              <FiFileText size={20} />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-extrabold text-[#1A1A2E]">{file.name}</p>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-0.5">{file.size} • {file.date}</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm">
            <FiDownload size={16} />
          </button>
        </div>
      ))}
      <button className="w-full py-8 border-2 border-dashed border-[#F4F3EF] rounded-[32px] text-[#9B9BAD] text-[11px] font-bold uppercase tracking-[3px] hover:border-[#1B4DA0] hover:text-[#1B4DA0] hover:bg-blue-50/30 transition-all">
        + Upload New Asset
      </button>
    </motion.div>
  );

  const renderActivity = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-0 relative before:content-[''] before:absolute before:left-8 before:top-2 before:bottom-0 before:w-[2px] before:bg-blue-50"
    >
      {[
        { action: 'Updated Profile Information', time: '10 Minutes Ago', icon: FiEdit3, color: 'text-blue-500', bg: 'bg-blue-50' },
        { action: 'Logged into ERP Portal', time: '2 Hours Ago', icon: FiUnlock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { action: 'Downloaded Recruitment Report', time: 'Yesterday', icon: FiDownload, color: 'text-amber-500', bg: 'bg-amber-50' },
        { action: 'Session Started', time: '2 Days Ago', icon: FiClock, color: 'text-slate-500', bg: 'bg-slate-50' },
      ].map((log, idx) => (
        <div key={idx} className="relative pl-20 pb-10 group last:pb-0">
          <div className={`absolute left-[21px] w-6 h-6 rounded-full border-4 border-white shadow-sm ring-4 ring-blue-50 ${log.bg} ${log.color} flex items-center justify-center z-10 group-hover:scale-125 transition-transform`}>
            <log.icon size={10} />
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-[#F4F3EF] shadow-sm group-hover:shadow-md transition-all text-left">
            <p className="text-[13px] font-bold text-[#1A1A2E]">{log.action}</p>
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-1">{log.time}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white p-8 rounded-[32px] border border-[#F4F3EF] shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h4 className="text-sm font-bold text-[#1A1A2E]">Two-Factor Authentication</h4>
            <p className="text-[11px] text-[#9B9BAD] mt-1 font-medium">Extra security layer for your ERP account access.</p>
          </div>
          <div className="w-12 h-6 bg-emerald-500 rounded-full relative flex items-center px-1 cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
          </div>
        </div>
        <div className="border-t border-[#F4F3EF]" />
        <div className="space-y-4 text-left">
          <h4 className="text-sm font-bold text-[#1A1A2E]">Security Protocol</h4>
          <button className="flex items-center gap-3 px-6 py-3 bg-[#1A1A2E] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform active:scale-95">
            <FiLock size={14} /> Reset Password
          </button>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-[32px] border border-[#F4F3EF] shadow-sm space-y-6 text-left">
        <h4 className="text-sm font-bold text-rose-500 uppercase tracking-widest">Zone of Sensitivity</h4>
        <p className="text-[12px] text-[#9B9BAD] font-medium italic opacity-80">Deleting your account is permanent. This will erase all project data associated with your profile from the Mabicons ERP system.</p>
        <button className="text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:underline">Deactivate Account</button>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-8" style={{ fontFamily: "'Calibri', sans-serif" }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-white font-bold backdrop-blur-md bg-[#1A1A2E]/90 flex items-center gap-3"
          >
            <FiCheckCircle size={18} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[40px] border border-[#F4F3EF] shadow-[0_12px_40px_-15px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            {/* Card Header Background */}
            <div className="h-28 bg-[#1B4DA0]/5 relative overflow-hidden">
               <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-blue-100/30 rounded-full blur-3xl opacity-50" />
            </div>
            
            <div className="px-8 pb-10 -mt-14 relative z-10 flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-[#1A1A2E] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-[#1A1A2E]/30 ring-8 ring-white transition-transform group-hover:scale-105 duration-500">
                  {profile?.name?.charAt(0)?.toUpperCase()}
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1B4DA0] text-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center hover:scale-110 transition-transform">
                  <FiImage size={16} />
                </button>
              </div>

              <div className="text-center mt-8 space-y-1">
                <h2 className="text-3xl font-black text-[#1A1A2E] leading-tight">{profile?.name}</h2>
                <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[4px] opacity-70">{profile?.role}</p>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">Active Profile</span>
              </div>

              <div className="w-full mt-12 grid grid-cols-2 gap-4">
                <div className="bg-[#FAFAFA] p-5 rounded-[24px] border border-[#F4F3EF] text-center">
                  <p className="text-[18px] font-black text-[#1A1A2E]">94%</p>
                  <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-1">Efficiency</p>
                </div>
                <div className="bg-[#FAFAFA] p-5 rounded-[24px] border border-[#F4F3EF] text-center">
                  <p className="text-[18px] font-black text-[#1A1A2E]">2.4K</p>
                  <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-1">Logs</p>
                </div>
              </div>

              <button 
                onClick={() => { setActiveTab('personal'); setEditing(true); }}
                className="w-full mt-8 h-14 bg-[#1A1A2E] text-white rounded-[20px] text-[11px] font-black uppercase tracking-[3px] shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <FiEdit3 size={16} /> Edit My Identity
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Tabs & Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white p-2 rounded-[28px] border border-[#F4F3EF] shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] h-12 flex items-center justify-center gap-2.5 rounded-[20px] text-[11px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#1A1A2E] text-white shadow-xl shadow-[#1A1A2E]/20' 
                    : 'text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-slate-50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Section */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && <div key="overview">{renderOverview()}</div>}
              {activeTab === 'personal' && <div key="personal">{renderPersonalInfo()}</div>}
              {activeTab === 'documents' && <div key="documents">{renderDocuments()}</div>}
              {activeTab === 'activity' && <div key="activity">{renderActivity()}</div>}
              {activeTab === 'settings' && <div key="settings">{renderSettings()}</div>}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileTab;
