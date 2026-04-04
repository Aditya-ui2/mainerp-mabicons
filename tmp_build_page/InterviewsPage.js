import React, { useState, useEffect, useMemo } from "react";
import { Video, MapPin, X, Clock, User, ChevronRight, Pencil, Check, Download, Plus, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AVATAR_COLORS } from "./mockData";
import { getAllInterviews, updateInterview, updateInterviewStatus, getAllCandidates, getAllAdmins, scheduleNewInterview } from "../service/api";
const STATUS_COLORS = {
  "Scheduled": "bg-blue-50 text-blue-600 border-blue-100",
  "In-Progress": "bg-amber-50 text-amber-600 border-amber-100 animate-pulse",
  "Completed": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Cancelled": "bg-rose-50 text-rose-600 border-rose-100"
};
export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editInterview, setEditInterview] = useState(null);
  const [filter, setFilter] = useState("All");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [interviewForm, setInterviewForm] = useState({
    candidateId: "",
    candidateName: "",
    // for display
    role: "",
    // for display
    date: "",
    time: "",
    duration: "45",
    interviewerName: "",
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
      const [candRes, admRes] = await Promise.all([
        getAllCandidates(),
        getAllAdmins()
      ]);
      const rawCandidates = candRes.data || candRes.candidates || (Array.isArray(candRes) ? candRes : []);
      if (Array.isArray(rawCandidates)) {
        setCandidates(rawCandidates.map((c) => ({
          id: c.id,
          name: c.name,
          role: c.position?.title || c.role || "General Role",
          avatar: c.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        })));
      }
      const rawAdmins = admRes.data || (Array.isArray(admRes) ? admRes : []);
      if (Array.isArray(rawAdmins)) {
        setAdmins(rawAdmins.map((a) => ({
          name: a.name,
          email: a.email
        })));
      }
    } catch (error) {
      console.error("Failed to fetch support data:", error);
    }
  };
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await getAllInterviews();
      if (response.success) {
        const mapped = response.data.map((i) => ({
          id: i.id,
          candidateId: i.candidateId,
          candidateName: i.candidate?.name || "Unknown Candidate",
          candidateAvatar: i.candidate?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "C",
          role: i.position?.title || "Unknown Position",
          interviewer: i.interviewerName || "To be assigned",
          interviewerAvatar: i.interviewerName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "I",
          date: i.interviewDate,
          time: i.startTime,
          // Assuming "10:00 AM" or "10:00" format
          duration: i.duration || 45,
          type: i.meetingType || "Video",
          meetingLink: i.meetingLink,
          notes: i.notes,
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
        interviewerName: editInterview.interviewer
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
  const handleCandidateChange = (candidateId) => {
    const candidate = candidates.find((c) => c.id === candidateId || c.id === parseInt(candidateId));
    if (candidate) {
      setInterviewForm({
        ...interviewForm,
        candidateId: candidate.id,
        candidateName: candidate.name,
        role: candidate.role
      });
    } else {
      setInterviewForm({
        ...interviewForm,
        candidateId,
        candidateName: "",
        role: ""
      });
    }
  };
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        candidateId: interviewForm.candidateId,
        interviewDate: interviewForm.date,
        startTime: interviewForm.time,
        duration: parseInt(interviewForm.duration),
        interviewerName: interviewForm.interviewerName,
        meetingType: interviewForm.meetingType,
        meetingLink: interviewForm.meetingLink,
        notes: interviewForm.notes,
        status: "Scheduled"
      };
      const response = await scheduleNewInterview(dataToSubmit);
      if (response.success) {
        toast.success("Interview scheduled successfully!");
        setIsScheduleModalOpen(false);
        setInterviewForm({
          candidateId: "",
          candidateName: "",
          role: "",
          date: "",
          time: "",
          duration: "45",
          interviewerName: "",
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
  const interviewDates = useMemo(() => {
    const dates = [...new Set(interviews.map((i) => i.date))].sort();
    return dates;
  }, [interviews]);
  const dateLabels = useMemo(() => {
    const labels = {};
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
    interviewDates.forEach((date) => {
      const d = new Date(date);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      if (date === today) labels[date] = `Today \u2014 ${dayName}`;
      else if (date === tomorrow) labels[date] = `Tomorrow \u2014 ${dayName}`;
      else labels[date] = dayName;
    });
    return labels;
  }, [interviewDates]);
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
  const stats = useMemo(() => [
    { label: "Today", value: interviews.filter((i) => i.date === (/* @__PURE__ */ new Date()).toISOString().split("T")[0]).length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: interviews.filter((i) => i.feedbackStatus === "Pending" && i.status === "Completed").length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completion", value: interviews.length > 0 ? `${Math.round(interviews.filter((i) => i.status === "Completed").length / interviews.length * 100)}%` : "0%", icon: Check, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Sessions", value: interviews.length, icon: User, color: "text-indigo-600", bg: "bg-indigo-50" }
  ], [interviews]);
  return /* @__PURE__ */ React.createElement("div", { className: "p-5 lg:p-6 max-w-[1400px] mx-auto min-h-screen" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-8 flex-wrap gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-[#1A1A2E] tracking-tight", style: { fontFamily: "'Syne', sans-serif" } }, "Interview Schedule"), /* @__PURE__ */ React.createElement("p", { className: "text-[#9B9BAD] text-[11px] font-bold uppercase tracking-[2px] mt-1" }, "High-fidelity recruitment coordination")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => toast.success("Exporting..."),
      className: "flex items-center gap-2 px-4 py-2 bg-white border border-[#F4F3EF] text-[#6B6B7E] rounded-xl text-xs font-bold hover:bg-[#FAFAF8] transition-all shadow-sm"
    },
    /* @__PURE__ */ React.createElement(Download, { size: 14 }),
    " Export"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsScheduleModalOpen(true),
      className: "flex items-center gap-2 px-4 py-2 bg-[#1B4DA0] text-white rounded-xl text-xs font-bold hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/10"
    },
    /* @__PURE__ */ React.createElement(Plus, { size: 14 }),
    " Schedule"
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" }, stats.map((stat, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "bg-white p-4 rounded-2xl border border-[#F4F3EF] shadow-sm flex items-center gap-4 group" }, /* @__PURE__ */ React.createElement("div", { className: `w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0` }, /* @__PURE__ */ React.createElement(stat.icon, { size: 18 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest" }, stat.label), /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-bold text-[#1A1A2E] leading-tight mt-0.5" }, stat.value))))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 mb-8 bg-white p-1 rounded-xl border border-[#F4F3EF] w-fit shadow-xs" }, ["All", "Today", "Video", "Pending"].map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f,
      onClick: () => setFilter(f),
      className: `px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? "bg-[#1A1A2E] text-white" : "text-[#9B9BAD] hover:text-[#1A1A2E]"}`
    },
    f
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-10 relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute left-[23px] top-6 bottom-6 w-px bg-gradient-to-b from-[#F4F3EF] via-[#F4F3EF] to-transparent hidden md:block" }), interviewDates.map((date) => {
    const dayInterviews = interviews.filter((i) => i.date === date).sort((a, b) => a.time.localeCompare(b.time));
    if (dayInterviews.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { key: date, className: "relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-[#1A1A2E] flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0 z-20" }, /* @__PURE__ */ React.createElement("p", { className: "text-[8px] font-black uppercase tracking-widest opacity-60 leading-none mb-0.5" }, new Date(date).toLocaleDateString("en-US", { month: "short" })), /* @__PURE__ */ React.createElement("p", { className: "text-xl font-bold leading-none" }, new Date(date).getDate())), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-[#1A1A2E] tracking-tight", style: { fontFamily: "'Syne', sans-serif" } }, dateLabels[date]?.split(" \u2014 ")[0] || date), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-[#9B9BAD] font-black uppercase tracking-[2px]" }, dateLabels[date]?.split(" \u2014 ")[1] || ""))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4 md:ml-[44px]" }, dayInterviews.map((interview) => {
      const candidateColor = AVATAR_COLORS[interview.candidateAvatar] || "bg-gray-100 text-gray-600";
      const isFeedbackPending = interview.feedbackStatus === "Pending" && interview.status === "Completed";
      const isLive = interview.status === "In-Progress";
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: interview.id,
          onClick: () => setSelectedInterview(interview),
          className: `group relative bg-white rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-4 cursor-pointer border border-[#F4F3EF] hover:border-[#1B4DA0]/30 hover:shadow-xl transition-all duration-300 ${isLive ? "ring-2 ring-amber-400 ring-offset-2" : "shadow-sm"}`
        },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 lg:w-28 flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React.createElement("p", { className: "text-base font-bold text-[#1A1A2E]" }, formatTime(interview.time)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 mt-0.5" }, /* @__PURE__ */ React.createElement(Clock, { size: 10, className: "text-[#9B9BAD]" }), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-bold text-[#9B9BAD] uppercase tracking-wider" }, interview.duration, "m"))), /* @__PURE__ */ React.createElement("div", { className: `w-7 h-7 rounded-full flex items-center justify-center bg-[#FAFAF8] text-[#9B9BAD] lg:hidden border border-[#F4F3EF]` }, interview.type === "Video" ? /* @__PURE__ */ React.createElement(Video, { size: 12 }) : /* @__PURE__ */ React.createElement(MapPin, { size: 12 }))),
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 lg:w-[280px] xl:w-[320px] flex-shrink-0 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: `w-14 h-14 rounded-[20px] flex items-center justify-center text-base font-bold flex-shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105 ${candidateColor}` }, interview.candidateAvatar), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-0.5" }, /* @__PURE__ */ React.createElement("p", { className: "text-base font-bold text-[#1A1A2E] truncate group-hover:text-[#1B4DA0] transition-colors" }, interview.candidateName), /* @__PURE__ */ React.createElement(Check, { size: 12, className: "text-emerald-500 flex-shrink-0" })), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]" }, interview.role))),
        /* @__PURE__ */ React.createElement("div", { className: "hidden xl:flex items-center gap-3 flex-1 px-6 border-x border-[#F4F3EF]" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1 w-full" }, /* @__PURE__ */ React.createElement("p", { className: "text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest" }, "Host"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: `w-8 h-8 rounded-[12px] flex items-center justify-center text-[10px] font-bold shadow-sm ${AVATAR_COLORS[interview.interviewerAvatar]}` }, interview.interviewerAvatar), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-[#1A1A2E]" }, interview.interviewer)))),
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between lg:justify-end gap-4 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${STATUS_COLORS[interview.status] || "bg-gray-50 text-gray-500 border-gray-100"}` }, interview.status), isFeedbackPending && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 px-2 py-1 bg-rose-50 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-black text-rose-500 uppercase tracking-widest" }, "Feedback"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, interview.type === "Video" && interview.status !== "Completed" && /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              toast.success("Launching virtual room...");
            },
            className: "px-4 py-1.5 bg-[#1B4DA0] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/10"
          },
          "Join"
        ), /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-xl bg-[#FAFAF8] flex items-center justify-center text-[#9B9BAD] group-hover:bg-[#1A1A2E] group-hover:text-white transition-all border border-[#F4F3EF]" }, /* @__PURE__ */ React.createElement(ChevronRight, { size: 14 }))))
      );
    })));
  })), selectedInterview && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "fixed inset-0 bg-[#1A1A2E]/20 backdrop-blur-[1px] z-40 transition-opacity",
      onClick: () => {
        setSelectedInterview(null);
        setEditMode(false);
      }
    }
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "fixed right-0 top-0 h-full w-[380px] bg-white z-50 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
    },
    /* @__PURE__ */ React.createElement("div", { className: "sticky top-0 bg-white border-b border-[#F4F3EF] px-5 py-4 flex items-center justify-between z-10" }, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-[#1A1A2E]", style: { fontFamily: "'Syne', sans-serif" } }, "Details"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, !editMode ? /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setEditInterview({ ...selectedInterview });
          setEditMode(true);
        },
        className: "w-8 h-8 rounded-lg flex items-center justify-center bg-[#FAFAF8] text-[#6B6B7E] border border-[#F4F3EF]"
      },
      /* @__PURE__ */ React.createElement(Pencil, { size: 14 })
    ) : /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleSaveEdit,
        className: "w-8 h-8 rounded-lg flex items-center justify-center bg-[#1B4DA0] text-white"
      },
      /* @__PURE__ */ React.createElement(Check, { size: 14 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setSelectedInterview(null);
          setEditMode(false);
        },
        className: "w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500"
      },
      /* @__PURE__ */ React.createElement(X, { size: 14 })
    ))),
    /* @__PURE__ */ React.createElement("div", { className: "p-6 space-y-6" }, editMode && editInterview ? /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1" }, "Candidate"), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-sm outline-none font-bold",
        value: editInterview.candidateName,
        onChange: (e) => setEditInterview({ ...editInterview, candidateName: e.target.value })
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1" }, "Date"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        className: "w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-xs outline-none",
        value: editInterview.date,
        onChange: (e) => setEditInterview({ ...editInterview, date: e.target.value })
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1" }, "Time"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "time",
        className: "w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-xs outline-none",
        value: editInterview.time,
        onChange: (e) => setEditInterview({ ...editInterview, time: e.target.value })
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1" }, "Platform"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-xs outline-none",
        value: editInterview.type,
        onChange: (e) => setEditInterview({ ...editInterview, type: e.target.value })
      },
      /* @__PURE__ */ React.createElement("option", { value: "Video" }, "Video Conference"),
      /* @__PURE__ */ React.createElement("option", { value: "In-Person" }, "In-Person Meeting")
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1" }, "Link"), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "w-full bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl px-3 py-2 text-xs outline-none",
        placeholder: "Meeting link...",
        value: editInterview.meetingLink || "",
        onChange: (e) => setEditInterview({ ...editInterview, meetingLink: e.target.value })
      }
    )), /* @__PURE__ */ React.createElement("button", { onClick: () => setEditMode(false), className: "w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#9B9BAD] hover:text-rose-500 transition-colors" }, "Discard Changes")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-5" }, /* @__PURE__ */ React.createElement("div", { className: `w-16 h-16 rounded-[22px] flex items-center justify-center text-xl font-bold shadow-lg border-4 border-white ${AVATAR_COLORS[selectedInterview.candidateAvatar]}` }, selectedInterview.candidateAvatar), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-[#1A1A2E]", style: { fontFamily: "'Syne', sans-serif" } }, selectedInterview.candidateName), /* @__PURE__ */ React.createElement(Check, { size: 16, className: "text-emerald-500" })), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-[#9B9BAD] uppercase tracking-[2px]" }, selectedInterview.role))), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-[#FAFAF8] rounded-[24px] border border-[#F4F3EF] space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest" }, "Schedule"), /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest" }, selectedInterview.type)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-lg bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1A1A2E]" }, /* @__PURE__ */ React.createElement(Calendar, { size: 14 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-[#1A1A2E]" }, new Date(selectedInterview.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-[#9B9BAD]" }, formatTime(selectedInterview.time), " \xB7 ", selectedInterview.duration, "m"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-lg bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1A1A2E]" }, /* @__PURE__ */ React.createElement(User, { size: 14 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-[#1A1A2E]" }, selectedInterview.interviewer), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-[#9B9BAD]" }, "Interviewer")))), selectedInterview.notes && /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("h4", { className: "text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1" }, "Briefing Notes"), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-[#4B4B5E] leading-relaxed bg-[#FAFAF8] p-4 rounded-2xl border border-[#F4F3EF] italic" }, '"', selectedInterview.notes, '"')), /* @__PURE__ */ React.createElement("div", { className: "pt-4 flex flex-col gap-2" }, selectedInterview.meetingLink && /* @__PURE__ */ React.createElement(
      "a",
      {
        href: selectedInterview.meetingLink,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "w-full h-12 bg-[#1B4DA0] text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-blue-500/10"
      },
      /* @__PURE__ */ React.createElement(Video, { size: 14 }),
      " Join Meeting"
    ), /* @__PURE__ */ React.createElement("button", { className: "w-full h-11 bg-white border border-[#F4F3EF] text-[#6B6B7E] rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#FAFAF8] transition-all" }, "Reschedule Protocol"))))
  )), isScheduleModalOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20",
      onClick: (e) => e.stopPropagation()
    },
    /* @__PURE__ */ React.createElement("div", { className: "px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-[#FAFAF8]/50" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-[#1A1A2E]", style: { fontFamily: "'Syne', sans-serif" } }, "Schedule Interview"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] mt-1" }, "Coordinate high-fidelity assessment")), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setIsScheduleModalOpen(false),
        className: "w-10 h-10 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:text-rose-500 hover:rotate-90 transition-all duration-300"
      },
      /* @__PURE__ */ React.createElement(X, { size: 20 })
    )),
    /* @__PURE__ */ React.createElement("form", { onSubmit: handleScheduleSubmit, className: "p-10 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-8" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7" }, /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React.createElement("h4", { className: "text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6" }, /* @__PURE__ */ React.createElement(User, { size: 14 }), " Candidate & Role")), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1" }, "Target Candidate *"), /* @__PURE__ */ React.createElement("div", { className: "relative group" }, /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10",
        value: interviewForm.candidateId,
        onChange: (e) => handleCandidateChange(e.target.value),
        required: true
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Select Candidate"),
      candidates.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.name))
    ), /* @__PURE__ */ React.createElement(ChevronRight, { size: 16, className: "absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1" }, "Position / Role"), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "w-full bg-[#FAFAF8] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] opacity-60 cursor-not-allowed",
        value: interviewForm.role || "Select a candidate first",
        disabled: true
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2 mt-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6" }, /* @__PURE__ */ React.createElement(Clock, { size: 14 }), " Schedule Timing")), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1" }, "Date *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        className: "w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none focus:bg-[#EEF2FB]",
        value: interviewForm.date,
        onChange: (e) => setInterviewForm({ ...interviewForm, date: e.target.value }),
        required: true
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1" }, "Start Time *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "time",
        className: "w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none focus:bg-[#EEF2FB]",
        value: interviewForm.time,
        onChange: (e) => setInterviewForm({ ...interviewForm, time: e.target.value }),
        required: true
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1" }, "Duration"), /* @__PURE__ */ React.createElement("div", { className: "relative group" }, /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none focus:bg-[#EEF2FB] appearance-none pr-10",
        value: interviewForm.duration,
        onChange: (e) => setInterviewForm({ ...interviewForm, duration: e.target.value })
      },
      /* @__PURE__ */ React.createElement("option", { value: "30" }, "30 Minutes"),
      /* @__PURE__ */ React.createElement("option", { value: "45" }, "45 Minutes"),
      /* @__PURE__ */ React.createElement("option", { value: "60" }, "60 Minutes (1 Hour)"),
      /* @__PURE__ */ React.createElement("option", { value: "90" }, "90 Minutes"),
      /* @__PURE__ */ React.createElement("option", { value: "120" }, "120 Minutes (2 Hours)")
    ), /* @__PURE__ */ React.createElement(ChevronRight, { size: 16, className: "absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" }))), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2 mt-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6" }, /* @__PURE__ */ React.createElement(Video, { size: 14 }), " Meeting Details")), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1" }, "Host / Interviewer *"), /* @__PURE__ */ React.createElement("div", { className: "relative group" }, /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none focus:bg-[#EEF2FB] appearance-none pr-10",
        value: interviewForm.interviewerName,
        onChange: (e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value }),
        required: true
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Select Interviewer"),
      admins.map((a) => /* @__PURE__ */ React.createElement("option", { key: a.email, value: a.name }, a.name))
    ), /* @__PURE__ */ React.createElement(ChevronRight, { size: 16, className: "absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1" }, "Platform Type"), /* @__PURE__ */ React.createElement("div", { className: "relative group" }, /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none focus:bg-[#EEF2FB] appearance-none pr-10",
        value: interviewForm.meetingType,
        onChange: (e) => setInterviewForm({ ...interviewForm, meetingType: e.target.value })
      },
      /* @__PURE__ */ React.createElement("option", { value: "Video" }, "Video Conference"),
      /* @__PURE__ */ React.createElement("option", { value: "Voice" }, "Voice Call"),
      /* @__PURE__ */ React.createElement("option", { value: "In-Person" }, "In-Person")
    ), /* @__PURE__ */ React.createElement(ChevronRight, { size: 16, className: "absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1" }, "Meeting Link / Location"), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none focus:bg-[#EEF2FB]",
        placeholder: "e.g. Google Meet link or Office Room",
        value: interviewForm.meetingLink,
        onChange: (e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1" }, "Briefing Notes"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        rows: 3,
        className: "w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none focus:bg-[#EEF2FB] resize-none",
        placeholder: "Specific items to cover during the session...",
        value: interviewForm.notes,
        onChange: (e) => setInterviewForm({ ...interviewForm, notes: e.target.value })
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "pt-4 flex gap-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setIsScheduleModalOpen(false),
        className: "flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
      },
      "Cancel"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
      },
      "Confirm Schedule"
    )))
  )));
}
