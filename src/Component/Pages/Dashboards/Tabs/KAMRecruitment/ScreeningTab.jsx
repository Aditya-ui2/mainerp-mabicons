import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiStar,
  FiDownload,
  FiEye,
  FiThumbsUp,
  FiThumbsDown,
  FiSend,
  FiUser,
  FiPhone,
  FiMail,
  FiMessageSquare,
  FiBriefcase,
  FiTrendingUp,
} from 'react-icons/fi';

/* ── Score Badge ── */
const ScoreBadge = ({ score }) => {
  const getConfig = (score) => {
    if (score >= 80) return { gradient: 'from-emerald-500 to-teal-600', text: 'Excellent' };
    if (score >= 60) return { gradient: 'from-blue-500 to-indigo-600', text: 'Good' };
    if (score >= 40) return { gradient: 'from-amber-500 to-orange-600', text: 'Average' };
    return { gradient: 'from-red-500 to-rose-600', text: 'Low' };
  };
  const { gradient, text } = getConfig(score);
  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white font-bold text-lg shadow-lg`}>
        {score}
      </div>
      <p className={`text-[10px] font-medium mt-1 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{text}</p>
    </div>
  );
};

/* ── Decision Badge ── */
const DecisionBadge = ({ decision }) => {
  const config = {
    Pending: { bg: 'bg-slate-100 text-slate-600', icon: FiClock },
    Shortlisted: { bg: 'bg-emerald-100 text-emerald-700', icon: FiThumbsUp },
    Rejected: { bg: 'bg-red-100 text-red-700', icon: FiThumbsDown },
    'On Hold': { bg: 'bg-amber-100 text-amber-700', icon: FiClock },
    'Sent to Client': { bg: 'bg-blue-100 text-blue-700', icon: FiSend },
  };
  const { bg, icon: Icon } = config[decision] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${bg}`}>
      <Icon className="w-3 h-3" />
      {decision}
    </span>
  );
};

/* ══════════════════════════════════════════════════════ */
const ScreeningTab = ({ isDarkMode }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Mock data
  useEffect(() => {
    const mockCandidates = [
      { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91 98765 43210', position: 'Senior Software Engineer', client: 'TechCorp India', resumeScore: 85, skillMatch: 90, experienceMatch: 80, screeningDate: '2026-03-17', decision: 'Shortlisted', notes: 'Strong technical background', skills: ['React', 'Node.js', 'MongoDB'], experience: '5 years', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, name: 'Priya Singh', email: 'priya.singh@email.com', phone: '+91 87654 32109', position: 'Product Manager', client: 'StartupXYZ', resumeScore: 92, skillMatch: 95, experienceMatch: 88, screeningDate: '2026-03-17', decision: 'Sent to Client', notes: 'Excellent fit for the role', skills: ['Agile', 'Roadmap', 'Analytics'], experience: '7 years', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91 76543 21098', position: 'UI/UX Designer', client: 'DesignHub', resumeScore: 62, skillMatch: 70, experienceMatch: 55, screeningDate: '2026-03-16', decision: 'On Hold', notes: 'Needs more portfolio review', skills: ['Figma', 'Adobe XD'], experience: '3 years', photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 4, name: 'Sneha Patel', email: 'sneha.patel@email.com', phone: '+91 65432 10987', position: 'Senior Software Engineer', client: 'TechCorp India', resumeScore: 88, skillMatch: 85, experienceMatch: 92, screeningDate: '2026-03-15', decision: 'Shortlisted', notes: 'Good leadership skills', skills: ['React', 'TypeScript', 'AWS'], experience: '6 years', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 5, name: 'Vikram Rao', email: 'vikram.rao@email.com', phone: '+91 54321 09876', position: 'DevOps Engineer', client: 'CloudScale', resumeScore: 75, skillMatch: 80, experienceMatch: 70, screeningDate: '2026-03-18', decision: 'Pending', notes: '', skills: ['AWS', 'Docker', 'Kubernetes'], experience: '4 years', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { id: 6, name: 'Anjali Gupta', email: 'anjali.gupta@email.com', phone: '+91 43210 98765', position: 'Product Manager', client: 'StartupXYZ', resumeScore: 45, skillMatch: 40, experienceMatch: 50, screeningDate: '2026-03-14', decision: 'Rejected', notes: 'Does not meet minimum experience', skills: ['Scrum', 'JIRA'], experience: '2 years', photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
    ];
    setTimeout(() => {
      setCandidates(mockCandidates);
      setLoading(false);
    }, 600);
  }, []);

  // Stats
  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.decision === 'Pending').length,
    shortlisted: candidates.filter(c => c.decision === 'Shortlisted').length,
    sentToClient: candidates.filter(c => c.decision === 'Sent to Client').length,
    avgScore: Math.round(candidates.reduce((sum, c) => sum + c.resumeScore, 0) / candidates.length),
  };

  const statCards = [
    { label: 'To Screen', value: stats.pending, icon: FiClock, bgColor: '#8b5cf6', bgGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', shadowColor: '139, 92, 246' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: FiThumbsUp, bgColor: '#10b981', bgGradient: 'linear-gradient(135deg, #10b981, #0d9488)', shadowColor: '16, 185, 129' },
    { label: 'Sent to Client', value: stats.sentToClient, icon: FiSend, bgColor: '#3b82f6', bgGradient: 'linear-gradient(135deg, #3b82f6, #4f46e5)', shadowColor: '59, 130, 246' },
    { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: FiTrendingUp, bgColor: '#f59e0b', bgGradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', shadowColor: '245, 158, 11' },
  ];

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDecision = filterDecision === 'all' || c.decision === filterDecision;
    return matchesSearch && matchesDecision;
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
            <div key={i} className={`h-36 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
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
         
        <div className="flex items-center gap-3">
  <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}>
    <FiFileText className="w-6 h-6 text-white" />
  </div>
  <div>
    <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      Screening & Assessment
    </h2>
    <p className={`text-sm mt-0.5 text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
      Review CVs and assess candidate fit
    </p>
  </div>
</div>
        </div>
      </motion.div>

      {/* Stats Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {statCards.map((card, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.03, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-800/80 border border-slate-700/50 hover:border-violet-500/50' 
          : 'bg-white border border-slate-200/50 hover:border-violet-200 hover:shadow-xl'
      }`}
      style={{ 
        boxShadow: `0 10px 15px -3px rgba(${card.shadowColor}, 0.15)`,
      }}
    >
      {/* Animated background glow */}
      <motion.div 
        className="absolute inset-0 opacity-0"
        style={{ 
          background: `radial-gradient(circle at 30% 20%, ${card.bgGradient.replace('linear-gradient(', '').replace(')', '')}, transparent)`,
        }}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative flex items-start justify-between z-10">
        <div>
          <motion.p 
            className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.1 }}
          >
            {card.label}
          </motion.p>
          <motion.p 
            className="text-3xl font-extrabold mt-1"
            style={{ background: card.bgGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.2, type: "spring", stiffness: 300 }}
          >
            {card.value}
          </motion.p>
        </div>
        
        <motion.div 
          className="p-3 rounded-xl shadow-lg"
          style={{ background: card.bgGradient, boxShadow: `0 10px 15px -3px rgba(${card.shadowColor}, 0.3)` }}
          initial={{ opacity: 0, rotate: -45, scale: 0 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ delay: i * 0.1 + 0.3, type: "spring", stiffness: 300 }}
          whileHover={{ 
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.3 }
          }}
        >
          <card.icon className="w-5 h-5" style={{ color: 'white' }} />
        </motion.div>
      </div>
      
      {/* Hover shine effect */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transform: 'translateX(-100%)'
        }}
        whileHover={{
          transform: 'translateX(100%)',
          transition: { duration: 0.6 }
        }}
      />
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
  {['all', 'Pending', 'Shortlisted', 'Sent to Client', 'On Hold', 'Rejected'].map((decision) => (
    <motion.button
      key={decision}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setFilterDecision(decision)}
      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
        filterDecision === decision
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
          : isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {decision === 'all' ? 'All' : decision}
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
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
    className="absolute left-4 top-1/2 -translate-y-1/2"
  >
    <FiSearch className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
  </motion.div>
  
  <motion.input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search candidates..."
    className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 hover:border-slate-600' : 'bg-white border-slate-200 placeholder:text-slate-400 hover:border-slate-300'}`}
    whileFocus={{ 
      scale: 1.01,
      transition: { duration: 0.2 }
    }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.35, duration: 0.4 }}
  />
  
  {/* Animated glow effect on focus */}
  <motion.div
    className="absolute inset-0 rounded-xl pointer-events-none"
    style={{
      background: 'linear-gradient(90deg, #2563eb, #4f46e5)',
      opacity: 0,
      filter: 'blur(8px)',
      zIndex: -1
    }}
    animate={{
      opacity: searchTerm ? 0.15 : 0
    }}
    transition={{ duration: 0.3 }}
  />
  
  {/* Clear button animation */}
  <AnimatePresence>
    {searchTerm && (
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSearchTerm('')}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <FiX className={`w-4 h-4 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`} />
      </motion.button>
    )}
  </AnimatePresence>
  
  {/* Animated underline effect */}
  <motion.div
    className="absolute bottom-0 left-0 h-0.5 rounded-full"
    style={{
      background: 'linear-gradient(90deg, #2563eb, #4f46e5)',
      width: '0%'
    }}
    animate={{
      width: searchTerm ? '100%' : '0%'
    }}
    transition={{ duration: 0.3 }}
  />
