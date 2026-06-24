import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  RefreshCw,
  CheckSquare,
  CheckCheck,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllCandidates, verifyCandidateKYC, BASE_URL, syncSharePointAll, bulkVerifyCandidateKYC, attachFinalOfferLetter } from '../../../service/api';
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
  let url = doc.url.startsWith('http') ? doc.url : `${BASE_URL}${doc.url}`;

  // Append auth token for API URLs to pass verifyAuthToken in window.open/iframes
  if (url.includes('/api/')) {
    const token = localStorage.getItem('token');
    if (token) {
      const sanitizedToken = token.replace(/^"|"$/g, '').trim();
      url += `${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(sanitizedToken)}`;
    }
  }

  return url;
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

const DocumentVerifyTab = ({ isDarkMode = false, notificationBell }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('pan_front');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('Blurry / Low Picture Quality');
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isUploadingOffer, setIsUploadingOffer] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const prevPreviewUrlRef = useRef(null);

  useEffect(() => {
    let active = true;

    // Revoke previous URL if any
    if (prevPreviewUrlRef.current) {
      URL.revokeObjectURL(prevPreviewUrlRef.current);
      prevPreviewUrlRef.current = null;
    }

    if (!selectedCandidate || !selectedDocType) {
      setPreviewUrl(null);
      setPreviewLoading(false);
      setPreviewError(false);
      return;
    }

    const doc = selectedCandidate.kycDocuments?.[selectedDocType];
    const rawUrl = doc?.url || '';
    const isPdf = rawUrl.toLowerCase().split('?')[0].endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(rawUrl.toLowerCase().split('?')[0]);

    if (!doc?.url || (!isPdf && !isImage)) {
      setPreviewUrl(null);
      setPreviewLoading(false);
      setPreviewError(false);
      return;
    }

    const loadBlob = async () => {
      setPreviewLoading(true);
      setPreviewError(false);
      setPreviewUrl(null);
      try {
        const url = getDocUrl(doc);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch document');
        const blob = await response.blob();
        if (active) {
          const localUrl = URL.createObjectURL(blob);
          prevPreviewUrlRef.current = localUrl;
          setPreviewUrl(localUrl);
        }
      } catch (err) {
        console.error('Failed to load document preview:', err);
        if (active) setPreviewError(true);
      } finally {
        if (active) setPreviewLoading(false);
      }
    };

    loadBlob();

    return () => {
      active = false;
    };
  }, [selectedCandidate?.id, selectedCandidate?.kycDocuments?.[selectedDocType]?.url, selectedDocType]);

  useEffect(() => {
    fetchCandidates();
    setMounted(true);
    return () => {
      if (prevPreviewUrlRef.current) {
        URL.revokeObjectURL(prevPreviewUrlRef.current);
      }
    };
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await getAllCandidates();
      if (res && res.success) {
        const rawData = Array.isArray(res.data) ? res.data : [];
        const filtered = rawData.filter(c =>
          c && (['Selected', 'Document Verification', 'Offer Sent', 'Hired', 'Joined'].includes(c.stage) ||
            (c.kycDocuments && typeof c.kycDocuments === 'object' && Object.keys(c.kycDocuments).length > 0))
        );
        const normalized = filtered.map(c => ({
          ...c,
          id: c.id || c._id
        }));
        setCandidates(normalized);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferLetterFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    try {
      setIsUploadingOffer(true);
      const loadingId = toast.loading('Uploading offer letter...');

      const formData = new FormData();
      formData.append('candidateId', selectedCandidate.id || selectedCandidate._id);
      formData.append('offerLetter', file);

      const res = await attachFinalOfferLetter(formData);
      if (res && res.success) {
        toast.success('Offer letter uploaded successfully', { id: loadingId });

        // Update local state for selected candidate
        const updatedCandidate = {
          ...selectedCandidate,
          offerLetterUrl: res.data?.offerLetterUrl || res.offerLetterUrl,
          offerLetterFileName: res.data?.offerLetterFileName || file.name,
          stage: 'Offer Sent',
          status: 'Selected'
        };

        setSelectedCandidate(updatedCandidate);

        // Update candidates list
        setCandidates(prev => prev.map(c =>
          (String(c.id) === String(updatedCandidate.id) || String(c._id) === String(updatedCandidate.id)) ? updatedCandidate : c
        ));

        // Re-fetch list to sync with server
        await fetchCandidates();
      } else {
        toast.error(res.message || 'Failed to upload offer letter', { id: loadingId });
      }
    } catch (err) {
      console.error('Offer letter upload error:', err);
      toast.error(err.message || 'Error uploading offer letter');
    } finally {
      setIsUploadingOffer(false);
      e.target.value = '';
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
        toast.success('Document Approved Successfully!', {
          description: `Verification status updated for ${selectedDocType.replace(/_/g, ' ').toUpperCase()}`,
          duration: 4000,
        });

        // Optimistically update local state for immediate feedback
        const updateState = (prev) => {
          if (!prev) return null;
          const newDocs = { ...(prev.kycDocuments || {}) };
          newDocs[docType] = {
            ...(newDocs[docType] || {}),
            verified: status === 'verified',
            verifiedAt: new Date()
          };
          return { ...prev, kycDocuments: newDocs };
        };

        setCandidates(prev => prev.map(c =>
          (String(c.id) === String(candidateId) || String(c._id) === String(candidateId))
            ? updateState(c)
            : c
        ));

        if (selectedCandidate && (String(selectedCandidate.id) === String(candidateId) || String(selectedCandidate._id) === String(candidateId))) {
          setSelectedCandidate(prev => updateState(prev));
        }

        // Still fetch to keep in sync with database (e.g. for server-generated fields)
        fetchCandidates();
      }
    } catch (err) {
      console.error('KYC Verification Error:', err);
      toast.error(err.message || 'Verification failed');
    }
  };

  const openRejectModal = (candidateId, docType) => {
    const candidate = candidates.find(c => c.id === candidateId || c._id === candidateId) || selectedCandidate;
    let initialDocType = docType;
    if (candidate && candidate.kycDocuments) {
      const uploadedDocs = DOC_TYPES.filter(d => candidate.kycDocuments[d.id]?.url);
      if (uploadedDocs.length > 0) {
        const isCurrentUploaded = uploadedDocs.some(d => d.id === docType);
        if (!isCurrentUploaded) {
          initialDocType = uploadedDocs[0].id;
        }
      }
    }
    setRejectingDoc({ candidateId, docType: initialDocType });
    setSelectedReason('Blurry / Low Picture Quality');
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleApproveAll = async (candidate) => {
    if (!candidate?.kycDocuments) return;

    // Get all documents that are uploaded but not verified
    const docsToApprove = Object.keys(candidate.kycDocuments).filter(
      type => candidate.kycDocuments[type]?.url && candidate.kycDocuments[type]?.verified !== true
    );

    if (docsToApprove.length === 0) {
      toast.info("No new documents to approve");
      return;
    }

    try {
      setIsApprovingAll(true);
      const loadingId = toast.loading(`Approving ${docsToApprove.length} documents...`);

      const res = await bulkVerifyCandidateKYC({
        candidateId: candidate.id,
        docTypes: docsToApprove,
        status: 'verified'
      });

      if (res && res.success) {
        toast.success(`Successfully approved ${docsToApprove.length} documents`, { id: loadingId });

        // Update selected candidate optimistically
        const updateDocStates = (prev) => {
          if (!prev) return null;
          const newDocs = { ...(prev.kycDocuments || {}) };
          docsToApprove.forEach(type => {
            newDocs[type] = {
              ...(newDocs[type] || {}),
              verified: true,
              verifiedAt: new Date()
            };
          });
          return { ...prev, kycDocuments: newDocs };
        };

        setCandidates(prev => prev.map(c =>
          (String(c.id) === String(candidate.id) || String(c._id) === String(candidate.id))
            ? updateDocStates(c)
            : c
        ));

        if (selectedCandidate && (String(selectedCandidate.id) === String(candidate.id) || String(selectedCandidate._id) === String(candidate.id))) {
          setSelectedCandidate(prev => updateDocStates(prev));
        }

        // Final sync with database
        await fetchCandidates();
      }

    } catch (err) {
      console.error("Bulk Approval Error:", err);
      toast.error("Failed to approve all documents");
    } finally {
      setIsApprovingAll(false);
    }
  };

  const handleRejectWithEmail = async () => {
    if (!rejectingDoc) return;

    const finalReason = selectedReason === 'Other'
      ? rejectionReason.trim()
      : (rejectionReason.trim() ? `${selectedReason} - ${rejectionReason.trim()}` : selectedReason);

    if (!finalReason) {
      toast.error('Please specify a reason for re-upload request.');
      return;
    }

    try {
      const loadingId = toast.loading('Rejecting document & sending email...');
      const res = await verifyCandidateKYC({
        candidateId: rejectingDoc.candidateId,
        docType: rejectingDoc.docType,
        status: 'rejected',
        rejectionReason: finalReason
      });

      if (res && res.success) {
        toast.success('Document rejected & email sent', { id: loadingId });

        // Optimistically update local state for immediate feedback
        const { candidateId, docType } = rejectingDoc;
        const updateState = (prev) => {
          if (!prev) return null;
          const newDocs = { ...(prev.kycDocuments || {}) };
          newDocs[docType] = {
            ...(newDocs[docType] || {}),
            verified: false,
            verifiedAt: new Date(),
            rejectionReason: finalReason
          };
          return { ...prev, kycDocuments: newDocs };
        };

        setCandidates(prev => prev.map(c => (c.id === candidateId || c._id === candidateId) ? updateState(c) : c));

        if (selectedCandidate?.id === candidateId || selectedCandidate?._id === candidateId) {
          setSelectedCandidate(prev => updateState(prev));
        }

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

  const selectedDocStats = useMemo(() => {
    return selectedCandidate ? getDocumentStats(selectedCandidate) : { verified: 0, uploaded: 0 };
  }, [selectedCandidate]);

  const isCandidateFullyVerified = useMemo(() => {
    return selectedCandidate && selectedDocStats.verified === selectedDocStats.uploaded && selectedDocStats.uploaded > 0;
  }, [selectedCandidate, selectedDocStats]);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl">
        <div className="w-10 h-10 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Verification System...</p>
      </div>
    );
  }

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12"
      >
        <div className="text-left flex items-center gap-4">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Document Verification
          </h1>
        </div>
        <div className="flex gap-3">
          {notificationBell}
        </div>
      </motion.div>

      {/* Modern Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-[24px] p-2 border flex items-center gap-3 mb-6 mt-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}
      >
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate, email or position..."
            className={`w-full border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD] ${isDarkMode ? 'bg-slate-800 text-white focus:ring-2 focus:ring-slate-700' : 'bg-[#F4F3EF] text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF]'}`}
          />
        </div>

        {/* Status Filter */}
        <div className="relative group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`text-[11px] font-black uppercase tracking-widest rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[200px] transition-all hover:bg-[#EEF2FB] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Fully Verified</option>
            <option value="rejected">Action Required</option>
            <option value="incomplete">Incomplete KYC</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
        </div>
      </motion.div>

      {/* Modern Table Interface */}
      <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
        {/* Table Header */}
        <div className={`hidden md:grid grid-cols-[minmax(200px,1.5fr)_1.5fr_1.5fr_120px_140px_40px] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
          {["Candidate", "Position", "Client", "Documents", "Actions", ""].map((h, i) => (
            <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-center justify-start">
              {h}
            </div>
          ))}
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {filteredCandidates.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No candidates found</p>
              </div>
            ) : (
              filteredCandidates.map((candidate, index) => {
                const docStats = getDocumentStats(candidate);

                return (
                  <motion.div
                    key={candidate.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => { setSelectedCandidate(candidate); setSelectedDocType('pan_front'); setOpenDropdown(null); }}
                    className={`grid grid-cols-[1fr] md:grid-cols-[minmax(200px,1.5fr)_1.5fr_1.5fr_120px_140px_40px] gap-4 items-center px-8 py-4 border-b last:border-0 cursor-pointer transition-all group relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'}`}
                  >
                    {/* Candidate Identity */}
                    <div className="flex items-center gap-4 min-w-0 py-1">
                      <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110 bg-[#F0F7FF] text-[#1B4DA0] text-[13px]">
                        {(candidate.name || '??').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                        <p className={`text-[14px] font-bold truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-[#0D47A1]' : 'text-[#0f172a] group-hover:text-[#0D47A1]'}`}>
                          {candidate.name || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Position */}
                    <div className="text-left hidden md:block">
                      <p className={`text-[13px] font-bold text-[#6B6B7E]`}>{
                        (() => {
                          const posTitle = candidate.position?.title || candidate.jobTitle || candidate.positionTitle || 'Not Assigned';
                          return String(posTitle).replace(/\s*-\s*\d+$/, '');
                        })()
                      }</p>
                    </div>

                    {/* Client */}
                    <div className="text-left hidden md:block">
                      <p className={`text-[13px] font-bold text-[#6B6B7E] truncate`}>{candidate.clientName || candidate.client?.companyName || candidate.client?.name || candidate.position?.clientName || 'Not Assigned'}</p>
                    </div>

                    {/* Documents Status */}
                    <div className="flex items-center justify-start hidden md:flex">
                      <div className={`px-2.5 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 ${docStats.verified === docStats.uploaded && docStats.uploaded > 0
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : docStats.verified > 0
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-slate-50 text-slate-400 border border-slate-100 opacity-60'
                        }`}>
                        {docStats.verified === docStats.uploaded && docStats.uploaded > 0 ? (
                          <>
                            <CheckCircle size={10} />
                            Verified
                          </>
                        ) : docStats.uploaded > 0 ? (
                          `${docStats.verified}/${docStats.uploaded} Verified`
                        ) : (
                          "No Documents"
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-start hidden md:flex" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setSelectedCandidate(candidate); setSelectedDocType('pan_front'); setOpenDropdown(null); }}
                        className="px-4 py-2 bg-[#1B4DA0] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#164088] transition-all"
                      >
                        <Eye size={12} /> Review
                      </button>
                    </div>

                    {/* Chevron */}
                    <div className="flex justify-end pr-2">
                      <ChevronRight size={20} className={`transition-all ${isDarkMode ? 'text-slate-700' : 'text-[#C5C5D2] group-hover:text-[#0D47A1]'}`} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Sidebar */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedCandidate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1100] flex justify-end"
              onClick={() => setSelectedCandidate(null)}
            >
              <div className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-xl" />

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

                  {/* Quick Actions */}
                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      onClick={() => handleApproveAll(selectedCandidate)}
                      disabled={isApprovingAll || getDocumentStats(selectedCandidate).uploaded === 0}
                      className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                      {isApprovingAll ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : (
                        <CheckCheck size={16} />
                      )}
                      Approve All Uploaded Documents
                    </button>

                    <button
                      onClick={() => handleDownloadAllAsZip(selectedCandidate)}
                      disabled={downloadingZip || getDocumentStats(selectedCandidate).uploaded === 0}
                      className="w-full py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#164088] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 border border-white/10"
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
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${isGroupSelected
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
                                      className={`w-full px-4 py-2.5 text-left text-[11px] font-semibold flex items-center justify-between hover:bg-slate-50 transition-all ${selectedDocType === doc.id ? 'bg-blue-50 text-[#1B4DA0]' : 'text-slate-600'
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
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Offer Letter Section for Verified Candidates */}
                  {isCandidateFullyVerified && (
                    <div className="p-5 rounded-2xl border border-blue-100 bg-[#F8FAFF] shadow-sm text-left">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="text-[#1B4DA0]" size={18} />
                          <h4 className="font-bold text-slate-800 text-sm">Final Offer Letter</h4>
                        </div>
                        <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle size={10} /> Verified
                        </span>
                      </div>

                      {selectedCandidate.offerLetterUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#1B4DA0]">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-700 truncate">
                                {selectedCandidate.offerLetterFileName || 'Offer_Letter.pdf'}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Ready to be sent to candidate
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(getDocUrl({ url: selectedCandidate.offerLetterUrl }), '_blank')}
                              className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all"
                            >
                              <Eye size={14} /> View
                            </button>
                            <button
                              onClick={() => handleDownloadSingle(
                                getDocUrl({ url: selectedCandidate.offerLetterUrl }),
                                selectedCandidate.offerLetterFileName || `${selectedCandidate.name}_Offer_Letter.pdf`
                              )}
                              className="flex-1 py-2.5 bg-[#1B4DA0] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#164088] transition-all"
                            >
                              <Download size={14} /> Download
                            </button>
                          </div>

                          <div className="pt-2 border-t border-slate-100/50">
                            <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer transition-all">
                              <Upload size={14} /> Replace Offer Letter
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => handleOfferLetterFileChange(e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Candidate KYC is fully verified. Upload the final offer letter to proceed with onboarding.
                          </p>

                          <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#1B4DA0]/30 hover:border-[#1B4DA0] bg-white rounded-xl cursor-pointer transition-all hover:bg-blue-50/10 group">
                            {isUploadingOffer ? (
                              <RefreshCw className="animate-spin text-[#1B4DA0]" size={24} />
                            ) : (
                              <Upload className="text-slate-400 group-hover:text-[#1B4DA0] transition-colors" size={24} />
                            )}
                            <div className="text-center">
                              <span className="text-xs font-bold text-[#1B4DA0]">
                                {isUploadingOffer ? 'Uploading...' : 'Click to Upload Offer Letter'}
                              </span>
                              <p className="text-[9px] text-slate-400 mt-1">Supports PDF, DOC, DOCX up to 10MB</p>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              disabled={isUploadingOffer}
                              onChange={(e) => handleOfferLetterFileChange(e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedCandidate.kycDocuments?.[selectedDocType] ? (() => {
                    const docUrl = getDocUrl(selectedCandidate.kycDocuments[selectedDocType]);
                    const rawUrl = selectedCandidate.kycDocuments[selectedDocType].url || '';
                    const isPdf = rawUrl.toLowerCase().split('?')[0].endsWith('.pdf');
                    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(rawUrl.toLowerCase().split('?')[0]);

                    return (
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
                              onClick={() => window.open(docUrl, '_blank')}
                              className="w-9 h-9 rounded-lg bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-[#1B4DA0] hover:bg-blue-50 transition-all"
                              title="View Full Screen"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDownloadSingle(
                                docUrl,
                                `${selectedCandidate.name}_${selectedDocType}`
                              )}
                              className="w-9 h-9 rounded-lg bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                          </div>

                          {/* PDF / Image Preview */}
                          {previewLoading ? (
                            <div className="h-[300px] flex flex-col items-center justify-center gap-3 bg-slate-50">
                              <RefreshCw className="animate-spin text-[#1B4DA0]" size={36} />
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading preview...</p>
                            </div>
                          ) : previewError ? (
                            <div className="h-[300px] flex flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
                              <AlertTriangle size={48} className="text-amber-500 animate-bounce" />
                              <div>
                                <p className="text-sm font-bold text-slate-700">Preview Load Blocked</p>
                                <p className="text-xs text-slate-400 mt-1">Due to secure cross-origin constraints, direct preview is unavailable. Please click below to open or download.</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => window.open(docUrl, '_blank')}
                                  className="px-4 py-2 bg-[#1B4DA0] hover:bg-[#153b7a] text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                                >
                                  Open Document
                                </button>
                                <button
                                  onClick={() => handleDownloadSingle(docUrl, `${selectedCandidate.name}_${selectedDocType}`)}
                                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                                >
                                  Download File
                                </button>
                              </div>
                            </div>
                          ) : isPdf && previewUrl ? (
                            <iframe
                              src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                              title={selectedDocType}
                              className="w-full h-[550px] border-0 rounded-2xl"
                            />
                          ) : isImage && previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={selectedDocType}
                              className="w-full h-[300px] object-contain p-4"
                            />
                          ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
                              <FileText size={48} className="text-slate-300" />
                              <div>
                                <p className="text-sm font-bold text-slate-700">Preview Not Available</p>
                                <p className="text-xs text-slate-400 mt-1">This file type ({rawUrl.split('.').pop()?.toUpperCase() || 'unknown'}) cannot be previewed natively in the browser.</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => window.open(docUrl, '_blank')}
                                  className="px-4 py-2 bg-[#1B4DA0] hover:bg-[#153b7a] text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                                >
                                  Open Document
                                </button>
                                <button
                                  onClick={() => handleDownloadSingle(docUrl, `${selectedCandidate.name}_${selectedDocType}`)}
                                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                                >
                                  Download File
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => window.open(docUrl, '_blank')}
                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                          >
                            <Eye size={16} /> View
                          </button>
                          <button
                            onClick={() => handleDownloadSingle(
                              docUrl,
                              `${selectedCandidate.name}_${selectedDocType}`
                            )}
                            className="flex-1 py-3 bg-[#1B4DA0] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#164088] transition-all shadow-md shadow-blue-500/20"
                          >
                            <Download size={16} /> Download
                          </button>
                        </div>

                        {/* Verification Buttons */}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Actions</p>

                          {selectedCandidate.kycDocuments?.[selectedDocType]?.verified === false && selectedCandidate.kycDocuments?.[selectedDocType]?.rejectionReason && (
                            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-left">
                              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Re-upload Requested Reason</p>
                              <p className="text-xs text-rose-700 font-medium leading-relaxed">
                                {selectedCandidate.kycDocuments[selectedDocType].rejectionReason}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleVerify(selectedCandidate.id || selectedCandidate._id, selectedDocType, 'verified')}
                              disabled={selectedCandidate.kycDocuments?.[selectedDocType]?.verified === true}
                              className="flex-1 py-3 bg-[#10B981] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#059669] transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                              style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
                            >
                              <CheckCircle size={16} />
                              {selectedCandidate.kycDocuments?.[selectedDocType]?.verified === true ? 'Approved' : 'Approve Document'}
                            </button>
                            <button
                              onClick={() => openRejectModal(selectedCandidate.id || selectedCandidate._id, selectedDocType)}
                              className="flex-1 py-3 bg-[#F43F5E] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E11D48] transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                              style={{ backgroundColor: '#F43F5E', color: '#FFFFFF' }}
                            >
                              <RefreshCw size={16} /> Request Re-upload
                            </button>
                          </div>

                          <button
                            onClick={() => handleApproveAll(selectedCandidate)}
                            disabled={isApprovingAll}
                            className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100/50 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                          >
                            {isApprovingAll ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <CheckCheck size={12} />
                            )}
                            Approve All Uploaded Documents
                          </button>
                        </div>
                      </div>
                    );
                  })() : (
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
        </AnimatePresence>,
        document.body
      )}

      {/* Rejection Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showRejectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-[#1A1A2E]/40 backdrop-blur-xl"
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
                      <RefreshCw className="text-rose-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Request Re-upload</h3>
                      <p className="text-xs text-slate-500">Candidate will be notified to resend this document</p>
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
                <div className="p-6 space-y-4">
                  {/* Document Selection Field */}
                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Document <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={rejectingDoc?.docType || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRejectingDoc(prev => ({ ...prev, docType: val }));
                        setSelectedDocType(val); // Update selected doc type in main view
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-[#1B4DA0]/20 focus:border-[#1B4DA0] focus:outline-none transition-all"
                    >
                      {DOC_TYPES.map(doc => {
                        if (selectedCandidate?.kycDocuments?.[doc.id]?.url) {
                          return (
                            <option key={doc.id} value={doc.id}>
                              {doc.label}
                            </option>
                          );
                        }
                        return null;
                      })}
                    </select>
                  </div>

                  {/* Rejection Reason Dropdown */}
                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Reason for Re-upload Request <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-[#1B4DA0]/20 focus:border-[#1B4DA0] focus:outline-none transition-all"
                    >
                      <option value="Fake Document">Fake Document</option>
                      <option value="Blurry / Low Picture Quality">Blurry / Low Picture Quality</option>
                      <option value="Incorrect Document Uploaded">Incorrect Document Uploaded</option>
                      <option value="Information Mismatch">Information Mismatch</option>
                      <option value="Expired Document">Expired Document</option>
                      <option value="Other">Other (Specify below)</option>
                    </select>
                  </div>

                  {/* Additional Comments Textarea */}
                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Additional Comments {selectedReason === 'Other' && <span className="text-rose-500">*</span>}
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder={selectedReason === 'Other' ? "Please specify the custom reason..." : "e.g., specific details about the document quality or info mismatch..."}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[#1B4DA0]/20 focus:border-[#1B4DA0] placeholder:text-slate-400"
                    />
                    <p className="mt-2 text-[10px] text-slate-400 leading-normal">
                      The selected reason category and comments will be sent via email to the candidate.
                    </p>
                  </div>
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
                    disabled={selectedReason === 'Other' ? !rejectionReason.trim() : false}
                    className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                    style={{
                      backgroundColor: (selectedReason !== 'Other' || rejectionReason.trim()) ? '#F43F5E' : '#E2E8F0',
                      color: (selectedReason !== 'Other' || rejectionReason.trim()) ? '#FFFFFF' : '#94A3B8',
                      cursor: (selectedReason !== 'Other' || rejectionReason.trim()) ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <RefreshCw size={16} /> Send Re-upload Request
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default DocumentVerifyTab;
