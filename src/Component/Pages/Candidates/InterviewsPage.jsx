import React, { useState, useEffect, useMemo } from "react";
import { Video, MapPin, X, Clock, User, ChevronRight, Pencil, Check, Plus, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AVATAR_COLORS, getAvatarColor } from "./mockData";
import { getAllInterviews, updateInterview, updateInterviewStatus, scheduleNewInterview, getAllCandidates, getDepartmentTeamMembers, getAllAdmins, getAllKAMMembers } from "../service/api";
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
  const [editMode, setEditMode] = useState(false);
  const [editInterview, setEditInterview] = useState(null);
  const [filter, setFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedClientFilter, setSelectedClientFilter] = useState("All Clients");
  
  // New Appointment / Scheduler state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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

  useEffect(() => {
    fetchInterviews();
    fetchSupportData();
  }, []);

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

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await getAllInterviews();
      if (response.success) {
        const mapped = response.data.map(i => ({
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
          raw: i
        }));
        setInterviews(mapped);
      }
    } catch (error) {
      toast.error("Failed to load interviews");
      console.error(error);
    } finally {
      setLoading(false);
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
          const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
          const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);
          matchesDate = interviewDate >= weekStart && interviewDate <= weekEnd;
        } else if (dateFilter === "prev-week") {
          const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() - 7); weekStart.setHours(0,0,0,0);
          const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);
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

      return matchesFilter && matchesDate && matchesClient;
    });
  }, [interviews, filter, dateFilter, customStartDate, customEndDate, selectedClientFilter]);

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
    <div className="p-5 lg:p-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Refined Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Interview Schedule
          </h1>
          <p className="text-[#9B9BAD] text-[11px] font-bold uppercase tracking-[2px] mt-1">High-fidelity recruitment coordination</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B4DA0] text-white rounded-xl text-xs font-bold hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/10"
          >
            <Plus size={14} /> Schedule
          </button>
        </div>
      </div>

      {/* Compact Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-[#F4F3EF] shadow-sm flex items-center gap-4 group hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#F4F3EF] text-black group-hover:text-[#0D47A1] flex items-center justify-center shrink-0 transition-colors duration-300">
              <stat.icon size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1A1A2E] leading-tight mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Refined Filters Bar */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#F4F3EF] w-fit shadow-xs">
          {["All", "Today", "Video", "Pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                filter === f ? "bg-[#1A1A2E] text-white" : "text-[#9B9BAD] hover:text-[#1A1A2E]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); if (e.target.value !== 'custom') { setCustomStartDate(''); setCustomEndDate(''); } }}
          className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="prev-week">Previous Week</option>
          <option value="month">This Month</option>
          <option value="prev-month">Previous Month</option>
          <option value="quarter">This Quarter</option>
          <option value="prev-quarter">Previous Quarter</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
              className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer" />
            <span className="text-[10px] text-[#9B9BAD] font-bold">to</span>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
              className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer" />
          </div>
        )}

        {/* Client Filter Dropdown */}
        <select
          value={selectedClientFilter}
          onChange={(e) => setSelectedClientFilter(e.target.value)}
          className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer"
        >
          <option value="All Clients">All Clients</option>
          <option value="Google">Google</option>
          <option value="Microsoft">Microsoft</option>
          <option value="Amazon">Amazon</option>
          {activeClientNames.filter(name => !["Google", "Microsoft", "Amazon"].includes(name)).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        {(dateFilter !== 'all' || filter !== 'All' || selectedClientFilter !== "All Clients") && (
          <button
            onClick={() => { 
                setDateFilter('all'); 
                setFilter('All'); 
                setSelectedClientFilter('All Clients'); 
                setCustomStartDate(''); 
                setCustomEndDate(''); 
            }}
            className="text-xs font-semibold text-[#1B4DA0] hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Refined Timeline by Date */}
      <div className="space-y-10 relative">
        {/* The Timeline Rail */}
        <div className="absolute left-[23px] top-6 bottom-6 w-px bg-gradient-to-b from-[#F4F3EF] via-[#F4F3EF] to-transparent hidden md:block" />

        {interviewDates.map((date) => {
          const dayInterviews = filteredInterviews
            .filter((i) => i.date === date)
            .sort((a, b) => a.time.localeCompare(b.time));

          if (dayInterviews.length === 0) return null;

          return (
            <div key={date} className="relative z-10">
              {/* Refined Date Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0 z-20">
                   <p className="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none mb-0.5">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                   </p>
                   <p className="text-xl font-bold leading-none">{new Date(date).getDate()}</p>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {dateLabels[date]?.split(" — ")[0] || date}
                  </h2>
                  <p className="text-[9px] text-[#9B9BAD] font-black uppercase tracking-[2px]">
                    {dateLabels[date]?.split(" — ")[1] || ""}
                  </p>
                </div>
              </div>

              {/* Refined Interview Cards List */}
              <div className="space-y-4 md:ml-[44px]">
                {dayInterviews.map((interview) => {
                  const candidateColor = getAvatarColor(interview.candidateName, interview.candidateAvatar);
                  const isFeedbackPending = interview.feedbackStatus === "Pending" && interview.status === "Completed";
                  const isLive = interview.status === "In-Progress";

                  return (
                    <div
                      key={interview.id}
                      onClick={() => setSelectedInterview(interview)}
                      className={`group relative bg-white rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-4 cursor-pointer border border-[#F4F3EF] hover:border-[#1B4DA0]/30 hover:shadow-xl transition-all duration-300 ${
                         isLive ? "ring-2 ring-amber-400 ring-offset-2" : "shadow-sm"
                      }`}
                    >
                      {/* Refined Time Node */}
                      <div className="flex items-center gap-3 lg:w-28 flex-shrink-0">
                         <div className="flex flex-col">
                            <p className="text-base font-bold text-[#1A1A2E]">
                               {formatTime(interview.time)}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                               <Clock size={10} className="text-[#9B9BAD]" />
                               <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider">{interview.duration}m</span>
                            </div>
                         </div>
                         <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-[#FAFAF8] text-[#9B9BAD] lg:hidden border border-[#F4F3EF]`}>
                            {interview.type === "Video" ? <Video size={12} /> : <MapPin size={12} />}
                         </div>
                      </div>

                      {/* Profile Section */}
                      <div className="flex items-center gap-4 lg:w-[280px] xl:w-[320px] flex-shrink-0 min-w-0">
                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-base font-bold flex-shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105 ${candidateColor}`}>
                          {interview.candidateAvatar}
                        </div>
                        <div className="min-w-0">
                           <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-base font-bold text-[#1A1A2E] truncate group-hover:text-[#1B4DA0] transition-colors">{interview.candidateName}</p>
                              <Check size={12} className="text-emerald-500 flex-shrink-0" />
                           </div>
                           <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">{interview.role}</p>
                        </div>
                      </div>

                      {/* Refined Interviewer Details */}
                      <div className="hidden xl:flex items-center gap-3 flex-1 px-6 border-x border-[#F4F3EF]">
                        <div className="space-y-1 w-full">
                           <p className="text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest">Host</p>
                            <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(interview.interviewer, interview.interviewerAvatar)}`}>
                                  {interview.interviewerAvatar}
                               </div>
                               <span className="text-xs font-bold text-[#1A1A2E]">{interview.interviewer}</span>
                            </div>
                        </div>
                      </div>

                      {/* Status & Actions Column */}
                      <div className="flex items-center justify-end gap-6 flex-1">
                         <div className="flex flex-col items-end">
                            <p className="text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Status</p>
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${STATUS_COLORS[interview.status]?.replace('bg-white', 'bg-slate-50') || "bg-slate-50 text-slate-500 border-slate-100"}`}>
                               {interview.status}
                            </span>
                         </div>

                         <div className="text-[#9B9BAD] group-hover:text-[#1A1A2E] transition-all flex items-center justify-center">
                            <ChevronRight size={18} />
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Refined Detail Drawer */}
      {selectedInterview && (
        <>
          <div
            className="fixed inset-0 bg-[#1A1A2E]/20 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => { setSelectedInterview(null); setEditMode(false); }}
          />
          <div
            className="fixed right-0 top-0 h-full w-[380px] bg-white z-50 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                Details
              </h2>
              <div className="flex items-center gap-2">
                  {/* No toggle pencil in header as requested */}
                <button
                  onClick={() => { setSelectedInterview(null); setEditMode(false); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {editMode && editInterview ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Candidate</label>
                    <input
                      className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-sm outline-none font-bold cursor-not-allowed text-[#9B9BAD]"
                      value={editInterview.candidateName}
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Date</label>
                      <input
                        type="date"
                        className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-xs outline-none"
                        value={editInterview.date}
                        onChange={(e) => setEditInterview({ ...editInterview, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Time</label>
                      <input
                        type="time"
                        className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-xs outline-none"
                        value={editInterview.time}
                        onChange={(e) => setEditInterview({ ...editInterview, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Platform</label>
                     <select
                       className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-xs outline-none"
                       value={editInterview.type}
                       onChange={(e) => setEditInterview({ ...editInterview, type: e.target.value })}
                     >
                        <option value="Video">Video Conference</option>
                        <option value="In-Person">In-Person Meeting</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Link</label>
                    <input
                      className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-xs outline-none"
                      placeholder="Meeting link..."
                      value={editInterview.meetingLink || ""}
                      onChange={(e) => setEditInterview({ ...editInterview, meetingLink: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 relative">
                     <label className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Assignee (Host)</label>
                     <input
                       className="w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-xs outline-none"
                       placeholder="Search host..."
                       value={editInterview.interviewer || ""}
                       onChange={(e) => {
                         setEditInterview({ ...editInterview, interviewer: e.target.value });
                         setShowEditInterviewerSuggestions(true);
                       }}
                       onFocus={() => setShowEditInterviewerSuggestions(true)}
                     />
                     {showEditInterviewerSuggestions && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#F4F3EF] rounded-2xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                           {availableInterviewers
                              .filter(s => s.name?.toLowerCase().includes((editInterview.interviewer || "").toLowerCase()))
                              .map(s => (
                                 <div 
                                    key={s.id}
                                    className="px-4 py-3 hover:bg-[#FAFAF8] cursor-pointer border-b border-[#F4F3EF] last:border-0 flex items-center gap-3"
                                    onClick={() => {
                                       setEditInterview({ 
                                          ...editInterview, 
                                          interviewer: s.name,
                                          interviewerId: s.id 
                                       });
                                       setShowEditInterviewerSuggestions(false);
                                    }}
                                 >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(s.name, s.name.charAt(0))}`}>
                                       {s.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-xs font-bold text-[#1A1A2E]">{s.name}</span>
                                       <span className="text-[9px] font-medium text-[#9B9BAD] uppercase tracking-widest">{s.role}</span>
                                    </div>
                                 </div>
                              ))}
                        </div>
                     )}
                   </div>
                  <div className="pt-4 space-y-3">
                    <button 
                      onClick={handleSaveEdit}
                      className="w-full h-12 bg-[#1B4DA0] text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-all"
                    >
                      <Check size={14} /> Save Changes
                    </button>
                    <button onClick={() => setEditMode(false)} className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#9B9BAD] hover:text-rose-500 transition-colors">Discard Changes</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center text-xl font-bold shadow-lg border-4 border-white ${getAvatarColor(selectedInterview.candidateName, selectedInterview.candidateAvatar)}`}>
                      {selectedInterview.candidateAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedInterview.candidateName}</h3>
                        <Check size={16} className="text-emerald-500" />
                      </div>
                      <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-[2px]">{selectedInterview.role}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAFAF8] rounded-[24px] border border-[#F4F3EF] space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">Schedule</span>
                       <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest">{selectedInterview.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1A1A2E]">
                          <Calendar size={14} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-[#1A1A2E]">{new Date(selectedInterview.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                          <p className="text-[10px] font-bold text-[#9B9BAD]">{formatTime(selectedInterview.time)} · {selectedInterview.duration}m</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1A1A2E]">
                          <User size={14} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-[#1A1A2E]">{selectedInterview.interviewer}</p>
                          <p className="text-[10px] font-bold text-[#9B9BAD]">Interviewer</p>
                       </div>
                    </div>
                  </div>

                  {/* Google Meet / Meeting Link */}
                  {selectedInterview.meetingLink && (
                    <div className="space-y-2">
                       <h4 className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Meeting Link</h4>
                       <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#F4F3EF] space-y-3">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1A1A2E]">
                                <Video size={14} />
                             </div>
                             <a 
                                href={selectedInterview.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#1B4DA0] hover:underline truncate flex-1"
                             >
                                {selectedInterview.meetingLink}
                             </a>
                          </div>
                          <button
                             onClick={() => window.open(selectedInterview.meetingLink, '_blank', 'noopener,noreferrer')}
                             className="w-full h-10 bg-[#1B4DA0] text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#153e82] transition-all"
                          >
                             <Video size={12} /> Join Meeting
                          </button>
                       </div>
                    </div>
                  )}

                  {selectedInterview.notes && (
                    <div className="space-y-2">
                       <h4 className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Briefing Notes</h4>
                       <p className="text-xs font-medium text-[#4B4B5E] leading-relaxed bg-[#FAFAF8] p-4 rounded-2xl border border-[#F4F3EF] italic">"{selectedInterview.notes}"</p>
                    </div>
                  )}

                  <div className="pt-6 mt-4">
                     <button 
                        onClick={() => { setEditInterview({ ...selectedInterview }); setEditMode(true); }}
                        className="w-full h-12 bg-[#1B4DA0] text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-all"
                     >
                        <Pencil size={14} /> Edit Interview Details
                     </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* New Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
          <div 
            className="bg-white w-full max-w-6xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-[#FAFAF8]">
               <div className="flex items-center gap-6">
                  <button 
                     onClick={() => setIsScheduleModalOpen(false)}
                     className="flex items-center gap-2 text-[#6B6B7E] text-xs font-bold hover:text-[#1B4DA0] transition-all"
                  >
                     <ChevronRight size={14} className="rotate-180" /> Back
                  </button>
                  <div className="w-px h-4 bg-[#F4F3EF]" />
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Schedule New Interview</h3>
               </div>
               <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">
                  <Clock size={12} /> Appointment Slot
               </div>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                
                {/* Column 1: Candidate Details */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6">
                    <User size={14} className="text-blue-400" /> CANDIDATE DETAILS
                  </h4>

                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Candidate Name *</label>
                        <div className="relative">
                           <input 
                              className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3.5 text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all"
                              placeholder="Enter candidate name"
                              value={interviewForm.candidateName}
                              onChange={(e) => {
                                 const val = e.target.value;
                                 setInterviewForm({ ...interviewForm, candidateName: val });
                                 setShowCandidateSuggestions(true);
                              }}
                              onFocus={() => setShowCandidateSuggestions(true)}
                              required
                           />
                           
                           <AnimatePresence>
                              {showCandidateSuggestions && (
                                 <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-[120] w-full mt-2 bg-white border border-[#F4F3EF] rounded-xl shadow-xl max-h-60 overflow-y-auto"
                                 >
                                    {(() => {
                                       const filtered = candidates.filter(c => {
                                          const search = (interviewForm.candidateName || "").toLowerCase().trim();
                                          const name = (c.name || "").toLowerCase().trim();
                                          return name.includes(search);
                                       });
                                       
                                       if (filtered.length === 0) {
                                          return (
                                             <div className="px-4 py-6 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                No candidates found
                                             </div>
                                          );
                                       }
                                       
                                       return filtered.map((c) => (
                                          <button
                                             key={c.id}
                                             type="button"
                                             onClick={() => {
                                                setInterviewForm({
                                                   ...interviewForm,
                                                   candidateId: c.id,
                                                   candidateName: c.name,
                                                   candidateEmail: c.email,
                                                   positionTitle: c.positionTitle,
                                                   clientName: c.clientName
                                                });
                                                setShowCandidateSuggestions(false);
                                             }}
                                             className="w-full text-left px-4 py-3 hover:bg-[#F8FAFF] transition-colors border-b border-[#F4F3EF] last:border-0"
                                          >
                                             <p className="text-sm font-bold text-[#1A1A2E]">{c.name}</p>
                                             <p className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-wider">{c.email} • {c.positionTitle}</p>
                                          </button>
                                       ));
                                    })()}
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Candidate Email</label>
                        <input 
                           type="email"
                           className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3.5 text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all"
                           placeholder="Enter candidate email"
                           value={interviewForm.candidateEmail}
                           onChange={(e) => setInterviewForm({...interviewForm, candidateEmail: e.target.value})}
                        />
                     </div>
                  </div>
                </div>

                {/* Column 2: Position Details */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6">
                    <Video size={14} className="text-blue-400" /> POSITION DETAILS
                  </h4>

                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Position</label>
                        <input 
                           className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3.5 text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all"
                           placeholder="e.g., Senior Software Engineer"
                           value={interviewForm.positionTitle}
                           onChange={(e) => setInterviewForm({...interviewForm, positionTitle: e.target.value})}
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Client</label>
                        <input 
                           className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3.5 text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all"
                           placeholder="e.g., TechCorp India"
                           value={interviewForm.clientName}
                           onChange={(e) => setInterviewForm({...interviewForm, clientName: e.target.value})}
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Round</label>
                        <div className="relative">
                           <select 
                              className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3.5 text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all appearance-none"
                              value={interviewForm.round}
                              onChange={(e) => setInterviewForm({...interviewForm, round: e.target.value})}
                           >
                              <option value="Screening">Select Round</option>
                              <option value="Phone Screening">Phone Screening</option>
                              <option value="Technical Round">Technical Round</option>
                              <option value="Client Interview">Client Interview</option>
                              <option value="HR Round">HR Round</option>
                              <option value="Final Round">Final Round</option>
                           </select>
                           <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none" />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Column 3: Interview Details */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6">
                    <Clock size={14} className="text-blue-400" /> INTERVIEW DETAILS
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Date *</label>
                        <input 
                           type="date"
                           className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]"
                           value={interviewForm.date}
                           onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
                           required
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Time *</label>
                        <input 
                           type="time"
                           className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]"
                           value={interviewForm.time}
                           onChange={(e) => setInterviewForm({...interviewForm, time: e.target.value})}
                           required
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Duration</label>
                        <div className="relative">
                           <select 
                              className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] outline-none appearance-none"
                              value={interviewForm.duration}
                              onChange={(e) => setInterviewForm({...interviewForm, duration: e.target.value})}
                           >
                              <option value="30">30 mins</option>
                              <option value="45">45 mins</option>
                              <option value="60">60 mins</option>
                              <option value="90">90 mins</option>
                           </select>
                           <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none" />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Interview Type</label>
                        <div className="relative">
                           <select 
                              className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] outline-none appearance-none"
                              value={interviewForm.meetingType}
                              onChange={(e) => setInterviewForm({...interviewForm, meetingType: e.target.value})}
                           >
                              <option value="Video">Video Call</option>
                              <option value="In-Person">In-Person</option>
                              <option value="Phone">Phone Call</option>
                           </select>
                           <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] rotate-90 pointer-events-none" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Google Meet Link</label>
                     <div className="flex gap-2">
                        <input 
                           className="flex-1 bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] outline-none"
                           placeholder="https://meet.google.com/xxx-xxxx-xxx"
                           value={interviewForm.meetingLink}
                           onChange={(e) => setInterviewForm({...interviewForm, meetingLink: e.target.value})}
                        />
                        <button 
                           type="button"
                           onClick={() => setInterviewForm({...interviewForm, meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`})}
                           className="bg-[#1B4DA0] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#153e82] transition-all flex items-center gap-2"
                        >
                           Generate
                        </button>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Interviewer Name *</label>
                        <div className="relative">
                           <input 
                              className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all"
                              placeholder="Assign member"
                              value={interviewForm.interviewerName}
                              onChange={(e) => {
                                 const val = e.target.value;
                                 setInterviewForm({ ...interviewForm, interviewerName: val });
                                 setShowInterviewerSuggestions(true);
                              }}
                              onFocus={() => setShowInterviewerSuggestions(true)}
                              required
                           />
                           
                           <AnimatePresence>
                              {showInterviewerSuggestions && (
                                 <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-[120] w-full mt-2 bg-white border border-[#F4F3EF] rounded-xl shadow-xl max-h-60 overflow-y-auto"
                                 >
                                    {(() => {
                                       const filtered = availableInterviewers.filter(s => {
                                          const search = (interviewForm.interviewerName || "").toLowerCase().trim();
                                          const name = (s.name || "").toLowerCase().trim();
                                          return name.includes(search);
                                       });
                                       
                                       if (filtered.length === 0) {
                                          return (
                                             <div className="px-4 py-6 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                No members found
                                             </div>
                                          );
                                       }
                                       
                                       return filtered.map((s) => (
                                          <button
                                             key={s.id || s.name}
                                             type="button"
                                             onClick={() => {
                                                setInterviewForm({
                                                   ...interviewForm,
                                                   interviewerId: s.id,
                                                   interviewerName: s.name,
                                                   interviewerRole: s.role
                                                });
                                                setShowInterviewerSuggestions(false);
                                             }}
                                             className="w-full text-left px-4 py-3 hover:bg-[#F8FAFF] transition-colors border-b border-[#F4F3EF] last:border-0"
                                          >
                                             <p className="text-sm font-bold text-[#1A1A2E]">{s.name}</p>
                                             <p className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-wider">{s.role} • {s.department}</p>
                                          </button>
                                       ));
                                    })()}
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest pl-1">Role</label>
                        <input 
                           className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] outline-none"
                           placeholder="e.g., Tech Lead"
                           value={interviewForm.interviewerRole}
                           onChange={(e) => setInterviewForm({...interviewForm, interviewerRole: e.target.value})}
                        />
                     </div>
                  </div>
               </div>
              </div>

              <div className="mt-12 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-8 py-3 rounded-xl border border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-all flex items-center justify-center gap-2"
                >
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
    </div>
  );
}
