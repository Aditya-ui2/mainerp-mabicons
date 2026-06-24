import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from "react-dom";
import {
  FiCalendar,
  FiClock,
  FiVideo,
  FiMapPin,
  FiUserPlus,
  FiMoreVertical,
  FiX,
  FiRefreshCw,
  FiPlus,
  FiLink,
  FiUsers,
  FiCheckCircle,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiChevronDown,
  FiAlertCircle
} from 'react-icons/fi';
import {
  getClientMeetings,
  createClientMeeting,
  seedClientMeetings,
  updateMeetingStatus,
  deleteMeeting,
  getAllClients,
  getClientReviews
} from '../../../service/api';
import { toast } from 'react-hot-toast';

const generateGoogleMeetLink = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const getChunk = (len) => {
    let chunk = '';
    for (let i = 0; i < len; i++) {
      chunk += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return chunk;
  };
  return `https://meet.google.com/${getChunk(3)}-${getChunk(4)}-${getChunk(3)}`;
};

const ScheduleMeetingModal = ({ isOpen, onClose, clients, onSuccess, initialClientId, initialTitle }) => {
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    meetingDate: '',
    meetingTime: '',
    meetingType: 'Virtual',
    platform: 'Google Meet',
    meetingLink: '',
    attendees: 2
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialTitle || '',
        clientId: initialClientId || '',
        meetingDate: '',
        meetingTime: '',
        meetingType: 'Virtual',
        platform: 'Google Meet',
        meetingLink: generateGoogleMeetLink(),
        attendees: 2
      });
    }
  }, [isOpen, initialClientId, initialTitle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.clientId || !formData.meetingDate || !formData.meetingTime) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        platform: formData.meetingType === 'Virtual' ? formData.meetingLink : formData.platform
      };
      const res = await createClientMeeting(payload);
      if (res.success) {
        toast.success("Meeting scheduled successfully");
        onSuccess();
        onClose();
        setFormData({
          title: '',
          clientId: '',
          meetingDate: '',
          meetingTime: '',
          meetingType: 'Virtual',
          platform: 'Google Meet',
          meetingLink: '',
          attendees: 2
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to schedule meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden text-left"
          >
            <div className="px-10 py-10 border-b border-[#F4F3EF] flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                Schedule Meeting
              </h1>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q1 Strategy Session"
                  className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Select Client</label>
                  {initialClientId ? (
                    <input
                      type="text"
                      readOnly
                      className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none cursor-not-allowed opacity-80"
                      value={clients.find(c => (c.id || c._id) === initialClientId)?.companyName || clients.find(c => (c.id || c._id) === initialClientId)?.name || 'Unknown Client'}
                    />
                  ) : (
                    <select
                      required
                      className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    >
                      <option value="">Choose client...</option>
                      {clients.map(c => (
                        <option key={c.id || c._id} value={c.id || c._id}>{c.companyName || c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Meeting Type</label>
                  <select
                    className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.meetingType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        meetingType: val,
                        platform: val === 'Virtual' ? 'Google Meet' : ''
                      }));
                    }}
                  >
                    <option value="Virtual">Virtual</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Time</label>
                  <input
                    type="time"
                    required
                    className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Platform/Location</label>
                <input
                  type="text"
                  required
                  placeholder={formData.meetingType === 'Virtual' ? 'Google Meet' : 'e.g. Office HQ, Client Office'}
                  readOnly={formData.meetingType === 'Virtual'}
                  className={`w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all ${
                    formData.meetingType === 'Virtual' ? 'cursor-not-allowed opacity-80' : 'focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  value={formData.meetingType === 'Virtual' ? 'Google Meet' : formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                />
              </div>

              {formData.meetingType === 'Virtual' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Meeting Link</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      className="w-full pl-5 pr-28 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1B4DA0] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      placeholder="Generating link..."
                    />
                    <div className="absolute right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const link = generateGoogleMeetLink();
                          setFormData({ ...formData, meetingLink: link });
                          toast.success("New link generated");
                        }}
                        title="Regenerate Link"
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#6B6B7E] hover:text-[#1B4DA0] hover:bg-slate-100 transition-all"
                      >
                        <FiRefreshCw size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.meetingLink) {
                            navigator.clipboard.writeText(formData.meetingLink);
                            toast.success("Link copied to clipboard");
                          }
                        }}
                        title="Copy Link"
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#6B6B7E] hover:text-[#10B981] hover:bg-slate-100 transition-all"
                      >
                        <FiLink size={14} />
                      </button>
                      {formData.meetingLink && (
                        <a
                          href={formData.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          title="Join Meeting"
                          className="w-8 h-8 rounded-lg bg-[#1B4DA0] flex items-center justify-center text-white hover:bg-[#153B7C] transition-all"
                        >
                          <FiVideo size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#1B4DA0] text-white font-black text-[11px] uppercase tracking-[3px] rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Generate Meeting'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const MeetingActionsDropdown = ({ meeting, onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192 + window.scrollX // 192 is w-48 (48 * 4)
      });
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-slate-50 transition-all active:scale-95"
      >
        <FiMoreVertical />
      </button>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[10000]"
          onClick={() => setIsOpen(false)}
        >
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: coords.top + 8,
                left: coords.left,
              }}
              className="w-48 bg-white rounded-2xl shadow-2xl border border-[#F4F3EF] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 space-y-1">
                {meeting.platform && meeting.platform.startsWith('http') && (
                  <a
                    href={meeting.platform}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-[#1B4DA0] hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <FiVideo size={14} className="text-[#1B4DA0]" />
                    JOIN MEETING
                  </a>
                )}
                <button
                  onClick={() => handleAction(() => onUpdate(meeting.id, 'Completed'))}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-[#6B6B7E] hover:text-[#10B981] hover:bg-emerald-50 rounded-xl transition-all"
                >
                  <FiCheckCircle size={14} className="text-[#10B981]" />
                  MARK COMPLETED
                </button>
                <button
                  onClick={() => handleAction(() => onUpdate(meeting.id, 'Cancelled'))}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-[#6B6B7E] hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                >
                  <FiClock size={14} className="text-amber-500" />
                  CANCEL MEETING
                </button>
                <div className="h-[1px] bg-[#F4F3EF] mx-2" />
                <button
                  onClick={() => handleAction(() => onDelete(meeting.id))}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <FiTrash2 size={14} />
                  DELETE RECORD
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
  );
};

const MeetingWithClientTab = ({ clients: initialClients = [], notificationBell }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [localClients, setLocalClients] = useState(initialClients);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState(null);
  const [initialClientIdForModal, setInitialClientIdForModal] = useState(null);
  const [initialTitleForModal, setInitialTitleForModal] = useState(null);
  const [reviewsHistory, setReviewsHistory] = useState({});

  const loadClientReviews = async (clientId) => {
    try {
      const res = await getClientReviews(clientId);
      setReviewsHistory(prev => ({
        ...prev,
        [clientId]: res.data || []
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const MOCK_MEETINGS = [
    { id: 'm1', title: 'Q2 Strategy Sync', companyName: 'Acme Corp', meetingDate: new Date().toISOString(), meetingTime: '14:00', meetingType: 'Virtual', platform: 'Zoom', attendees: 3, status: 'Scheduled' },
    { id: 'm2', title: 'Onboarding Kickoff', companyName: 'Stark Industries', meetingDate: new Date(Date.now() + 86400000).toISOString(), meetingTime: '10:00', meetingType: 'In-Person', platform: 'HQ 1', attendees: 5, status: 'Scheduled' },
    { id: 'm3', title: 'Monthly Review', companyName: 'Wayne Enterprises', meetingDate: new Date(Date.now() - 86400000).toISOString(), meetingTime: '15:30', meetingType: 'Virtual', platform: 'Google Meet', attendees: 2, status: 'Completed' },
  ];

  const loadClients = async () => {
    try {
      const res = await getAllClients();
      if (res && res.success && res.data?.clients?.length > 0) {
        setLocalClients(res.data.clients);
        res.data.clients.forEach(client => {
          loadClientReviews(client._id || client.id);
        });
      } else {
        setLocalClients([
          { id: 'mock1', _id: 'mock1', companyName: 'Acme Corp' },
          { id: 'mock2', _id: 'mock2', companyName: 'Stark Industries' },
          { id: 'mock3', _id: 'mock3', companyName: 'Wayne Enterprises' },
          { id: 'mock4', _id: 'mock4', companyName: 'Cyberdyne Systems' }
        ]);
      }
    } catch (e) {
      console.warn("Failed to fetch clients in meeting history", e);
      setLocalClients([
        { id: 'mock1', _id: 'mock1', companyName: 'Acme Corp' },
        { id: 'mock2', _id: 'mock2', companyName: 'Stark Industries' },
        { id: 'mock3', _id: 'mock3', companyName: 'Wayne Enterprises' },
        { id: 'mock4', _id: 'mock4', companyName: 'Cyberdyne Systems' }
      ]);
    }
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await getClientMeetings();
      let apiMeetings = [];
      if (res.success && res.data?.length > 0) {
        apiMeetings = res.data;
      } else {
        apiMeetings = MOCK_MEETINGS;
      }

      // Convert local reviews to meetings of type Monthly Review
      let localReviews = [];
      try {
        const localReviewsRaw = localStorage.getItem('local_client_reviews');
        localReviews = JSON.parse(localReviewsRaw || '[]');
        if (!Array.isArray(localReviews)) localReviews = [];
      } catch (e) {
        localReviews = [];
      }
      
      let clientList = Array.isArray(localClients) ? localClients : [];
      if (clientList.length === 0) {
        try {
          const cRes = await getAllClients();
          if (cRes && cRes.success && cRes.data?.clients) {
            clientList = cRes.data.clients;
          }
        } catch (e) {
          // ignore
        }
      }
      if (clientList.length === 0) {
        clientList = [
          { id: 'mock1', _id: 'mock1', companyName: 'Acme Corp' },
          { id: 'mock2', _id: 'mock2', companyName: 'Stark Industries' },
          { id: 'mock3', _id: 'mock3', companyName: 'Wayne Enterprises' },
          { id: 'mock4', _id: 'mock4', companyName: 'Cyberdyne Systems' }
        ];
      }

      const convertedReviews = [];
      if (Array.isArray(localReviews)) {
        localReviews.forEach(r => {
          if (!r) return;
          const foundClient = clientList.find(cl => cl && (cl.id === r.clientId || cl._id === r.clientId));
          const companyName = foundClient ? (foundClient.companyName || foundClient.name) : (r.companyName || 'Acme Corp');
          
          let meetingDate = new Date().toISOString();
          let meetingTime = '12:00';
          try {
            if (r.createdAt) {
              const d = new Date(r.createdAt);
              if (!isNaN(d.getTime())) {
                meetingDate = d.toISOString();
                meetingTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            }
          } catch (e) {
            console.warn("Invalid date formatting in review", e);
          }

          convertedReviews.push({
            id: r.id || r._id || ('review_' + Math.random()),
            title: 'Monthly Review',
            companyName: companyName,
            meetingDate: meetingDate,
            meetingTime: meetingTime,
            meetingType: 'Call',
            platform: 'Phone Call',
            attendees: 1,
            status: 'Completed',
            rating: r.rating || null
          });
        });
      }

      // Filter out duplicate seed reviews if they are already in local storage reviews
      const filteredApiMeetings = apiMeetings.filter(apiM => {
        if (apiM.title === 'Monthly Review') {
          return !convertedReviews.some(convR => convR.companyName === apiM.companyName);
        }
        return true;
      });

      setMeetings([...convertedReviews, ...filteredApiMeetings]);
    } catch (error) {
      console.error("fetchMeetings error:", error);
      setMeetings(MOCK_MEETINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    loadClients();
  }, []);

  const handleUpdateStatus = async (meetingId, status) => {
    try {
      const res = await updateMeetingStatus(meetingId, status);
      if (res.success) {
        toast.success(`Meeting marked as ${status}`);
        fetchMeetings();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    try {
      const res = await deleteMeeting(meetingId);
      if (res.success) {
        toast.success("Meeting deleted");
        fetchMeetings();
      }
    } catch (error) {
      toast.error("Failed to delete meeting");
    }
  };

  const handleConnectCalendar = () => {
    setSyncing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Connecting to Google Calendar...',
        success: 'Calendar successfully synced!',
        error: 'Connection failed',
      }
    ).finally(() => setSyncing(false));
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Pending';
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Pending';
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return d.toLocaleDateString('en-US', options);
    } catch (e) {
      console.warn("Invalid date passed to formatDate", e);
      return 'Pending';
    }
  };


  const filteredMeetings = meetings.filter(m => {
    const matchSearch = (m.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.companyName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' ? true : m.status === selectedStatus;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    // Scheduled first, then by date descending
    if (a.status !== b.status) return a.status === 'Scheduled' ? -1 : 1;
    return new Date(b.meetingDate) - new Date(a.meetingDate);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 pb-32"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Client Meetings</h1>
        </div>
        <div className="flex gap-3 items-center">
          {notificationBell}
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3.5 bg-[#1B4DA0] text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-[11px] tracking-[2px]"
          >
            <FiCalendar size={18} /> Schedule Meeting
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-8">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>
        <div className="relative group">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] hover:bg-[#EEF2FB] transition-all"
          >
            <option value="ALL">ALL STATUS</option>
            <option value="Scheduled">SCHEDULED</option>
            <option value="Completed">COMPLETED</option>
            <option value="Cancelled">CANCELLED</option>
          </select>
          <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden text-left">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Loading meetings...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                <FiAlertCircle size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">No meetings found</h3>
              <p className="text-xs text-[#9B9BAD] max-w-xs leading-relaxed">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F4F3EF] bg-transparent">
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Title</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Client</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Date & Time</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Rating</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3EF]">
                {filteredMeetings.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMeetingDetail(m)}
                    className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-4 text-left">
                      <p className="text-[14px] font-bold text-[#1A1A2E]">{m.title}</p>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-[#EEF2FB] text-[#1B4DA0] flex items-center justify-center font-black text-xs">
                          {(m.companyName || 'C').substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-[13px] font-bold text-[#6B6B7E]">{m.companyName}</p>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <p className="text-[12px] font-bold text-[#1A1A2E]">{formatDate(m.meetingDate)}</p>
                      <p className="text-[11px] text-[#9B9BAD]">{m.meetingTime}</p>
                    </td>
                    <td className="px-8 py-4 text-left">
                      {(() => {
                        let displayRating = m.rating;
                        if (!displayRating) {
                          const clientObj = localClients.find(c => c.companyName === m.companyName || c.name === m.companyName);
                          if (clientObj) {
                            const cReviews = reviewsHistory[clientObj.id || clientObj._id] || [];
                            const sorted = [...cReviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                            if (sorted.length > 0) displayRating = sorted[0].rating;
                          }
                        }
                        
                        return displayRating ? (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <span key={idx} className={`text-sm ${idx < displayRating ? 'text-[#D4AF37]' : 'text-slate-200'}`}>★</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#9B9BAD] text-[12px] font-bold">N/A</span>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider 
                        ${m.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                          m.status === 'Completed' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 
                          'bg-rose-50 text-rose-600 border border-rose-100'}
                      `}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <MeetingActionsDropdown
                          meeting={m}
                          onUpdate={handleUpdateStatus}
                          onDelete={handleDeleteMeeting}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Side Drawer for Meeting Detail */}
      {createPortal(
        <AnimatePresence>
          {selectedMeetingDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedMeetingDetail(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden"
              >
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Meeting Details</h3>
                  <button onClick={() => setSelectedMeetingDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all">
                    <FiX size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-8 text-left custom-scrollbar">
                  <div className="space-y-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-2
                      ${selectedMeetingDetail.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 
                        selectedMeetingDetail.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}
                    `}>
                      {selectedMeetingDetail.status}
                    </span>
                    <h2 className="text-2xl font-bold text-[#1A1A2E]">{selectedMeetingDetail.title}</h2>
                    <p className="text-sm font-bold text-[#6B6B7E]">{selectedMeetingDetail.companyName}</p>
                  </div>
                  
                  <div className="bg-[#FAFAF8] p-6 rounded-3xl border border-[#F4F3EF] space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B4DA0] shadow-sm">
                        <FiCalendar size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Date</p>
                        <p className="text-sm font-bold text-[#1A1A2E]">{formatDate(selectedMeetingDetail.meetingDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B4DA0] shadow-sm">
                        <FiClock size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Time</p>
                        <p className="text-sm font-bold text-[#1A1A2E]">{selectedMeetingDetail.meetingTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B4DA0] shadow-sm">
                        {selectedMeetingDetail.meetingType === 'Virtual' ? <FiVideo size={18} /> : <FiMapPin size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Platform / Location</p>
                        {selectedMeetingDetail.platform && selectedMeetingDetail.platform.startsWith('http') ? (
                          <a
                            href={selectedMeetingDetail.platform}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-bold text-[#1B4DA0] hover:underline break-all block"
                          >
                            {selectedMeetingDetail.platform}
                          </a>
                        ) : (
                          <p className="text-sm font-bold text-[#1A1A2E]">{selectedMeetingDetail.platform || 'Google Meet'}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B4DA0] shadow-sm">
                        <FiUsers size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Attendees</p>
                        <p className="text-sm font-bold text-[#1A1A2E]">{selectedMeetingDetail.attendees} People</p>
                      </div>
                    </div>
                  </div>
                  {selectedMeetingDetail.platform && selectedMeetingDetail.platform.startsWith('http') && (
                    <div className="pt-4">
                      <a
                        href={selectedMeetingDetail.platform}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-4 bg-[#1B4DA0] text-white font-black text-[11px] uppercase tracking-[3px] rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <FiVideo size={16} /> Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <ScheduleMeetingModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setInitialClientIdForModal(null);
            setInitialTitleForModal(null);
          }}
          clients={localClients}
          onSuccess={fetchMeetings}
          initialClientId={initialClientIdForModal}
          initialTitle={initialTitleForModal}
        />,
        document.body
      )}
    </motion.div>
  );
};

export default MeetingWithClientTab;
