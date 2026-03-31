import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  FiX,
  FiLoader,
  FiArrowLeft,
} from 'react-icons/fi';

import {
  BASE_URL,
  getResumeBankResumes,
  getResumeDownloadUrl,
  getAllCandidates,
  updateCandidateStatus,
} from '../../../service/api';

/* ── Score Badge ── */
const ScoreBadge = ({ score }) => {
  const getConfig = (score) => {
    if (score >= 80) return {
      gradient: 'from-green-500 to-green-700',
      text: 'Excellent'
    };
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

/* ── Candidate Detail View ── */
const CandidateDetailView = ({ candidate, onClose, isDarkMode, handleViewCV, loadingCV, selectedCV, handleStatusUpdate }) => {
  if (!candidate) return null;

  return (
    <div className="w-full pb-8">
      {/* Top Bar */}
      <div className={`sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 mb-6 rounded-xl ${isDarkMode ? 'bg-slate-800/95 backdrop-blur-sm border-b border-slate-700' : 'bg-white/95 backdrop-blur-sm border-b border-slate-200'}`}>
        <motion.button whileHover={{ x: -4 }} whileTap={{ scale: 0.98 }} onClick={onClose}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'text-[#3FA9F5] hover:bg-slate-700' : 'text-[#1E88E5] hover:bg-[#1E88E5]/10'}`}>
          <FiArrowLeft className="w-5 h-5" /> Back to Candidates
        </motion.button>
        <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Candidate Profile</h2>
        <div className="w-24"></div>
      </div>

      <div className={`rounded-3xl p-6 sm:p-10 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100'}`}>
        {/* Header Profile */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)' }}>
            {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{candidate.name}</h1>
              <p className={`text-lg mt-1 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{candidate.position} at {candidate.client}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${isDarkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                <FiMail className="text-[#3FA9F5]" /> {candidate.email}
              </span>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${isDarkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                <FiPhone className="text-emerald-500" /> {candidate.phone}
              </span>
              <DecisionBadge decision={candidate.decision} />
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
            <motion.button onClick={(e) => { e.stopPropagation(); handleViewCV(candidate); }} disabled={loadingCV && selectedCV?.id === candidate.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30" style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)' }}>
              {loadingCV && selectedCV?.id === candidate.id ? <FiLoader className="animate-spin w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              View Full CV
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              <FiMessageSquare className="w-5 h-5" /> Message
            </motion.button>

            {candidate.decision === 'Pending' && (
              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStatusUpdate(candidate.id, 'Shortlisted')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all duration-200"
                >
                  <FiThumbsUp className="w-5 h-5" />
                  <span>Shortlist Candidate</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStatusUpdate(candidate.id, 'Rejected')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-500/20 transition-all duration-200"
                >
                  <FiThumbsDown className="w-5 h-5" />
                  <span>Reject Candidate</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>

        <hr className={`my-10 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <FiStar className="text-amber-500" /> Key Skills & Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#3FA9F5]/10 to-[#0D47A1]/10 text-[#1E88E5] border border-[#3FA9F5]/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {candidate.notes && (
              <div>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  <FiFileText className="text-emerald-500" /> Screening Notes
                </h3>
                <div className={`p-6 rounded-2xl italic leading-relaxed ${isDarkMode ? 'bg-slate-700/30 text-slate-300 border-l-4 border-emerald-500' : 'bg-slate-50 text-slate-700 border-l-4 border-emerald-500'}`}>
                  "{candidate.notes}"
                </div>
              </div>
            )}
          </div>

          {/* Assessment Panel */}
          <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-slate-900/50 border border-slate-700' : 'bg-slate-50 border border-slate-100'}`}>
            <h3 className={`text-lg font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>AI Assessment</h3>
            <div className="flex justify-center mb-8">
              <ScoreBadge score={candidate.resumeScore} />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Skill Match</span>
                  <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>{candidate.skillMatch}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${candidate.skillMatch}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Experience Match</span>
                  <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>{candidate.experienceMatch}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${candidate.experienceMatch}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

  // CV Modal States
  const [showCVModal, setShowCVModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [cvPreviewUrl, setCvPreviewUrl] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);

  // Fetch candidates from backend
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // Fetch candidates that are in screening stage
      const response = await getAllCandidates({ stage: 'Screening' });
      
      const rawData = response?.data || response?.candidates || [];
      if (!Array.isArray(rawData)) {
        console.error('Expected array for candidates but got:', rawData);
        setCandidates([]);
        return;
      }

      const candidatesData = rawData.map(c => ({
        id: c._id || c.id,
        name: c.name || 'Unknown Candidate',
        email: c.email || '',
        phone: c.phone || '',
        position: c.position?.title || c.positionTitle || (typeof c.position === 'string' ? c.position : 'Unknown Position'),
        client: c.position?.client?.companyName || c.clientName || (typeof c.client === 'string' ? c.client : (c.client?.companyName || c.client?.name || 'Unknown Client')),
        status: c.status || 'Submitted',
        stage: c.stage || 'Screening',
        resumeScore: c.rating || 0,
        skillMatch: c.skillMatch || 0,
        experienceMatch: c.experienceMatch || 0,
        screeningDate: (c.updatedAt && typeof c.updatedAt === 'string') ? c.updatedAt.split('T')[0] : 
                        ((c.createdAt && typeof c.createdAt === 'string') ? c.createdAt.split('T')[0] : ''),
        avatar: (c.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        pipelineStatus: c.pipelineStatus || 'pending',
        skills: Array.isArray(c.skills) ? c.skills : (typeof c.skills === 'string' ? c.skills.split(',').map(s => s.trim()) : []),
        experience: c.experience || 'N/A',
        expectedSalary: c.expectedSalary || 'N/A',
        noticePeriod: c.noticePeriod || 'N/A',
        cvUrl: c.cvUrl || null,
        cvFileName: c.cvFileName || null,
        decision: mapStatusToDecision(c.status || c.pipelineStatus),
        notes: c.notes || c.screeningNotes || '',
      }));
      
      console.log(`Fetched ${candidatesData.length} screening candidates`);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Failed to fetch screening candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (candidateId, newStatus) => {
    try {
      await updateCandidateStatus(candidateId, { status: newStatus });
      setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { ...c, status: newStatus, decision: mapStatusToDecision(newStatus) } : c
      ));
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(prev => ({ ...prev, status: newStatus, decision: mapStatusToDecision(newStatus) }));
      }
    } catch (error) {
      console.error(`Failed to update candidate ${candidateId} to ${newStatus}:`, error);
      // Optional: Add toast notification for error
    }
  };

  // Map candidate status to screening decision
  const mapStatusToDecision = (status) => {
    const statusMap = {
      'Screening': 'Pending',
      'Shortlisted': 'Shortlisted',
      'Sent': 'Sent to Client',
      'On Hold': 'On Hold',
      'Rejected': 'Rejected',
      'pending': 'Pending',
      'hold': 'On Hold',
      'approved': 'Shortlisted',
      'rejected': 'Rejected',
    };
    return statusMap[status] || 'Pending';
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Handle View CV
  const handleViewCV = async (candidate) => {
    try {
      setLoadingCV(true);
      setSelectedCV(candidate);

      // 1. If candidate already has a direct CV URL (locally uploaded), use it immediately
      if (candidate.cvUrl) {
        // Ensure we have a full URL
        const fullUrl = candidate.cvUrl.startsWith('http') 
          ? candidate.cvUrl 
          : `${BASE_URL}${candidate.cvUrl.startsWith('/') ? '' : '/'}${candidate.cvUrl}`;
        
        setCvPreviewUrl(fullUrl);
        setShowCVModal(true);
        return;
      }

      // 2. Otherwise, search for candidate's CV in ResumeBank using email or name (for synced resumes)
      const response = await getResumeBankResumes({
        search: candidate.email || candidate.name,
        limit: 5
      });

      if (response.data && response.data.length > 0) {
        const resume = response.data[0];
        const downloadResponse = await getResumeDownloadUrl(resume.id);
        
        // Handle downloadUrl (might be relative for 'local' drive from ResumeBank)
        let downloadUrl = downloadResponse.downloadUrl;
        if (downloadUrl && !downloadUrl.startsWith('http')) {
          downloadUrl = `${BASE_URL}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
        }
        
        setCvPreviewUrl(downloadUrl);
        setShowCVModal(true);
      } else {
        alert('CV not found in Resume Bank. Please sync resumes first.');
      }
    } catch (error) {
      console.error('Failed to load CV:', error);
      alert('Failed to load CV. Please try again.');
    } finally {
      setLoadingCV(false);
    }
  };

  // Stats
  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.decision === 'Pending').length,
    shortlisted: candidates.filter(c => c.decision === 'Shortlisted').length,
    sentToClient: candidates.filter(c => c.decision === 'Sent to Client').length,
    avgScore: candidates.length > 0 ? Math.round(candidates.reduce((sum, c) => sum + (c.resumeScore || 0), 0) / candidates.length) : 0,
  };

  const statCards = [
    { label: 'To Screen', value: stats.pending, icon: FiClock, bgColor: '#3FA9F5', bgGradient: 'linear-gradient(135deg, #3FA9F5, #0D47A1)', shadowColor: '63, 169, 245' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: FiThumbsUp, bgColor: '#10b981', bgGradient: 'linear-gradient(135deg, #10b981, #0d9488)', shadowColor: '16, 185, 129' },
    { label: 'Sent to Client', value: stats.sentToClient, icon: FiSend, bgColor: '#1E88E5', bgGradient: 'linear-gradient(135deg, #3b82f6, #1E88E5)', shadowColor: '59, 130, 246' },
    { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: FiTrendingUp, bgColor: '#f59e0b', bgGradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', shadowColor: '245, 158, 11' },
  ];

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDecision = filterDecision === 'all' || c.decision === filterDecision;
    return matchesSearch && matchesDecision;
  });

  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #3FA9F5, #0D47A1)',
      'linear-gradient(135deg, #3b82f6, #1E88E5)',
      'linear-gradient(135deg, #10b981, #0d9488)',
      'linear-gradient(135deg, #f43f5e, #ec4899)',
      'linear-gradient(135deg, #f59e0b, #ea580c)'
    ];
    return gradients[(name || '').charCodeAt(0) % gradients.length];
  };

  const getInitials = (name) => (name || 'U').split(' ').map(n => n[0] || '').join('').toUpperCase() || 'U';

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
            <div key={i} className={`h-36 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Calibri, sans-serif' }}>
      <AnimatePresence mode="wait">
        {selectedCandidate ? (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full"
          >
            <CandidateDetailView
              candidate={selectedCandidate}
              onClose={() => setSelectedCandidate(null)}
              isDarkMode={isDarkMode}
              handleViewCV={handleViewCV}
              loadingCV={loadingCV}
              selectedCV={selectedCV}
              handleStatusUpdate={handleStatusUpdate}
            />
          </motion.div>
        ) : (
          <motion.div key="list-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -300 }} transition={{ duration: 0.2 }} className="space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)', boxShadow: '0 10px 15px -3px rgba(63, 169, 245, 0.3)' }}>
                  <FiFileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Screening & Assessment
                  </h2>
                  <p className={`text-sm mt-0.5 text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Review CVs and assess candidate fit
                  </p>
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
                  transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                  whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 ${isDarkMode
                    ? 'bg-slate-800/80 border border-slate-700/50 hover:border-[#1E88E5]/50'
                    : 'bg-white border border-slate-200/50 hover:border-[#1E88E5]/30 hover:shadow-xl'
                    }`}
                  style={{ boxShadow: `0 10px 15px -3px rgba(${card.shadowColor}, 0.15)` }}
                >
                  <div className="relative flex items-start justify-between z-10">
                    <div>
                      <motion.p className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {card.label}
                      </motion.p>
                      <motion.p
                        className="text-3xl font-extrabold mt-1"
                        style={{ background: card.bgGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                      >
                        {card.value}
                      </motion.p>
                    </div>
                    <motion.div
                      className="p-3 rounded-xl shadow-lg"
                      style={{ background: card.bgGradient, boxShadow: `0 10px 15px -3px rgba(${card.shadowColor}, 0.3)` }}
                    >
                      <card.icon className="w-5 h-5" style={{ color: 'white' }} />
                    </motion.div>
                  </div>
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
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates..."
                className={`w-full rounded-xl border-2 py-3 pl-12 pr-10 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 hover:border-slate-600'
                  : 'bg-white border-slate-200 placeholder:text-slate-400 hover:border-slate-300'
                  }`}
              />

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
                      onClick={(e) => { if (!e.target.closest('button')) setSelectedCandidate(candidate); }}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition-shadow ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-emerald-200'}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: Candidate Info */}
                        <div className="flex items-start gap-4 flex-1 group">
                          <div
                            className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                            style={{ background: getAvatarGradient(candidate.name) }}
                          >
                            {getInitials(candidate.name)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                {candidate.name}
                              </h3>
                              <DecisionBadge decision={candidate.decision} />
                            </div>

                            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {candidate.position} • {candidate.client}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-200 hover:scale-[1.02]
                            ${isDarkMode
                                  ? 'text-slate-300 bg-slate-700/60 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                                  : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                                }`}>
                                <FiMail className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                                {candidate.email}
                              </span>
                              <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-200 hover:scale-[1.02]
                            ${isDarkMode
                                  ? 'text-slate-300 bg-slate-700/60 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                                  : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                                }`}>
                                <FiBriefcase className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#1E88E5' }} />
                                {candidate.experience}
                              </span>
                            </div>

                            {candidate.notes && (
                              <p className={`text-xs mt-2 italic border-l-2 border-emerald-300 pl-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
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
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${candidate.skillMatch}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1]" />
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
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleViewCV(candidate)}
                              disabled={loadingCV && selectedCV?.id === candidate.id}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold 
                                     bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1]
                                     text-white shadow-md hover:shadow-lg 
                                     transition-all duration-200 disabled:opacity-50"
                            >
                              {loadingCV && selectedCV?.id === candidate.id ? (
                                <FiLoader className="animate-spin w-4 h-4" />
                              ) : (
                                <FiEye className="w-4 h-4" />
                              )}
                              View CV
                            </motion.button>

                            {candidate.decision === 'Pending' && (
                              <div className="flex gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.15, y: -2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(candidate.id, 'Shortlisted'); }}
                                  className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 
                                         text-emerald-600 shadow-md hover:shadow-lg 
                                         transition-all duration-200 border border-emerald-200"
                                  title="Shortlist Candidate"
                                >
                                  <FiThumbsUp className="w-4.5 h-4.5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.15, y: -2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(candidate.id, 'Rejected'); }}
                                  className="p-2.5 rounded-xl bg-gradient-to-br from-red-50 to-red-100 
                                         text-red-600 shadow-md hover:shadow-lg 
                                         transition-all duration-200 border border-red-200"
                                  title="Reject Candidate"
                                >
                                  <FiThumbsDown className="w-4.5 h-4.5" />
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
        )}
      </AnimatePresence>

      {/* CV Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showCVModal && cvPreviewUrl && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b dark:border-gray-700" style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)' }}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowCVModal(false);
                        setCvPreviewUrl(null);
                        setSelectedCV(null);
                      }}
                      className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 flex items-center gap-2 text-white"
                    >
                      <FiArrowLeft className="w-5 h-5" />
                      <span className="text-sm font-medium">Back to Screening</span>
                    </button>
                    <div className="h-8 w-px bg-white/30"></div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {selectedCV?.name}'s Resume
                      </h3>
                      <p className="text-xs text-white/70 mt-0.5">
                        {selectedCV?.position} • {selectedCV?.client}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={cvPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-all duration-200"
                    >
                      <FiDownload size={16} />
                      Download
                    </a>
                    <button
                      onClick={() => {
                        setShowCVModal(false);
                        setCvPreviewUrl(null);
                        setSelectedCV(null);
                      }}
                      className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 text-white"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Body - CV Preview */}
                <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
                  {cvPreviewUrl?.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={cvPreviewUrl}
                      className="w-full h-full border-0"
                      title={`${selectedCV?.name}'s Resume`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div className="p-6 rounded-full bg-white dark:bg-gray-800 shadow-lg">
                        <FiFileText size={64} className="text-[#1E88E5]" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">Preview not available for this file type</p>
                      <a
                        href={cvPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1] text-white rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        Download to View
                      </a>
                    </div>
                  )}
                </div>

                {/* Modal Footer with Candidate Info */}
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{selectedCV?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{selectedCV?.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiBriefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{selectedCV?.experience}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedCV?.decision === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                        selectedCV?.decision === 'Rejected' ? 'bg-red-100 text-red-700' :
                          selectedCV?.decision === 'Sent to Client' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        {selectedCV?.decision || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default ScreeningTab;