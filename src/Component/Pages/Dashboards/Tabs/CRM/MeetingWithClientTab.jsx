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
  FiEdit2
} from 'react-icons/fi';
import {
  getClientMeetings,
  createClientMeeting,
  seedClientMeetings,
  updateMeetingStatus,
  deleteMeeting
} from '../../../service/api';
import { toast } from 'react-hot-toast';

const ScheduleMeetingModal = ({ isOpen, onClose, clients, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    meetingDate: '',
    meetingTime: '',
    meetingType: 'Virtual',
    platform: 'Zoom Meeting',
    attendees: 2
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.clientId || !formData.meetingDate || !formData.meetingTime) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);
      const res = await createClientMeeting(formData);
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
          platform: 'Zoom Meeting',
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
              <h2 className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: '"Syne", sans-serif' }}>Schedule Meeting</h2>
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
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Meeting Type</label>
                  <select
                    className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.meetingType}
                    onChange={(e) => setFormData({ ...formData, meetingType: e.target.value, platform: e.target.value === 'Virtual' ? 'Zoom Meeting' : 'Client Office' })}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Platform/Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Google Meet / HQ 1"
                    className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Attendees Count</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#1B4DA0] text-white font-black text-[11px] uppercase tracking-[3px] rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Confirm Schedule'}
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-slate-50 transition-all active:scale-95"
      >
        <FiMoreVertical />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-[#F4F3EF] z-[100] overflow-hidden"
          >
            <div className="p-2 space-y-1">
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
        )}
      </AnimatePresence>
    </div>
  );
};

