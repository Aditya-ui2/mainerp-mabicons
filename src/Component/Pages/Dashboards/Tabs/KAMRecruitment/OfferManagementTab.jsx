import { useState, useEffect, useMemo } from 'react';
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
  ArrowUpRight
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
  FiCalendar
} from "react-icons/fi";
import { toast } from "sonner";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts';
import { getAllOffers, saveOffer, getOfferCandidateSuggestions, deleteOffer } from '../../../service/api';
import {
  OFFER_STATUS_COLORS,
  STATUS_ICONS,
  AVATAR_COLORS,
  statusOrder
} from './OfferConstants';

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
    <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm transition-opacity"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`w-full max-w-[520px] h-full overflow-y-auto flex flex-col relative z-[101] shadow-[-12px_0_40px_rgba(0,0,0,0.15)] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-8 border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-[#F4F3EF] bg-[#FAFAF8]'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-[2px] ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Offer Lifecycle</span>
              {offer.status === 'Negotiating' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full">In Negotiation</span>}
            </div>
            <h2 className="text-2xl font-bold font-syne">
              {offer.candidateName}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isDarkMode ? 'text-slate-400 border-slate-700 hover:bg-slate-800' : 'text-[#6B6B7E] border-[#F4F3EF] hover:text-[#1A1A2E] hover:bg-[#F4F3EF]'}`}
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 space-y-8">
          {/* Offer Analysis Radar */}
          <div className={`rounded-3xl border p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-[3px] mb-2 text-center ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Offer Analysis</h3>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { axis: 'Competitiveness', value: offer.hikePercent ? Math.min(100, offer.hikePercent * 3) : 60 },
                  { axis: 'Market Fit', value: 72 },
                  { axis: 'Retention Risk', value: offer.status === 'Accepted' ? 85 : offer.status === 'Declined' ? 30 : 55 },
                  { axis: 'Budget Align', value: 68 },
                ]} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeWidth={0.8} />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fontWeight: 600, fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar dataKey="value" stroke="#a5b4fc" fill="#a5b4fc" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Overview Card */}
          <div className={`p-6 rounded-[32px] relative overflow-hidden group ${isDarkMode ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-[#1A1A2E] text-white shadow-xl'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-blue-300' : 'text-white/50'}`}>Current Status</p>
                <h3 className="text-xl font-bold font-syne">{offer.status}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white'}`}>
                {(() => {
                  const Icon = STATUS_ICONS[offer.status] || FileText;
                  return <Icon size={24} />;
                })()}
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>
                <DollarSign size={12} /> Offered CTC
              </p>
              <p className="text-2xl font-bold">{offer.offeredCTC}</p>
            </div>
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FAFAF8] border-[#F4F3EF]'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>
                <User size={12} /> Position
              </p>
              <p className="text-base font-bold font-syne">{offer.position}</p>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-6">
            <h3 className={`text-xs font-bold uppercase tracking-[2px] flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
              <Clock size={14} className={isDarkMode ? 'text-slate-500' : 'text-[#9B9BAD]'} /> Offer Timeline
            </h3>
            <div className={`relative pl-6 border-l-2 space-y-8 ml-3 ${isDarkMode ? 'border-slate-800' : 'border-[#F4F3EF]'}`}>
              {[
                { event: "Offer Generated", date: offer.offerDate, icon: FileText },
                ...(offer.status !== 'Draft' ? [{ event: "Offer Sent", date: offer.offerDate, icon: Send }] : []),
                ...(offer.joiningDate ? [{ event: "Expected Joining", date: offer.joiningDate, icon: Calendar }] : []),
                ...(offer.status === 'Accepted' ? [{ event: "Offer Accepted", date: new Date(), icon: CheckCircle2 }] : [])
              ].map((t, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[33px] top-0 w-[14px] h-[14px] rounded-full z-10 border-2 ${isDarkMode ? 'bg-slate-900 border-blue-500' : 'bg-white border-[#1B4DA0]'}`} />
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-800 text-blue-400 group-hover:bg-blue-500 group-hover:text-white' : 'bg-[#F4F3EF] text-[#1B4DA0] group-hover:bg-[#1B4DA0] group-hover:text-white'}`}>
                        <t.icon size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{t.event}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-[#9B9BAD]'}`}>{formatDate(t.date)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Card */}
          {offer.negotiationNotes && (
            <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-amber-900/10 border-amber-800/40 text-amber-200/80' : 'bg-[#FAFAF8] border-[#F4F3EF] text-[#4B4B5E]'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-amber-500' : 'text-[#9B9BAD]'}`}>Negotiation Notes</p>
              <p className="text-sm leading-relaxed italic">
                "{offer.negotiationNotes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-8 border-t sticky bottom-0 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF]'}`}>
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
            
              <div className="flex flex-col gap-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onEdit(offer)}
                  className="w-full h-14 bg-[#1B4DA0] text-white rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-sm shadow-xl shadow-blue-500/10 hover:bg-[#153D80] active:scale-95"
                >
                  <Edit2 size={18} /> Update Offer
                </motion.button>
                
                <button
                  onClick={() => onDelete(offer.candidateId || offer.id)}
                  className={`w-full py-2 flex items-center justify-center gap-2 transition-all font-bold text-[10px] tracking-widest uppercase opacity-40 hover:opacity-100 hover:text-rose-500 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}
                >
                  <Trash2 size={13} /> Delete Record
                </button>
              </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
const OfferManagementTab = ({ isDarkMode }) => {
  const [offers, setOffers] = useState([]);
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
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    candidateId: '',
    candidateName: '',
    email: '',
    position: '',
    client: '',
    offeredCTC: '',
    currentCTC: '',
    joiningDate: '',
    offerDate: '',
    expiryDate: '',
    status: 'Generated',
    negotiationNotes: '',
    hikePercent: '',
    offerLetter: null,
    offerLetterName: '',
    offerLetterUrl: '',
  });

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await getAllOffers();
      const candidatesData = (response.data || []).map(c => ({
        ...c,
        id: c.id,
        status: c.status === 'Draft' ? 'Sent' : c.status,
        hikePercent: calculateHike(c.currentCTC, c.offeredCTC),
      }));
      setOffers(candidatesData);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
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
      toast.error("Failed to save offer");
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
      setViewingOffer(null);
      toast.success("Offer deleted successfully and candidate moved back to pipeline");
    } catch (error) {
      console.error('Failed to delete offer:', error);
      toast.error("Failed to delete offer");
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
    
    // Date filter on offerDate
    let matchesDate = true;
    if (dateFilter !== "all" && o.offerDate) {
      const offerTime = new Date(o.offerDate);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = o.offerDate === now.toISOString().split('T')[0];
      } else if (dateFilter === "week") {
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
        const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);
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

    return matchesSearch && matchesStatus && matchesClient && matchesDate;
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
    <div className="p-8 lg:p-12 min-h-screen bg-[#FDFDFD] dark:bg-slate-950 text-left">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>
      
      {/* Main Dashboard Content - Always Rendered */}
      <div className="max-w-[1440px] mx-auto font-jakarta">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className={`text-[36px] font-bold tracking-tight font-syne leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
              Offer Management
            </h1>
            <p className={`text-sm mt-2 font-medium tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Coordinate compensation packages and acceptance lifecycles</p>
          </div>
          <button
            onClick={handleCreateOffer}
            className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-colors active:scale-95"
          >
            <Plus size={14} /> Generate Offer
          </button>
        </div>


        {/* Search Bar */}
        <div className="bg-white rounded-[24px] p-2 mb-8 border border-[#F4F3EF] shadow-sm">
          <div className="flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-5 py-3">
            <Search size={18} className="text-[#9B9BAD] flex-shrink-0" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate, role, or client..."
              className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>
                <X size={14} className="text-[#9B9BAD] hover:text-[#1A1A2E] transition-colors" />
              </button>
            )}
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

        {/* Offers Deck */}
        <div className="grid grid-cols-1 gap-4">
          {filteredOffers.length === 0 ? (
            <div className={`rounded-[32px] border py-24 flex flex-col items-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-[#F4F3EF] text-[#9B9BAD]'}`}>
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-[#FAFAF8]'}`}>
                <FileText size={32} />
              </div>
              <p className="text-sm font-bold font-syne">No offers found matching your criteria</p>
            </div>
          ) : (
            filteredOffers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => handleViewOffer(offer)}
                className={`group bg-white dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 overflow-hidden`}
              >
                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#1B4DA0]/0 rounded-[32px] blur-3xl group-hover:bg-[#1B4DA0]/5 transition-colors duration-700 pointer-events-none -z-10" />
                
                <div className="flex items-center gap-5 lg:w-[320px] flex-shrink-0">
                  <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105 bg-[#F8FAFF] dark:bg-slate-800 text-[#1B4DA0] dark:text-blue-400 border border-[#EEF2FB] dark:border-slate-700`}>
                    {getInitials(offer.candidateName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-[20px] font-bold truncate font-syne transition-colors ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-[#1A1A2E] group-hover:text-[#1B4DA0]'}`}>{offer.candidateName}</p>
                      <BadgeCheck size={16} className="text-[#10B981] flex-shrink-0" />
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] truncate ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>{offer.position}</p>
                  </div>
                </div>

                <div className={`flex-1 grid grid-cols-2 gap-8 px-0 lg:px-8 lg:border-x ${isDarkMode ? 'border-slate-700' : 'border-[#F4F3EF]'}`}>
                  <div>
                    <p className={`text-[9px] font-bold uppercase tracking-[0.15em] mb-2 leading-none ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Client</p>
                    <p className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{offer.client || '—'}</p>
                  </div>
                  <div>
                    <p className={`text-[9px] font-bold uppercase tracking-[0.15em] mb-2 leading-none ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Hiring Stage</p>
                    <StatusBadge status={offer.status} />
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 text-[#9B9BAD] group-hover:text-[#1B4DA0] group-hover:bg-[#F8FAFF] shadow-sm`}>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {/* Generate/Edit Offer Overlay */}
        {showFullPageForm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackToOffers}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {editingOffer ? 'Edit Recruitment Offer' : 'Register New Offer'}
                  </h2>
                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">
                    Sourcing & Pipeline Integration
                  </p>
                </div>
                <button
                  onClick={handleBackToOffers}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Candidate & Role Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center text-white shadow-xl">
                      <FiUsers className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Candidate & Role Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Full Name *</label>
                      <input
                        type="text"
                        value={formData.candidateName}
                        onChange={(e) => setFormData(prev => ({ ...prev, candidateId: '', candidateName: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                        onFocus={() => {
                          if (candidateSuggestions.length > 0) setShowCandidateSuggestions(true);
                        }}
                        placeholder="Search candidate..."
                      />
                      <AnimatePresence>
                        {showCandidateSuggestions && candidateSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 w-full mt-2 rounded-2xl shadow-xl bg-white border border-[#F4F3EF] overflow-hidden max-h-64 overflow-y-auto"
                          >
                            {candidateSuggestions.map((candidate) => (
                              <button
                                key={candidate.id}
                                type="button"
                                onClick={() => handleSelectCandidateSuggestion(candidate)}
                                className="w-full text-left px-5 py-3.5 transition-all hover:bg-[#F4F3EF] border-b border-[#F4F3EF] last:border-b-0"
                              >
                                <div className="font-bold text-sm text-[#1A1A2E]">{candidate.name}</div>
                                <div className="text-[10px] text-[#9B9BAD] font-medium">Pipeline: {candidate.position || 'General'}</div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Proposed Position</label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                        placeholder="Target Position"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Hiring Client</label>
                      <input
                        type="text"
                        value={formData.client}
                        onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                        placeholder="Client Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#F4F3EF]" />

                {/* Compensation & Timeline */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-white shadow-xl">
                      <FiDollarSign className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Compensation & Timeline</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Current CTC (LPA)</label>
                      <input
                        type="text"
                        value={formData.currentCTC}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentCTC: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                        placeholder="e.g. 8.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Offered CTC (LPA)</label>
                      <input
                        type="text"
                        value={formData.offeredCTC}
                        onChange={(e) => setFormData(prev => ({ ...prev, offeredCTC: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-extrabold text-[#1B4DA0] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                        placeholder="e.g. 12.0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Offer Date</label>
                      <input
                        type="date"
                        value={formData.offerDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, offerDate: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 block">Joining Date</label>
                      <input
                        type="date"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Offer Letter Upload */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8B5CF6] rounded-xl flex items-center justify-center text-white shadow-xl">
                      <FiFileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Offer Documentation</h3>
                  </div>
                  <label className="group relative flex flex-col items-center justify-center w-full min-h-[100px] rounded-2xl border-2 border-dashed bg-[#F4F3EF] border-[#E8E7E2] hover:border-[#1B4DA0]/30 transition-all cursor-pointer">
                    <div className="flex flex-col items-center text-center p-5">
                      <div className="p-2 rounded-xl bg-white shadow-sm mb-2">
                        <Paperclip className="w-4 h-4 text-[#8B5CF6]" />
                      </div>
                      <p className="text-[11px] font-bold text-[#6B6B7E]">
                        {formData.offerLetterName || 'Drop offer letter here or click to upload'}
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

                {/* Footer Actions */}
                <div className="pt-6 flex gap-4 border-t border-[#F4F3EF]">
                  <button
                    onClick={handleBackToOffers}
                    className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveOffer}
                    className="flex-[2] flex items-center justify-center gap-2 py-5 rounded-full bg-[#1B4DA0] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-colors"
                  >
                    {editingOffer ? <FiCheckCircle className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                    {editingOffer ? 'Save Modifications' : 'Generate Offer'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Detail Drawer */}
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
    </div>
  );
};

export default OfferManagementTab;
