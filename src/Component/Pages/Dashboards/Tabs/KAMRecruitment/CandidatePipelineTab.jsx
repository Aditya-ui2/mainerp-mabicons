import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
  FiZap,
} from 'react-icons/fi';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { getResumeBankResumes, getResumeRoleTypes, getAllCandidates, addCandidate as addCandidateAPI, updateCandidateStatus, scheduleNewInterview, getAllRecruitmentPositions, uploadResumes, getSharePointCandidates, syncSharePointAll, getResumeDownloadUrl, BASE_URL } from '../../../service/api';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts';

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
  Screening: { color: '#64748b', icon: FiFileText, bgColor: 'bg-[#F8FAFF]', borderColor: 'border-blue-100', dotColor: 'bg-blue-400' },
  Interview: { color: '#3b82f6', icon: FiPhone, bgColor: 'bg-blue-50/50', borderColor: 'border-blue-200/50', dotColor: 'bg-blue-500' },
  Shortlisted: { color: '#f59e0b', icon: FiStar, bgColor: 'bg-amber-50/50', borderColor: 'border-amber-200/50', dotColor: 'bg-amber-500' },
  Offer: { color: '#ec4899', icon: FiMail, bgColor: 'bg-purple-50/50', borderColor: 'border-purple-200/50', dotColor: 'bg-purple-500' },
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

const CACHE_KEY_CANDIDATES = 'cache_kamCandidates';

