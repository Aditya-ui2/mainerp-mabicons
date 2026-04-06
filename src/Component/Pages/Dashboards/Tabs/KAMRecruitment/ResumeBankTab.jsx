import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, UserPlus, FileText, CheckCircle2, ChevronLeft, ChevronRight,
  Database, RefreshCw, X, Star, Share, Clock, User, Briefcase, Eye
} from 'lucide-react';
import { toast } from "sonner";
import {
  getResumeBankStats,
  getResumeRoleTypes,
  getResumeBankResumes,
  getResumeDetails,
  toggleStarResumes,
  getResumeDownloadUrl,
  uploadResumes,
  assignResumesToPosition,
  getAllRecruitmentPositions,
  getAllClients,
  syncResumesFromSharePoint,
  syncResumesFromSharePointDrive,
} from '../../../service/api';

// --- Helper Functions ---
const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// --- Sub-Components (Moved outside to prevent re-mounting "blinking") ---

const StatusBadge = ({ status }) => {
  const styles = {
    'Available': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Shortlisted': 'bg-blue-50 text-blue-600 border-blue-100',
    'Contacted': 'bg-amber-50 text-amber-600 border-amber-100',
    'Hired': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Rejected': 'bg-rose-50 text-rose-600 border-rose-100',
    'Not Interested': 'bg-slate-50 text-slate-600 border-slate-100',
    'default': 'bg-slate-50 text-slate-500 border-slate-100'
  };
  const currentStyle = styles[status] || styles['default'];
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${currentStyle}`}>
      {status || 'Unknown'}
    </span>
  );
};

const ResumeCard = ({ resume, isDarkMode, onPreviewResume }) => (
  <div 
    onClick={() => onPreviewResume(resume.id, resume.fileName)}
    className="group bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-transparent hover:border-[#F4F3EF] dark:hover:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden relative"
  >
    <div className="flex flex-wrap items-center justify-between gap-8 relative z-10">
      <div className="flex items-center gap-6 flex-1 min-w-[300px]">
        <div className="w-16 h-16 rounded-[22px] bg-[#EEF2FB] dark:bg-slate-900 flex items-center justify-center text-[#1B4DA0] dark:text-blue-400 font-bold text-xl shadow-sm border border-[#EEF2FB] dark:border-slate-700 group-hover:scale-105 transition-transform duration-500">
          {getInitials(resume.candidateName || resume.fileName)}
        </div>
        <div className="flex-1 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-xl font-bold font-syne text-[#1A1A2E] dark:text-white group-hover:text-[#1B4DA0] dark:group-hover:text-blue-400 transition-colors">
              {resume.candidateName || resume.fileName.split('.')[0]}
            </h3>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">{resume.roleType || 'General Profile'}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {(resume.skills || ['React', 'TypeScript', 'Node.js']).map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-[#FAFAF8] dark:bg-slate-900 text-[#1A1A2E]/60 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-[#F4F3EF] dark:border-slate-700 uppercase tracking-wider">{skill}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={(e) => { e.stopPropagation(); onPreviewResume(resume.id, resume.fileName); }}
          className="flex items-center gap-2 px-6 py-3 bg-[#F4F3EF] dark:bg-slate-700 text-[#6B6B7E] dark:text-slate-300 rounded-2xl text-xs font-bold hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm"
        >
          <FileText size={16} />
          View CV
        </button>
      </div>
    </div>
    
    {/* Design Element */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-[#1B4DA0]/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
  </div>
);

const ResumeDetailDrawer = ({ resume, isDarkMode, onClose, onUpdatePosition }) => {
  if (!resume) return null;
  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`relative w-full max-w-2xl h-full shadow-2xl flex flex-col pointer-events-auto ${isDarkMode ? 'bg-slate-900 border-l border-slate-800' : 'bg-white border-l border-[#F4F3EF]'}`}
      >
        <div className={`p-8 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-[#F4F3EF]'}`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={resume.status} />
              {resume.isStarred && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full uppercase">Top Choice</span>}
            </div>
            <h2 className="text-3xl font-bold tracking-tight font-syne">{resume.candidateName || resume.fileName.split('.')[0]}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isDarkMode ? 'text-slate-400 border-slate-700 hover:bg-slate-800' : 'text-[#6B6B7E] border-[#F4F3EF] hover:text-[#1A1A2E] hover:bg-[#F4F3EF]'}`}>
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
           <div className="grid grid-cols-2 gap-6">
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}><User size={13} /> Email Address</p>
                <p className="text-sm font-bold truncate">{resume.email || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}><Briefcase size={13} /> Contact Number</p>
                <p className="text-sm font-bold">{resume.phone || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Target Role</p>
                <p className="text-sm font-bold">{resume.roleType || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Current Company</p>
                <p className="text-sm font-bold">{resume.currentCompany || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Experience</p>
                <p className="text-sm font-bold">{resume.experience || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Current Location</p>
                <p className="text-sm font-bold">{resume.currentLocation || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Current Salary</p>
                <p className="text-sm font-bold">{resume.currentSalary || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Expected Salary</p>
                <p className="text-sm font-bold">{resume.expectedSalary || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Notice Period</p>
                <p className="text-sm font-bold">{resume.noticePeriod || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Preferred Location</p>
                <p className="text-sm font-bold">{resume.preferredLocation || 'N/A'}</p>
              </div>
           </div>
           <div className="space-y-4">
             <h3 className={`text-xs font-bold uppercase tracking-[2px] ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Expertise Stack</h3>
             <div className="flex flex-wrap gap-2">
               {(resume.skills || ['React', 'Node.js', 'Typescript', 'AWS']).map((skill, i) => (
                 <span key={i} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-[#F4F3EF] text-[#1B4DA0]'}`}>{skill}</span>
               ))}
             </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

const AssignPositionModal = ({ isOpen, onClose, positions, onConfirm, isAssigning, selectedId, onSelect, isDarkMode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto" />
       <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-md rounded-[32px] p-8 shadow-2xl overflow-hidden pointer-events-auto ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-[#1A1A2E]'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold font-syne">Assign to Position</h3>
            <button onClick={onClose} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}><X size={20} /></button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {positions.length === 0 ? (
              <p className="text-center py-10 text-slate-500 font-medium text-sm">No open positions found</p>
            ) : positions.map(pos => (
              <div 
                key={pos.id} 
                onClick={() => onSelect(pos.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedId === pos.id ? 'border-[#1B4DA0] bg-[#1B4DA0]/5' : (isDarkMode ? 'border-slate-700 hover:border-slate-600' : 'border-[#F4F3EF] hover:border-slate-300')}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">{pos.title}</p>
                    <p className={`text-[10px] font-bold uppercase mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{pos.location} • {pos.type}</p>
                  </div>
                  {selectedId === pos.id && <CheckCircle2 size={16} className="text-[#1B4DA0]" />}
                </div>
              </div>
            ))}
          </div>
          <button 
            disabled={isAssigning || !selectedId}
            onClick={onConfirm}
            className="w-full h-14 bg-[#1B4DA0] text-white rounded-2xl mt-8 font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-[#153e82] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isAssigning ? <RefreshCw className="animate-spin" size={18} /> : <Briefcase size={18} />} Confirm Assignment
          </button>
       </motion.div>
    </div>
  );
};

// --- Main Page Component ---

const ResumeBankTab = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // State
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState(null);
  const [roleTypes, setRoleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSyncMenu, setShowSyncMenu] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [selectedResume, setSelectedResume] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingUploadFiles, setPendingUploadFiles] = useState([]);
  const [selectedUploadRoleType, setSelectedUploadRoleType] = useState('');
  const [customUploadRoleType, setCustomUploadRoleType] = useState('');
  const [uploadCandidateName, setUploadCandidateName] = useState('');
  const [uploadPhone, setUploadPhone] = useState('');
  
  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allPositions, setAllPositions] = useState([]);
  const [assigningResumeId, setAssigningResumeId] = useState(null);
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [allClients, setAllClients] = useState([]);
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    roleType: '',
    status: '',
    isStarred: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    clientId: ''
  });

  // Fetch data
  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      
      const response = await getResumeBankResumes(params);
      setResumes(response.data || []);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      toast.error('Failed to load resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchStats = async () => {
    try {
      const response = await getResumeBankStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRoleTypes = async () => {
    try {
      const response = await getResumeRoleTypes();
      setRoleTypes(response.roles || []);
    } catch (error) {
      console.error('Failed to fetch role types:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await getAllRecruitmentPositions({ status: 'Open' });
      setAllPositions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await getAllClients();
      // The API returns { success: true, data: { count, clients: [...] } }
      const clientList = response.data?.clients || response?.clients || (Array.isArray(response) ? response : []);
      setAllClients(clientList);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRoleTypes();
    fetchPositions();
    fetchClients();

    // Auto-sync from SharePoint on page load (background, silent)
    const autoSync = async () => {
      try {
        await syncResumesFromSharePointDrive({});
        // Refresh data after sync completes
        await Promise.all([fetchStats(), fetchRoleTypes()]);
      } catch (err) {
        console.warn('Auto SharePoint sync skipped:', err.message);
      }
    };
    autoSync();
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [filters, pagination.page, pagination.limit]);

  // Handlers
  const handleSync = async (source = 's3') => {
    try {
      setSyncing(true);
      setShowSyncMenu(false);
      
      if (source === 'sharepoint') {
        await syncResumesFromSharePointDrive({});
      } else {
        await syncResumesFromSharePoint({});
      }
      
      toast.success(`Successfully synced from ${source}`);
      await Promise.all([fetchStats(), fetchRoleTypes(), fetchResumes()]);
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleStar = async (resumeId, currentStatus) => {
    try {
      await toggleStarResumes([resumeId], !currentStatus);
      fetchResumes();
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleUpdatePosition = (resumeId) => {
    setAssigningResumeId(resumeId);
    setSelectedPositionId('');
    setShowAssignModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedPositionId) {
      toast.error("Please select a position");
      return;
    }
    try {
      setIsAssigning(true);
      await assignResumesToPosition([assigningResumeId], selectedPositionId);
      toast.success("Candidate successfully updated to position");
      setShowAssignModal(false);
      setShowDetailDrawer(false);
      fetchResumes();
    } catch (error) {
      console.error('Assignment failed:', error);
      toast.error(error.message || "Failed to update position");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      roleType: '',
      status: '',
      isStarred: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      clientId: ''
    });
    // The fetchResumes is called by the useEffect [filters]
  };

  const handlePreviewResume = async (resumeId, fileName) => {
    toast.info("Opening resume...");
    try {
      const response = await getResumeDownloadUrl(resumeId);
      if (response && response.downloadUrl) {
        let url = response.downloadUrl;
        // If it's a relative path (local file), prepend the backend base URL
        if (url.startsWith('/uploads/')) {
          const { BASE_URL } = await import('../../../service/api');
          url = `${BASE_URL}${url}`;
        }
        // Open directly in new tab — Edge blocks iframes for external URLs
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        toast.error("Could not retrieve preview URL");
      }
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error(error.message || "Failed to load resume preview");
    }
  };

  const handleViewDetails = async (resumeId) => {
    try {
      const response = await getResumeDetails(resumeId);
      setSelectedResume(response.data);
      setShowDetailDrawer(true);
    } catch (error) {
      console.error('Failed to fetch details:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleOpenAddCandidate = () => {
    setUploadCandidateName('');
    setUploadPhone('');
    setPendingUploadFiles([]);
    setSelectedUploadRoleType(filters.roleType || '');
    setCustomUploadRoleType('');
    setShowUploadModal(true);
  };

  const handleConfirmUploadResumes = async () => {
    if (!uploadCandidateName.trim()) {
      toast.error("Please enter candidate name");
      return;
    }
    if (!pendingUploadFiles.length) {
      toast.error("Please upload a resume");
      return;
    }

    const resolvedRoleType = (selectedUploadRoleType === '__custom__'
      ? customUploadRoleType.trim()
      : selectedUploadRoleType.trim()) || 'Uncategorized';

    try {
      setUploading(true);
      const formData = new FormData();
      pendingUploadFiles.forEach((file) => formData.append('resume', file));
      formData.append('roleType', resolvedRoleType);
      formData.append('candidateName', uploadCandidateName.trim());
      if (uploadPhone.trim()) formData.append('phone', uploadPhone.trim());

      await uploadResumes(formData);
      toast.success("Candidate added successfully");
      await Promise.all([fetchStats(), fetchRoleTypes(), fetchResumes()]);
      setShowUploadModal(false);
      setPendingUploadFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`p-6 lg:p-10 max-w-full min-h-screen transition-colors duration-500 text-left ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#FAFAF8]'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="mb-10 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#1A1A2E] dark:text-white font-syne text-left">
            Resume Bank
          </h1>
          <p className="text-[#9B9BAD] text-sm mt-2 font-medium tracking-wide text-left">Historical archive of {stats?.total || 0} vetted candidate profiles</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenAddCandidate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <UserPlus size={18} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Sync Menu (If open) */}
      <AnimatePresence>
        {showSyncMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`mb-8 p-1 rounded-[22px] flex gap-1 border shadow-xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#F4F3EF]'}`}
          >
            <button 
              onClick={() => handleSync('s3')}
              className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-[#FAFAF8] text-[#5B5B7E]'}`}
            >
              <Database size={18} className="text-orange-500" /> Sync from AWS S3
            </button>
            <div className={`w-px h-8 self-center ${isDarkMode ? 'bg-slate-700' : 'bg-[#F4F3EF]'}`} />
            <button 
              onClick={() => handleSync('sharepoint')}
              className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-[#FAFAF8] text-[#5B5B7E]'}`}
            >
              <Share size={18} className="text-blue-500" /> Sync from SharePoint
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-[24px] p-2 mb-8 border border-[#F4F3EF] dark:border-slate-700 shadow-sm flex items-center gap-2 w-full">
        <div className="flex items-center gap-3 bg-[#F4F3EF] dark:bg-slate-900 rounded-2xl px-5 py-3 min-w-[300px] flex-[2]">
          <Search size={18} className="text-[#9B9BAD]" />
          <input 
            type="text" 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by name, expertise, or tech stack..." 
            className="bg-transparent text-sm text-[#1A1A2E] dark:text-white placeholder:text-[#9B9BAD] outline-none w-full font-bold" 
          />
        </div>
        <div className="flex items-center gap-2 justify-end flex-initial">
          <select 
            value={filters.roleType}
            onChange={(e) => handleFilterChange('roleType', e.target.value)}
            className="bg-[#F4F3EF] dark:bg-slate-900 text-[10px] font-bold text-[#6B6B7E] dark:text-slate-400 rounded-xl px-4 py-3 border-0 outline-none cursor-pointer hover:bg-[#E8E7E2] dark:hover:bg-slate-700 transition-colors uppercase tracking-widest"
          >
            <option value="">Roles (Global)</option>
            {roleTypes.map(role => (
              <option key={role.name} value={role.name}>{role.name} ({role.count})</option>
            ))}
          </select>
          <button 
            onClick={async () => {
              setLoading(true);
              await Promise.all([fetchStats(), fetchRoleTypes(), fetchResumes(), fetchClients(), fetchPositions()]);
              setLoading(false);
              toast.success("Data refreshed!");
            }}
            className="p-3 bg-[#F4F3EF] dark:bg-slate-900 rounded-xl text-[#6B6B7E] dark:text-slate-400 hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          {(filters.search || filters.roleType) && (
            <button 
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-bold text-[#1B4DA0] hover:underline uppercase tracking-widest transition-all active:scale-95"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Profile Deck */}
      <div className="grid grid-cols-1 gap-4 mb-20">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-40 gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#1B4DA0] border-t-transparent animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#9B9BAD]">Fetching Talent...</p>
           </div>
        ) : resumes.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-32 text-center text-[#9B9BAD]">
              <Database size={40} className="mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold mb-2 font-syne">No Profiles Found</h3>
           </div>
        ) : (
           resumes.map(resume => (
             <ResumeCard 
               key={resume.id} 
               resume={resume} 
               isDarkMode={isDarkMode}
               onPreviewResume={handlePreviewResume}
             />
           ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10 mb-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page <= 1}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl text-xs font-bold border border-[#F4F3EF] dark:border-slate-700 text-[#6B6B7E] dark:text-slate-400 hover:bg-[#1B4DA0] hover:text-white hover:border-[#1B4DA0] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest">
            Page {pagination.page} of {pagination.totalPages} &nbsp;•&nbsp; {pagination.total} profiles
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl text-xs font-bold border border-[#F4F3EF] dark:border-slate-700 text-[#6B6B7E] dark:text-slate-400 hover:bg-[#1B4DA0] hover:text-white hover:border-[#1B4DA0] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Bottom Info */}
      <div className="mt-6 py-10 border-t border-[#F4F3EF] dark:border-slate-700 text-center">
         <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[4px]">Verified Talent Ecosystem • Managed by Human Intelligence</p>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showDetailDrawer && selectedResume && (
          <ResumeDetailDrawer 
            resume={selectedResume}
            isDarkMode={isDarkMode}
            onClose={() => setShowDetailDrawer(false)}
            onUpdatePosition={handleUpdatePosition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAssignModal && (
          <AssignPositionModal 
            isOpen={showAssignModal}
            isDarkMode={isDarkMode}
            onClose={() => setShowAssignModal(false)}
            positions={allPositions}
            selectedId={selectedPositionId}
            onSelect={setSelectedPositionId}
            onConfirm={handleConfirmAssign}
            isAssigning={isAssigning}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPreviewModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-bold text-lg">{previewFileName}</h3>
                <div className="flex items-center gap-2">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1B4DA0] text-white rounded-xl text-xs font-bold hover:bg-[#153e82] transition-all shadow-sm"
                  >
                    <Eye size={14} /> Open in New Tab
                  </a>
                  <button onClick={() => setShowPreviewModal(false)} className="w-10 h-10 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"><X size={20} /></button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 p-4">
                <iframe src={previewUrl} className="w-full h-full rounded-2xl border-0" title="Resume Preview" allow="fullscreen" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl p-8 space-y-6 relative">
              <button onClick={() => setShowUploadModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-800 flex items-center justify-center text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={18} />
              </button>
              <div>
                <h3 className="text-2xl font-bold font-syne text-[#1A1A2E] dark:text-white">Add Candidate</h3>
                <p className="text-xs text-[#9B9BAD] mt-1 font-bold uppercase tracking-widest">Register new talent profile</p>
              </div>

              {/* Candidate Name */}
              <div>
                <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-2 block">Candidate Name *</label>
                <input
                  type="text"
                  value={uploadCandidateName}
                  onChange={(e) => setUploadCandidateName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-14 px-6 rounded-2xl border border-[#F4F3EF] dark:border-slate-700 text-sm focus:outline-none focus:border-[#1B4DA0] dark:bg-slate-800 dark:text-white transition-colors"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-2 block">Mobile Number</label>
                <input
                  type="tel"
                  value={uploadPhone}
                  onChange={(e) => setUploadPhone(e.target.value)}
                  placeholder="+91 00000 00000"
                  className="w-full h-14 px-6 rounded-2xl border border-[#F4F3EF] dark:border-slate-700 text-sm focus:outline-none focus:border-[#1B4DA0] dark:bg-slate-800 dark:text-white transition-colors"
                />
              </div>

              {/* Role Type */}
              <div>
                <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-2 block">Role Type</label>
                <select value={selectedUploadRoleType} onChange={(e) => setSelectedUploadRoleType(e.target.value)} className="w-full h-14 px-6 rounded-2xl border border-[#F4F3EF] dark:border-slate-700 text-sm focus:outline-none focus:border-[#1B4DA0] dark:bg-slate-800 dark:text-white cursor-pointer transition-colors">
                  <option value="">Select Role (Optional)</option>
                  {roleTypes.map(role => (<option key={role.name} value={role.name}>{role.name}</option>))}
                  <option value="__custom__">+ Custom Role</option>
                </select>
                {selectedUploadRoleType === '__custom__' && (
                  <input type="text" value={customUploadRoleType} onChange={(e) => setCustomUploadRoleType(e.target.value)} placeholder="Enter custom role name" className="w-full h-14 px-6 rounded-2xl border border-[#F4F3EF] dark:border-slate-700 text-sm mt-3 focus:outline-none focus:border-[#1B4DA0] dark:bg-slate-800 dark:text-white" />
                )}
              </div>

              {/* Resume Upload */}
              <div>
                <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-2 block">Upload Resume *</label>
                <label className="cursor-pointer block">
                  <div className={`w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                    pendingUploadFiles.length
                      ? 'border-[#1B4DA0] bg-blue-50/50 dark:bg-blue-900/20'
                      : 'border-[#F4F3EF] dark:border-slate-700 hover:border-[#1B4DA0]'
                  }`}>
                    {pendingUploadFiles.length ? (
                      <>
                        <FileText size={20} className="text-[#1B4DA0]" />
                        <span className="text-xs font-bold text-[#1B4DA0]">{pendingUploadFiles[0].name}</span>
                      </>
                    ) : (
                      <>
                        <Download size={20} className="text-[#9B9BAD]" />
                        <span className="text-xs font-bold text-[#9B9BAD]">Click to upload PDF, DOC, DOCX</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => { const files = Array.from(e.target.files || []); if (files.length) setPendingUploadFiles(files); e.target.value = ''; }} className="hidden" />
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button onClick={() => setShowUploadModal(false)} className="flex-1 h-14 rounded-2xl font-bold text-xs uppercase tracking-widest text-[#6B6B7E] hover:bg-[#F4F3EF] dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button onClick={handleConfirmUploadResumes} disabled={uploading} className="flex-1 h-14 bg-[#1B4DA0] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-[#153e82] transition-all disabled:opacity-50">{uploading ? 'Saving...' : 'Add Candidate'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBankTab;