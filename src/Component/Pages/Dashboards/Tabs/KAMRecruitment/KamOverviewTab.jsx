import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiTarget,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiPauseCircle,
  FiFileText,
  FiShare2,
  FiUserPlus,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiMail,
  FiPhone,
  FiPlus,
  FiEdit2,
  FiEye,
  FiX,
  FiSend,
  FiDownload,
  FiTrendingUp,
  FiAward,
} from 'react-icons/fi';

/* ===== RUPEE ICON ===== */
const RupeeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3c3.5 0 6-2.5 6-5H6"/>
  </svg>
);

/* ===== STATUS BADGE ===== */
const StatusBadge = ({ status, isDarkMode }) => {
  const configs = {
    Open: { bg: '#dcfce7', text: '#16a34a', darkBg: 'rgba(22, 163, 74, 0.2)', icon: FiCheckCircle },
    Closed: { bg: '#f1f5f9', text: '#64748b', darkBg: 'rgba(100, 116, 139, 0.2)', icon: FiCheckCircle },
    Hold: { bg: '#fef3c7', text: '#d97706', darkBg: 'rgba(217, 119, 6, 0.2)', icon: FiPauseCircle },
  };
  const config = configs[status] || configs.Open;
  const Icon = config.icon;
  
  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ 
        backgroundColor: isDarkMode ? config.darkBg : config.bg, 
        color: config.text 
      }}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