const CandidatePipelineTab = ({ isDarkMode, setActiveTab, quickAction, onQuickActionHandled }) => {
  const getResumeDisplayName = (resume) => {
    if (resume?.candidateName) return resume.candidateName;
    if (resume?.fileName) return resume.fileName.replace(/\.[^.]+$/, '');
    return 'Unknown';
  };

  const [candidates, setCandidates] = useState([]);
  const [showSyncMenu, setShowSyncMenu] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [suggestedCandidates, setSuggestedCandidates] = useState([]);
  const [selectedSuggestedIds, setSelectedSuggestedIds] = useState(new Set());
  const [isDiscovering, setIsDiscovering] = useState(false);

  const fetchResumeBankMatches = async (jobTitle) => {
    try {
      setResumeBankLoading(true);

      // 1. FORCE FETCH EVERYTHING: Get full pool from all sources at once
      const [bankRes, spRes] = await Promise.all([
        getResumeBankResumes({ limit: 500 }).catch(() => ({ data: [] })), // Fetch a large chunk
        getSharePointCandidates().catch(() => ({ success: true, data: [] }))
      ]);

      // 2. Format Resiliently: Handle all possible response structures
      const rawBank = Array.isArray(bankRes) ? bankRes : (bankRes.data || bankRes.resumes || []);
      const rawSP = spRes.data || [];

      const fullPool = [
        ...rawBank.map(c => ({
          id: c.userId || c.id || c._id,
          name: c.candidateName || c.name || c.fileName?.replace(/\.[^.]+$/, '') || 'Candidate',
          email: c.email || '',
          phone: c.contactNo || c.phone || '',
          role: c.position || c.role || c.roleType || 'Resume Bank',
          skills: Array.isArray(c.skills) ? c.skills : (c.skills ? String(c.skills).split(',') : []),
          experience: c.experience || 'N/A',
          resumeId: c.id || c._id,
          resumeUrl: c.resumeUrl || c.webUrl || c.downloadUrl || c.cvUrl
        })),
        ...rawSP.map(c => ({
          id: c.sharePointId || c.id || c._id,
          name: c.candidateName || c.name || c.fileName?.replace(/\.[^.]+$/, '') || 'SP Resume',
          email: c.email || '',
          role: c.position || c.roleType || 'SharePoint',
          skills: ['SharePoint Sync'],
          resumeUrl: c.resumeUrl || c.webUrl || c.web_url || c.fileUrl || c.cvUrl,
          resumeId: c.id || c._id
        }))
      ].filter(c => c && (c.name !== 'Candidate' || c.email)); // Filter out junk

      if (fullPool.length === 0) {
        toast.error("Database is empty. Please sync SharePoint first.");
        setSuggestedCandidates([]);
        return;
      }

      // 3. Client-Side Smart Ranking (Fast & Reliable)
      const query = (jobTitle || '').toLowerCase();
      const terms = query.split(/\s+/).filter(t => t.length > 2);

      const rankedMatches = fullPool.map(c => {
        const text = `${c.name} ${c.role} ${c.skills.join(' ')}`.toLowerCase();
        let score = 0;
        if (text.includes(query)) score += 10; // Exact phrase match
        terms.forEach(t => { if (text.includes(t)) score += 2; }); // Keyword match
        return { ...c, score };
      })
        .sort((a, b) => b.score - a.score)
        .slice(0, 15); // Show top 15 results

      setSuggestedCandidates(rankedMatches);

      if (rankedMatches[0]?.score > 0) {
        toast.success(`Found ${rankedMatches.filter(m => m.score > 0).length} matches!`);
      } else {
        toast.info("Showing latest resumes from bank (no exact match found).");
      }
    } catch (error) {
      console.error("Critical Match Error:", error);
      toast.error("System sync error. Showing available data.");
    } finally {
      setResumeBankLoading(false);
    }
  };


  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [bulkUploadFiles, setBulkUploadFiles] = useState([]);
  const [bulkUploadPositionId, setBulkUploadPositionId] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedResumeProfileId, setSelectedResumeProfileId] = useState('');
  const [selectedResumeProfile, setSelectedResumeProfile] = useState(null);
  const [newCandidate, setNewCandidate] = useState({
    name: '', email: '', phone: '', location: '', jobTitle: '', client: '',
    experience: '', currentCTC: '', expectedCTC: '', noticePeriod: '30 days',
    skills: '', positionId: '', clientId: '', roleType: '', source: '', resumeId: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const fileInputRef = useRef(null);
  const bulkUploadInputRef = useRef(null);

  const [roleTypes, setRoleTypes] = useState([]);
  const [roleTypesLoading, setRoleTypesLoading] = useState(false);
  const [jobOpenings, setJobOpenings] = useState([
    { id: 'pos-101', title: 'Senior Software Engineer', clientName: 'TechSolutions Inc.' },
    { id: 'pos-102', title: 'Frontend Developer', clientName: 'Microsoft' },
    { id: 'pos-103', title: 'UI/UX Designer', clientName: 'Google' }
  ]);
  const [showResumeBankModal, setShowResumeBankModal] = useState(false);
  const [resumeBankResumes, setResumeBankResumes] = useState([]);
  const [resumeBankLoading, setResumeBankLoading] = useState(false);
  const [resumeBankRole, setResumeBankRole] = useState('');

  const [isKanbanView, setIsKanbanView] = useState(true);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);

  const handleDragEnd = async (event, info, candidate) => {
    const x = info.point.x;
    const windowWidth = window.innerWidth;
    const boardWidth = windowWidth - 280; // Account for sidebar
    const colWidth = boardWidth / 4;

    let newStage = candidate.stage;
    if (x < 280 + colWidth) newStage = stageOrder[0];
    else if (x < 280 + colWidth * 2) newStage = stageOrder[1];
    else if (x < 280 + colWidth * 3) newStage = stageOrder[2];
    else newStage = stageOrder[3];

    if (newStage !== candidate.stage) {
      const now = new Date().toISOString().split('T')[0];
      setCandidates(prev => prev.map(c =>
        String(c.id) === String(candidate.id)
          ? { ...c, stage: newStage, lastActivity: now, stageChangedAt: now }
          : c
      ));

      try {
        await updateCandidateStatus(candidate.id, { stage: newStage });
        toast.success(`Candidate moved to ${newStage}`);
      } catch (error) {
        console.error('Failed to update candidate status:', error);
      }
    }
  };

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [candidateNotes, setCandidateNotes] = useState({});
  const [newNote, setNewNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectCandidateId, setRejectCandidateId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCustomReason, setRejectCustomReason] = useState('');

  const [filterClient, setFilterClient] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [stageMenuId, setStageMenuId] = useState(null);
  const [filterPipelineStatus, setFilterPipelineStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveCandidateId, setApproveCandidateId] = useState(null);
  const [approveInterviewRound, setApproveInterviewRound] = useState('Phone Screening');
  const [approveInterviewType, setApproveInterviewType] = useState('Video');
  const [approveInterviewDate, setApproveInterviewDate] = useState('');
  const [approveInterviewTime, setApproveInterviewTime] = useState('');
  const [approveInterviewDuration, setApproveInterviewDuration] = useState('60 mins');
  const [approveInterviewer, setApproveInterviewer] = useState('');
  const [approveInterviewerRole, setApproveInterviewerRole] = useState('');
  const [approveMeetLink, setApproveMeetLink] = useState('');

  const generateMeetLink = () => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const makeChunk = (size) => Array.from({ length: size }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    return `https://meet.google.com/${makeChunk(3)}-${makeChunk(4)}-${makeChunk(3)}`;
  };

  useEffect(() => {
    if (quickAction === 'add-candidate') { setShowAddModal(true); onQuickActionHandled?.(); }
  }, [quickAction, onQuickActionHandled]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await getAllRecruitmentPositions();
        if (response.success && Array.isArray(response.data)) {
          const positions = response.data.map(p => ({
            id: p.id, title: p.title, client: p.clientName || 'Unknown Client',
            clientId: p.clientId, openings: p.openings || 1, filled: p.filled || 0, roleType: p.roleType
          }));
          setJobOpenings(positions);
          localStorage.setItem('kamJobOpenings', JSON.stringify(positions));
        }
      } catch (err) {
        console.error('Failed to fetch recruitment positions:', err);
        const storedJobs = localStorage.getItem('kamJobOpenings');
        if (storedJobs) setJobOpenings(JSON.parse(storedJobs));
      }
    };
    fetchPositions();

    const handleStorage = (e) => {
      if (e.key === 'kamJobOpenings' && e.newValue) {
        try { setJobOpenings(JSON.parse(e.newValue)); } catch (err) { console.error('Failed to parse job openings update'); }
      }
      if (e.key === 'kamSelectedResumes' && e.newValue) {
        try {
          // Removed staleness-prone localStorage auto-load for kamSelectedResumes
          // Candidates should be fetched from the database to ensure data integrity.
        } catch (err) { console.error('Failed to process selected resumes update'); }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      setRoleTypesLoading(true);
      try {
        const response = await getResumeRoleTypes();
        const rolesData = response.data || response.roles || [];
        setRoleTypes(rolesData.map(r => ({ role: r.role || r.name || r.roleType || '', count: r.count || 0 })));
      } catch (err) { console.error('Failed to fetch role types:', err); }
      finally { setRoleTypesLoading(false); }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (showAddModal && newCandidate.roleType) {
      const searchTermVal = newCandidate.roleType.split(' (')[0];
      fetchResumeBankMatches(searchTermVal);
    }
  }, [showAddModal, newCandidate.roleType]);


  const fetchCandidates = useCallback(async () => {
    try {
      setRefreshing(true);
      const filters = {};
      if (filterStage !== 'all') filters.stage = filterStage;
      if (filterPipelineStatus !== 'all') filters.pipelineStatus = filterPipelineStatus;
      if (searchTerm) filters.search = searchTerm;

      const [erpRes, spRes] = await Promise.all([
        getAllCandidates(filters),
        getSharePointCandidates(filters).catch(e => ({ success: false, data: [] }))
      ]);

      let erpMapped = [];
      if (erpRes?.success && erpRes.data) {
        erpMapped = erpRes.data.map(c => ({
          id: c.id || c._id, name: c.name, email: c.email, phone: c.phone || '', location: c.location || '',
          jobTitle: c.position?.title || '', client: c.client?.companyName || c.client?.name || '',
          stage: c.stage === 'Applied' ? 'Screening' : (c.stage || 'Screening'), rating: c.rating || 0, experience: c.experience || '',
          currentCTC: c.currentSalary || '', expectedCTC: c.expectedSalary || '', noticePeriod: c.noticePeriod || '30 days',
          skills: c.skills || [], appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
          lastActivity: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '',
          photo: null, pipelineStatus: c.pipelineStatus || 'pending', rejectionReason: c.rejectionReason || '',
          source: c.source || 'ERP', positionId: c.position?.id || c.position?._id, clientId: c.client?.id || c.client?._id,
          shortDescription: c.shortDescription || '',
          requirements: c.requirements || [],
          responsibilities: c.responsibilities || [],
          isSharePoint: false,
          resumeUrl: c.cvUrl || c.resumeUrl || c.webUrl || '',
          resumeId: c.id || c._id
        }));
      }

      let spMapped = [];
      if (spRes?.success && spRes.data) {
        spMapped = spRes.data.map(c => ({
          id: `sp-${c.id}`,
          sharePointId: c.id,
          name: c.candidateName || 'Unknown',
          email: c.email || '',
          phone: c.phone || '',
          location: c.location || '',
          jobTitle: c.jobTitle || '',
          client: c.clientName || 'SharePoint',
          stage: c.stage || 'Screening',
          rating: 0,
          experience: c.experience || '',
          appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
          lastActivity: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '',
          source: 'SharePoint',
          isSharePoint: true,
          pipelineStatus: 'pending',
          skills: [],
          resumeUrl: c.resumeUrl || c.webUrl || c.fileUrl || '',
          resumeId: c.id || c._id
        }));
      }

      const combined = [...erpMapped, ...spMapped];
      setCandidates(combined);
      setTotalCandidates(combined.length);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    }
    finally { setRefreshing(false); }
  }, [filterStage, filterPipelineStatus, searchTerm]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const stageOrder = ['Screening', 'Interview', 'Shortlisted', 'Offer'];
  const fullStageOrder = ['Screening', 'Phone Interview', 'Interview', 'Technical Round', 'HR Round', 'Shortlisted', 'Offer Sent', 'Offer', 'Joined'];

  const stats = {
    total: candidates.length,
    inPipeline: candidates.filter(c => !['Joined', 'Rejected'].includes(c.stage)).length,
    offersSent: candidates.filter(c => c.stage === 'Offer Sent').length,
    joined: candidates.filter(c => c.stage === 'Joined').length,
  };

  const statCards = [
    { label: 'Total Candidates', value: stats.total, icon: FiUsers },
    { label: 'In Pipeline', value: stats.inPipeline, icon: FiClock },
    { label: 'Offers Sent', value: stats.offersSent, icon: FiMail },
    { label: 'Joined', value: stats.joined, icon: FiCheckCircle },
  ];

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.skills && c.skills.some(skill => (skill || '').toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStage = filterStage === 'all' || c.stage === filterStage;
    const matchesPipelineStatus = filterPipelineStatus === 'all' || (c.pipelineStatus || 'pending') === filterPipelineStatus;

    const matchesJob = filterJob === 'all' ||
      String(c.positionId) === String(filterJob) ||
      (c.jobTitle || '').toLowerCase() === filterJob.toLowerCase();

    const matchesClient = filterClient === 'all' ||
      (c.client || '').toLowerCase().trim() === filterClient.toLowerCase().trim();

    return matchesSearch && matchesStage && matchesPipelineStatus && matchesJob && matchesClient;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') cmp = (a.name || '').localeCompare(b.name || '');
    else if (sortBy === 'rating') cmp = (b.rating || 0) - (a.rating || 0);
    else cmp = new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0);
    return sortOrder === 'asc' ? -cmp : cmp;
  });

  const getAvatarGradient = (name) => {
    const colors = ['#64748b', '#3b82f6', '#1e293b', '#334155', '#475569'];
    return colors[(name || '').charCodeAt(0) % colors.length];
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const rejectionReasons = ['Not enough experience', 'Skills mismatch', 'CTC expectation too high', 'Failed technical round', 'Failed HR round', 'Client rejected', 'Candidate withdrew', 'No-show for interview', 'Better candidate selected', 'Position closed', 'Other'];

  const moveToStage = (candidateId, stage) => {
    const now = new Date().toISOString().split('T')[0];
    updateCandidateStatus(candidateId, { stage }).catch(err => console.error('Failed to update stage:', err));
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage, lastActivity: now, stageChangedAt: now } : c));
    setStageMenuId(null);
  };

  const handleReject = () => {
    const reason = rejectReason === 'Other' ? rejectCustomReason : rejectReason;
    if (!reason) return;
    const now = new Date().toISOString().split('T')[0];
    updateCandidateStatus(rejectCandidateId, { stage: 'Rejected', pipelineStatus: 'rejected', rejectionReason: reason }).catch(err => console.error('Failed to reject:', err));
    setCandidates(prev => prev.map(c => c.id === rejectCandidateId ? { ...c, stage: 'Rejected', pipelineStatus: 'rejected', rejectionReason: reason, lastActivity: now, stageChangedAt: now } : c));
    setShowRejectModal(false); setRejectCandidateId(null); setRejectReason(''); setRejectCustomReason('');
  };

  const openRejectModal = (candidateId) => { setRejectCandidateId(candidateId); setShowRejectModal(true); setStageMenuId(null); };
  const toggleSelectCandidate = (id) => { setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; }); };
  const bulkReject = () => {
    const now = new Date().toISOString().split('T')[0];
    selectedIds.forEach(id => updateCandidateStatus(id, { stage: 'Rejected', pipelineStatus: 'rejected', rejectionReason: 'Bulk rejected' }).catch(err => console.error('Bulk reject failed:', err)));
    setCandidates(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, stage: 'Rejected', pipelineStatus: 'rejected', rejectionReason: 'Bulk rejected', lastActivity: now, stageChangedAt: now } : c));
    setSelectedIds(new Set());
  };

  const addNote = (candidateId) => {
    if (!newNote.trim()) return;
    setCandidateNotes(prev => ({ ...prev, [candidateId]: [...(prev[candidateId] || []), { text: newNote, date: new Date().toISOString(), author: 'You' }] }));
    setNewNote('');
  };

  const getStageDuration = (candidate) => {
    const changedAt = candidate.stageChangedAt || candidate.appliedDate;
    if (!changedAt) return '';
    const days = Math.floor((new Date() - new Date(changedAt)) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : (days === 1 ? '1 day' : `${days} days`);
  };

  const openDetail = (candidate) => { setDrawerCandidate(candidate); setStageMenuId(null); };
  const [drawerCandidate, setDrawerCandidate] = useState(null);
  const holdCandidate = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    const newStatus = (candidate?.pipelineStatus || 'pending') === 'hold' ? 'pending' : 'hold';
    updateCandidateStatus(candidateId, { pipelineStatus: newStatus }).catch(err => console.error('Failed to toggle hold:', err));
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, pipelineStatus: newStatus, lastActivity: new Date().toISOString().split('T')[0] } : c));
    setStageMenuId(null);
  };

  const handleViewCV = async (candidate) => {
    if (!candidate) return;
    
    // 1. Direct URL priority - handles both absolute and relative paths
    if (candidate.resumeUrl) {
      let url = candidate.resumeUrl;
      if (typeof url === 'string' && url.trim() !== '') {
        if (!url.startsWith('http') && !url.startsWith('https')) {
          url = `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        
        // Append auth token for the /view endpoint if needed
        if (url.includes('/api/resumebank/') && (url.includes('/view') || url.includes('/download'))) {
          const token = localStorage.getItem('token');
          if (token) {
            const sanitizedToken = token.replace(/^"|"$/g, '').trim();
            url += `${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(sanitizedToken)}`;
          }
        }

        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    // 2. API Fallback - uses resumeId to fetch a secure signed URL
    if (candidate.resumeId || candidate.id) {
      const targetId = candidate.resumeId || candidate.id;
      const toastId = toast.loading("Fetching secure CV link...");
      try {
        const res = await getResumeDownloadUrl(targetId);
        if (res && res.downloadUrl) {
          let url = res.downloadUrl;
          if (!url.startsWith('http') && !url.startsWith('https')) {
            url = `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
          }

          // Append auth token for the /view endpoint if needed
          if (url.includes('/api/resumebank/') && (url.includes('/view') || url.includes('/download'))) {
            const token = localStorage.getItem('token');
            if (token) {
              const sanitizedToken = token.replace(/^"|"$/g, '').trim();
              url += `${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(sanitizedToken)}`;
            }
          }

          window.open(url, '_blank', 'noopener,noreferrer');
          toast.success("CV Opened", { id: toastId });
        } else {
          toast.error("No CV link found in database", { id: toastId });
        }
      } catch (err) {
        console.error("CV Fetch Error:", err);
        toast.error("Resume server unavailable", { id: toastId });
      }
    } else {
      toast.error("No resume profile linked to this candidate");
    }
  };

  const openApproveModal = (candidateId) => {
    setApproveCandidateId(candidateId);
    setApproveInterviewRound('Phone Screening'); setApproveInterviewType('Video'); setApproveInterviewDate(''); setApproveInterviewTime(''); setApproveInterviewDuration('60 mins'); setApproveInterviewer(''); setApproveInterviewerRole(''); setApproveMeetLink('');
    setShowApproveModal(true); setStageMenuId(null);
  };

  const handleApproveCandidate = async () => {
    const candidate = candidates.find(c => c.id === approveCandidateId);
    if (!candidate) return;
    try {
      const now = new Date().toISOString().split('T')[0];
      const interviewDate = approveInterviewDate || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
      const startTime = approveInterviewTime || '10:00 AM';
      const apiResponse = await scheduleNewInterview({
        candidateId: approveCandidateId, positionId: candidate.positionId, clientId: candidate.clientId,
        candidateName: candidate.name, candidateEmail: candidate.email, positionTitle: candidate.jobTitle,
        clientName: candidate.client, interviewType: approveInterviewRound, interviewDate: interviewDate,
        startTime: startTime, duration: parseInt(approveInterviewDuration, 10) || 60, meetingType: approveInterviewType,
        interviewerName: approveInterviewer || 'Hiring Team', interviewerRole: approveInterviewerRole || 'Interviewer',
        notes: 'Approved from Candidate Pipeline'
      });
      await updateCandidateStatus(approveCandidateId, { pipelineStatus: 'approved' });
      setCandidates(prev => prev.map(c => c.id === approveCandidateId ? { ...c, pipelineStatus: 'approved', lastActivity: now } : c));
      const interviewEntry = {
        id: apiResponse.data?.id || Date.now(), candidateName: candidate.name, candidateEmail: candidate.email,
        position: candidate.jobTitle, client: candidate.client, round: approveInterviewRound, type: approveInterviewType,
        date: interviewDate, time: startTime, duration: approveInterviewDuration, interviewer: approveInterviewer || 'Hiring Team',
        interviewerRole: approveInterviewerRole || 'Interviewer', status: 'Scheduled',
        meetLink: apiResponse.data?.meetingLink || (approveInterviewType === 'Video' ? approveMeetLink || generateMeetLink() : null),
      };
      const existing = JSON.parse(localStorage.getItem('kamApprovedInterviews') || '[]');
      existing.push(interviewEntry);
      localStorage.setItem('kamApprovedInterviews', JSON.stringify(existing));
      window.dispatchEvent(new StorageEvent('storage', { key: 'kamApprovedInterviews', newValue: JSON.stringify(existing) }));
      setShowApproveModal(false); setApproveCandidateId(null);
    } catch (error) { console.error('Failed to complete approval process:', error); }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setResumeFile(null);
    setSelectedSuggestedIds(new Set());
    setSuggestedCandidates([]);
    setNewCandidate({
      name: '', email: '', phone: '', location: '', jobTitle: '', client: '',
      experience: '', currentCTC: '', expectedCTC: '', noticePeriod: '30 days',
      skills: '', positionId: '', clientId: '', roleType: '', source: '', resumeId: ''
    });
  };

  const handleAddCandidate = async (stayOpen = false) => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.jobTitle) { alert('Please fill required fields (Name, Email, Job Title)'); return; }
    const skillsArr = (newCandidate.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    // FOR UI FIX/TESTING: Add locally immediately
    try {
      const mapped = {
        id: Date.now().toString(),
        name: newCandidate.name,
        email: newCandidate.email,
        phone: newCandidate.phone || '',
        location: newCandidate.location || '',
        jobTitle: jobOpenings.find(p => p.id === newCandidate.positionId)?.title || newCandidate.jobTitle || 'Candidate',
        client: jobOpenings.find(p => p.id === newCandidate.positionId)?.clientName || newCandidate.client || '',
        stage: 'Screening',
        rating: 0,
        experience: newCandidate.experience || '',
        currentCTC: newCandidate.currentCTC || '',
        expectedCTC: newCandidate.expectedCTC || '',
        noticePeriod: newCandidate.noticePeriod || '30 days',
        skills: skillsArr,
        appliedDate: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        photo: null,
        pipelineStatus: 'pending',
      };
      setCandidates(prev => [mapped, ...prev]);

      const formData = new FormData();
      formData.append('name', newCandidate.name); formData.append('email', newCandidate.email);
      formData.append('phone', newCandidate.phone); formData.append('location', newCandidate.location);
      formData.append('skills', skillsArr.join(', ')); formData.append('experience', newCandidate.experience);
      formData.append('currentSalary', newCandidate.currentCTC); formData.append('expectedSalary', newCandidate.expectedCTC);
      formData.append('noticePeriod', newCandidate.noticePeriod); formData.append('stage', 'Screening');
      formData.append('pipelineStatus', 'pending');
      if (newCandidate.positionId) formData.append('positionId', newCandidate.positionId);
      if (newCandidate.clientId) formData.append('clientId', newCandidate.clientId);
      if (resumeFile) formData.append('resume', resumeFile);

      const res = await addCandidateAPI(formData);
      if (res?.success && res.data) {
        setCandidates(prev => prev.map(c => c.id === mapped.id ? { ...c, id: res.data.id || res.data._id } : c));
      }
      toast.success(`Candidate ${newCandidate.name} added successfully!`);
    } catch (err) {
      console.warn('API Offline - Running in Local Mode');
      toast.success(`Candidate ${newCandidate.name} added (Local Mode)`);
    }

    if (stayOpen) {
      setResumeFile(null);
      setNewCandidate({
        ...newCandidate,
        name: '', email: '', phone: '', location: '',
        experience: '', currentCTC: '', expectedCTC: '',
        skills: '', resumeId: ''
      });
    } else {
      closeAddModal();
    }
  };
  
  const handleBulkAdd = async () => {
    const selectedItems = suggestedCandidates.filter(c => selectedSuggestedIds.has(c.id));
    if (selectedItems.length === 0) return;
    
    toast.info(`Adding ${selectedItems.length} candidates...`);
    
    for (const c of selectedItems) {
      const formData = new FormData();
      formData.append('name', c.name);
      formData.append('email', c.email || '');
      formData.append('phone', c.phone || '');
      formData.append('location', c.location || '');
      formData.append('skills', Array.isArray(c.skills) ? c.skills.join(', ') : (c.skills || ''));
      formData.append('experience', c.experience || '');
      formData.append('stage', 'Screening');
      formData.append('pipelineStatus', 'pending');
      if (newCandidate.positionId) formData.append('positionId', newCandidate.positionId);
      if (newCandidate.clientId) formData.append('clientId', newCandidate.clientId);
      
      try {
        await addCandidateAPI(formData);
      } catch (err) {
        console.error("Bulk add failed for", c.name);
      }
    }
    
    toast.success(`Successfully added ${selectedItems.length} candidates`);
    closeAddModal();
    fetchCandidates();
  };

  const resetBulkUploadModal = () => { setBulkUploadFiles([]); setBulkUploadPositionId(''); setBulkUploading(false); };
  const handleBulkFilesSelected = (fileList) => setBulkUploadFiles(Array.from(fileList || []).filter(Boolean));
  const handleBulkResumeUpload = async () => {
    if (bulkUploadFiles.length === 0) { alert('Please select resumes.'); return; }
    setBulkUploading(true);
    try {
      const selectedJob = jobOpenings.find(job => job.id === bulkUploadPositionId);
      const formData = new FormData();
      bulkUploadFiles.forEach(file => formData.append('resume', file));
      if (bulkUploadPositionId) formData.append('positionId', bulkUploadPositionId);
      if (selectedJob?.clientId) formData.append('clientId', selectedJob.clientId);
      const res = await uploadResumes(formData);
      if (res?.success && Array.isArray(res.data)) {
        const uploaded = res.data.map(c => ({
          id: c.id || c._id, name: c.name, email: c.email || '', phone: c.phone || '', location: c.location || '',
          jobTitle: selectedJob?.title || '', client: selectedJob?.client || '', stage: c.stage || 'Screening',
          rating: c.rating || 0, experience: c.experience || '', currentCTC: c.currentSalary || '',
          expectedCTC: c.expectedSalary || '', noticePeriod: c.noticePeriod || '', skills: c.skills || [],
          appliedDate: new Date().toISOString().split('T')[0], lastActivity: new Date().toISOString().split('T')[0],
          photo: null, pipelineStatus: c.pipelineStatus || 'pending',
        }));
        setCandidates(prev => [...uploaded, ...prev]); setShowUploadModal(false); resetBulkUploadModal();
      } else alert(res?.message || 'Upload failed');
    } catch (error) { console.error('Bulk upload failed:', error); }
    finally { setBulkUploading(false); }
  };

  if (loading) return <div>Loading...</div>;

  if (showDetailSidebar && selectedCandidateDetail) {
    return (
      <div style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }} className="-mt-12">
        <motion.button onClick={() => { setShowDetailSidebar(false); setSelectedCandidateDetail(null); }} className="flex items-center gap-2 mb-6 text-sm font-bold text-blue-600">
          <FiArrowLeft /> Back to Pipeline
        </motion.button>
        <div className="bg-white rounded-[32px] p-10 shadow-xl border border-[#F4F3EF]">
          <div className="flex items-center gap-8 mb-10">
            <div className="w-24 h-24 rounded-[32px] text-white flex items-center justify-center text-3xl font-black shadow-lg" style={{ background: getAvatarGradient(selectedCandidateDetail.name) }}>
              {getInitials(selectedCandidateDetail.name)}
            </div>
            <div>
              <h2 className="text-4xl font-black text-[#1A1A2E] font-syne uppercase">{selectedCandidateDetail.name}</h2>
              <p className="text-lg font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">{selectedCandidateDetail.jobTitle} • {selectedCandidateDetail.client}</p>
              <div className="flex gap-4 mt-4">
                <StageBadge stage={selectedCandidateDetail.stage} />
                <RatingStars rating={selectedCandidateDetail.rating || 0} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8 text-left">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9B9BAD] mb-4">Contact Info</h3>
                <div className="space-y-3">
                  <p className="text-sm font-bold flex items-center gap-3"><FiMail className="text-blue-500" /> {selectedCandidateDetail.email}</p>
                  <p className="text-sm font-bold flex items-center gap-3"><FiPhone className="text-emerald-500" /> {selectedCandidateDetail.phone || 'N/A'}</p>
                  <p className="text-sm font-bold flex items-center gap-3"><FiMapPin className="text-rose-500" /> {selectedCandidateDetail.location || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9B9BAD] mb-4">Short Description</h3>
                <p className="text-sm font-medium text-[#4B4B5E] leading-relaxed">{selectedCandidateDetail.shortDescription || 'No description provided.'}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9B9BAD] mb-4">Requirements</h3>
                <div className="space-y-2">
                  {(selectedCandidateDetail.requirements || []).length > 0 ? (selectedCandidateDetail.requirements.map((r, i) => <p key={i} className="text-sm font-bold flex items-center gap-3"><FiCheck className="text-emerald-500" /> {r}</p>)) : <p className="text-xs text-slate-400">None listed</p>}
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9B9BAD] mb-4">Responsibilities</h3>
                <div className="space-y-2">
                  {(selectedCandidateDetail.responsibilities || []).length > 0 ? (selectedCandidateDetail.responsibilities.map((r, i) => <p key={i} className="text-sm font-bold flex items-center gap-3"><FiArrowRight className="text-blue-500" /> {r}</p>)) : <p className="text-xs text-slate-400">None listed</p>}
                </div>
              </div>
            </div>
            <div className="bg-[#F8FAFF] rounded-[32px] p-8 border border-blue-50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1B4DA0] mb-6">Financials & Timeline</h3>
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-[10px] uppercase font-black text-[#9B9BAD] mb-1">Expected CTC</p><p className="text-2xl font-black text-[#1A1A2E]">{selectedCandidateDetail.expectedCTC}</p></div>
                <div><p className="text-[10px] uppercase font-black text-[#9B9BAD] mb-1">Notice Period</p><p className="text-2xl font-black text-[#1A1A2E]">{selectedCandidateDetail.noticePeriod}</p></div>
                <div><p className="text-[10px] uppercase font-black text-[#9B9BAD] mb-1">Experience</p><p className="text-2xl font-black text-[#1A1A2E]">{selectedCandidateDetail.experience}</p></div>
                <div><p className="text-[10px] uppercase font-black text-[#9B9BAD] mb-1">Applied On</p><p className="text-lg font-black text-[#1A1A2E]">{selectedCandidateDetail.appliedDate}</p></div>
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={() => holdCandidate(selectedCandidateDetail.id)} className="flex-1 py-4 bg-amber-500 text-white font-bold rounded-2xl shadow-lg">Edit</button>
                <button onClick={() => { setShowDetailSidebar(false); setSelectedCandidateDetail(null); }} className="flex-1 py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
        style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}
      >
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 flex-wrap gap-4">
          <div className="flex flex-col items-start text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne tracking-tight">Candidate Pipeline</h1>
            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mt-2">{stats.total} Total Candidates In Pipeline</p>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            {/* View toggle — matching standardized format */}
            <div className="bg-[#F4F3EF] rounded-2xl p-1.5 flex gap-1.5 border border-[#F4F3EF] shadow-sm">
              <button
                onClick={() => setIsKanbanView(true)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${isKanbanView ? 'bg-white text-[#1B4DA0] shadow-md' : 'text-[#9B9BAD] hover:text-[#1B4DA0]'}`}
              >
                <LayoutGrid size={16} className={isKanbanView ? 'text-[#1B4DA0]' : 'text-[#9B9BAD]'} /> Kanban
              </button>
              <button
                onClick={() => setIsKanbanView(false)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${!isKanbanView ? 'bg-white text-[#1B4DA0] shadow-md' : 'text-[#9B9BAD] hover:text-[#1B4DA0]'}`}
              >
                <List size={16} className={!isKanbanView ? 'text-[#1B4DA0]' : 'text-[#9B9BAD]'} /> List
              </button>
            </div>

            <button
              onClick={async () => {
                try {
                  setRefreshing(true);
                  await syncSharePointAll();
                  await fetchCandidates();
                } catch (e) { console.error('Sync failed', e); }
                finally { setRefreshing(false); }
              }}
              className="group flex items-center gap-2.5 px-7 py-4 bg-white text-[#1B4DA0] border border-[#F4F3EF] rounded-2xl text-[13px] font-bold hover:bg-[#F8FAFF] hover:border-blue-100 transition-all duration-300 shadow-sm active:scale-95"
              disabled={refreshing}
            >
              <FiDatabase size={18} className={`text-[#1B4DA0] transition-transform group-hover:scale-110 ${refreshing ? 'animate-spin' : ''}`} />
              Sync Data
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2.5 px-8 py-4 bg-[#1B4DA0] text-white rounded-2xl text-[14px] font-bold hover:bg-[#153e82] transition-all duration-300 shadow-[0_10px_25px_rgba(27,77,160,0.25)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.35)] active:scale-95"
            >
              <Plus size={20} strokeWidth={3} /> Add Candidate
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Candidates', value: stats.total, icon: FiUsers, color: 'from-blue-500 to-blue-600', lightColor: 'bg-blue-50' },
            { label: 'In Pipeline', value: stats.inPipeline, icon: FiClock, color: 'from-amber-500 to-amber-600', lightColor: 'bg-amber-50' },
            { label: 'Offers Sent', value: stats.offersSent, icon: FiMail, color: 'from-purple-500 to-purple-600', lightColor: 'bg-purple-50' },
            { label: 'Joined', value: stats.joined, icon: FiCheckCircle, color: 'from-emerald-500 to-emerald-600', lightColor: 'bg-emerald-50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-[32px] p-6 border border-[#F4F3EF] shadow-sm relative overflow-hidden group transition-all"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-[0.03] rounded-bl-[100%] group-hover:opacity-[0.06] transition-opacity ${stat.color}`} />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-black text-[#1A1A2E] font-syne">{stat.value}</h3>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">+12%</span>
                    <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider">vs last week</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg transform group-hover:rotate-6 transition-transform`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ultra-Premium Standardized Search & Filter Bar */}
        <div className="bg-white border border-[#F4F3EF] rounded-[40px] p-2 shadow-sm mb-10 flex items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-[3] group">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
            <input
              type="text"
              placeholder="Search by name, role, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F4F3EF] border-none rounded-full py-4 pl-16 pr-6 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/5 outline-none transition-all placeholder:text-[#9B9BAD] placeholder:font-bold"
            />
          </div>

          {/* Date Filter (Mocked for UI Parity) */}
          <div className="relative flex-1 group">
            <select
              className="w-full bg-[#F4F3EF] text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-full pl-6 pr-12 py-4 outline-none border-0 cursor-pointer appearance-none hover:bg-[#EEF2FB] transition-all"
            >
              <option value="all">All Date</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
          </div>

          {/* Opening Filter */}
          <div className="relative flex-[1.5] group">
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="w-full bg-[#F4F3EF] text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-full pl-6 pr-12 py-4 outline-none border-0 cursor-pointer appearance-none hover:bg-[#EEF2FB] transition-all"
            >
              <option value="all">All Openings</option>
              {jobOpenings.map(job => (
                <option key={job.id} value={job.id}>{job.title.toUpperCase()}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
          </div>

          {/* Client Filter */}
          <div className="relative flex-1 group">
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full bg-[#F4F3EF] text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-full pl-6 pr-12 py-4 outline-none border-0 cursor-pointer appearance-none hover:bg-[#EEF2FB] transition-all"
            >
              <option value="all">All Clients</option>
              {[...new Set(jobOpenings.map(j => j.client).filter(Boolean))].map(client => (
                <option key={client} value={client}>{client.toUpperCase()}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
          </div>
        </div>

        {isKanbanView ? (
          <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar items-start" style={{ minHeight: '600px' }}>
            {stageOrder.map(stage => {
              const stageCandidates = filteredCandidates.filter(c => {
                if (stage === 'Interview') return ['Phone Interview', 'Technical Round', 'HR Round', 'Client Interview', 'Interview'].includes(c.stage);
                if (stage === 'Screening') return c.stage === 'Screening' || c.stage === 'Applied' || !c.stage;
                if (stage === 'Offer') return c.stage === 'Offer Sent' || c.stage === 'Offer';
                return c.stage === stage;
              });
              const config = stageConfig[stage] || stageConfig.Screening;
              return (
                <div
                  key={stage}
                  className="flex-shrink-0 w-[320px] rounded-[32px] bg-[#F8FAFF]/40 border border-[#F4F3EF] transition-all duration-300"
                >
                  <div className="px-7 py-6 flex items-center justify-between border-b border-[#F4F3EF]/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${config.dotColor}`} />
                      <h3 className="text-[13px] font-black text-[#1A1A2E] tracking-tight uppercase font-syne">{stage}</h3>
                    </div>
                    <div className="min-w-[24px] h-[24px] flex items-center justify-center bg-white rounded-lg text-[10px] font-black text-[#1B4DA0] shadow-sm border border-[#F4F3EF]">
                      {stageCandidates.length}
                    </div>
                  </div>
                  <div className="px-4 py-6 space-y-4 min-h-[600px] custom-scrollbar max-h-[70vh] overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {stageCandidates.map((candidate) => (
                        <motion.div
                          key={candidate.id.toString()}
                          layoutId={candidate.id.toString()}
                          drag
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          dragElastic={0.7}
                          onDragEnd={(e, info) => handleDragEnd(e, info, candidate)}
                          whileDrag={{ scale: 1.05, rotate: 2, zIndex: 100, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                          whileHover={{ y: -4 }}
                          onClick={() => openDetail(candidate)}
                          className="bg-white border border-[#F4F3EF] rounded-[28px] p-5 shadow-sm hover:shadow-xl transition-all group relative cursor-grab active:cursor-grabbing touch-none"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-[18px] text-white flex items-center justify-center text-sm font-black shadow-lg transform group-hover:scale-105 transition-transform" style={{ background: getAvatarGradient(candidate.name) }}>
                                {getInitials(candidate.name)}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                                <div className={`w-2 h-2 rounded-full ${candidate.pipelineStatus === 'hold' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[14px] font-black text-[#1A1A2E] truncate font-syne uppercase tracking-tight group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                {candidate.name}
                                {candidate.isSharePoint && <FiDatabase className="text-blue-500 w-3 h-3" title="Synced from SharePoint" />}
                              </h4>
                              <p className="text-[10px] font-bold text-[#9B9BAD] truncate uppercase tracking-widest mt-0.5">{candidate.jobTitle}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {(candidate.skills || []).slice(0, 3).map((s, idx) => (
                              <span key={idx} className="text-[8px] font-black text-[#1B4DA0] bg-blue-50/50 px-2 py-1 rounded-lg uppercase border border-blue-100/50">{s}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-dashed border-[#F4F3EF]">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">
                              <FiClock className="text-blue-400" /> {getStageDuration(candidate)}
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewCV(candidate);
                                }}
                                className="w-16 h-6 rounded-lg bg-blue-50 text-[#1B4DA0] flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm"
                              >
                                <FiEye size={10} /> VIEW CV
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStageMenuId(candidate.id);
                                }}
                                className="w-6 h-6 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center text-[#9B9BAD] hover:text-blue-500 transition-colors pointer-events-auto"
                              >
                                <FiMoreVertical size={10} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 pb-10">
            {filteredCandidates.map((candidate, idx) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => openDetail(candidate)}
                className={`rounded-2xl border-2 p-4 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border-slate-200/50 hover:shadow-xl hover:border-blue-200`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center text-sm font-black shadow-lg" style={{ background: getAvatarGradient(candidate.name) }}>
                    {getInitials(candidate.name)}
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[15px] font-black text-[#1A1A2E] uppercase font-syne tracking-tight flex items-center gap-2">
                        {candidate.name}
                        {candidate.isSharePoint && <FiDatabase className="text-blue-500 w-3.5 h-3.5" title="Synced from SharePoint" />}
                      </h4>
                      <StageBadge stage={candidate.stage} />
                    </div>
                    <p className={`text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-0.5`}>{candidate.jobTitle} • {candidate.client}</p>
                    <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                      <FiClock size={10} className="text-blue-400" /> {getStageDuration(candidate)} IN PIPELINE
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex flex-col items-end mr-4">
                    <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">Applied Date</p>
                    <p className="text-xs font-black text-[#1A1A2E]">{candidate.appliedDate}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCV(candidate);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#1B4DA0] rounded-xl text-xs font-bold hover:bg-[#1B4DA0] hover:text-white transition-all"
                  >
                    <FiEye className="w-4 h-4" />
                    View CV
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#F4F3EF] text-[#1A1A2E] rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <FiEye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {drawerCandidate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerCandidate(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[540px] bg-white shadow-2xl z-[110] border-l border-[#F4F3EF] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
                <div className="flex-1 mr-4">
                  <h2 className="text-2xl font-bold text-[#1A1A2E] outline-none transition-all px-2 -ml-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {drawerCandidate.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 ml-0">
                    <span className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px]">
                      {drawerCandidate.jobTitle}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">
                      {drawerCandidate.client}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="mr-2">
                    <StageBadge stage={drawerCandidate.stage} />
                  </div>
                  <button onClick={() => setDrawerCandidate(null)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90 shadow-sm">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar pb-10">
                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Experience', value: drawerCandidate.experience, icon: FiBriefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Expected CTC', value: drawerCandidate.expectedCTC, icon: FiTarget, color: 'text-purple-500', bg: 'bg-purple-50' },
                    { label: 'Notice Period', value: drawerCandidate.noticePeriod, icon: FiClock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Applied On', value: drawerCandidate.appliedDate, icon: FiCalendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -2 }}
                      className="bg-[#FAFAF8] border border-[#F4F3EF] p-5 rounded-3xl flex items-center gap-4 transition-all hover:bg-white hover:shadow-md hover:border-blue-100"
                    >
                      <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} shadow-sm`}>
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[0.2em]">{item.label}</p>
                        <p className="text-sm font-black text-[#1A1A2E] mt-0.5">{item.value || 'N/A'}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Skills Section */}
                <div className="bg-[#FAFAF8] rounded-3xl border border-[#F4F3EF] p-6">
                  <h3 className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-[3px] mb-4">Core Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(drawerCandidate.skills || []).map(s => (
                      <span key={s} className="text-[10px] font-bold text-blue-600 bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm uppercase">
                        {s}
                      </span>
                    ))}
                    {(drawerCandidate.skills || []).length === 0 && <p className="text-xs text-slate-400 italic">No skills listed</p>}
                  </div>
                </div>

                {/* About Section */}
                <div className="bg-[#FAFAF8] rounded-3xl border border-[#F4F3EF] p-6">
                  <h3 className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-[3px] mb-4">Professional Summary</h3>
                  <div className="bg-white/50 rounded-2xl p-4 border border-[#F4F3EF]">
                    <p className="text-sm font-medium text-[#4B4B5E] leading-relaxed italic">
                      "{drawerCandidate.shortDescription || 'Highly motivated professional with experience in the current role. Proven track record of delivering high-quality results and collaborating effectively with cross-functional teams.'}"
                    </p>
                  </div>
                </div>


              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">Add New Candidate</h2>
                  <p className="text-[10px] font-bold text-[#9B9BAD] mt-1">Pipeline Registration</p>
                </div>
                <button onClick={closeAddModal} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <input type="text" placeholder="Full Name *" value={newCandidate.name} onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                    <input type="email" placeholder="Email Address *" value={newCandidate.email} onChange={e => setNewCandidate({ ...newCandidate, email: e.target.value })} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                    <input type="text" placeholder="Phone Number" value={newCandidate.phone} onChange={e => setNewCandidate({ ...newCandidate, phone: e.target.value })} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                    <input type="text" placeholder="Location" value={newCandidate.location} onChange={e => setNewCandidate({ ...newCandidate, location: e.target.value })} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Target Position *</label>
                      <select 
                        value={newCandidate.positionId} 
                        onChange={e => {
                          const pos = jobOpenings.find(p => p.id === e.target.value);
                          setNewCandidate({ 
                            ...newCandidate, 
                            positionId: e.target.value,
                            jobTitle: pos?.title || '',
                            clientId: pos?.clientId || '',
                            client: pos?.client || ''
                          });
                        }} 
                        className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Opening Position</option>
                        {jobOpenings.map(pos => (
                          <option key={pos.id} value={pos.id}>{pos.title} ({pos.client})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Exp (Years)" value={newCandidate.experience} onChange={e => setNewCandidate({ ...newCandidate, experience: e.target.value })} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                      <select value={newCandidate.noticePeriod} onChange={e => setNewCandidate({ ...newCandidate, noticePeriod: e.target.value })} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer">
                        <option value="Immediate">Immediate</option>
                        <option value="15 days">15 days</option>
                        <option value="30 days">30 days</option>
                        <option value="60 days">60 days</option>
                        <option value="90 days">90 days</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* AI Matching Section */}
                <div className="mt-2 mb-4 p-6 bg-blue-50/40 rounded-[32px] border border-blue-100/50 flex items-center justify-between group">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-[0.2em] mb-1">AI Matching</p>
                    <p className="text-[11px] font-bold text-slate-500 italic opacity-80">Ready to match with this JD</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!newCandidate.jobTitle) {
                        toast.error("Please enter a Target Job Title first");
                        return;
                      }
                      fetchResumeBankMatches(newCandidate.jobTitle);
                    }}
                    disabled={resumeBankLoading}
                    className="flex items-center gap-2 px-8 py-4 bg-[#1B4DA0] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-[#153e82] transition-all disabled:opacity-50 group-hover:scale-[1.02] active:scale-95"
                  >
                    {resumeBankLoading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
                    {resumeBankLoading ? "Matching..." : "Magic Match"}
                  </button>
                </div>

                {/* Suggested Candidates Results List */}
                {suggestedCandidates.length > 0 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">AI Identified matches</h4>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedSuggestedIds.size === suggestedCandidates.length) {
                              setSelectedSuggestedIds(new Set());
                            } else {
                              setSelectedSuggestedIds(new Set(suggestedCandidates.map(c => c.id)));
                            }
                          }}
                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                          {selectedSuggestedIds.size === suggestedCandidates.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{suggestedCandidates.length} Found</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {suggestedCandidates.map((c, idx) => (
                        <div 
                          key={idx} 
                          className={`group flex items-center justify-between p-4 bg-white border rounded-2xl transition-all cursor-pointer ${selectedSuggestedIds.has(c.id) ? 'border-blue-500 bg-blue-50/20' : 'border-[#F4F3EF] hover:border-blue-200 hover:shadow-md'}`}
                          onClick={() => {
                            setSelectedSuggestedIds(prev => {
                              const next = new Set(prev);
                              if (next.has(c.id)) next.delete(c.id);
                              else next.add(c.id);
                              return next;
                            });
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedSuggestedIds.has(c.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 bg-white'}`}>
                              {selectedSuggestedIds.has(c.id) && <FiCheck size={12} />}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center font-bold text-xs uppercase group-hover:bg-[#1B4DA0] group-hover:text-white transition-all">
                                {(c.name || 'U')[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#1A1A2E]">{c.name}</p>
                                <p className="text-[10px] font-bold text-[#6B6B7E] truncate max-w-[180px]">{c.role || c.skills?.join(', ') || 'Potential Match'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                               type="button"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleViewCV(c);
                               }}
                               className="px-4 py-2 bg-[#F4F3EF] text-[#6B6B7E] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm flex items-center gap-2"
                             >
                               <FiEye size={14} /> VIEW CV
                             </button>
                             <button 
                               type="button"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setNewCandidate({
                                   ...newCandidate,
                                   name: c.name,
                                   email: c.email || '',
                                   phone: c.phone || '',
                                   experience: c.experience || '',
                                   skills: Array.isArray(c.skills) ? c.skills.join(', ') : (c.skills || ''),
                                   resumeId: c.id
                                 });
                                 toast.info(`Autofilled details for ${c.name}`);
                               }}
                               className="px-4 py-2 bg-[#F4F3EF] text-[#1A1A2E] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm"
                             >
                               Use
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedSuggestedIds.size > 0 && (
                      <div className="mt-4 p-4 bg-[#ECFDF5] rounded-[24px] border border-[#10B981]/20 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ready to process</p>
                          <p className="text-xs font-bold text-emerald-800">{selectedSuggestedIds.size} candidates selected</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={handleBulkAdd}
                          className="px-8 py-3 bg-[#059669] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#047857] transition-all shadow-lg shadow-emerald-200 active:scale-95"
                          style={{ backgroundColor: '#059669', color: 'white' }}
                        >
                          Add Selected Candidates
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-4 pt-2">
                  <input type="text" placeholder="Skills (comma separated)" value={newCandidate.skills} onChange={e => setNewCandidate({ ...newCandidate, skills: e.target.value })} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#F4F3EF] rounded-[32px] p-10 text-center hover:bg-blue-50/30 transition-all cursor-pointer group">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={e => setResumeFile(e.target.files[0])} />
                    <div className="w-16 h-16 bg-[#F4F3EF] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#1B4DA0] group-hover:text-white transition-all">
                      <FiUpload size={24} />
                    </div>
                    <p className="text-sm font-bold text-[#1A1A2E]">{resumeFile ? resumeFile.name : 'Click to upload resume (PDF, DOCX)'}</p>
                    <p className="text-[10px] font-bold text-[#9B9BAD] mt-2">{resumeFile ? `${(resumeFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Max 10MB'}</p>
                  </div>
                </div>
              </div>
              <div className="px-10 py-8 border-t border-[#F4F3EF] bg-[#F8FAFF] flex gap-4">
                <button onClick={closeAddModal} className="flex-1 py-4 bg-white border-2 border-[#E8E7E2] rounded-2xl text-sm font-bold text-[#6B6B7E] hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={() => handleAddCandidate(true)} className="flex-1 py-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-sm font-bold text-[#1B4DA0] hover:bg-blue-100 transition-all">Add & New</button>
                <button onClick={() => handleAddCandidate(false)} className="flex-[1.5] py-4 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-[#153e82] transition-all">Add Candidate</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApproveModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="px-10 py-8 border-b border-[#F4F3EF] bg-emerald-500 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-syne">Approve & Schedule</h2>
                  <p className="text-[10px] font-bold text-white/70 mt-1">Interview Setup</p>
                </div>
                <button onClick={() => setShowApproveModal(false)} className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#9B9BAD] block">Interview Date</label>
                    <input type="date" value={approveInterviewDate} onChange={e => setApproveInterviewDate(e.target.value)} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#9B9BAD] block">Time</label>
                    <input type="time" value={approveInterviewTime} onChange={e => setApproveInterviewTime(e.target.value)} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#9B9BAD] block uppercase tracking-widest pl-1">Position & Client Details</label>
                  {(!candidates.find(c => c.id === approveCandidateId)?.positionId) ? (
                    <select 
                      onChange={e => {
                        const pos = jobOpenings.find(p => p.id === e.target.value);
                        setCandidates(prev => prev.map(c => c.id === approveCandidateId ? { ...c, positionId: e.target.value, jobTitle: pos?.title, clientId: pos?.clientId, client: pos?.client } : c));
                      }}
                      className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                    >
                      <option value="">Link to Open Position *</option>
                      {jobOpenings.map(pos => <option key={pos.id} value={pos.id}>{pos.title} ({pos.client})</option>)}
                    </select>
                  ) : (
                    <div className="bg-[#F4F3EF] rounded-2xl px-6 py-4 flex items-center justify-between opacity-70">
                      <div>
                        <p className="text-xs font-black text-[#1A1A2E] uppercase">{candidates.find(c => c.id === approveCandidateId)?.jobTitle}</p>
                        <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest">{candidates.find(c => c.id === approveCandidateId)?.client}</p>
                      </div>
                      <FiCheckCircle className="text-emerald-500" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#9B9BAD] block uppercase tracking-widest pl-1">Interviewer Details</label>
                  <input type="text" placeholder="Interviewer Name *" value={approveInterviewer} onChange={e => setApproveInterviewer(e.target.value)} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
                </div>
              </div>
              <div className="px-10 py-8 border-t border-[#F4F3EF] flex gap-4">
                <button onClick={() => setShowApproveModal(false)} className="flex-1 py-4 bg-[#F4F3EF] rounded-2xl text-sm font-bold text-[#6B6B7E] hover:bg-gray-100 transition-all">Cancel</button>
                <button onClick={handleApproveCandidate} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-emerald-600 transition-all">Confirm Approval</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="px-10 py-8 border-b border-[#F4F3EF] bg-rose-500 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-syne">Reject Candidate</h2>
                  <p className="text-[10px] font-bold text-white/70 mt-1">Pipeline Dismissal</p>
                </div>
                <button onClick={() => setShowRejectModal(false)} className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-10 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#9B9BAD] block">Reason for Rejection</label>
                  <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all appearance-none cursor-pointer">
                    <option value="">Select a reason...</option>
                    {rejectionReasons.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {rejectReason === 'Other' && (
                  <input type="text" placeholder="Enter custom reason..." value={rejectCustomReason} onChange={e => setRejectCustomReason(e.target.value)} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
                )}
              </div>
              <div className="px-10 py-8 border-t border-[#F4F3EF] flex gap-4">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-4 bg-[#F4F3EF] rounded-2xl text-sm font-bold text-[#6B6B7E] hover:bg-gray-100 transition-all">Cancel</button>
                <button onClick={handleReject} className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-rose-600 transition-all">Confirm Rejection</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CandidatePipelineTab;
