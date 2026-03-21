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
} from 'react-icons/fi';
import InterviewFeedbackModal from './InterviewFeedbackModal';
import { 
  getAllInterviews, 
  scheduleNewInterview, 
  sendInterviewReminder,
  cancelInterview as cancelInterviewAPI,
  updateInterviewStatus 
} from '../service/api';

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
  // Format: xxx-xxxx-xxx (Google Meet style)
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
const InterviewScheduleTab = ({ isDarkMode }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [toast, setToast] = useState(null);
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

  // Mock data
  useEffect(() => {
    const mockInterviews = [
      { id: 1, candidateName: 'Rahul Sharma', candidateEmail: 'rahul.sharma@email.com', position: 'Senior Software Engineer', client: 'TechCorp India', round: 'Technical Round', type: 'Video', date: '2026-03-18', time: '10:00 AM', duration: '60 mins', interviewer: 'John Doe', interviewerRole: 'Tech Lead', status: 'Scheduled', meetLink: 'https://meet.google.com/new', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, candidateName: 'Priya Singh', candidateEmail: 'priya.singh@email.com', position: 'Product Manager', client: 'StartupXYZ', round: 'Client Interview', type: 'Video', date: '2026-03-18', time: '02:00 PM', duration: '45 mins', interviewer: 'Sarah Smith', interviewerRole: 'Hiring Manager', status: 'Scheduled', meetLink: 'https://meet.google.com/new', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, candidateName: 'Amit Kumar', candidateEmail: 'amit.kumar@email.com', position: 'UI/UX Designer', client: 'DesignHub', round: 'Phone Screening', type: 'Phone', date: '2026-03-18', time: '11:30 AM', duration: '30 mins', interviewer: 'Mike Brown', interviewerRole: 'HR Manager', status: 'In Progress', meetLink: null, photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 4, candidateName: 'Sneha Patel', candidateEmail: 'sneha.patel@email.com', position: 'Senior Software Engineer', client: 'TechCorp India', round: 'HR Round', type: 'In-Person', date: '2026-03-19', time: '03:00 PM', duration: '45 mins', interviewer: 'Lisa Johnson', interviewerRole: 'HR Head', status: 'Scheduled', meetLink: null, photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 5, candidateName: 'Vikram Rao', candidateEmail: 'vikram.rao@email.com', position: 'DevOps Engineer', client: 'CloudScale', round: 'Technical Round', type: 'Video', date: '2026-03-17', time: '04:00 PM', duration: '60 mins', interviewer: 'David Lee', interviewerRole: 'DevOps Manager', status: 'Completed', meetLink: 'https://meet.google.com/new', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { id: 6, candidateName: 'Anjali Gupta', candidateEmail: 'anjali.gupta@email.com', position: 'Product Manager', client: 'StartupXYZ', round: 'Technical Round', type: 'Video', date: '2026-03-16', time: '10:00 AM', duration: '45 mins', interviewer: 'Tom Wilson', interviewerRole: 'CTO', status: 'Cancelled', meetLink: null, photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
    ];
    setTimeout(() => {
      setInterviews(mockInterviews);
      setLoading(false);
    }, 600);
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

  // Handle schedule interview
  const handleScheduleInterview = () => {
    if (!newInterview.candidateName || !newInterview.date || !newInterview.time) {
      setToast('Please fill required fields');
      setTimeout(() => setToast(null), 2000);
      return;
    }
    
    const interview = {
      id: Date.now(),
      ...newInterview,
      status: 'Scheduled',
      photo: null,
      meetLink: newInterview.type === 'Video' ? (newInterview.meetLink || generateMeetLink()) : null,
    };
    
    setInterviews(prev => [interview, ...prev]);
    setShowScheduleModal(false);
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
    setToast('Interview scheduled successfully!');
    setTimeout(() => setToast(null), 2000);
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
    // Refresh interviews or update local state
    const updatedInterviews = interviews.map(iv => 
      iv.id === selectedInterview?.id 
        ? { ...iv, status: 'Completed' }
        : iv
    );
    setInterviews(updatedInterviews);
    setShowFeedbackModal(false);
    setSelectedInterview(null);
    setToast('Interview feedback submitted successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  // Send reminder to candidate
  const handleSendReminder = async (interviewId) => {
    try {
      // In real implementation, call API
      // await sendInterviewReminder(interviewId);
      setToast('Reminder sent to candidate!');
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast('Failed to send reminder');
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Start interview (change status to In Progress)
  const handleStartInterview = (interview) => {
    const updatedInterviews = interviews.map(iv => 
      iv.id === interview.id 
        ? { ...iv, status: 'In Progress' }
        : iv
    );
    setInterviews(updatedInterviews);
    setToast('Interview started!');
    setTimeout(() => setToast(null), 2000);
    
    // Open meeting link if video interview
    if (interview.meetLink && interview.type === 'Video') {
      window.open(interview.meetLink, '_blank', 'noopener,noreferrer');
    }
    
    // Automatically open feedback form after starting
    setTimeout(() => {
      handleOpenFeedback(interview);
    }, 1000);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.25)' }}>
            <FiCalendar className="w-6 h-6" style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(90deg, #d97706, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Interview Schedule
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
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
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-slate-700' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Calendar
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-shadow"
            style={{ background: 'linear-gradient(90deg, #f59e0b, #ea580c)', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.25)' }}
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
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                : isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
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
                            {/* Feedback Button - Show for Scheduled/In Progress/Completed */}
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
                              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-amber-100 text-slate-500 hover:text-amber-600'}`}
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
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
            {/* Calendar days - simplified */}
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

      {/* Schedule Interview Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}
            >
              {/* Modal Header */}
              <div className={`sticky top-0 flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600">
                    <FiCalendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Schedule Interview</h2>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5">
                {/* Candidate Details */}
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Candidate Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Candidate Name *</label>
                      <input
                        type="text"
                        value={newInterview.candidateName}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, candidateName: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
                      <input
                        type="email"
                        value={newInterview.candidateEmail}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, candidateEmail: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                </div>

                {/* Position Details */}
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Position Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Position</label>
                      <input
                        type="text"
                        value={newInterview.position}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, position: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Client</label>
                      <input
                        type="text"
                        value={newInterview.client}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, client: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                        placeholder="e.g., TechCorp India"
                      />
                    </div>
                  </div>
                </div>

                {/* Interview Details */}
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Interview Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Date *</label>
                      <input
                        type="date"
                        value={newInterview.date}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Time *</label>
                      <input
                        type="time"
                        value={newInterview.time}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, time: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Duration</label>
                      <select
                        value={newInterview.duration}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, duration: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="30 mins">30 mins</option>
                        <option value="45 mins">45 mins</option>
                        <option value="60 mins">60 mins</option>
                        <option value="90 mins">90 mins</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Round</label>
                      <select
                        value={newInterview.round}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, round: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="">Select Round</option>
                        <option value="Phone Screening">Phone Screening</option>
                        <option value="Technical Round">Technical Round</option>
                        <option value="HR Round">HR Round</option>
                        <option value="Client Interview">Client Interview</option>
                        <option value="Final Round">Final Round</option>
                      </select>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Interview Type</label>
                      <select
                        value={newInterview.type}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, type: e.target.value, meetLink: e.target.value === 'Video' ? newInterview.meetLink : '' }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="Video">Video Call</option>
                        <option value="Phone">Phone</option>
                        <option value="In-Person">In-Person</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Google Meet Link - Only for Video */}
                {newInterview.type === 'Video' && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <FiVideo className="inline w-4 h-4 mr-2" />
                      Google Meet Link
                    </h3>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newInterview.meetLink}
                          onChange={(e) => setNewInterview(prev => ({ ...prev, meetLink: e.target.value }))}
                          className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
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
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      A unique Google Meet link will be generated and shared with the candidate.
                    </p>
                  </div>
                )}

                {/* Interviewer Details */}
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Interviewer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Interviewer Name</label>
                      <input
                        type="text"
                        value={newInterview.interviewer}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, interviewer: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                        placeholder="Enter interviewer name"
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Role</label>
                      <input
                        type="text"
                        value={newInterview.interviewerRole}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, interviewerRole: e.target.value }))}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border-2 transition-all focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                        placeholder="e.g., Tech Lead"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-5 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScheduleInterview}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl shadow-lg shadow-amber-500/25"
                >
                  <FiCalendar className="w-4 h-4" />
                  Schedule Interview
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/25 font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interview Feedback Modal */}
      <InterviewFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedInterview(null);
        }}
        interview={selectedInterview}
        isDarkMode={isDarkMode}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </motion.div>
  );
};

export default InterviewScheduleTab;
