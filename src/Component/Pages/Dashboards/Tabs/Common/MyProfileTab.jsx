import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiEdit3, FiSave, FiX, FiMapPin, FiCalendar, FiShield } from 'react-icons/fi';
import { getMyProfile, updateMyProfile } from '../../service/api';

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
      const res = await getMyProfile();
      setProfile(res.data);
      setForm({
        phone: res.data.phone || '',
        address: res.data.address || '',
        emergencyContact: res.data.emergencyContact || '',
      });
    } catch (err) {
      showToast(err.message || 'Failed to load profile', 'error');
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
    { icon: FiMail, label: 'Email', value: profile?.email, color: '#3b82f6' },
    { icon: FiPhone, label: 'Phone', value: profile?.phone || 'Not set', color: '#10b981' },
    { icon: FiBriefcase, label: 'Department', value: profile?.department, color: '#8b5cf6' },
    { icon: FiShield, label: 'Role', value: profile?.role, color: '#f59e0b' },
    { icon: FiMapPin, label: 'Address', value: profile?.address || 'Not set', color: '#ef4444' },
    { icon: FiCalendar, label: 'Joined', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A', color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium"
            style={{ background: toast.type === 'error' ? '#ef4444' : '#10b981' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden shadow-sm border border-gray-100"
      >
        <div className="h-32" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }} />
        <div className="bg-white px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 pt-2">
              <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
              <p className="text-gray-500">{profile?.role} • {profile?.department}</p>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-all hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <FiEdit3 style={{ width: '16px', height: '16px' }} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium"
                  style={{ background: '#10b981' }}
                >
                  <FiSave style={{ width: '16px', height: '16px' }} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium"
                >
                  <FiX style={{ width: '16px', height: '16px' }} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {infoItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ background: `${item.color}15` }}>
                <item.icon style={{ width: '20px', height: '20px', color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.label}</p>
                {editing && (item.label === 'Phone' || item.label === 'Address') ? (
                  <input
                    type="text"
                    value={item.label === 'Phone' ? form.phone : form.address}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      [item.label === 'Phone' ? 'phone' : 'address']: e.target.value
                    }))}
                    className="mt-1 w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Contact */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Emergency Contact</label>
          <input
            type="text"
            value={form.emergencyContact}
            onChange={(e) => setForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
            className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter emergency contact number"
          />
        </motion.div>
      )}
    </div>
  );
};

export default MyProfileTab;
