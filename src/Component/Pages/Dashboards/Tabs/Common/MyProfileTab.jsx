import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
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
  FiUnlock,
  FiCheck,
  FiUploadCloud
} from 'react-icons/fi';
import { getMyProfile, updateMyProfile } from '../../../service/api';

const MyProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  
  // Cropping States
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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
            ...res.member,
            name: mergedProfile.name || '',
            email: mergedProfile.email || '',
            role: mergedProfile.role || '',
            department: mergedProfile.department || '',
            phone: mergedProfile.phone || '',
            address: mergedProfile.address || '',
            picture: mergedProfile.picture || '',
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
        picture: localPicture || '',
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const finalizeCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setForm(prev => ({ ...prev, picture: croppedImage }));
      setProfile(prev => ({ ...prev, picture: croppedImage }));
      setCropModalOpen(false);
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
      showToast('Cropping failed', 'error');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatePayload = {
        ...form,
        name: form.name,
        role: form.role,
        picture: form.picture
      };
      await updateMyProfile(updatePayload);

      if (form.name) localStorage.setItem('userName', form.name);
      if (form.role) localStorage.setItem('userType', form.role);
      if (form.picture) localStorage.setItem('userPicture', form.picture);

      showToast('Profile modernized successfully');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingDoc) return;

    try {
      showToast(`Uploading ${uploadingDoc}...`, 'loading');
      // Mock upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast(`${uploadingDoc} uploaded successfully!`);
    } catch (err) {
      showToast('Upload failed', 'error');
    } finally {
      setUploadingDoc(null);
      if (e.target) e.target.value = '';
    }
  };

  const triggerDocUpload = (docName) => {
    setUploadingDoc(docName);
    docInputRef.current?.click();
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'documents', label: 'Documents', icon: FiFileText },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  const infoList = [
    { icon: FiMail, label: 'Email Address', value: profile?.email, key: 'email' },
    { icon: FiPhone, label: 'Phone Number', value: profile?.phone || 'Not set', key: 'phone' },
    { icon: FiBriefcase, label: 'Department Name', value: profile?.department, key: 'department' },
    { icon: FiShield, label: 'Company Designation', value: profile?.role, key: 'role' },
    { icon: FiMapPin, label: 'Office Address', value: profile?.address || 'Not set', key: 'address' },
  ];

  const renderDocuments = () => {
    const docCategories = [
      {
        title: 'Identity Verification',
        docs: [
          { name: 'PAN Card', size: '1.2 MB', date: '21 Apr 2024', status: 'verified' },
          { name: 'Aadhar Card', size: '1.8 MB', date: '21 Apr 2024', status: 'verified' },
        ]
      },
      {
        title: 'Academic Records',
        docs: [
          { name: '10th Marksheet', size: '2.1 MB', date: '15 Jan 2024', status: 'verified' },
          { name: '12th Marksheet', size: '2.3 MB', date: '15 Jan 2024', status: 'verified' },
          { name: 'University Marksheet', size: '4.5 MB', date: '10 Feb 2024', status: 'verified' },
          { name: 'Degree Certificate', size: '3.1 MB', date: '10 Feb 2024', status: 'verified' },
        ]
      },
      {
        title: 'Financial & Career Documents',
        docs: [
          { name: 'Last 3 Months Payslips', size: '2.8 MB', date: '18 Mar 2024', status: 'pending' },
          { name: 'Bank Statement', size: '5.2 MB', date: '18 Mar 2024', status: 'pending' },
          { name: 'Offer Letter', size: '1.4 MB', date: '12 Jan 2024', status: 'verified' },
          { name: 'Relieving Letter', size: '1.1 MB', date: '12 Jan 2024', status: 'verified' },
        ]
      }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <input 
          type="file" 
          ref={docInputRef} 
          onChange={handleDocUpload} 
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png" 
        />
        {docCategories.map((category, catIdx) => (
          <div key={catIdx} className="space-y-4">
            <h4 className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] ml-1">{category.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.docs.map((file, idx) => (
                <div key={idx} className="bg-white p-5 rounded-[24px] border border-[#F4F3EF] flex items-center justify-between group hover:border-[#6B6B7E]/30 transition-all hover:shadow-md">
                  <div className="flex items-center gap-4 truncate">
                    <div className="w-10 h-10 bg-slate-50 text-[#6B6B7E] rounded-xl flex items-center justify-center shrink-0">
                      <FiFileText size={18} />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-[12px] font-bold text-[#1A1A2E] truncate">{file.name}</p>
                      <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">{file.size} • {file.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => triggerDocUpload(file.name)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider ${
                        uploadingDoc === file.name 
                          ? 'bg-slate-100 text-[#9B9BAD] cursor-not-allowed' 
                          : 'bg-slate-50 text-[#6B6B7E] hover:bg-[#6B6B7E] hover:text-white'
                      }`}
                      title="Upload New Version"
                      disabled={!!uploadingDoc}
                    >
                      {uploadingDoc === file.name ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#6B6B7E]/30 border-t-[#6B6B7E] rounded-full animate-spin" />
                      ) : (
                        <FiUploadCloud size={14} />
                      )}
                      {uploadingDoc === file.name ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="w-full py-6 border-2 border-dashed border-[#F4F3EF] rounded-[28px] text-[#9B9BAD] text-[10px] font-bold uppercase tracking-[3px] hover:border-[#6B6B7E] hover:text-[#6B6B7E] hover:bg-slate-50 transition-all">
          <FiUploadCloud size={18} className="mx-auto mb-2" />
          Add More Evidence
        </button>
      </motion.div>
    );
  };

  const renderSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white p-8 rounded-[32px] border border-[#F4F3EF] shadow-sm space-y-8">
        <div className="space-y-4 text-left">
          <h4 className="text-sm font-bold text-[#1A1A2E]">Security Protocol</h4>
          <button className="flex items-center gap-3 px-6 py-3 bg-[#6B6B7E] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform active:scale-95">
            <FiLock size={14} /> Reset Password
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 p-8">
        <div className="h-48 rounded-3xl bg-gray-200" />
        <div className="h-64 rounded-3xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-2 pb-8 px-4" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* 1. Top Header Section */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
        <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>
          My Profile
        </h1>

        {/* Pill-style Tab Navigation */}
        <div className="bg-white p-1.5 rounded-[24px] border border-[#F4F3EF] shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[20px] text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id
                ? 'bg-[#6B6B7E] text-white shadow-lg shadow-slate-900/20 scale-105'
                : 'text-[#9B9BAD] hover:text-[#6B6B7E] hover:bg-slate-50'
                }`}
            >
              <tab.icon size={14} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full px-4 space-y-8">
        {/* 2. Static Centered Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-6"
        >
          <div className="relative group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <div
              className={`w-36 h-36 rounded-[3rem] bg-[#1A1A2E] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-[#1A1A2E]/30 ring-8 ring-white transition-all ${editing ? 'cursor-pointer hover:scale-105' : ''} duration-500 overflow-hidden relative`}
              onClick={() => editing && fileInputRef.current.click()}
            >
              {profile?.picture ? (
                <img src={profile.picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile?.name?.charAt(0)?.toUpperCase()
              )}
              {editing && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiImage className="text-white" size={24} />
                </div>
              )}
            </div>
            <button
              onClick={() => editing && fileInputRef.current.click()}
              className={`absolute -bottom-2 -right-2 w-11 h-11 bg-[#6B6B7E] text-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center hover:scale-110 transition-transform ${!editing && 'opacity-0 scale-75 pointer-events-none'}`}
            >
              <FiImage size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {editing ? (
              <div className="flex flex-col items-center gap-3">
                <input
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-center text-3xl font-black text-[#1A1A2E] bg-white/50 border-b-2 border-[#6B6B7E] px-4 py-1 outline-none w-full max-w-md focus:bg-white transition-all"
                  placeholder="Enter Name"
                />
                <input
                  value={form.role || ''}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="text-center text-[12px] font-black text-[#9B9BAD] uppercase tracking-[4px] bg-white/50 border-b border-slate-200 px-4 py-1 outline-none w-full max-w-sm focus:bg-white transition-all"
                  placeholder="Enter Role"
                />
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-black text-[#1A1A2E] tracking-tight">{profile?.name}</h2>
                <p className="text-[12px] font-black text-[#9B9BAD] uppercase tracking-[6px] opacity-70">{profile?.role}</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

          </div>
        </motion.div>

        {/* 3. Bottom Dynamic Content Container */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[40px] border border-[#F4F3EF] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-10 sm:p-12"
            >
              {activeTab === 'personal' && (
                <div className="space-y-10">
                  <div className="flex items-center justify-between relative">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-[#1A1A2E]">Personal Information</h3>
                      <p className="text-sm text-[#9B9BAD]">Manage your identification and contact details</p>
                    </div>
                    <button
                      onClick={() => editing ? handleSave() : setEditing(true)}
                      className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-[12px] uppercase tracking-widest transition-all ${editing ? 'bg-[#6B6B7E] text-white shadow-xl shadow-slate-900/10' : 'bg-[#F4F3EF] text-[#6B6B7E] hover:bg-[#E8E7E2]'
                        }`}
                    >
                      {editing ? (saving ? <FiSave className="animate-spin" /> : <FiSave size={16} />) : <FiEdit3 size={16} />}
                      {editing ? (saving ? 'Saving...' : 'Confirm Changes') : 'Edit Profile'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {infoList.map((item, idx) => (
                      <div key={idx} className="group space-y-2.5">
                        <div className="flex items-center gap-2 text-[#9B9BAD] transition-colors group-focus-within:text-[#6B6B7E]">
                          <item.icon size={14} className="opacity-70" />
                          <label className="text-[10px] font-black uppercase tracking-[2px]">{item.label}</label>
                        </div>
                        {editing ? (
                          <input
                            type={item.key === 'email' ? 'email' : 'text'}
                            value={form[item.key] || ''}
                            onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
                            className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 text-[13px] font-bold text-[#1A1A2E] text-left focus:bg-white focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                          />
                        ) : (
                          <div className="w-full bg-white border border-[#F4F3EF] rounded-2xl px-5 py-4 text-[13px] font-bold text-[#1A1A2E] text-left opacity-80 group-hover:bg-[#F8FAFC] transition-colors">
                            {item.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {editing && (
                    <div className="pt-8 flex justify-center border-t border-[#F4F3EF]">
                      <button onClick={() => setEditing(false)} className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-[#9B9BAD] hover:text-rose-500 transition-colors">
                        Discard Alterations
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && <div key="documents">{renderDocuments()}</div>}
              {activeTab === 'settings' && <div key="settings">{renderSettings()}</div>}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 4. Image Cropping Modal */}
      <AnimatePresence>
        {cropModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A2E]">Adjust Profile Picture</h3>
                  <p className="text-xs text-[#9B9BAD] font-bold uppercase tracking-wider mt-1">Perfectly frame your avatar</p>
                </div>
                <button 
                  onClick={() => setCropModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-50 text-[#9B9BAD] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="relative h-96 bg-slate-50">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                />
              </div>

              <div className="p-10 space-y-8 bg-white mt-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-[#6B6B7E]">Zoom Intensity</label>
                    <span className="text-[10px] font-black text-[#1A1A2E]">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#6B6B7E]"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCropModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-[#9B9BAD] hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={finalizeCrop}
                    className="flex-[2] py-4 rounded-2xl bg-[#6B6B7E] text-white text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Finalize Crop
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[1000] ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#111827] text-white'
              }`}
          >
            {toast.type === 'error' ? <FiX size={20} /> : <FiCheckCircle size={20} className="text-emerald-400" />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProfileTab;

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg');
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}
