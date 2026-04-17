import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiEdit3, FiSave, FiX, FiMapPin, FiCalendar, FiShield, FiImage } from 'react-icons/fi';
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

      // Get fallback data from localStorage
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
            picture: mergedProfile.picture || localPicture,
            email: mergedProfile.email || '',
            role: mergedProfile.role || '',
            department: mergedProfile.department || '',
            phone: mergedProfile.phone || '',
            address: mergedProfile.address || '',
            emergencyContact: mergedProfile.emergencyContact || '',
          });
          return;
        }
      } catch (apiErr) {
        console.warn('Profile API failed, using local data:', apiErr);
      }

      // If API fails or returns no data, use local fallback
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
        picture: localPicture || '',
        email: localEmail || 'Email not set',
        role: localRole || 'Member',
        department: localDept || 'Department not set',
        phone: '',
        address: '',
        emergencyContact: '',
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

  const infoItems = [
    { icon: FiImage, label: 'Picture', value: profile?.picture },
    { icon: FiMail, label: 'Email', value: profile?.email },
    { icon: FiPhone, label: 'Phone', value: profile?.phone || 'Not set' },
    { icon: FiBriefcase, label: 'Department', value: profile?.department },
    { icon: FiShield, label: 'Role', value: profile?.role },
    { icon: FiMapPin, label: 'Address', value: profile?.address || 'Not set' },
    { icon: FiCalendar, label: 'Joined', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-8 right-8 z-[100] px-6 py-3 rounded-2xl shadow-xl text-white font-bold backdrop-blur-md"
            style={{ background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(13, 71, 161, 0.9)' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Minimalist Header */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="relative bg-white rounded-[40px] border border-[#F4F3EF] overflow-hidden"
      >
        <div className="h-32 bg-[#FAFAF8] border-b border-[#F4F3EF]" />
        <div className="px-10 pb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 -mt-16">
            <div className="relative group">
              <div className="w-36 h-36 rounded-3xl bg-white p-1.5 shadow-2xl shadow-slate-200">
                <div className="w-full h-full rounded-2xl bg-[#0D47A1] flex items-center justify-center text-white text-5xl font-black">
                  {profile?.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border border-[#F4F3EF] flex items-center justify-center text-[#0D47A1]">
                <FiShield size={18} />
              </div>
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight">{profile?.name}</h1>
                {!editing && <span className="px-3 py-1 rounded-full bg-[#0D47A1]/5 text-[#0D47A1] text-[10px] font-black uppercase tracking-[2px]">Active</span>}
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <FiShield size={14} className="text-[#0D47A1]" />
                  <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px]">{profile?.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiBriefcase size={14} className="text-[#0D47A1]" />
                  <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px]">{profile?.department}</span>
                </div>
              </div>
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="group flex items-center gap-2 px-8 py-4 bg-[#0D47A1] text-white rounded-2xl text-sm font-bold hover:bg-[#0a3a82] transition-all active:scale-95 shadow-lg shadow-[#0D47A1]/20"
              >
                <FiEdit3 className="group-hover:rotate-12 transition-transform" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-4 bg-[#0D47A1] text-white rounded-2xl text-sm font-bold hover:bg-[#0a3a82] transition-all active:scale-95 shadow-lg shadow-[#0D47A1]/20 disabled:opacity-50"
                >
                  <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 px-8 py-4 bg-[#FAFAF8] text-[#9B9BAD] rounded-2xl text-sm font-bold hover:text-[#1A1A2E] transition-all border border-[#F4F3EF]"
                >
                  <FiX /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Minimalist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infoItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group bg-white rounded-[32px] p-8 border border-[#F4F3EF] hover:border-[#0D47A1]/20 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500"
          >
            <item.icon className="w-5 h-5 text-[#0D47A1] mb-6 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">{item.label}</p>
              {editing && item.label !== 'Joined' ? (
                <input
                  type="text"
                  value={
                    item.label === 'Change Picture' ? form.profilePicture :
                      item.label === 'Email' ? form.email :
                        item.label === 'Phone' ? form.phone :
                          item.label === 'Department' ? form.department :
                            item.label === 'Role' ? form.role :
                              item.label === 'Address' ? form.address : item.value
                  }
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    [item.label.toLowerCase()]: e.target.value
                  }))}
                  className="mt-2 w-full px-4 py-2 bg-slate-50 border-b-2 border-[#0D47A1] rounded-t-xl text-base font-bold text-[#1A1A2E] outline-none transition-all placeholder:text-slate-200"
                />
              ) : (
                <h3 className="text-base font-bold text-[#1A1A2E] truncate">{item.value || `Set ${item.label}`}</h3>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Section */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[40px] p-10 border border-[#F4F3EF] shadow-sm"
        >
          <div className="max-w-md">
            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mb-4">Emergency Support</p>
            <div className="flex gap-4">
              <input
                type="text"
                value={form.emergencyContact}
                onChange={(e) => setForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                className="flex-1 px-6 py-4 bg-[#FAFAF8] border border-[#F4F3EF] rounded-2xl text-sm font-bold text-[#1A1A2E] focus:border-[#0D47A1] outline-none transition-all"
                placeholder="Emergency Contact Number"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MyProfileTab;