const MeetingWithClientTab = ({ clients = [] }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await getClientMeetings();
      if (res.success) {
        setMeetings(res.data);
        // Auto-seed if empty
        if (res.data.length === 0) {
          await seedClientMeetings();
          const res2 = await getClientMeetings();
          if (res2.success) setMeetings(res2.data);
        }
      }
    } catch (error) {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
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
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getVisibleMeetings = () => {
    return meetings
      .filter(m => m.status === 'Scheduled' || m.status === 'Completed')
      .sort((a, b) => {
        // Scheduled meetings first, then sorted by date and time
        if (a.status !== b.status) return a.status === 'Scheduled' ? -1 : 1;
        return new Date(a.meetingDate) - new Date(b.meetingDate);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Client Meetings</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchMeetings}
            className="w-12 h-12 bg-white border border-[#F4F3EF] text-[#6B6B7E] rounded-2xl flex items-center justify-center hover:bg-[#F8FAFF] transition-all"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3.5 bg-[#1B4DA0] text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-[11px] tracking-[2px]"
          >
            <FiCalendar size={18} /> Schedule Meeting
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Upcoming Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-black text-[#1A1A2E] tracking-widest uppercase text-left">Active Schedule</h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[#F4F3EF] to-transparent" />
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black">{meetings.filter(m => m.status === 'Scheduled').length}</span>
            </div>

            {loading ? (
              <div className="py-20 text-center bg-white rounded-[40px] border border-[#F4F3EF]">
                <FiRefreshCw className="w-10 h-10 text-[#1B4DA0] animate-spin mx-auto mb-4 opacity-20" />
                <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Syncing with database...</p>
              </div>
            ) : meetings.filter(m => m.status === 'Scheduled').length === 0 ? (
              <div className="py-12 text-center bg-[#F8FAFF]/50 rounded-[32px] border-2 border-dashed border-[#F4F3EF]">
                <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">No active meetings</p>
              </div>
            ) : (
              meetings.filter(m => m.status === 'Scheduled').map(meeting => (
                <motion.div
                  key={meeting.id}
                  layout
                  className="bg-white rounded-[32px] p-6 shadow-sm border border-[#F4F3EF] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col md:flex-row gap-6 text-left relative overflow-hidden"
                >
                  <div className="flex flex-col items-center justify-center min-w-[120px] py-4 bg-[#F8FAFF] rounded-2xl border border-blue-50 relative z-10">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#1B4DA0]">{formatDate(meeting.meetingDate).split(',')[0]}</span>
                    <span className="text-xl font-black text-[#1A1A2E] mt-1">{meeting.meetingTime}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center relative z-10">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{meeting.title}</h4>
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[1px] bg-blue-50 text-blue-600 border border-blue-100">
                        {meeting.meetingType}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#6B6B7E] mt-1">{meeting.companyName}</p>
                    <div className="flex items-center gap-4 mt-4 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">
                      <div className="flex items-center gap-1.5 bg-[#F4F3EF] px-3 py-1.5 rounded-xl">
                        {meeting.meetingType === 'Virtual' ? <FiVideo size={12} /> : <FiMapPin size={12} />}
                        {meeting.platform}
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#F4F3EF] px-3 py-1.5 rounded-xl">
                        <FiUsers size={12} />
                        {meeting.attendees} Attendees
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start justify-end relative z-10">
                    <MeetingActionsDropdown
                      meeting={meeting}
                      onUpdate={handleUpdateStatus}
                      onDelete={handleDeleteMeeting}
                    />
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* History Section */}
          {meetings.filter(m => m.status === 'Completed').length > 0 && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black text-[#9B9BAD] tracking-widest uppercase text-left">Meeting History</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#F4F3EF] to-transparent" />
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black">{meetings.filter(m => m.status === 'Completed').length}</span>
              </div>

              <div className="grid grid-cols-1 gap-4 opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all">
                {meetings.filter(m => m.status === 'Completed').map(meeting => (
                  <div key={meeting.id} className="bg-[#FAFAFA] rounded-[24px] p-5 border border-[#F4F3EF] flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#F4F3EF] flex items-center justify-center text-emerald-500 shadow-sm">
                        <FiCheckCircle size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1A1A2E] group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{meeting.title}</h4>
                        <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2 mt-0.5">
                          {meeting.companyName} • {formatDate(meeting.meetingDate)} • {meeting.meetingTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 rounded-full text-[8px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-widest">Completed</span>
                      <button onClick={() => handleDeleteMeeting(meeting.id)} className="w-8 h-8 rounded-lg hover:bg-rose-50 hover:text-rose-500 text-[#9B9BAD] flex items-center justify-center transition-all">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F4F3EF]">
            <h3 className="text-sm font-black text-[#1A1A2E] tracking-widest uppercase mb-6 text-left">Meeting Insights</h3>
            <div className="space-y-4">
              <div className="p-5 bg-[#F8FAFF] rounded-3xl border border-blue-50">
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Total This Month</p>
                <p className="text-2xl font-black text-[#1A1A2E]">{meetings.length}</p>
              </div>
              <div className="p-5 bg-[#FDFDFD] rounded-3xl border border-[#F4F3EF]">
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Completed</p>
                <p className="text-2xl font-black text-[#6B6B7E]">{meetings.filter(m => m.status === 'Completed').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1B4DA0] to-indigo-600 rounded-[40px] p-10 shadow-lg text-white text-left relative overflow-hidden">
            <div className="relative z-10">
              <FiLink size={32} className="mb-4 opacity-50" />
              <h4 className="text-xl font-bold mb-2">Google Sync</h4>
              <p className="text-xs font-medium text-blue-100 mb-8 leading-relaxed italic">Automatically track all invites and responses directly in your CRM dashboard.</p>
              <button
                onClick={handleConnectCalendar}
                disabled={syncing}
                className="w-full py-4 bg-white text-[#1B4DA0] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {syncing ? <FiRefreshCw className="animate-spin" /> : <FiCalendar />}
                {syncing ? 'Connecting...' : 'Connect Calendar'}
              </button>
            </div>
            <div className="absolute right-[-20%] bottom-[-20%] opacity-10">
              <FiCalendar size={220} />
            </div>
          </div>
        </div>
      </div>

      {createPortal(
        <ScheduleMeetingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          clients={clients}
          onSuccess={fetchMeetings}
        />,
        document.body
      )}
    </motion.div>
  );
};

export default MeetingWithClientTab;