</motion.div>

      {/* Candidate Cards */}
      {filteredCandidates.length === 0 ? (
        <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <FiFileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No candidates to screen</p>
          <p className="text-sm mt-1">Add candidates to start screening</p>
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
                className={`rounded-2xl border-2 p-5 transition-shadow ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-emerald-200'}`}
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
                        <DecisionBadge decision={candidate.decision} />
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.position} • {candidate.client}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiMail className="w-3.5 h-3.5" /> {candidate.email}
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiBriefcase className="w-3.5 h-3.5" /> {candidate.experience}
                        </span>
                      </div>
                      {candidate.notes && (
                        <p className={`text-xs mt-2 italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          "{candidate.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Scores & Actions */}
                  <div className="flex items-center gap-4">
                    {/* Scores */}
                    <div className="flex gap-3">
                      <ScoreBadge score={candidate.resumeScore} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Skills</span>
                          <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${candidate.skillMatch}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                          </div>
                          <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.skillMatch}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Exp.</span>
                          <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${candidate.experienceMatch}%` }} transition={{ duration: 0.8, delay: idx * 0.1 + 0.1 }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600" />
                          </div>
                          <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.experienceMatch}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        <FiEye className="w-3.5 h-3.5" /> View CV
                      </motion.button>
                      {candidate.decision === 'Pending' && (
                        <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                          >
                            <FiThumbsUp className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <FiThumbsDown className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ScreeningTab;
