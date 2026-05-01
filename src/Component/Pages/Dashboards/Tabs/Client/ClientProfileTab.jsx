import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBriefcase, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiGlobe, 
  FiShield, 
  FiClipboard,
  FiFileText,
  FiUser,
  FiEdit3,
  FiSave,
  FiX,
  FiCamera
} from 'react-icons/fi';
import { getClientDetails, editClient, uploadClientProfileImage } from '../../../service/api';
import { jwtDecode } from 'jwt-decode';

const ClientProfileTab = ({ isDarkMode }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

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
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        const res = await getClientDetails(decoded.id);
        if (res?.data) {
          setProfile(res.data);
          setLogoPreview(res.data.profilePicture || res.data.logo || null);
          setForm({
            clientId: res.data._id,
            name: res.data.name || '',
            companyName: res.data.companyName || '',
            corporateAddress: res.data.corporateAddress || '',
            contactNumber: res.data.contactNumber || '',
            gstNumber: res.data.gstNumber || '',
            panNumber: res.data.panNumber || '',
            cinNumber: res.data.cinNumber || '',
            numberOfCompanies: res.data.numberOfCompanies || '',
            website: res.data.website || '',
            spocName: res.data.spocName || '',
            spocContact: res.data.spocContact || '',
            email: res.data.email || '',
            authorizedSignatory: {
              name: res.data.authorizedSignatory?.name || '',
              email: res.data.authorizedSignatory?.email || '',
              contact: res.data.authorizedSignatory?.contact || ''
            },
            ownerDirectorDetails: res.data.ownerDirectorDetails || []
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch client profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 1. Upload logo if changed
      if (logoFile) {
        await uploadClientProfileImage(logoFile, form.clientId);
      }

      // 2. Update other details
      await editClient(form);
      
      showToast('Profile updated successfully');
      setEditing(false);
      setLogoFile(null);
      fetchProfile();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-5xl mx-auto py-4">
        <div className="h-48 rounded-[40px] bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 rounded-[32px] bg-gray-100" />)}
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: "Corporate Identity",
      items: [
        { icon: FiBriefcase, label: 'Company Name', key: 'companyName', value: profile?.companyName },
        { icon: FiGlobe, label: 'Website', key: 'website', value: profile?.website || 'Not set' },
        { icon: FiMapPin, label: 'Corporate Address', key: 'corporateAddress', value: profile?.corporateAddress },
      ]
    },
    {
      title: "Statutory Information",
      items: [
        { icon: FiFileText, label: 'GST Number', key: 'gstNumber', value: profile?.gstNumber || 'N/A' },
        { icon: FiClipboard, label: 'PAN Number', key: 'panNumber', value: profile?.panNumber || 'N/A' },
        
      ]
    },
    {
      title: "Contact Person (SPOC)",
      items: [
        { icon: FiUser, label: 'SPOC Name', key: 'spocName', value: profile?.spocName },
        { icon: FiPhone, label: 'SPOC Contact', key: 'spocContact', value: profile?.spocContact },
        { icon: FiMail, label: 'Primary Email', key: 'email', value: profile?.email },
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      {/* Hidden File Input */}
      <input
        type="file"
        id="client-logo-input"
        className="hidden"
        accept="image/*"
        onChange={handleLogoChange}
      />

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

      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-[40px] border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF]'}`}
      >
        <div className={`h-32 ${isDarkMode ? 'bg-slate-800/50' : 'bg-[#FAFAF8]'} border-b ${isDarkMode ? 'border-slate-800' : 'border-[#F4F3EF]'}`} />
        <div className="px-10 pb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 -mt-16">
            <div className={`relative group ${editing ? 'cursor-pointer' : ''}`} onClick={() => editing && document.getElementById('client-logo-input').click()}>
              <div className={`w-36 h-36 rounded-3xl p-1.5 shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 shadow-none' : 'bg-white shadow-slate-200'}`}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-[#0D47A1] flex items-center justify-center text-white text-5xl font-black">
                    {(profile?.companyName || profile?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Camera Overlay */}
                {editing && (
                  <div className="absolute inset-1.5 rounded-2xl bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiCamera size={32} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                  {profile?.companyName || profile?.name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[2px]">Verified Client</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <FiMail size={14} className="text-[#0D47A1]" />
                  <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px]">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiBriefcase size={14} className="text-[#0D47A1]" />
                  <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Corporate Client</span>
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
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-[#FAFAF8] text-[#9B9BAD] border-[#F4F3EF]'}`}
                >
                  <FiX /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Grid Sections */}
      {sections.map((section, sidx) => (
        <div key={sidx} className="space-y-6">
          <h2 className={`text-xs font-black uppercase tracking-[4px] pl-2 ${isDarkMode ? 'text-slate-500' : 'text-[#9B9BAD]'}`}>
            {section.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (sidx * 3 + idx) * 0.05 }}
                className={`group rounded-[32px] p-8 border transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 hover:border-blue-500/30' 
                    : 'bg-white border-[#F4F3EF] hover:border-[#0D47A1]/20 hover:shadow-2xl hover:shadow-slate-100'
                }`}
              >
                <item.icon className="w-5 h-5 text-[#0D47A1] mb-6 opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">{item.label}</p>
                  {editing ? (
                    <input
                      type="text"
                      className={`w-full mt-2 bg-transparent border-b-2 border-[#0D47A1] py-1 text-sm font-bold outline-none ${isDarkMode ? 'text-slate-200' : 'text-[#1A1A2E]'}`}
                      value={form[item.key] || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, [item.key]: e.target.value }))}
                    />
                  ) : (
                    <h3 className={`text-sm font-bold truncate ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A2E]'}`}>
                      {item.value || 'Not Provided'}
                    </h3>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Authorized Signatory Info */}
      <div className="space-y-6">
        <h2 className={`text-xs font-black uppercase tracking-[4px] pl-2 ${isDarkMode ? 'text-slate-500' : 'text-[#9B9BAD]'}`}>
          Authorized Signatory
        </h2>
        <div className={`rounded-[40px] p-10 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#FAFAF8] border-[#F4F3EF]'} flex flex-col md:flex-row gap-10`}>
          <div className="flex-1 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0D47A1]/10 text-[#0D47A1] flex items-center justify-center font-black">
              {(form.authorizedSignatory?.name || 'S').charAt(0)}
            </div>
            <div className="text-left flex-1">
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Signatory Name</p>
              {editing ? (
                <input
                  type="text"
                  className={`w-full mt-1 bg-transparent border-b-2 border-[#0D47A1] py-1 text-sm font-bold outline-none ${isDarkMode ? 'text-slate-200' : 'text-[#1A1A2E]'}`}
                  value={form.authorizedSignatory?.name || ''}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    authorizedSignatory: { ...prev.authorizedSignatory, name: e.target.value } 
                  }))}
                />
              ) : (
                <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A2E]'}`}>{profile?.authorizedSignatory?.name || 'N/A'}</p>
              )}
            </div>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Signatory Email</p>
            {editing ? (
              <input
                type="email"
                className={`w-full mt-1 bg-transparent border-b-2 border-[#0D47A1] py-1 text-sm font-bold outline-none ${isDarkMode ? 'text-slate-200' : 'text-[#1A1A2E]'}`}
                value={form.authorizedSignatory?.email || ''}
                onChange={(e) => setForm(prev => ({ 
                  ...prev, 
                  authorizedSignatory: { ...prev.authorizedSignatory, email: e.target.value } 
                }))}
              />
            ) : (
              <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A2E]'}`}>{profile?.authorizedSignatory?.email || 'N/A'}</p>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Signatory Contact</p>
            {editing ? (
              <input
                type="text"
                className={`w-full mt-1 bg-transparent border-b-2 border-[#0D47A1] py-1 text-sm font-bold outline-none ${isDarkMode ? 'text-slate-200' : 'text-[#1A1A2E]'}`}
                value={form.authorizedSignatory?.contact || ''}
                onChange={(e) => setForm(prev => ({ 
                  ...prev, 
                  authorizedSignatory: { ...prev.authorizedSignatory, contact: e.target.value } 
                }))}
              />
            ) : (
              <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A2E]'}`}>{profile?.authorizedSignatory?.contact || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Note Section */}
    </div>
  );
};

export default ClientProfileTab;
