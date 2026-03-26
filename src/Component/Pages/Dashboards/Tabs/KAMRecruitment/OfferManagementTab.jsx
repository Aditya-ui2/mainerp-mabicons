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
} from 'react-icons/fi';

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const config = {
    'Draft': { gradient: 'from-slate-400 to-slate-500', icon: FiEdit3 },
    'Pending Approval': { gradient: 'from-amber-500 to-orange-600', icon: FiClock },
    'Sent': { gradient: 'from-blue-500 to-indigo-600', icon: FiSend },
    'Negotiating': { gradient: 'from-violet-500 to-purple-600', icon: FiMessageCircle },
    'Accepted': { gradient: 'from-emerald-500 to-teal-600', icon: FiCheckCircle },
    'Rejected': { gradient: 'from-red-500 to-rose-600', icon: FiXCircle },
    'Expired': { gradient: 'from-slate-500 to-slate-600', icon: FiAlertTriangle },
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

  // Mock data
  useEffect(() => {
    const mockOffers = [
      { id: 1, candidateName: 'Priya Singh', email: 'priya.singh@email.com', position: 'Product Manager', client: 'StartupXYZ', offeredCTC: '25 LPA', currentCTC: '20 LPA', joiningDate: '2026-04-15', offerDate: '2026-03-15', expiryDate: '2026-03-22', status: 'Accepted', negotiationNotes: 'Negotiated joining bonus', hikePercent: 25, photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 2, candidateName: 'Rahul Sharma', email: 'rahul.sharma@email.com', position: 'Senior Software Engineer', client: 'TechCorp India', offeredCTC: '22 LPA', currentCTC: '18 LPA', joiningDate: '2026-04-01', offerDate: '2026-03-17', expiryDate: '2026-03-24', status: 'Sent', negotiationNotes: '', hikePercent: 22, photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 3, candidateName: 'Sneha Patel', email: 'sneha.patel@email.com', position: 'Senior Software Engineer', client: 'TechCorp India', offeredCTC: '24 LPA', currentCTC: '19 LPA', joiningDate: '2026-04-10', offerDate: '2026-03-16', expiryDate: '2026-03-23', status: 'Negotiating', negotiationNotes: 'Requested remote work', hikePercent: 26, photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 4, candidateName: 'Vikram Rao', email: 'vikram.rao@email.com', position: 'DevOps Engineer', client: 'CloudScale', offeredCTC: '18 LPA', currentCTC: '15 LPA', joiningDate: '2026-04-20', offerDate: '2026-03-18', expiryDate: '2026-03-25', status: 'Pending Approval', negotiationNotes: '', hikePercent: 20, photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { id: 5, candidateName: 'Ananya Reddy', email: 'ananya.r@email.com', position: 'Data Analyst', client: 'DataMinds', offeredCTC: '12 LPA', currentCTC: '10 LPA', joiningDate: '2026-04-05', offerDate: '2026-03-10', expiryDate: '2026-03-17', status: 'Rejected', negotiationNotes: 'Chose competitor offer', hikePercent: 20, photo: 'https://randomuser.me/api/portraits/women/55.jpg' },
      { id: 6, candidateName: 'Karthik M', email: 'karthik.m@email.com', position: 'UI/UX Designer', client: 'DesignHub', offeredCTC: '14 LPA', currentCTC: '12 LPA', joiningDate: '', offerDate: '2026-03-19', expiryDate: '2026-03-26', status: 'Draft', negotiationNotes: 'Awaiting budget approval', hikePercent: 17, photo: 'https://randomuser.me/api/portraits/men/46.jpg' },
    ];
    setTimeout(() => {
      setOffers(mockOffers);
      setLoading(false);
    }, 600);
  }, []);

  // Calculate days left
  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
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
    const matchesSearch = o.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.client.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className="space-y-6">
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.25)' }}>
            <FiAward className="w-6 h-6" style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(90deg, #7c3aed, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Offer Management
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Track offers, negotiations & acceptances
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowOfferModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium hover:shadow-xl transition-shadow"
          style={{ background: 'linear-gradient(90deg, #8b5cf6, #9333ea)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.25)' }}
        >
          <FiPlus className="w-4 h-4" /> Create Offer
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
            style={{ boxShadow: `0 10px 15px -3px rgba(${card.shadowColor}, 0.15)` }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
              <div className="w-full h-full rounded-full" style={{ background: card.bgGradient }}></div>
            </div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {card.label}
                </p>
                <p className="text-3xl font-extrabold mt-1" style={{ background: card.bgGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {card.value}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: card.bgGradient, boxShadow: `0 10px 15px -3px rgba(${card.shadowColor}, 0.3)` }}>
                <card.icon className="w-5 h-5" style={{ color: 'white' }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {['all', 'Draft', 'Pending Approval', 'Sent', 'Negotiating', 'Accepted', 'Rejected'].map((status) => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filterStatus === status
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                : isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </motion.button>
        ))}
      </motion.div>

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
          className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
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
                className={`rounded-2xl border-2 p-5 transition-shadow ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-violet-200'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Candidate & Position */}
                  <div className="flex items-start gap-4 flex-1">
                    {offer.photo ? (
                      <div className="relative flex-shrink-0">
                        <img 
                          src={offer.photo} 
                          alt={offer.candidateName}
                          className="h-14 w-14 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                        <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg hidden" style={{ background: getAvatarGradient(offer.candidateName) }}>
                          {getInitials(offer.candidateName)}
                        </div>
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0" style={{ background: getAvatarGradient(offer.candidateName) }}>
                        {getInitials(offer.candidateName)}
                      </div>
                    )}
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      <FiDownload className="w-3.5 h-3.5" /> Download
                    </motion.button>
                    {offer.status === 'Sent' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <FiRefreshCw className="w-3.5 h-3.5" /> Resend
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedOffer(offer)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md hover:shadow-lg"
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

      {/* Create Offer Modal */}
      <AnimatePresence>
        {showOfferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowOfferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Create New Offer</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Candidate Name" className={`w-full rounded-xl border-2 p-3 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                <input type="text" placeholder="Position" className={`w-full rounded-xl border-2 p-3 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Offered CTC" className={`w-full rounded-xl border-2 p-3 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                  <input type="date" placeholder="Joining Date" className={`w-full rounded-xl border-2 p-3 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowOfferModal(false)} className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Cancel</button>
                  <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-lg">Create Offer</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OfferManagementTab;
