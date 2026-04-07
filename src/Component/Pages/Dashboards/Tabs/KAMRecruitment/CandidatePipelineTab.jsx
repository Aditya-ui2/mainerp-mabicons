import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getResumeBankResumes, getResumeRoleTypes, getAllCandidates, addCandidate as addCandidateAPI, updateCandidateStatus, scheduleNewInterview, getAllRecruitmentPositions, uploadResumes } from '../../../service/api';
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
  Applied: { color: '#64748b', icon: FiFileText, bgColor: 'bg-[#F8FAFF]', borderColor: 'border-blue-100', dotColor: 'bg-blue-400' },
  Screening: { color: '#3b82f6', icon: FiPhone, bgColor: 'bg-blue-50/50', borderColor: 'border-blue-200/50', dotColor: 'bg-blue-500' },
  Interview: { color: '#f59e0b', icon: FiUsers, bgColor: 'bg-amber-50/50', borderColor: 'border-amber-200/50', dotColor: 'bg-amber-500' },
  Offer: { color: '#ec4899', icon: FiMail, bgColor: 'bg-purple-50/50', borderColor: 'border-purple-200/50', dotColor: 'bg-purple-500' },
  Hired: { color: '#22c55e', icon: FiCheckCircle, bgColor: 'bg-emerald-50/50', borderColor: 'border-emerald-200/50', dotColor: 'bg-emerald-500' },
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

  const [candidates, setCandidates] = useState(() => {
    try {
      const c = localStorage.getItem(CACHE_KEY_CANDIDATES);
      if (c) {
        const parsed = JSON.parse(c);
        if (parsed.length > 0) return parsed;
      }
      // High-fidelity mock data for UI testing if empty
      return [
        {
          id: 'mock-101',
          name: 'Alex Rivera',
          email: 'alex.rivera@example.com',
          phone: '+91 98765 43210',
          location: 'Bangalore, India',
          role: 'Senior Software Engineer',
          jobTitle: 'Senior Software Engineer',
          client: 'TechSolutions Inc.',
          experience: '6.5 Years',
          currentCTC: '18 LPA',
          expectedCTC: '24 LPA',
          noticePeriod: '30 Days',
          skills: ['React', 'Node.js', 'Redux', 'TypeScript', 'AWS'],
          stage: 'Applied',
          source: 'LinkedIn',
          rating: 4.5,
          appliedDate: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0],
          shortDescription: 'Experienced full-stack developer with a strong background in scalable cloud architectures.',
          profileImage: 'https://i.pravatar.cc/150?u=mock-101'
        },
        {
          id: 'mock-102',
          name: 'Jordan Smith',
          email: 'jordan.smith@example.com',
          phone: '+91 88888 77777',
          location: 'Mumbai, India',
          role: 'Frontend Developer',
          jobTitle: 'Frontend Developer',
          client: 'Microsoft',
          experience: '4 Years',
          currentCTC: '12 LPA',
          expectedCTC: '16 LPA',
          noticePeriod: 'Immediate',
          skills: ['React', 'Tailwind CSS', 'Framer Motion', 'Next.js'],
          stage: 'Screening',
          source: 'Naukri',
          rating: 4.2,
          appliedDate: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0],
          shortDescription: 'Passionate about building beautiful, interactive user interfaces with modern React ecosystems.',
          profileImage: 'https://i.pravatar.cc/150?u=mock-102'
        },
        {
          id: 'mock-103',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '+91 99999 55555',
          location: 'Pune, India',
          role: 'Lead UI/UX Designer',
          jobTitle: 'Lead UI/UX Designer',
          client: 'Google',
          experience: '8 Years',
          currentCTC: '25 LPA',
          expectedCTC: '32 LPA',
          noticePeriod: '60 Days',
          skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
          stage: 'Technical Round',
          source: 'Referral',
          rating: 4.8,
          appliedDate: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0],
          shortDescription: 'Senior design leader focused on human-centric product design and cross-functional team leadership.',
          profileImage: 'https://i.pravatar.cc/150?u=mock-103'
        }
      ];
    } catch {
      return [];
    }
  });
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

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const candidateId = draggableId;
    const newStage = destination.droppableId;
    const now = new Date().toISOString().split('T')[0];

    setCandidates(prev => prev.map(c => String(c.id) === String(candidateId) ? { ...c, stage: newStage, lastActivity: now, stageChangedAt: now } : c));

    try {
      await updateCandidateStatus(candidateId, { stage: newStage });
    } catch (error) {
      console.error('Failed to update candidate stage after drag:', error);
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

    const selectedData = localStorage.getItem('kamSelectedResumes');
    if (selectedData) {
      try {
        const resumes = JSON.parse(selectedData);
        const newCandidatesArr = resumes.map(resume => ({
          id: Date.now() + Math.random(),
          name: resume.candidateName || resume.fileName?.replace(/\.[^.]+$/, '') || 'Unknown',
          email: resume.email || '', phone: resume.phone || '', location: resume.location || '',
          jobTitle: resume.jobTitle || '', client: resume.client || '', stage: 'Screening',
          rating: 0, experience: resume.experience || '', currentCTC: resume.currentCTC || '',
          expectedCTC: resume.expectedCTC || '', noticePeriod: '30 days', skills: resume.skills || [],
          appliedDate: new Date().toISOString().split('T')[0], lastActivity: new Date().toISOString().split('T')[0],
          photo: null, source: 'Resume Bank', resumeId: resume.id, pipelineStatus: 'pending',
        }));
        setCandidates(prev => [...newCandidatesArr, ...prev]);
        localStorage.removeItem('kamSelectedResumes');
      } catch (e) {
        console.error('Failed to process selected resumes');
      }
    }

    const handleStorage = (e) => {
      if (e.key === 'kamJobOpenings' && e.newValue) {
        try { setJobOpenings(JSON.parse(e.newValue)); } catch (err) { console.error('Failed to parse job openings update'); }
      }
      if (e.key === 'kamSelectedResumes' && e.newValue) {
        try {
          const resumes = JSON.parse(e.newValue);
          const newCandidatesArr = resumes.map(resume => ({
            id: Date.now() + Math.random(),
            name: resume.candidateName || resume.fileName?.replace(/\.[^.]+$/, '') || 'Unknown',
            email: resume.email || '', phone: resume.phone || '', location: resume.location || '',
            jobTitle: resume.jobTitle || '', client: resume.client || '', stage: 'Screening',
            rating: 0, experience: resume.experience || '', currentCTC: resume.currentCTC || '',
            expectedCTC: resume.expectedCTC || '', noticePeriod: '30 days', skills: resume.skills || [],
            appliedDate: new Date().toISOString().split('T')[0], lastActivity: new Date().toISOString().split('T')[0],
            photo: null, source: 'Resume Bank', resumeId: resume.id, pipelineStatus: 'pending',
          }));
          setCandidates(prev => [...newCandidatesArr, ...prev]);
          localStorage.removeItem('kamSelectedResumes');
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

  const fetchResumeBankMatches = async (roleKeyword) => {
    setResumeBankLoading(true);
    setResumeBankRole(roleKeyword);
    try {
      const selectedJob = jobOpenings.find(j => j.title === roleKeyword || j.id === roleKeyword || `${j.title} — ${j.client}` === roleKeyword);
      const cleanedKeyword = String(roleKeyword || '').replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
      const fallbackTerms = [selectedJob?.roleType, selectedJob?.title, roleKeyword, cleanedKeyword, cleanedKeyword.split(' ')[0]].filter((term, index, list) => term && list.indexOf(term) === index);

      let matchedResumes = [];
      for (const term of fallbackTerms) {
        const response = await getResumeBankResumes({ search: term, limit: 20 });
        matchedResumes = response.data || [];
        if (matchedResumes.length > 0) break;
      }
      setResumeBankResumes(matchedResumes);
    } catch (error) { console.error('Failed to fetch resume bank matches:', error); setResumeBankResumes([]); }
    finally { setResumeBankLoading(false); }
  };

  const addFromResumeBank = async (resume) => {
    const candidateLocal = {
      id: Date.now() + Math.random(),
      name: resume.candidateName || resume.fileName?.replace(/\.[^.]+$/, '') || 'Unknown',
      email: resume.email || '', phone: resume.phone || '', location: resume.location || '',
      jobTitle: resumeBankRole || '', client: '', stage: 'Screening', rating: 0,
      experience: resume.experience || '', currentCTC: resume.currentCTC || '',
      expectedCTC: resume.expectedCTC || '', noticePeriod: '30 days',
      skills: resume.skills || [], appliedDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0], photo: null,
      source: 'Resume Bank', resumeId: resume.id, pipelineStatus: 'pending',
    };
    try {
      const apiData = {
        name: candidateLocal.name, email: candidateLocal.email, phone: candidateLocal.phone,
        location: candidateLocal.location, skills: candidateLocal.skills, experience: candidateLocal.experience,
        currentSalary: candidateLocal.currentCTC, expectedSalary: candidateLocal.expectedCTC,
        stage: 'Screening', pipelineStatus: 'pending', source: 'Resume Bank',
      };
      if (resume.positionId) apiData.positionId = resume.positionId;
      if (resume.clientId) apiData.clientId = resume.clientId;
      const res = await addCandidateAPI(apiData);
      if (res?.data?._id) candidateLocal.id = res.data._id;
    } catch (err) { console.error('Failed to add resume bank candidate:', err); }
    setCandidates(prev => [candidateLocal, ...prev]);
  };

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
          id: c.id || c._id, name: c.name, email: c.email, phone: c.phone || '', location: c.location || '',
          jobTitle: c.position?.title || '', client: c.client?.companyName || c.client?.name || '',
          stage: c.stage || 'Screening', rating: c.rating || 0, experience: c.experience || '',
          currentCTC: c.currentSalary || '', expectedCTC: c.expectedSalary || '', noticePeriod: c.noticePeriod || '30 days',
          skills: c.skills || [], appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
          lastActivity: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '',
          photo: null, pipelineStatus: c.pipelineStatus || 'pending', rejectionReason: c.rejectionReason || '',
          source: c.source || '', positionId: c.position?.id || c.position?._id, clientId: c.client?.id || c.client?._id,
          shortDescription: c.shortDescription || '',
          requirements: c.requirements || [],
          responsibilities: c.responsibilities || []
        }));
        setCandidates(mapped);
        try { localStorage.setItem(CACHE_KEY_CANDIDATES, JSON.stringify(mapped)); } catch { }
      }
    } catch (error) { console.error('Failed to fetch candidates:', error); }
    finally { setRefreshing(false); }
  }, [filterStage, filterPipelineStatus, searchTerm]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const stageOrder = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
  const fullStageOrder = ['Screening', 'Phone Interview', 'Technical Round', 'HR Round', 'Client Interview', 'Offer Sent', 'Joined'];

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
    return matchesSearch && matchesStage && matchesPipelineStatus;
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

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.jobTitle) { alert('Please fill required fields (Name, Email, Job Title)'); return; }
    const skillsArr = (newCandidate.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    // FOR UI FIX/TESTING: Add locally immediately
    try {
      const skillsArr = (newCandidate.skills || '').split(',').map(s => s.trim()).filter(Boolean);
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
        // Optional: Update with real ID from server
        setCandidates(prev => prev.map(c => c.id === mapped.id ? { ...c, id: res.data.id || res.data._id } : c));
      }
    } catch (err) {
      console.warn('API Offline - Running in Local Mode');
    }
    setShowAddModal(false); setResumeFile(null); setNewCandidate({ name: '', email: '', phone: '', location: '', jobTitle: '', client: '', experience: '', currentCTC: '', expectedCTC: '', noticePeriod: '30 days', skills: '', positionId: '', clientId: '', roleType: '', source: '', resumeId: '' });
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
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white rounded-2xl p-1 border border-[#F4F3EF] shadow-sm flex items-center">
              <button onClick={() => setIsKanbanView(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isKanbanView ? 'bg-[#F4F3EF] text-[#1B4DA0]' : 'text-[#9B9BAD] hover:text-[#1B4DA0]'}`}><FiGrid /> Kanban</button>
              <button onClick={() => setIsKanbanView(false)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${!isKanbanView ? 'bg-[#F4F3EF] text-[#1B4DA0]' : 'text-[#9B9BAD] hover:text-[#1B4DA0]'}`}><FiList /> List</button>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg active:scale-95 text-center">
              <FiPlus size={18} />
              Add Candidate
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

        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm">
            <div className="flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-5 py-3">
              <FiSearch className="text-[#9B9BAD]" size={18} />
              <input
                type="text"
                placeholder="Search by title, client or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none w-full placeholder:text-[#9B9BAD]/60"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
            {[
              { label: 'All Time', icon: FiCalendar, value: filterDate, setter: setFilterDate },
              { label: 'All Roles', icon: FiBriefcase, value: filterJob, setter: setFilterJob },
              { label: 'All Clients', icon: FiTarget, value: filterClient, setter: setFilterClient },
            ].map((filter, i) => (
              <div key={i} className="relative group flex-shrink-0">
                <button className="flex items-center gap-2.5 px-5 py-3.5 bg-white border border-[#F4F3EF] rounded-2xl text-xs font-black text-[#1A1A2E] hover:border-blue-200 hover:bg-blue-50/30 transition-all uppercase tracking-widest shadow-sm">
                  <filter.icon className="text-blue-500" size={14} />
                  {filter.value === 'all' ? filter.label : filter.value}
                  <FiChevronDown className="text-[#9B9BAD] group-hover:text-blue-500 transition-colors" />
                </button>
              </div>
            ))}
            <button className="p-3.5 bg-white border border-[#F4F3EF] rounded-2xl text-[#1A1A2E] hover:bg-[#F4F3EF] transition-all shadow-sm">
              <FiSliders size={18} />
            </button>
          </div>
        </div>

        {isKanbanView ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar items-start" style={{ minHeight: '600px' }}>
              {stageOrder.map(stage => {
                const stageCandidates = filteredCandidates.filter(c => {
                  if (stage === 'Interview') return ['Phone Interview', 'Technical Round', 'HR Round', 'Client Interview'].includes(c.stage) || c.stage === 'Interview';
                  if (stage === 'Applied') return c.stage === 'Screening' || c.stage === 'Applied' || !c.stage;
                  if (stage === 'Offer') return c.stage === 'Offer Sent' || c.stage === 'Offer';
                  if (stage === 'Hired') return c.stage === 'Joined' || c.stage === 'Hired';
                  return c.stage === stage;
                });
                const config = stageConfig[stage] || stageConfig.Applied;
                return (
                  <Droppable key={stage} droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-shrink-0 w-[320px] rounded-[32px] transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-blue-50/50 ring-2 ring-blue-100' : 'bg-[#F8FAFF]/40 border border-[#F4F3EF]'}`}
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
                          {stageCandidates.map((candidate, index) => (
                            <Draggable key={candidate.id.toString()} draggableId={candidate.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => openDetail(candidate)}
                                  className={`bg-white border rounded-[28px] p-5 shadow-sm hover:shadow-xl transition-all group relative ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-400' : 'border-[#F4F3EF]'}`}
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
                                      <h4 className="text-[14px] font-black text-[#1A1A2E] truncate font-syne uppercase tracking-tight group-hover:text-blue-600 transition-colors">{candidate.name}</h4>
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
                                    <div className="flex items-center -space-x-2">
                                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center"><FiUserCheck size={10} className="text-[#9B9BAD]" /></div>
                                      <button className="w-6 h-6 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center text-[#9B9BAD] hover:text-blue-500 transition-colors"><FiMoreVertical size={10} /></button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          <div className="grid gap-4 pb-10">
            {filteredCandidates.map((candidate, idx) => (
              <motion.div key={candidate.id} onClick={() => openDetail(candidate)} className="flex items-center gap-6 px-8 py-5 bg-white rounded-[24px] border border-[#F4F3EF] hover:shadow-xl transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-[18px] text-white flex items-center justify-center text-sm font-black shadow-lg" style={{ background: getAvatarGradient(candidate.name) }}>{getInitials(candidate.name)}</div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-black text-[#1A1A2E] uppercase font-syne tracking-tight">{candidate.name}</h4>
                  <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{candidate.jobTitle} • {candidate.client}</p>
                </div>
                <StageBadge stage={candidate.stage} />
                <button className="w-10 h-10 rounded-xl bg-[#F4F3EF] flex items-center justify-center text-[#1A1A2E]"><FiEye /></button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {drawerCandidate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerCandidate(null)} className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-xl z-[9999]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full md:w-[580px] bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] z-[10000] flex flex-col overflow-hidden rounded-l-[48px]">
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[24px] text-white flex items-center justify-center text-xl font-black shadow-xl" style={{ background: getAvatarGradient(drawerCandidate.name) }}>
                    {getInitials(drawerCandidate.name)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#1A1A2E] font-syne uppercase tracking-tight">{drawerCandidate.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-[2px]">{drawerCandidate.jobTitle}</span>
                      <div className="w-1 h-1 rounded-full bg-[#9B9BAD]" />
                      <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">{drawerCandidate.client}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StageBadge stage={drawerCandidate.stage} />
                  <button onClick={() => setDrawerCandidate(null)} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-10 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Experience', value: drawerCandidate.experience, icon: FiBriefcase, color: 'text-blue-500' },
                    { label: 'Expectation', value: drawerCandidate.expectedCTC, icon: FiTarget, color: 'text-purple-500' },
                    { label: 'Notice Period', value: drawerCandidate.noticePeriod, icon: FiClock, color: 'text-amber-500' },
                    { label: 'Applied On', value: drawerCandidate.appliedDate, icon: FiCalendar, color: 'text-emerald-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#F8FAFF] border border-blue-50/50 p-5 rounded-[24px] flex items-center gap-4 group hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all group cursor-default">
                      <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">{item.label}</p>
                        <p className="text-xs font-black text-[#1A1A2E] mt-0.5">{item.value || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <section className="text-left">
                  <h3 className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-[3px] mb-5 flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-blue-500 rounded-full" /> Key Skills
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {(drawerCandidate.skills || []).map(s => (
                      <span key={s} className="text-[11px] font-black text-blue-600 bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100/30 uppercase tracking-tight">
                        {s}
                      </span>
                    ))}
                    {(drawerCandidate.skills || []).length === 0 && <p className="text-xs text-slate-400">No skills listed</p>}
                  </div>
                </section>

                <section className="text-left">
                  <h3 className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-[3px] mb-5 flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-amber-500 rounded-full" /> About Candidate
                  </h3>
                  <div className="bg-[#FAFAF8] rounded-[32px] p-6 border border-[#F4F3EF]">
                    <p className="text-sm font-medium text-[#4B4B5E] leading-relaxed italic">
                      "{drawerCandidate.shortDescription || 'No description available for this candidate. Use full experience view for more details.'}"
                    </p>
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-4 pt-10">
                  <button
                    onClick={() => { setDrawerCandidate(null); setSelectedCandidateDetail(drawerCandidate); setShowDetailSidebar(true); }}
                    className="col-span-2 py-5 bg-[#1B4DA0] text-white rounded-3xl font-black uppercase tracking-[3px] shadow-xl hover:bg-[#0D47A1] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <FiUserCheck size={18} /> View Full Experience
                  </button>
                  <button className="py-4 bg-white border border-[#F4F3EF] rounded-2xl font-black text-xs text-[#1A1A2E] uppercase tracking-widest hover:bg-[#F4F3EF] active:scale-[0.98] transition-all shadow-sm">
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setDrawerCandidate(null)}
                    className="py-4 bg-[#F4F3EF] rounded-2xl font-black text-xs text-[#9B9BAD] uppercase tracking-widest hover:bg-[#EBEBE4] active:scale-[0.98] transition-all"
                  >
                    Close
                  </button>
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
                <button onClick={() => setShowAddModal(false)} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
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
                    <input type="text" placeholder="Target Job Title *" value={newCandidate.jobTitle} onChange={e => setNewCandidate({ ...newCandidate, jobTitle: e.target.value })} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                    <input type="text" placeholder="Client Name" value={newCandidate.client} onChange={e => setNewCandidate({ ...newCandidate, client: e.target.value })} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
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
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-white border-2 border-[#E8E7E2] rounded-2xl text-sm font-bold text-[#6B6B7E] hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={handleAddCandidate} className="flex-[2] py-4 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-[#153e82] transition-all">Add Candidate</button>
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
                  <label className="text-[10px] font-bold text-[#9B9BAD] block">Interviewer Name</label>
                  <input type="text" placeholder="e.g. John Doe" value={approveInterviewer} onChange={e => setApproveInterviewer(e.target.value)} className="w-full bg-[#F4F3EF] border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
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
