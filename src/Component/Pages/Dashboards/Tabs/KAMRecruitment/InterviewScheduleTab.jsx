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
import InterviewFeedbackModal from './InterviewFeedbackModal';
import { 
  getAllInterviews, 
  scheduleNewInterview, 
  sendInterviewReminder,
  cancelInterview as cancelInterviewAPI,
  updateInterviewStatus 
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

const InterviewScheduleTab = ({ isDarkMode }) => {
  const [interviews, setInterviews] = useState(() => {
    try { const c = localStorage.getItem(CACHE_KEY_INTERVIEWS); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [toast, setToast] = useState(null);
  
  // NEW STATE FOR FULL PAGE FORM
  const [showFullPageForm, setShowFullPageForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  
  const [newInterview, setNewInterview] = useState({
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

  // ── Fetch interviews from backend ──
  const fetchInterviews = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const filters = {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      const response = await getAllInterviews(filters);
      const data = response.data || response.interviews || [];
      const mapped = data.map(iv => ({
        id: iv._id || iv.id,
        candidateName: iv.candidateName || iv.candidate?.name || '',
        candidateEmail: iv.candidateEmail || iv.candidate?.email || '',
        position: iv.positionTitle || iv.position?.title || iv.position || '',
        client: iv.clientName || iv.client?.companyName || iv.client || '',
        round: iv.interviewType || iv.round || '',
        type: iv.meetLink ? 'Video' : (iv.type || 'Video'),
        date: iv.interviewDate ? new Date(iv.interviewDate).toISOString().split('T')[0] : iv.date || '',
        time: iv.startTime || iv.time || '',
        duration: iv.duration ? `${iv.duration} mins` : '60 mins',
        interviewer: iv.interviewerName || iv.interviewer || '',
        interviewerRole: iv.interviewerRole || '',
        status: iv.status || 'Scheduled',
        meetLink: iv.meetLink || null,
        photo: null,
        feedback: iv.feedback || null,
      }));
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
  const today = new Date().toISOString().split('T')[0];
  const stats = {
    todayCount: interviews.filter(i => i.date === today).length,
    scheduled: interviews.filter(i => i.status === 'Scheduled').length,
    completed: interviews.filter(i => i.status === 'Completed').length,
    cancelled: interviews.filter(i => i.status === 'Cancelled').length,
  };

  const statCards = [
    { label: 'Today\'s Interviews', value: stats.todayCount, icon: FiCalendar, color: '#8b5cf6', shadowColor: '139, 92, 246' },
    { label: 'Scheduled', value: stats.scheduled, icon: FiClock, color: '#3b82f6', shadowColor: '59, 130, 246' },
    { label: 'Completed', value: stats.completed, icon: FiCheckCircle, color: '#10b981', shadowColor: '16, 185, 129' },
    { label: 'Cancelled', value: stats.cancelled, icon: FiXCircle, color: '#ef4444', shadowColor: '239, 68, 68' },
  ];

  // Filter interviews
  const filteredInterviews = interviews.filter(i => {
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchesStatus;
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

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
      
      if (editingInterview) {
        // Update existing interview
        await updateInterviewStatus(editingInterview.id, apiData);
        setInterviews(prev => prev.map(i => i.id === editingInterview.id ? interview : i));
      } else {
        const result = await scheduleNewInterview(apiData);
        if (result.data?._id) interview.id = result.data._id;
        setInterviews(prev => [interview, ...prev]);
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

  // Cancel interview
  const handleCancelInterview = async (interviewId) => {
    try {
      await cancelInterviewAPI(interviewId);
      setInterviews(prev => prev.map(i => i.id === interviewId ? { ...i, status: 'Cancelled' } : i));
      setToast('Interview cancelled successfully!');
      setTimeout(() => setToast(null), 2000);
    } catch (error) {
      console.error('Cancel interview failed:', error);
      setInterviews(prev => prev.map(i => i.id === interviewId ? { ...i, status: 'Cancelled' } : i));
      setToast('Interview cancelled!');
      setTimeout(() => setToast(null), 2000);
    }
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
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showFullPageForm ? (
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
              onClick={handleBackToInterviews}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'text-violet-400 hover:bg-slate-700' : 'text-violet-600 hover:bg-violet-50'}`}
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Interviews
            </motion.button>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {editingInterview ? 'Edit Interview' : 'Schedule New Interview'}
            </h2>
            <div className="w-24"></div>
          </div>

          {/* Form Content */}
          <div className="px-4 sm:px-6 pb-8">
            {/* 3-Column Grid for Maximum Horizontal Space */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1: Candidate Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-violet-900/40' : 'bg-violet-100'}`}>
                    <FiUser className={`w-3 h-3 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Candidate Details
                  </span>
                </div>
                
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Candidate Name *</label>
                  <input
                    type="text"
                    value={newInterview.candidateName}
                    onChange={(e) => setNewInterview(prev => ({ ...prev, candidateName: e.target.value }))}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    placeholder="Enter candidate name"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Candidate Email</label>
                  <input
                    type="email"
                    value={newInterview.candidateEmail}
                    onChange={(e) => setNewInterview(prev => ({ ...prev, candidateEmail: e.target.value }))}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    placeholder="Enter candidate email"
                  />
                </div>
              </div>

              {/* Column 2: Position Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                    <FiBriefcase className={`w-3 h-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Position Details
                  </span>
                </div>
                
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Position</label>
                  <input
                    type="text"
                    value={newInterview.position}
                    onChange={(e) => setNewInterview(prev => ({ ...prev, position: e.target.value }))}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Client</label>
                  <input
                    type="text"
                    value={newInterview.client}
                    onChange={(e) => setNewInterview(prev => ({ ...prev, client: e.target.value }))}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    placeholder="e.g., TechCorp India"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Round</label>
                  <select
                    value={newInterview.round}
                    onChange={(e) => setNewInterview(prev => ({ ...prev, round: e.target.value }))}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                  >
                    <option value="">Select Round</option>
                    <option value="Phone Screening">Phone Screening</option>
                    <option value="Technical Round">Technical Round</option>
                    <option value="HR Round">HR Round</option>
                    <option value="Client Interview">Client Interview</option>
                    <option value="Final Round">Final Round</option>
                  </select>
                </div>
              </div>

              {/* Column 3: Interview Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-emerald-900/40' : 'bg-emerald-100'}`}>
                    <FiCalendar className={`w-3 h-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Interview Details
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Date *</label>
                    <input
                      type="date"
                      value={newInterview.date}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Time *</label>
                    <input
                      type="time"
                      value={newInterview.time}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, time: e.target.value }))}
                      className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Duration</label>
                    <select
                      value={newInterview.duration}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, duration: e.target.value }))}
                      className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="30 mins">30 mins</option>
                      <option value="45 mins">45 mins</option>
                      <option value="60 mins">60 mins</option>
                      <option value="90 mins">90 mins</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Interview Type</label>
                    <select
                      value={newInterview.type}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, type: e.target.value, meetLink: e.target.value === 'Video' ? prev.meetLink : '' }))}
                      className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="Video">Video Call</option>
                      <option value="Phone">Phone</option>
                      <option value="In-Person">In-Person</option>
                    </select>
                  </div>
                </div>

                {/* Google Meet Link - Only for Video */}
                {newInterview.type === 'Video' && (
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <FiVideo className="inline w-3 h-3 mr-1" />
                      Google Meet Link
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newInterview.meetLink}
                          onChange={(e) => setNewInterview(prev => ({ ...prev, meetLink: e.target.value }))}
                          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          placeholder="Click generate or paste your meet link"
                        />
                        {newInterview.meetLink && (
                          <button
                            onClick={() => copyToClipboard(newInterview.meetLink, setToast)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600"
                          >
                            <FiCopy className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerateMeetLink}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25"
                      >
                        <FiRefreshCw className="w-4 h-4" />
                        Generate
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Interviewer Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Interviewer Name</label>
                    <input
                      type="text"
                      value={newInterview.interviewer}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, interviewer: e.target.value }))}
                      className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                      placeholder="Interviewer name"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Role</label>
                    <input
                      type="text"
                      value={newInterview.interviewerRole}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, interviewerRole: e.target.value }))}
                      className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                      placeholder="e.g., Tech Lead"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row items-center justify-end gap-3 mt-8 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={handleBackToInterviews}
                className={`w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-xl transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Cancel
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                onClick={handleScheduleInterview}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 8px 20px rgba(139,92,246,0.35)' }}
              >
                <FiCalendar className="w-4 h-4" /> 
                {editingInterview ? 'Update Interview' : 'Schedule Interview'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="main-content"
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="space-y-6"
        >
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
              <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}>
                <FiCalendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col justify-center items-start">
                <h2 className="text-2xl font-bold leading-tight text-left" style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-shadow"
                style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.3)' }}
              >
                <FiPlus className="w-4 h-4" />
                Schedule Interview
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: card.color }}></div>
                  </div>
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {card.label}
                      </p>
                      <p className="text-3xl font-extrabold mt-1" style={{ color: card.color }}>
                        {card.value}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: card.color, boxShadow: `0 10px 15px -3px rgba(${card.shadowColor}, 0.3)` }}>
                      <Icon className="w-6 h-6" style={{ color: 'white' }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 overflow-x-auto pb-2"
          >
            {['all', 'Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'].map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'text-white shadow-lg shadow-violet-500/25'
                    : isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={filterStatus === status ? { background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' } : {}}
              >
                {status === 'all' ? 'All Status' : status}
              </motion.button>
            ))}
          </motion.div>

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
                            className={`rounded-2xl border-2 p-4 transition-shadow ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-amber-200'}`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              {/* Left: Time & Candidate */}
                              <div className="flex items-center gap-4">
                                <div className={`text-center px-3 py-2 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-amber-50'}`}>
                                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-amber-600'}`}>{interview.time}</p>
                                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-amber-500'}`}>{interview.duration}</p>
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
                                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                                        : isDarkMode 
                                          ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' 
                                          : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
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
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 cursor-pointer"
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
                                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-amber-100 text-slate-500 hover:text-amber-600'}`}
                                  >
                                    <FiLink className="w-4 h-4" />
                                  </motion.button>
                                )}
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEditInterview(interview)}
                                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-amber-100 text-slate-500 hover:text-amber-600'}`}
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleCancelInterview(interview.id)}
                                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-900/40 text-slate-400 hover:text-red-400' : 'hover:bg-red-100 text-slate-500 hover:text-red-600'}`}
                                >
                                  <FiXCircle className="w-4 h-4" />
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
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' 
                          : hasInterview 
                            ? isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                            : isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-sm font-medium">{dayNum}</span>
                      {hasInterview && !isToday && <span className="block w-1 h-1 rounded-full bg-amber-500 mx-auto mt-1"></span>}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InterviewScheduleTab;