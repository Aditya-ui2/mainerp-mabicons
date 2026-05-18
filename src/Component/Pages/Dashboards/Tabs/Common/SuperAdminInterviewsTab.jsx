import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Video, MapPin, X, Clock, User, ChevronRight, AlertCircle, Calendar, Search, Star, Database } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllInterviews,
  getSharePointInterviews,
  syncSharePointAll
} from "../../../service/api";
import InterviewFeedbackModal from "../KAMRecruitment/InterviewFeedbackModal";
import { FiDatabase, FiRefreshCw, FiChevronDown, FiX, FiVideo, FiChevronRight } from 'react-icons/fi';

const STATUS_COLORS = {
  "Scheduled": "bg-blue-50 text-blue-600 border-blue-100",
  "In-Progress": "bg-amber-50 text-amber-600 border-amber-100 animate-pulse",
  "Completed": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Cancelled": "bg-rose-50 text-rose-600 border-rose-100",
};

const CACHE_KEY_INTERVIEWS = 'cache_superAdminInterviews';

const InfoItem = ({ label, value, valueNode }) => (
  <div>
    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">{label}</p>
    <div className="bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 min-h-[44px] flex items-center">
      {valueNode ? valueNode : <span className="text-[13px] font-bold text-[#1A1A2E]">{value || 'N/A'}</span>}
    </div>
  </div>
);

const SuperAdminInterviewsTab = ({ isDarkMode, notificationBell }) => {
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
    <div className="space-y-8 animate-in fade-in duration-500 font-jakarta">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne">Interviews</h1>
        <div className="flex items-center gap-3">
          {notificationBell}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            placeholder="Search by candidate, role or host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative group min-w-[150px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-10 pr-10 text-[11px] font-black uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
          >
            <option value="all">ALL STATUS</option>
            <option value="Scheduled">SCHEDULED</option>
            <option value="In-Progress">IN PROGRESS</option>
            <option value="Completed">COMPLETED</option>
            <option value="Cancelled">CANCELLED</option>
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
        </div>

        <div className="relative group min-w-[150px]">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-10 pr-10 text-[11px] font-black uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
          >
            <option value="all">ALL DATES</option>
            <option value="today">TODAY</option>
            <option value="custom">CUSTOM RANGE</option>
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
            <div className="relative group">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-[#F4F3EF] border-none rounded-2xl py-3 px-4 text-[10px] font-bold uppercase outline-none transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
              />
              <span className="absolute -top-6 left-1 text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">From</span>
            </div>
            <div className="w-2 h-[2px] bg-[#9B9BAD] rounded-full" />
            <div className="relative group">
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-[#F4F3EF] border-none rounded-2xl py-3 px-4 text-[10px] font-bold uppercase outline-none transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
              />
              <span className="absolute -top-6 left-1 text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">To</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-[#F4F3EF]">
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Candidate</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Client & Position</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Time & Date</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Host</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest">Loading interviews...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInterviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <AlertCircle className="w-12 h-12 text-[#F4F3EF] mx-auto mb-4" />
                    <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest">No interviews found</p>
                  </td>
                </tr>
              ) : (
                filteredInterviews.map((interview) => (
                  <tr key={interview.id} onClick={() => setSelectedInterview(interview)} className="hover:bg-[#F8FAFF] transition-all group cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${interview.source === 'sharepoint' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-[#0D47A1] border-blue-100'}`}>
                          {interview.candidateAvatar || '?'}
                        </div>
                        <div className="text-left font-bold text-sm text-[#1A1A2E]">
                          {interview.candidateName}
                          {interview.source === 'sharepoint' && (
                            <Database size={10} className="inline ml-2 text-emerald-500" title="Source: SharePoint" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#4B4B5E]">{interview.clientName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${STATUS_COLORS[interview.status] || 'bg-gray-100 text-gray-500'}`}>
                            {interview.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Role: {interview.role}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-left flex flex-col justify-center">
                        <p className="text-[13px] font-black text-[#1A1A2E]">{formatTime(interview.time)}</p>
                        <div className="flex items-center gap-1 mt-1 opacity-60">
                          <Calendar size={10} className="text-[#9B9BAD]" />
                          <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider">
                            {interview.date ? new Date(interview.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <p className="text-[13px] font-bold text-[#1A1A2E]">{interview.interviewer}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end">
                        <button className="p-2.5 bg-[#F4F3EF] text-[#1B4DA0] rounded-xl"><FiChevronRight size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedInterview && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E66] backdrop-blur-md transition-opacity pointer-events-auto z-[200000]"
                onClick={() => setSelectedInterview(null)}
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Candidate Profile</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedInterview(null)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar text-left">
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-[32px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20 overflow-hidden"
                         style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                      <span>{(selectedInterview.candidateAvatar || 'C')}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 w-full flex flex-col items-center">
                    <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedInterview.candidateName}</h4>
                    <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{selectedInterview.clientName}</p>
                  </div>
                </div>

                <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-10 shadow-sm">
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                      <User className="text-[#1B4DA0]" size={18} />
                      <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Interview Details</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <InfoItem label="Position" value={selectedInterview.role} />
                      <InfoItem label="Assigned Host" value={selectedInterview.interviewer} />
                      <InfoItem label="Schedule Date" value={selectedInterview.date} />
                      <InfoItem label="Start Time" value={formatTime(selectedInterview.time)} />
                      <InfoItem label="Meeting Type" value={selectedInterview.type} />
                      <InfoItem label="Status" value={selectedInterview.status} />
                    </div>
                  </div>

                  {selectedInterview.meetingLink && (
                    <div className="pt-2">
                      <button
                        onClick={() => window.open(selectedInterview.meetingLink, '_blank')}
                        className="w-full py-4 bg-[#1B4DA0] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:bg-[#153D80] transition-colors"
                      >
                        <FiVideo size={20} /> Join Meeting Now
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )}

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
