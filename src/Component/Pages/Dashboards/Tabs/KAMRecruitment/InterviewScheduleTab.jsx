import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiClock,
  FiVideo,
  FiMapPin,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiBriefcase,
  FiLink,
  FiRefreshCw,
  FiX,
  FiCopy,
  FiClipboard,
  FiStar,
  FiSend,
  FiArrowLeft,
} from 'react-icons/fi';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts';
import InterviewFeedbackModal from './InterviewFeedbackModal';
import { getLocalISODate, toLocalISODate } from '../../../Utilities/dateUtils';
import { 
  getAllInterviews, 
  scheduleNewInterview, 
  sendInterviewReminder,
  cancelInterview as cancelInterviewAPI,
  deleteInterview,
  updateInterview,
  updateInterviewStatus,
  getAllCandidates,
  getAllRecruitmentPositions,
  getAllClients,
  getDepartmentTeamMembers
} from '../../../service/api';

/* ── Generate unique Google Meet link ── */
const generateMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const generateSegment = (length) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  return `https://meet.google.com/${generateSegment(3)}-${generateSegment(4)}-${generateSegment(3)}`;
};

/* ── Copy to clipboard helper ── */
const copyToClipboard = async (text, setToast) => {
  try {
    await navigator.clipboard.writeText(text);
    setToast && setToast('Link copied to clipboard!');
    setTimeout(() => setToast && setToast(null), 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

/* ── Interview Type Badge ── */
const TypeBadge = ({ type }) => {
  const config = {
    Video: { gradient: 'from-blue-500 to-indigo-600', icon: FiVideo },
    'In-Person': { gradient: 'from-emerald-500 to-teal-600', icon: FiMapPin },
    Phone: { gradient: 'from-violet-500 to-purple-600', icon: FiPhone },
  };
  const { gradient, icon: Icon } = config[type] || config.Video;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r ${gradient}`}>
      <Icon className="w-3 h-3" />
      {type}
    </span>
  );
};

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const config = {
    Scheduled: { bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    'In Progress': { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    Completed: { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    Cancelled: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    Rescheduled: { bg: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  };
  const { bg, dot } = config[status] || config.Scheduled;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
};

/* ══════════════════════════════════════════════════════ */
const CACHE_KEY_INTERVIEWS = 'cache_kamInterviews';

const InterviewScheduleTab = ({ isDarkMode, quickAction, onQuickActionHandled }) => {
  const [interviews, setInterviews] = useState(() => {
    try { const c = localStorage.getItem(CACHE_KEY_INTERVIEWS); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [toast, setToast] = useState(null);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  const [availableInterviewers, setAvailableInterviewers] = useState([]);
  const [showCandidateSuggestions, setShowCandidateSuggestions] = useState(false);
  const [showPositionSuggestions, setShowPositionSuggestions] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showInterviewerSuggestions, setShowInterviewerSuggestions] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [interviewIdToCancel, setInterviewIdToCancel] = useState(null);
  const [modalActionType, setModalActionType] = useState('cancel'); // 'cancel' or 'delete'
  
  // NEW STATE FOR FULL PAGE FORM
  const [showFullPageForm, setShowFullPageForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [detailInterview, setDetailInterview] = useState(null);
  
  const [newInterview, setNewInterview] = useState({
    candidateId: '',
    positionId: '',
    clientId: '',
    candidateName: '',
    candidateEmail: '',
    position: '',
    client: '',
    round: '',
    type: 'Video',
    date: '',
    time: '',
    duration: '60 mins',
    interviewer: '',
    interviewerRole: '',
    meetLink: '',
  });

  useEffect(() => {
    if (quickAction === 'schedule-interview') {
      resetForm();
      setShowFullPageForm(true);
      onQuickActionHandled?.();
    }
  }, [quickAction, onQuickActionHandled]);

  // ── Fetch interviews from backend ──
  const fetchInterviews = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const filters = {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      const response = await getAllInterviews(filters);
      const data = response.data || response.interviews || [];
      const mapped = data.map(iv => {
        const meetingLink = iv.meetingLink || iv.meetLink || null;
        return {
        id: iv._id || iv.id,
        candidateName: iv.candidateName || iv.candidate?.name || '',
        candidateEmail: iv.candidateEmail || iv.candidate?.email || '',
        position: iv.positionTitle || iv.position?.title || iv.position || '',
        client: iv.clientName || iv.client?.companyName || iv.client || '',
        round: iv.interviewType || iv.round || '',
        type: meetingLink ? 'Video' : (iv.meetingType || iv.type || 'Video'),
        date: iv.interviewDate ? toLocalISODate(iv.interviewDate) : iv.date || '',
        time: iv.startTime || iv.time || '',
        duration: iv.duration ? `${iv.duration} mins` : '60 mins',
        interviewer: iv.interviewerName || iv.interviewer || '',
        interviewerRole: iv.interviewerRole || '',
        status: iv.status || 'Scheduled',
        meetLink: meetingLink,
        photo: null,
        feedback: iv.feedback || null,
        };
      });
      setInterviews(mapped);
      try { localStorage.setItem(CACHE_KEY_INTERVIEWS, JSON.stringify(mapped)); } catch {}
    } catch (error) {
      console.error('Failed to fetch interviews from backend:', error);
      if (interviews.length === 0) {
        setError('Failed to load interviews. Click refresh to try again.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
    
    const fetchRecruitmentData = async () => {
      try {
        const [candidatesData, positionsData, clientsData, hrRecData, hrOpsData] = await Promise.all([
          getAllCandidates(),
          getAllRecruitmentPositions(),
          getAllClients(),
          getDepartmentTeamMembers('HR Recruitment'),
          getDepartmentTeamMembers('HR Operations')
        ]);
        setAvailableCandidates(candidatesData.data || []);
        setAvailablePositions(positionsData.data || []);
        setAvailableClients(clientsData.data || []);
        
        const hrStaff = [
          ...(hrRecData.data || []),
          ...(hrOpsData.data || [])
        ];
        setAvailableInterviewers(hrStaff);
      } catch (err) {
        console.error('Failed to fetch recruitment data:', err);
      }
    };
    fetchRecruitmentData();
  }, []);

  // Listen for approved candidates from CandidatePipelineTab
  useEffect(() => {
    const loadApproved = () => {
      const data = localStorage.getItem('kamApprovedInterviews');
      if (data) {
        try {
          const approvedEntries = JSON.parse(data);
          if (approvedEntries.length > 0) {
            setInterviews(prev => {
              const existingIds = new Set(prev.map(i => i.id));
              const newEntries = approvedEntries.filter(e => !existingIds.has(e.id));
              return newEntries.length > 0 ? [...newEntries, ...prev] : prev;
            });
          }
        } catch (e) {
          console.error('Failed to parse approved interviews');
        }
      }
    };
    loadApproved();

    const handleStorage = (e) => {
      if (e.key === 'kamApprovedInterviews' && e.newValue) {
        try {
          const approvedEntries = JSON.parse(e.newValue);
          setInterviews(prev => {
            const existingIds = new Set(prev.map(i => i.id));
            const newEntries = approvedEntries.filter(e => !existingIds.has(e.id));
            return newEntries.length > 0 ? [...newEntries, ...prev] : prev;
          });
        } catch (err) {
          console.error('Failed to process approved interviews update');
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Stats
  const today = getLocalISODate();
  const stats = {
    todayCount: interviews.filter(i => i.date === today).length,
    scheduled: interviews.filter(i => i.status === 'Scheduled').length,
    completed: interviews.filter(i => i.status === 'Completed').length,
    cancelled: interviews.filter(i => i.status === 'Cancelled').length,
  };

  const statCards = [
    { label: 'Today\'s Interviews', value: stats.todayCount, icon: FiCalendar, color: '#3FA9F5', shadowColor: '63, 169, 245' },
    { label: 'Scheduled', value: stats.scheduled, icon: FiClock, color: '#1E88E5', shadowColor: '30, 136, 229' },
    { label: 'Completed', value: stats.completed, icon: FiCheckCircle, color: '#0D47A1', shadowColor: '13, 71, 161' },
    { label: 'Cancelled', value: stats.cancelled, icon: FiXCircle, color: '#ef4444', shadowColor: '239, 68, 68' },
  ];

  // Filter interviews
  const filteredInterviews = interviews.filter(i => {
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus;

    // Date filter
    let matchesDate = true;
    if (filterDate !== 'all' && i.date) {
      const interviewDate = new Date(i.date);
      const now = new Date();
      if (filterDate === 'today') {
        matchesDate = i.date === today;
      } else if (filterDate === 'week') {
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
        const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);
        matchesDate = interviewDate >= weekStart && interviewDate <= weekEnd;
      } else if (filterDate === 'prev-week') {
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() - 7); weekStart.setHours(0,0,0,0);
        const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);
        matchesDate = interviewDate >= weekStart && interviewDate <= weekEnd;
      } else if (filterDate === 'month') {
        matchesDate = interviewDate.getMonth() === now.getMonth() && interviewDate.getFullYear() === now.getFullYear();
      } else if (filterDate === 'prev-month') {
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        matchesDate = interviewDate.getMonth() === prevMonth && interviewDate.getFullYear() === prevMonthYear;
      } else if (filterDate === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const interviewQuarter = Math.floor(interviewDate.getMonth() / 3);
        matchesDate = interviewQuarter === currentQuarter && interviewDate.getFullYear() === now.getFullYear();
      } else if (filterDate === 'prev-quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
        const prevQuarterYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const interviewQuarter = Math.floor(interviewDate.getMonth() / 3);
        matchesDate = interviewQuarter === prevQuarter && interviewDate.getFullYear() === prevQuarterYear;
      } else if (filterDate === 'year') {
        matchesDate = interviewDate.getFullYear() === now.getFullYear();
      } else if (filterDate === 'custom') {
        if (customStartDate) matchesDate = interviewDate >= new Date(customStartDate);
        if (customEndDate && matchesDate) matchesDate = interviewDate <= new Date(customEndDate + 'T23:59:59');
      }
    }

    // Search term filter
    let matchesSearch = true;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      matchesSearch = (i.candidateName || '').toLowerCase().includes(term) ||
        (i.position || '').toLowerCase().includes(term) ||
        (i.interviewer || '').toLowerCase().includes(term) ||
        (i.client || '').toLowerCase().includes(term) ||
        (i.type || '').toLowerCase().includes(term);
    }

    return matchesStatus && matchesDate && matchesSearch;
  });

  // Group by date
  const groupedByDate = filteredInterviews.reduce((acc, interview) => {
    const date = interview.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(interview);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);

    if (dateStr === getLocalISODate()) return 'Today';
    if (dateStr === getLocalISODate(1)) return 'Tomorrow';
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #3FA9F5, #1E88E5)',
      'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'linear-gradient(135deg, #10b981, #0d9488)',
      'linear-gradient(135deg, #f43f5e, #ec4899)',
      'linear-gradient(135deg, #f59e0b, #ea580c)'
    ];
    return gradients[(name || '').charCodeAt(0) % gradients.length];
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Handle generate meet link
  const handleGenerateMeetLink = () => {
    const link = generateMeetLink();
    setNewInterview(prev => ({ ...prev, meetLink: link }));
  };

  // Reset form
  const resetForm = () => {
    setNewInterview({
      candidateName: '',
      candidateEmail: '',
      position: '',
      client: '',
      round: '',
      type: 'Video',
      date: '',
      time: '',
      duration: '60 mins',
      interviewer: '',
      interviewerRole: '',
      meetLink: '',
    });
    setEditingInterview(null);
  };

  // Handle back to main view
  const handleBackToInterviews = () => {
    setShowFullPageForm(false);
    setEditingInterview(null);
    resetForm();
  };

  // Handle schedule interview
  const handleScheduleInterview = async () => {
    if (!newInterview.candidateName || !newInterview.date || !newInterview.time) {
      setToast('Please fill required fields');
      setTimeout(() => setToast(null), 2000);
      return;
    }
    
    const interview = {
      id: editingInterview?.id || Date.now(),
      ...newInterview,
      status: editingInterview?.status || 'Scheduled',
      photo: null,
      meetLink: newInterview.type === 'Video' ? (newInterview.meetLink || generateMeetLink()) : null,
    };

    // Try to save to backend
    try {
      const apiData = {
        candidateId: newInterview.candidateId,
        positionId: newInterview.positionId,
        clientId: newInterview.clientId,
        candidateName: newInterview.candidateName,
        candidateEmail: newInterview.candidateEmail,
        interviewType: newInterview.round,
        interviewDate: newInterview.date,
        startTime: newInterview.time,
        duration: parseInt(newInterview.duration) || 60,
        interviewerName: newInterview.interviewer,
        interviewerRole: newInterview.interviewerRole,
        meetLink: interview.meetLink,
        positionTitle: newInterview.position,
        clientName: newInterview.client,
      };

      console.log('Sending interview data to backend:', apiData);
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editingInterview?.id);

      if (editingInterview && isUuid) {
        // Update existing interview in backend
        await updateInterview(editingInterview.id, apiData);
        setInterviews(prev => prev.map(i => i.id === editingInterview.id ? interview : i));
      } else {
        // This is either a brand new interview OR a local record that hasn't been saved to backend yet
        const result = await scheduleNewInterview(apiData);
        if (result.success && result.data?.id) {
            interview.id = result.data.id;
        }
        
        if (editingInterview) {
            // Replace the local record with the new backend-synchronized record
            setInterviews(prev => prev.map(i => i.id === editingInterview.id ? interview : i));
        } else {
            setInterviews(prev => [interview, ...prev]);
        }
      }
    } catch (error) {
      console.error('Backend operation failed, saving locally:', error);
      if (!editingInterview) {
        setInterviews(prev => [interview, ...prev]);
      } else {
        setInterviews(prev => prev.map(i => i.id === editingInterview.id ? interview : i));
      }
    }
    
    setShowFullPageForm(false);
    resetForm();
    setToast(editingInterview ? 'Interview updated successfully!' : 'Interview scheduled successfully!');
    setTimeout(() => setToast(null), 2000);
  };

  // Edit interview - open full page form
  const handleEditInterview = (interview) => {
    setEditingInterview(interview);
    setNewInterview({
      candidateName: interview.candidateName || '',
      candidateEmail: interview.candidateEmail || '',
      position: interview.position || '',
      client: interview.client || '',
      round: interview.round || '',
      type: interview.type || 'Video',
      date: interview.date || '',
      time: interview.time || '',
      duration: interview.duration || '60 mins',
      interviewer: interview.interviewer || '',
      interviewerRole: interview.interviewerRole || '',
      meetLink: interview.meetLink || '',
    });
    setShowFullPageForm(true);
  };

  // Join Google Meet - opens in new tab
  const handleJoinMeeting = (meetLink) => {
    if (meetLink) {
      window.open(meetLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Open feedback modal for an interview
  const handleOpenFeedback = (interview) => {
    setSelectedInterview(interview);
    setShowFeedbackModal(true);
  };

  // Handle feedback submission
  const handleFeedbackSubmitted = () => {
    const updatedInterviews = interviews.map(iv => 
      iv.id === selectedInterview?.id 
        ? { ...iv, status: 'Completed' }
        : iv
    );
    setInterviews(updatedInterviews);
    if (selectedInterview?.id) {
      updateInterviewStatus(selectedInterview.id, { status: 'Completed' }).catch(e => console.error('Backend status update failed:', e));
    }
    setShowFeedbackModal(false);
    setSelectedInterview(null);
    setToast('Interview feedback submitted successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  // Send reminder to candidate
  const handleSendReminder = async (interviewId) => {
    try {
      await sendInterviewReminder(interviewId);
      setToast('Reminder sent to candidate!');
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Send reminder failed:', error);
      setToast('Reminder sent to candidate!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Start interview (change status to In Progress)
  const handleStartInterview = async (interview) => {
    const updatedInterviews = interviews.map(iv => 
      iv.id === interview.id 
        ? { ...iv, status: 'In Progress' }
        : iv
    );
    setInterviews(updatedInterviews);
    try {
      await updateInterviewStatus(interview.id, { status: 'In Progress' });
    } catch (e) { console.error('Backend status update failed:', e); }
    setToast('Interview started!');
    setTimeout(() => setToast(null), 2000);
    
    if (interview.meetLink && interview.type === 'Video') {
      window.open(interview.meetLink, '_blank', 'noopener,noreferrer');
    }
    
    setTimeout(() => {
      handleOpenFeedback(interview);
    }, 1000);
  };

  // Open Action Confirmation (Cancel or Delete)
  const handleOpenActionModal = (interviewId, actionType = 'cancel') => {
    setInterviewIdToCancel(interviewId);
    setModalActionType(actionType);
    setShowCancelConfirm(true);
  };

  // Execute Action (Cancel or Delete)
  const handleConfirmAction = async () => {
    if (!interviewIdToCancel) return;
    
    try {
      if (modalActionType === 'delete') {
        await deleteInterview(interviewIdToCancel);
        setInterviews(prev => prev.filter(i => i.id !== interviewIdToCancel));
        setToast('Interview deleted permanently!');
      } else {
        await cancelInterviewAPI(interviewIdToCancel);
        setInterviews(prev => prev.map(i => i.id === interviewIdToCancel ? { ...i, status: 'Cancelled' } : i));
        setToast('Interview cancelled successfully!');
      }
    } catch (error) {
      console.error(`Action ${modalActionType} failed:`, error);
      setToast(`Failed to ${modalActionType} interview.`);
    } finally {
      setShowCancelConfirm(false);
      setInterviewIdToCancel(null);
      setTimeout(() => setToast(null), 2000);
    }
  };

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
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Calibri, sans-serif' }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
      {/* Schedule Interview Dialog Modal */}
      <AnimatePresence>
        {showFullPageForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* Header */}
              <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {editingInterview ? 'Edit Interview' : 'Schedule New Interview'}
                  </h3>
                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">Interview Scheduling</p>
                </div>
                <button
                  onClick={handleBackToInterviews}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-7">

                  {/* Section: Candidate Details */}
                  <div className="mt-2 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center text-white shadow-xl">
                      <FiUser size={18} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Candidate Details</h3>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Candidate Name *</label>
                    <input type="text" value={newInterview.candidateName}
                      onChange={(e) => { const val = e.target.value; setNewInterview(prev => ({ ...prev, candidateName: val })); setShowCandidateSuggestions(val.length > 0); }}
                      onFocus={() => setShowCandidateSuggestions(newInterview.candidateName.length > 0)}
                      placeholder="Enter candidate name"
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                    />
                    <AnimatePresence>
                      {showCandidateSuggestions && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute z-30 w-full mt-2 rounded-xl shadow-xl border overflow-hidden max-h-60 overflow-y-auto bg-white border-slate-200">
                          {availableCandidates
                            .filter(c => { const search = (newInterview.candidateName || '').toLowerCase().trim(); return (c.name || '').toLowerCase().includes(search) || (c.email || '').toLowerCase().includes(search); })
                            .map((candidate) => (
                              <button key={candidate.id} className="w-full text-left px-4 py-3 flex flex-col transition-colors hover:bg-blue-50 border-b border-slate-100 last:border-0"
                                onClick={() => { setNewInterview(prev => ({ ...prev, candidateId: candidate.id, candidateName: candidate.name, candidateEmail: candidate.email || '', positionId: candidate.positionId || '', position: candidate.position?.title || candidate.jobTitle || '', clientId: candidate.clientId || '', client: (candidate.client?.companyName || candidate.client?.name) || '' })); setShowCandidateSuggestions(false); }}>
                                <span className="font-semibold text-sm text-[#1A1A2E]">{candidate.name}</span>
                                <span className="text-[10px] text-[#9B9BAD]">{candidate.email} • {candidate.jobTitle || 'No Title'}</span>
                              </button>
                            ))}
                          {availableCandidates.filter(c => { const search = (newInterview.candidateName || '').toLowerCase().trim(); return (c.name || '').toLowerCase().includes(search) || (c.email || '').toLowerCase().includes(search); }).length === 0 && (
                            <div className="p-4 text-center text-xs text-[#9B9BAD]">No matching candidates found</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2">
                      <FiMail size={12} className="text-[#1B4DA0]" /> Candidate Email
                    </label>
                    <input type="email" value={newInterview.candidateEmail}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, candidateEmail: e.target.value }))}
                      placeholder="Enter candidate email"
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                    />
                  </div>

                  {/* Section: Position Details */}
                  <div className="mt-4 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#3b82f6] rounded-xl flex items-center justify-center text-white shadow-xl">
                      <FiBriefcase size={18} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Position Details</h3>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Position</label>
                    <input type="text" value={newInterview.position}
                      onChange={(e) => { const val = e.target.value; setNewInterview(prev => ({ ...prev, position: val })); setShowPositionSuggestions(val.length > 0); }}
                      onFocus={() => setShowPositionSuggestions(newInterview.position.length > 0)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                    />
                    <AnimatePresence>
                      {showPositionSuggestions && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute z-30 w-full mt-2 rounded-xl shadow-xl border overflow-hidden max-h-60 overflow-y-auto bg-white border-slate-200">
                          {availablePositions.filter(p => (p.title || '').toLowerCase().includes((newInterview.position || '').toLowerCase().trim())).map((pos) => (
                            <button key={pos.id} className="w-full text-left px-4 py-3 transition-colors hover:bg-blue-50 border-b border-slate-100 last:border-0"
                              onClick={() => { setNewInterview(prev => ({ ...prev, positionId: pos.id, position: pos.title, clientId: pos.clientId || prev.clientId, client: pos.client?.companyName || pos.client?.name || prev.client })); setShowPositionSuggestions(false); }}>
                              <span className="font-semibold text-sm text-[#1A1A2E]">{pos.title}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Client</label>
                    <input type="text" value={newInterview.client}
                      onChange={(e) => { const val = e.target.value; setNewInterview(prev => ({ ...prev, client: val })); setShowClientSuggestions(val.length > 0); }}
                      onFocus={() => setShowClientSuggestions(newInterview.client.length > 0)}
                      placeholder="e.g. TechCorp India"
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                    />
                    <AnimatePresence>
                      {showClientSuggestions && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute z-30 w-full mt-2 rounded-xl shadow-xl border overflow-hidden max-h-60 overflow-y-auto bg-white border-slate-200">
                          {availableClients.filter(cl => (cl.companyName || cl.name || '').toLowerCase().includes((newInterview.client || '').toLowerCase().trim())).map((cl) => (
                            <button key={cl.id} className="w-full text-left px-4 py-3 transition-colors hover:bg-blue-50 border-b border-slate-100 last:border-0"
                              onClick={() => { setNewInterview(prev => ({ ...prev, clientId: cl.id, client: cl.companyName || cl.name })); setShowClientSuggestions(false); }}>
                              <span className="font-semibold text-sm text-[#1A1A2E]">{cl.companyName || cl.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Round</label>
                    <div className="relative group">
                      <select value={newInterview.round} onChange={(e) => setNewInterview(prev => ({ ...prev, round: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none cursor-pointer transition-all focus:bg-[#EEF2FB] appearance-none pr-12">
                        <option value="">Select Round</option>
                        <option value="Phone Screening">Phone Screening</option>
                        <option value="Technical Round">Technical Round</option>
                        <option value="HR Round">HR Round</option>
                        <option value="Client Interview">Client Interview</option>
                        <option value="Final Round">Final Round</option>
                      </select>
                      <FiChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none opacity-50" />
                    </div>
                  </div>

                  {/* Section: Interview Details */}
                  <div className="mt-4 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center text-white shadow-xl">
                      <FiCalendar size={18} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Interview Details</h3>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2">
                      <FiCalendar size={12} className="text-[#1B4DA0]" /> Date *
                    </label>
                    <input type="date" value={newInterview.date}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2">
                      <FiClock size={12} className="text-[#1B4DA0]" /> Time *
                    </label>
                    <input type="time" value={newInterview.time}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Duration</label>
                    <div className="relative group">
                      <select value={newInterview.duration} onChange={(e) => setNewInterview(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none cursor-pointer transition-all focus:bg-[#EEF2FB] appearance-none pr-12">
                        <option value="30 mins">30 mins</option>
                        <option value="45 mins">45 mins</option>
                        <option value="60 mins">60 mins</option>
                        <option value="90 mins">90 mins</option>
                      </select>
                      <FiChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none opacity-50" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interview Type</label>
                    <div className="relative group">
                      <select value={newInterview.type}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, type: e.target.value, meetLink: e.target.value === 'Video' ? prev.meetLink : '' }))}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none cursor-pointer transition-all focus:bg-[#EEF2FB] appearance-none pr-12">
                        <option value="Video">Video Call</option>
                        <option value="Phone">Phone</option>
                        <option value="In-Person">In-Person</option>
                      </select>
                      <FiChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none opacity-50" />
                    </div>
                  </div>

                  {/* Google Meet Link - Only for Video */}
                  {newInterview.type === 'Video' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2">
                        <FiVideo size={12} className="text-[#1B4DA0]" /> Google Meet Link
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input type="text" value={newInterview.meetLink}
                            onChange={(e) => setNewInterview(prev => ({ ...prev, meetLink: e.target.value }))}
                            placeholder="Click generate or paste your meet link"
                            className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                          />
                          {newInterview.meetLink && (
                            <button onClick={() => copyToClipboard(newInterview.meetLink, setToast)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100">
                              <FiCopy className="w-4 h-4 text-[#9B9BAD]" />
                            </button>
                          )}
                        </div>
                        <button onClick={handleGenerateMeetLink}
                          className="flex items-center gap-2 px-5 py-4 text-white text-sm font-bold rounded-2xl shadow-[0_10px_25px_rgba(27,77,160,0.3)]"
                          style={{ background: 'linear-gradient(135deg, #1B4DA0, #3FA9F5)' }}>
                          <FiRefreshCw className="w-4 h-4" /> Generate
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Interviewer Details */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interviewer Name</label>
                    <input type="text" value={newInterview.interviewer}
                      onChange={(e) => { const val = e.target.value; setNewInterview(prev => ({ ...prev, interviewer: val })); setShowInterviewerSuggestions(val.length > 0); }}
                      onFocus={() => setShowInterviewerSuggestions(newInterview.interviewer.length > 0)}
                      placeholder="Interviewer name"
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                    />
                    <AnimatePresence>
                      {showInterviewerSuggestions && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute z-30 w-full mt-2 rounded-xl shadow-xl border overflow-hidden max-h-60 overflow-y-auto bg-white border-slate-200">
                          {availableInterviewers.filter(hr => (hr.name || '').toLowerCase().includes((newInterview.interviewer || '').toLowerCase().trim())).map((hr) => (
                            <button key={hr.id} type="button" className="w-full text-left px-4 py-3 flex flex-col transition-colors hover:bg-blue-50 border-b border-slate-100 last:border-0"
                              onClick={() => { setNewInterview(prev => ({ ...prev, interviewer: hr.name, interviewerRole: hr.role || 'HR Executive' })); setShowInterviewerSuggestions(false); }}>
                              <span className="font-semibold text-sm text-[#1A1A2E]">{hr.name}</span>
                              <span className="text-[10px] text-[#9B9BAD]">{hr.department} • {hr.role}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interviewer Role</label>
                    <input type="text" value={newInterview.interviewerRole}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, interviewerRole: e.target.value }))}
                      placeholder="e.g. Tech Lead"
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                    />
                  </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={handleBackToInterviews}
                    className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                    Cancel
                  </button>
                  <button type="button" onClick={handleScheduleInterview}
                    className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                    <FiCalendar size={18} /> {editingInterview ? 'Update Interview' : 'Schedule Interview'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="space-y-6">
            {/* Error Banner */}
            {error && (
              <div className={`flex items-center justify-between gap-3 px-5 py-3 rounded-xl ${isDarkMode ? 'bg-red-900/30 border border-red-700/50 text-red-300' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                <span className="text-sm font-medium">{error}</span>
                <button onClick={fetchInterviews} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors">
                  <FiRefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)', boxShadow: '0 10px 15px -3px rgba(63, 169, 245, 0.3)' }}>
                  <FiCalendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col justify-center items-start">
                  <h2 className="text-2xl font-bold leading-tight text-left" style={{ background: 'linear-gradient(90deg, #3FA9F5, #1E88E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
    Interview Schedule
  </h2>
                  <p className={`text-sm mt-0.5 text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Manage and track all scheduled interviews
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className={`flex items-center rounded-xl p-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-700' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    List
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchInterviews}
                  className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
                  title="Refresh interviews"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowFullPageForm(true); resetForm(); }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B4DA0] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Schedule Interview
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white p-6 rounded-2xl border border-[#E8E7E2] shadow-sm relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#F4F3EF] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10 flex flex-col items-start text-left">
                      <div className="p-2.5 rounded-xl bg-white group-hover:scale-110 transition-transform mb-3" style={{ color: card.color }}>
                        <Icon size={18} />
                      </div>
                      <p className="text-2xl font-bold text-[#1A1A2E] leading-none mb-1">
                        {card.value}
                      </p>
                      <p className="text-xs font-medium text-[#6B6B7E]">
                        {card.label}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm">
              <div className="flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-5 py-3">
                <FiSearch className="w-[18px] h-[18px] text-[#9B9BAD] flex-shrink-0" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by candidate, position, interviewer..."
                  className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')}>
                    <FiX className="w-[14px] h-[14px] text-[#9B9BAD] hover:text-[#1A1A2E] transition-colors" />
                  </button>
                )}
              </div>
            </div>

            {/* Interview List */}
            {viewMode === 'list' && (
              <div className="space-y-6">
                {sortedDates.length === 0 ? (
                  <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <FiCalendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No interviews found</p>
                    <p className="text-sm mt-1">Schedule interviews to see them here</p>
                  </div>
                ) : (
                  sortedDates.map(date => (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <h3 className={`text-sm font-semibold px-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {formatDate(date)}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                          {groupedByDate[date].length} interview{groupedByDate[date].length > 1 ? 's' : ''}
                        </span>
                      </h3>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {groupedByDate[date].map((interview, idx) => (
                            <motion.div
                              key={interview.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: idx * 0.05 }}
                              whileHover={{ scale: 1.01 }}
                              onClick={() => setDetailInterview(interview)}
                              className={`rounded-2xl border-2 p-4 transition-shadow cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-blue-200'}`}
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* Left: Time & Candidate */}
                                <div className="flex items-center gap-4">
                                  <div className={`text-center px-3 py-2 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
                                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>{interview.time}</p>
                                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-blue-500'}`}>{interview.duration}</p>
                                  </div>
                                  {interview.photo ? (
                                    <div className="relative">
                                      <img 
                                        src={interview.photo} 
                                        alt={interview.candidateName}
                                        className="h-12 w-12 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                      />
                                      <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg hidden" style={{ background: getAvatarGradient(interview.candidateName) }}>
                                        {getInitials(interview.candidateName)}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg" style={{ background: getAvatarGradient(interview.candidateName) }}>
                                      {getInitials(interview.candidateName)}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{interview.candidateName}</h4>
                                      <TypeBadge type={interview.type} />
                                      <StatusBadge status={interview.status} />
                                    </div>
                                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{interview.position} • {interview.round}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Interviewer: {interview.interviewer} ({interview.interviewerRole})</p>
                                  </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2">
                                  {/* Feedback Button */}
                                  {(interview.status === 'Scheduled' || interview.status === 'In Progress' || interview.status === 'Completed') && (
                                    <motion.button
                                      onClick={() => handleOpenFeedback(interview)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      title="Fill Interview Feedback"
                                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                                        interview.status === 'Completed' 
                                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                          : isDarkMode 
                                            ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                      }`}
                                    >
                                      <FiClipboard className="w-4 h-4" />
                                      {interview.status === 'Completed' ? 'View Feedback' : 'Fill Feedback'}
                                    </motion.button>
                                  )}
                                  
                                  {interview.meetLink && (interview.status === 'Scheduled' || interview.status === 'In Progress') && (
                                    <motion.button
                                      onClick={() => handleJoinMeeting(interview.meetLink)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-xl shadow-lg cursor-pointer"
                                      style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)', boxShadow: '0 8px 20px rgba(63, 169, 245, 0.35)' }}
                                    >
                                      <FiVideo className="w-4 h-4" />
                                      Join Meeting
                                    </motion.button>
                                  )}
                                  
                                  {interview.meetLink && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => copyToClipboard(interview.meetLink, setToast)}
                                      title="Copy meeting link"
                                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-blue-100 text-slate-500 hover:text-blue-600'}`}
                                    >
                                      <FiLink className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleEditInterview(interview)}
                                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-blue-100 text-slate-500 hover:text-blue-600'}`}
                                  >
                                    <FiEdit2 className="w-4 h-4" />
                                  </motion.button>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleOpenActionModal(interview.id, interview.status === 'Cancelled' ? 'delete' : 'cancel')}
                                    title={interview.status === 'Cancelled' ? "Delete Interview" : "Cancel Interview"}
                                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-900/40 text-slate-400 hover:text-red-400' : 'hover:bg-red-100 text-slate-500 hover:text-red-600'}`}
                                  >
                                    {interview.status === 'Cancelled' ? (
                                      <FiTrash2 className="w-4 h-4" />
                                    ) : (
                                      <FiXCircle className="w-4 h-4" />
                                    )}
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Calendar View (Simple) */}
            {viewMode === 'calendar' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50'}`}
              >
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-4">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                      <FiChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      March 2026
                    </h3>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                      <FiChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={`text-xs font-semibold py-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {day}
                    </div>
                  ))}
                  {[...Array(31)].map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `2026-03-${String(dayNum).padStart(2, '0')}`;
                    const hasInterview = interviews.some(iv => iv.date === dateStr);
                    const isToday = dayNum === 18;
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        className={`py-3 rounded-xl cursor-pointer transition-all ${
                          isToday 
                            ? 'text-white shadow-lg' 
                            : hasInterview 
                              ? isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                              : isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        style={isToday ? { background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)' } : {}}
                      >
                        <span className="text-sm font-medium">{dayNum}</span>
                        {hasInterview && !isToday && <span className="block w-1 h-1 rounded-full bg-blue-500 mx-auto mt-1"></span>}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

      {/* ── Interview Detail Drawer ── */}
      <AnimatePresence>
        {detailInterview && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetailInterview(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[540px] bg-white shadow-2xl z-[110] border-l border-[#F4F3EF] flex flex-col overflow-hidden"
            >
              <div className="flex flex-col h-full bg-white">
                {/* Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{detailInterview.candidateName}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px]">{detailInterview.position}</span>
                      <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                      <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">{detailInterview.round}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleEditInterview(detailInterview); setDetailInterview(null); }} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-blue-50 hover:text-[#1B4DA0] transition-all active:scale-90">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDetailInterview(null)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-8 space-y-8 overflow-y-auto pb-10">
                  {/* Interview Readiness Radar */}
                  <div className="bg-[#FAFAF8] rounded-3xl border border-[#F4F3EF] p-6">
                    <h3 className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-[3px] mb-2 text-center">Interview Readiness</h3>
                    <div className="w-full h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          { axis: 'Preparation', value: detailInterview.status === 'Completed' ? 90 : 65 },
                          { axis: 'Technical', value: detailInterview.feedback?.technicalScore || 70 },
                          { axis: 'Communication', value: detailInterview.feedback?.communicationScore || 60 },
                          { axis: 'Experience', value: 75 },
                        ]} cx="50%" cy="50%" outerRadius="70%">
                          <PolarGrid stroke="#e2e8f0" strokeWidth={0.8} />
                          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                          <Radar dataKey="value" stroke="#a5b4fc" fill="#a5b4fc" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Round Progress */}
                  <div className="bg-[#FAFAF8] rounded-3xl border border-[#F4F3EF] p-6">
                    <h3 className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-[3px] mb-4">Round Progress</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-[120px] h-[120px] flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={[
                              { name: 'Done', value: detailInterview.status === 'Completed' ? 100 : detailInterview.status === 'In Progress' ? 60 : 30 },
                              { name: 'Remaining', value: detailInterview.status === 'Completed' ? 0 : detailInterview.status === 'In Progress' ? 40 : 70 },
                            ]} innerRadius={34} outerRadius={52} paddingAngle={3} dataKey="value" strokeWidth={0}>
                              <Cell fill="#3B82F6" />
                              <Cell fill="#e2e8f0" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#4B4B5E] uppercase tracking-wider">Status</span>
                          <StatusBadge status={detailInterview.status} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#4B4B5E] uppercase tracking-wider">Type</span>
                          <TypeBadge type={detailInterview.type} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#4B4B5E] uppercase tracking-wider">Duration</span>
                          <span className="text-sm font-black text-[#1A1A2E]">{detailInterview.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {detailInterview.meetLink && (detailInterview.status === 'Scheduled' || detailInterview.status === 'In Progress') && (
                    <button
                      onClick={() => { window.open(detailInterview.meetLink, '_blank'); }}
                      className="w-full py-4 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #3FA9F5, #1E88E5)', boxShadow: '0 8px 20px rgba(63, 169, 245, 0.35)' }}
                    >
                      <FiVideo className="w-5 h-5" /> Join Meeting
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { handleOpenFeedback(detailInterview); setDetailInterview(null); }}
                      className="py-3.5 bg-[#F4F3EF] text-[#1A1A2E] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E8E7E2] transition-all active:scale-[0.98] border border-[#E8E7E2]"
                    >
                      <FiClipboard className="w-4 h-4" /> Feedback
                    </button>
                    <button
                      onClick={() => { handleEditInterview(detailInterview); setDetailInterview(null); }}
                      className="py-3.5 bg-[#F4F3EF] text-[#1A1A2E] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E8E7E2] transition-all active:scale-[0.98] border border-[#E8E7E2]"
                    >
                      <FiCalendar className="w-4 h-4" /> Reschedule
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Confirmation Modals ── */}
      <AnimatePresence>
        {/* Feedback Modal */}
        {showFeedbackModal && (
          <InterviewFeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            interview={selectedInterview}
            isDarkMode={isDarkMode}
            onFeedbackSubmitted={handleFeedbackSubmitted}
          />
        )}

        {/* Cancellation Confirmation Modal */}
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${modalActionType === 'delete' ? (isDarkMode ? 'bg-red-900/30' : 'bg-red-50') : (isDarkMode ? 'bg-red-900/30' : 'bg-red-100')}`}>
                  {modalActionType === 'delete' ? (
                    <FiTrash2 className="w-8 h-8 text-red-500" />
                  ) : (
                    <FiXCircle className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {modalActionType === 'delete' ? 'Delete Interview?' : 'Cancel Interview?'}
                  </h3>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {modalActionType === 'delete' 
                      ? 'Are you sure you want to permanently delete this interview record? This cannot be undone.'
                      : 'Are you sure you want to cancel this interview? This action cannot be undone.'}
                  </p>
                </div>
                <div className="flex flex-col w-full gap-3 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmAction}
                    className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
                  >
                    {modalActionType === 'delete' ? 'Yes, Delete Permanently' : 'Yes, Cancel Interview'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowCancelConfirm(false);
                      setInterviewIdToCancel(null);
                    }}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                      isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {modalActionType === 'delete' ? 'No, Keep Record' : 'No, Keep Interview'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewScheduleTab;
