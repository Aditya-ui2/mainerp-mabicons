import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, UserPlus, FileText, CheckCircle2, ChevronLeft, ChevronRight,
  Database, RefreshCw, X, Star, Share, Clock, User, Briefcase, Eye, ChevronDown, Pencil, Check,
  Sparkles, Bot, Wand2
} from 'lucide-react';
// import { searchResumesWithAI } from '../../../../Utilities/geminiService';
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
  aiSearchResumes
} from '../../../service/api';

// --- Helper Functions ---
const getInitials = (name) => {
  if (!name) return '??';
  // Clean name before getting initials
  const clean = name.replace(/^Naukri_/, '').replace(/\[.*\]/, '').trim();
  return clean.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const cleanCandidateName = (name) => {
  if (!name) return '';
  // Remove "Naukri_" prefix and experience brackets like [3y_0m]
  return name.replace(/^Naukri_/, '').replace(/\[.*?\]/, '').trim();
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

const ResumeCard = ({ resume, isDarkMode, onPreviewResume, onViewProfile, isSelected, onToggleSelect }) => (
  <div
    onClick={() => onViewProfile(resume.id)}
    className={`group px-8 py-3 border-b border-[#F4F3EF] last:border-0 transition-all duration-300 cursor-pointer overflow-hidden relative grid grid-cols-[1.5fr_1fr_150px] items-center gap-6 hover:bg-[#F8FAFF] ${isSelected
      ? (isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-[#F0F7FF] border-[#D0E5FF]')
      : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white')
      }`}
  >
    {/* Candidate Info */}
    <div className="flex flex-col justify-center">
      <h3 className="text-[14px] font-bold text-[#0f172a] dark:text-white group-hover:text-[#1B4DA0] transition-colors truncate text-left">
        {cleanCandidateName(resume.candidateName || resume.fileName.split('.')[0])}
      </h3>
    </div>

    {/* Role Info */}
    <div className="flex justify-center">
      <p className="text-[13px] font-medium text-[#64748b] dark:text-slate-400 truncate text-center">
        {resume.roleType || 'General Profile'}
      </p>
    </div>

    {/* Actions */}
    <div className="flex items-center justify-center">
      <button
        onClick={(e) => { e.stopPropagation(); onPreviewResume(resume.id, resume.fileName); }}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F3EF] dark:bg-slate-700 text-[#6B6B7E] dark:text-slate-300 rounded-lg text-[11px] font-bold hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm"
      >
        <FileText size={14} />
        View CV
      </button>
    </div>
  </div>
);

const ResumeDetailDrawer = ({ resume, isDarkMode, onClose, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedResume, setEditedResume] = useState({ ...resume });

  useEffect(() => {
    setEditedResume({ ...resume });
  }, [resume]);

  if (!resume) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateResumeDetails(resume.id, editedResume);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClasses = `w-full bg-transparent rounded-xl px-2 py-1 transition-all outline-none border ${isEditing
    ? 'border-[#1B4DA0]/20 bg-[#1B4DA0]/5 hover:bg-[#1B4DA0]/10 focus:border-[#1B4DA0] focus:bg-white'
    : 'border-transparent cursor-default'
    }`;

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end overflow-hidden pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md pointer-events-auto" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`relative w-full max-w-2xl h-full shadow-2xl flex flex-col pointer-events-auto z-[1101] ${isDarkMode ? 'bg-slate-900 border-l border-slate-800' : 'bg-white border-l border-[#F4F3EF]'}`}
      >
        <div className={`p-8 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-[#F4F3EF]'}`}>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={resume.status} />
              {resume.isStarred && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full uppercase">Top Choice</span>}
            </div>
            {isEditing ? (
              <input
                autoFocus
                className="text-3xl font-bold tracking-tight font-syne bg-transparent border-b-2 border-[#1B4DA0] outline-none w-full"
                value={editedResume.candidateName || ''}
                onChange={e => setEditedResume(p => ({ ...p, candidateName: e.target.value }))}
              />
            ) : (
              <h2
                onClick={() => setIsEditing(true)}
                className="text-3xl font-bold tracking-tight font-syne cursor-pointer hover:text-[#1B4DA0] transition-colors group flex items-center gap-3"
              >
                {resume.candidateName || resume.fileName.split('.')[0]}
                <Pencil size={18} className="opacity-0 group-hover:opacity-100 text-slate-400" />
              </h2>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#1B4DA0] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  Save
                </button>
              </div>
            ) : (
              <button onClick={onClose} className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isDarkMode ? 'text-slate-400 border-slate-700 hover:bg-red-500/10 hover:text-red-500' : 'text-[#6B6B7E] border-[#F4F3EF] hover:bg-red-50 hover:text-red-500'}`}>
                <X size={24} />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            {/* Email Address */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}><User size={13} /> Email Address</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.email || ''}
                  onChange={e => setEditedResume(p => ({ ...p, email: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold truncate">{resume.email || 'N/A'}</p>
              )}
            </div>

            {/* Contact Number */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}><Briefcase size={13} /> Contact Number</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.phone || ''}
                  onChange={e => setEditedResume(p => ({ ...p, phone: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold">{resume.phone || 'N/A'}</p>
              )}
            </div>

            {/* Target Role */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Target Role</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.roleType || ''}
                  onChange={e => setEditedResume(p => ({ ...p, roleType: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold">{resume.roleType || 'N/A'}</p>
              )}
            </div>

            {/* Current Company */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Current Company</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.currentCompany || ''}
                  onChange={e => setEditedResume(p => ({ ...p, currentCompany: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold">{resume.currentCompany || 'N/A'}</p>
              )}
            </div>

            {/* Experience */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Experience</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.experience || ''}
                  onChange={e => setEditedResume(p => ({ ...p, experience: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold">{resume.experience || 'N/A'}</p>
              )}
            </div>

            {/* Current Location */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Current Location</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.currentLocation || ''}
                  onChange={e => setEditedResume(p => ({ ...p, currentLocation: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold">{resume.currentLocation || 'N/A'}</p>
              )}
            </div>

            {/* Current Salary */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Current Salary</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.currentSalary || ''}
                  onChange={e => setEditedResume(p => ({ ...p, currentSalary: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold">{resume.currentSalary || 'N/A'}</p>
              )}
            </div>

            {/* Expected Salary */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Expected Salary</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.expectedSalary || ''}
                  onChange={e => setEditedResume(p => ({ ...p, expectedSalary: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold">{resume.expectedSalary || 'N/A'}</p>
              )}
            </div>

            {/* Notice Period */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Notice Period</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.noticePeriod || ''}
                  onChange={e => setEditedResume(p => ({ ...p, noticePeriod: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold">{resume.noticePeriod || 'N/A'}</p>
              )}
            </div>

            {/* Preferred Location */}
            <div className={`p-6 rounded-[32px] border group cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FDFDFD] border-[#F4F3EF]'}`} onClick={() => !isEditing && setIsEditing(true)}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Preferred Location</p>
                {!isEditing && <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
              </div>
              {isEditing ? (
                <input
                  className="text-sm font-bold w-full bg-[#1B4DA0]/5 border-none outline-none rounded-lg px-2 py-1"
                  value={editedResume.preferredLocation || ''}
                  onChange={e => setEditedResume(p => ({ ...p, preferredLocation: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-bold">{resume.preferredLocation || 'N/A'}</p>
              )}
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md pointer-events-auto" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative z-[1101] w-full max-w-md rounded-[32px] p-8 shadow-2xl overflow-hidden pointer-events-auto ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-[#1A1A2E]'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-syne">Assign to Position</h3>
          <button onClick={onClose} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'hover:bg-red-500/10 hover:text-red-500' : 'hover:bg-red-50 hover:text-red-500'}`}><X size={20} /></button>
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

  // AI Search State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allPositions, setAllPositions] = useState([]);
  const [assigningResumeIds, setAssigningResumeIds] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [allClients, setAllClients] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
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
    if (!isAiMode) {
      fetchResumes();
    }
  }, [filters, pagination.page, pagination.limit, isAiMode]);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAiSearching(true);
    try {
        const response = await aiSearchResumes(aiQuery);
        if (response.success && response.data) {
            setResumes(response.data);
            setAiResults(response.data.length);
            toast.success(`AI found ${response.data.length} matching candidates`);
        }
    } catch (err) {
        console.error('AI search error:', err);
        toast.error(err.message || "AI Search failed. Check server logs.");
    } finally {
        setIsAiSearching(false);
    }
  };

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

  // Selection handlers
  const toggleSelectRow = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredResumes) => {
    if (filteredResumes.length === 0) return;
    if (selectedRowIds.length === filteredResumes.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredResumes.map(r => r.id));
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
    setAssigningResumeIds([resumeId]);
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
      await assignResumesToPosition(assigningResumeIds, selectedPositionId);
      toast.success(`${assigningResumeIds.length} candidate(s) successfully updated to position`);
      setShowAssignModal(false);
      setShowDetailDrawer(false);
      setSelectedRowIds([]);
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
    <div className={`p-0 max-w-full min-h-screen transition-colors duration-500 text-left ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#FDFDFD]'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        body { font-family: 'Calibri', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="mb-10 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white font-syne text-left">
            Resume Bank
          </h1>

        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSyncMenu(!showSyncMenu)}
            disabled={syncing}
            className={`flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-[#1B4DA0] border border-blue-100/30 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm active:scale-95 hover:bg-[#E3F2FD] hover:text-[#0D47A1] group ${syncing ? 'opacity-50 cursor-not-allowed' : ''} min-w-[170px]`}
          >
            {syncing ? (
              <RefreshCw size={18} className="text-[#1B4DA0] animate-spin" />
            ) : (
              <Database size={18} className="text-[#1B4DA0] group-hover:text-[#0D47A1] transition-transform group-hover:scale-110" />
            )}
            <span className="tracking-tight">{syncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
          <button
            onClick={handleOpenAddCandidate}
            className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/20 active:scale-95"
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
              className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-[#FDFDFD] text-[#5B5B7E]'}`}
            >
              <Database size={18} className="text-orange-500" /> Sync from AWS S3
            </button>
            <div className={`w-px h-8 self-center ${isDarkMode ? 'bg-slate-700' : 'bg-[#F4F3EF]'}`} />
            <button
              onClick={() => handleSync('sharepoint')}
              className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-[#FDFDFD] text-[#5B5B7E]'}`}
            >
              <Share size={18} className="text-blue-500" /> Sync from SharePoint
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar (Unified with Job Openings Style) */}
      <div className="bg-white dark:bg-slate-800 rounded-[24px] p-2 mb-8 border border-[#F4F3EF] dark:border-slate-700 shadow-sm flex items-center gap-3 flex-wrap relative overflow-hidden">
        {/* AI Mode Toggle Background Glow */}
        {isAiMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-blue-500/5 pointer-events-none"
          />
        )}

        {/* Search Input Area */}
        <div className="relative flex-1 group min-w-[300px]">
          {isAiMode ? (
            <Bot className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500 animate-pulse" size={18} />
          ) : (
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          )}

          <input
            type="text"
            value={isAiMode ? aiQuery : filters.search}
            onChange={(e) => isAiMode ? setAiQuery(e.target.value) : handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && isAiMode && handleAiSearch()}
            placeholder={isAiMode ? "Ask Gemini: 'Find me Java experts with 5+ years experience'..." : "Search by name, expertise, or tech stack..."}
            className={`w-full bg-[#F4F3EF] dark:bg-slate-900 border-none rounded-2xl py-3 pl-14 pr-24 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD] dark:text-white ${isAiMode ? 'ring-2 ring-violet-500/20' : 'focus:ring-2 focus:ring-[#F4F3EF]'}`}
          />

          {/* AI Search Action Button inside the input */}
          {isAiMode && (
            <button
              onClick={handleAiSearch}
              disabled={isAiSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
              {isAiSearching ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
              Ask AI
            </button>
          )}
        </div>

        {/* AI Toggle Button */}
        <button
          onClick={() => {
            setIsAiMode(!isAiMode);
            if (isAiMode) {
              setAiResults(null);
              fetchResumes();
            }
          }}
          className={`px-4 py-2.5 rounded-xl border-2 flex items-center gap-2 transition-all active:scale-95 ${isAiMode ? 'bg-violet-50 border-violet-200 text-violet-600' : 'bg-white border-[#F4F3EF] text-[#9B9BAD] hover:border-violet-200 hover:text-violet-500'}`}
        >
          <Sparkles size={16} className={isAiMode ? 'animate-bounce' : ''} />
          <span className="text-[11px] font-black uppercase tracking-widest">{isAiMode ? 'AI ON' : 'Smart AI'}</span>
        </button>

        {/* Global Roles Filter (Hidden in AI mode to avoid confusion) */}
        {!isAiMode && (
          <div className="relative group">
            <select
              value={filters.roleType}
              onChange={(e) => handleFilterChange('roleType', e.target.value)}
              className="bg-[#F4F3EF] dark:bg-slate-900 text-[11px] font-black text-[#1A1A2E] dark:text-slate-400 rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[150px] uppercase tracking-widest hover:bg-[#EEF2FB] dark:hover:bg-slate-700 transition-all"
            >
              <option value="">Positions</option>
              {roleTypes.map(role => (
                <option key={role.name} value={role.name}>{role.name} ({role.count})</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        )}

        {/* Reset / Status Labels */}
        {aiResults !== null && (
          <div className="px-4 py-1.5 bg-violet-50 text-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            AI matched: {aiResults}
          </div>
        )}

        {(filters.search || filters.roleType || aiResults !== null) && (
          <button
            onClick={() => {
              handleResetFilters();
              setIsAiMode(false);
              setAiResults(null);
              setAiQuery('');
            }}
            className="px-4 py-2 text-xs font-bold text-[#1B4DA0] hover:underline uppercase tracking-widest transition-all active:scale-95"
          >
            Reset
          </button>
        )}
      </div>

      {/* Profile Deck - Table Interface */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 overflow-hidden shadow-sm mb-20">
        <div className="grid grid-cols-[1.5fr_1fr_150px] items-center gap-6 px-8 py-4 border-b border-[#F4F3EF] dark:border-slate-700 bg-transparent">
          <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Candidate</span>
          <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Positions</span>
          <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Actions</span>
        </div>

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
          <div>
            {resumes.map(resume => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                isDarkMode={isDarkMode}
                onPreviewResume={handlePreviewResume}
                onViewProfile={handleViewDetails}
                isSelected={selectedRowIds.includes(resume.id)}
                onToggleSelect={toggleSelectRow}
              />
            ))}
          </div>
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

      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showDetailDrawer && selectedResume && (
          <ResumeDetailDrawer
            resume={selectedResume}
            isDarkMode={isDarkMode}
            onClose={() => setShowDetailDrawer(false)}
            onRefresh={fetchResumes}
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
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPreviewModal(false)} className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative z-[1101] w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden flex flex-col">
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
                  <button onClick={() => setShowPreviewModal(false)} className="w-10 h-10 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"><X size={20} /></button>
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
          <div className="fixed inset-0 z-[1100] bg-[#1A1A2E]/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative z-[1101] w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-syne text-[#1A1A2E] dark:text-white">Add Candidate</h3>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-800 flex items-center justify-center text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all flex-shrink-0">
                  <X size={18} />
                </button>
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-2 block">Role Type</label>
                <div className="relative group">
                  <select
                    value={selectedUploadRoleType}
                    onChange={(e) => setSelectedUploadRoleType(e.target.value)}
                    className="w-full h-14 px-6 rounded-2xl border border-[#F4F3EF] dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-[#1B4DA0] dark:bg-slate-800 dark:text-white cursor-pointer transition-all appearance-none bg-[#F4F3EF]/50 hover:bg-white dark:hover:bg-slate-700"
                  >
                    <option value="">Select Role (Optional)</option>
                    {roleTypes.map(role => (<option key={role.name} value={role.name}>{role.name}</option>))}
                    <option value="__custom__">+ Custom Role</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
                </div>
                {selectedUploadRoleType === '__custom__' && (
                  <input type="text" value={customUploadRoleType} onChange={(e) => setCustomUploadRoleType(e.target.value)} placeholder="Enter custom role name" className="w-full h-14 px-6 rounded-2xl border border-[#F4F3EF] dark:border-slate-700 text-sm mt-3 font-bold focus:outline-none focus:border-[#1B4DA0] dark:bg-slate-800 dark:text-white bg-[#F4F3EF]/50 transition-all" />
                )}
              </div>

              {/* Resume Upload */}
              <div>
                <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-2 block">Upload Resume *</label>
                <label className="cursor-pointer block">
                  <div className={`w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${pendingUploadFiles.length
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

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedRowIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-3xl px-4">
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              className={`rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/20 p-4 flex items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900/95' : 'bg-[#1A1A2E]/95'
                } text-white`}
            >
              <div className="flex items-center gap-4 pl-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  {selectedRowIds.length}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Selected</p>
                  <p className="text-[10px] font-medium opacity-60">Talent Profiles</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setAssigningResumeIds(selectedRowIds);
                    setSelectedPositionId('');
                    setShowAssignModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-bold"
                >
                  <Briefcase size={14} className="text-emerald-400" />
                  Assign Jobs
                </button>

                <div className="w-px h-8 bg-white/10 mx-1" />

                <button
                  onClick={() => setSelectedRowIds([])}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBankTab;