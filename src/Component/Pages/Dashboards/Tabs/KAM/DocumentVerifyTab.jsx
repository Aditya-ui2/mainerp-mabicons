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
  FiAlertCircle
} from 'react-icons/fi';
import { BadgeCheck, Send, ShieldCheck, FileSearch, Fingerprint, User, FileText } from 'lucide-react';
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
        toast.success(`Marked as ${status}`);
        fetchCandidates();
      }
    } catch (err) {
      toast.error('Verification failed');
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
            <input
              type="text"
              placeholder="Search delegation node..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-12 pr-6 py-4 rounded-2xl border shadow-sm text-sm font-bold w-[300px] outline-none transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-[#1B4DA0]' : 'bg-white border-slate-100 focus:border-[#1B4DA0]'
              }`}
            />
          </div>
          {selectedCandidate && (
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => handleAttachOffer(e, selectedCandidate.id)} />
              <div className="px-8 py-3.5 bg-[#1B4DA0] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-500/10 hover:bg-[#15418a] hover:scale-105 active:scale-95 transition-all">
                <FiUpload size={16} /> New Asset Handover
              </div>
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
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[450px]">
                    {[
                      { id: 'pan', label: 'PAN' },
                      { id: 'aadhar', label: 'AADHAR' },
                      { id: 'payslips', label: 'PAYSLIPS' },
                      { id: 'bank_statement', label: 'BANK' },
                      { id: 'degree', label: 'DEGREE' },
                      { id: 'marksheet', label: 'MARKSHEET' },
                    ].map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocType(doc.id)}
                        className={`px-4 py-2.5 rounded-xl text-[9px] uppercase font-bold tracking-widest transition-all whitespace-nowrap ${
                          selectedDocType === doc.id
                            ? (isDarkMode ? 'bg-[#1B4DA0] text-white shadow-lg' : 'bg-white shadow-md text-[#1B4DA0] ring-1 ring-[#1B4DA0]/5')
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        {doc.label} {doc.id === 'pan' && <span className="text-rose-500">*</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                {selectedCandidate.kycDocuments?.[selectedDocType] ? (
                  <div className="flex flex-col gap-10 h-full min-h-0">
                    <div className={`flex-1 min-h-[450px] rounded-[3.5rem] overflow-hidden relative group shadow-2xl transition-all border-4 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-50'
                    }`}>
                      <img
                        src={`${BASE_URL}${selectedCandidate.kycDocuments[selectedDocType].url}`}
                        className="w-full h-full object-contain" alt="KYC"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                      <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-white gap-6 bg-slate-950/90 backdrop-blur-md">
                        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                           <FileSearch size={40} className="text-[#1B4DA0]" />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-bold uppercase tracking-[6px] text-[#1B4DA0] mb-4">Secured Transmission</p>
                          <a href={`${BASE_URL}${selectedCandidate.kycDocuments[selectedDocType].url}`} target="_blank" rel="noreferrer" 
                             className="px-10 py-5 bg-[#1B4DA0] rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-[#15418a] transition-all shadow-2xl shadow-blue-500/20 inline-flex items-center gap-3">
                             <FiDownload /> Download Core Asset
                          </a>
                        </div>
                      </div>
                      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                        <button onClick={() => window.open(`${BASE_URL}${selectedCandidate.kycDocuments[selectedDocType].url}`, '_blank')} 
                                className="w-14 h-14 rounded-2xl bg-white text-slate-900 shadow-2xl hover:bg-[#1B4DA0] hover:text-white transition-all flex items-center justify-center">
                          <FiExternalLink size={24} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pb-10">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleVerify(selectedCandidate.id, selectedDocType, 'verified')} 
                        className="py-5 bg-[#10b981] text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                      >
                        <FiCheckCircle size={18} /> Approve Coordinate
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleVerify(selectedCandidate.id, selectedDocType, 'rejected')} 
                        className={`py-5 border-2 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                          isDarkMode ? 'border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'border-rose-100 bg-white text-rose-500 hover:border-rose-200 hover:bg-rose-50'
                        }`}
                      >
                        <FiXCircle size={18} /> Decline Audit
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-10 py-32">
                    <div className="relative">
                       <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-800 animate-[spin_15s_linear_infinite]" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Fingerprint size={48} className="text-slate-100 dark:text-slate-800" />
                       </div>
                    </div>
                    <div className="text-center max-w-sm">
                      <p className="text-xs font-bold uppercase tracking-[8px] text-slate-400 dark:text-slate-600">Encrypted Pending</p>
                      <p className={`text-[11px] font-bold mt-4 leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Digital transmission not received from source.
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
    </div>
  );
};

export default DocumentVerifyTab;