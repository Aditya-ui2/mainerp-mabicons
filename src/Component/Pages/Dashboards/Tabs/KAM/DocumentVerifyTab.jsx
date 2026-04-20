import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ChevronRight, 
  Download, 
  Eye, 
  Mail, 
  Archive, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ChevronDown, 
  Building2,
  Search,
  Filter,
  User,
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllCandidates, verifyCandidateKYC, BASE_URL, syncSharePointAll } from '../../../service/api';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Document Verification Tab - Interview Schedule Format
 * Standardized UI matching the Interview Schedule page
 */

// Mandatory Documents (Required)
const DOC_TYPES = [
  // PAN Card - Front & Back (Mandatory)
  { id: 'pan_front', label: 'PAN Card (Front)', required: true, group: 'pan' },
  { id: 'pan_back', label: 'PAN Card (Back)', required: true, group: 'pan' },
  
  // Aadhar Card - Front & Back (Mandatory)
  { id: 'aadhar_front', label: 'Aadhar Card (Front)', required: true, group: 'aadhar' },
  { id: 'aadhar_back', label: 'Aadhar Card (Back)', required: true, group: 'aadhar' },
  
  // 10th & 12th Marksheet (Mandatory)
  { id: 'marksheet_10', label: '10th Marksheet', required: true },
  { id: 'marksheet_12', label: '12th Marksheet', required: true },
  
  // University Marksheets - Semester 1-8 (Optional)
  { id: 'semester_1', label: 'Semester 1', required: false, group: 'university' },
  { id: 'semester_2', label: 'Semester 2', required: false, group: 'university' },
  { id: 'semester_3', label: 'Semester 3', required: false, group: 'university' },
  { id: 'semester_4', label: 'Semester 4', required: false, group: 'university' },
  { id: 'semester_5', label: 'Semester 5', required: false, group: 'university' },
  { id: 'semester_6', label: 'Semester 6', required: false, group: 'university' },
  { id: 'semester_7', label: 'Semester 7', required: false, group: 'university' },
  { id: 'semester_8', label: 'Semester 8', required: false, group: 'university' },
  
  // Degree Certificate (Optional)
  { id: 'degree', label: 'Degree Certificate', required: false },
  
  // Pay Slips - Last 3 months (Optional)
  { id: 'payslip_1', label: 'Pay Slip (Month 1)', required: false, group: 'payslips' },
  { id: 'payslip_2', label: 'Pay Slip (Month 2)', required: false, group: 'payslips' },
  { id: 'payslip_3', label: 'Pay Slip (Month 3)', required: false, group: 'payslips' },
  
  // Bank Statement - Last 3 months (Optional)
  { id: 'bank_statement', label: 'Bank Statement (3 months)', required: false },
  
  // Appointment Letter (Optional)
  { id: 'appointment_letter', label: 'Appointment Letter', required: false },
  
  // Relieving/Experience Letter (Optional)
  { id: 'relieving_letter', label: 'Relieving Letter', required: false },
];

const DOC_GROUPS = [
  { id: 'pan', label: 'PAN Card', docs: ['pan_front', 'pan_back'] },
  { id: 'aadhar', label: 'Aadhar Card', docs: ['aadhar_front', 'aadhar_back'] },
  { id: 'university', label: 'University Marksheets', docs: ['semester_1', 'semester_2', 'semester_3', 'semester_4', 'semester_5', 'semester_6', 'semester_7', 'semester_8'] },
  { id: 'payslips', label: 'Pay Slips (3 Months)', docs: ['payslip_1', 'payslip_2', 'payslip_3'] },
];

const TOTAL_DOCS = DOC_TYPES.length; // 23 documents

const getDocUrl = (doc) => {
  if (!doc?.url) return null;
  return doc.url.startsWith('http') ? doc.url : `${BASE_URL}${doc.url}`;
};

const StatusBadge = ({ status }) => {
  const configs = {
    verified: { label: 'Verified', icon: CheckCircle, bg: 'bg-emerald-500', text: 'text-white' },
    rejected: { label: 'Rejected', icon: XCircle, bg: 'bg-rose-500', text: 'text-white' },
    pending: { label: 'Pending', icon: Clock, bg: 'bg-amber-500', text: 'text-white' }
  };
  const config = configs[status] || configs.pending;
  const Icon = config.icon;
  return (
    <span className={`px-3 py-1.5 rounded-lg ${config.bg} ${config.text} text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm`}>
      <Icon size={12} /> {config.label}
    </span>
  );
};

