import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Video, MapPin, X, Clock, User, ChevronRight, AlertCircle, Calendar, Search, Star, Database } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllInterviews,
  updateInterview,
  updateInterviewStatus,
  cancelInterview,
  scheduleNewInterview,
  getAllCandidates,
  updateCandidateStatus,
  rejectPipelineCandidate,
  submitInterviewFeedback,
  getDepartmentTeamMembers,
  getAllAdmins,
  getAllKAMMembers,
  getSharePointInterviews,
  syncSharePointAll
} from "../../../service/api";
import InterviewFeedbackModal from "../KAMRecruitment/InterviewFeedbackModal";
import { FiDatabase, FiRefreshCw } from 'react-icons/fi';

const STATUS_COLORS = {
  "Scheduled": "bg-blue-50 text-blue-600 border-blue-100",
  "In-Progress": "bg-amber-50 text-amber-600 border-amber-100 animate-pulse",
  "Completed": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Cancelled": "bg-rose-50 text-rose-600 border-rose-100",
};

const CACHE_KEY_INTERVIEWS = 'cache_superAdminInterviews';

const SuperAdminInterviewsTab = ({ isDarkMode }) => {
  const [interviews, setInterviews] = useState(() => {
    const mockData = [
      {
        id: 'mock-1',
        candidateId: 'cand-1',
        candidateName: 'Abhishek Sharma',
        candidateAvatar: 'A',
        role: 'Senior React Developer',
        interviewer: 'Ashish SuperAdmin',
        interviewerId: 'admin-1',
        interviewerAvatar: 'A',
        date: '2026-05-18',
        time: '10:00',
        duration: 60,
        type: 'Video',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        clientName: 'Mabicons IT Services',
        status: 'Scheduled',
        feedbackStatus: 'Pending',
        source: 'erp',
        raw: {}
      },
      {
        id: 'mock-2',
        candidateId: 'cand-2',
        candidateName: 'Priya Singh',
        candidateAvatar: 'P',
        role: 'UI/UX Designer',
        interviewer: 'Rahul Gupta',
        interviewerId: 'kam-1',
        interviewerAvatar: 'R',
        date: '2026-05-19',
        time: '14:30',
        duration: 45,
        type: 'Phone',
        meetingLink: '',
        clientName: 'Google Cloud',
        status: 'In-Progress',
        feedbackStatus: 'Pending',
        source: 'sharepoint',
        raw: {}
      }
    ];
    try {
      const c = localStorage.getItem(CACHE_KEY_INTERVIEWS);
      const parsed = c ? JSON.parse(c) : [];
      return parsed.length > 0 ? parsed : mockData;
    } catch {
      return mockData;
    }
  });

  const [loading, setLoading] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [editableInterview, setEditableInterview] = useState({
    date: "",
    time: "",
    type: "Video",
    meetingLink: "",
    interviewer: "",
    interviewerId: "",
    status: "",
    duration: "60"
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [now, setNow] = useState(new Date());
  const [feedbackData, setFeedbackData] = useState({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    if (!selectedInterview) {
      setIsEditing(false);
      return;
    }
    setEditableInterview({
      date: selectedInterview.date || "",
      time: selectedInterview.time || "",
      type: selectedInterview.type || "Video",
      meetingLink: selectedInterview.meetingLink || "",
      interviewer: selectedInterview.interviewer || "",
      interviewerId: selectedInterview.interviewerId || "",
      status: selectedInterview.status || "Scheduled",
      duration: String(selectedInterview.duration || "60")
    });
  }, [selectedInterview]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const [erpRes, spRes] = await Promise.all([
        getAllInterviews().catch(() => ({ success: false, data: [] })),
        getSharePointInterviews().catch(() => ({ success: false, data: [] }))
      ]);

      let allMerged = [];
      const newFeedbackData = {};

      if (erpRes.success && erpRes.data) {
        const mappedERP = erpRes.data.map(i => {
          if (i.evaluation && Object.keys(i.evaluation).length > 0) {
            newFeedbackData[i.id || i._id] = { rating: i.evaluation.overallRating || 0, note: i.evaluation.comments || "" };
          }
          return {
            id: i.id || i._id,
            candidateId: i.candidateId,
            candidateName: i.candidate?.name || i.candidateName || "Unknown Candidate",
            candidateAvatar: (i.candidate?.name || i.candidateName || "C").charAt(0).toUpperCase(),
            role: i.position?.title || i.positionTitle || "Unknown Position",
            interviewer: i.interviewerName || i.interviewer?.name || "To be assigned",
            interviewerId: i.interviewerId || i.interviewer?.id,
            interviewerAvatar: (i.interviewerName || i.interviewer?.name || "I").charAt(0).toUpperCase(),
            date: i.interviewDate,
            time: i.startTime,
            duration: i.duration || 45,
            type: i.meetingType || "Video",
            meetingLink: i.meetingLink,
            notes: i.notes,
            clientName: i.clientName || i.client?.companyName || i.client?.name || "Internal Team",
            status: i.status || "Scheduled",
            feedbackStatus: (i.evaluation && Object.keys(i.evaluation).length > 0) ? "Submitted" : "Pending",
            source: 'erp',
            raw: i
          };
        });
        allMerged = [...allMerged, ...mappedERP];
      }

      if (spRes.success && spRes.data) {
        const mappedSP = spRes.data.map(i => ({
          id: i.sharePointId || i.id,
          candidateId: null,
          candidateName: i.candidateName,
          candidateAvatar: (i.candidateName || "C").charAt(0).toUpperCase(),
          role: i.position || "Unknown Role",
          interviewer: i.interviewer || "SP Sync",
          interviewerId: null,
          interviewerAvatar: (i.interviewer || "S").charAt(0).toUpperCase(),
          date: i.interviewDate ? i.interviewDate.split('T')[0] : null,
          time: i.interviewTime || i.startTime,
          duration: 30,
          type: i.interviewType || "Video",
          meetingLink: i.meetLink || i.meetingLink,
          notes: i.notes,
          clientName: i.client || i.clientName || "SharePoint Client",
          status: i.status || "Scheduled",
          feedbackStatus: "Pending",
          source: 'sharepoint',
          raw: i
        }));
        allMerged = [...allMerged, ...mappedSP];
      }

      setFeedbackData(newFeedbackData);

      // Merge with mock data if needed or just replace
      if (allMerged.length > 0) {
        setInterviews(allMerged);
        localStorage.setItem(CACHE_KEY_INTERVIEWS, JSON.stringify(allMerged));
      }
    } catch (error) {
      console.error("Failed to load interviews", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSharePointSync = async () => {
    try {
      setIsSyncing(true);
      const res = await syncSharePointAll();
      if (res.success) {
        toast.success("SharePoint data synced!");
        fetchInterviews();
      }
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveInterviewChanges = async () => {
    if (!selectedInterview) return;
    try {
      setIsSaving(true);
      const response = await updateInterview(selectedInterview.id, {
        interviewDate: editableInterview.date,
        startTime: editableInterview.time,
        meetingType: editableInterview.type,
        meetingLink: editableInterview.meetingLink,
        interviewerName: editableInterview.interviewer,
        interviewerId: editableInterview.interviewerId,
        status: editableInterview.status,
        duration: parseInt(editableInterview.duration)
      });

      if (response.success) {
        toast.success("Interview updated successfully");
        fetchInterviews();
        setIsEditing(false);
        setSelectedInterview(prev => ({
          ...prev,
          ...editableInterview
        }));
      }
    } catch (error) {
      toast.error("Failed to update interview");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelInterview = async (id) => {
    if (window.confirm("Are you sure you want to cancel this interview?")) {
      try {
        const response = await cancelInterview(id, "Cancelled by Super Admin");
        if (response.success) {
          toast.success("Interview cancelled");
          fetchInterviews();
          setSelectedInterview(null);
        }
      } catch (error) {
        toast.error("Failed to cancel interview");
      }
    }
  };

  const filteredInterviews = useMemo(() => {
    return interviews.filter(i => {
      const matchesSearch = !searchTerm ||
        i.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.interviewer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || i.status === statusFilter;

      let matchesDate = true;
      if (dateFilter !== 'all' && i.date) {
        const iDate = new Date(i.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateFilter === 'today') {
          matchesDate = iDate.getTime() === today.getTime();
        } else if (dateFilter === 'custom') {
          if (customStartDate) matchesDate = iDate >= new Date(customStartDate);
          if (customEndDate && matchesDate) matchesDate = iDate <= new Date(customEndDate);
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [interviews, searchTerm, statusFilter, dateFilter, customStartDate, customEndDate]);



  const formatTime = (time) => {
    if (!time) return "N/A";
    if (time.includes("AM") || time.includes("PM")) return time;
    try {
      const [h, m] = time.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
    } catch (e) {
      return time;
    }
  };

  const isJoinable = (interview) => {
    if (!interview.meetingLink) return false;
    if (interview.status === 'Completed' || interview.status === 'Cancelled') return false;
    if (interview.status === 'In-Progress') return true;
    if (!interview.date || !interview.time) return false;
    try {
      const [h, m] = interview.time.split(':').map(Number);
      const interviewStart = new Date(interview.date);
      interviewStart.setHours(h, m, 0, 0);
      const diffMin = (interviewStart - now) / 60000;
      return diffMin <= 15 && diffMin >= -(interview.duration || 60);
    } catch (e) { return false; }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Interviews
          </h1>

        </div>

      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate, role or host..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3.5 pl-14 pr-5 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/10 outline-none transition-all placeholder:text-[#9B9BAD]/50"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In-Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none opacity-50" />
        </div>

        <div className="relative">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="custom">Custom Range</option>
          </select>
          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none opacity-50" />
        </div>
      </div>

      {dateFilter === 'custom' && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-4 py-2.5 outline-none border-0" />
          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">to</span>
          <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-4 py-2.5 outline-none border-0" />
        </div>
      )}

      {/* Table Interface */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="grid grid-cols-[120px_2fr_1.5fr_1.5fr_120px_40px] gap-4 px-8 py-5 border-b border-[#F4F3EF] bg-transparent">
          {["Time & Date", "Candidate", "Client", "Position", "Host", ""].map((h, i) => (
            <div key={i} className="text-[11px] font-black text-[#94a3b8] uppercase tracking-[2px] text-center flex items-center justify-center">
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#1B4DA0]/20 border-t-[#1B4DA0] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">Loading Interviews...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="py-24 text-center">
            <AlertCircle className="w-12 h-12 text-[#F4F3EF] mx-auto mb-4" />
            <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No interviews found</p>
          </div>
        ) : (
          filteredInterviews.map((interview) => {
            const isLive = interview.status === "In-Progress";
            const joinable = isJoinable(interview);
            const isReviewed = feedbackData[interview.id];

            return (
              <div
                key={interview.id}
                onClick={() => setSelectedInterview(interview)}
                className={`grid grid-cols-[120px_2fr_1.5fr_1.5fr_120px_40px] gap-4 items-center px-8 py-4 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group relative ${isLive ? 'bg-amber-50/30' : ''}`}
              >


                {/* Time & Date */}
                <div className="flex flex-col justify-center items-center">
                  <p className="text-[13px] font-black text-[#1A1A2E] text-center">{formatTime(interview.time)}</p>
                  <div className="flex items-center justify-center gap-1 mt-1 opacity-60">
                    <Calendar size={10} className="text-[#9B9BAD]" />
                    <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider text-center">
                      {interview.date ? new Date(interview.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Candidate */}
                <div className="flex items-center justify-center min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B4DA0] to-[#3FA9F5] flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-blue-500/20">
                      {interview.candidateAvatar}
                    </div>
                    <p className="text-[14px] font-black text-[#1A1A2E] truncate group-hover:text-[#1B4DA0] transition-colors text-center flex items-center gap-2">
                      {interview.candidateName}
                      {interview.source === 'sharepoint' && (
                        <Database size={10} className="text-emerald-500" title="Source: SharePoint" />
                      )}
                    </p>
                  </div>
                </div>

                {/* Client */}
                <div className="flex items-center justify-center text-[13px] font-bold text-[#64748b] truncate text-center uppercase tracking-tight">
                  {interview.clientName}
                </div>

                {/* Position */}
                <div className="flex flex-col justify-center items-center min-w-0">
                  <p className="text-[13px] font-black text-[#1A1A2E] truncate text-center">{interview.role}</p>
                  <div className="flex items-center justify-center gap-1 mt-1 opacity-50">
                    <Video size={10} className="text-[#9B9BAD]" />
                    <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">{interview.type}</span>
                  </div>
                </div>

                {/* Host */}
                <div className="flex items-center justify-center">
                  <p className="text-[13px] font-bold text-[#1A1A2E] text-center">{interview.interviewer}</p>
                </div>



                {/* Chevron */}
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#1B4DA0]/5 flex items-center justify-center transition-all">
                    <ChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#1B4DA0] transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedInterview && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                onClick={() => { setSelectedInterview(null); setIsEditing(false); }}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] bg-white shadow-2xl z-[9999] border-l border-[#F4F3EF] flex flex-col overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
                  <div className="flex-1 mr-4 text-left">
                    <h2 className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {selectedInterview?.candidateName || 'Unknown Candidate'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-[3px]">{selectedInterview?.role || 'Unknown Position'}</span>
                      <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">{selectedInterview?.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setSelectedInterview(null); setIsEditing(false); }}
                      className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-[#FAFAF8] rounded-[24px] border border-[#F4F3EF]">
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Schedule Date</span>
                      {isEditing ? (
                        <input type="date" value={editableInterview.date} onChange={e => setEditableInterview(p => ({ ...p, date: e.target.value }))}
                          className="w-full mt-2 bg-white border border-[#1B4DA0]/10 rounded-xl px-4 py-2 text-sm font-bold outline-none" />
                      ) : (
                        <p className="text-lg font-black text-[#1A1A2E] mt-1">{selectedInterview?.date}</p>
                      )}
                    </div>
                    <div className="p-6 bg-[#FAFAF8] rounded-[24px] border border-[#F4F3EF]">
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Start Time</span>
                      {isEditing ? (
                        <input type="time" value={editableInterview.time} onChange={e => setEditableInterview(p => ({ ...p, time: e.target.value }))}
                          className="w-full mt-2 bg-white border border-[#1B4DA0]/10 rounded-xl px-4 py-2 text-sm font-bold outline-none" />
                      ) : (
                        <p className="text-lg font-black text-[#1A1A2E] mt-1">{formatTime(selectedInterview?.time)}</p>
                      )}
                    </div>
                  </div>

                  {/* Interviewer */}
                  <div className="p-6 bg-[#FAFAF8] rounded-[24px] border border-[#F4F3EF]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Assigned Host</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#1B4DA0] text-white flex items-center justify-center font-black text-lg shadow-lg">
                        {selectedInterview?.interviewerAvatar}
                      </div>
                      <div>
                        <p className="text-base font-black text-[#1A1A2E]">{selectedInterview?.interviewer}</p>
                        <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest">{selectedInterview?.interviewerRole || 'Host'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="p-6 bg-[#FAFAF8] rounded-[24px] border border-[#F4F3EF]">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Meeting Details</span>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-[#1B4DA0] rounded-lg">
                            <Video size={18} />
                          </div>
                          <span className="text-sm font-bold text-[#1A1A2E]">Meeting Type</span>
                        </div>
                        <span className="text-sm font-black text-[#1B4DA0] uppercase tracking-widest">{selectedInterview?.type}</span>
                      </div>
                      {selectedInterview?.meetingLink && (
                        <div className="pt-4 border-t border-[#F4F3EF]">
                          <button
                            onClick={() => window.open(selectedInterview.meetingLink, '_blank')}
                            className="w-full py-4 bg-[#1B4DA0] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                          >
                            <Video size={20} /> Join Meeting Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <InterviewFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => { setShowFeedbackModal(false); setFeedbackInterview(null); }}
          interview={feedbackInterview}
          isDarkMode={isDarkMode}
          onFeedbackSubmitted={() => {
            fetchInterviews();
            setShowFeedbackModal(false);
          }}
        />
      )}
    </div>
  );
};

export default SuperAdminInterviewsTab;
