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
  FiUsers
} from 'react-icons/fi';
import { getAllCandidates, verifyCandidateKYC, attachFinalOfferLetter, BASE_URL } from '../../../service/api';
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
  const [selectedDocType, setSelectedDocType] = useState('aadhar');

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
          ['Selected', 'Document Verification', 'Offer Sent', 'Hired'].includes(c.stage) ||
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3056D3] text-white flex items-center justify-center shadow-lg shadow-[#3056D3]/20">
            <FiShield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Document Verification</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Audit & Asset Verification Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search delegation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-medium w-[260px] focus:ring-2 focus:ring-[#3056D3]/5 outline-none transition-all"
            />
          </div>
          {selectedCandidate && (
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => handleAttachOffer(e, selectedCandidate.id)} />
              <div className="px-6 py-3.5 bg-[#3056D3] text-white rounded-2xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#3056D3]/10 hover:bg-[#254adb] transition-all">
                <FiUpload size={14} /> NEW HANDOVER
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">

        {/* LIST PANEL */}
        <div className="w-[340px] flex flex-col gap-3 overflow-y-auto no-scrollbar pb-10">
          {filteredCandidates.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedCandidateId(c.id)}
              className={`p-4 rounded-[2rem] cursor-pointer transition-all duration-200 border ${selectedCandidateId === c.id
                  ? 'bg-white border-[#3056D3] shadow-xl shadow-[#3056D3]/5 ring-1 ring-[#3056D3]/5'
                  : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${selectedCandidateId === c.id ? 'bg-[#3056D3] text-white' : 'bg-slate-50 text-slate-500'
                  }`}>
                  {(c.name || 'U')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${selectedCandidateId === c.id ? 'text-[#3056D3]' : 'text-slate-900'}`}>{c.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {c.position || 'Recruitment Pipeline'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 overflow-hidden flex flex-col shadow-sm">
          {selectedCandidate ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 bg-[#fafbfc] flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#3056D3] text-xl font-bold shadow-sm">
                    {selectedCandidate.name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedCandidate.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{selectedCandidate.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 rounded-xl border border-slate-100">
                  {['aadhar', 'pan', 'educational', 'experience'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedDocType(type)}
                      className={`px-4 py-2.5 rounded-lg text-[9px] uppercase font-bold tracking-widest transition-all ${selectedDocType === type
                          ? 'bg-white shadow-sm text-[#3056D3]'
                          : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-10 overflow-y-auto no-scrollbar bg-white">
                {selectedCandidate.kycDocuments?.[selectedDocType] ? (
                  <div className="flex flex-col gap-8 h-full min-h-0">
                    <div className="flex-1 min-h-[400px] rounded-[3rem] bg-slate-900 overflow-hidden relative group shadow-2xl">
                      <img
                        src={`${BASE_URL}${selectedCandidate.kycDocuments[selectedDocType].url}`}
                        className="w-full h-full object-contain" alt="KYC"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                      <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-white gap-4 bg-slate-900">
                        <FiFileText size={48} className="text-slate-800" />
                        <div className="text-center">
                          <p className="text-[10px] font-bold uppercase tracking-[4px] text-[#3056D3] mb-3">Gateway Encrypted</p>
                          <a href={`${BASE_URL}${selectedCandidate.kycDocuments[selectedDocType].url}`} target="_blank" rel="noreferrer" className="px-8 py-4 bg-[#3056D3] rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#254adb] transition-all shadow-lg shadow-[#3056D3]/20">Download Asset</a>
                        </div>
                      </div>
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                        <button onClick={() => window.open(`${BASE_URL}${selectedCandidate.kycDocuments[selectedDocType].url}`, '_blank')} className="p-4 rounded-2xl bg-white text-slate-900 shadow-2xl hover:bg-slate-50"><FiExternalLink size={20} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pb-8">
                      <button onClick={() => handleVerify(selectedCandidate.id, selectedDocType, 'verified')} className="py-5 bg-[#10b981] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all select-none">Verify Coordinate</button>
                      <button onClick={() => handleVerify(selectedCandidate.id, selectedDocType, 'rejected')} className="py-5 bg-white border border-rose-100 text-[#ef4444] rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-rose-50 transition-all select-none">Reject Audit</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 gap-6 py-20">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 animate-[spin_10s_linear_infinite]" />
                    <div className="text-center">
                      <p className="text-[11px] font-bold uppercase tracking-[6px] text-slate-500">Transmission Pending</p>
                      <p className="text-[9px] font-medium text-slate-400 mt-2 uppercase tracking-widest italic">Digital transmission not received from source.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-30 text-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 animate-[spin_30s_linear_infinite] mb-8" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[6px]">Selection Pending from Archive</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVerifyTab;