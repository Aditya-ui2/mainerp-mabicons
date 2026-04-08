import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X, Mail, Phone, Calendar, ChevronRight, Plus, Download, Search, Filter,
  User, Briefcase, Tag, AlignLeft, LayoutGrid, List, AlertCircle,
  CheckSquare, Square, Trash2, Send, MapPin, DollarSign, Clock, Award,
  FileText, Upload, Eye, Video
} from "lucide-react";
import { toast } from "sonner";
import { PIPELINE_STAGES, AVATAR_COLORS, getAvatarColor } from "./mockData";
import {
  getAllCandidates,
  updateCandidateStatus,
  updateCandidate,
  addCandidate,
  getAllRecruitmentPositions,
  getAllClients,
  scheduleNewInterview,
  BASE_URL
} from "../service/api";

const STAGE_COLORS = {
  Applied: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
    count: "bg-slate-100 text-slate-600",
  },
  Screening: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
    count: "bg-blue-100 text-blue-600",
  },
  Interview: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    count: "bg-amber-100 text-amber-600",
  },
  Offer: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-400",
    count: "bg-purple-100 text-purple-600",
  },
  Hired: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    count: "bg-emerald-100 text-emerald-600",
  },
};

const Edit2 = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

export default function CandidatesPage({ setActiveTab }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([
    { id: 'pos-101', title: 'Senior Software Engineer', clientName: 'TechSolutions Inc.' },
    { id: 'pos-102', title: 'Frontend Developer', clientName: 'Microsoft' },
    { id: 'pos-103', title: 'UI/UX Designer', clientName: 'Google' }
  ]);
  const [clients, setClients] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [viewMode, setViewMode] = useState("kanban");
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientFilter, setSelectedClientFilter] = useState("All Clients");
  const [targetRoleFilter, setTargetRoleFilter] = useState("");
  const [tempTargetRoleFilter, setTempTargetRoleFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Schedule Interview Modal state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ candidateId: '', candidateName: '', candidateEmail: '', positionTitle: '', clientName: '', date: '', time: '', duration: '60', meetingType: 'Video', meetingLink: '', round: 'Technical Round', interviewerName: '', interviewerRole: '' });
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [showCvPreview, setShowCvPreview] = useState(false);

  // Offer Modal state
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({ candidateId: '', candidateName: '', positionTitle: '', clientName: '', salary: '', joiningDate: '', offerDeadline: '', notes: '' });

  // New Candidate Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    positionId: "",
    roleType: "",
    displayJobTitle: "",
    clientId: "",
    clientName: "",
    experience: "",
    noticePeriod: "",
    currentSalary: "",
    expectedSalary: "",
    skills: "",
    source: "",
    resume: null
  });

  useEffect(() => {
    fetchCandidates();
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    // 1. Fetch Positions
    try {
      const posRes = await getAllRecruitmentPositions();
      const rawPositions = posRes.data || posRes.positions || (Array.isArray(posRes) ? posRes : []);
      if (Array.isArray(rawPositions)) {
        const mappedPositions = rawPositions.map(p => ({
          id: p.id || p._id,
          title: p.title || 'Untitled Position',
          clientName: p.clientName || p.client?.companyName || p.client?.name || '',
          clientId: p.clientId || p.client?.id
        }));
        setPositions(mappedPositions);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }

    // 2. Fetch Clients
    try {
      const cliRes = await getAllClients();
      const rawClients = cliRes.data?.clients || cliRes.clients || cliRes.data || (Array.isArray(cliRes) ? cliRes : []);
      if (Array.isArray(rawClients)) {
        const mappedClients = rawClients.map(c => ({
          id: c.id || c._id,
          name: c.companyName || c.name || 'Unknown Client'
        }));
        setClients(mappedClients);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await getAllCandidates();
      if (response.success) {
        // Map backend candidates to frontend structure
        const mapped = response.data.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || "N/A",
          role: c.position?.title || "Unknown Position",
          positionId: c.positionId,
          clientId: c.client || c.clientId || c.position?.client || c.position?.clientId,
          clientName: c.client?.companyName || c.client?.name || c.clientName || c.position?.client?.companyName || c.position?.client?.name,
          stage: mapBackendToFrontendStage(c.stage, c.status),
          appliedDate: c.createdAt,
          location: c.location || "Remote",
          currentSalary: c.currentSalary,
          expectedSalary: c.expectedSalary,
          noticePeriod: c.noticePeriod,
          experience: c.experience,
          skills: c.skills ? (Array.isArray(c.skills) ? c.skills : c.skills.split(',')) : ["General"],
          avatar: c.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
          lastMovedDate: c.updatedAt,
          cvUrl: c.cvUrl || null,
          cvFileName: c.cvFileName || null,
          stageHistory: c.stageHistory || [{ stage: mapBackendToFrontendStage(c.stage, c.status), date: c.createdAt }],
          raw: c // Keep raw data for debugging/advanced use
        }));
        setCandidates(mapped);
      }
    } catch (error) {
      toast.error("Failed to load candidates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const mapBackendToFrontendStage = (stage, status) => {
    if (stage === 'Joined' || status === 'Selected') return "Hired";
    if (stage === 'Offer Sent') return "Offer";
    if (['Technical Round', 'HR Round', 'Client Interview'].includes(stage) || status === 'Interview' || status === 'Shortlisted') return "Interview";
    if (stage === 'Phone Interview' || status === 'Shared') return "Screening";
    return "Applied";
  };

  const mapFrontendToBackendStage = (uiStage) => {
    switch (uiStage) {
      case "Hired": return { stage: "Joined", status: "Selected" };
      case "Offer": return { stage: "Offer Sent", status: "Shortlisted" };
      case "Interview": return { stage: "Technical Round", status: "Interview" };
      case "Screening": return { stage: "Phone Interview", status: "Shared" };
      case "Applied": default: return { stage: "Screening", status: "Submitted" };
    }
  };

  const handleDragStart = (e, candidateId) => {
    setDragId(candidateId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  };

  const handleDrop = async (e, stage) => {
    e.preventDefault();
    if (!dragId) return;

    const candidate = candidates.find(c => c.id === dragId);
    if (!candidate || candidate.stage === stage) {
      setDragId(null);
      setDragOverStage(null);
      return;
    }

    try {
      const backendMapping = mapFrontendToBackendStage(stage);
      await updateCandidateStatus(dragId, {
        status: backendMapping.status,
        stage: backendMapping.stage,
        notes: `Moved to ${stage} via Pipeline View`
      });

      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== dragId) return c;
          const newHistory = [...(c.stageHistory || [])];
          newHistory.push({ stage, date: new Date().toISOString() });
          return { ...c, stage, stageHistory: newHistory, lastMovedDate: new Date().toISOString() };
        })
      );
      toast.success(`Moved ${candidate.name} to ${stage}`);

      // Show detail drawer when moved to Screening
      if (stage === 'Screening') {
        const updatedCandidate = { ...candidate, stage, lastMovedDate: new Date().toISOString() };
        setSelectedCandidate(updatedCandidate);
      }

      // Open Schedule Interview dialog when moved to Interview
      if (stage === 'Interview') {
        const updatedC = { ...candidate, stage, lastMovedDate: new Date().toISOString() };
        setScheduleForm({
          candidateId: updatedC.id,
          candidateName: updatedC.name,
          candidateEmail: updatedC.email || '',
          positionTitle: updatedC.role || '',
          clientName: updatedC.clientName || '',
          date: '', time: '', duration: '60', meetingType: 'Video', meetingLink: '',
          round: 'Technical Round', interviewerName: '', interviewerRole: ''
        });
        setIsScheduleOpen(true);
      }

      // Open Offer form when moved to Offer
      if (stage === 'Offer') {
        const updatedC = { ...candidate, stage, lastMovedDate: new Date().toISOString() };
        setOfferForm({
          candidateId: updatedC.id,
          candidateName: updatedC.name,
          positionTitle: updatedC.role || '',
          clientName: updatedC.clientName || '',
          salary: '', joiningDate: '', offerDeadline: '', notes: ''
        });
        setIsOfferOpen(true);
      }
    } catch (error) {
      toast.error("Failed to update candidate stage");
    } finally {
      setDragId(null);
      setDragOverStage(null);
    }
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverStage(null);
  };

  const handleSaveEdit = async () => {
    if (!editCandidate) return;
    try {
      // 1. Sanitize payload: remove UI-only and complex objects
      // The backend expects flat fields or specific types (like skills as string/array)
      const {
        id, name, email, phone, positionId, clientId,
        skills, experience, currentSalary, expectedSalary,
        notes, location, noticePeriod, source, rating
      } = editCandidate;

      const sanitizedPayload = {
        name, email, phone, positionId, clientId,
        skills, experience, currentSalary, expectedSalary,
        notes, location, noticePeriod, source, rating
      };

      const response = await updateCandidate(id, sanitizedPayload);

      if (response.success) {
        // Sync local state with fresh data from backend (including reloaded associations)
        const updatedCandidate = {
          ...editCandidate,
          ...response.data,
          // Re-map fields that frontend expects but backend returns differently
          role: response.data.position?.title || "Unknown Position",
          stage: mapBackendToFrontendStage(response.data.stage, response.data.status),
          lastMovedDate: response.data.updatedAt
        };

        setCandidates((prev) => prev.map((c) => (c.id === id ? updatedCandidate : c)));
        setSelectedCandidate(updatedCandidate);
        setEditMode(false);
        setEditCandidate(null);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error('Update failed detailed log:', error);
      // The error re-thrown by api.jsx might be the response.data itself
      const errorMsg = error.message || error.error || "Failed to update candidate profile";
      toast.error(errorMsg);
    }
  };

  const handleStatusChange = async (candidateId, newStage) => {
    try {
      const backendMapping = mapFrontendToBackendStage(newStage);
      await updateCandidateStatus(candidateId, {
        status: backendMapping.status,
        stage: backendMapping.stage,
        notes: `Moved to ${newStage}`
      });
      setCandidates(prev => prev.map(c =>
        c.id === candidateId
          ? { ...c, stage: newStage, stageHistory: [...(c.stageHistory || []), { stage: newStage, date: new Date().toISOString() }], lastMovedDate: new Date().toISOString() }
          : c
      ));
      toast.success(`Moved to ${newStage}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleBatchMove = async (newStage) => {
    try {
      const backendMapping = mapFrontendToBackendStage(newStage);
      await Promise.all(selectedIds.map(id => updateCandidateStatus(id, {
        status: backendMapping.status,
        stage: backendMapping.stage,
        notes: `Batch move to ${newStage}`
      })));
      setCandidates(prev => prev.map(c =>
        selectedIds.includes(c.id)
          ? { ...c, stage: newStage, stageHistory: [...(c.stageHistory || []), { stage: newStage, date: new Date().toISOString() }], lastMovedDate: new Date().toISOString() }
          : c
      ));
      toast.success(`Moved ${selectedIds.length} candidates to ${newStage}`);
      setSelectedIds([]);
    } catch (error) {
      toast.error("Failed to move batch of candidates");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePositionChange = (posId) => {
    const pos = positions.find(p => p.id === posId);
    if (pos) {
      setCandidateForm(prev => ({
        ...prev,
        positionId: posId,
        clientId: pos.clientId || prev.clientId,
        clientName: pos.clientName || prev.clientName,
        displayJobTitle: pos.title || prev.displayJobTitle
      }));
    } else {
      setCandidateForm(prev => ({ ...prev, positionId: posId }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!candidateForm.name || !candidateForm.email || !candidateForm.positionId) {
      toast.error("Name, Email, and Position are required.");
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(candidateForm).forEach(key => {
        if (key === 'resume') {
          if (candidateForm.resume) formData.append("resume", candidateForm.resume);
        } else if (key === 'skills') {
          // Send as comma-separated string that the backend now parses robustly
          const skillsArray = candidateForm.skills ? candidateForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
          formData.append("skills", skillsArray.join(', '));
        } else {
          formData.append(key, candidateForm[key]);
        }
      });

      // Default metadata
      formData.append("stage", "Screening");
      formData.append("status", "Submitted");

      // FOR UI FIX/TESTING: Add locally even if API fails
      const newMockCandidate = {
        id: Date.now().toString(),
        name: candidateForm.name,
        email: candidateForm.email,
        phone: candidateForm.phone || '',
        location: candidateForm.location || '',
        role: positions.find(p => p.id === candidateForm.positionId)?.title || candidateForm.displayJobTitle || 'Candidate',
        clientName: positions.find(p => p.id === candidateForm.positionId)?.clientName || candidateForm.clientName || '',
        stage: "Screening",
        status: "Submitted",
        experience: candidateForm.experience || '',
        skills: candidateForm.skills ? candidateForm.skills.split(',').map(s => s.trim()) : [],
        appliedDate: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0]
      };

      setCandidates(prev => [newMockCandidate, ...prev]);
      toast.success(`${candidateForm.name} added successfully (Local Mode)!`);
      setIsCreateModalOpen(false);
      setCandidateForm({
        name: "", email: "", phone: "", location: "",
        positionId: "", roleType: "", displayJobTitle: "",
        clientId: "", clientName: "", experience: "", noticePeriod: "",
        currentSalary: "", expectedSalary: "", skills: "", source: "",
        resume: null
      });

      // Original API logic preserved below
      const response = await addCandidate(formData);
      if (response && response.success) {
        fetchCandidates();
      }
    } catch (error) {
      console.warn("API Offline - Running in Local Mode");
    }
  };

  const filteredCandidates = useMemo(() => {
    let result = candidates;
    if (selectedClientFilter !== "All Clients") {
      result = result.filter(c => (c.clientName?.trim() || "Internal Team") === selectedClientFilter);
    }
    if (targetRoleFilter) {
      result = result.filter(c => c.role === targetRoleFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        c.role.toLowerCase().includes(lower) ||
        (c.clientName && c.clientName.toLowerCase().includes(lower)) ||
        c.skills.some(s => s.toLowerCase().includes(lower))
      );
    }
    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter(c => {
        const appliedDate = c.appliedDate ? new Date(c.appliedDate) : (c.createdAt ? new Date(c.createdAt) : null);
        if (!appliedDate) return true;
        if (dateFilter === "today") {
          return appliedDate.toDateString() === now.toDateString();
        } else if (dateFilter === "week") {
          const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0, 0, 0, 0);
          return appliedDate >= weekStart;
        } else if (dateFilter === "prev-week") {
          const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() - 7); weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23, 59, 59, 999);
          return appliedDate >= weekStart && appliedDate <= weekEnd;
        } else if (dateFilter === "month") {
          return appliedDate.getMonth() === now.getMonth() && appliedDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === "prev-month") {
          const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const prevMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          return appliedDate.getMonth() === prevMonth && appliedDate.getFullYear() === prevMonthYear;
        } else if (dateFilter === "quarter") {
          const q = Math.floor(now.getMonth() / 3);
          return Math.floor(appliedDate.getMonth() / 3) === q && appliedDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === "prev-quarter") {
          const currentQ = Math.floor(now.getMonth() / 3);
          const prevQ = currentQ === 0 ? 3 : currentQ - 1;
          const prevQYear = currentQ === 0 ? now.getFullYear() - 1 : now.getFullYear();
          return Math.floor(appliedDate.getMonth() / 3) === prevQ && appliedDate.getFullYear() === prevQYear;
        } else if (dateFilter === "year") {
          return appliedDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === "custom") {
          let match = true;
          if (customStartDate) match = appliedDate >= new Date(customStartDate);
          if (customEndDate && match) match = appliedDate <= new Date(customEndDate + 'T23:59:59');
          return match;
        }
        return true;
      });
    }
    return result;
  }, [candidates, searchTerm, selectedClientFilter, targetRoleFilter, dateFilter, customStartDate, customEndDate]);

  const activeClientNames = useMemo(() => {
    return Array.from(new Set(candidates.map(c => c.clientName?.trim() || 'Internal Team'))).sort();
  }, [candidates]);

  // Read interview feedback from localStorage to show golden star on high-rated candidates
  const [starredCandidateNames, setStarredCandidateNames] = useState(new Set());
  useEffect(() => {
    const loadFeedback = () => {
      try {
        const fb = JSON.parse(localStorage.getItem('interviewFeedback') || '{}');
        const names = new Set();
        Object.values(fb).forEach(entry => {
          const vals = [entry.skills, entry.communication, entry.behaviour, entry.knowledge, entry.attitude].map(v => parseInt(v) || 0);
          const avg = vals.reduce((a, b) => a + b, 0) / 5;
          if (avg > 5 && entry.candidateName) names.add(entry.candidateName.toLowerCase().trim());
        });
        setStarredCandidateNames(names);
      } catch (e) { setStarredCandidateNames(new Set()); }
    };
    loadFeedback();
    window.addEventListener('storage', loadFeedback);
    window.addEventListener('focus', loadFeedback);
    return () => {
      window.removeEventListener('storage', loadFeedback);
      window.removeEventListener('focus', loadFeedback);
    };
  }, []);

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-8 relative font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Candidate Pipeline</h1>
          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mt-2">{candidates.length} Total Candidates In Pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#F4F3EF] p-1 rounded-xl border border-[#E8E7E2]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "kanban"
                ? "bg-white text-[#1B4DA0] shadow-sm"
                : "text-[#6B6B7E] hover:text-[#1A1A2E]"
                }`}
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "table"
                ? "bg-white text-[#1B4DA0] shadow-sm"
                : "text-[#6B6B7E] hover:text-[#1A1A2E]"
                }`}
            >
              <List size={14} />
              List
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg active:scale-95 text-center"
          >
            <Plus size={18} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Search Bar + Filters */}
      <div className="flex items-center gap-3 mb-6 bg-white p-2 rounded-2xl border border-[#F4F3EF] shadow-sm flex-wrap">
        <div className="flex items-center gap-3 bg-[#F4F3EF] px-5 py-3 rounded-2xl flex-1 border border-transparent focus-within:border-[#1B4DA0]/20 transition-all min-w-[200px]">
          <Search size={14} className="text-[#9B9BAD]" />
          <input
            type="text"
            placeholder="Search by name, role, or skill..."
            className="bg-transparent border-0 outline-none text-xs text-[#1A1A2E] w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); if (e.target.value !== 'custom') { setCustomStartDate(''); setCustomEndDate(''); } }}
          className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2.5 outline-none border-0 cursor-pointer"
        >
          <option value="all">All Time</option>
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
              className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-3 py-2.5 outline-none border-0 cursor-pointer" />
            <span className="text-[10px] text-[#9B9BAD] font-bold">to</span>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
              className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-3 py-2.5 outline-none border-0 cursor-pointer" />
          </div>
        )}
        <select
          value={targetRoleFilter}
          onChange={(e) => setTargetRoleFilter(e.target.value)}
          className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2.5 outline-none border-0 cursor-pointer"
        >
          <option value="">All Roles</option>
          {positions.map(p => (
            <option key={p.id} value={p.title}>{p.title}</option>
          ))}
        </select>

        {/* Client Filter Dropdown */}
        <select
          value={selectedClientFilter}
          onChange={(e) => setSelectedClientFilter(e.target.value)}
          className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2.5 outline-none border-0 cursor-pointer"
        >
          <option value="All Clients">All Clients</option>
          <option value="Google">Google</option>
          <option value="Microsoft">Microsoft</option>
          <option value="Amazon">Amazon</option>
          {activeClientNames.filter(name => !["Google", "Microsoft", "Amazon"].includes(name)).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

      </div>

      {/* Kanban / Table Content Area */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-5 gap-2 min-h-[500px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stage);
            const colors = STAGE_COLORS[stage] || STAGE_COLORS.Applied;
            const isDragOver = dragOverStage === stage;

            return (
              <div
                key={stage}
                className={`rounded-[24px] border-2 transition-all duration-200 ${colors.border} ${isDragOver ? "ring-2 ring-[#1B4DA0]/40 scale-[1.01] bg-[#F8FAFF]" : colors.bg
                  }`}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDrop={(e) => handleDrop(e, stage)}
                onDragLeave={() => setDragOverStage(null)}
              >
                {/* Column Header */}
                <div className="px-3 py-3 flex items-center justify-between border-b border-black/5 rounded-t-[24px]">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className="text-sm font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {stage}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${colors.count}`}>
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-2 space-y-2 min-h-[100px]">
                  {!loading ? stageCandidates.map((candidate) => {
                    const isDragging = dragId === candidate.id;
                    const avatarColor = getAvatarColor(candidate.name, candidate.avatar);
                    const isStuck = candidate.lastMovedDate && (new Date().getTime() - new Date(candidate.lastMovedDate).getTime()) > 3 * 24 * 60 * 60 * 1000;

                    return (
                      <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedCandidate(candidate)}
                        className={`bg-white rounded-xl p-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 select-none group border-2 border-[#E8E7E2] relative ${isDragging
                          ? "opacity-40 scale-95"
                          : "hover:-translate-y-1 hover:shadow-lg hover:border-[#1B4DA0]/20"
                          } ${selectedIds.includes(candidate.id) ? 'ring-2 ring-[#1B4DA0] border-transparent' : 'shadow-sm'}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (candidate.cvUrl) {
                              const url = candidate.cvUrl.startsWith('http') ? candidate.cvUrl : `${BASE_URL}${candidate.cvUrl.startsWith('/') ? '' : '/'}${candidate.cvUrl}`;
                              window.open(url, '_blank');
                            } else {
                              toast.error('No CV uploaded for this candidate');
                            }
                          }}
                          className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-[#0D47A1] text-white rounded-lg text-[9px] font-bold hover:bg-[#0a3a82] transition-all shadow-md z-10 active:scale-95"
                        >
                          <Eye size={11} /> View CV
                        </button>
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[10px] font-bold flex-shrink-0 relative ${avatarColor} ${isStuck
                              ? "ring-2 ring-amber-400 ring-offset-2 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                              : "shadow-sm border border-white/20"
                              }`}
                          >
                            {candidate.avatar}
                            {isStuck && (
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                                <AlertCircle size={10} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <p className="text-sm font-bold text-[#1A1A2E] truncate group-hover:text-[#1B4DA0] transition-colors pb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                                  {candidate.name}
                                </p>
                                <CheckSquare size={12} className="text-emerald-500 flex-shrink-0" />
                                {starredCandidateNames.has(candidate.name?.toLowerCase().trim()) && (
                                  <span className="text-amber-400 flex-shrink-0" title="High Feedback Score">★</span>
                                )}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleSelect(candidate.id); }}
                                className={`p-1 rounded-md transition-all ${selectedIds.includes(candidate.id) ? 'text-[#1B4DA0]' : 'text-[#C5C5D2] hover:bg-[#F4F3EF] opacity-0 group-hover:opacity-100'}`}
                              >
                                {selectedIds.includes(candidate.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                              </button>
                            </div>
                            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] truncate">
                              {candidate.role}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-[#9B9BAD]">
                            <span className="flex items-center gap-1.5 opacity-70">
                              <Briefcase size={10} />
                              Pipeline Progress
                            </span>
                            <span>{Math.round(((PIPELINE_STAGES.indexOf(candidate.stage) + 1) / PIPELINE_STAGES.length) * 100)}%</span>
                          </div>
                          <div className="h-1 bg-[#F4F3EF] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-300 transition-all duration-700"
                              style={{ width: `${((PIPELINE_STAGES.indexOf(candidate.stage) + 1) / PIPELINE_STAGES.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {(candidate.skills || []).slice(0, 2).map((skill) => (
                            <span
                              key={skill}
                              className="text-[9px] bg-[#F8FAFF] text-[#1B4DA0] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wide border border-[#1B4DA0]/5"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.stage === "Interview" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toast.success("Opening Calendar Scheduler..."); }}
                              className="ml-auto text-[9px] font-bold text-[#6B6B7E] hover:text-[#1A1A2E] flex items-center gap-1 group/btn transition-colors"
                            >
                              <Award size={10} className="group-hover/btn:text-[#1B4DA0]" />
                              Assess
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }) : (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-40 bg-white/50 rounded-2xl animate-pulse border border-[#F4F3EF]" />
                    ))
                  )}

                  {!loading && stageCandidates.length === 0 && (
                    <div
                      className={`h-20 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${isDragOver ? "border-[#1B4DA0]/40 bg-[#1B4DA0]/5" : "border-[#F4F3EF] bg-transparent opacity-30"
                        }`}
                    >
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">
                        {isDragOver ? "Drop Here" : "No Candidates"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#F4F3EF]">
                  <th className="px-6 py-5 w-10">
                    <button
                      onClick={() => selectedIds.length === candidates.length ? setSelectedIds([]) : setSelectedIds(candidates.map(c => c.id))}
                      className={`p-1 rounded-md transition-all ${selectedIds.length === candidates.length ? 'text-[#1B4DA0]' : 'text-[#C5C5D2]'}`}
                    >
                      {selectedIds.length === candidates.length ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </th>
                  {["Candidate Info", "Department / Role", "Applied Date", "Pipeline Stage", "Quick Actions", ""].map((h) => (
                    <th key={h} className={`px-6 py-5 text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ${h === "" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3EF]">
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className={`hover:bg-[#FAFAF8] transition-colors group cursor-pointer ${selectedIds.includes(candidate.id) ? 'bg-blue-50/40' : ''}`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelect(candidate.id)}
                        className={`p-1 rounded-md transition-all ${selectedIds.includes(candidate.id) ? 'text-[#1B4DA0]' : 'text-[#C5C5D2] hover:text-[#1A1A2E]'}`}
                      >
                        {selectedIds.includes(candidate.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-[11px] font-bold relative border border-white/30 shadow-sm ${getAvatarColor(candidate.name, candidate.avatar)}`}>
                          {candidate.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>{candidate.name}</span>
                            <CheckSquare size={12} className="text-emerald-500" />
                            {starredCandidateNames.has(candidate.name?.toLowerCase().trim()) && (
                              <span className="text-amber-400" title="High Feedback Score">★</span>
                            )}
                          </div>
                          <p className="text-[9px] text-[#9B9BAD] font-bold uppercase tracking-[2px] mt-0.5">{candidate.email.split('@')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-[#1A1A2E]">{candidate.role}</p>
                      <p className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-wider mt-0.5">{candidate.raw?.position?.department || 'Recruitment'}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#6B6B7E] font-bold">
                      {formatDate(candidate.appliedDate)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${STAGE_COLORS[candidate.stage]?.dot || 'bg-slate-400'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${STAGE_COLORS[candidate.stage]?.count?.split(' ')[1] || 'text-slate-600'}`}>
                          {candidate.stage}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-flex items-center group/select">
                        <select
                          value={candidate.stage}
                          onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                          className="bg-[#F4F3EF] border-0 rounded-xl pl-4 pr-6 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-[#1B4DA0] outline-none hover:bg-blue-50 transition-all cursor-pointer appearance-none border-b-2 border-transparent focus:border-[#1B4DA0]/20"
                        >
                          {PIPELINE_STAGES.map((s) => <option key={s} value={s}>Move to {s}</option>)}
                        </select>
                        <ChevronRight size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          if (candidate.cvUrl) {
                            const url = candidate.cvUrl.startsWith('http') ? candidate.cvUrl : `${BASE_URL}${candidate.cvUrl.startsWith('/') ? '' : '/'}${candidate.cvUrl}`;
                            window.open(url, '_blank');
                          } else {
                            toast.error('No CV uploaded for this candidate');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0D47A1] text-white rounded-xl text-[10px] font-bold hover:bg-[#0a3a82] transition-all shadow-md shadow-[#0D47A1]/20 active:scale-95 ml-auto"
                      >
                        <Eye size={12} /> View CV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Action Footer */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-600">
          <div className="bg-[#1A1A2E] text-white px-6 py-3.5 rounded-[30px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex items-center gap-6 border border-white/10 backdrop-blur-3xl">
            <div className="flex items-center gap-4 pr-8 border-r border-white/10">
              <div className="w-10 h-10 bg-[#1B4DA0] rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">{selectedIds.length}</div>
              <div>
                <p className="text-sm font-bold">Selected</p>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-[2px]">Batch Tool</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Move Stage</p>
                <div className="flex gap-2">
                  {PIPELINE_STAGES.filter(s => s !== "Applied").slice(0, 3).map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleBatchMove(stage)}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-bold transition-all border border-white/5 uppercase tracking-wider"
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <button
                  onClick={() => { setSelectedIds([]); toast.error("Batch Rejected"); }}
                  className="w-10 h-10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all flex items-center justify-center border border-rose-500/10"
                  title="Reject Selected"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => {
                    const selected = candidates.filter(c => selectedIds.includes(c.id));
                    const withCV = selected.filter(c => c.cvUrl);
                    if (withCV.length === 0) {
                      toast.error("No CVs available for selected candidates");
                      return;
                    }
                    withCV.forEach(c => {
                      const url = c.cvUrl.startsWith('http') ? c.cvUrl : `${BASE_URL}${c.cvUrl.startsWith('/') ? '' : '/'}${c.cvUrl}`;
                      window.open(url, '_blank');
                    });
                    toast.success(`Opening ${withCV.length} CV(s)...`);
                    setSelectedIds([]);
                  }}
                  className="px-4 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center justify-center border border-white/5 gap-2 text-[10px] font-bold"
                >
                  <FileText size={16} />
                  VIEW CV
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-[10px] font-bold text-white/40 hover:text-white transition-all ml-4 uppercase tracking-[2px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedCandidate && createPortal(
        <>
          <div
            className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[99998] transition-all duration-300"
            onClick={() => { setSelectedCandidate(null); setEditMode(false); }}
          />
          <div
            className="fixed right-0 top-0 h-full w-full sm:w-[550px] md:w-[650px] bg-white z-[99999] overflow-y-auto shadow-[-16px_0_64px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-300 transform translate-x-0"
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {editMode ? "Edit Profile" : "Profile Details"}
                </h2>
                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] mt-1">Application Hub</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedCandidate(null); setEditMode(false); }}
                  className="w-10 h-10 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 space-y-10">
              {editMode && editCandidate ? (
                <div className="space-y-6 pb-20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 text-[10px] font-black">Full Name</label>
                      <input
                        className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                        value={editCandidate.name}
                        onChange={(e) => setEditCandidate({ ...editCandidate, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 text-[10px] font-black font-black">Email</label>
                      <input
                        className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all font-black"
                        value={editCandidate.email}
                        onChange={(e) => setEditCandidate({ ...editCandidate, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 font-black">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 font-black">Phone</label>
                      <input
                        className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                        value={editCandidate.phone}
                        onChange={(e) => setEditCandidate({ ...editCandidate, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2 font-black">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 font-black">Location</label>
                      <input
                        className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                        value={editCandidate.location}
                        onChange={(e) => setEditCandidate({ ...editCandidate, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#F4F3EF] font-black">
                    <h4 className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-widest">Professional Details</h4>
                    <div className="grid grid-cols-2 gap-4 font-black">
                      <div className="space-y-2 font-black">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 font-black">Experience (Years)</label>
                        <input
                          className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                          value={editCandidate.experience}
                          onChange={(e) => setEditCandidate({ ...editCandidate, experience: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 font-black">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 font-black">Notice Period</label>
                        <select
                          className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all appearance-none"
                          value={editCandidate.noticePeriod}
                          onChange={(e) => setEditCandidate({ ...editCandidate, noticePeriod: e.target.value })}
                        >
                          <option value="">Select duration</option>
                          <option value="Immediate">Immediate</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="45 Days">45 Days</option>
                          <option value="60 Days">60 Days</option>
                          <option value="90 Days">90 Days</option>
                        </select>
                      </div>
                      <div className="space-y-2 font-black">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 font-black">Current CTC</label>
                        <input
                          className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                          value={editCandidate.currentSalary}
                          onChange={(e) => setEditCandidate({ ...editCandidate, currentSalary: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 font-black">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 font-black">Expected CTC</label>
                        <input
                          className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                          value={editCandidate.expectedSalary}
                          onChange={(e) => setEditCandidate({ ...editCandidate, expectedSalary: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#F4F3EF] font-black">
                    <h4 className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-widest">Skills & Source</h4>
                    <div className="space-y-2 font-black">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 font-black">Skills (comma separated)</label>
                      <input
                        className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                        value={Array.isArray(editCandidate.skills) ? editCandidate.skills.join(', ') : editCandidate.skills}
                        onChange={(e) => setEditCandidate({ ...editCandidate, skills: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 font-black">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest pl-1 font-black">Source</label>
                      <select
                        className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all appearance-none"
                        value={editCandidate.source}
                        onChange={(e) => setEditCandidate({ ...editCandidate, source: e.target.value })}
                      >
                        <option value="">Select source</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Job Portal">Job Portal</option>
                        <option value="Referral">Referral</option>
                        <option value="Direct">Direct</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-6 pb-2">
                    <div
                      className={`w-16 h-16 rounded-[22px] flex items-center justify-center text-xl font-bold border-4 border-white shadow-xl ${getAvatarColor(selectedCandidate.name, selectedCandidate.avatar)
                        }`}
                    >
                      {selectedCandidate.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {selectedCandidate.name}
                        </h3>
                        <CheckSquare size={18} className="text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[#6B6B7E] uppercase tracking-[2px]">{selectedCandidate.role}</span>
                        <span className="w-1 h-1 rounded-full bg-[#C5C5D2]" />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${STAGE_COLORS[selectedCandidate.stage]?.count?.split(' ')[1] || 'text-slate-600'}`}>
                          {selectedCandidate.stage}
                        </span>
                      </div>
                      {selectedCandidate.cvUrl && (
                        <button
                          onClick={() => {
                            const url = selectedCandidate.cvUrl.startsWith('http') ? selectedCandidate.cvUrl : `${BASE_URL}${selectedCandidate.cvUrl.startsWith('/') ? '' : '/'}${selectedCandidate.cvUrl}`;
                            window.open(url, '_blank');
                          }}
                          className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-[#0D47A1] text-white rounded-xl text-xs font-bold hover:bg-[#0a3a82] transition-all shadow-md shadow-[#0D47A1]/20 active:scale-95"
                        >
                          <Eye size={13} /> View CV
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#F4F3EF]">
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-1.5 leading-none flex items-center gap-1.5">
                        <Mail size={10} /> Email
                      </p>
                      <p className="text-xs font-bold text-[#1A1A2E] truncate" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedCandidate.email}</p>
                    </div>
                    <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#F4F3EF]">
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-1.5 leading-none flex items-center gap-1.5">
                        <Phone size={10} /> Phone
                      </p>
                      <p className="text-xs font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedCandidate.phone}</p>
                    </div>
                  </div>

                  {/* Financial & Logistics Info */}
                  <div className="bg-[#FAFAF8] rounded-[24px] border border-[#F4F3EF] divide-y divide-[#F4F3EF]">
                    <div className="grid grid-cols-2 divide-x divide-[#F4F3EF]">
                      <div className="p-4">
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Current CTC</p>
                        <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-1">
                          <DollarSign size={12} className="text-[#9B9BAD]" />
                          {selectedCandidate.currentSalary || "N/A"}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Expected CTC</p>
                        <p className="text-sm font-bold text-[#1B4DA0] flex items-center gap-1">
                          <DollarSign size={12} />
                          {selectedCandidate.expectedSalary || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-[#F4F3EF]">
                      <div className="p-4">
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Notice</p>
                        <p className="text-xs font-bold text-[#1A1A2E]">{selectedCandidate.noticePeriod || "N/A"}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Exp.</p>
                        <p className="text-xs font-bold text-[#1A1A2E]">{selectedCandidate.experience || "0"}y</p>
                      </div>
                      <div className="p-4">
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Location</p>
                        <p className="text-xs font-bold text-[#1A1A2E] truncate flex items-center gap-1">
                          <MapPin size={10} /> {selectedCandidate.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-3">Core Competencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedCandidate.skills || []).map((skill) => (
                        <span key={skill} className="px-4 py-2 bg-[#F4F3EF] text-[#1A1A2E] rounded-xl text-xs font-bold transition-all hover:bg-[#EEF2FB] hover:text-[#1B4DA0]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Resume / CV Preview */}
                  {selectedCandidate.cvUrl && (
                    <div className="space-y-4 pt-2">
                      <h4 className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-3">Resume / CV</h4>
                      {showCvPreview ? (
                        <div className="space-y-3">
                          <iframe
                            src={`${selectedCandidate.cvUrl.startsWith('http') ? selectedCandidate.cvUrl : `${BASE_URL}${selectedCandidate.cvUrl.startsWith('/') ? '' : '/'}${selectedCandidate.cvUrl}`}`}
                            className="w-full h-[400px] rounded-2xl border border-[#F4F3EF]"
                            title="CV Preview"
                          />
                          <button onClick={() => setShowCvPreview(false)}
                            className="w-full py-3 rounded-xl border border-[#F4F3EF] text-xs font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                            Hide Preview
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => setShowCvPreview(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] hover:bg-[#EEF2FB] hover:text-[#1B4DA0] transition-all">
                            <Eye size={14} /> View CV
                          </button>
                          <a href={`${selectedCandidate.cvUrl.startsWith('http') ? selectedCandidate.cvUrl : `${BASE_URL}${selectedCandidate.cvUrl.startsWith('/') ? '' : '/'}${selectedCandidate.cvUrl}`}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1B4DA0] text-xs font-bold text-white hover:bg-[#153D80] transition-all">
                            <Download size={14} /> Download
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline History */}
                  <div className="space-y-6 pt-4">
                    <h4 className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-3">Application History</h4>
                    <div className="relative pl-6 border-l-2 border-[#F4F3EF] space-y-8 ml-3">
                      {[...(selectedCandidate.stageHistory || [])]
                        .reverse()
                        .filter((history, index, self) => index === self.findIndex((h) => h.stage === history.stage))
                        .map((history, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[33px] top-0.5 w-[14px] h-[14px] rounded-full bg-white border-2 border-[#1B4DA0] z-10" />
                            <div className="flex justify-between items-center group">
                              <div>
                                <p className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{history.stage}</p>
                                <p className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-wider">{formatDate(history.date)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-8 border-t border-[#F4F3EF] bg-white sticky bottom-0 z-20">
              {!editMode ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => { setSelectedCandidate(null); setEditMode(false); }}
                    className="flex-1 h-14 bg-[#F4F3EF] text-[#6B6B7E] rounded-2xl text-sm font-bold hover:bg-[#E8E7E2] transition-all active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setEditCandidate({ ...selectedCandidate }); setEditMode(true); }}
                    className="flex-[2] h-14 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#153D80] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <User size={18} />
                    Update Profile
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSaveEdit}
                  className="w-full h-14 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#153D80] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <CheckSquare size={18} />
                  Save Profile Changes
                </button>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Add Candidate Modal Placeholder */}
      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl transition-all duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E] text-left" style={{ fontFamily: "'Syne', sans-serif" }}>Register New Candidate</h3>
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mt-1.5 text-left">Sourcing & Pipeline Integration</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

                {/* Form fields start directly */}

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2 pl-1">
                    Full Name *
                  </label>
                  <input
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                    placeholder="e.g. Alex Rivera"
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                    placeholder="alex@example.com"
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2">
                    Phone Number
                  </label>
                  <input
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                    placeholder="+91 00000 00000"
                    value={candidateForm.phone}
                    onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Location
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10"
                      placeholder="City, State"
                      value={candidateForm.location}
                      onChange={(e) => setCandidateForm({ ...candidateForm, location: e.target.value })}
                    />
                    <MapPin size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50" />
                  </div>
                </div>

                {/* Job Details fields continue directly */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center justify-start gap-2 w-full">
                    Target Position *
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                      value={candidateForm.positionId}
                      onChange={(e) => handlePositionChange(e.target.value)}
                      required
                    >
                      <option value="">Select Opening (Optional)</option>
                      {positions.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} {p.clientName ? `(${p.clientName})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Role Type (Core Matching) *
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                      value={candidateForm.roleType}
                      onChange={(e) => setCandidateForm({ ...candidateForm, roleType: e.target.value })}
                      required
                    >
                      <option value="">Select Role Category</option>
                      <option value="Direct Hire">Direct Hire</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Display Job Title *
                  </label>
                  <input
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                    placeholder="e.g. Senior Software Engineer"
                    value={candidateForm.displayJobTitle}
                    onChange={(e) => setCandidateForm({ ...candidateForm, displayJobTitle: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Client
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                      placeholder="Company Name"
                      value={candidateForm.clientName}
                      onChange={(e) => setCandidateForm({ ...candidateForm, clientName: e.target.value })}
                    />
                    <Tag size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50" />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Experience
                  </label>
                  <input
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                    placeholder="e.g. 5 Years"
                    value={candidateForm.experience}
                    onChange={(e) => setCandidateForm({ ...candidateForm, experience: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Notice Period
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                      value={candidateForm.noticePeriod}
                      onChange={(e) => setCandidateForm({ ...candidateForm, noticePeriod: e.target.value })}
                    >
                      <option value="">Select notice duration</option>
                      <option value="Immediate">Immediate</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="45 Days">45 Days</option>
                      <option value="60 Days">60 Days</option>
                      <option value="90 Days">90 Days</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                  </div>
                </div>

                {/* Compensation fields continue directly */}

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Current CTC
                  </label>
                  <input
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                    placeholder="e.g. 15 LPA"
                    value={candidateForm.currentSalary}
                    onChange={(e) => setCandidateForm({ ...candidateForm, currentSalary: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Expected CTC
                  </label>
                  <input
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                    placeholder="e.g. 20 LPA"
                    value={candidateForm.expectedSalary}
                    onChange={(e) => setCandidateForm({ ...candidateForm, expectedSalary: e.target.value })}
                  />
                </div>

                {/* Skills fields continue directly */}

                <div className="space-y-1.5 md:col-span-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Skills (comma separated)
                  </label>
                  <input
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                    placeholder="React, Node.js, MongoDB"
                    value={candidateForm.skills}
                    onChange={(e) => setCandidateForm({ ...candidateForm, skills: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block w-full text-left">
                    Source
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                      value={candidateForm.source}
                      onChange={(e) => setCandidateForm({ ...candidateForm, source: e.target.value })}
                    >
                      <option value="">Select candidate source</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Job Portal">Job Portal (Naukri/Indeed)</option>
                      <option value="Referral">Referral</option>
                      <option value="Direct/Company Website">Direct/Company Website</option>
                      <option value="Social Media">Social Media (FB/Insta)</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2 pl-1">
                    Upload Resume/CV
                  </label>
                  <div className="relative h-40 w-full border-2 border-dashed border-[#DEE3ED] rounded-3xl flex flex-col items-center justify-center transition-colors hover:bg-white/50 group bg-[#FAFBFF]">
                    {candidateForm.resume ? (
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="text-[#1B4DA0] w-12 h-12" />
                        <span className="text-sm font-bold text-[#1A1A2E] max-w-[200px] truncate">{candidateForm.resume.name}</span>
                        <button type="button" onClick={() => setCandidateForm({ ...candidateForm, resume: null })} className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1">
                          <X size={14} /> Remove File
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-[#EEF2FB] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Upload size={24} className="text-[#1B4DA0]" />
                        </div>
                        <p className="text-sm font-bold text-[#1A1A2E]">Drag & drop or <span className="text-[#1B4DA0]">click to browse</span></p>
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase mt-1">PDF, DOC, DOCX (Max 10MB)</p>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setCandidateForm({ ...candidateForm, resume: e.target.files[0] })}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Schedule Interview Dialog */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
          onClick={() => setIsScheduleOpen(false)}>
          <style>{`
            .schedule-scrollbar::-webkit-scrollbar { width: 6px; }
            .schedule-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .schedule-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
            .schedule-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
          `}</style>
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Schedule Interview</h3>
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">
                  {scheduleForm.candidateName} • {scheduleForm.positionTitle}
                </p>
              </div>
              <button onClick={() => setIsScheduleOpen(false)}
                className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSchedulingLoading(true);
              try {
                await scheduleNewInterview({
                  candidateId: scheduleForm.candidateId,
                  candidateName: scheduleForm.candidateName,
                  candidateEmail: scheduleForm.candidateEmail,
                  position: scheduleForm.positionTitle,
                  client: scheduleForm.clientName,
                  date: scheduleForm.date,
                  time: scheduleForm.time,
                  duration: scheduleForm.duration + ' mins',
                  type: scheduleForm.meetingType,
                  meetLink: scheduleForm.meetingLink,
                  round: scheduleForm.round,
                  interviewer: scheduleForm.interviewerName,
                  interviewerRole: scheduleForm.interviewerRole
                });
                toast.success('Interview scheduled successfully!');
                setIsScheduleOpen(false);
              } catch (err) {
                toast.error(err.message || 'Failed to schedule interview');
              } finally {
                setSchedulingLoading(false);
              }
            }} className="p-10 max-h-[75vh] overflow-y-auto schedule-scrollbar space-y-7">

              {/* Candidate Info (read-only) */}
              <div>
                <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-5">
                  <User size={14} /> Candidate
                </h4>
                <div className="bg-[#F4F3EF] rounded-2xl px-6 py-4">
                  <p className="text-sm font-bold text-[#1A1A2E]">{scheduleForm.candidateName}</p>
                  <p className="text-[10px] text-[#9B9BAD] font-bold mt-0.5">{scheduleForm.candidateEmail} • {scheduleForm.positionTitle}</p>
                </div>
              </div>

              {/* Interview Details */}
              <div>
                <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-5">
                  <Calendar size={14} /> Interview Details
                </h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Round</label>
                <div className="relative">
                  <select value={scheduleForm.round} onChange={(e) => setScheduleForm({ ...scheduleForm, round: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10">
                    <option value="Phone Screening">Phone Screening</option>
                    <option value="Technical Round">Technical Round</option>
                    <option value="HR Round">HR Round</option>
                    <option value="Client Interview">Client Interview</option>
                    <option value="Final Round">Final Round</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Date *</label>
                <input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Time *</label>
                <input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Duration</label>
                <div className="relative">
                  <select value={scheduleForm.duration} onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10">
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
                  <select value={scheduleForm.meetingType} onChange={(e) => setScheduleForm({ ...scheduleForm, meetingType: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10">
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
                  <input value={scheduleForm.meetingLink} onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                    className="flex-1 bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx" />
                  <button type="button"
                    onClick={() => setScheduleForm({ ...scheduleForm, meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}` })}
                    className="flex items-center gap-2 px-5 py-4 text-white text-sm font-bold rounded-2xl shadow-[0_10px_25px_rgba(27,77,160,0.3)]"
                    style={{ background: 'linear-gradient(135deg, #1B4DA0, #3FA9F5)' }}>
                    Generate
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interviewer Name</label>
                <input value={scheduleForm.interviewerName} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerName: e.target.value })}
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                  placeholder="Assign interviewer" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interviewer Role</label>
                <input value={scheduleForm.interviewerRole} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerRole: e.target.value })}
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                  placeholder="e.g., Tech Lead" />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsScheduleOpen(false)}
                  className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={schedulingLoading}
                  className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {schedulingLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Scheduling...
                    </span>
                  ) : (
                    <>
                      <Calendar size={18} /> Schedule Interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Details Modal */}
      {isOfferOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
          onClick={() => setIsOfferOpen(false)}>
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Offer Details</h3>
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">
                  {offerForm.candidateName} · {offerForm.positionTitle}
                </p>
              </div>
              <button onClick={() => setIsOfferOpen(false)}
                className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-10 max-h-[75vh] overflow-y-auto space-y-7 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Candidate Name</label>
                <input className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#9B9BAD] outline-none cursor-not-allowed" value={offerForm.candidateName} readOnly />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Position</label>
                <input className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#9B9BAD] outline-none cursor-not-allowed" value={offerForm.positionTitle} readOnly />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Client</label>
                <input className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#9B9BAD] outline-none cursor-not-allowed" value={offerForm.clientName} readOnly />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Salary (CTC) *</label>
                <input 
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                  placeholder="e.g., 12 LPA"
                  value={offerForm.salary}
                  onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Joining Date *</label>
                  <input type="date"
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                    value={offerForm.joiningDate}
                    onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Offer Deadline *</label>
                  <input type="date"
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]"
                    value={offerForm.offerDeadline}
                    onChange={(e) => setOfferForm({ ...offerForm, offerDeadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Notes</label>
                <textarea 
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50 min-h-[100px] resize-none"
                  placeholder="Additional notes..."
                  value={offerForm.notes}
                  onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsOfferOpen(false)}
                  className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                  Cancel
                </button>
                <button type="button"
                  onClick={() => {
                    if (!offerForm.salary || !offerForm.joiningDate || !offerForm.offerDeadline) {
                      toast.error('Please fill Salary, Joining Date and Offer Deadline');
                      return;
                    }
                    toast.success('Offer details saved successfully');
                    setIsOfferOpen(false);
                  }}
                  className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  Send Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
