import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronRight,
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
  FiDatabase,
  FiTarget,
  FiArrowLeft,
  FiGrid,
  FiList,
  FiMessageSquare,
  FiCalendar,
  FiMoreVertical,
  FiEdit2,
  FiBarChart2,
  FiSliders,
  FiCheck,
  FiCopy,
  FiAlertCircle,
  FiThumbsUp,
  FiPause,
  FiEye,
  FiBookmark,
  FiTrendingUp,
  FiUserCheck,
  FiUserX,
  FiAward,
  FiActivity,
  FiDollarSign,
  FiZap,
  FiFilter as FiFilterIcon,
} from 'react-icons/fi';
import { getResumeBankResumes, getResumeRoleTypes, getAllCandidates, addCandidate as addCandidateAPI, updateCandidateStatus } from '../../../service/api';

/* ── Stage Badge ── */
const StageBadge = ({ stage }) => {
  const config = {
    Screening: { color: '#64748b', icon: FiFileText },
    'Phone Interview': { color: '#3b82f6', icon: FiPhone },
    'Technical Round': { color: '#1E88E5', icon: FiCheckCircle },
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
  'Technical Round': { color: '#1E88E5', icon: FiCheckCircle },
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
const CACHE_KEY_CANDIDATES = 'cache_kamCandidates';

const CandidatePipelineTab = ({ isDarkMode }) => {
  // Start with cached data or empty array - will fetch real data from API
  const [candidates, setCandidates] = useState(() => {
    try { const c = localStorage.getItem(CACHE_KEY_CANDIDATES); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  // Job Openings from localStorage (synced from JobOpeningsTab)
  const [jobOpenings, setJobOpenings] = useState([]);
  // Resume Bank matches
  const [showResumeBankModal, setShowResumeBankModal] = useState(false);
  const [resumeBankResumes, setResumeBankResumes] = useState([]);
  const [resumeBankLoading, setResumeBankLoading] = useState(false);
  const [resumeBankRole, setResumeBankRole] = useState('');

  // ── View & UI State ── (Kanban removed, default to list)
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);

  // ── Bulk Actions ──
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // ── Notes ──
  const [candidateNotes, setCandidateNotes] = useState({});
  const [newNote, setNewNote] = useState('');

  // ── Reject Modal ──
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectCandidateId, setRejectCandidateId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCustomReason, setRejectCustomReason] = useState('');

  // ── Advanced Filters ──
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterClient, setFilterClient] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // ── Analytics ──
  const [showAnalytics, setShowAnalytics] = useState(false);

  // ── Stage Actions Menu ──
  const [stageMenuId, setStageMenuId] = useState(null);

  // ── Pipeline Status Filter ──
  const [filterPipelineStatus, setFilterPipelineStatus] = useState('all'); // 'all' | 'pending' | 'hold' | 'approved' | 'rejected'

  // ── Approve Modal ──
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveCandidateId, setApproveCandidateId] = useState(null);
  const [approveInterviewRound, setApproveInterviewRound] = useState('Phone Screening');
  const [approveInterviewType, setApproveInterviewType] = useState('Video');
  const [approveInterviewDate, setApproveInterviewDate] = useState('');
  const [approveInterviewTime, setApproveInterviewTime] = useState('');
  const [approveInterviewer, setApproveInterviewer] = useState('');

  // Read job openings from localStorage
  useEffect(() => {
    const storedJobs = localStorage.getItem('kamJobOpenings');
    if (storedJobs) {
      try {
        setJobOpenings(JSON.parse(storedJobs));
      } catch (e) {
        console.error('Failed to parse job openings from localStorage');
      }
    }

    // Check for resumes selected from JobOpeningsTab
    const selectedData = localStorage.getItem('kamSelectedResumes');
    if (selectedData) {
      try {
        const resumes = JSON.parse(selectedData);
        const newCandidates = resumes.map(resume => ({
          id: Date.now() + Math.random(),
          name: resume.candidateName || resume.fileName?.replace(/\.[^.]+$/, '') || 'Unknown',
          email: resume.email || '',
          phone: resume.phone || '',
          location: resume.location || '',
          jobTitle: resume.jobTitle || '',
          client: resume.client || '',
          stage: 'Screening',
          rating: 0,
          experience: resume.experience || '',
          currentCTC: resume.currentCTC || '',
          expectedCTC: resume.expectedCTC || '',
          noticePeriod: '30 days',
          skills: resume.skills || [],
          appliedDate: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0],
          photo: null,
          source: 'Resume Bank',
          resumeId: resume.id,
          pipelineStatus: 'pending',
        }));
        setCandidates(prev => [...newCandidates, ...prev]);
        localStorage.removeItem('kamSelectedResumes');
      } catch (e) {
        console.error('Failed to process selected resumes');
      }
    }

    // Listen for storage changes (when JobOpeningsTab updates)
    const handleStorage = (e) => {
      if (e.key === 'kamJobOpenings' && e.newValue) {
        try {
          setJobOpenings(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to parse job openings update');
        }
      }
      // Listen for resumes selected from JobOpeningsTab
      if (e.key === 'kamSelectedResumes' && e.newValue) {
        try {
          const resumes = JSON.parse(e.newValue);
          const newCandidates = resumes.map(resume => ({
            id: Date.now() + Math.random(),
            name: resume.candidateName || resume.fileName?.replace(/\.[^.]+$/, '') || 'Unknown',
            email: resume.email || '',
            phone: resume.phone || '',
            location: resume.location || '',
            jobTitle: resume.jobTitle || '',
            client: resume.client || '',
            stage: 'Screening',
            rating: 0,
            experience: resume.experience || '',
            currentCTC: resume.currentCTC || '',
            expectedCTC: resume.expectedCTC || '',
            noticePeriod: '30 days',
            skills: resume.skills || [],
            appliedDate: new Date().toISOString().split('T')[0],
            lastActivity: new Date().toISOString().split('T')[0],
            photo: null,
            source: 'Resume Bank',
            resumeId: resume.id,
            pipelineStatus: 'pending',
          }));
          setCandidates(prev => [...newCandidates, ...prev]);
          localStorage.removeItem('kamSelectedResumes');
        } catch (err) {
          console.error('Failed to process selected resumes update');
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Fetch matching resumes from Resume Bank
  const fetchResumeBankMatches = async (roleKeyword) => {
    setResumeBankLoading(true);
    setResumeBankRole(roleKeyword);
    try {
      const response = await getResumeBankResumes({ search: roleKeyword, limit: 20 });
      setResumeBankResumes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch resume bank matches:', error);
      setResumeBankResumes([]);
    } finally {
      setResumeBankLoading(false);
    }
  };

  // Convert resume bank resume to candidate
  const addFromResumeBank = async (resume) => {
    const candidateLocal = {
      id: Date.now() + Math.random(),
      name: resume.candidateName || resume.fileName?.replace(/\.[^.]+$/, '') || 'Unknown',
      email: resume.email || '',
      phone: resume.phone || '',
      location: resume.location || '',
      jobTitle: resumeBankRole || '',
      client: '',
      stage: 'Screening',
      rating: 0,
      experience: resume.experience || '',
      currentCTC: resume.currentCTC || '',
      expectedCTC: resume.expectedCTC || '',
      noticePeriod: '30 days',
      skills: resume.skills || [],
      appliedDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      photo: null,
      source: 'Resume Bank',
      resumeId: resume.id,
      pipelineStatus: 'pending',
    };

    try {
      const apiData = {
        name: candidateLocal.name,
        email: candidateLocal.email,
        phone: candidateLocal.phone,
        location: candidateLocal.location,
        skills: candidateLocal.skills,
        experience: candidateLocal.experience,
        currentSalary: candidateLocal.currentCTC,
        expectedSalary: candidateLocal.expectedCTC,
        stage: 'Screening',
        pipelineStatus: 'pending',
        source: 'Resume Bank',
      };
      if (resume.positionId) apiData.positionId = resume.positionId;
      if (resume.clientId) apiData.clientId = resume.clientId;

      const res = await addCandidateAPI(apiData);
      if (res?.data?._id) candidateLocal.id = res.data._id;
    } catch (err) {
      console.error('Failed to add resume bank candidate:', err);
    }

    setCandidates(prev => [candidateLocal, ...prev]);
  };

  // Fetch candidates from backend
  const fetchCandidates = useCallback(async () => {
    try {
      setRefreshing(true);
      const filters = {};
      if (filterStage !== 'all') filters.stage = filterStage;
      if (filterPipelineStatus !== 'all') filters.pipelineStatus = filterPipelineStatus;
      if (searchTerm) filters.search = searchTerm;

      const res = await getAllCandidates(filters);
      if (res?.success && res.data) {
        const mapped = res.data.map(c => ({
          id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          location: c.location || '',
          jobTitle: c.position?.title || '',
          client: c.client?.companyName || c.client?.name || '',
          stage: c.stage || 'Screening',
          rating: c.rating || 0,
          experience: c.experience || '',
          currentCTC: c.currentSalary || '',
          expectedCTC: c.expectedSalary || '',
          noticePeriod: c.noticePeriod || '30 days',
          skills: c.skills || [],
          appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
          lastActivity: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '',
          photo: null,
          pipelineStatus: c.pipelineStatus || 'pending',
          rejectionReason: c.rejectionReason || '',
          source: c.source || '',
          positionId: c.position?._id,
          clientId: c.client?._id,
        }));
        setCandidates(mapped);
        try { localStorage.setItem(CACHE_KEY_CANDIDATES, JSON.stringify(mapped)); } catch { }
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      // Keep whatever data is already showing
    } finally {
      setRefreshing(false);
    }
  }, [filterStage, filterPipelineStatus, searchTerm]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Pipeline stages
  const stages = ['Screening', 'Phone Interview', 'Technical Round', 'HR Round', 'Client Interview', 'Offer Sent', 'Joined'];

  // Stats
  const stats = {
    total: candidates.length,
    inPipeline: candidates.filter(c => !['Joined', 'Rejected'].includes(c.stage)).length,
    offersSent: candidates.filter(c => c.stage === 'Offer Sent').length,
    joined: candidates.filter(c => c.stage === 'Joined').length,
    pending: candidates.filter(c => (c.pipelineStatus || 'pending') === 'pending').length,
    onHold: candidates.filter(c => c.pipelineStatus === 'hold').length,
    approved: candidates.filter(c => c.pipelineStatus === 'approved').length,
    rejected: candidates.filter(c => c.pipelineStatus === 'rejected').length,
  };

  const statCards = [
    { label: 'Total Candidates', value: stats.total, icon: FiUsers, bgGradient: 'linear-gradient(135deg, #3FA9F5, #0D47A1)', shadowColor: '63, 169, 245' },
    { label: 'In Pipeline', value: stats.inPipeline, icon: FiClock, bgGradient: 'linear-gradient(135deg, #3b82f6, #1E88E5)', shadowColor: '59, 130, 246' },
    { label: 'Offers Sent', value: stats.offersSent, icon: FiMail, bgGradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', shadowColor: '245, 158, 11' },
    { label: 'Joined', value: stats.joined, icon: FiCheckCircle, bgGradient: 'linear-gradient(135deg, #10b981, #0d9488)', shadowColor: '16, 185, 129' },
  ];

  // Filter candidates (advanced)
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.skills && c.skills.some(skill => (skill || '').toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStage = filterStage === 'all' || c.stage === filterStage;
    const matchesJob = filterJob === 'all' || c.jobTitle === filterJob;
    const matchesClient = filterClient === 'all' || c.client === filterClient;
    const matchesSource = filterSource === 'all' || c.source === filterSource;
    const matchesPipelineStatus = filterPipelineStatus === 'all' || (c.pipelineStatus || 'pending') === filterPipelineStatus;
    return matchesSearch && matchesStage && matchesJob && matchesClient && matchesSource && matchesPipelineStatus;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') cmp = (a.name || '').localeCompare(b.name || '');
    else if (sortBy === 'rating') cmp = (b.rating || 0) - (a.rating || 0);
    else if (sortBy === 'experience') cmp = (parseInt(a.experience) || 0) - (parseInt(b.experience) || 0);
    else cmp = new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0);
    return sortOrder === 'asc' ? -cmp : cmp;
  });

  const uniqueJobs = [...new Set(candidates.map(c => c.jobTitle))];
  const uniqueClients = [...new Set(candidates.map(c => c.client).filter(Boolean))];

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

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // ── Rejection reasons ──
  const rejectionReasons = [
    'Not enough experience',
    'Skills mismatch',
    'CTC expectation too high',
    'Failed technical round',
    'Failed HR round',
    'Client rejected',
    'Candidate withdrew',
    'No-show for interview',
    'Better candidate selected',
    'Position closed',
    'Other',
  ];

  // ── Stage order for movement ──
  const stageOrder = ['Screening', 'Phone Interview', 'Technical Round', 'HR Round', 'Client Interview', 'Offer Sent', 'Joined'];

  // ── Move candidate to next stage ──
  const moveToNextStage = (candidateId) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      const currentIdx = stageOrder.indexOf(c.stage);
      if (currentIdx < stageOrder.length - 1) {
        const newStage = stageOrder[currentIdx + 1];
        const now = new Date().toISOString().split('T')[0];
        updateCandidateStatus(candidateId, { stage: newStage }).catch(err => console.error('Failed to update stage:', err));
        return { ...c, stage: newStage, lastActivity: now, stageChangedAt: now };
      }
      return c;
    }));
    setStageMenuId(null);
  };

  // ── Move candidate to specific stage ──
  const moveToStage = (candidateId, stage) => {
    const now = new Date().toISOString().split('T')[0];
    updateCandidateStatus(candidateId, { stage }).catch(err => console.error('Failed to update stage:', err));
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage, lastActivity: now, stageChangedAt: now } : c));
    setStageMenuId(null);
  };

  // ── Reject candidate with reason ──
  const handleReject = () => {
    const reason = rejectReason === 'Other' ? rejectCustomReason : rejectReason;
    if (!reason) return;
    const now = new Date().toISOString().split('T')[0];
    updateCandidateStatus(rejectCandidateId, { stage: 'Rejected', pipelineStatus: 'rejected', rejectionReason: reason }).catch(err => console.error('Failed to reject:', err));
    setCandidates(prev => prev.map(c =>
      c.id === rejectCandidateId ? { ...c, stage: 'Rejected', pipelineStatus: 'rejected', rejectionReason: reason, lastActivity: now, stageChangedAt: now } : c
    ));
    setShowRejectModal(false);
    setRejectCandidateId(null);
    setRejectReason('');
    setRejectCustomReason('');
  };

  // ── Open reject modal ──
  const openRejectModal = (candidateId) => {
    setRejectCandidateId(candidateId);
    setShowRejectModal(true);
    setStageMenuId(null);
  };

  // ── Bulk selection ──
  const toggleSelectCandidate = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCandidates.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredCandidates.map(c => c.id)));
  };
  const bulkMoveStage = (stage) => {
    const now = new Date().toISOString().split('T')[0];
    selectedIds.forEach(id => updateCandidateStatus(id, { stage }).catch(err => console.error('Bulk stage update failed:', err)));
    setCandidates(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, stage, lastActivity: now, stageChangedAt: now } : c));
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };
  const bulkReject = () => {
    const now = new Date().toISOString().split('T')[0];
    selectedIds.forEach(id => updateCandidateStatus(id, { stage: 'Rejected', pipelineStatus: 'rejected', rejectionReason: 'Bulk rejected' }).catch(err => console.error('Bulk reject failed:', err)));
    setCandidates(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, stage: 'Rejected', pipelineStatus: 'rejected', rejectionReason: 'Bulk rejected', lastActivity: now, stageChangedAt: now } : c));
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  // ── Add note ──
  const addNote = (candidateId) => {
    if (!newNote.trim()) return;
    setCandidateNotes(prev => ({
      ...prev,
      [candidateId]: [...(prev[candidateId] || []), { text: newNote, date: new Date().toISOString(), author: 'You' }]
    }));
    setNewNote('');
  };

  // ── Stage duration calculator ──
  const getStageDuration = (candidate) => {
    const changedAt = candidate.stageChangedAt || candidate.appliedDate;
    if (!changedAt) return '';
    const days = Math.floor((new Date() - new Date(changedAt)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  // ── Export to CSV ──
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Job Title', 'Client', 'Stage', 'Experience', 'Current CTC', 'Expected CTC', 'Notice Period', 'Applied Date', 'Rating', 'Skills', 'Status'];
    const rows = filteredCandidates.map(c => [c.name, c.email, c.phone, c.location, c.jobTitle, c.client, c.stage, c.experience, c.currentCTC, c.expectedCTC, c.noticePeriod, c.appliedDate, c.rating, (c.skills || []).join(', '), c.pipelineStatus || 'pending']);
    const csv = [headers.join(','), ...rows.map(r => r.map(val => `"${val || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate-pipeline-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Stage Conversion Analytics ──
  const getConversionStats = () => {
    return stageOrder.map((stage, idx) => {
      const count = candidates.filter(c => c.stage === stage).length;
      const prevCount = idx === 0 ? candidates.length : candidates.filter(c => stageOrder.indexOf(c.stage) >= idx || c.stage === 'Rejected').length;
      const rate = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
      return { stage, count, rate };
    });
  };

  // ── Open detail view (inline, replaces list) ──
  const openDetail = (candidate) => {
    setSelectedCandidateDetail(candidate);
    setShowDetailSidebar(true);
    setStageMenuId(null);
  };

  // ── Hold candidate (toggle) ──
  const holdCandidate = (candidateId) => {
    const now = new Date().toISOString().split('T')[0];
    const candidate = candidates.find(c => c.id === candidateId);
    const newStatus = (candidate?.pipelineStatus || 'pending') === 'hold' ? 'pending' : 'hold';
    updateCandidateStatus(candidateId, { pipelineStatus: newStatus }).catch(err => console.error('Failed to toggle hold:', err));
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, pipelineStatus: newStatus, lastActivity: now } : c));
    setStageMenuId(null);
  };

  // ── Pipeline reject (different from stage reject) ──
  const pipelineRejectCandidate = (candidateId) => {
    openRejectModal(candidateId);
  };

  // ── Open Approve modal ──
  const openApproveModal = (candidateId) => {
    setApproveCandidateId(candidateId);
    setApproveInterviewRound('Phone Screening');
    setApproveInterviewType('Video');
    setApproveInterviewDate('');
    setApproveInterviewTime('');
    setApproveInterviewer('');
    setShowApproveModal(true);
    setStageMenuId(null);
  };

  // ── Approve candidate → push to Interview Schedule ──
  const handleApproveCandidate = () => {
    const candidate = candidates.find(c => c.id === approveCandidateId);
    if (!candidate) return;

    const now = new Date().toISOString().split('T')[0];
    // Update pipeline status to approved in backend
    updateCandidateStatus(approveCandidateId, { pipelineStatus: 'approved' }).catch(err => console.error('Failed to approve:', err));
    // Update pipeline status to approved
    setCandidates(prev => prev.map(c => c.id === approveCandidateId ? { ...c, pipelineStatus: 'approved', lastActivity: now } : c));

    // Create interview entry and push to localStorage for InterviewScheduleTab
    const interviewEntry = {
      id: Date.now(),
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      position: candidate.jobTitle,
      client: candidate.client,
      round: approveInterviewRound,
      type: approveInterviewType,
      date: approveInterviewDate || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      time: approveInterviewTime || '10:00 AM',
      duration: '60 mins',
      interviewer: approveInterviewer || 'To be assigned',
      interviewerRole: '',
      status: 'Scheduled',
      meetLink: approveInterviewType === 'Video' ? `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}` : null,
      photo: candidate.photo || null,
      phone: candidate.phone || '',
      location: candidate.location || '',
      skills: candidate.skills || [],
      experience: candidate.experience || '',
      source: 'Pipeline Approval',
    };

    // Push to localStorage
    const existing = JSON.parse(localStorage.getItem('kamApprovedInterviews') || '[]');
    existing.push(interviewEntry);
    localStorage.setItem('kamApprovedInterviews', JSON.stringify(existing));
    window.dispatchEvent(new StorageEvent('storage', { key: 'kamApprovedInterviews', newValue: JSON.stringify(existing) }));

    setShowApproveModal(false);
    setApproveCandidateId(null);
  };

  // ── Bulk approve ──
  const bulkApprove = () => {
    const now = new Date().toISOString().split('T')[0];
    const approvedCandidates = candidates.filter(c => selectedIds.has(c.id));
    // Update all selected to approved in backend
    selectedIds.forEach(id => updateCandidateStatus(id, { pipelineStatus: 'approved' }).catch(err => console.error('Bulk approve failed:', err)));
    // Update all selected to approved
    setCandidates(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, pipelineStatus: 'approved', lastActivity: now } : c));
    // Push all to Interview Schedule
    const entries = approvedCandidates.map(c => ({
      id: Date.now() + Math.random(),
      candidateName: c.name,
      candidateEmail: c.email,
      position: c.jobTitle,
      client: c.client,
      round: 'Phone Screening',
      type: 'Video',
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      time: '10:00 AM',
      duration: '60 mins',
      interviewer: 'To be assigned',
      interviewerRole: '',
      status: 'Scheduled',
      meetLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`,
      photo: c.photo || null,
      source: 'Pipeline Approval',
    }));
    const existing = JSON.parse(localStorage.getItem('kamApprovedInterviews') || '[]');
    localStorage.setItem('kamApprovedInterviews', JSON.stringify([...existing, ...entries]));
    window.dispatchEvent(new StorageEvent('storage', { key: 'kamApprovedInterviews', newValue: JSON.stringify([...existing, ...entries]) }));
    setSelectedIds(new Set());
  };

  // ── Bulk hold ──
  const bulkHold = () => {
    const now = new Date().toISOString().split('T')[0];
    selectedIds.forEach(id => updateCandidateStatus(id, { pipelineStatus: 'hold' }).catch(err => console.error('Bulk hold failed:', err)));
    setCandidates(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, pipelineStatus: 'hold', lastActivity: now } : c));
    setSelectedIds(new Set());
  };

  // Handle Add Candidate
  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.jobTitle) {
      alert('Please fill required fields (Name, Email, Job Title)');
      return;
    }
    const skillsArr = newCandidate.skills.split(',').map(s => s.trim()).filter(Boolean);
    const candidateLocal = {
      id: Date.now(),
      ...newCandidate,
      stage: 'Screening',
      rating: 0,
      skills: skillsArr,
      appliedDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      photo: null,
      pipelineStatus: 'pending',
    };

    try {
      const apiData = {
        name: newCandidate.name,
        email: newCandidate.email,
        phone: newCandidate.phone,
        location: newCandidate.location,
        skills: skillsArr,
        experience: newCandidate.experience,
        currentSalary: newCandidate.currentCTC,
        expectedSalary: newCandidate.expectedCTC,
        noticePeriod: newCandidate.noticePeriod,
        stage: 'Screening',
        pipelineStatus: 'pending',
      };
      // positionId and clientId required by backend — pass if available
      if (newCandidate.positionId) apiData.positionId = newCandidate.positionId;
      if (newCandidate.clientId) apiData.clientId = newCandidate.clientId;

      const res = await addCandidateAPI(apiData);
      if (res?.data?._id) candidateLocal.id = res.data._id;
    } catch (err) {
      console.error('Failed to add candidate to backend:', err);
    }

    setCandidates(prev => [candidateLocal, ...prev]);
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

  // ══════════════════════════════════════════════════════
  // ── CANDIDATE DETAIL FULL PAGE VIEW (inline) ──
  // ══════════════════════════════════════════════════════
  if (showDetailSidebar && selectedCandidateDetail) {
    return (
      <div style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">

          {/* Back Button */}
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => { setShowDetailSidebar(false); setSelectedCandidateDetail(null); }}
            className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-[#1E88E5] hover:text-[#3FA9F5]' : 'text-[#1E88E5] hover:text-[#0D47A1]'}`}
          >
            <FiArrowLeft className="w-5 h-5" /> Back to Candidate Pipeline
          </motion.button>

          {/* Premium Hero Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-3xl border-2 overflow-hidden relative ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'}`}>
            <div className="relative overflow-hidden p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B82F6, #60A5FA)' }}>
              {/* Abstract decorative elements */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-900 blur-2xl" />
              </div>

              <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Standardized Initials Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl flex-shrink-0 ring-4 ring-white/30 border-2 border-white/20"
                  style={{ background: getAvatarGradient(selectedCandidateDetail.name) }}>
                  {getInitials(selectedCandidateDetail.name)}
                </motion.div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">{selectedCandidateDetail.name}</h2>
                    <div className="flex justify-center sm:start items-center gap-2">
                      <span className={"text-[11px] font-black px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm border border-white/20 " + 
                        ((selectedCandidateDetail.pipelineStatus || 'pending') === 'approved' ? 'bg-emerald-500/30 text-emerald-100' :
                        (selectedCandidateDetail.pipelineStatus || 'pending') === 'hold' ? 'bg-amber-500/30 text-amber-100' :
                          (selectedCandidateDetail.pipelineStatus || 'pending') === 'rejected' ? 'bg-rose-500/30 text-rose-100' :
                            'bg-white/20 text-white/90')
                        }>
                        {(selectedCandidateDetail.pipelineStatus || 'pending') === 'approved' ? '✓ APPROVED' :
                          (selectedCandidateDetail.pipelineStatus || 'pending') === 'hold' ? '⏸ ON HOLD' :
                            (selectedCandidateDetail.pipelineStatus || 'pending') === 'rejected' ? '✗ REJECTED' : '● PENDING'}
                      </span>
                    </div>
                  </div>

                  <p className="text-lg text-white/90 font-medium mb-4 flex items-center justify-center sm:justify-start gap-2">
                    <FiBriefcase className="w-5 h-5 opacity-70" />
                    {selectedCandidateDetail.jobTitle} <span className="opacity-50">•</span> {selectedCandidateDetail.client}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                    <StageBadge stage={selectedCandidateDetail.stage} />
                    <div className="bg-black/10 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-1 border border-white/10">
                      <RatingStars rating={selectedCandidateDetail.rating || 0} />
                    </div>
                  </div>
                </div>

                {/* Quick Action Contact FABs */}
                <div className="flex sm:flex-col gap-3 flex-shrink-0">
                  {selectedCandidateDetail.phone && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href={`https://wa.me/${selectedCandidateDetail.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <FiPhone className="w-5 h-5" />
                    </motion.a>
                  )}
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href={`mailto:${selectedCandidateDetail.email}`}
                    className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-lg shadow-black/10">
                    <FiMail className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>

            {/* Decision Bar */}
            {(selectedCandidateDetail.pipelineStatus || 'pending') !== 'approved' && (selectedCandidateDetail.pipelineStatus || 'pending') !== 'rejected' && (
              <div className={`px-8 py-4 flex items-center justify-between border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-400 shadow-sm'}`}>
                    <FiActivity size={18} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Decision & Action</span>
                </div>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { holdCandidate(selectedCandidateDetail.id); setSelectedCandidateDetail(prev => ({ ...prev, pipelineStatus: (prev.pipelineStatus || 'pending') === 'hold' ? 'pending' : 'hold' })); }}
                     className={`flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-2xl transition-all ${(selectedCandidateDetail.pipelineStatus || 'pending') === 'hold' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : isDarkMode ? 'bg-slate-700 text-amber-400 hover:bg-slate-600 border border-amber-500/20' : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-100 shadow-sm'}`}>
                    <FiPause className="w-4 h-4" /> HOLD
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={() => openApproveModal(selectedCandidateDetail.id)}
                    className="flex items-center justify-center gap-2 px-8 py-2.5 text-xs font-bold rounded-2xl text-white shadow-xl shadow-emerald-500/30 transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <FiThumbsUp className="w-4 h-4" /> APPROVE
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { pipelineRejectCandidate(selectedCandidateDetail.id); setSelectedCandidateDetail(prev => ({ ...prev, pipelineStatus: 'rejected' })); }}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-2xl transition-all ${isDarkMode ? 'bg-slate-700 text-rose-400 hover:bg-slate-600 border border-rose-500/20' : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-100 shadow-sm'}`}>
                    <FiXCircle className="w-4 h-4" /> REJECT
                  </motion.button>
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Premium Stage Progress */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hiring Pipeline Progress</h4>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    Current: {selectedCandidateDetail.stage}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {stageOrder.map((s, i) => {
                    const currentIdx = stageOrder.indexOf(selectedCandidateDetail.stage);
                    const isPast = i < currentIdx;
                    const isCurrent = i === currentIdx;
                    const config = stageConfig[s] || stageConfig.Screening;
                    return (
                      <div key={s} className="flex-1 group relative">
                        <button
                          onClick={() => { moveToStage(selectedCandidateDetail.id, s); setSelectedCandidateDetail(prev => ({ ...prev, stage: s })); }}
                          className={`w-full h-3 rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden ${isCurrent ? 'h-4 shadow-inner' : ''}`}
                          style={{ backgroundColor: isPast || isCurrent ? config.color : isDarkMode ? '#1e293b' : '#f1f5f9' }}
                          title={s}
                        >
                          {(isPast || isCurrent) && (
                            <motion.div
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                              className="absolute inset-0 bg-white/20 skew-x-12"
                            />
                          )}
                        </button>
                        <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap transition-all duration-300 ${isCurrent ? 'opacity-100 translate-y-0 text-blue-500' : 'opacity-0 translate-y-2 ' + (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                          {s}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-10">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>Start</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Screening</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>Goal</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Joined</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Two Column Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Core Metrics */}
                <div className="space-y-6">
                  {/* Contact High-Fidelity Card */}
                  <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 shadow-xl' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-2xl'}`}>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                        <FiUserCheck size={24} />
                      </div>
                      <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Contact Profile</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex items-center gap-5 group">
                        <div className={`w-14 min-w-[3.5rem] h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg ${isDarkMode ? 'bg-blue-500/10 text-blue-400 shadow-blue-500/5' : 'bg-blue-50 text-blue-600 shadow-blue-200/50'}`}>
                          <FiMail className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Primary Email</span>
                          <a href={`mailto:${selectedCandidateDetail.email}`} className={`text-sm font-bold truncate hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{selectedCandidateDetail.email}</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 group">
                        <div className={`w-14 min-w-[3.5rem] h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:-rotate-3 shadow-lg ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 shadow-emerald-500/5' : 'bg-emerald-50 text-emerald-600 shadow-emerald-200/50'}`}>
                          <FiPhone className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Mobile Number</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedCandidateDetail.phone || 'Not Shared'}</span>
                            {selectedCandidateDetail.phone && (
                              <a href={`https://wa.me/${selectedCandidateDetail.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] font-black px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full hover:bg-emerald-500/20 transition-colors flex items-center gap-1 border border-emerald-500/20">
                                <FiCheck size={10} /> WHATSAPP
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 group">
                        <div className={`w-14 min-w-[3.5rem] h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg ${isDarkMode ? 'bg-violet-500/10 text-violet-400 shadow-violet-500/5' : 'bg-violet-50 text-violet-600 shadow-violet-200/50'}`}>
                          <FiMapPin className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Current Location</span>
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedCandidateDetail.location || 'Remote / Unspecified'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills High-Fidelity Card */}
                  <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 shadow-xl' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-2xl'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                        <FiZap size={24} />
                      </div>
                      <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Professional Skills</h4>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {(selectedCandidateDetail.skills || []).map((s, i) => (
                        <motion.span
                          key={s}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.1, rotate: 1 }}
                          className={`text-[11px] px-4 py-2 rounded-xl font-black border transition-all cursor-default ${isDarkMode ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-white text-indigo-600 border-indigo-100 shadow-sm'}`}>
                          {s}
                        </motion.span>
                      ))}
                      {(selectedCandidateDetail.skills || []).length === 0 && <span className="text-xs italic text-slate-500">No skills listed</span>}
                    </div>
                  </div>
                </div>

                {/* Right Column: Key Details & Activity */}
                <div className="space-y-6">
                  {/* Metrics Bento Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Experience', value: selectedCandidateDetail.experience, icon: FiBriefcase, color: '#3FA9F5', bg: 'bg-blue-500/10' },
                      { label: 'Current CTC', value: selectedCandidateDetail.currentCTC, icon: FiDollarSign, color: '#10b981', bg: 'bg-emerald-500/10' },
                      { label: 'Expected CTC', value: selectedCandidateDetail.expectedCTC, icon: FiTrendingUp, color: '#f59e0b', bg: 'bg-amber-500/10' },
                      { label: 'Notice Period', value: selectedCandidateDetail.noticePeriod, icon: FiClock, color: '#ec4899', bg: 'bg-rose-500/10' },
                      { label: 'Application Date', value: selectedCandidateDetail.appliedDate, icon: FiCalendar, color: '#6366f1', bg: 'bg-indigo-500/10' },
                      { label: 'Time In Stage', value: getStageDuration(selectedCandidateDetail) || 'Entry', icon: FiActivity, color: '#14b8a6', bg: 'bg-teal-500/10' },
                    ].map((d, i) => (
                      <motion.div
                        key={d.label}
                        initial={{ opacity: 0, rotateX: -20 }}
                        animate={{ opacity: 1, rotateX: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={`rounded-[2rem] p-5 border transition-all duration-300 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 shadow-lg' : 'bg-white border-slate-100 shadow-xl'}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${d.bg}`} style={{ color: d.color }}>
                            <d.icon size={18} />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d.label}</span>
                        </div>
                        <p className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{d.value || 'N/A'}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Notes & Community Comments */}
                  <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50 shadow-xl' : 'bg-slate-50 shadow-xl border-white'}`}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                          <FiMessageSquare size={24} />
                        </div>
                        <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Process Notes</h4>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-400 border border-slate-100'}`}>
                        {(candidateNotes[selectedCandidateDetail.id] || []).length} TOTAL
                      </span>
                    </div>

                    <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {(candidateNotes[selectedCandidateDetail.id] || []).length === 0 && (
                        <div className="text-center py-8 opacity-40">
                          <FiMessageSquare className="mx-auto mb-2 opacity-20" size={32} />
                          <p className="text-[11px] font-bold uppercase tracking-widest">No feedback yet</p>
                        </div>
                      )}
                      {(candidateNotes[selectedCandidateDetail.id] || []).map((note, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`rounded-2xl p-4 border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-100 shadow-sm'}`}>
                          <p className={`text-[13px] font-medium leading-relaxed mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{note.text}</p>
                          <div className="flex items-center justify-between border-t border-dashed pt-3 mt-auto border-slate-200/50">
                            <span className="text-[10px] font-black uppercase text-blue-500">{note.author}</span>
                            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{new Date(note.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="relative group">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Share your feedback..."
                        onKeyDown={(e) => e.key === 'Enter' && addNote(selectedCandidateDetail.id)}
                        className={`w-full rounded-2xl border-2 px-6 py-4 text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-100 placeholder:text-slate-400'}`}
                      />
                      <button
                        onClick={() => addNote(selectedCandidateDetail.id)}
                        disabled={!newNote.trim()}
                        className="absolute right-3 top-3 h-10 px-6 rounded-xl text-xs font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 shadow-lg shadow-blue-500/20"
                        style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)' }}>
                        POST
                      </button>
                    </div>
                  </div>

                  {/* High-Fidelity Timeline */}
                  <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50 shadow-xl' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-2xl'}`}>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 shadow-inner">
                        <FiActivity size={24} />
                      </div>
                      <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Candidate Journey</h4>
                    </div>
                    <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500/50 before:via-teal-500/50 before:to-transparent">
                      {[
                        { label: `Application registered for ${selectedCandidateDetail.jobTitle}`, date: selectedCandidateDetail.appliedDate, icon: FiFileText, color: '#3b82f6' },
                        { label: `Successfully moved to ${selectedCandidateDetail.stage}`, date: selectedCandidateDetail.lastActivity, icon: FiTarget, color: (stageConfig[selectedCandidateDetail.stage] || stageConfig.Screening).color },
                      ].map((ev, i) => (
                        <div key={i} className="relative group">
                          <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2 border-white bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] group-hover:scale-125 transition-transform" />
                          <div className="flex flex-col">
                            <span className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{ev.label}</span>
                            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{ev.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>


        {/* ═══ Reject Modal ═══ */}
        <AnimatePresence>
          {showRejectModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowRejectModal(false); setRejectCandidateId(null); }} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`relative z-10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                <div className="py-5 px-6 text-center" style={{ background: 'linear-gradient(135deg, #ef4444, #e11d48)' }}>
                  <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <FiXCircle className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Reject Candidate</h3>
                  <p className="text-xs text-white/70 mt-1">Select a reason for rejection</p>
                </div>
                <div className="p-5 space-y-3">
                  <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                    <option value="">Select reason...</option>
                    {rejectionReasons.map(r => (<option key={r} value={r}>{r}</option>))}
                  </select>
                  {rejectReason === 'Other' && (
                    <input type="text" value={rejectCustomReason} onChange={e => setRejectCustomReason(e.target.value)} placeholder="Enter custom reason..."
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200'}`} />
                  )}
                </div>
                <div className={`flex gap-3 p-5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <button onClick={() => { setShowRejectModal(false); setRejectCandidateId(null); setRejectReason(''); setRejectCustomReason(''); }}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Cancel</button>
                  <button onClick={handleReject} disabled={!rejectReason || (rejectReason === 'Other' && !rejectCustomReason)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors">Reject</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══ Approve Modal ═══ */}
        <AnimatePresence>
          {showApproveModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowApproveModal(false); setApproveCandidateId(null); }} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`relative z-10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                <div className="py-5 px-6 text-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <FiThumbsUp className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Approve Candidate</h3>
                  <p className="text-xs text-white/70 mt-1">
                    {(() => { const c = candidates.find(c => c.id === approveCandidateId); return c ? `Schedule interview for ${c.name}` : 'Schedule interview details'; })()}
                  </p>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Interview Round</label>
                    <select value={approveInterviewRound} onChange={e => setApproveInterviewRound(e.target.value)}
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                      <option value="Phone Screening">Phone Screening</option>
                      <option value="HR Round">HR Round</option>
                      <option value="Final Round">Final Round</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Interview Type</label>
                    <select value={approveInterviewType} onChange={e => setApproveInterviewType(e.target.value)}
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                      <option value="Video">Video Call</option>
                      <option value="Phone">Phone Call</option>
                      <option value="In-person">In-Person</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Date</label>
                      <input type="date" value={approveInterviewDate} onChange={e => setApproveInterviewDate(e.target.value)}
                        className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                    </div>
                    <div>
                      <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Time</label>
                      <input type="time" value={approveInterviewTime} onChange={e => setApproveInterviewTime(e.target.value)}
                        className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Interviewer Name</label>
                    <input type="text" value={approveInterviewer} onChange={e => setApproveInterviewer(e.target.value)} placeholder="Enter interviewer name..."
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200'}`} />
                  </div>
                </div>
                <div className={`flex gap-3 p-5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <button onClick={() => { setShowApproveModal(false); setApproveCandidateId(null); }}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Cancel</button>
                  <button onClick={handleApproveCandidate}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <span className="flex items-center justify-center gap-2"><FiCheckCircle className="w-4 h-4" /> Approve & Schedule</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // Resume Bank Full View (inline, replaces pipeline)
  if (showResumeBankModal) {
    return (
      <div style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
          {/* Back */}
          <div className="flex items-center justify-between">
            <motion.button whileHover={{ x: -4 }} onClick={() => { setShowResumeBankModal(false); setResumeBankResumes([]); setResumeBankRole(''); }}
              className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-[#1E88E5] hover:text-[#3FA9F5]' : 'text-[#1E88E5] hover:text-[#0D47A1]'}`}
            >
              <FiArrowLeft className="w-5 h-5" /> Back to Candidate Pipeline
            </motion.button>
          </div>

          {/* Header Card */}
          <div className={`rounded-2xl border-2 overflow-hidden ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}>
            <div className="p-6" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5, #0D47A1)' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Resume Bank — Auto Match</h2>
                  <p className="text-sm text-white/70 mt-0.5">Search resumes by role and add candidates directly to pipeline</p>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <h4 className={`text-base font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)' }}>
                  <FiSearch className="w-3.5 h-3.5 text-white" />
                </div>
                Search by Position / Role
              </h4>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className={`text-sm font-medium mb-1.5 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Select Position</label>
                  <select
                    value={resumeBankRole}
                    onChange={(e) => setResumeBankRole(e.target.value)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                  >
                    <option value="">Select a role to search</option>
                    {jobOpenings.length > 0 ? (
                      jobOpenings.filter(j => j.filled < j.openings).map(job => (
                        <option key={job.id} value={job.title}>{job.title} — {job.client} ({job.openings - job.filled} remaining)</option>
                      ))
                    ) : (
                      <>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Designer">Designer</option>
                        <option value="Data Analyst">Data Analyst</option>
                        <option value="DevOps">DevOps</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => resumeBankRole && fetchResumeBankMatches(resumeBankRole)}
                    disabled={!resumeBankRole || resumeBankLoading}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-50 shadow-lg"
                    style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)', boxShadow: '0 10px 25px -5px rgba(31,136,229,0.4)' }}
                  >
                    {resumeBankLoading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiSearch className="w-4 h-4" />}
                    {resumeBankLoading ? 'Searching...' : 'Search Resumes'}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="p-6">
              {resumeBankLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FiRefreshCw className="w-10 h-10 animate-spin text-[#1E88E5] mb-4" />
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Searching Resume Bank for &quot;{resumeBankRole}&quot;...</p>
                </div>
              ) : resumeBankResumes.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      Found {resumeBankResumes.length} matching resume{resumeBankResumes.length !== 1 ? 's' : ''}
                    </p>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${isDarkMode ? 'bg-[#1E88E5]/40 text-[#3FA9F5]' : 'bg-[#1E88E5]/10 text-[#1E88E5]'}`}>
                      for &quot;{resumeBankRole}&quot;
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {resumeBankResumes.map((resume, idx) => (
                      <motion.div
                        key={resume.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 hover:border-[#1E88E5]' : 'bg-slate-50 border-slate-200 hover:border-[#1E88E5] hover:shadow-md'}`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #3b82f6, #1E88E5)' }}>
                            <FiFileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                              {resume.candidateName || resume.fileName || 'Unknown Resume'}
                            </p>
                            <div className="flex items-center gap-4 mt-1 flex-wrap">
                              {resume.roleType && <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiBriefcase className="w-3 h-3" />{resume.roleType}</span>}
                              {resume.experience && <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiClock className="w-3 h-3" />{resume.experience}</span>}
                              {resume.location && <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiMapPin className="w-3 h-3" />{resume.location}</span>}
                              {resume.email && <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiMail className="w-3 h-3" />{resume.email}</span>}
                            </div>
                            {resume.skills && resume.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {(Array.isArray(resume.skills) ? resume.skills : []).slice(0, 5).map((skill, i) => (
                                  <span key={i} className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{skill}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addFromResumeBank(resume)}
                          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-xl ml-4 flex-shrink-0 shadow-lg"
                          style={{ background: 'linear-gradient(90deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                        >
                          <FiPlus className="w-4 h-4" />
                          Add to Pipeline
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : resumeBankRole ? (
                <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <FiDatabase size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-base">No matching resumes found</p>
                  <p className="text-sm mt-1">Try selecting a different role or sync resumes from the Resume Bank tab</p>
                </div>
              ) : (
                <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <FiDatabase size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-base">Select a role to find matching resumes</p>
                  <p className="text-sm mt-1">Resumes will be fetched automatically from your Resume Bank</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Add Candidate Form View (inline, replaces pipeline)
  if (showAddModal) {
    return (
      <div style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
          {/* Back & Title */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <motion.button whileHover={{ x: -4 }} onClick={() => { setShowAddModal(false); setNewCandidate({ name: '', email: '', phone: '', location: '', jobTitle: '', client: '', experience: '', currentCTC: '', expectedCTC: '', noticePeriod: '30 days', skills: '' }); }}
              className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-[#1E88E5] hover:text-[#3FA9F5]' : 'text-[#1E88E5] hover:text-[#0D47A1]'}`}
            >
              <FiArrowLeft className="w-5 h-5" /> Back to Candidate Pipeline
            </motion.button>
          </div>

          {/* Form Header Card */}
          <div className={`rounded-2xl border-2 overflow-hidden ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}>
            <div className="p-6" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5, #0D47A1)' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add New Candidate</h2>
                  <p className="text-sm text-white/70 mt-0.5">Fill in the candidate details below</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Details */}
              <div>
                <h4 className={`text-base font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)' }}>
                    <FiUsers className="w-3.5 h-3.5 text-white" />
                  </div>
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Full Name *</label>
                    <input type="text" value={newCandidate.name} onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="Enter full name" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Email *</label>
                    <input type="email" value={newCandidate.email} onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="Enter email" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Phone</label>
                    <input type="text" value={newCandidate.phone} onChange={(e) => setNewCandidate(prev => ({ ...prev, phone: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Location</label>
                    <input type="text" value={newCandidate.location} onChange={(e) => setNewCandidate(prev => ({ ...prev, location: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="City" />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} />

              {/* Job Details */}
              <div>
                <h4 className={`text-base font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #1E88E5)' }}>
                    <FiBriefcase className="w-3.5 h-3.5 text-white" />
                  </div>
                  Job Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Position/Job Title *</label>
                    {jobOpenings.length > 0 ? (
                      <select value={newCandidate.jobTitle} onChange={(e) => {
                        const selectedTitle = e.target.value;
                        const matchedJob = jobOpenings.find(j => j.title === selectedTitle);
                        setNewCandidate(prev => ({ ...prev, jobTitle: selectedTitle, client: matchedJob?.client || prev.client }));
                      }} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                        <option value="">Select Position</option>
                        {jobOpenings.map(job => (
                          <option key={job.id} value={job.title}>{job.title} — {job.client} ({job.filled}/{job.openings})</option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" value={newCandidate.jobTitle} onChange={(e) => setNewCandidate(prev => ({ ...prev, jobTitle: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="e.g., Senior Software Engineer" />
                    )}
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Client</label>
                    <input type="text" value={newCandidate.client} onChange={(e) => setNewCandidate(prev => ({ ...prev, client: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="Company name" readOnly={jobOpenings.length > 0 && newCandidate.jobTitle !== ''} />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Experience</label>
                    <input type="text" value={newCandidate.experience} onChange={(e) => setNewCandidate(prev => ({ ...prev, experience: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="e.g., 5 years" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Notice Period</label>
                    <select value={newCandidate.noticePeriod} onChange={(e) => setNewCandidate(prev => ({ ...prev, noticePeriod: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
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

              {/* Divider */}
              <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} />

              {/* Compensation */}
              <div>
                <h4 className={`text-base font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <FiCheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  Compensation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Current CTC</label>
                    <input type="text" value={newCandidate.currentCTC} onChange={(e) => setNewCandidate(prev => ({ ...prev, currentCTC: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="e.g., 15 LPA" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Expected CTC</label>
                    <input type="text" value={newCandidate.expectedCTC} onChange={(e) => setNewCandidate(prev => ({ ...prev, expectedCTC: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="e.g., 22 LPA" />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} />

              {/* Skills & Resume */}
              <div>
                <h4 className={`text-base font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                    <FiStar className="w-3.5 h-3.5 text-white" />
                  </div>
                  Skills & Resume
                </h4>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Skills (comma separated)</label>
                    <input type="text" value={newCandidate.skills} onChange={(e) => setNewCandidate(prev => ({ ...prev, skills: e.target.value }))} className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-[#1E88E5]/50 focus:border-[#1E88E5] ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} placeholder="React, Node.js, MongoDB" />
                  </div>
                  {/* Resume Upload */}
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Upload Resume/CV</label>
                    <div className={`mt-1.5 border-2 border-dashed rounded-xl p-6 text-center ${isDarkMode ? 'border-slate-600 hover:border-[#1E88E5]' : 'border-slate-300 hover:border-[#1E88E5]'} transition-colors cursor-pointer`}>
                      <FiUpload className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Drag & drop or click to browse</p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>PDF, DOC, DOCX (Max 10MB)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className={`flex items-center justify-between p-6 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <button onClick={() => { setShowAddModal(false); setNewCandidate({ name: '', email: '', phone: '', location: '', jobTitle: '', client: '', experience: '', currentCTC: '', expectedCTC: '', noticePeriod: '30 days', skills: '' }); }}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddCandidate}
                className="flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white rounded-xl shadow-lg"
                style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)', boxShadow: '0 10px 25px -5px rgba(31,136,229,0.4)' }}
              >
                <FiPlus className="w-4 h-4" />
                Add Candidate
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══ Reject Page (inline, replaces pipeline) ═══
  if (showRejectModal) {
    return (
      <div style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <motion.button whileHover={{ x: -4 }} onClick={() => { setShowRejectModal(false); setRejectCandidateId(null); setRejectReason(''); setRejectCustomReason(''); }}
              className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
            >
              <FiArrowLeft className="w-5 h-5" /> Back to Candidate Pipeline
            </motion.button>
          </div>
          <div className={`rounded-2xl border-2 overflow-hidden ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}>
            <div className="p-6" style={{ background: 'linear-gradient(135deg, #ef4444, #e11d48)' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <FiXCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Reject Candidate</h2>
                  <p className="text-sm text-white/70 mt-0.5">Select a reason for rejection</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6 max-w-2xl">
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Reason for Rejection *</label>
                <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-red-500/50 focus:border-red-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                  <option value="">Select reason...</option>
                  {rejectionReasons.map(r => (<option key={r} value={r}>{r}</option>))}
                </select>
              </div>
              {rejectReason === 'Other' && (
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Custom Reason *</label>
                  <input type="text" value={rejectCustomReason} onChange={e => setRejectCustomReason(e.target.value)} placeholder="Enter custom reason..."
                    className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-red-500/50 focus:border-red-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200'}`} />
                </div>
              )}
            </div>
            <div className={`flex items-center justify-between p-6 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <button onClick={() => { setShowRejectModal(false); setRejectCandidateId(null); setRejectReason(''); setRejectCustomReason(''); }}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'}`}>
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} disabled={!rejectReason || (rejectReason === 'Other' && !rejectCustomReason)} onClick={handleReject}
                className="px-8 py-3 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none"
                style={{ background: 'linear-gradient(135deg, #ef4444, #e11d48)', boxShadow: '0 8px 15px -3px rgba(239, 68, 68, 0.3)' }}
              >
                Reject Candidate
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══ Approve Page (inline, replaces pipeline) ═══
  if (showApproveModal) {
    const c = candidates.find(c => c.id === approveCandidateId);
    return (
      <div style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <motion.button whileHover={{ x: -4 }} onClick={() => { setShowApproveModal(false); setApproveCandidateId(null); }}
              className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
            >
              <FiArrowLeft className="w-5 h-5" /> Back to Candidate Pipeline
            </motion.button>
          </div>
          <div className={`rounded-2xl border-2 overflow-hidden ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}>
            <div className="p-6" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <FiThumbsUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Approve & Schedule Interview</h2>
                  <p className="text-sm text-white/70 mt-0.5">{c ? `For ${c.name}` : 'Enter interview details'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Interview Round</label>
                  <select value={approveInterviewRound} onChange={e => setApproveInterviewRound(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                    <option value="Phone Screening">Phone Screening</option>
                    <option value="HR Round">HR Round</option>
                    <option value="Final Round">Final Round</option>
                  </select>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Interview Type</label>
                  <select value={approveInterviewType} onChange={e => setApproveInterviewType(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                    <option value="Video">Video Call</option>
                    <option value="Phone">Phone Call</option>
                    <option value="In-person">In-Person</option>
                  </select>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Date</label>
                  <input type="date" value={approveInterviewDate} onChange={e => setApproveInterviewDate(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Time</label>
                  <input type="time" value={approveInterviewTime} onChange={e => setApproveInterviewTime(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                </div>
                <div className="md:col-span-2 max-w-2xl">
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Interviewer Name</label>
                  <input type="text" value={approveInterviewer} onChange={e => setApproveInterviewer(e.target.value)} placeholder="Enter interviewer name..."
                    className={`w-full mt-1.5 px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200'}`} />
                </div>
              </div>
            </div>
            <div className={`flex items-center justify-between p-6 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <button onClick={() => { setShowApproveModal(false); setApproveCandidateId(null); }}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'}`}>
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApproveCandidate}
                className="flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                <FiCheckCircle className="w-4 h-4" /> Approve & Schedule
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)', boxShadow: '0 10px 15px -3px rgba(31,136,229,0.25)' }}>
              <FiUsers className="w-6 h-6" style={{ color: 'white' }} />
            </div>
            <div className="flex flex-col justify-center items-start">
              <h2 className="text-2xl font-bold leading-tight text-left" style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Candidate Pipeline
              </h2>
              <p className={`text-sm mt-0.5 text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Track and manage candidates through hiring stages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl overflow-hidden
                transition-all duration-200
                ${showAnalytics
                  ? 'text-white shadow-lg shadow-[#1E88E5]/40'
                  : isDarkMode
                    ? 'bg-slate-700 text-slate-300 hover:text-white border border-slate-600 hover:border-[#1E88E5]'
                    : 'bg-white text-slate-600 hover:text-[#1E88E5] border border-slate-200 hover:border-[#1E88E5] shadow-sm hover:shadow-md'
                }`}
              style={showAnalytics ? { background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)' } : {}}
            >
              {/* Animated glow ring on active */}
              {showAnalytics && (
                <motion.span
                  className="absolute inset-0 rounded-xl"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ background: 'linear-gradient(135deg, #3FA9F555, #1E88E555)' }}
                />
              )}

              {/* Icon with spin on toggle */}
              <motion.span
                animate={{ rotate: showAnalytics ? 180 : 0, scale: showAnalytics ? 1.2 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative z-10"
              >
                <FiBarChart2 className="w-3.5 h-3.5" />
              </motion.span>

              <span className="relative z-10 tracking-wide">Analytics</span>
            </motion.button>

            {/* From Resume Bank */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setShowResumeBankModal(true); setResumeBankResumes([]); setResumeBankRole(''); }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #3FA9F5, #0D47A1)', boxShadow: '0 4px 12px rgba(31,136,229,0.3)' }}>
              <FiDatabase className="w-3.5 h-3.5" /> Resume Bank
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={exportToCSV}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl overflow-hidden
                transition-all duration-200
                ${isDarkMode
                  ? 'bg-slate-700 text-slate-300 hover:text-white border border-slate-600 hover:border-emerald-500'
                  : 'bg-white text-slate-600 hover:text-emerald-600 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md'
                }`}
            >
              <motion.span
                whileHover={{ rotate: -20, scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative z-10"
              >
                <FiDownload className="w-3.5 h-3.5" />
              </motion.span>

              <span className="relative z-10 tracking-wide">Export CSV</span>
            </motion.button>
            {/* Upload CVs */}
            <motion.button
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowUploadModal(true)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl overflow-hidden
                transition-all duration-200
                ${isDarkMode
                  ? 'bg-slate-700 text-slate-300 hover:text-white border border-slate-600 hover:border-[#1E88E5]'
                  : 'bg-white text-slate-600 hover:text-[#1E88E5] border border-slate-200 hover:border-[#1E88E5] shadow-sm hover:shadow-md'
                }`}
            >
              <motion.span
                whileHover={{ y: -3, scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative z-10"
              >
                <FiUpload className="w-3.5 h-3.5" />
              </motion.span>

              <span className="relative z-10 tracking-wide">Upload CVs</span>
            </motion.button>
            {/* Add Candidate */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white rounded-xl"
              style={{ background: 'linear-gradient(90deg, #3FA9F5, #0D47A1)', boxShadow: '0 10px 15px -3px rgba(31,136,229,0.25)' }}>
              <FiPlus className="w-3.5 h-3.5" /> Add Candidate
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            const statColors = {
              'Total Candidates': '#1E88E5',
              'In Pipeline': '#3b82f6',
              'Offers Sent': '#f59e0b',
              'Joined': '#10b981',
            };
            const color = statColors[stat.label] || '#1E88E5';
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 1) }} whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative overflow-hidden"
                >
                  {/* Background blob */}
                  <motion.div
                    className="absolute -right-4 -top-4 w-24 h-24 opacity-10 rounded-full"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ backgroundColor: color }}
                  />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className={`text-xs font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {stat.label}
                      </p>
                      <motion.p
                        className="text-3xl font-extrabold mt-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        style={{ color: color }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>

                    {/* Icon box */}
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="p-3 rounded-xl"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 8px 20px -4px ${color}60`
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* ═══ Stage Conversion Analytics ═══ */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className={`rounded-2xl border-2 overflow-hidden ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)' }}><FiBarChart2 className="w-3.5 h-3.5 text-white" /></div>
                    Stage Conversion Funnel
                  </h3>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rejected: {candidates.filter(c => c.stage === 'Rejected').length}</span>
                </div>
                <div className="flex items-end gap-2 overflow-x-auto pb-2">
                  {getConversionStats().map((s, i) => {
                    const maxCount = Math.max(...getConversionStats().map(x => x.count), 1);
                    const barHeight = Math.max((s.count / maxCount) * 120, 8);
                    const config = stageConfig[s.stage] || stageConfig.Screening;
                    return (
                      <div key={s.stage} className="flex flex-col items-center min-w-[80px] flex-1">
                        <span className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{s.count}</span>
                        <motion.div initial={{ height: 0 }} animate={{ height: barHeight }} transition={{ delay: i * 0.08, duration: 0.5 }}
                          className="w-full rounded-t-lg" style={{ background: config.color, minHeight: 8 }} />
                        <div className={`text-[10px] font-medium text-center mt-2 leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.stage}</div>
                        {i < stageOrder.length - 1 && (
                          <div className={`text-[9px] mt-1 px-1.5 py-0.5 rounded-full font-bold ${s.rate > 50 ? 'bg-green-100 text-green-700' : s.rate > 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {s.rate}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Openings Positions */}
        {jobOpenings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className={`rounded-2xl border-2 p-5 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)' }}><FiTarget className="w-4 h-4 text-white" /></div>
                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Open Positions from Job Openings</h3>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${isDarkMode ? 'bg-[#1E88E5]/40 text-[#3FA9F5]' : 'bg-[#1E88E5]/10 text-[#1E88E5]'}`}>
                {jobOpenings.filter(j => j.filled < j.openings).length} Open
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobOpenings.map((job, idx) => {
                const isFilled = job.filled >= job.openings;
                const candidatesForJob = candidates.filter(c => c.jobTitle === job.title && c.client === job.client).length;
                const percent = Math.min((job.filled / job.openings) * 100, 100);

                // Status logic
                const isError = job.filled <= 1;
                const isWarning = job.filled >= 2 && job.filled <= 3;
                const isSuccess = job.filled >= 4;

                const statusConfig = isSuccess
                  ? { color: '#10b981', blobColor: '#10b981', barGradient: 'linear-gradient(90deg, #10b981, #059669)', badgeBg: 'bg-emerald-500 shadow-emerald-300', cardBg: isDarkMode ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200', icon: '✅', label: 'Filled', labelClass: 'text-emerald-500' }
                  : isWarning
                    ? { color: '#f59e0b', blobColor: '#f59e0b', barGradient: 'linear-gradient(90deg, #f59e0b, #d97706)', badgeBg: 'bg-amber-500 shadow-amber-300', cardBg: isDarkMode ? 'bg-amber-900/20 border-amber-700/30 hover:border-amber-500' : 'bg-amber-50/50 border-amber-200 hover:border-amber-400 hover:shadow-amber-100', icon: '⚠️', label: 'In Progress', labelClass: 'text-amber-500' }
                    : { color: '#ef4444', blobColor: '#ef4444', barGradient: 'linear-gradient(90deg, #ef4444, #dc2626)', badgeBg: 'bg-red-500 shadow-red-300', cardBg: isDarkMode ? 'bg-red-900/20 border-red-700/30 hover:border-red-500' : 'bg-red-50/50 border-red-200 hover:border-red-400 hover:shadow-red-100', icon: '🔴', label: 'Critical', labelClass: 'text-red-500' };

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.07 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`relative rounded-2xl p-4 border transition-all duration-200 cursor-pointer overflow-hidden hover:shadow-lg
                      ${statusConfig.cardBg}`}
                    onClick={() => {
                      if (!isFilled) {
                        setNewCandidate(prev => ({ ...prev, jobTitle: job.title, client: job.client }));
                        setShowAddModal(true);
                      }
                    }}
                  >
                    {/* Background glow blob */}
                    <motion.div
                      className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10 blur-xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ backgroundColor: statusConfig.blobColor }}
                    />

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-sm font-bold truncate leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {job.title}
                        </p>
                        <p className={`text-xs mt-0.5 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {job.client}
                        </p>
                      </div>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 text-white shadow-sm ${statusConfig.badgeBg}`}
                      >
                        {job.filled}/{job.openings}
                      </motion.span>
                    </div>

                    {/* Progress bar */}
                    <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isDarkMode ? 'bg-slate-600' : 'bg-slate-100'}`}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.07, ease: 'easeOut' }}
                        style={{ background: statusConfig.barGradient }}
                      />
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between mt-2.5">
                      <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {candidatesForJob} in pipeline
                      </span>

                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ x: isSuccess ? 0 : 2 }}
                        className={`text-[11px] font-bold flex items-center gap-1 ${statusConfig.labelClass}`}
                        onClick={e => { if (!isSuccess) { e.stopPropagation(); setNewCandidate(prev => ({ ...prev, jobTitle: job.title, client: job.client })); setShowAddModal(true); } }}
                      >
                        <span>{statusConfig.icon}</span>
                        {isSuccess ? 'Filled' : isWarning ? 'In Progress' : 'Critical'}
                      </motion.span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Pipeline Status Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-wrap sm:flex-nowrap">
          {[
            { key: 'all', label: 'All', count: stats.total, color: '#1E88E5', bg: 'blue', icon: FiUsers },
            { key: 'pending', label: 'Pending', count: stats.pending, color: '#f59e0b', bg: 'amber', icon: FiClock },
            { key: 'hold', label: 'On Hold', count: stats.onHold, color: '#6366f1', bg: 'indigo', icon: FiAlertCircle },
            { key: 'approved', label: 'Approved', count: stats.approved, color: '#10b981', bg: 'emerald', icon: FiCheckCircle },
            { key: 'rejected', label: 'Rejected', count: stats.rejected, color: '#ef4444', bg: 'red', icon: FiXCircle },
          ].map(({ key, label, count, color, icon: Icon }) => {
            const isActive = filterPipelineStatus === key;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterPipelineStatus(filterPipelineStatus === key ? 'all' : key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 overflow-hidden flex-shrink-0
                  ${isActive
                    ? 'text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-slate-700/60 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                  }`}
                style={isActive ? { backgroundColor: color, boxShadow: `0 8px 20px -4px ${color}60` } : {}}
              >
                {/* Active pulse glow */}
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-xl"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: `radial-gradient(circle at center, ${color}44, transparent 70%)` }}
                  />
                )}

                {/* Icon */}
                <motion.span
                  animate={{ rotate: isActive ? 360 : 0, scale: isActive ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative z-10"
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? 'white' : color }} />
                </motion.span>

                {/* Label */}
                <span className="relative z-10 hidden sm:inline">{label}</span>
                <span className="relative z-10 sm:hidden text-xs">{label}</span>

                {/* Count badge */}
                <motion.span
                  animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.4 }}
                  className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-extrabold
                    ${isActive
                      ? 'bg-white/25 text-white'
                      : isDarkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {count}
                </motion.span>
              </motion.button>
            );
          })}
        </div>

        {/* Stage Filter Pills */}
        {/* <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStage('all')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filterStage === 'all' ? 'bg-slate-800 text-white' : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
          >
            All Stages
          </button>
          {stageOrder.map(stage => {
            const config = stageConfig[stage] || stageConfig.Screening;
            const count = candidates.filter(c => c.stage === stage).length;
            return (
              <button
                key={stage}
                onClick={() => setFilterStage(filterStage === stage ? 'all' : stage)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${filterStage === stage ? 'text-white' : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                style={filterStage === stage ? { backgroundColor: config.color } : {}}
              >
                <config.icon className="w-3 h-3" />
                {stage} ({count})
              </button>
            );
          })}
        </div> */}

        {/* Search, Filter, Sort & Bulk */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, email, skills..."
                className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm transition-all focus:ring-2 focus:ring-[#1E88E5]/50 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`} />
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)}
                  className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 text-sm font-medium cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                  <option value="all">All Positions</option>
                  {uniqueJobs.map(job => (<option key={job} value={job}>{job}</option>))}
                </select>
                <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 text-sm font-medium cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                  <option value="date">Sort: Date</option>
                  <option value="name">Sort: Name</option>
                  <option value="rating">Sort: Rating</option>
                  <option value="experience">Sort: Experience</option>
                </select>
                <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                className={`p-3 rounded-xl border-2 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <span className="text-xs font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              </button>
              <button onClick={() => setShowAdvancedFilters(f => !f)}
                className={`flex items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-sm font-medium ${showAdvancedFilters ? 'border-[#1E88E5] text-[#1E88E5]' : isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'} transition-colors`}>
                <FiSliders className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className={`flex flex-wrap gap-3 p-4 rounded-xl border-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="relative">
                  <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
                    className={`appearance-none rounded-lg border px-3 py-2 pr-8 text-xs font-medium ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                    <option value="all">All Clients</option>
                    {uniqueClients.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div className="relative">
                  <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
                    className={`appearance-none rounded-lg border px-3 py-2 pr-8 text-xs font-medium ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                    <option value="all">All Sources</option>
                    <option value="Resume Bank">Resume Bank</option>
                    <option value="Manual">Manual</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <button onClick={() => { setFilterClient('all'); setFilterSource('all'); setFilterStage('all'); setFilterJob('all'); setSortBy('date'); setSortOrder('desc'); setSearchTerm(''); }}
                  className="text-xs text-[#1E88E5] font-semibold hover:underline">Clear all filters</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`flex items-center justify-between p-3 rounded-xl border-2 ${isDarkMode ? 'bg-[#1E88E5]/20 border-[#1E88E5]/50' : 'bg-[#1E88E5]/10 border-[#1E88E5]/30'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-[#3FA9F5]' : 'text-[#1E88E5]'}`}>{selectedIds.size} selected</span>
                  <button onClick={() => setSelectedIds(new Set())} className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} hover:underline`}>Clear</button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select onChange={(e) => { if (e.target.value) bulkMoveStage(e.target.value); e.target.value = ''; }}
                      className={`appearance-none rounded-lg border px-3 py-1.5 pr-8 text-xs font-medium ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                      <option value="">Move to stage...</option>
                      {stageOrder.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <button onClick={bulkReject}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-500 hover:bg-red-600 transition-colors">
                    <FiXCircle className="w-3 h-3" /> Reject All
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════ LIST VIEW ═══════════ */}
        {filteredCandidates.length === 0 ? (
          <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <FiUsers size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No candidates found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Select All row */}
            <div className={`flex items-center gap-3 px-5 py-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <label className="flex items-center gap-2 cursor-pointer" onClick={toggleSelectAll}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0 ? 'bg-[#1E88E5] border-[#1E88E5]' : isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                  {selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0 && <FiCheck className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs font-medium">Select all ({filteredCandidates.length})</span>
              </label>
            </div>

            <AnimatePresence>
              {filteredCandidates.map((candidate, idx) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`rounded-2xl border-2 p-5 transition-shadow cursor-pointer ${selectedIds.has(candidate.id) ? isDarkMode ? 'border-[#1E88E5] bg-[#1E88E5]/5' : 'border-[#1E88E5] bg-[#1E88E5]/10' : isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-blue-200'}`}
                  onClick={() => openDetail(candidate)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Checkbox */}
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <div onClick={(e) => { e.stopPropagation(); toggleSelectCandidate(candidate.id); }}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.has(candidate.id) ? 'bg-[#1E88E5] border-[#1E88E5]' : isDarkMode ? 'border-slate-600 hover:border-slate-500' : 'border-slate-300 hover:border-slate-400'}`}>
                          {selectedIds.has(candidate.id) && <FiCheck className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      {/* Avatar */}
                      {candidate.photo ? (
                        <div className="relative flex-shrink-0">
                          <img src={candidate.photo} alt={candidate.name}
                            className="h-14 w-14 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg hidden" style={{ background: getAvatarGradient(candidate.name) }}>{getInitials(candidate.name)}</div>
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0" style={{ background: getAvatarGradient(candidate.name) }}>{getInitials(candidate.name)}</div>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{candidate.name}</h3>
                          {getStageDuration(candidate) && (
                            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                              <FiClock className="w-2.5 h-2.5" /> {getStageDuration(candidate)}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.jobTitle} • {candidate.client}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiMail className="w-3.5 h-3.5" /> {candidate.email}</span>
                          <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiMapPin className="w-3.5 h-3.5" /> {candidate.location}</span>
                          <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FiBriefcase className="w-3.5 h-3.5" /> {candidate.experience}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(candidate.skills || []).slice(0, 5).map(skill => (
                            <span key={skill} className={`text-[10px] font-medium px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-100'}`}>{skill}</span>
                          ))}
                          {(candidate.skills || []).length > 5 && (
                            <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>+{candidate.skills.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Info */}
                    <div className="flex flex-col items-end gap-2.5 min-w-[150px]">
                      {/* Stage Badge & Status */}
                      <div className="flex flex-col items-end gap-1.5 w-full">
                        <StageBadge stage={candidate.stage} />

                        {/* Pipeline Status Badge */}
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm text-center inline-block w-full ${(candidate.pipelineStatus || 'pending') === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800' :
                          (candidate.pipelineStatus || 'pending') === 'hold' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800' :
                            (candidate.pipelineStatus || 'pending') === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800' :
                              'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800'
                          }`}>
                          {(candidate.pipelineStatus || 'pending') === 'approved' ? '✓ APPROVED' : (candidate.pipelineStatus || 'pending') === 'hold' ? '⏸ ON HOLD' : (candidate.pipelineStatus || 'pending') === 'rejected' ? '✗ REJECTED' : '● PENDING'}
                        </span>
                      </div>

                      {/* Expected CTC */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -1 }}
                        transition={{ duration: 0.2 }}
                        className="text-center mt-1 w-full bg-slate-50 dark:bg-slate-800/50 py-1.5 px-2 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm"
                      >
                        <p className={`text-[9px] uppercase tracking-widest font-extrabold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Expected CTC</p>
                        <p className="text-base font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{candidate.expectedCTC}</p>
                      </motion.div>

                      {/* Rejection reason */}
                      {candidate.stage === 'Rejected' && candidate.rejectionReason && (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg w-full text-center mt-1 border ${isDarkMode ? 'bg-red-900/20 text-red-400 border-red-800/50' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          Reason: {candidate.rejectionReason}
                        </span>
                      )}

                      {/* Pipeline Action Buttons: Hold / Approve / Reject */}
                      {(candidate.pipelineStatus || 'pending') !== 'approved' && (candidate.pipelineStatus || 'pending') !== 'rejected' && (
                        <div className="grid grid-cols-3 gap-1.5 mt-1.5 w-full">
                          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); holdCandidate(candidate.id); }}
                            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-extrabold transition-all shadow-sm ${(candidate.pipelineStatus || 'pending') === 'hold' ? 'bg-indigo-500 text-white shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' :
                              isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-indigo-900/40 hover:text-indigo-400 border border-slate-600 hover:border-indigo-700/50' :
                                'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200'
                              }`}
                          >
                            <FiPause className="w-4 h-4" /> Hold
                          </motion.button>

                          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); openApproveModal(candidate.id); }}
                            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-extrabold transition-all shadow-sm ${isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-emerald-900/40 hover:text-emerald-400 border border-slate-600 hover:border-emerald-700/50' :
                              'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200'
                              }`}
                          >
                            <FiThumbsUp className="w-4 h-4" /> Approve
                          </motion.button>

                          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); pipelineRejectCandidate(candidate.id); }}
                            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-extrabold transition-all shadow-sm ${isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-red-900/40 hover:text-red-400 border border-slate-600 hover:border-red-700/50' :
                              'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200'
                              }`}
                          >
                            <FiXCircle className="w-4 h-4" /> Reject
                          </motion.button>
                        </div>
                      )}

                      {/* Quick Contact WhatsApp */}
                      {candidate.phone && (
                        <div className="w-full mt-1.5">
                          <motion.a
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            href={`https://wa.me/${candidate.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-extrabold bg-[#25D366]/10 text-[#075E54] dark:bg-[#25D366]/20 dark:text-[#25D366] hover:bg-[#25D366] hover:text-white dark:hover:bg-[#25D366] dark:hover:text-white transition-all border border-[#25D366]/30 shadow-sm"
                          >
                            <FiPhone className="w-3.5 h-3.5" /> WhatsApp
                          </motion.a>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ═══ Click-away handler for stage menu ═══ */}
        {stageMenuId && <div className="fixed inset-0 z-40" onClick={() => setStageMenuId(null)} />}

        {/* Action Modals have been refactored into top-level horizontal pages */}

        {/* Upload CV Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between p-5" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5, #0D47A1)' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)' }}><FiUpload className="w-5 h-5 text-white" /></div>
                    <div><h3 className="text-lg font-bold text-white">Upload CVs/Resumes</h3><p className="text-xs text-white/70">Add resumes for candidates</p></div>
                  </div>
                  <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                  {jobOpenings.length > 0 && (
                    <div>
                      <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>For Position (optional)</label>
                      <select className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
                        <option value="">General Upload</option>
                        {jobOpenings.filter(j => j.filled < j.openings).map(job => (<option key={job.id} value={job.title}>{job.title} — {job.client}</option>))}
                      </select>
                    </div>
                  )}
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center ${isDarkMode ? 'border-slate-600 hover:border-[#1E88E5]' : 'border-slate-300 hover:border-[#1E88E5]'} transition-colors cursor-pointer`}>
                    <FiUpload className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                    <p className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Drag & drop files here</p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>or click to browse</p>
                    <p className={`text-xs mt-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>PDF, DOC, DOCX (Max 10MB each)</p>
                  </div>
                </div>
                <div className={`flex justify-end gap-3 p-5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <button onClick={() => setShowUploadModal(false)} className={`px-4 py-2 rounded-xl text-sm font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Cancel</button>
                  <button className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1] text-white rounded-xl shadow-lg">Upload</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default CandidatePipelineTab;