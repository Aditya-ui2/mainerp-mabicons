import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFileText,
  FiSearch,
  FiPlus,
  FiSend,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEdit3,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiMessageCircle,
  FiAlertTriangle,
  FiDownload,
  FiRefreshCw,
  FiTrendingUp,
  FiAward,
  FiMail,
  FiArrowLeft,
} from 'react-icons/fi';
import { getAllCandidates, updateCandidateStatus } from '../../../service/api';

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const config = {
    'Draft': { gradient: 'from-[#0D47A1] to-[#1E88E5]', icon: FiEdit3, bg: 'bg-slate-100', text: 'text-black', border: 'border-slate-200' },
    'Pending Approval': { gradient: 'from-amber-500 to-orange-600', icon: FiClock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Sent': { gradient: 'from-blue-500 to-blue-700', icon: FiSend, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Negotiating': { gradient: 'from-purple-500 to-purple-700', icon: FiMessageCircle, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Accepted': { gradient: 'from-[#0D47A1] to-[#1E88E5]', icon: FiCheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Rejected': { gradient: 'from-red-500 to-red-700', icon: FiXCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Expired': { gradient: 'from-gray-500 to-gray-700', icon: FiAlertTriangle, bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  };
  const { gradient, icon: Icon } = config[status] || config.Draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} text-white shadow-md`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

/* ── Urgency Indicator ── */
const UrgencyBadge = ({ daysLeft }) => {
  if (daysLeft < 0) {
    return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-100 text-red-700">EXPIRED</span>;
  }
  if (daysLeft <= 2) {
    return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">URGENT • {daysLeft}d</span>;
  }
  if (daysLeft <= 5) {
    return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700">{daysLeft} days left</span>;
  }
  return <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-100 text-emerald-700">{daysLeft} days left</span>;
};

/* ══════════════════════════════════════════════════════ */
const OfferManagementTab = ({ isDarkMode }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  // NEW STATE FOR FULL PAGE FORM
  const [showFullPageForm, setShowFullPageForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(null);
  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    position: '',
    client: '',
    offeredCTC: '',
    currentCTC: '',
    joiningDate: '',
    offerDate: '',
    expiryDate: '',
    status: 'Draft',
    negotiationNotes: '',
    hikePercent: '',
  });

  // Fetch offers (candidates at offer stage) from backend
  const fetchOffers = async () => {
    setLoading(true);
    try {
      // Fetch candidates with offer-related statuses
      const response = await getAllCandidates({ 
        status: 'Offer Sent,Negotiating,Accepted,Rejected,Joined' 
      });
      const candidatesData = (response.candidates || response.data || []).map(c => ({
        id: c._id || c.id,
        candidateName: c.name || c.candidateName || 'Unknown',
        email: c.email || '',
        position: c.position?.title || c.positionTitle || c.position || '',
        client: c.position?.client?.companyName || c.clientName || c.client || '',
        offeredCTC: c.offeredCTC || c.expectedCTC || '',
        currentCTC: c.currentCTC || '',
        joiningDate: c.joiningDate || '',
        offerDate: c.offerDate || c.updatedAt?.split('T')[0] || '',
        expiryDate: c.offerExpiryDate || '',
        status: mapCandidateStatusToOffer(c.status),
        negotiationNotes: c.negotiationNotes || c.notes || '',
        hikePercent: calculateHike(c.currentCTC, c.offeredCTC || c.expectedCTC),
        photo: c.photo || '',
      }));
      setOffers(candidatesData);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  // Map candidate status to offer status
  const mapCandidateStatusToOffer = (status) => {
    const statusMap = {
      'Offer Sent': 'Sent',
      'Negotiating': 'Negotiating',
      'Accepted': 'Accepted',
      'Rejected': 'Rejected',
      'Joined': 'Accepted',
    };
    return statusMap[status] || 'Draft';
  };

  // Calculate hike percentage
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

  // Calculate days left
  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  // Handle edit offer - open full page form
  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setFormData({
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
    });
    setShowFullPageForm(true);
    setShowOfferModal(false);
  };

  // Handle create new offer - open full page form
  const handleCreateOffer = () => {
    setEditingOffer(null);
    setFormData({
      candidateName: '',
      email: '',
      position: '',
      client: '',
      offeredCTC: '',
      currentCTC: '',
      joiningDate: '',
      offerDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'Draft',
      negotiationNotes: '',
      hikePercent: '',
    });
    setShowFullPageForm(true);
    setShowOfferModal(false);
  };

  // Handle view offer details
  const handleViewOffer = (offer) => {
    setViewingOffer(offer);
    setShowFullPageForm(false);
  };

  // Handle back to main view
  const handleBackToOffers = () => {
    setShowFullPageForm(false);
    setEditingOffer(null);
    setViewingOffer(null);
  };

  // Handle save offer
  const handleSaveOffer = () => {
    const newOffer = {
      id: editingOffer?.id || Date.now(),
      ...formData,
      photo: editingOffer?.photo || null,
    };

    if (editingOffer) {
      setOffers(prev => prev.map(o => o.id === editingOffer.id ? newOffer : o));
    } else {
      setOffers(prev => [newOffer, ...prev]);
    }

    setShowFullPageForm(false);
    setEditingOffer(null);
  };

  // Stats
  const stats = {
    total: offers.length,
    sent: offers.filter(o => o.status === 'Sent').length,
    negotiating: offers.filter(o => o.status === 'Negotiating').length,
    accepted: offers.filter(o => o.status === 'Accepted').length,
    conversionRate: Math.round((offers.filter(o => o.status === 'Accepted').length / offers.length) * 100) || 0,
  };

  const statCards = [
    { label: 'Total Offers', value: stats.total, icon: FiFileText, bgColor: '#8b5cf6', bgGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', shadowColor: '139, 92, 246' },
    { label: 'Awaiting Response', value: stats.sent, icon: FiSend, bgColor: '#3b82f6', bgGradient: 'linear-gradient(135deg, #3b82f6, #4f46e5)', shadowColor: '59, 130, 246' },
    { label: 'In Negotiation', value: stats.negotiating, icon: FiMessageCircle, bgColor: '#f59e0b', bgGradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', shadowColor: '245, 158, 11' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: FiTrendingUp, bgColor: '#10b981', bgGradient: 'linear-gradient(135deg, #10b981, #0d9488)', shadowColor: '16, 185, 129' },
  ];

  // Filter offers
  const filteredOffers = offers.filter(o => {
    const matchesSearch = (o.candidateName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.client || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'linear-gradient(135deg, #10b981, #0d9488)',
      'linear-gradient(135deg, #f43f5e, #ec4899)',
      'linear-gradient(135deg, #f59e0b, #ea580c)'
    ];
    return gradients[(name || '').charCodeAt(0) % gradients.length];
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Skeleton loader
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
    <div style={{ fontFamily: 'Calibri, sans-serif' }}>
      <AnimatePresence mode="wait">
        {showFullPageForm ? (
          /* Full Page Form */
          <motion.div
            key="fullpage-form"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full"
          >
            {/* Back Button Header */}
            <div className={`sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 mb-4 rounded-xl ${isDarkMode ? 'bg-slate-800/95 backdrop-blur-sm border-b border-slate-700' : 'bg-white/95 backdrop-blur-sm border-b border-slate-200'}`}>
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBackToOffers}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'text-blue-400 hover:bg-slate-700' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Offers
              </motion.button>
              <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h2>
              <div className="w-24"></div>
            </div>

            {/* Form Content - Refined 2-Section Layout */}
            <div className="px-4 sm:px-6 pb-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Section 1: Candidate Profile */}
                <div className={`p-6 md:p-8 rounded-3xl border-2 ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)' }}>
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Candidate Profile</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Basic details of the applicant</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Candidate Name *</label>
                      <input
                        type="text"
                        value={formData.candidateName}
                        onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 hover:border-blue-400/50 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                        placeholder="e.g. Priya Singh"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 hover:border-blue-400/50 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                        placeholder="priya.singh@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Assigned Position</label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 hover:border-blue-400/50 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                        placeholder="e.g. Senior Software Engineer"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Offer Package & Dates */}
                <div className={`p-6 md:p-8 rounded-3xl border-2 ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      <FiDollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Offer Package & Timeline</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Compensation details and key dates</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Current CTC</label>
                      <input
                        type="text"
                        value={formData.currentCTC}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentCTC: e.target.value }))}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-emerald-400/50 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                        placeholder="e.g. 20 LPA"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Offered CTC</label>
                      <input
                        type="text"
                        value={formData.offeredCTC}
                        onChange={(e) => setFormData(prev => ({ ...prev, offeredCTC: e.target.value }))}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-extrabold transition-all focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-emerald-400/50 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-emerald-400 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-emerald-600 placeholder:text-slate-400'}`}
                        placeholder="e.g. 25 LPA"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Offer Generation Date</label>
                      <input
                        type="date"
                        value={formData.offerDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, offerDate: e.target.value }))}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-emerald-400/50 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Expected Joining Date</label>
                      <input
                        type="date"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-emerald-400/50 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex flex-col sm:flex-row items-center justify-end gap-3 mt-8 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackToOffers}
                    className={`w-full sm:w-auto px-6 py-3.5 text-sm font-bold rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveOffer}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5, #0D47A1)', boxShadow: '0 8px 25px -5px rgba(63, 169, 245, 0.5)' }}
                  >
                    <FiPlus className="w-5 h-5" />
                    {editingOffer ? 'Update Offer Details' : 'Generate Offer'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : viewingOffer ? (
          /* Full Page View Details */
          <motion.div
            key="fullpage-view"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full"
          >
            {/* Back Button Header */}
            <div className={`sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 mb-4 rounded-xl ${isDarkMode ? 'bg-slate-800/95 backdrop-blur-sm border-b border-slate-700' : 'bg-white/95 backdrop-blur-sm border-b border-slate-200'}`}>
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBackToOffers}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'text-blue-400 hover:bg-slate-700' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Offers
              </motion.button>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditOffer(viewingOffer)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5, #0D47A1)' }}
                >
                  <FiEdit3 className="w-4 h-4" /> Edit Details
                </motion.button>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Header Card */}
                <div className={`p-6 md:p-8 rounded-3xl border-2 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="absolute -right-10 -top-10 w-48 h-48 opacity-10 rounded-full" style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)' }}></div>

                  {/* Avatar */}
                  <div className="flex-shrink-0 z-10">
                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white dark:ring-slate-700" style={{ background: getAvatarGradient(viewingOffer.candidateName) }}>
                      {getInitials(viewingOffer.candidateName)}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 text-center md:text-left z-10 w-full">
                    <h1 className={`text-2xl md:text-3xl font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{viewingOffer.candidateName}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                      <StatusBadge status={viewingOffer.status} />
                      {viewingOffer.status === 'Sent' && <UrgencyBadge daysLeft={getDaysLeft(viewingOffer.expiryDate)} />}
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        <FiBriefcase className="w-3.5 h-3.5" /> {viewingOffer.position}
                      </span>
                    </div>
                    <div className="flex flex-wrap center items-center justify-center md:justify-start gap-4">
                      <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-slate-700 flex items-center justify-center">
                          <FiMail className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        {viewingOffer.email || 'No email provided'}
                      </p>
                      <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-slate-700 flex items-center justify-center">
                          <FiUser className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        {viewingOffer.client || 'Internal'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Offer Package */}
                  <div className={`p-6 md:p-8 rounded-3xl border-2 hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <h3 className={`text-base font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <FiDollarSign className="w-5 h-5 text-white" />
                      </div>
                      Compensation Package
                    </h3>
                    <div className="space-y-3">
                      <div className={`flex justify-between items-center p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Offered CTC</span>
                        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{viewingOffer.offeredCTC || '-'}</span>
                      </div>
                      <div className={`flex justify-between items-center p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current CTC</span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{viewingOffer.currentCTC || '-'}</span>
                      </div>
                      <div className={`flex justify-between items-center p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-blue-50/50'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>Hike & Growth</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          {viewingOffer.hikePercent ? `+${viewingOffer.hikePercent}%` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline & Roles */}
                  <div className={`p-6 md:p-8 rounded-3xl border-2 hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <h3 className={`text-base font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)' }}>
                        <FiCalendar className="w-5 h-5 text-white" />
                      </div>
                      Timeline Details
                    </h3>
                    <div className="space-y-3">
                      <div className={`flex justify-between items-center p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Offer Date</span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{viewingOffer.offerDate ? new Date(viewingOffer.offerDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                      </div>
                      <div className={`flex justify-between items-center p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Expiry Date</span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{viewingOffer.expiryDate ? new Date(viewingOffer.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                      </div>
                      <div className={`flex justify-between items-center p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Joining Date</span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{viewingOffer.joiningDate ? new Date(viewingOffer.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Negotiation Notes */}
                {viewingOffer.negotiationNotes && (
                  <div className={`p-6 md:p-8 rounded-3xl border-2 border-amber-200 bg-amber-50 hover:shadow-md transition-shadow duration-300 dark:bg-amber-900/10 dark:border-amber-800/50`}>
                    <h3 className="text-base font-bold mb-4 flex items-center gap-3 text-amber-700 dark:text-amber-500">
                      <div className="w-10 h-10 rounded-xl bg-amber-200 dark:bg-amber-800/50 flex items-center justify-center">
                        <FiMessageCircle className="w-5 h-5" />
                      </div>
                      Negotiation Notes
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed font-medium bg-amber-100/50 dark:bg-amber-900/20 p-4 rounded-2xl">
                      {viewingOffer.negotiationNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Main Content */
          <motion.div
            key="main-content"
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="space-y-6"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)', boxShadow: '0 10px 15px -3px rgba(31, 136, 229, 0.25)' }}>
                  <FiAward className="w-6 h-6" style={{ color: 'white' }} />
                </div>
                <div className="ml-2">
                  <h2 className="text-2xl font-bold text-left" style={{ background: 'linear-gradient(90deg, #3FA9F5, #1E88E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Offer Management
                  </h2>
                  <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Track offers, negotiations & acceptances
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateOffer}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #3FA9F5, #1E88E5, #0D47A1)',
                  boxShadow: '0 10px 15px -3px rgba(31, 136, 229, 0.35)'
                }}
              >
                <FiPlus className="w-4 h-4" />
                <span>Create Offer</span>
              </motion.button>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                  whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
                    <div className="w-full h-full rounded-full" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5, #0D47A1)' }}></div>
                  </div>
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {card.label}
                      </p>
                      <p className="text-3xl font-extrabold mt-2" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5, #0D47A1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {card.value}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)', boxShadow: `0 10px 15px -3px rgba(31, 136, 229, 0.3)` }}>
                      <card.icon className="w-5 h-5" style={{ color: 'white' }} />
                    </div>
                  </div>

                  {/* Animated border effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(63, 169, 245, 0.1), rgba(13, 71, 161, 0.1))',
                      border: '1px solid rgba(63, 169, 245, 0.2)'
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search offers..."
                className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
              />
            </motion.div>

            {/* Offers List */}
            {filteredOffers.length === 0 ? (
              <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <FiFileText size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No offers found</p>
                <p className="text-sm mt-1">Create a new offer to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {filteredOffers.map((offer, idx) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleViewOffer(offer)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600 bg-slate-800 hover:bg-slate-700/80' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-blue-300 hover:bg-blue-50/30'}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: Candidate & Position */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0" style={{ background: getAvatarGradient(offer.candidateName) }}>
                            {getInitials(offer.candidateName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{offer.candidateName}</h3>
                              <StatusBadge status={offer.status} />
                              {offer.status === 'Sent' && <UrgencyBadge daysLeft={getDaysLeft(offer.expiryDate)} />}
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{offer.position} • {offer.client}</p>

                            {/* CTC & Dates */}
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <FiDollarSign className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <div>
                                  <span className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{offer.offeredCTC}</span>
                                  <span className={`text-xs ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>({offer.hikePercent}% hike)</span>
                                </div>
                              </div>
                              {offer.joiningDate && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <FiCalendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Joining: {new Date(offer.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                              )}
                            </div>

                            {/* Negotiation Notes */}
                            {offer.negotiationNotes && (
                              <p className={`text-xs mt-2 flex items-center gap-1.5 ${isDarkMode ? 'text-amber-400/80' : 'text-amber-600'}`}>
                                <FiMessageCircle className="w-3.5 h-3.5" />
                                {offer.negotiationNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            <FiDownload className="w-3.5 h-3.5" /> Download
                          </motion.button>
                          {offer.status === 'Sent' && (
                            <motion.button
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              <FiRefreshCw className="w-3.5 h-3.5" /> Resend
                            </motion.button>
                          )}
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); handleEditOffer(offer); }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg"
                            style={{
                              background: 'linear-gradient(135deg, #3FA9F5, #1E88E5, #0D47A1)'
                            }}
                          >
                            <FiEdit3 className="w-3.5 h-3.5" /> Edit
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfferManagementTab;