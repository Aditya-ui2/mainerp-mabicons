import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiStar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowRight,
  FiExternalLink,
  FiTrash2,
  FiRefreshCw,
  FiUpload,
  FiDownload,
  FiBriefcase,
  FiX,
} from 'react-icons/fi';

/* ── Stage Badge ── */
const StageBadge = ({ stage }) => {
  const config = {
    Screening: { color: '#64748b', icon: FiFileText },
    'Phone Interview': { color: '#3b82f6', icon: FiPhone },
    'Technical Round': { color: '#8b5cf6', icon: FiCheckCircle },
    'HR Round': { color: '#f59e0b', icon: FiUsers },
    'Client Interview': { color: '#10b981', icon: FiBriefcase },
    'Offer Sent': { color: '#ec4899', icon: FiMail },
    Joined: { color: '#22c55e', icon: FiCheckCircle },
    Rejected: { color: '#ef4444', icon: FiXCircle },
  };
  const { color, icon: Icon } = config[stage] || config.Screening;
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-lg"
      style={{ backgroundColor: color }}
    >
      <Icon className="w-3 h-3" />
      {stage}
    </motion.span>
  );
};

/* ── Stage Icon Config for Filters ── */
const stageConfig = {
  Screening: { color: '#64748b', icon: FiFileText },
  'Phone Interview': { color: '#3b82f6', icon: FiPhone },
  'Technical Round': { color: '#8b5cf6', icon: FiCheckCircle },
  'HR Round': { color: '#f59e0b', icon: FiUsers },
  'Client Interview': { color: '#10b981', icon: FiBriefcase },
  'Offer Sent': { color: '#ec4899', icon: FiMail },
  Joined: { color: '#22c55e', icon: FiCheckCircle },
};

/* ── Rating Stars ── */
const RatingStars = ({ rating, maxRating = 5 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(maxRating)].map((_, i) => (
      <FiStar
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
      />
    ))}
    <span className="text-xs font-medium text-slate-500 ml-1">{rating}/{maxRating}</span>
  </div>
);

/* ══════════════════════════════════════════════════════ */
const CandidatePipelineTab = ({ isDarkMode }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    jobTitle: '',
    client: '',
    experience: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '30 days',
    skills: '',
  });

  // Mock data
  useEffect(() => {
    const mockCandidates = [
      { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91 98765 43210', location: 'Bangalore', jobTitle: 'Senior Software Engineer', client: 'TechCorp India', stage: 'Technical Round', rating: 4, experience: '5 years', currentCTC: '18 LPA', expectedCTC: '28 LPA', noticePeriod: '30 days', skills: ['React', 'Node.js', 'MongoDB'], appliedDate: '2026-03-12', lastActivity: '2026-03-17', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, name: 'Priya Singh', email: 'priya.singh@email.com', phone: '+91 87654 32109', location: 'Mumbai', jobTitle: 'Product Manager', client: 'StartupXYZ', stage: 'Client Interview', rating: 5, experience: '7 years', currentCTC: '25 LPA', expectedCTC: '38 LPA', noticePeriod: '60 days', skills: ['Agile', 'Roadmap', 'Analytics'], appliedDate: '2026-03-15', lastActivity: '2026-03-18', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91 76543 21098', location: 'Hyderabad', jobTitle: 'UI/UX Designer', client: 'DesignHub', stage: 'Phone Interview', rating: 3, experience: '3 years', currentCTC: '10 LPA', expectedCTC: '16 LPA', noticePeriod: '15 days', skills: ['Figma', 'Adobe XD'], appliedDate: '2026-03-10', lastActivity: '2026-03-16', photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 4, name: 'Sneha Patel', email: 'sneha.patel@email.com', phone: '+91 65432 10987', location: 'Pune', jobTitle: 'Senior Software Engineer', client: 'TechCorp India', stage: 'Offer Sent', rating: 5, experience: '6 years', currentCTC: '20 LPA', expectedCTC: '30 LPA', noticePeriod: '30 days', skills: ['React', 'TypeScript', 'AWS'], appliedDate: '2026-03-05', lastActivity: '2026-03-17', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 5, name: 'Vikram Rao', email: 'vikram.rao@email.com', phone: '+91 54321 09876', location: 'Chennai', jobTitle: 'DevOps Engineer', client: 'CloudScale', stage: 'Screening', rating: 4, experience: '4 years', currentCTC: '15 LPA', expectedCTC: '24 LPA', noticePeriod: '45 days', skills: ['AWS', 'Docker', 'Kubernetes'], appliedDate: '2026-03-16', lastActivity: '2026-03-18', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { id: 6, name: 'Anjali Gupta', email: 'anjali.gupta@email.com', phone: '+91 43210 98765', location: 'Delhi', jobTitle: 'Product Manager', client: 'StartupXYZ', stage: 'Rejected', rating: 2, experience: '2 years', currentCTC: '8 LPA', expectedCTC: '15 LPA', noticePeriod: '30 days', skills: ['Scrum', 'JIRA'], appliedDate: '2026-03-08', lastActivity: '2026-03-14', photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
    ];
    setTimeout(() => {
      setCandidates(mockCandidates);
      setLoading(false);
    }, 600);
  }, []);

  // Pipeline stages for Kanban view
  const stages = ['Screening', 'Phone Interview', 'Technical Round', 'HR Round', 'Client Interview', 'Offer Sent', 'Joined'];
  
  // Stats
  const stats = {
    total: candidates.length,
    inPipeline: candidates.filter(c => !['Joined', 'Rejected'].includes(c.stage)).length,
    offersSent: candidates.filter(c => c.stage === 'Offer Sent').length,
    joined: candidates.filter(c => c.stage === 'Joined').length,
  };

  const statCards = [
    { label: 'Total Candidates', value: stats.total, icon: FiUsers, bgGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', shadowColor: '139, 92, 246' },
    { label: 'In Pipeline', value: stats.inPipeline, icon: FiClock, bgGradient: 'linear-gradient(135deg, #3b82f6, #4f46e5)', shadowColor: '59, 130, 246' },
    { label: 'Offers Sent', value: stats.offersSent, icon: FiMail, bgGradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', shadowColor: '245, 158, 11' },
    { label: 'Joined', value: stats.joined, icon: FiCheckCircle, bgGradient: 'linear-gradient(135deg, #10b981, #0d9488)', shadowColor: '16, 185, 129' },
  ];

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || c.stage === filterStage;
    const matchesJob = filterJob === 'all' || c.jobTitle === filterJob;
    return matchesSearch && matchesStage && matchesJob;
  });

  const uniqueJobs = [...new Set(candidates.map(c => c.jobTitle))];

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

  // Handle Add Candidate
  const handleAddCandidate = () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.jobTitle) {
      alert('Please fill required fields (Name, Email, Job Title)');
      return;
    }
    const candidate = {
      id: Date.now(),
      ...newCandidate,
      stage: 'Screening',
      rating: 0,
      skills: newCandidate.skills.split(',').map(s => s.trim()).filter(Boolean),
      appliedDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      photo: null,
    };
    setCandidates(prev => [candidate, ...prev]);
    setShowAddModal(false);
    setNewCandidate({
      name: '',
      email: '',
      phone: '',
      location: '',
      jobTitle: '',
      client: '',
      experience: '',
      currentCTC: '',
      expectedCTC: '',
      noticePeriod: '30 days',
      skills: '',
    });
  };

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
          {[1, 2, 3, 4].map(i => (
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
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #3b82f6, #4f46e5)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.25)' }}>
            <FiUsers className="w-6 h-6" style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(90deg, #2563eb, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Candidate Pipeline
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Track and manage candidates through hiring stages
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUploadModal(true)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <FiUpload className="w-4 h-4" />
            Upload CVs
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-shadow"
            style={{ background: 'linear-gradient(90deg, #2563eb, #4f46e5)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.25)' }}
          >
            <FiPlus className="w-4 h-4" />
            Add Candidate
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Candidates</p>
              <p className="text-3xl font-extrabold mt-1" style={{ color: '#7c3aed' }}>{stats.total}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#8b5cf6', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}>
              <FiUsers className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>

        {/* In Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>In Pipeline</p>
              <p className="text-3xl font-extrabold mt-1" style={{ color: '#2563eb' }}>{stats.inPipeline}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#3b82f6', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
              <FiClock className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>

        {/* Offers Sent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Offers Sent</p>
              <p className="text-3xl font-extrabold mt-1" style={{ color: '#d97706' }}>{stats.offersSent}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f59e0b', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)' }}>
              <FiMail className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>

        {/* Joined */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#10b981' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Joined</p>
              <p className="text-3xl font-extrabold mt-1" style={{ color: '#059669' }}>{stats.joined}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#10b981', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
              <FiCheckCircle className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pipeline Stage Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {stages.map((stage, i) => {
          const count = candidates.filter(c => c.stage === stage).length;
          const config = stageConfig[stage] || stageConfig.Screening;
          const Icon = config.icon;
          return (
            <motion.button
              key={stage}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterStage(filterStage === stage ? 'all' : stage)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStage === stage
                  ? 'text-white shadow-lg'
                  : isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              style={filterStage === stage ? { backgroundColor: config.color, boxShadow: `0 10px 15px -3px ${config.color}40` } : {}}
            >
              <Icon className="w-4 h-4" style={filterStage === stage ? { color: 'white' } : { color: config.color }} />
              {stage}
              <span className={`px-2 py-0.5 rounded-full text-xs ${filterStage === stage ? 'bg-white/20 text-white' : isDarkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col md:flex-row gap-3"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidates..."
            className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="relative">
          <select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
          >
            <option value="all">All Positions</option>
            {uniqueJobs.map(job => (
              <option key={job} value={job}>{job}</option>
            ))}
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Candidate Cards */}
      {filteredCandidates.length === 0 ? (
        <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <FiUsers size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No candidates found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredCandidates.map((candidate, idx) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className={`rounded-2xl border-2 p-5 transition-shadow cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-blue-200'}`}
                onClick={() => setSelectedCandidate(candidate)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Candidate Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {candidate.photo ? (
                      <div className="relative flex-shrink-0">
                        <img 
                          src={candidate.photo} 
                          alt={candidate.name}
                          className="h-14 w-14 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                        <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg hidden" style={{ background: getAvatarGradient(candidate.name) }}>
                          {getInitials(candidate.name)}
                        </div>
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0" style={{ background: getAvatarGradient(candidate.name) }}>
                        {getInitials(candidate.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{candidate.name}</h3>
                        <StageBadge stage={candidate.stage} />
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.jobTitle} • {candidate.client}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiMail className="w-3.5 h-3.5" /> {candidate.email}
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiMapPin className="w-3.5 h-3.5" /> {candidate.location}
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiBriefcase className="w-3.5 h-3.5" /> {candidate.experience}
                        </span>
                      </div>
                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {candidate.skills.map(skill => (
                          <span key={skill} className={`text-[10px] font-medium px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-100'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Rating & CTC */}
                  <div className="flex flex-col items-end gap-2">
                    <RatingStars rating={candidate.rating} />
                    <div className="text-right">
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Expected CTC</p>
                      <p className={`text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent`}>
                        {candidate.expectedCTC}
                      </p>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Notice: {candidate.noticePeriod}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Candidate Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
              {/* Modal Header */}
              <div className={`sticky top-0 flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                    <FiUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Add New Candidate</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter candidate details</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  <FiX className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5">
                {/* Personal Details */}
                <div>
                  <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Full Name *</label>
                      <input type="text" value={newCandidate.name} onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email *</label>
                      <input type="email" value={newCandidate.email} onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="Enter email" />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Phone</label>
                      <input type="text" value={newCandidate.phone} onChange={(e) => setNewCandidate(prev => ({ ...prev, phone: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Location</label>
                      <input type="text" value={newCandidate.location} onChange={(e) => setNewCandidate(prev => ({ ...prev, location: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="City" />
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                <div>
                  <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Job Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Position/Job Title *</label>
                      <input type="text" value={newCandidate.jobTitle} onChange={(e) => setNewCandidate(prev => ({ ...prev, jobTitle: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g., Senior Software Engineer" />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Client</label>
                      <input type="text" value={newCandidate.client} onChange={(e) => setNewCandidate(prev => ({ ...prev, client: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="Company name" />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Experience</label>
                      <input type="text" value={newCandidate.experience} onChange={(e) => setNewCandidate(prev => ({ ...prev, experience: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g., 5 years" />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Notice Period</label>
                      <select value={newCandidate.noticePeriod} onChange={(e) => setNewCandidate(prev => ({ ...prev, noticePeriod: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                        <option value="Immediate">Immediate</option>
                        <option value="15 days">15 days</option>
                        <option value="30 days">30 days</option>
                        <option value="45 days">45 days</option>
                        <option value="60 days">60 days</option>
                        <option value="90 days">90 days</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Compensation */}
                <div>
                  <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Compensation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current CTC</label>
                      <input type="text" value={newCandidate.currentCTC} onChange={(e) => setNewCandidate(prev => ({ ...prev, currentCTC: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g., 15 LPA" />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Expected CTC</label>
                      <input type="text" value={newCandidate.expectedCTC} onChange={(e) => setNewCandidate(prev => ({ ...prev, expectedCTC: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g., 22 LPA" />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Skills (comma separated)</label>
                  <input type="text" value={newCandidate.skills} onChange={(e) => setNewCandidate(prev => ({ ...prev, skills: e.target.value }))} className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="React, Node.js, MongoDB" />
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-5 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                <button onClick={() => setShowAddModal(false)} className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddCandidate} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25">
                  <FiPlus className="w-4 h-4" />
                  Add Candidate
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload CV Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative rounded-2xl shadow-2xl w-full max-w-md p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Upload CVs/Resumes</h3>
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center ${isDarkMode ? 'border-slate-600 hover:border-blue-500' : 'border-slate-300 hover:border-blue-400'} transition-colors cursor-pointer`}>
                <FiUpload className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <p className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Drag & drop files here</p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>or click to browse</p>
                <p className={`text-xs mt-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Supports PDF, DOC, DOCX (Max 10MB each)</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowUploadModal(false)} className={`px-4 py-2 rounded-xl text-sm font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg">
                  Upload
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CandidatePipelineTab;
