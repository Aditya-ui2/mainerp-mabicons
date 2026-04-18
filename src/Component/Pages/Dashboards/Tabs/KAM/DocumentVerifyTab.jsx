import React, { useState, useEffect } from 'react';
import {
  FiFileText,
  FiCheck,
  FiX,
  FiClock,
  FiUpload,
  FiSearch,
  FiChevronRight,
  FiShield,
  FiExternalLink,
  FiUsers,
  FiZap,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDownload,
  FiEye,
  FiMail,
  FiRefreshCw
} from 'react-icons/fi';
import { BadgeCheck, Send, ShieldCheck, FileSearch, Fingerprint, User, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllCandidates, verifyCandidateKYC, attachFinalOfferLetter, generateCandidateCredentials, BASE_URL } from '../../../service/api';
import { toast } from 'sonner';

/**
 * Standardized Document Verification Tab
 * Font: Outfit (Standard Premium)
 */
const DocumentVerifyTab = ({ isDarkMode = false }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('pan');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    console.log('DocumentVerifyTab Effect running...');
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      console.log('Fetching candidates for verification...');
      setLoading(true);
      const res = await getAllCandidates();
      console.log('API Response received:', res?.success);
      if (res && res.success) {
        const rawData = Array.isArray(res.data) ? res.data : [];
        const filtered = rawData.filter(c =>
          ['Selected', 'Document Verification', 'Offer Sent', 'Hired', 'Joined'].includes(c.stage) ||
          (c.kycDocuments && Object.keys(c.kycDocuments).length > 0)
        );
        console.log('Filtered candidates count:', filtered.length);
        setCandidates(filtered);
        if (filtered.length > 0 && !selectedCandidateId) {
          setSelectedCandidateId(filtered[0].id);
        }
      } else {
        console.warn('API Response was not successful');
      }
    } catch (err) {
      console.error('Fetch error in DocumentVerifyTab:', err);
      toast.error('API Synchronization Failure');
    } finally {
      setLoading(false);
    }
  };

  const selectedCandidate = candidates ? candidates.find(c => c.id === selectedCandidateId) : null;
  const filteredCandidates = candidates.filter(c => {
    const name = c.name || '';
    const email = c.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleVerify = async (candidateId, docType, action) => {
    try {
      const status = action === 'verified' ? 'Verified' : 'Rejected';
      const res = await verifyCandidateKYC({ candidateId, docType, status });
      if (res && res.success) {
        toast.success(`Document marked as ${status}`);
        fetchCandidates();
      }
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const openRejectModal = (candidateId, docType) => {
    setRejectingDoc({ candidateId, docType });
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectWithEmail = async () => {
    if (!rejectingDoc) return;
    
    try {
      const loadingId = toast.loading('Rejecting document & sending email...');
      const res = await verifyCandidateKYC({ 
        candidateId: rejectingDoc.candidateId, 
        docType: rejectingDoc.docType, 
        status: 'rejected',
        rejectionReason: rejectionReason || 'Document could not be verified. Please re-upload a valid document.'
      });
      
      if (res && res.success) {
        toast.success('Document rejected & email sent to candidate', { id: loadingId });
        fetchCandidates();
        setShowRejectModal(false);
        setRejectingDoc(null);
        setRejectionReason('');
      }
    } catch (err) {
      toast.error('Failed to reject document');
    }
  };

  const getDocUrl = (doc) => {
    if (!doc?.url) return null;
    return doc.url.startsWith('http') ? doc.url : `${BASE_URL}${doc.url}`;
  };

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Document downloaded');
    } catch (err) {
      toast.error('Download failed');
      window.open(url, '_blank');
    }
  };

  const handleAttachOffer = async (e, candidateId) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('offerLetter', file);
    formData.append('candidateId', candidateId);
    try {
      toast.loading('Processing...', { id: 'upload' });
      const res = await attachFinalOfferLetter(formData);
      if (res && res.success) {
        toast.success('Offer Letter Attached', { id: 'upload' });
        fetchCandidates();
      }
    } catch (err) {
      toast.error('Upload failed', { id: 'upload' });
    }
  };

  const handleGenerateCredentials = async (candidate) => {
    try {
      toast.loading('Generating Credentials...', { id: 'creds' });
      const res = await generateCandidateCredentials(candidate.id);
      if (res && res.success) {
        toast.success(`Credentials generated for ${candidate.email}`, { id: 'creds' });
        
        // Construct mailto link for manual sending
        const subject = encodeURIComponent("Your Mabicons ERP Login Credentials");
        const body = encodeURIComponent(`Dear ${candidate.name},

Welcome to Mabicons! Your ERP login credentials have been generated.

Login URL: https://erp.mabicons.com
Email: ${candidate.email}
Password: ${res.data.password}

Best Regards,
Mabicons Recruitment Team`);

        window.location.href = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to generate credentials', { id: 'creds' });
    }
  };

  if (loading && candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] w-full h-[400px]">
        <div className="w-10 h-10 border-4 border-[#3056D3] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing Archive...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] overflow-hidden font-['Outfit'] text-slate-900 text-left">

      {/* STANDARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#1B4DA0] text-white flex items-center justify-center shadow-xl shadow-blue-500/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-syne">Handover Verification</h1>
            <p className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[0.2em] mt-0.5">Audit & Assets Management Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1B4DA0] transition-colors" />             
          </div>
          {selectedCandidate && (
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => handleAttachOffer(e, selectedCandidate.id)} />   
            </label>
          )}
        </div>
      </div>

      {/* LIST PANEL */}
      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        <div className="w-[380px] flex flex-col gap-5 overflow-y-auto pr-4 custom-scrollbar pb-12 h-full">
          {filteredCandidates.map(c => (
            <motion.div
              key={c.id}
              onClick={() => setSelectedCandidateId(c.id)}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-[2rem] cursor-pointer transition-all duration-300 border relative overflow-hidden flex-shrink-0 min-h-[90px] flex items-center group ${
                selectedCandidateId === c.id
                  ? (isDarkMode ? 'bg-[#1B4DA0]/10 border-[#1B4DA0] shadow-2xl shadow-[#1B4DA0]/20' : 'bg-white border-[#1B4DA0] shadow-xl shadow-[#1B4DA0]/10 ring-1 ring-[#1B4DA0]/5')
                  : (isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-lg')
              }`}
            >
              {selectedCandidateId === c.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1B4DA0]" />
              )}
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center transition-colors ${
                  selectedCandidateId === c.id ? 'bg-[#1B4DA0] text-white shadow-xl shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-800'
                }`}>
                  <User size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-[15px] font-bold tracking-tight truncate font-syne ${
                    selectedCandidateId === c.id ? 'text-[#1B4DA0]' : (isDarkMode ? 'text-white' : 'text-slate-900')
                  }`}>{c.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText size={10} className="text-[#1B4DA0]/40 dark:text-slate-500" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {c.position?.title || 'System Audit'}
                    </p>
                  </div>
                </div>
                <FiChevronRight className={`transition-transform ${selectedCandidateId === c.id ? 'text-[#1B4DA0] rotate-90' : 'text-slate-300'}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className={`flex-1 rounded-[3rem] border overflow-hidden flex flex-col shadow-2xl transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          {selectedCandidate ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className={`px-10 py-8 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-[#FAFBFC] border-slate-50'
              }`}>
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.25rem] border flex items-center justify-center text-xl font-bold shadow-sm transition-colors ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-[#1B4DA0]'
                  }`}>
                    {selectedCandidate?.name?.[0] || '?'}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold font-syne ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedCandidate?.name || 'Unknown Candidate'}
                    </h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">
                        {selectedCandidate?.email || 'OFFLINE ASSET'}
                      </p>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <div className="flex items-center gap-1">
                        <ShieldCheck size={12} className="text-[#1B4DA0]" />
                        <span className="text-[9px] font-black text-[#1B4DA0] uppercase tracking-widest">Secured Node</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1.5 p-1.5 rounded-[1.25rem] border ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100/50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[600px]">
                    {[
                      { id: 'pan', label: 'PAN', required: true },
                      { id: 'aadhar', label: 'AADHAR', required: true },
                      { id: 'payslips', label: 'PAYSLIPS', required: true },
                      { id: 'bank_statement', label: 'BANK', required: true },
                      { id: 'degree', label: 'DEGREE', required: true },
                      { id: 'marksheet', label: 'MARKSHEET', required: true },
                      { id: 'appointment_letter', label: 'APPT', required: false },
                      { id: 'relieving_letter', label: 'RELIEVE', required: false },
                    ].map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocType(doc.id)}
                        className={`px-3 py-2.5 rounded-xl text-[9px] uppercase font-bold tracking-widest transition-all whitespace-nowrap ${
                          selectedDocType === doc.id
                            ? (isDarkMode ? 'bg-[#1B4DA0] text-white shadow-lg' : 'bg-white shadow-md text-[#1B4DA0] ring-1 ring-[#1B4DA0]/5')
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        {doc.label} {doc.required && <span className="text-rose-500">*</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                {selectedCandidate.kycDocuments?.[selectedDocType] ? (
                  <div className="flex flex-col gap-8 h-full min-h-0">
                    {/* Document Preview Card */}
                    <div className={`flex-1 min-h-[400px] rounded-3xl overflow-hidden relative group shadow-xl transition-all border ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      {/* Document Status Badge */}
                      {selectedCandidate.kycDocuments[selectedDocType].verified !== undefined && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            selectedCandidate.kycDocuments[selectedDocType].verified 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-rose-500 text-white'
                          }`}>
                            {selectedCandidate.kycDocuments[selectedDocType].verified ? (
                              <><FiCheckCircle size={12} /> Verified</>
                            ) : (
                              <><FiXCircle size={12} /> Rejected</>
                            )}
                          </span>
                        </div>
                      )}
                      
                      {/* Document Image */}
                      <img
                        src={getDocUrl(selectedCandidate.kycDocuments[selectedDocType])}
                        className="w-full h-full object-contain p-4" 
                        alt={`${selectedDocType} document`}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                      
                      {/* Fallback for non-image files */}
                      <div className="hidden absolute inset-0 flex-col items-center justify-center gap-6 bg-slate-100 dark:bg-slate-900">
                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
                          isDarkMode ? 'bg-slate-800' : 'bg-white shadow-lg'
                        }`}>
                          <FiFileText size={40} className="text-[#1B4DA0]" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          Document preview not available
                        </p>
                      </div>
                      
                      {/* Quick Action Buttons - Top Right */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(getDocUrl(selectedCandidate.kycDocuments[selectedDocType]), '_blank')}
                          className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-[#1B4DA0] hover:bg-blue-50 transition-all"
                          title="View Full Screen"
                        >
                          <FiEye size={18} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(
                            getDocUrl(selectedCandidate.kycDocuments[selectedDocType]),
                            `${selectedCandidate.name}_${selectedDocType}`
                          )}
                          className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                          title="Download"
                        >
                          <FiDownload size={18} />
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Action Buttons Row */}
                    <div className="flex gap-4">
                      {/* View Button */}
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open(getDocUrl(selectedCandidate.kycDocuments[selectedDocType]), '_blank')}
                        className={`flex-1 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <FiEye size={18} /> View Document
                      </motion.button>
                      
                      {/* Download Button */}
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(
                          getDocUrl(selectedCandidate.kycDocuments[selectedDocType]),
                          `${selectedCandidate.name}_${selectedDocType}`
                        )}
                        className={`flex-1 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                          isDarkMode ? 'bg-[#1B4DA0] text-white hover:bg-[#164088]' : 'bg-[#1B4DA0] text-white hover:bg-[#164088]'
                        } shadow-lg shadow-blue-500/20`}
                      >
                        <FiDownload size={18} /> Download
                      </motion.button>
                    </div>

                    {/* Verification Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 pb-6">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleVerify(selectedCandidate.id, selectedDocType, 'verified')} 
                        className="py-4 bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FiCheckCircle size={18} /> Approve Document
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openRejectModal(selectedCandidate.id, selectedDocType)} 
                        className="py-4 bg-rose-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FiMail size={18} /> Reject & Notify
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-32">
                    <div className="text-center max-w-sm">
                      <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                        isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
                      }`}>
                        <FiClock size={32} className="text-slate-400" />
                      </div>
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">Pending Upload</p>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Candidate has not uploaded this document yet. They will receive a reminder to complete their KYC.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-100 dark:border-slate-800 animate-[spin_40s_linear_infinite] mb-10" />
              <p className="text-[12px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[10px]">Queue Standby</p>
              <p className="text-[10px] font-bold text-slate-200 dark:text-slate-800 uppercase tracking-widest mt-4">Select a candidate node to initiate audit</p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
                isDarkMode ? 'bg-slate-900' : 'bg-white'
              }`}
            >
              {/* Modal Header */}
              <div className={`px-6 py-5 border-b flex items-center justify-between ${
                isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                    <FiMail className="text-rose-500" size={20} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reject Document</h3>
                    <p className="text-xs text-slate-500">Candidate will be notified via email</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Document is blurry, expired, or information doesn't match..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[#1B4DA0]/20 ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <p className="mt-2 text-xs text-slate-400">
                  This message will be included in the email sent to the candidate.
                </p>
              </div>

              {/* Modal Footer */}
              <div className={`px-6 py-4 border-t flex gap-3 ${
                isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'
              }`}>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    isDarkMode 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectWithEmail}
                  disabled={!rejectionReason.trim()}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    rejectionReason.trim()
                      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <FiMail size={16} /> Reject & Send Email
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentVerifyTab;