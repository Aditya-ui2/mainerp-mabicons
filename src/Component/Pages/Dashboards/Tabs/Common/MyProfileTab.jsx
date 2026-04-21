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
  FiChevronRight
} from 'react-icons/fi';
import { getMyProfile, updateMyProfile } from '../../../service/api';

const MyProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

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

  const infoList = [
    { icon: FiMail, label: 'Email Address', value: profile?.email, key: 'email' },
    { icon: FiPhone, label: 'Phone Number', value: profile?.phone || 'Not set', key: 'phone' },
    { icon: FiBriefcase, label: 'Department Name', value: profile?.department, key: 'department' },
    { icon: FiShield, label: 'Company Designation', value: profile?.role, key: 'role' },
    { icon: FiMapPin, label: 'Office Address', value: profile?.address || 'Not set', key: 'address' },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-8 font-jakarta">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold backdrop-blur-md bg-[#1A1A2E]/90"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-8 space-y-10">
          {/* Main Card */}
          <div className="bg-white rounded-[48px] border border-[#F4F3EF] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 lg:p-14 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
              <div className="relative">
                <div className="w-32 h-32 rounded-[40px] bg-[#1A1A2E] flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-slate-200 ring-8 ring-slate-50">
                  {profile?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-[#1A1A2E]">
                  <FiImage size={16} />
                </div>
              </div>
              <div className="text-center md:text-left pt-2">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1A1A2E] tracking-tight">{profile?.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                  <span className="px-4 py-1.5 rounded-full bg-slate-100 text-[#1A1A2E] text-[11px] font-bold uppercase tracking-widest">
                    {profile?.role}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-widest border border-emerald-100">
                    Active Status
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-[2px] w-8 bg-[#1A1A2E]" />
                <h2 className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-[4px]">Profile Specification</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {infoList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-8 bg-[#FAFAF8]/40 rounded-[32px] border border-[#F4F3EF] group hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-500">
                    <div className="flex items-center gap-8">
                      <div className="w-14 h-14 rounded-[22px] bg-white flex items-center justify-center text-[#1A1A2E] shadow-sm border border-[#F4F3EF] group-hover:scale-110 transition-transform">
                        <item.icon size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] mb-1.5 opacity-80">{item.label}</p>
                        {editing ? (
                          <input 
                            value={form[item.key]}
                            onChange={(e) => setForm({...form, [item.key]: e.target.value})}
                            className="text-[16px] font-semibold text-[#1A1A2E] bg-white px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-[#1A1A2E] w-full transition-all"
                          />
                        ) : (
                          <p className="text-[16px] font-semibold text-[#1A1A2E]">{item.value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Action Steps */}
        <div className="lg:col-span-4 self-start">
          <div className="sticky top-8 space-y-6">
            <h2 className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-[4px] pl-4 mb-6 opacity-80 text-left">Management Suite</h2>
            
            {/* Step 1: Edit Profile */}
            <motion.button
              whileHover={{ x: 8 }}
              onClick={() => editing ? handleSave() : setEditing(true)}
              className={`w-full group p-8 rounded-[40px] border-2 transition-all flex items-center justify-between shadow-sm h-auto ${
                editing ? 'bg-[#1A1A2E] border-[#1A1A2E] text-white shadow-xl shadow-slate-300' : 'bg-white border-[#F4F3EF] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 min-w-[56px] rounded-[22px] flex items-center justify-center transition-all ${
                  editing ? 'bg-white/10 text-white' : 'bg-slate-50 text-[#1A1A2E]'
                }`}>
                  {editing ? <FiSave size={22} /> : <FiEdit3 size={22} />}
                </div>
                <div className="text-left">
                  <p className={`text-[10px] font-bold uppercase tracking-[2px] mb-1 ${editing ? 'text-white/60' : 'text-[#9B9BAD]'}`}>Action 01</p>
                  <p className="text-lg font-bold">Update Identity</p>
                </div>
              </div>
              <FiChevronRight size={20} className={`transition-transform duration-500 ${editing ? 'rotate-90' : ''}`} />
            </motion.button>

            {/* Step 2: Change Password */}
            <motion.button
              whileHover={{ x: 8 }}
              className="w-full group p-8 bg-white border-2 border-[#F4F3EF] rounded-[40px] hover:border-slate-300 transition-all flex items-center justify-between h-auto shadow-sm"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 min-w-[56px] rounded-[22px] bg-slate-50 text-slate-700 flex items-center justify-center transition-all group-hover:bg-emerald-50 group-hover:text-emerald-600">
                  <FiLock size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] mb-1">Action 02</p>
                  <p className="text-lg font-bold text-[#1A1A2E]">Security Protocol</p>
                </div>
              </div>
              <FiChevronRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-all duration-500" />
            </motion.button>

            {/* Step 3: Platform Settings */}
            <motion.button
              whileHover={{ x: 8 }}
              className="w-full group p-8 bg-white border-2 border-[#F4F3EF] rounded-[40px] hover:border-slate-300 transition-all flex items-center justify-between h-auto shadow-sm"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 min-w-[56px] rounded-[22px] bg-slate-50 text-slate-700 flex items-center justify-center transition-all group-hover:bg-amber-50 group-hover:text-amber-600">
                  <FiZap size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] mb-1">Action 03</p>
                  <p className="text-lg font-bold text-[#1A1A2E]">Efficiency Core</p>
                </div>
              </div>
              <FiChevronRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-all duration-500" />
            </motion.button>

            {editing && (
              <button 
                onClick={() => setEditing(false)}
                className="w-full py-6 text-[11px] font-bold uppercase tracking-[3px] text-slate-400 hover:text-rose-500 transition-all text-center"
              >
                Discard Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileTab;