const DocumentVerifyTab = ({ isDarkMode = false }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('pan_front');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await getAllCandidates();
      if (res && res.success) {
        const rawData = Array.isArray(res.data) ? res.data : [];
        const filtered = rawData.filter(c =>
          ['Selected', 'Document Verification', 'Offer Sent', 'Hired', 'Joined'].includes(c.stage) ||
          (c.kycDocuments && Object.keys(c.kycDocuments).length > 0)
        );
        setCandidates(filtered);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncSharePointAll();
      await fetchCandidates();
      toast.success('Data synced successfully');
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const getDocumentStats = (candidate) => {
    const docs = candidate.kycDocuments || {};
    let uploaded = 0;
    let verified = 0;
    let rejected = 0;
    let pending = 0;

    DOC_TYPES.forEach(doc => {
      if (docs[doc.id]) {
        uploaded++;
        if (docs[doc.id].verified === true) verified++;
        else if (docs[doc.id].verified === false) rejected++;
        else pending++;
      }
    });

    return { uploaded, verified, rejected, pending, total: TOTAL_DOCS };
  };

  const handleVerify = async (candidateId, docType, action) => {
    try {
      const status = action === 'verified' ? 'verified' : 'rejected';
      const res = await verifyCandidateKYC({ candidateId, docType, status });
      if (res && res.success) {
        toast.success(`Document ${status}`);
        fetchCandidates();
        // Update selected candidate
        if (selectedCandidate?.id === candidateId) {
          const updated = candidates.find(c => c.id === candidateId);
          if (updated) setSelectedCandidate({ ...updated });
        }
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
        toast.success('Document rejected & email sent', { id: loadingId });
        fetchCandidates();
        setShowRejectModal(false);
        setRejectingDoc(null);
        setRejectionReason('');
      }
    } catch (err) {
      toast.error('Failed to reject document');
    }
  };

  const handleDownloadSingle = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, fileName);
      toast.success('Document downloaded');
    } catch (err) {
      toast.error('Download failed');
      window.open(url, '_blank');
    }
  };

  const handleDownloadAllAsZip = async (candidate) => {
    const docs = candidate.kycDocuments || {};
    const availableDocs = DOC_TYPES.filter(d => docs[d.id]?.url);

    if (availableDocs.length === 0) {
      toast.error('No documents to download');
      return;
    }

    try {
      setDownloadingZip(true);
      const loadingId = toast.loading('Preparing ZIP file...');

      const zip = new JSZip();
      const folder = zip.folder(`${candidate.name}_documents`);

      for (const doc of availableDocs) {
        const url = getDocUrl(docs[doc.id]);
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const ext = docs[doc.id].url.split('.').pop() || 'pdf';
          folder.file(`${doc.label}.${ext}`, blob);
        } catch (e) {
          console.error(`Failed to fetch ${doc.label}:`, e);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${candidate.name}_documents.zip`);
      toast.success('ZIP downloaded successfully', { id: loadingId });
    } catch (err) {
      console.error('ZIP error:', err);
      toast.error('Failed to create ZIP');
    } finally {
      setDownloadingZip(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.position?.title || '').toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const stats = getDocumentStats(c);
        if (statusFilter === 'pending') matchesStatus = stats.pending > 0;
        else if (statusFilter === 'verified') matchesStatus = stats.verified === stats.uploaded && stats.uploaded > 0;
        else if (statusFilter === 'rejected') matchesStatus = stats.rejected > 0;
        else if (statusFilter === 'incomplete') matchesStatus = stats.uploaded < DOC_TYPES.filter(d => d.required).length;
      }

      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchTerm, statusFilter]);

  const stats = useMemo(() => [
    { label: "Total Candidates", value: candidates.length, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Review", value: candidates.filter(c => getDocumentStats(c).pending > 0).length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Fully Verified", value: candidates.filter(c => { const s = getDocumentStats(c); return s.verified === s.uploaded && s.uploaded > 0; }).length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Action Required", value: candidates.filter(c => getDocumentStats(c).rejected > 0).length, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ], [candidates]);

  if (loading && candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl">
        <div className="w-10 h-10 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-left" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Document Verification
          </h1>
        </div>
        <div className="flex gap-3">
          
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate, email or position..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[160px]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Fully Verified</option>
            <option value="rejected">Action Required</option>
            <option value="incomplete">Incomplete KYC</option>
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
        </div>
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[minmax(200px,1.5fr)_1.5fr_1.5fr_120px_140px_40px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
          <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest pl-4">Candidate</div>
          <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Position</div>
          <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Client</div>
          <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Documents</div>
          <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Actions</div>
          <div></div>
        </div>

        {/* Table Body */}
        {filteredCandidates.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No candidates found</p>
          </div>
        ) : (
          filteredCandidates.map((candidate) => {
            const docStats = getDocumentStats(candidate);

            return (
              <div
                key={candidate.id}
                onClick={() => { setSelectedCandidate(candidate); setSelectedDocType('pan_front'); setOpenDropdown(null); }}
                className={`grid grid-cols-[minmax(200px,1.5fr)_1.5fr_1.5fr_120px_140px_40px] gap-4 items-center px-8 py-4 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group relative`}
              >
                {/* Candidate Name */}
                <div className="flex items-center pl-4">
                  <p className="text-[14px] font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">
                    {candidate.name || 'Unknown'}
                  </p>
                </div>

                {/* Position */}
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-[#1A1A2E]">{
                    (() => {
                      const posTitle = candidate.position?.title || candidate.jobTitle || candidate.positionTitle || 'Not Assigned';
                      // Remove trailing " - N" pattern (where N is a number)
                      return posTitle.replace(/\s*-\s*\d+$/, '');
                    })()
                  }</p>
                </div>

                {/* Client */}
                <div className="min-w-0 text-center">
                  <p className="text-[13px] font-semibold text-[#1A1A2E] truncate">{candidate.clientName || candidate.client?.companyName || candidate.client?.name || candidate.position?.clientName || 'Not Assigned'}</p>
                </div>

                {/* Documents Status */}
                <div className="flex items-center justify-center">
                  <div className={`px-3 py-1.5 rounded-lg font-bold text-[12px] ${docStats.uploaded === TOTAL_DOCS ? 'bg-emerald-100 text-emerald-700' : docStats.uploaded > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {docStats.uploaded}/{TOTAL_DOCS}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { setSelectedCandidate(candidate); setSelectedDocType('pan_front'); setOpenDropdown(null); }}
                    className="px-4 py-2 bg-[#1B4DA0] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#164088] transition-all"
                  >
                    <Eye size={12} /> Review
                  </button>
                </div>

                {/* Chevron */}
                <div className="flex justify-end">
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-[#1B4DA0] transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Sidebar */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex justify-end"
            onClick={() => setSelectedCandidate(null)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[600px] h-full bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#1B4DA0] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                      {(selectedCandidate.name || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {selectedCandidate.name}
                      </h2>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        {selectedCandidate.email}
                      </p>
                      {/* Client Info */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 size={12} className="text-[#1B4DA0]" />
                        <p className="text-[11px] font-semibold text-[#1B4DA0]">
                          {selectedCandidate.client?.companyName || selectedCandidate.client?.name || (typeof selectedCandidate.client === 'string' ? selectedCandidate.client : 'Internal')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Download All Button */}
                <div className="mt-4">
                  <button
                    onClick={() => handleDownloadAllAsZip(selectedCandidate)}
                    disabled={downloadingZip || getDocumentStats(selectedCandidate).uploaded === 0}
                    className="w-full py-3 bg-[#1B4DA0] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#164088] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                  >
                    {downloadingZip ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Preparing ZIP...
                      </>
                    ) : (
                      <>
                        <Download size={16} /> Download All Documents as ZIP
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Document Tabs with Dropdowns */}
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap gap-2">
                  {/* Grouped Documents with Dropdowns */}
                  {DOC_GROUPS.map(group => {
                    const groupDocs = DOC_TYPES.filter(d => group.docs.includes(d.id));
                    const isGroupSelected = group.docs.includes(selectedDocType);
                    const isOpen = openDropdown === group.id;
                    
                    // Check if any doc in group is uploaded
                    const hasAnyDoc = groupDocs.some(d => selectedCandidate.kycDocuments?.[d.id]);
                    const allVerified = groupDocs.every(d => selectedCandidate.kycDocuments?.[d.id]?.verified === true);
                    const anyRejected = groupDocs.some(d => selectedCandidate.kycDocuments?.[d.id]?.verified === false);

                    return (
                      <div key={group.id} className="relative">
                        <button
                          onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                          className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            isGroupSelected
                              ? 'bg-[#1B4DA0] text-white shadow-md'
                              : hasAnyDoc
                                ? allVerified
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : anyRejected
                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {hasAnyDoc ? (
                            allVerified ? <CheckCircle size={10} /> :
                              anyRejected ? <XCircle size={10} /> :
                                <Clock size={10} />
                          ) : null}
                          {group.label}
                          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 z-50 min-w-[180px] overflow-hidden"
                            >
                              {groupDocs.map(doc => {
                                const docData = selectedCandidate.kycDocuments?.[doc.id];
                                const hasDoc = !!docData;
                                const isVerified = docData?.verified === true;
                                const isRejected = docData?.verified === false;

                                return (
                                  <button
                                    key={doc.id}
                                    onClick={() => { setSelectedDocType(doc.id); setOpenDropdown(null); }}
                                    className={`w-full px-4 py-2.5 text-left text-[11px] font-semibold flex items-center justify-between hover:bg-slate-50 transition-all ${
                                      selectedDocType === doc.id ? 'bg-blue-50 text-[#1B4DA0]' : 'text-slate-600'
                                    }`}
                                  >
                                    <span>{doc.label}</span>
                                    {hasDoc ? (
                                      isVerified ? <CheckCircle size={12} className="text-emerald-500" /> :
                                        isRejected ? <XCircle size={12} className="text-rose-500" /> :
                                          <Clock size={12} className="text-amber-500" />
                                    ) : (
                                      <span className="text-[9px] text-slate-400">Not uploaded</span>
                                    )}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {/* Non-grouped Documents */}
                  {DOC_TYPES.filter(doc => !doc.group).map(doc => {
                    const docData = selectedCandidate.kycDocuments?.[doc.id];
                    const hasDoc = !!docData;
                    const isVerified = docData?.verified === true;
                    const isRejected = docData?.verified === false;

                    return (
                      <button
                        key={doc.id}
                        onClick={() => { setSelectedDocType(doc.id); setOpenDropdown(null); }}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedDocType === doc.id
                            ? 'bg-[#1B4DA0] text-white shadow-md'
                            : hasDoc
                              ? isVerified
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : isRejected
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                      >
                        {hasDoc ? (
                          isVerified ? <CheckCircle size={10} /> :
                            isRejected ? <XCircle size={10} /> :
                              <Clock size={10} />
                        ) : null}
                        {doc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedCandidate.kycDocuments?.[selectedDocType] ? (
                  <div className="space-y-4">
                    {/* Document Preview */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        {selectedCandidate.kycDocuments[selectedDocType].verified === true ? (
                          <StatusBadge status="verified" />
                        ) : selectedCandidate.kycDocuments[selectedDocType].verified === false ? (
                          <StatusBadge status="rejected" />
                        ) : (
                          <StatusBadge status="pending" />
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => window.open(getDocUrl(selectedCandidate.kycDocuments[selectedDocType]), '_blank')}
                          className="w-9 h-9 rounded-lg bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-[#1B4DA0] hover:bg-blue-50 transition-all"
                          title="View Full Screen"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(
                            getDocUrl(selectedCandidate.kycDocuments[selectedDocType]),
                            `${selectedCandidate.name}_${selectedDocType}`
                          )}
                          className="w-9 h-9 rounded-lg bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                      </div>

                      {/* Image Preview */}
                      <img
                        src={getDocUrl(selectedCandidate.kycDocuments[selectedDocType])}
                        alt={selectedDocType}
                        className="w-full h-[300px] object-contain p-4"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                      <div className="hidden h-[300px] flex-col items-center justify-center gap-4 bg-slate-50">
                        <FileText size={48} className="text-slate-300" />
                        <p className="text-sm text-slate-400 font-medium">Preview not available</p>
                        <button
                          onClick={() => window.open(getDocUrl(selectedCandidate.kycDocuments[selectedDocType]), '_blank')}
                          className="px-4 py-2 bg-[#1B4DA0] text-white rounded-lg text-xs font-bold"
                        >
                          Open Document
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => window.open(getDocUrl(selectedCandidate.kycDocuments[selectedDocType]), '_blank')}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        onClick={() => handleDownloadSingle(
                          getDocUrl(selectedCandidate.kycDocuments[selectedDocType]),
                          `${selectedCandidate.name}_${selectedDocType}`
                        )}
                        className="flex-1 py-3 bg-[#1B4DA0] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#164088] transition-all shadow-md shadow-blue-500/20"
                      >
                        <Download size={16} /> Download
                      </button>
                    </div>

                    {/* Verification Buttons */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Verification Actions</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVerify(selectedCandidate.id, selectedDocType, 'verified')}
                          className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(selectedCandidate.id, selectedDocType)}
                          className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20"
                        >
                          <Mail size={16} /> Reject & Notify
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <AlertTriangle size={32} className="text-slate-300" />
                    </div>
                    <p className="text-lg font-bold text-slate-700 mb-1">Document Not Uploaded</p>
                    <p className="text-sm text-slate-400 max-w-[280px]">
                      The candidate hasn't uploaded this document yet. They will receive a reminder to complete their KYC.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Mail className="text-rose-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Reject Document</h3>
                    <p className="text-xs text-slate-500">Candidate will be notified via email</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Document is blurry, expired, or information doesn't match..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[#1B4DA0]/20 focus:border-[#1B4DA0] placeholder:text-slate-400"
                />
                <p className="mt-2 text-xs text-slate-400">
                  This message will be included in the email sent to the candidate.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectWithEmail}
                  disabled={!rejectionReason.trim()}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${rejectionReason.trim()
                      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  <Mail size={16} /> Reject & Send Email
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
