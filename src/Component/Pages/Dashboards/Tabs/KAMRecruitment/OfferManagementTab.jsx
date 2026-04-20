import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  MessageCircle,
  AlertCircle,
  Download,
  RotateCcw,
  FileText,
  Filter,
  ChevronRight,
  Trash2,
  Paperclip,
  ArrowLeft,
  BadgeCheck,
  X,
  FilePlus,
  FilePlus2,
  ChevronDown,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  RefreshCw,
  Eye
} from "lucide-react";
import {
  FiUsers,
  FiBriefcase,
  FiDatabase,
  FiDollarSign,
  FiZap,
  FiCheckCircle,
  FiPlus,
  FiFileText,
  FiCalendar,
  FiMail,
  FiUserPlus,
  FiInfo,
  FiUploadCloud,
  FiSearch,
  FiMaximize,
  FiFile,
  FiUser,
  FiShield
} from "react-icons/fi";
import { toast } from "sonner";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts';
import * as pdfjsLib from 'pdfjs-dist';
import { BASE_URL, getAllOffers, saveOffer, getOfferCandidateSuggestions, deleteOffer, saveOfferTemplate, getOfferTemplate, generateCandidateCredentials, updateCandidateStatus } from '../../../service/api';
import {
  OFFER_STATUS_COLORS,
  STATUS_ICONS,
  AVATAR_COLORS,
  statusOrder
} from './OfferConstants';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const Icon = STATUS_ICONS[status] || FileText;
  const colorClass = OFFER_STATUS_COLORS[status] || OFFER_STATUS_COLORS.Draft;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${colorClass}`}>
      <Icon size={12} />
      {status === 'Generated' ? 'Offer Created' : status}
    </span>
  );
};

/* ── Urgency Indicator ── */
const UrgencyBadge = ({ daysLeft }) => {
  if (daysLeft < 0) {
    return <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">Expired</span>;
  }
  if (daysLeft <= 2) {
    return <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-700 animate-pulse uppercase tracking-wider">Urgent • {daysLeft}d</span>;
  }
  return <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">{daysLeft}d left</span>;
};

/* ── Detail Drawer ── */
function OfferDetailDrawer({ offer, onClose, onEdit, onDelete, onStatusUpdate, isDarkMode }) {
  if (!offer) return null;

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md transition-opacity"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`w-full max-w-[520px] h-full flex flex-col relative z-[1101] shadow-[-12px_0_40px_rgba(0,0,0,0.15)] overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-8 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-[#F4F3EF] bg-white'}`}>
          <div>
            <h2 className={`text-[32px] font-bold font-syne leading-tight ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
              {offer.candidateName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <p className={`text-[10px] font-bold uppercase tracking-[2px] ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>
                {offer.client} • {offer.position}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isDarkMode ? 'text-slate-400 border-slate-700 hover:bg-red-500/20 hover:text-red-500' : 'text-[#6B6B7E] border-[#F4F3EF] hover:text-red-500 hover:bg-red-50'}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 p-10 space-y-12 overflow-y-auto custom-scrollbar">

          {/* Refined Details Grid - Matching Specific Field List */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 px-2">
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Candidate Name</p>
              <p className={`text-[15px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{offer.candidateName}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Email Address</p>
              <p className={`text-[15px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{offer.email || 'Not Mentioned'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Target Position</p>
              <p className={`text-[15px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{offer.position}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Hiring Client</p>
              <p className={`text-[15px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{offer.client || 'Internal'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Current CTC (LPA)</p>
              <p className={`text-[15px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{offer.currentCTC || '₹0.00'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Proposed CTC (LPA)</p>
              <p className={`text-[15px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{offer.offeredCTC || '₹0.00'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Joining Date</p>
              <p className={`text-[15px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{formatDate(offer.joiningDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Offer Date</p>
              <p className={`text-[15px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{formatDate(offer.offerDate)}</p>
            </div>
          </div>

          <div className={`border-t ${isDarkMode ? 'border-slate-800' : 'border-[#F4F3EF]'}`} />

          {/* BGV Protocol Gateway */}
          {offer.bgvStatus !== 'Not Started' && (
            <section className="text-left px-2">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={14} className="text-[#1B4DA0]" />
                <h3 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em]">BGV Protocol Asset</h3>
              </div>
              <div className={`p-6 rounded-[2rem] border-2 border-dashed relative overflow-hidden flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between max-w-[200px]">
                    <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-tighter">Gateway ID:</span>
                    <span className={`text-[12px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{offer.tempUsername}</span>
                  </div>
                  <div className="flex items-center justify-between max-w-[200px]">
                    <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-tighter">Secret Key:</span>
                    <span className={`text-[12px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{offer.tempPassword}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${offer.bgvStatus === 'Verified' ? 'bg-emerald-500 text-white' : 'bg-[#1B4DA0] text-white'}`}>
                    {offer.bgvStatus}
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status Sync: Live</p>
                </div>
              </div>
            </section>
          )}

          <div className={`border-t ${isDarkMode ? 'border-slate-800' : 'border-[#F4F3EF]'}`} />

          {/* Negotiation Notes Section */}
          <section className="text-left px-2">
            <h3 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-5">Negotiation Notes</h3>
            <p className="text-[15px] font-bold text-[#9B9BAD] leading-relaxed italic">
              "{offer.negotiationNotes || 'No specific notes provided for this offer'}"
            </p>
          </section>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className={`p-8 border-t ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF]'}`}>
          <div className="flex flex-col gap-4">
            {offer.status === 'Generated' && (
              <div className="flex gap-3 mb-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStatusUpdate(offer.id, 'Sent')}
                  className="flex-1 h-12 bg-[#1B4DA0] text-white rounded-xl text-[11px] font-extrabold shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 tracking-widest uppercase"
                >
                  <Send size={16} /> Offer Sent
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStatusUpdate(offer.id, 'Declined')}
                  className={`flex-1 h-12 border-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-2 transition-all tracking-widest uppercase ${isDarkMode ? 'border-slate-700 text-slate-400 hover:border-rose-500/50 hover:text-rose-500' : 'border-slate-100 text-slate-500 hover:border-rose-200 hover:text-rose-600'}`}
                >
                  <XCircle size={16} /> Offer Rejected
                </motion.button>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
const OfferManagementTab = ({ isDarkMode }) => {
  const [offers, setOffers] = useState([
    {
      id: 'mock-1',
      candidateName: 'Emily Watson',
      position: 'Product Designer',
      client: 'Adobe',
      offeredCTC: '₹24,00,000',
      currentCTC: '₹18,00,000',
      status: 'Sent',
      offerDate: new Date().toISOString().split('T')[0],
      joiningDate: '2026-05-10',
      hikePercent: 33,
      isVerified: true,
      bgvStatus: 'Verified'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [uploadingOfferId, setUploadingOfferId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showFullPageForm, setShowFullPageForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(null);
  const [candidateSuggestions, setCandidateSuggestions] = useState([]);
  const [showCandidateSuggestions, setShowCandidateSuggestions] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'offerDate', direction: 'desc' });
  const [filterClient, setFilterClient] = useState('all');
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filterJob, setFilterJob] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const previewWrapRef = useRef(null);
  const formWrapRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [templateFileName, setTemplateFileName] = useState('');
  const [templatePdf, setTemplatePdf] = useState(null);
  const [templateViewports, setTemplateViewports] = useState([]);
  const [templateLayout, setTemplateLayout] = useState(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const templateCanvasRefs = useRef([]);

  const [formData, setFormData] = useState({
    candidateId: '',
    candidateName: '',
    email: '',
    position: '',
    client: '',
    offeredCTC: '',
    currentCTC: '',
    joiningDate: '',
    offerDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Generated',
    negotiationNotes: '',
    hikePercent: '',
    offerLetter: null,
    offerLetterName: '',
    offerLetterUrl: '',
  });

  const offerTemplateData = useMemo(() => ({
    candidateName: formData.candidateName || 'Candidate Name',
    client: formData.client || 'Hiring Client',
    position: formData.position || 'Job Title',
    ctc: formData.offeredCTC || '0',
    offerDate: formData.offerDate || new Date().toISOString().split('T')[0],
    joiningDate: formData.joiningDate || '',
    address: formData.negotiationNotes || 'Permanent Address'
  }), [formData]);

  const templateFieldLayout = useMemo(() => ({
    1: [
      { key: 'offerDate', x: 0.12, y: 0.165, fontSize: 10 },
      { key: 'client', x: 0.12, y: 0.143, fontSize: 10 },
      { key: 'candidateName', x: 0.12, y: 0.187, fontSize: 11 },
      { key: 'address', x: 0.12, y: 0.235, fontSize: 9, maxWidth: 0.44 },
      { key: 'joiningDate', x: 0.52, y: 0.355, fontSize: 9 },
      { key: 'ctc', x: 0.35, y: 0.52, fontSize: 9 },
    ],
  }), []);

  const resolvedTemplateLayout = templateLayout || templateFieldLayout;

  const templateOverlayFields = useMemo(() => {
    const formatDate = (value) => {
      if (!value) return '';
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const values = {
      offerDate: formatDate(offerTemplateData.offerDate),
      client: offerTemplateData.client,
      candidateName: offerTemplateData.candidateName,
      address: offerTemplateData.address,
      joiningDate: formatDate(offerTemplateData.joiningDate),
      ctc: offerTemplateData.ctc ? `₹${offerTemplateData.ctc}` : '',
    };

    const out = {};
    for (const [pageKey, fields] of Object.entries(resolvedTemplateLayout || {})) {
      out[pageKey] = (fields || []).map((f) => ({
        ...f,
        value: values[f.key] || '',
        weight: 700,
      }));
    }
    return out;
  }, [offerTemplateData, resolvedTemplateLayout]);

  const handleTemplateUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF template');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Template PDF must be less than 10MB');
      return;
    }
    if (!formData.client) {
      toast.error('Please select Hiring Client before uploading template');
      return;
    }

    setTemplateFileName(file.name);
    try {
      setIsUploadingTemplate(true);
      console.log('🚀 Starting template upload for client:', formData.client);
      console.log('📄 File details:', { name: file.name, size: file.size, type: file.type });

      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      setTemplatePdf(doc);

      const saved = await saveOfferTemplate(formData.client, file, resolvedTemplateLayout);
      console.log('✅ Template upload successful:', saved);

      if (saved?.data?.fieldMap) setTemplateLayout(saved.data.fieldMap);
      toast.success('Template saved for selected client');
    } catch (e) {
      console.error('❌ Template upload failed:', e);
      toast.error(e.response?.data?.message || 'Failed to load PDF template');
      setTemplatePdf(null);
      setTemplateViewports([]);
    } finally {
      setIsUploadingTemplate(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!showFullPageForm) return;
    if (!formData.client) return;

    (async () => {
      try {
        const res = await getOfferTemplate(formData.client);
        const record = res?.data;
        if (!record?.templateUrl) return;

        setTemplateFileName(record.templateFileName || '');
        if (record.fieldMap && Object.keys(record.fieldMap).length > 0) {
          setTemplateLayout(record.fieldMap);
        } else {
          setTemplateLayout(null);
        }

        const url = `${BASE_URL}${record.templateUrl}`;
        const fileRes = await fetch(url);
        if (!fileRes.ok) return;
        const buf = await fileRes.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buf }).promise;
        if (!cancelled) setTemplatePdf(doc);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showFullPageForm, formData.client, BASE_URL]);

  useEffect(() => {
    let cancelled = false;
    if (!templatePdf) return;

    (async () => {
      const vps = [];
      for (let i = 1; i <= templatePdf.numPages; i += 1) {
        const page = await templatePdf.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        vps.push({ width: Math.round(vp.width), height: Math.round(vp.height) });
      }
      if (!cancelled) setTemplateViewports(vps);
    })();

    return () => {
      cancelled = true;
    };
  }, [templatePdf]);

  useEffect(() => {
    if (!showFullPageForm) return;
    const t = setTimeout(() => {
      if (formWrapRef.current) formWrapRef.current.scrollTop = 0;
      if (previewWrapRef.current) previewWrapRef.current.scrollTop = 0;
    }, 0);
    return () => clearTimeout(t);
  }, [showFullPageForm]);

  useEffect(() => {
    if (!showFullPageForm) return;
    if (!previewWrapRef.current) return;

    const update = () => {
      const el = previewWrapRef.current;
      if (!el) return;
      const padding = 40;
      const availableWidth = Math.max(0, el.clientWidth - padding);
      const baseWidth = templateViewports[0]?.width || 595;
      const nextScale = Math.min(1, availableWidth / baseWidth);
      setPreviewScale(nextScale || 1);
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(previewWrapRef.current);
    return () => ro.disconnect();
  }, [showFullPageForm, templateViewports]);

  useEffect(() => {
    let cancelled = false;
    if (!templatePdf) return;
    if (!templateViewports.length) return;

    (async () => {
      for (let idx = 0; idx < templateViewports.length; idx += 1) {
        if (cancelled) return;
        const canvas = templateCanvasRefs.current[idx];
        if (!canvas) continue;
        const page = await templatePdf.getPage(idx + 1);
        const viewport = page.getViewport({ scale: 1 });
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [templatePdf, templateViewports]);

  const fetchOffers = async () => {
    if (offers.length === 0) setLoading(true);


    try {
      const response = await getAllOffers();
      let candidatesData = (response.data || []).map(c => ({
        ...c,
        id: c._id || c.id,
        candidateId: c.candidateId || c._id || c.id,
        status: c.status === 'Draft' ? 'Sent' : c.status,
        hikePercent: calculateHike(c.currentCTC, c.offeredCTC),
        bgvStatus: c.bgvStatus || 'Not Started'
      }));

      if (candidatesData.length === 0) {
        setOffers([]);
      } else {
        setOffers(candidatesData);
      }
    } catch (error) {
      console.warn('API sync failed for Offer Management');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateHike = (current, offered) => {
    if (!current || !offered) return 0;
    const currentVal = parseFloat(String(current).replace(/[^\d.]/g, ''));
    const offeredVal = parseFloat(String(offered).replace(/[^\d.]/g, ''));
    if (currentVal === 0) return 0;
    return Math.round(((offeredVal - currentVal) / currentVal) * 100);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (!showFullPageForm || editingOffer) return;

    const search = formData.candidateName.trim();
    if (search.length < 2) {
      setCandidateSuggestions([]);
      setShowCandidateSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await getOfferCandidateSuggestions(search);
        setCandidateSuggestions(response.data || []);
        setShowCandidateSuggestions(true);
      } catch (error) {
        console.error('Failed to load candidate suggestions:', error);
        setCandidateSuggestions([]);
        setShowCandidateSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [formData.candidateName, showFullPageForm, editingOffer]);

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setViewingOffer(null);
    setCandidateSuggestions([]);
    setShowCandidateSuggestions(false);
    setFormData({
      candidateId: offer.candidateId || offer.id || '',
      candidateName: offer.candidateName || '',
      email: offer.email || '',
      position: offer.position || '',
      client: offer.client || '',
      offeredCTC: offer.offeredCTC || '',
      currentCTC: offer.currentCTC || '',
      joiningDate: offer.joiningDate || '',
      offerDate: offer.offerDate || '',
      expiryDate: offer.expiryDate || '',
      status: offer.status || 'Draft',
      negotiationNotes: offer.negotiationNotes || '',
      hikePercent: offer.hikePercent || '',
      offerLetter: null,
      offerLetterName: offer.offerLetterFileName || '',
      offerLetterUrl: offer.offerLetterUrl || '',
    });
    setShowFullPageForm(true);
  };

  const handleCreateOffer = () => {
    setEditingOffer(null);
    setCandidateSuggestions([]);
    setShowCandidateSuggestions(false);
    setFormData({
      candidateId: '',
      candidateName: '',
      email: '',
      position: '',
      client: '',
      offeredCTC: '',
      currentCTC: '',
      joiningDate: '',
      offerDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'Generated',
      negotiationNotes: '',
      hikePercent: '',
      offerLetter: null,
      offerLetterName: '',
      offerLetterUrl: '',
    });
    setShowFullPageForm(true);
  };

  const handleViewOffer = (offer) => {
    setViewingOffer(offer);
    setShowFullPageForm(false);
  };

  const handleBackToOffers = () => {
    setShowFullPageForm(false);
    setEditingOffer(null);
    setViewingOffer(null);
  };

  const handleSaveOffer = async () => {
    if (!formData.candidateId && !editingOffer) {
      toast.error("Please select a candidate from the suggestions dropdown first");
      return;
    }
    try {
      const payload = new FormData();
      payload.append('candidateId', formData.candidateId || editingOffer?.candidateId || editingOffer?.id || '');
      payload.append('candidateName', formData.candidateName || '');
      payload.append('email', formData.email || '');
      payload.append('position', formData.position || '');
      payload.append('client', formData.client || '');
      payload.append('offeredCTC', formData.offeredCTC || '');
      payload.append('currentCTC', formData.currentCTC || '');
      payload.append('joiningDate', formData.joiningDate || '');
      payload.append('offerDate', formData.offerDate || '');
      payload.append('expiryDate', formData.expiryDate || '');
      payload.append('status', formData.status || 'Sent');
      payload.append('negotiationNotes', formData.negotiationNotes || '');
      if (formData.offerLetter instanceof File) {
        payload.append('offerLetter', formData.offerLetter);
      }
      if (!(formData.offerLetter instanceof File) && templatePdf) {
        payload.append('useTemplate', 'true');
      }

      const response = await saveOffer(payload);
      const savedOffer = {
        ...response.data,
        hikePercent: calculateHike(response.data.currentCTC, response.data.offeredCTC),
      };

      if (editingOffer) {
        setOffers(prev => prev.map(o => o.id === editingOffer.id ? savedOffer : o));
      } else {
        setOffers(prev => [savedOffer, ...prev.filter(o => o.id !== savedOffer.id)]);
      }

      toast.success(editingOffer ? "Offer updated successfully" : "Offer generated successfully");
      setShowFullPageForm(false);
      setEditingOffer(null);
    } catch (error) {
      console.error('Failed to save offer:', error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to save offer";
      toast.error(errorMsg);
    }
  };

  const handleSelectCandidateSuggestion = (candidate) => {
    setFormData(prev => ({
      ...prev,
      candidateId: candidate.id,
      candidateName: candidate.name || '',
      email: candidate.email || '',
      position: candidate.position || '',
      client: candidate.client || '',
      currentCTC: candidate.currentCTC || prev.currentCTC || '',
      offeredCTC: candidate.expectedCTC || prev.offeredCTC || '',
    }));
    setCandidateSuggestions([]);
    setShowCandidateSuggestions(false);
  };

  const handleUpdateStatus = async (offerId, newStatus) => {
    try {
      // Find the existing offer to get current data
      const offer = offers.find(o => o.id === offerId);
      if (!offer) return;

      const payload = new FormData();
      payload.append('candidateId', offer.candidateId || offer.id);
      payload.append('status', newStatus);

      // Keep existing data to avoid overwriting with empties if API requires full object
      payload.append('candidateName', offer.candidateName);
      payload.append('email', offer.email);
      payload.append('position', offer.position);
      payload.append('client', offer.client);
      payload.append('offeredCTC', offer.offeredCTC);
      payload.append('currentCTC', offer.currentCTC);

      await saveOffer(payload);

      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: newStatus } : o));
      if (viewingOffer && viewingOffer.id === offerId) {
        setViewingOffer(prev => ({ ...prev, status: newStatus }));
      }
      toast.success(`Offer status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteOffer = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this offer? The candidate will be moved back to the interview stage.")) return;

    try {
      await deleteOffer(candidateId);
      setOffers(prev => prev.filter(o => o.id !== candidateId));
      setSelectedRowIds(prev => prev.filter(id => id !== candidateId));
      setViewingOffer(null);
      toast.success("Offer deleted successfully and candidate moved back to pipeline");
    } catch (error) {
      console.error('Failed to delete offer:', error);
      toast.error("Failed to delete offer");
    }
  };

  const handleManualVerify = async (candidateId) => {
    try {
      const loadingId = toast.loading("📡 Updating Verification Core...");
      await updateCandidateStatus(candidateId, { bgvStatus: 'Verified' });
      setOffers(prev => prev.map(o => (o.id === candidateId || o._id === candidateId) ? { ...o, bgvStatus: 'Verified' } : o));
      toast.success("Success: Verification Protocol SECURED", { id: loadingId });
    } catch (error) {
      console.error('Failed to verify candidate:', error);
      toast.error("Error: Verification override failed");
    }
  };

  const handleResetBGV = async (candidateId) => {
    try {
      const loadingId = toast.loading("📡 Resetting Protocol Handshake...");
      await updateCandidateStatus(candidateId, { bgvStatus: 'Not Started' });
      setOffers(prev => prev.map(o => (o.id === candidateId || o._id === candidateId) ? { ...o, bgvStatus: 'Not Started' } : o));
      toast.success("Console: User record cleared.", { id: loadingId });
    } catch (error) {
      console.error('Failed to reset BGV:', error);
      toast.error("Error: Record wipe failed");
    }
  };

  // Selection handlers
  const toggleSelectRow = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredOffers) => {
    if (selectedRowIds.length === filteredOffers.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredOffers.map(o => o.id));
    }
  };

  const statCards = [
    { label: "Pipeline Value", value: `₹${(offers.reduce((acc, current) => acc + parseFloat(String(current.offeredCTC || 0).replace(/[^\d.]/g, '') || 0), 0) / 100).toFixed(1)}Cr`, sub: "Active & Accepted", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Negotiating", value: offers.filter(o => o.status === 'Negotiating').length, sub: "Action Required", icon: RotateCcw, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Acceptance", value: `${Math.round((offers.filter(o => o.status === 'Accepted').length / (offers.length || 1)) * 100)}%`, sub: "Historical Rate", icon: BadgeCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Offers", value: offers.length, sub: "Total Generations", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const activeClientNames = useMemo(() => {
    const names = new Set(offers.map(o => o.client).filter(Boolean));
    return Array.from(names).sort();
  }, [offers]);

  const filteredOffers = offers.filter(o => {
    const matchesSearch = (o.candidateName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.client || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesClient = filterClient === 'all' || o.client === filterClient;
    const matchesJob = filterJob === 'all' || o.position === filterJob;

    // Date filter on offerDate
    let matchesDate = true;
    if (dateFilter !== "all" && o.offerDate) {
      const offerTime = new Date(o.offerDate);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = o.offerDate === now.toISOString().split('T')[0];
      } else if (dateFilter === "week") {
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23, 59, 59, 999);
        matchesDate = offerTime >= weekStart && offerTime <= weekEnd;
      } else if (dateFilter === "month") {
        matchesDate = offerTime.getMonth() === now.getMonth() && offerTime.getFullYear() === now.getFullYear();
      } else if (dateFilter === "year") {
        matchesDate = offerTime.getFullYear() === now.getFullYear();
      } else if (dateFilter === "custom") {
        if (customStartDate) matchesDate = offerTime >= new Date(customStartDate);
        if (customEndDate && matchesDate) matchesDate = offerTime <= new Date(customEndDate + 'T23:59:59');
      }
    }

    return matchesSearch && matchesStatus && matchesClient && matchesJob && matchesDate;
  }).sort((a, b) => {
    const { key, direction } = sortConfig;
    let valA = a[key], valB = b[key];

    if (key === 'offeredCTC') {
      valA = parseFloat(String(valA || 0).replace(/[^\d.]/g, '')) || 0;
      valB = parseFloat(String(valB || 0).replace(/[^\d.]/g, '')) || 0;
    } else if (key === 'offerDate' || key === 'joiningDate') {
      valA = new Date(valA || 0).getTime();
      valB = new Date(valB || 0).getTime();
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getInitials = (name) => (name || '').split(' ').map(n => n[0]).join('').toUpperCase();

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <>
      <div className="p-0 min-h-screen bg-[#FDFDFD] dark:bg-slate-950 text-left">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

        {/* Main Dashboard Content - Always Rendered */}
        <div className="max-w-full mx-auto" style={{ fontFamily: "'Calibri', sans-serif" }}>
          {/* Refined Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                Offer Management
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchOffers}
                disabled={loading}
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#6B6B7E] border border-[#F4F3EF] rounded-xl text-sm font-bold hover:bg-blue-50/50 hover:text-[#0D47A1] hover:border-[#0D47A1]/20 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 min-w-[170px]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiDatabase className="text-emerald-500 group-hover:text-[#0D47A1] transition-colors" />
                )}
                {loading ? 'Syncing...' : 'Sync Data'}
              </button>
              <button
                onClick={handleCreateOffer}
                className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-[#0D47A1]/20 active:scale-95"
              >
                <Plus size={18} /> Generate New Offer
              </button>
            </div>
          </div>

          {/* Filter Bar Unification */}
          <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
            {/* Search Bar */}
            <div className="relative flex-1 group min-w-[200px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by candidate, role, or client..."
                className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); if (e.target.value !== 'custom') { setCustomStartDate(''); setCustomEndDate(''); } }}
                className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
              <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none opacity-50" />
            </div>

            {/* Client Filter */}
            <div className="relative">
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
              >
                <option value="all">All Clients</option>
                {activeClientNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none opacity-50" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="Generated">Offer Created</option>
                <option value="Sent">Sent</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Joined">Joined</option>
              </select>
              <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none opacity-50" />
            </div>
          </div>

          {/* Active Filters */}
          <AnimatePresence>
            {filterClient !== 'all' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 shadow-sm ${isDarkMode ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-100 text-[#1B4DA0]'}`}>
                  <FiUsers size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Viewing: {filterClient}</span>
                  <button
                    onClick={() => setFilterClient('all')}
                    className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-blue-500/20 text-blue-400/60 hover:text-blue-400' : 'hover:bg-blue-100 text-blue-400 hover:text-blue-600'}`}
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className={`text-[11px] font-medium opacity-50 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>
                  Showing candidates specifically for this account
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table Interface */}
          <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <div className="min-w-[1200px]">
                <div className="grid grid-cols-[40px_140px_minmax(180px,2fr)_minmax(120px,1.2fr)_minmax(160px,1.5fr)_100px_140px_140px_40px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filteredOffers.length > 0 && selectedRowIds.length === filteredOffers.length}
                      onChange={() => toggleSelectAll(filteredOffers)}
                      className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                    />
                  </div>
                  {["Offer Date", "Candidate", "Hiring Client", "Position", "Offered CTC", "BGV Protocol", "Verify Status", ""].map((h, i) => (
                    <div key={i} className={`text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start ${h === 'BGV Protocol' || h === 'Verify Status' ? 'justify-center' : ''}`}>
                      {h}
                    </div>
                  ))}
                </div>

                {filteredOffers.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No offer records found matching criteria</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F4F3EF]">
                    {filteredOffers.map((offer) => (
                      <div
                        key={offer._id || offer.id}
                        onClick={() => handleViewOffer(offer)}
                        className="grid grid-cols-[40px_140px_minmax(180px,2fr)_minmax(120px,1.2fr)_minmax(160px,1.5fr)_100px_140px_140px_40px] gap-4 items-center px-8 py-3 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group relative"
                      >
                        <div className="flex items-center" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRowIds.includes(offer._id || offer.id)}
                            onChange={(e) => toggleSelectRow(offer._id || offer.id, e)}
                            className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                          />
                        </div>

                        {/* Offer Date */}
                        <div className="flex flex-col justify-center items-start py-1">
                          <p className="text-[13px] font-bold text-[#1A1A2E] text-left">
                            {offer.offerDate && !isNaN(new Date(offer.offerDate))
                              ? new Date(offer.offerDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'Date TBD'}
                          </p>
                          <div className="flex items-center justify-start gap-1 mt-0.5 opacity-60">
                            <Clock size={10} className="text-[#9B9BAD]" />
                            <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider text-left">
                              {offer.status}
                            </span>
                          </div>
                        </div>

                        {/* Candidate */}
                        <div className="flex items-center min-w-0 py-1 overflow-hidden">
                          <div className="flex flex-col items-start min-w-0 w-full">
                            <p className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#0D47A1] transition-colors text-left w-full">
                              {offer.candidateName}
                            </p>
                            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest truncate w-full">{offer.email || 'No Email'}</p>
                          </div>
                        </div>

                        {/* Client */}
                        <div className="flex items-start justify-start text-[13px] font-medium text-[#64748b] truncate py-1 text-left min-w-0 overflow-hidden">
                          <span className="truncate">{offer.client || 'Internal'}</span>
                        </div>

                        {/* Position */}
                        <div className="flex flex-col justify-center items-start min-w-0 py-1 text-left overflow-hidden">
                          <p className="text-[13px] font-bold text-[#1A1A2E] truncate w-full">{offer.position}</p>
                          <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest opacity-60 truncate w-full">Joining: {offer.joiningDate || 'TBD'}</span>
                        </div>

                        {/* CTC */}
                        <div className="flex items-center py-1 text-left">
                          <span className="text-[13px] font-bold text-[#1A1A2E]">₹{offer.offeredCTC} LPA</span>
                        </div>

                        {/* BGV Protocol */}
                        <div className="flex items-center justify-center py-1" onClick={e => e.stopPropagation()}>
                          {offer.bgvStatus === 'Not Started' ? (
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const loadingId = toast.loading("📡 Initiating Protocol Handshake...");
                                const targetId = offer.candidateId || offer.id;
                                try {
                                  if (!targetId) {
                                    toast.error("System Error: Reference missing.", { id: loadingId });
                                    return;
                                  }
                                  const response = await generateCandidateCredentials(targetId);
                                  if (response && response.success && response.data) {
                                    setOffers(prev => prev.map(o => (o.id === offer.id || o._id === offer.id) ? { ...o, bgvStatus: 'Sent', tempUsername: response.data.username, tempPassword: response.data.password } : o));
                                    toast.success(`Success: Credentials sent`, { id: loadingId });
                                  }
                                } catch (err) { toast.error("Gateway protocol failed", { id: loadingId }); }
                              }}
                              className="bg-[#1B4DA0] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                            >
                              Generate
                            </button>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] font-bold text-[#1A73E8]">{offer.tempUsername}</span>
                              <span className="text-[9px] font-mono text-slate-400">{offer.tempPassword}</span>
                            </div>
                          )}
                        </div>

                        {/* Verify Status */}
                        <div className="flex items-center justify-center py-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (offer.bgvStatus === 'Verified') handleResetBGV(offer.id || offer._id);
                              else handleManualVerify(offer.id || offer._id);
                            }}
                            className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border transition-all ${offer.bgvStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}
                          >
                            {offer.bgvStatus === 'Verified' ? 'Verified' : 'Verify Now'}
                          </button>
                        </div>

                        {/* Chevron */}
                        <div className="flex justify-end pr-2">
                          <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#0D47A1]/5 flex items-center justify-center transition-all">
                            <ChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#0D47A1] transition-all" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFullPageForm && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackToOffers}
                className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full ${templatePdf ? 'max-w-[1040px]' : 'max-w-[520px]'} max-h-[92vh] overflow-hidden rounded-[40px] bg-white shadow-2xl transition-all duration-500 ease-out`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                  <div className="flex flex-col items-start text-left">
                    <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne tracking-tight">
                      {editingOffer ? 'Refine Offer Details' : 'Generate Strategic Offer'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">
                        Live Template Precision Protocol
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToOffers}
                    className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-transparent hover:border-red-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 p-0 flex h-[calc(92vh-110px)] overflow-hidden">
                  {/* Left: Form */}
                  <div ref={formWrapRef} className={`${templatePdf ? 'w-1/2' : 'w-full'} p-10 overflow-y-auto border-r border-[#F4F3EF] custom-scrollbar bg-white`}>
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="relative">
                            <label className="text-[10px] font-bold text-[#9B9BAD] mb-2 block text-left uppercase tracking-wider">Candidate Name *</label>
                            <input
                              type="text"
                              value={formData.candidateName}
                              onChange={(e) => setFormData(prev => ({ ...prev, candidateId: '', candidateName: e.target.value }))}
                              className="w-full bg-[#F4F3EF]/60 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-blue-100 placeholder:text-[#9B9BAD]/40 focus:bg-white focus:border-blue-100"
                              onFocus={() => {
                                if (candidateSuggestions.length > 0) setShowCandidateSuggestions(true);
                              }}
                              placeholder="Search or type name..."
                            />
                            <AnimatePresence>
                              {showCandidateSuggestions && candidateSuggestions.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute z-50 w-full mt-2 rounded-2xl shadow-2xl bg-white border border-[#F4F3EF] overflow-hidden max-h-64 overflow-y-auto font-jakarta"
                                >
                                  {candidateSuggestions.map((candidate) => (
                                    <button
                                      key={candidate.id}
                                      type="button"
                                      onClick={() => handleSelectCandidateSuggestion(candidate)}
                                      className="w-full text-left px-5 py-4 transition-all hover:bg-blue-50/50 border-b border-[#F4F3EF] last:border-b-0 group"
                                    >
                                      <div className="font-bold text-sm text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{candidate.name}</div>
                                      <div className="text-[10px] text-[#9B9BAD] font-medium mt-0.5">Pipeline: {candidate.position || 'General'}</div>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#9B9BAD] mb-2 block text-left uppercase tracking-wider">Email Address *</label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full bg-[#F4F3EF]/60 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-blue-100 placeholder:text-[#9B9BAD]/40 focus:bg-white focus:border-blue-100"
                              placeholder="email@example.com"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#9B9BAD] mb-2 block text-left uppercase tracking-wider">Target Position *</label>
                            <input
                              type="text"
                              value={formData.position}
                              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                              className="w-full bg-[#F4F3EF]/60 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-blue-100 placeholder:text-[#9B9BAD]/40 focus:bg-white focus:border-blue-100"
                              placeholder="e.g. Senior Architect"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#9B9BAD] mb-2 block text-left uppercase tracking-wider">Hiring Client *</label>
                            <div className="relative">
                              <select
                                value={formData.client}
                                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                                className="w-full bg-[#F4F3EF]/60 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer focus:bg-white focus:border-blue-100"
                              >
                                <option value="">Select Client</option>
                                <option value="Voltiq Energy">Voltiq Energy</option>
                                {activeClientNames.map(name => (
                                  <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#9B9BAD]">
                                <ChevronDown size={16} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="text-[10px] font-bold text-[#9B9BAD] mb-2 block text-left uppercase tracking-wider">Proposed Monthly *</label>
                            <input
                              type="text"
                              value={formData.offeredCTC}
                              onChange={(e) => setFormData(prev => ({ ...prev, offeredCTC: e.target.value }))}
                              className="w-full bg-[#1B4DA0]/5 border border-[#1B4DA0]/10 rounded-2xl px-6 py-4 text-sm font-bold text-[#1B4DA0] outline-none transition-all focus:ring-2 focus:ring-blue-100 placeholder:text-[#1B4DA0]/30 focus:bg-white focus:border-[#1B4DA0]/30"
                              placeholder="e.g. 15,000"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#9B9BAD] mb-2 block text-left uppercase tracking-wider">Offer Date</label>
                            <input
                              type="date"
                              value={formData.offerDate}
                              onClick={(e) => e.target.showPicker && e.target.showPicker()}
                              onChange={(e) => setFormData(prev => ({ ...prev, offerDate: e.target.value }))}
                              className="w-full bg-[#F4F3EF]/60 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-100 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#9B9BAD] mb-2 block text-left uppercase tracking-wider">Joining Date</label>
                            <input
                              type="date"
                              value={formData.joiningDate}
                              onClick={(e) => e.target.showPicker && e.target.showPicker()}
                              onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                              className="w-full bg-[#F4F3EF]/60 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-100 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <label className="text-[10px] font-bold text-[#9B9BAD] mb-2 block text-left uppercase tracking-wider">Permanent Address for Letter</label>
                        <textarea
                          value={formData.negotiationNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, negotiationNotes: e.target.value }))}
                          rows={3}
                          className="w-full bg-[#F4F3EF]/60 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-blue-100 placeholder:text-[#9B9BAD]/40 resize-none text-left focus:bg-white focus:border-blue-100"
                          placeholder="Complete address (for dynamic injection)..."
                        />
                      </div>

                      <div className="pt-2 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                            <FiFile size={14} />
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]">Offer Letter Assets</h3>
                        </div>

                        <div className="relative">
                          <label
                            className={`flex flex-col items-center justify-center h-44 rounded-[32px] border-2 border-dashed transition-all cursor-pointer ${isUploadingTemplate ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#1B4DA0] hover:bg-blue-50/10'} ${templatePdf ? 'border-[#1B4DA0] bg-[#EEF2FB]/20' : 'border-[#F4F3EF] bg-[#FDFDFD]'}`}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isUploadingTemplate) return;
                              const file = e.dataTransfer.files?.[0];
                              if (file) handleTemplateUpload(file);
                            }}
                          >
                            {isUploadingTemplate ? (
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-[#1B4DA0]/10 border-t-[#1B4DA0] rounded-full animate-spin" />
                                <span className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-widest">Injecting protocol...</span>
                              </div>
                            ) : (
                              <>
                                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mb-4 transition-all shadow-sm ${templatePdf ? 'bg-[#1B4DA0] text-white' : 'bg-[#FAFAFA] text-[#1B4DA0]'}`}>
                                  {templatePdf ? <FiCheckCircle size={24} /> : <FiUploadCloud size={24} />}
                                </div>
                                <div className="text-center">
                                  <span className={`block text-[11px] font-black uppercase tracking-[2px] mb-1 ${templatePdf ? 'text-[#1B4DA0]' : 'text-[#1A1A2E]'}`}>
                                    {templatePdf ? 'Protocol Template Ready' : 'Upload Offer Template (PDF)'}
                                  </span>
                                  <span className="text-[10px] font-bold text-[#9B9BAD] opacity-60">System will auto-inject dynamic data</span>
                                </div>
                              </>
                            )}
                            <input
                              type="file"
                              accept=".pdf"
                              disabled={isUploadingTemplate}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file) handleTemplateUpload(file);
                              }}
                            />
                          </label>
                        </div>

                        <label className="group relative flex flex-col items-center justify-center w-full py-6 rounded-2xl border-2 border-dashed bg-[#F4F3EF]/40 border-[#E8E7E2] hover:border-[#1B4DA0]/30 transition-all cursor-pointer">
                          <div className="flex flex-col items-center text-center">
                            <div className={`p-2 rounded-xl shadow-sm mb-2 transition-colors ${formData.offerLetter ? 'bg-[#1B4DA0] text-white' : 'bg-white text-[#1B4DA0]'}`}>
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-bold text-[#1A1A2E] max-w-[200px] truncate">
                              {formData.offerLetterName || 'External Signed Letter (Optional)'}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setFormData(prev => ({
                                ...prev,
                                offerLetter: file,
                                offerLetterName: file?.name || prev.offerLetterName || '',
                              }));
                            }}
                          />
                        </label>
                      </div>

                      <div className="pt-8 flex gap-4 border-t border-[#F4F3EF]">
                        <button
                          onClick={handleBackToOffers}
                          className="flex-1 py-4 rounded-[20px] border-2 border-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
                        >
                          Discard
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveOffer}
                          className="flex-[2] bg-[#1B4DA0] text-white py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-[#153e82] transition-all flex items-center justify-center gap-3"
                        >
                          <Send size={16} />
                          {editingOffer ? 'Finalize Changes' : 'Execute Generation'}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Preview */}
                  {templatePdf && (
                    <div ref={previewWrapRef} className="w-1/2 bg-[#FAFAFA] overflow-y-auto p-12 custom-scrollbar flex flex-col items-center relative gap-8">
                      <div className="absolute top-6 left-12 right-12 flex items-center justify-between z-10 pointer-events-none">
                        <div className="px-4 py-2 bg-[#1A1A2E] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Live Precision Preview
                        </div>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-[#9B9BAD]">
                            <FiSearch size={14} />
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-[#9B9BAD]">
                            <FiMaximize size={14} />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-10 mt-10 w-full items-center">
                        {templateViewports.map((vp, idx) => (
                          <div
                            key={idx}
                            className="relative shadow-[0_30px_70px_rgba(0,0,0,0.12)] bg-white rounded-sm border border-[#E8E7E2]"
                            style={{
                              width: vp.width * previewScale,
                              height: vp.height * previewScale
                            }}
                          >
                            <canvas
                              ref={(el) => { templateCanvasRefs.current[idx] = el; }}
                              className="absolute inset-0 w-full h-full pointer-events-none"
                            />

                            {/* Field Overlay */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden origin-top-left" style={{ transform: `scale(${previewScale})` }}>
                              {templateOverlayFields[idx + 1]?.map((f, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="absolute bg-blue-500/5 text-blue-900 overflow-hidden"
                                  style={{
                                    left: `${f.x * 100}%`,
                                    top: `${f.y * 100}%`,
                                    fontSize: `${f.fontSize}px`,
                                    fontWeight: f.weight || 600,
                                    maxWidth: f.maxWidth ? `${f.maxWidth * 100}%` : 'auto',
                                    lineHeight: 1.2,
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: "'Calibri', sans-serif"
                                  }}
                                >
                                  {f.value || <span className="opacity-20 italic">Missing protocol data...</span>}
                                  <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-blue-500/20" />
                                </div>
                              ))}
                            </div>

                            {/* Page Indicator */}
                            <div className="absolute -right-16 top-0 bottom-0 flex flex-col items-center justify-center gap-2 pointer-events-none opacity-40">
                              <span className="text-[10px] font-black text-[#1A1A2E] vertical-text uppercase tracking-widest">Page</span>
                              <div className="w-px flex-1 bg-gradient-to-b from-transparent via-[#1A1A2E] to-transparent" />
                              <span className="text-sm font-bold text-[#1A1A2E]">{idx + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Info Notice */}
                      <div className="w-full max-w-sm mt-8 p-6 rounded-3xl bg-blue-50 border border-blue-100 flex gap-4">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#1B4DA0] flex-shrink-0">
                          <FiInfo size={16} />
                        </div>
                        <p className="text-[11px] font-bold text-[#1B4DA0]/80 leading-relaxed italic">
                          "System will intelligently render your chosen fonts and brand assets during final document execution."
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewingOffer && (
            <OfferDetailDrawer
              offer={viewingOffer}
              onClose={() => setViewingOffer(null)}
              onEdit={handleEditOffer}
              onDelete={handleDeleteOffer}
              onStatusUpdate={handleUpdateStatus}
              isDarkMode={isDarkMode}
            />
          )}
        </AnimatePresence>

        {/* Floating Bulk Action Bar */}
        <AnimatePresence>
          {selectedRowIds.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4">
              <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.9 }}
                className={`rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/20 p-4 flex items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900/90' : 'bg-[#1A1A2E]/95'
                  } text-white`}
              >
                <div className="flex items-center gap-4 pl-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                    {selectedRowIds.length}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Selected</p>
                    <p className="text-[10px] font-medium opacity-60">Offer Records</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedRowIds.length === 1 && (
                    <button
                      onClick={() => {
                        const offer = offers.find(o => o.id === selectedRowIds[0]);
                        if (offer) handleEditOffer(offer);
                        setSelectedRowIds([]);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-bold"
                    >
                      <Edit2 size={14} className="text-blue-400" />
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => {
                      selectedRowIds.forEach(id => handleUpdateStatus(id, 'Sent'));
                      setSelectedRowIds([]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-bold"
                  >
                    <Send size={14} className="text-emerald-400" />
                    Mark Sent
                  </button>

                  <button
                    onClick={() => {
                      selectedRowIds.forEach(id => handleUpdateStatus(id, 'Declined'));
                      setSelectedRowIds([]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-bold text-rose-400"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>

                  <div className="w-px h-8 bg-white/10 mx-1" />

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${selectedRowIds.length} offers?`)) {
                        selectedRowIds.forEach(id => handleDeleteOffer(id));
                        setSelectedRowIds([]);
                      }
                    }}
                    className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-all"
                    title="Bulk Delete"
                  >
                    <Trash2 size={18} />
                  </button>

                  <button
                    onClick={() => setSelectedRowIds([])}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default OfferManagementTab;
