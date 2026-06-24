import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Edit3,
  Save,
  X,
  MapPin,
  Calendar,
  Shield,
  Image as ImageIcon,
  Lock,
  Zap,
  ChevronRight,
  FileText,
  Activity,
  Settings,
  CheckCircle,
  Clock,
  Download,
  Unlock,
  Check,
  UploadCloud,
  Pencil,
  Clipboard,
  Eye
} from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../../../service/api';
import PolicyTab from '../KAM/PolicyTab';

const OperationsMyProfileTab = ({ onProfileUpdate }) => {
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
  
  const userType = localStorage.getItem('userType');
  const isSuperAdmin = userType && userType.toLowerCase() === 'superadmin';

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
            picture: res.member.picture || res.member.avatar || localPicture,
            email: res.member.email || localEmail,
            role: res.member.role || localRole,
            department: res.member.department || localDept
          };
          setProfile(mergedProfile);
          if (mergedProfile.name) localStorage.setItem('userName', mergedProfile.name);
          if (mergedProfile.role) {
            localStorage.setItem('userRole', mergedProfile.role);
            localStorage.setItem('userType', mergedProfile.role);
          }
          if (mergedProfile.picture) localStorage.setItem('userPicture', mergedProfile.picture);
          window.dispatchEvent(new Event('profileUpdate'));
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
        department: form.department,
        picture: form.picture
      };
      await updateMyProfile(updatePayload);

      if (form.name) localStorage.setItem('userName', form.name);
      if (form.role) localStorage.setItem('userType', form.role);
      if (form.department) localStorage.setItem('department', form.department);
      if (form.picture) localStorage.setItem('userPicture', form.picture);

      showToast('Profile modernized successfully');
      setEditing(false);
      if (onProfileUpdate) onProfileUpdate();
      window.dispatchEvent(new Event('profileUpdate'));
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

    if (file.size > 2 * 1024 * 1024) {
      showToast('File size must be less than 2MB', 'error');
      return;
    }

    try {
      showToast(`Uploading ${file.name}...`, 'loading');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target.result;
        const updatedDocs = {
          ...(profile?.documents || {}),
          [uploadingDoc]: {
            name: file.name,
            url: base64Url,
            uploadedAt: new Date().toISOString()
          }
        };

        try {
          const updatePayload = {
            ...form,
            documents: updatedDocs
          };
          await updateMyProfile(updatePayload);
          setProfile(prev => ({
            ...prev,
            documents: updatedDocs
          }));
          setForm(prev => ({
            ...prev,
            documents: updatedDocs
          }));
          showToast(`${file.name} uploaded successfully!`);
        } catch (apiErr) {
          console.error(apiErr);
          showToast('Failed to save document to server', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      showToast('Upload failed', 'error');
    } finally {
      setUploadingDoc(null);
      if (e.target) e.target.value = '';
    }
  };

  const triggerDocUpload = (docId) => {
    setUploadingDoc(docId);
    docInputRef.current?.click();
  };

  const viewExistingDoc = (docId) => {
    const docData = profile?.documents?.[docId];
    if (!docData) {
      showToast('No document file to view', 'error');
      return;
    }
    
    const url = typeof docData === 'string' ? docData : docData.url;
    if (!url) {
      showToast('No document file to view', 'error');
      return;
    }

    const newTab = window.open();
    if (newTab) {
      newTab.document.title = docData.name || 'View Document';
      const isPdf = url.startsWith('data:application/pdf') || (docData.name && docData.name.toLowerCase().endsWith('.pdf'));
      
      if (isPdf) {
        newTab.document.body.innerHTML = `
          <iframe src="${url}" width="100%" height="100%" style="border:none; position:fixed; top:0; left:0; bottom:0; right:0;"></iframe>
        `;
      } else if (url.startsWith('data:image/')) {
        newTab.document.body.innerHTML = `
          <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#1e1e24; margin:0;">
            <img src="${url}" style="max-width:100%; max-height:100vh; object-fit:contain; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border-radius:8px;" />
          </div>
        `;
      } else {
        newTab.document.body.innerHTML = `
          <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; font-family:sans-serif; background:#f4f4f9; margin:0;">
            <h2 style="color:#333;">Preview not supported for this file type</h2>
            <a href="${url}" download="${docData.name || 'document'}" style="padding:12px 24px; background:#1B4DA0; color:white; text-decoration:none; border-radius:8px; font-weight:bold; margin-top:20px;">Download Document</a>
          </div>
        `;
      }
    } else {
      showToast('Pop-up blocked. Please allow pop-ups for this site.', 'error');
    }
  };

  const downloadExistingDoc = (docId) => {
    const docData = profile?.documents?.[docId];
    if (!docData) {
      showToast('No document file to download', 'error');
      return;
    }
    const url = typeof docData === 'string' ? docData : docData.url;
    if (!url) {
      showToast('No document URL to download', 'error');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = docData.name || `${docId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'hr_policy', label: 'HR Policy', icon: Clipboard },
  ];

  const infoList = [
    { icon: User, label: 'Full Name', value: profile?.name || 'Not set', key: 'name' },
    { icon: Mail, label: 'Email Address', value: profile?.email, key: 'email' },
    { icon: Phone, label: 'Phone Number', value: profile?.phone || 'Not set', key: 'phone' },
    { icon: Briefcase, label: 'Department Name', value: profile?.department, key: 'department' },
    { icon: Shield, label: 'Company Designation', value: profile?.role, key: 'role' },
    { icon: MapPin, label: 'Office Address', value: profile?.address || 'Not set', key: 'address' },
  ];

  const renderDocuments = () => {
    const docCategories = [
      {
        title: 'Identity Verification',
        docs: [
          { name: 'PAN Card (Front)', id: 'pan_front' },
          { name: 'PAN Card (Back)', id: 'pan_back' },
          { name: 'Aadhaar Card (Front)', id: 'aadhaar_front' },
          { name: 'Aadhaar Card (Back)', id: 'aadhaar_back' },
        ]
      },
      {
        title: 'Academic Records',
        docs: [
          { name: '10th Marksheet', id: '10th_marksheet' },
          { name: '12th Marksheet', id: '12th_marksheet' },
          { name: 'Graduation Marksheets', id: 'grad_marksheet' },
          { name: 'Degree Certificate', id: 'degree_cert' },
        ]
      },
      {
        title: 'Financial & Career Documents',
        docs: [
          { name: 'Pay Slips (3M)', id: 'pay_slips' },
          { name: 'Experience Letter', id: 'exp_letter' },
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
              {category.docs.map((doc, idx) => {
                const docFile = profile?.documents?.[doc.id];
                const isUploaded = !!docFile;
                return (
                  <div key={idx} className="bg-white p-5 rounded-[24px] border border-[#F4F3EF] flex items-center justify-between group hover:border-[#6B6B7E]/30 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4 truncate">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUploaded ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-[#6B6B7E]'}`}>
                        <FileText size={18} />
                      </div>
                      <div className="text-left truncate">
                        <p className="text-[12px] font-bold text-[#1A1A2E] truncate">{doc.name}</p>
                        <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">
                          {isUploaded ? (docFile.name || 'File Uploaded') : 'No file chosen'}
                          {isUploaded && docFile.uploadedAt && ` • ${new Date(docFile.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isUploaded && (
                        <>
                          <button
                            onClick={() => viewExistingDoc(doc.id)}
                            className="w-9 h-9 rounded-xl bg-slate-50 text-[#1B4DA0] hover:bg-blue-50 transition-all flex items-center justify-center border border-blue-50"
                            title="View Document"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => downloadExistingDoc(doc.id)}
                            className="w-9 h-9 rounded-xl bg-slate-50 text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center border border-emerald-50"
                            title="Download Document"
                          >
                            <Download size={15} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => triggerDocUpload(doc.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider ${
                          uploadingDoc === doc.id 
                            ? 'bg-slate-100 text-[#9B9BAD] cursor-not-allowed' 
                            : 'bg-slate-50 text-[#6B6B7E] hover:bg-[#6B6B7E] hover:text-white'
                        }`}
                        title={isUploaded ? "Replace Document" : "Upload Document"}
                        disabled={!!uploadingDoc}
                      >
                        {uploadingDoc === doc.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-[#6B6B7E]/30 border-t-[#6B6B7E] rounded-full animate-spin" />
                        ) : (
                          <UploadCloud size={14} />
                        )}
                        {uploadingDoc === doc.id ? 'Uploading...' : isUploaded ? 'Replace' : 'Upload'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#1A1A2E]">Security Protocol</h4>
            <button
               onClick={() => showToast('Update security settings')}
               className="w-8 h-8 flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] transition-all group/edit"
               title="Update Security"
            >
              <Pencil size={18} strokeWidth={1.5} className="transition-transform group-hover/edit:rotate-12" />
            </button>
          </div>
          <button className="flex items-center gap-3 px-6 py-3 bg-[#6B6B7E] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform active:scale-95">
            <Lock size={14} /> Reset Password
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

  const isRequesterTech = String(profile?.role || '').toLowerCase().includes('tech') || String(profile?.email || '').toLowerCase().includes('tech');

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-2 pb-8 px-4" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* 1. Top Header Section */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>
            My Profile
          </h1>
        </div>

        {/* Pill-style Tab Navigation - Fixed edge 'sticking' (chipakna) */}
        <div className="bg-white p-1.5 rounded-[26px] border border-[#F4F3EF] shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar h-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                ? 'bg-[#1B4DA0] text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                : 'text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-[#F8FAFC]'
                }`}
            >
              <tab.icon size={13} strokeWidth={2.5} />
              <span className="whitespace-nowrap leading-none mb-[1px]">{tab.label}</span>
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
                  <ImageIcon className="text-white" size={24} />
                </div>
              )}
            </div>
            <button
              onClick={() => editing && fileInputRef.current.click()}
              className={`absolute -bottom-2 -right-2 w-11 h-11 bg-[#6B6B7E] text-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center hover:scale-110 transition-transform ${!editing && 'opacity-0 scale-75 pointer-events-none'}`}
            >
              <ImageIcon size={18} />
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black text-[#1A1A2E] tracking-tight">{profile?.name}</h2>
            <p className="text-[12px] font-black text-[#9B9BAD] uppercase tracking-[6px] opacity-70">{profile?.role}</p>
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
                  <div className="relative">
                    <div className="text-left space-y-1">
                      <h3 className="text-2xl font-black text-[#1A1A2E]">Personal Information</h3>
                      <p className="text-sm text-[#9B9BAD]">Manage your identification and contact details</p>
                    </div>

                    <div className="absolute top-0 right-0 flex items-center gap-3">
                      {editing ? (
                        <>
                          <button
                            onClick={() => setEditing(false)}
                            className="px-5 py-2.5 rounded-xl text-[12px] font-bold text-[#6B6B7E] bg-[#F4F3EF] hover:bg-[#E8E7E2] transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1B4DA0] text-white rounded-xl font-bold text-[12px] shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                          >
                            {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditing(true)}
                          className="w-8 h-8 flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] transition-all group/edit"
                          title="Edit Profile"
                        >
                          <Pencil size={18} strokeWidth={1.5} className="transition-transform group-hover/edit:rotate-12" />
                        </button>
                      )}
                    </div>
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
                            disabled={item.key !== 'phone' && item.key !== 'address' && item.key !== 'name'}
                            onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
                            className={`w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 text-[13px] font-bold text-left focus:bg-white focus:ring-4 focus:ring-slate-100 outline-none transition-all ${
                              item.key !== 'phone' && item.key !== 'address' && item.key !== 'name'
                                ? 'text-[#9B9BAD] cursor-not-allowed opacity-60' 
                                : 'text-[#1A1A2E]'
                            }`}
                            title={item.key !== 'phone' && item.key !== 'address' && item.key !== 'name' ? "Cannot be changed" : ""}
                          />
                        ) : (
                          <div className="w-full bg-white border border-[#F4F3EF] rounded-2xl px-5 py-4 text-[13px] font-bold text-[#1A1A2E] text-left opacity-80 group-hover:bg-[#F8FAFC] transition-colors">
                            {item.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>


                </div>
              )}

              {activeTab === 'documents' && <div key="documents">{renderDocuments()}</div>}
              {activeTab === 'settings' && <div key="settings">{renderSettings()}</div>}
              {activeTab === 'hr_policy' && <div key="hr_policy"><PolicyTab isReadOnly={true} hideFilters={true} /></div>}
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
                  <X size={20} />
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
                  cropShape="rect"
                  showGrid={true}
                />
              </div>

              <div className="p-10 space-y-8 bg-white mt-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-[#1B4DA0]">Zoom</label>
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
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1B4DA0]"
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
                    className="flex-[2] py-4 rounded-2xl bg-[#1B4DA0] text-white text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Crop
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
            {toast.type === 'error' ? <X size={20} /> : <CheckCircle size={20} className="text-emerald-400" />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OperationsMyProfileTab;

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