/* ===== STAT CARD ===== */
const StatCard = ({ label, value, icon: Icon, gradient, isDarkMode }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`relative overflow-hidden rounded-xl p-4 border ${
      isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-100'
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className="text-2xl font-bold mt-1" style={{ color: gradient.split(',')[0].replace('linear-gradient(135deg, ', '') }}>
          {value}
        </p>
      </div>
      <div 
        className="p-3 rounded-xl shadow-lg"
        style={{ background: gradient }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </motion.div>
);

/* ===== CLIENT CARD ===== */
const ClientCard = ({ client, isDarkMode, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border overflow-hidden ${
        isDarkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200'
      }`}
    >
      {/* Client Header */}
      <div 
        className={`p-4 cursor-pointer transition-colors ${
          isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          >
            {client.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {client.name}
            </h4>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {client.industry} • {client.positions.length} Position{client.positions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                {client.positions.filter(p => p.status === 'Open').length} Open
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                {client.positions.filter(p => p.status === 'Hold').length} Hold
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                {client.positions.filter(p => p.status === 'Closed').length} Closed
              </span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-100'}`}
          >
            <div className="p-4 space-y-3">
              {/* Position Headers */}
              <div className={`grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <div className="col-span-3">Position</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-2 text-center">Openings</div>
                <div className="col-span-2 text-center">Shared CVs</div>
                <div className="col-span-2 text-center">Shortlisted</div>
                <div className="col-span-2 text-center">Actions</div>
              </div>

              {/* Positions */}
              {client.positions.map((position, idx) => (
                <motion.div
                  key={position.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`grid grid-cols-12 gap-2 items-center py-2 px-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-50 hover:bg-slate-100'
                  } transition-colors`}
                >
                  <div className="col-span-3">
                    <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {position.title}
                    </p>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {position.location}
                    </p>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <StatusBadge status={position.status} isDarkMode={isDarkMode} />
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                      {position.filled}/{position.openings}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}
                    >
                      {position.sharedCVs}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}
                    >
                      {position.shortlisted}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-center gap-1">
                    <button 
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                      }`}
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" style={{ color: '#3b82f6' }} />
                    </button>
                    <button 
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                      }`}
                      title="Share CVs"
                    >
                      <FiShare2 className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                    </button>
                    <button 
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                      }`}
                      title="Generate Onboarding"
                    >
                      <FiUserPlus className="w-4 h-4" style={{ color: '#10b981' }} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Quick Stats */}
              <div className={`flex gap-4 pt-2 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2 text-xs">
                  <FiFileText className="w-4 h-4" style={{ color: '#3b82f6' }} />
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                    Total CVs Shared: <strong className={isDarkMode ? 'text-white' : 'text-slate-700'}>{client.positions.reduce((sum, p) => sum + p.sharedCVs, 0)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FiCheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                    Positions Filled: <strong className={isDarkMode ? 'text-white' : 'text-slate-700'}>{client.positions.reduce((sum, p) => sum + p.filled, 0)}/{client.positions.reduce((sum, p) => sum + p.openings, 0)}</strong>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ===== KAM CARD ===== */
const KamCard = ({ kam, isDarkMode, isExpanded, onToggle }) => {
  const totalPositions = kam.clients.reduce((sum, c) => sum + c.positions.length, 0);
  const openPositions = kam.clients.reduce((sum, c) => sum + c.positions.filter(p => p.status === 'Open').length, 0);
  const holdPositions = kam.clients.reduce((sum, c) => sum + c.positions.filter(p => p.status === 'Hold').length, 0);
  const closedPositions = kam.clients.reduce((sum, c) => sum + c.positions.filter(p => p.status === 'Closed').length, 0);
  const totalCVs = kam.clients.reduce((sum, c) => sum + c.positions.reduce((s, p) => s + p.sharedCVs, 0), 0);
  const shortlisted = kam.clients.reduce((sum, c) => sum + c.positions.reduce((s, p) => s + p.shortlisted, 0), 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200'
      } shadow-lg`}
    >
      {/* KAM Header */}
      <div 
        className={`p-5 cursor-pointer transition-colors ${
          isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          {/* KAM Avatar */}
          <div className="relative">
            {kam.photo ? (
              <img 
                src={kam.photo} 
                alt={kam.name}
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              >
                {kam.avatar}
              </div>
            )}
            <span 
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {kam.clients.length}
            </span>
          </div>

          {/* KAM Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {kam.name}
              </h3>
              <span 
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}
              >
                KAM
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <FiMail className="w-3 h-3" /> {kam.email}
              </span>
              <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <FiPhone className="w-3 h-3" /> {kam.phone}
              </span>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#8b5cf6' }}>{kam.clients.length}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Clients</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#10b981' }}>{openPositions}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Open</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>{holdPositions}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hold</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#3b82f6' }}>{totalCVs}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>CVs Shared</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#ec4899' }}>{shortlisted}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Shortlisted</p>
            </div>
          </div>

          {/* Expand Arrow */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown className={`w-6 h-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          </motion.div>
        </div>

        {/* Mobile Stats */}
        <div className={`md:hidden grid grid-cols-5 gap-2 mt-4 pt-3 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#8b5cf6' }}>{kam.clients.length}</p>
            <p className={`text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Clients</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#10b981' }}>{openPositions}</p>
            <p className={`text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Open</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>{holdPositions}</p>
            <p className={`text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hold</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#3b82f6' }}>{totalCVs}</p>
            <p className={`text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>CVs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#ec4899' }}>{shortlisted}</p>
            <p className={`text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Short</p>
          </div>
        </div>
      </div>

      {/* Clients Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-100'}`}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Assigned Clients ({kam.clients.length})
                </h4>
                <button 
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
                >
                  <FiPlus className="w-3 h-3" /> Add Client
                </button>
              </div>
              
              {kam.clients.map((client, idx) => (
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════ */
/* ═══════════════ KAM OVERVIEW TAB MAIN ═══════════════ */
/* ══════════════════════════════════════════════════════ */
const KamOverviewTab = ({ isDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [kams, setKams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKam, setExpandedKam] = useState(null);
  const [showAddKamModal, setShowAddKamModal] = useState(false);

  // Mock Data - KAMs with their assigned clients and positions
  useEffect(() => {
    const mockKams = [
      {
        id: 1,
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@mabicons.com',
        phone: '+91 98765 43210',
        avatar: 'RS',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        clients: [
          {
            id: 101,
            name: 'TechCorp India Pvt Ltd',
            logo: 'TC',
            industry: 'IT Services',
            positions: [
              { id: 1001, title: 'Senior Software Engineer', location: 'Bangalore', status: 'Open', openings: 5, filled: 2, sharedCVs: 15, shortlisted: 5 },
              { id: 1002, title: 'DevOps Engineer', location: 'Bangalore', status: 'Open', openings: 3, filled: 1, sharedCVs: 10, shortlisted: 3 },
              { id: 1003, title: 'UI/UX Designer', location: 'Remote', status: 'Hold', openings: 2, filled: 0, sharedCVs: 6, shortlisted: 2 },
            ]
          },
          {
            id: 102,
            name: 'DataDriven Analytics',
            logo: 'DA',
            industry: 'Data Analytics',
            positions: [
              { id: 1004, title: 'Data Scientist', location: 'Hyderabad', status: 'Open', openings: 4, filled: 1, sharedCVs: 12, shortlisted: 4 },
              { id: 1005, title: 'ML Engineer', location: 'Hyderabad', status: 'Closed', openings: 2, filled: 2, sharedCVs: 8, shortlisted: 3 },
            ]
          },
        ]
      },
      {
        id: 2,
        name: 'Priya Patel',
        email: 'priya.patel@mabicons.com',
        phone: '+91 98765 43211',
        avatar: 'PP',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg',
        clients: [
          {
            id: 103,
            name: 'CloudScale Solutions',
            logo: 'CS',
            industry: 'Cloud Services',
            positions: [
              { id: 1006, title: 'Cloud Architect', location: 'Mumbai', status: 'Open', openings: 2, filled: 0, sharedCVs: 8, shortlisted: 3 },
              { id: 1007, title: 'Site Reliability Engineer', location: 'Pune', status: 'Open', openings: 3, filled: 1, sharedCVs: 10, shortlisted: 4 },
            ]
          },
          {
            id: 104,
            name: 'FinTech Innovations',
            logo: 'FI',
            industry: 'Financial Services',
            positions: [
              { id: 1008, title: 'Backend Developer', location: 'Mumbai', status: 'Open', openings: 4, filled: 2, sharedCVs: 14, shortlisted: 5 },
              { id: 1009, title: 'Security Analyst', location: 'Mumbai', status: 'Hold', openings: 2, filled: 0, sharedCVs: 5, shortlisted: 1 },
              { id: 1010, title: 'Product Manager', location: 'Remote', status: 'Closed', openings: 1, filled: 1, sharedCVs: 6, shortlisted: 2 },
            ]
          },
          {
            id: 105,
            name: 'EduLearn Systems',
            logo: 'EL',
            industry: 'EdTech',
            positions: [
              { id: 1011, title: 'Full Stack Developer', location: 'Bangalore', status: 'Open', openings: 3, filled: 1, sharedCVs: 9, shortlisted: 3 },
            ]
          }
        ]
      }
    ];

    setTimeout(() => {
      setKams(mockKams);
      setLoading(false);
    }, 600);
  }, []);

  // Calculate overall stats
  const overallStats = {
    totalKams: kams.length,
    totalClients: kams.reduce((sum, k) => sum + k.clients.length, 0),
    totalPositions: kams.reduce((sum, k) => sum + k.clients.reduce((s, c) => s + c.positions.length, 0), 0),
    openPositions: kams.reduce((sum, k) => sum + k.clients.reduce((s, c) => s + c.positions.filter(p => p.status === 'Open').length, 0), 0),
    holdPositions: kams.reduce((sum, k) => sum + k.clients.reduce((s, c) => s + c.positions.filter(p => p.status === 'Hold').length, 0), 0),
    closedPositions: kams.reduce((sum, k) => sum + k.clients.reduce((s, c) => s + c.positions.filter(p => p.status === 'Closed').length, 0), 0),
    totalCVsShared: kams.reduce((sum, k) => sum + k.clients.reduce((s, c) => s + c.positions.reduce((t, p) => t + p.sharedCVs, 0), 0), 0),
    totalShortlisted: kams.reduce((sum, k) => sum + k.clients.reduce((s, c) => s + c.positions.reduce((t, p) => t + p.shortlisted, 0), 0), 0),
  };

  const statCards = [
    { label: 'Key Account Managers', value: overallStats.totalKams, icon: FiTarget, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { label: 'Total Clients', value: overallStats.totalClients, icon: FiBriefcase, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    { label: 'Open Positions', value: overallStats.openPositions, icon: FiCheckCircle, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { label: 'On Hold', value: overallStats.holdPositions, icon: FiPauseCircle, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { label: 'CVs Shared', value: overallStats.totalCVsShared, icon: FiShare2, gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
    { label: 'Shortlisted', value: overallStats.totalShortlisted, icon: FiAward, gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  ];

  // Filter KAMs based on search
  const filteredKams = kams.filter(kam => 
    kam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kam.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kam.clients.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`h-24 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className={`h-40 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
          >
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: isDarkMode ? '#ffffff' : '#7c3aed' }}
            >
              KAM Overview
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage Key Account Managers and their assigned clients
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 lg:w-64">
            <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search KAMs, clients..."
              className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition-all ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500'
                  : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-violet-400'
              }`}
            />
          </div>

          {/* Add KAM Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddKamModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
          >
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add KAM</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <StatCard {...stat} isDarkMode={isDarkMode} />
          </motion.div>
        ))}
      </div>

      {/* KAMs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Key Account Managers ({filteredKams.length})
          </h3>
          <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Click to expand and view assigned clients
          </div>
        </div>

        {filteredKams.map((kam, idx) => (
          <motion.div
            key={kam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <KamCard
              kam={kam}
              isDarkMode={isDarkMode}
              isExpanded={expandedKam === kam.id}
              onToggle={() => setExpandedKam(expandedKam === kam.id ? null : kam.id)}
            />
          </motion.div>
        ))}

        {filteredKams.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}
          >
            <FiUsers className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No KAMs found
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Try adjusting your search or add a new KAM
            </p>
          </motion.div>
        )}
      </div>

      {/* Add KAM Modal */}
      <AnimatePresence>
        {showAddKamModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddKamModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}
              onClick={e => e.stopPropagation()}
            >
              <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    Add New KAM
                  </h3>
                  <button 
                    onClick={() => setShowAddKamModal(false)}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter KAM name"
                    className={`w-full rounded-xl border py-2.5 px-4 text-sm outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500'
                        : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-violet-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="kam@mabicons.com"
                    className={`w-full rounded-xl border py-2.5 px-4 text-sm outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500'
                        : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-violet-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className={`w-full rounded-xl border py-2.5 px-4 text-sm outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500'
                        : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-violet-400'
                    }`}
                  />
                </div>
              </div>
              <div className={`p-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} flex justify-end gap-3`}>
                <button
                  onClick={() => setShowAddKamModal(false)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-xl font-medium text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                >
                  Add KAM
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KamOverviewTab;
