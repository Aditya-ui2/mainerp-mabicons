import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { Video, MapPin, X, Clock, User, ChevronRight, Pencil, Check, Plus, AlertCircle, Calendar, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { AVATAR_COLORS, getAvatarColor } from "./mockData";
import {
  getAllInterviews,
  updateInterview,
  updateInterviewStatus,
  cancelInterview,
  scheduleNewInterview,
  getAllCandidates,
  getDepartmentTeamMembers,
  getAllAdmins,
  getAllKAMMembers,
  getSharePointInterviews,
  syncSharePointAll
} from "../service/api";
import { FiDatabase, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import InterviewFeedbackModal from "../Dashboards/Tabs/KAMRecruitment/InterviewFeedbackModal";

const STATUS_COLORS = {
  "Scheduled": "bg-blue-50 text-blue-600 border-blue-100",
  "In-Progress": "bg-amber-50 text-amber-600 border-amber-100 animate-pulse",
  "Completed": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Cancelled": "bg-rose-50 text-rose-600 border-rose-100",
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  const [editMode, setEditMode] = useState(false);
  const [editInterview, setEditInterview] = useState(null);
  const [filter, setFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedClientFilter, setSelectedClientFilter] = useState("All Clients");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kamFilter, setKamFilter] = useState('');

  // Live clock for JOIN button (ticks every 30s)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  // New Appointment / Scheduler state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, note: '' });
  const [feedbackData, setFeedbackData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('interviewFeedback') || '{}'); } catch (e) { return {}; }
  });
  const [candidates, setCandidates] = useState([]);
  const [availableInterviewers, setAvailableInterviewers] = useState([]);
  const [showCandidateSuggestions, setShowCandidateSuggestions] = useState(false);
  const [showInterviewerSuggestions, setShowInterviewerSuggestions] = useState(false);
  const [showEditInterviewerSuggestions, setShowEditInterviewerSuggestions] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    candidateId: null,
    candidateName: "",
    candidateEmail: "",
    positionTitle: "",
    clientName: "",
    round: "Technical Round",
    date: "",
    time: "",
    duration: "60",
    interviewerId: null,
    interviewerName: "",
    interviewerRole: "",
    meetingType: "Video",
    meetingLink: "",
    notes: ""
  });
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  useEffect(() => {
    fetchInterviews();
    fetchSupportData();
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

  const hasChanges = JSON.stringify(editableInterview) !== JSON.stringify({
    date: selectedInterview?.date || "",
    time: selectedInterview?.time || "",
    type: selectedInterview?.type || "Video",
    meetingLink: selectedInterview?.meetingLink || "",
    interviewer: selectedInterview?.interviewer || "",
    interviewerId: selectedInterview?.interviewerId || "",
    status: selectedInterview?.status || "Scheduled",
    duration: String(selectedInterview?.duration || "60")
  });

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
        // We update selectedInterview to match the new data so hasChanges becomes false
        setSelectedInterview(prev => ({
          ...prev,
          ...editableInterview,
          date: editableInterview.date,
          time: editableInterview.time
        }));
      }
    } catch (error) {
      toast.error("Failed to update interview");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      // Fetch Candidates
      const candRes = await getAllCandidates();
      if (candRes.success) {
        setCandidates(candRes.data.map(c => ({
          id: c.id || c._id,
          name: c.name || c.fullName || "Unnamed",
          email: c.email || "",
          positionTitle: c.position?.title || c.role || "",
          clientName: c.client?.companyName || c.client?.name || "",
          avatar: (c.name || "C").charAt(0).toUpperCase()
        })));
      }

      // Fetch Staff from all possible departments, specialized pools, and global admins
      const departments = ['HR Recruitment', 'HR Operations', 'IT', 'Sales', 'Marketing', 'BD', 'Finance', 'Management', 'Recruitment', 'HR'];
      const staffPromises = [
        ...departments.map(dept => getDepartmentTeamMembers(dept)),
        getAllKAMMembers(),
        getAllAdmins()
      ];

      const staffResults = await Promise.allSettled(staffPromises);

      const seen = new Set();
      const allStaff = [];

      staffResults.forEach(res => {
        if (res.status === 'fulfilled' && res.value) {
          // Exhaustive check for result arrays in common ERP patterns
          const rawData = res.value.members || res.value.admins || res.value.users || res.value.data || res.value.kams || res.value.teamMembers || (Array.isArray(res.value) ? res.value : []);

          if (Array.isArray(rawData)) {
            rawData.forEach(s => {
              const name = s.name || s.fullName || s.userName || s.memberName || s.fullName;
              if (!name) return;

              const identifier = (s.email || name || "").toLowerCase().trim();

              if (identifier && !seen.has(identifier)) {
                seen.add(identifier);
                allStaff.push({
                  id: s.id || s._id,
                  name: name,
                  role: s.designation || s.role || s.jobTitle || s.position?.title || s.roleName || "Team Member",
                  department: s.department || "General Staff"
                });
              }
            });
          }
        }
      });

      setAvailableInterviewers(allStaff);
    } catch (error) {
      console.error("Failed to fetch support data:", error);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

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

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const [erpRes, spRes] = await Promise.all([
        getAllInterviews(),
        getSharePointInterviews().catch(() => ({ success: true, data: [] }))
      ]);

      let allMerged = [];

      if (erpRes.success) {
        const mappedERP = erpRes.data.map(i => ({
          id: i.id || i._id,
          candidateId: i.candidateId,
          candidateName: i.candidate?.name || "Unknown Candidate",
          candidateAvatar: i.candidate?.name?.charAt(0).toUpperCase() || "C",
          role: i.position?.title || i.positionTitle || "Unknown Position",
          interviewer: i.interviewerName || "To be assigned",
          interviewerId: i.interviewerId,
          interviewerAvatar: i.interviewerName?.charAt(0).toUpperCase() || "I",
          date: i.interviewDate,
          time: i.startTime,
          duration: i.duration || 45,
          type: i.meetingType || "Video",
          meetingLink: i.meetingLink,
          notes: i.notes,
          clientName: i.clientName || i.client?.companyName || i.client?.name || "Internal Team",
          status: i.status || "Scheduled",
          feedbackStatus: i.feedback ? "Submitted" : "Pending",
          source: 'erp',
          raw: i
        }));
        allMerged = [...allMerged, ...mappedERP];
      }

      if (spRes.success && spRes.data) {
        const mappedSP = spRes.data.map(i => ({
          id: i.sharePointId,
          candidateId: null,
          candidateName: i.candidateName,
          candidateAvatar: (i.candidateName || "C").charAt(0).toUpperCase(),
          role: i.position || "Unknown Role",
          interviewer: i.interviewer || "SP Sync",
          interviewerId: null,
          interviewerAvatar: (i.interviewer || "S").charAt(0).toUpperCase(),
          date: i.interviewDate ? i.interviewDate.split('T')[0] : null,
          time: i.interviewTime,
          duration: 30,
          type: i.interviewType || "Video",
          meetingLink: i.meetLink,
          notes: i.notes,
          clientName: i.client || "SharePoint Client",
          status: i.status || "Scheduled",
          feedbackStatus: "Pending",
          source: 'sharepoint',
          raw: i
        }));
        allMerged = [...allMerged, ...mappedSP];
      }

      setInterviews(allMerged);
    } catch (error) {
      toast.error("Failed to load interviews");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async (id) => {
    if (window.confirm("Are you sure you want to cancel this interview?")) {
      try {
        const response = await cancelInterview(id, "Cancelled by user from Interviews Page");
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

  const handleScheduleAgain = (interview) => {
    setInterviewForm({
      candidateId: interview.candidateId,
      candidateName: interview.candidateName,
      candidateEmail: interview.raw?.candidate?.email || "",
      positionTitle: interview.role,
      clientName: interview.clientName,
      round: "Technical Round",
      date: "",
      time: "",
      duration: "60",
      interviewerId: interview.interviewerId,
      interviewerName: interview.interviewer,
      interviewerRole: interview.raw?.interviewerRole || "",
      meetingType: interview.type || "Video",
      meetingLink: "",
      notes: `Next round for ${interview.candidateName}`
    });
    setIsScheduleModalOpen(true);
    setSelectedInterview(null);
    setSelectedRowIds([]);
  };

  const handleStartReassign = (interview) => {
    setEditInterview({
      id: interview.id,
      date: interview.date,
      time: interview.time,
      type: interview.type,
      meetingLink: interview.meetingLink,
      interviewer: interview.interviewer,
      interviewerId: interview.interviewerId
    });
    setSelectedInterview(interview);
    setEditMode(true);
    // Future improvement: auto-focus interviewer field
  };

  const toggleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.length === filteredInterviews.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredInterviews.map(i => i.id));
    }
  };

  const handleSaveEdit = async () => {
    if (!editInterview) return;
    try {
      const response = await updateInterview(editInterview.id, {
        interviewDate: editInterview.date,
        startTime: editInterview.time,
        meetingType: editInterview.type,
        meetingLink: editInterview.meetingLink,
        interviewerName: editInterview.interviewer,
        interviewerId: editInterview.interviewerId
      });

      if (response.success) {
        toast.success("Interview updated successfully");
        fetchInterviews();
        setSelectedInterview(null);
        setEditMode(false);
        setEditInterview(null);
      }
    } catch (error) {
      toast.error("Failed to update interview");
    }
  };

  const handleInlineEdit = async (field, value, backendField) => {
    try {
      const payload = { [backendField || field]: value };
      const response = await updateInterview(selectedInterview.id, payload);
      if (response.success) {
        toast.success("Updated successfully");
        fetchInterviews();
      }
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Helper to filter out development "mock-" IDs
      const cleanId = (id) => (id && !String(id).startsWith('mock-')) ? id : null;

      const dataToSubmit = {
        candidateId: cleanId(interviewForm.candidateId),
        candidateName: interviewForm.candidateName,
        candidateEmail: interviewForm.candidateEmail,
        positionTitle: interviewForm.positionTitle,
        clientName: interviewForm.clientName,
        interviewType: interviewForm.round,
        interviewDate: interviewForm.date,
        startTime: interviewForm.time,
        duration: parseInt(interviewForm.duration),
        interviewerId: cleanId(interviewForm.interviewerId),
        interviewerName: interviewForm.interviewerName,
        interviewerRole: interviewForm.interviewerRole,
        meetingType: interviewForm.meetingType,
        meetingLink: interviewForm.meetingLink,
        notes: interviewForm.notes,
        status: 'Scheduled',
        interviewerType: 'DepartmentTeam'
      };

      const response = await scheduleNewInterview(dataToSubmit);
      if (response.success) {
        toast.success("Interview scheduled successfully!");
        setIsScheduleModalOpen(false);
        setInterviewForm({
          candidateId: null,
          candidateName: "",
          candidateEmail: "",
          positionTitle: "",
          clientName: "",
          round: "Technical Round",
          date: "",
          time: "",
          duration: "60",
          interviewerId: null,
          interviewerName: "",
          interviewerRole: "",
          meetingType: "Video",
          meetingLink: "",
          notes: ""
        });
        fetchInterviews();
      }
    } catch (error) {
      console.error("Scheduling failed:", error);
      toast.error(error.message || "Failed to schedule interview");
    }
  };

  const activeClientNames = useMemo(() => {
    const names = new Set(interviews.map(i => i.clientName).filter(Boolean));
    return Array.from(names).sort();
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(i => {
      // Status/type filter
      let matchesFilter = true;
      if (filter === "Today") matchesFilter = i.date === new Date().toISOString().split('T')[0];
      else if (filter === "Video") matchesFilter = i.type === "Video";
      else if (filter === "Pending") matchesFilter = i.feedbackStatus === "Pending" && i.status === "Completed";

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all" && i.date) {
        const interviewDate = new Date(i.date);
        const now = new Date();
        if (dateFilter === "today") {
          matchesDate = i.date === now.toISOString().split('T')[0];
        } else if (dateFilter === "week") {
          const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23, 59, 59, 999);
          matchesDate = interviewDate >= weekStart && interviewDate <= weekEnd;
        } else if (dateFilter === "prev-week") {
          const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() - 7); weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23, 59, 59, 999);
          matchesDate = interviewDate >= weekStart && interviewDate <= weekEnd;
        } else if (dateFilter === "month") {
          matchesDate = interviewDate.getMonth() === now.getMonth() && interviewDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === "prev-month") {
          const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const prevMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          matchesDate = interviewDate.getMonth() === prevMonth && interviewDate.getFullYear() === prevMonthYear;
        } else if (dateFilter === "quarter") {
          const q = Math.floor(now.getMonth() / 3);
          matchesDate = Math.floor(interviewDate.getMonth() / 3) === q && interviewDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === "prev-quarter") {
          const currentQ = Math.floor(now.getMonth() / 3);
          const prevQ = currentQ === 0 ? 3 : currentQ - 1;
          const prevQYear = currentQ === 0 ? now.getFullYear() - 1 : now.getFullYear();
          matchesDate = Math.floor(interviewDate.getMonth() / 3) === prevQ && interviewDate.getFullYear() === prevQYear;
        } else if (dateFilter === "year") {
          matchesDate = interviewDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === "custom") {
          if (customStartDate) matchesDate = interviewDate >= new Date(customStartDate);
          if (customEndDate && matchesDate) matchesDate = interviewDate <= new Date(customEndDate + 'T23:59:59');
        }
      }

      // Client filter
      let matchesClient = true;
      if (selectedClientFilter !== "All Clients") {
        matchesClient = i.clientName === selectedClientFilter;
      }

      // Search filter
      const matchesSearch = !searchTerm ||
        i.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.interviewer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = !statusFilter || i.status === statusFilter;

      // KAM filter
      const matchesKam = !kamFilter || i.interviewer === kamFilter;

      return matchesFilter && matchesDate && matchesClient && matchesSearch && matchesStatus && matchesKam;
    });
  }, [interviews, filter, dateFilter, customStartDate, customEndDate, selectedClientFilter, searchTerm, statusFilter, kamFilter]);

  // Dynamically generate unique interview dates for the timeline
  const interviewDates = useMemo(() => {
    const dates = [...new Set(filteredInterviews.map(i => i.date))].sort();
    return dates;
  }, [filteredInterviews]);

  const dateLabels = useMemo(() => {
    const labels = {};
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    interviewDates.forEach(date => {
      const d = new Date(date);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      if (date === today) labels[date] = `Today — ${dayName}`;
      else if (date === tomorrow) labels[date] = `Tomorrow — ${dayName}`;
      else labels[date] = dayName;
    });
    return labels;
  }, [interviewDates]);

  // Returns true if interview is joinable (within 10 min before start or in-progress)
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
      return diffMin <= 10 && diffMin >= -(interview.duration || 60);
    } catch (e) { return false; }
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    // Handle "10:00 AM" format if backend sends it like that
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

  const stats = useMemo(() => [
    { label: "Today", value: interviews.filter(i => i.date === new Date().toISOString().split('T')[0]).length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: interviews.filter(i => i.feedbackStatus === "Pending" && i.status === "Completed").length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completion", value: interviews.length > 0 ? `${Math.round((interviews.filter(i => i.status === 'Completed').length / interviews.length) * 100)}%` : "0%", icon: Check, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Sessions", value: interviews.length, icon: User, color: "text-indigo-600", bg: "bg-indigo-50" },
  ], [interviews]);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Refined Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Interview Schedule
          </h1>

        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSharePointSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? <FiRefreshCw className="animate-spin" /> : <FiDatabase />}
            {isSyncing ? 'Syncing...' : 'Sync SharePoint'}
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-[#0D47A1]/20 active:scale-95"
          >
            <Plus size={18} /> Schedule New Interview
          </button>
        </div>
      </div>



      {/* Filter Bar Unification */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate, role or host..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); if (e.target.value !== 'custom') { setCustomStartDate(''); setCustomEndDate(''); } }}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none opacity-50" />
        </div>

        {/* Client Filter */}
        <div className="relative">
          <select
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
          >
            <option value="All Clients">All Clients</option>
            {activeClientNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none opacity-50" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In-Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none opacity-50" />
        </div>
      </div>

      {dateFilter === 'custom' && (
        <div className="flex items-center gap-3 mb-8 px-2 animate-in fade-in slide-in-from-top-4">
          <div className="relative">
            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
              className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-4 py-2.5 outline-none border-0" />
          </div>
          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">to</span>
          <div className="relative">
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
              className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-4 py-2.5 outline-none border-0" />
          </div>
        </div>
      )}

      {/* Table Interface */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="grid grid-cols-[40px_120px_2fr_1.5fr_1.5fr_120px_110px_140px_40px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={selectedRowIds.length > 0 && selectedRowIds.length === filteredInterviews.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm" 
            />
          </div>
          {["Time & Date", "Candidate", "Client", "Role / Job", "Host", "Status", "Actions", ""].map((h, i) => (
            <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start">
              {h}
            </div>
          ))}
        </div>

        {filteredInterviews.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No interviews found for the selected criteria</p>
          </div>
        ) : (
          filteredInterviews.map((interview) => {
            const candidateColor = getAvatarColor(interview.candidateName, interview.candidateAvatar);
            const isLive = interview.status === "In-Progress";
            const joinable = isJoinable(interview);
            const isReviewed = feedbackData[interview.id];

            return (
              <div
                key={interview.id}
                onClick={() => setSelectedInterview(interview)}
                className={`grid grid-cols-[40px_120px_2fr_1.5fr_1.5fr_120px_110px_140px_40px] gap-4 items-center px-8 py-3 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group relative ${isLive ? 'bg-amber-50/30' : ''}`}
              >
                <div className="flex items-center" onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedRowIds.includes(interview.id)}
                    onChange={(e) => toggleSelectRow(interview.id, e)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm" 
                  />
                </div>
                
                {/* Time & Date */}
                <div className="flex flex-col justify-center items-start py-1">
                  <p className="text-[13px] font-bold text-[#1A1A2E] text-left">{formatTime(interview.time)}</p>
                  <div className="flex items-center justify-start gap-1 mt-0.5 opacity-60">
                    <Calendar size={10} className="text-[#9B9BAD]" />
                    <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider text-left">
                      {new Date(interview.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Candidate */}
                <div className="flex items-start gap-3 min-w-0 py-1">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm mt-0.5 ${candidateColor}`}>
                    {interview.candidateAvatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#0D47A1] transition-colors text-left flex items-center gap-2">
                      {interview.candidateName}
                      {interview.source === 'sharepoint' && (
                        <FiDatabase size={10} className="text-emerald-500" title="Source: SharePoint" />
                      )}
                    </p>
                  </div>
                </div>

                {/* Client */}
                <div className="flex items-start justify-start text-[13px] font-medium text-[#64748b] truncate py-1 text-left">
                  {interview.clientName}
                </div>

                {/* Role / Job */}
                <div className="flex flex-col justify-center items-start min-w-0 py-1">
                  <p className="text-[13px] font-bold text-[#1A1A2E] truncate text-left">{interview.role}</p>
                  <div className="flex items-center justify-start gap-1 mt-0.5 opacity-50">
                    <Video size={10} className="text-[#9B9BAD]" />
                    <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">{interview.type}</span>
                  </div>
                </div>

                {/* Host */}
                <div className="flex items-center gap-2 py-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black ${getAvatarColor(interview.interviewer, interview.interviewerAvatar)}`}>
                    {interview.interviewerAvatar}
                  </div>
                  <span className="text-xs font-bold text-[#1A1A2E] truncate">{interview.interviewer.split(' ')[0]}</span>
                </div>

                {/* Status */}
                <div className="flex items-center py-1">
                  <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border ${STATUS_COLORS[interview.status]?.replace('bg-white', 'bg-slate-50') || "bg-slate-50 text-slate-400 border-slate-100"}`}>
                    {isLive ? 'Live' : interview.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 py-1 relative" onClick={e => e.stopPropagation()}>
                  {joinable ? (
                    <button
                      onClick={() => window.open(interview.meetingLink, '_blank')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#26A69A] text-white rounded-lg text-xs font-bold hover:bg-[#00897B] transition-all shadow-md shadow-[#26A69A]/20 active:scale-95"
                    >
                      <Video size={13} /> Join
                    </button>
                  ) : (interview.status === 'Completed' || interview.status === 'Cancelled' || interview.status === 'Scheduled' || interview.status === 'In Progress') ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setFeedbackInterview(interview);
                          const existing = feedbackData[interview.id];
                          setFeedbackForm(existing || { rating: 0, note: '' });
                          setShowFeedbackModal(true);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isReviewed ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-[#0D47A1] text-white hover:bg-[#0a3a82] shadow-md shadow-[#0D47A1]/20'}`}
                      >
                        <Pencil size={13} /> {isReviewed ? 'Reviewed' : 'Feedback'}
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Chevron */}
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#0D47A1]/5 flex items-center justify-center transition-all">
                    <ChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#0D47A1] transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Refined Detail Drawer */}
      {selectedInterview && ReactDOM.createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity"
            onClick={() => { setSelectedInterview(null); setEditMode(false); }}
          />
          <div
            className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] bg-white shadow-2xl z-[9999] border-l border-[#F4F3EF] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
              <div className="flex-1 mr-4 text-left">
                <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {selectedInterview?.candidateName || 'Unknown Candidate'}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{selectedInterview?.role || 'Unknown Position'}</span>
                  <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                  <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">{selectedInterview?.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isSaving}
                      onClick={() => {
                        setIsEditing(false);
                        // Reset editable fields to original selectedInterview values
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
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B6B7E] bg-[#F4F3EF] hover:bg-[#E8E7E2] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={handleSaveInterviewChanges}
                      className="w-[145.83px] h-[32px] rounded-xl text-xs font-bold text-white bg-[#0D47A1] hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {isSaving ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInterview(null);
                        setIsEditing(false);
                      }}
                      className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all active:scale-90 shadow-sm"
                    >
                      <X size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="bg-[#FAFAF8] rounded-[24px] p-8 border border-[#F4F3EF] space-y-8">
                {/* Schedule Summary Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  {/* Date & Time Group */}
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Schedule</label>
                      <div className="relative group">
                        <input
                          type="date"
                          readOnly={!isEditing}
                          className={`w-full bg-transparent rounded-xl px-3 py-2 text-sm font-bold text-[#1A1A2E] transition-all outline-none border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent cursor-default'}`}
                          value={editableInterview.date}
                          onChange={e => setEditableInterview(p => ({ ...p, date: e.target.value }))}
                        />
                        {!isEditing && <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50" />}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Time</label>
                      <div className="relative group">
                        <input
                          type="time"
                          readOnly={!isEditing}
                          className={`w-full bg-transparent rounded-xl px-3 py-2 text-sm font-bold text-[#1A1A2E] transition-all outline-none border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent cursor-default'}`}
                          value={editableInterview.time}
                          onChange={e => setEditableInterview(p => ({ ...p, time: e.target.value }))}
                        />
                        {!isEditing && <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50" />}
                      </div>
                    </div>
                  </div>

                  {/* Interviewer Row */}
                  <div className="space-y-4 col-span-2">
                    <div className="space-y-1.5 text-left relative">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Interviewer</label>
                      <input
                        type="text"
                        readOnly={!isEditing}
                        className={`w-full bg-transparent rounded-xl px-3 py-2 text-sm font-bold text-[#1A1A2E] transition-all outline-none border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent cursor-default'}`}
                        value={editableInterview.interviewer}
                        onChange={e => {
                          setEditableInterview(p => ({ ...p, interviewer: e.target.value }));
                          if (isEditing) setShowEditInterviewerSuggestions(true);
                        }}
                        onFocus={() => isEditing && setShowEditInterviewerSuggestions(true)}
                        placeholder="Assign host..."
                      />
                      {showEditInterviewerSuggestions && isEditing && (
                        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-[#F4F3EF] rounded-2xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                          {availableInterviewers
                            .filter(s => s.name?.toLowerCase().includes((editableInterview.interviewer || "").toLowerCase()))
                            .map(s => (
                              <div
                                key={s.id}
                                className="px-4 py-3 hover:bg-[#FAFAF8] cursor-pointer border-b border-[#F4F3EF] last:border-0 flex items-center gap-3 transition-colors text-left"
                                onClick={() => {
                                  setEditableInterview(p => ({ ...p, interviewer: s.name, interviewerId: s.id }));
                                  setShowEditInterviewerSuggestions(false);
                                }}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(s.name, s.name.charAt(0))}`}>
                                  {s.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#1A1A2E]">{s.name}</p>
                                  <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider">{s.role} • {s.department}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Platform & Duration */}
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Platform</label>
                      <div className="relative group">
                        {isEditing ? (
                          <select
                            className="w-full bg-white border border-black rounded-xl px-3 py-2 text-sm font-bold text-[#0D47A1] outline-none shadow-sm"
                            value={editableInterview.type}
                            onChange={e => setEditableInterview(p => ({ ...p, type: e.target.value }))}
                          >
                            <option value="Video">Video Conference</option>
                            <option value="In-Person">In-Person Meeting</option>
                          </select>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-[#0D47A1] rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {editableInterview.type}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        readOnly={!isEditing}
                        className={`w-full bg-transparent rounded-xl px-3 py-2 text-sm font-bold text-[#1A1A2E] transition-all outline-none border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent cursor-default'}`}
                        value={editableInterview.duration}
                        onChange={e => setEditableInterview(p => ({ ...p, duration: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 col-span-2">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Status</label>
                      {isEditing ? (
                        <select
                          className="w-full bg-white border border-black rounded-xl px-3 py-2 text-sm font-bold text-[#1A1A2E] outline-none shadow-sm"
                          value={editableInterview.status}
                          onChange={e => setEditableInterview(p => ({ ...p, status: e.target.value }))}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="In-Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <div className="mt-1">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[editableInterview.status] || "bg-slate-50 text-slate-400 border-slate-100"}`}>
                            {editableInterview.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#F4F3EF]" />

                {/* Meeting Link Section */}
                <div className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Meeting Link</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <Video size={20} />
                      </div>
                      <input
                        type="text"
                        readOnly={!isEditing}
                        className={`flex-1 bg-transparent rounded-xl px-3 py-2 text-sm font-medium text-blue-600 transition-all outline-none border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent hover:underline cursor-pointer'}`}
                        value={editableInterview.meetingLink}
                        onChange={e => setEditableInterview(p => ({ ...p, meetingLink: e.target.value }))}
                        onClick={() => !isEditing && editableInterview.meetingLink && window.open(editableInterview.meetingLink, '_blank')}
                      />
                    </div>
                  </div>
                </div>

                {/* Briefing Notes */}
                {selectedInterview.notes && (
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Briefing Notes</label>
                      <p className="text-sm text-[#6B6B7E] leading-relaxed italic ml-1">
                        {selectedInterview.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* New Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
          onClick={() => setIsScheduleModalOpen(false)}>
          <style>{`
            .dialog-scrollbar::-webkit-scrollbar { width: 6px; }
            .dialog-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .dialog-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
            .dialog-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
          `}</style>
          <div
            className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Schedule New Interview</h3>
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">Appointment Slot</p>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)}
                className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-10 max-h-[75vh] overflow-y-auto dialog-scrollbar space-y-7 text-left">

              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Candidate Name *</label>
                <input
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                  placeholder="Enter candidate name"
                  value={interviewForm.candidateName}
                  onChange={(e) => { setInterviewForm({ ...interviewForm, candidateName: e.target.value }); setShowCandidateSuggestions(true); }}
                  onFocus={() => setShowCandidateSuggestions(true)}
                  required
                />
                <AnimatePresence>
                  {showCandidateSuggestions && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute z-[130] w-full mt-2 bg-white border border-[#F4F3EF] rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {(() => {
                        const filtered = candidates.filter(c => (c.name || "").toLowerCase().includes((interviewForm.candidateName || "").toLowerCase().trim()));
                        if (filtered.length === 0) return <div className="px-4 py-6 text-center text-[#9B9BAD] text-[10px] font-bold uppercase tracking-widest">No candidates found</div>;
                        return filtered.map((c) => (
                          <button key={c.id} type="button"
                            onClick={() => { setInterviewForm({ ...interviewForm, candidateId: c.id, candidateName: c.name, candidateEmail: c.email, positionTitle: c.positionTitle, clientName: c.clientName }); setShowCandidateSuggestions(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-[#F8FAFF] transition-colors border-b border-[#F4F3EF] last:border-0">
                            <p className="text-sm font-bold text-[#1A1A2E]">{c.name}</p>
                            <p className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-wider">{c.email} • {c.positionTitle}</p>
                          </button>
                        ));
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Candidate Email</label>
                <input type="email"
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                  placeholder="Enter candidate email"
                  value={interviewForm.candidateEmail}
                  onChange={(e) => setInterviewForm({ ...interviewForm, candidateEmail: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Position</label>
                <input
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                  placeholder="e.g., Senior Software Engineer"
                  value={interviewForm.positionTitle}
                  onChange={(e) => setInterviewForm({ ...interviewForm, positionTitle: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Client</label>
                <input
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                  placeholder="e.g., TechCorp India"
                  value={interviewForm.clientName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, clientName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Round</label>
                <div className="relative">
                  <select
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                    value={interviewForm.round}
                    onChange={(e) => setInterviewForm({ ...interviewForm, round: e.target.value })}
                  >
                    <option value="Screening">Select Round</option>
                    <option value="Phone Screening">Phone Screening</option>
                    <option value="Technical Round">Technical Round</option>
                    <option value="Client Interview">Client Interview</option>
                    <option value="HR Round">HR Round</option>
                    <option value="Final Round">Final Round</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Date *</label>
                <input type="date"
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Time *</label>
                <input type="time"
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                  value={interviewForm.time}
                  onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Duration</label>
                <div className="relative">
                  <select
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                    value={interviewForm.duration}
                    onChange={(e) => setInterviewForm({ ...interviewForm, duration: e.target.value })}
                  >
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                    <option value="90">90 mins</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interview Type</label>
                <div className="relative">
                  <select
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                    value={interviewForm.meetingType}
                    onChange={(e) => setInterviewForm({ ...interviewForm, meetingType: e.target.value })}
                  >
                    <option value="Video">Video Call</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Phone">Phone Call</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Google Meet Link</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={interviewForm.meetingLink}
                    onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                  />
                  <button type="button"
                    onClick={() => setInterviewForm({ ...interviewForm, meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}` })}
                    className="flex items-center gap-2 px-5 py-4 text-white text-sm font-bold rounded-2xl shadow-[0_10px_25px_rgba(27,77,160,0.3)]"
                    style={{ background: 'linear-gradient(135deg, #1B4DA0, #3FA9F5)' }}>
                    Generate
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interviewer Name *</label>
                <input
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                  placeholder="Assign member"
                  value={interviewForm.interviewerName}
                  onChange={(e) => { setInterviewForm({ ...interviewForm, interviewerName: e.target.value }); setShowInterviewerSuggestions(true); }}
                  onFocus={() => setShowInterviewerSuggestions(true)}
                  required
                />
                <AnimatePresence>
                  {showInterviewerSuggestions && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute z-[130] w-full mt-2 bg-white border border-[#F4F3EF] rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {(() => {
                        const filtered = availableInterviewers.filter(s => (s.name || "").toLowerCase().includes((interviewForm.interviewerName || "").toLowerCase().trim()));
                        if (filtered.length === 0) return <div className="px-4 py-6 text-center text-[#9B9BAD] text-[10px] font-bold uppercase tracking-widest">No members found</div>;
                        return filtered.map((s) => (
                          <button key={s.id || s.name} type="button"
                            onClick={() => { setInterviewForm({ ...interviewForm, interviewerId: s.id, interviewerName: s.name, interviewerRole: s.role }); setShowInterviewerSuggestions(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-[#F8FAFF] transition-colors border-b border-[#F4F3EF] last:border-0">
                            <p className="text-sm font-bold text-[#1A1A2E]">{s.name}</p>
                            <p className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-wider">{s.role} • {s.department}</p>
                          </button>
                        ));
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interviewer Role</label>
                <input
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                  placeholder="e.g., Tech Lead"
                  value={interviewForm.interviewerRole}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewerRole: e.target.value })}
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  Schedule Interview
                </button>
              </div>
            </form>
            {/* Feedback Modal Integration */}
            {showFeedbackModal && (
              <InterviewFeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                interview={selectedInterview}
                onFeedbackSubmitted={() => {
                  fetchInterviews();
                  setShowFeedbackModal(false);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Candidate Feedback Modal */}
      {showFeedbackModal && feedbackInterview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
          onClick={() => setShowFeedbackModal(false)}>
          <div
            className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Candidate Feedback</h3>
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">{feedbackInterview.candidateName} · {feedbackInterview.role}</p>
              </div>
              <button onClick={() => setShowFeedbackModal(false)}
                className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-10 space-y-7 text-left">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block mb-3">Overall Rating</label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                        className="transition-all duration-300 transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          size={36}
                          className={`transition-colors duration-300 ${star <= feedbackForm.rating
                              ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                              : "text-[#E8E7E2] hover:text-amber-200"
                            }`}
                        />
                      </button>
                    ))}
                    {feedbackForm.rating > 0 && (
                      <span className="ml-4 text-lg font-bold text-[#1A1A2E] animate-in fade-in zoom-in duration-300">
                        {feedbackForm.rating} / 5
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block">Feedback Notes</label>
                  <textarea
                    rows={5}
                    className="w-full bg-[#F4F3EF] border-0 rounded-[24px] px-6 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50 resize-none leading-relaxed"
                    placeholder="Write a short summary of the candidate's performance..."
                    value={feedbackForm.note}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, note: e.target.value })}
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!feedbackForm.rating) {
                      toast.error('Please provide a star rating');
                      return;
                    }
                    const entry = { ...feedbackForm, candidateName: feedbackInterview.candidateName };
                    const updated = { ...feedbackData, [feedbackInterview.id]: entry };
                    setFeedbackData(updated);
                    try { localStorage.setItem('interviewFeedback', JSON.stringify(updated)); } catch (e) { }
                    toast.success('Feedback submitted successfully');
                    setShowFeedbackModal(false);
                  }}
                  className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      <AnimatePresence>
        {selectedRowIds.length > 0 && (
          <div className="fixed bottom-10 left-0 right-0 z-[150] flex justify-center pointer-events-none">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-[#1A1A2E] text-white px-8 py-4 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex items-center gap-8 border border-white/10 pointer-events-auto"
            >
              <div className="flex items-center gap-3 border-r border-white/10 pr-8">
                <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center text-[10px] font-black">
                  {selectedRowIds.length}
                </div>
                <span className="text-[13px] font-bold tracking-wide">Interviews Selected</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const first = interviews.find(i => i.id === selectedRowIds[0]);
                    if (first) {
                      setEditInterview({
                        id: first.id,
                        date: first.date,
                        time: first.time,
                        type: first.type,
                        meetingLink: first.meetingLink,
                        interviewer: first.interviewer,
                        interviewerId: first.interviewerId
                      });
                      setSelectedInterview(first);
                      setEditMode(true);
                    }
                    setSelectedRowIds([]);
                  }}
                  className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-all active:scale-95 text-xs font-bold"
                >
                  <Clock size={16} className="text-[#3B82F6]" />
                  Re-schedule
                </button>

                <button
                  onClick={() => {
                    const first = interviews.find(i => i.id === selectedRowIds[0]);
                    if (first) handleStartReassign(first);
                    setSelectedRowIds([]);
                  }}
                  className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-all active:scale-95 text-xs font-bold"
                >
                  <User size={16} className="text-[#3B82F6]" />
                  Re-assign
                </button>

                <button
                  onClick={() => {
                    const first = interviews.find(i => i.id === selectedRowIds[0]);
                    if (first) handleScheduleAgain(first);
                    setSelectedRowIds([]);
                  }}
                  className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-all active:scale-95 text-xs font-bold"
                >
                  <Plus size={16} className="text-[#3B82F6]" />
                  Schedule Again
                </button>

                <button
                  onClick={async () => {
                    if (selectedRowIds.length === 1) {
                      handleCancelInterview(selectedRowIds[0]);
                    } else {
                      toast.promise(
                        Promise.all(selectedRowIds.map(id => updateInterviewStatus(id, { status: 'Cancelled' }))),
                        {
                          loading: 'Cancelling interviews...',
                          success: 'Interviews cancelled successfully',
                          error: 'Failed to cancel some interviews'
                        }
                      );
                      setInterviews(prev => prev.map(i => selectedRowIds.includes(i.id) ? { ...i, status: 'Cancelled' } : i));
                    }
                    setSelectedRowIds([]);
                  }}
                  className="flex items-center gap-2 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl transition-all active:scale-95 text-xs font-bold"
                >
                  <X size={16} />
                  Cancel Interview
                </button>
              </div>

              <button
                onClick={() => setSelectedRowIds([])}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-2xl hover:bg-red-500/20 hover:text-red-400 transition-all ml-4"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
