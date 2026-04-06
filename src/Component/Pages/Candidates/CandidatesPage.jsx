import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Mail, Phone, Calendar, ChevronRight, Plus, Download, Search, Filter, 
  User, Briefcase, Tag, AlignLeft, LayoutGrid, List, AlertCircle, 
  CheckSquare, Square, Trash2, Send, MapPin, DollarSign, Clock, Award,
  FileText, Upload
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

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
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
      
      const response = await addCandidate(formData);

      if (response.success) {
        toast.success(`${candidateForm.name} added successfully!`);
        fetchCandidates();
        setIsCreateModalOpen(false);
        setCandidateForm({
          name: "", email: "", phone: "", location: "",
          positionId: "", roleType: "", displayJobTitle: "",
          clientId: "", clientName: "", experience: "", noticePeriod: "",
          currentSalary: "", expectedSalary: "", skills: "", source: "",
          resume: null
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to add candidate");
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
          const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
          return appliedDate >= weekStart;
        } else if (dateFilter === "prev-week") {
          const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() - 7); weekStart.setHours(0,0,0,0);
          const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);
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

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto relative min-h-screen font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Candidate Pipeline
          </h1>
          <p className="text-[#6B6B7E] text-sm mt-1">{candidates.length} candidates — move cards between pipeline stages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#F4F3EF] p-1 rounded-xl border border-[#E8E7E2]">
            <button 
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kanban" 
                  ? "bg-white text-[#1B4DA0] shadow-sm" 
                  : "text-[#6B6B7E] hover:text-[#1A1A2E]"
              }`}
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
            <button 
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table" 
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
            className="flex items-center gap-2 px-4 py-2 bg-[#1B4DA0] text-white rounded-xl text-sm font-semibold hover:bg-[#153e82] transition-all shadow-md active:scale-95"
          >
            <Plus size={16} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Search/Filter Bar */}
      <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl border border-[#F4F3EF] shadow-sm flex-wrap">
        <div className="flex items-center gap-2 bg-[#F4F3EF] px-3 py-1.5 rounded-xl flex-1 border border-transparent focus-within:border-[#1B4DA0]/20 transition-all min-w-[200px]">
          <Search size={14} className="text-[#9B9BAD]" />
          <input 
            type="text" 
            placeholder="Search by name, role, or skill..." 
            className="bg-transparent border-0 outline-none text-xs text-[#1A1A2E] w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Client Searchable Dropdown */}
        <div className="flex items-center gap-2 bg-[#F4F3EF] px-3 py-1.5 rounded-xl border border-transparent focus-within:border-[#1B4DA0]/20 transition-all w-[260px]">
           <Briefcase size={14} className="text-[#9B9BAD] flex-shrink-0" />
           <input
             type="text"
             list="clientHints"
             placeholder="Search & Select Client..."
             value={selectedClientFilter === "All Clients" ? "" : selectedClientFilter}
             onChange={(e) => setSelectedClientFilter(e.target.value || "All Clients")}
             className="bg-transparent border-0 outline-none text-xs font-bold text-[#1A1A2E] w-full placeholder-[#9B9BAD]"
           />
           <datalist id="clientHints">
              <option value="All Clients" />
              {activeClientNames.map(name => (
                <option key={name} value={name} />
              ))}
           </datalist>
        </div>
      </div>

      {/* Date & Role Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); if (e.target.value !== 'custom') { setCustomStartDate(''); setCustomEndDate(''); } }}
          className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer"
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
              className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer" />
            <span className="text-[10px] text-[#9B9BAD] font-bold">to</span>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
              className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer" />
          </div>
        )}
        <select
          value={targetRoleFilter}
          onChange={(e) => setTargetRoleFilter(e.target.value)}
          className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl px-3 py-2 outline-none border-0 cursor-pointer"
        >
          <option value="">All Roles</option>
          {positions.map(p => (
            <option key={p.id} value={p.title}>{p.title}</option>
          ))}
        </select>
        {(dateFilter !== 'all' || targetRoleFilter) && (
          <button
            onClick={() => { setDateFilter('all'); setTargetRoleFilter(''); setCustomStartDate(''); setCustomEndDate(''); }}
            className="text-xs font-semibold text-[#1B4DA0] hover:underline"
          >
            Reset Filters
          </button>
        )}
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
                className={`rounded-[24px] border-2 transition-all duration-200 ${colors.border} ${
                  isDragOver ? "ring-2 ring-[#1B4DA0]/40 scale-[1.01] bg-[#F8FAFF]" : colors.bg
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
                        className={`bg-white rounded-xl p-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 select-none group border-2 border-[#E8E7E2] ${
                          isDragging
                            ? "opacity-40 scale-95"
                            : "hover:-translate-y-1 hover:shadow-lg hover:border-[#1B4DA0]/20"
                        } ${selectedIds.includes(candidate.id) ? 'ring-2 ring-[#1B4DA0] border-transparent' : 'shadow-sm'}`}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[10px] font-bold flex-shrink-0 relative ${avatarColor} ${
                               isStuck
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
                      className={`h-20 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${
                        isDragOver ? "border-[#1B4DA0]/40 bg-[#1B4DA0]/5" : "border-[#F4F3EF] bg-transparent opacity-30"
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
                      <div className="relative group/select">
                        <select 
                          value={candidate.stage}
                          onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                          className="bg-[#F4F3EF] border-0 rounded-xl px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-[#1B4DA0] outline-none hover:bg-blue-50 transition-all cursor-pointer appearance-none pr-9 border-b-2 border-transparent focus:border-[#1B4DA0]/20"
                        >
                          {PIPELINE_STAGES.map((s) => <option key={s} value={s}>Move to {s}</option>)}
                        </select>
                        <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button className="w-10 h-10 rounded-xl text-[#C5C5D2] hover:bg-white hover:shadow-md hover:text-[#1A1A2E] transition-all flex items-center justify-center">
                          <AlignLeft size={16} />
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
      {selectedCandidate && (
        <>
          <div
            className="fixed inset-0 bg-[#1A1A2E]/30 backdrop-blur-[2px] z-40 transition-all duration-300"
            onClick={() => { setSelectedCandidate(null); setEditMode(false); }}
          />
          <div
            className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-50 overflow-y-auto shadow-[-16px_0_64px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-300 transform translate-x-0"
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
                  className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors"
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
                      className={`w-16 h-16 rounded-[22px] flex items-center justify-center text-xl font-bold border-4 border-white shadow-xl ${
                        getAvatarColor(selectedCandidate.name, selectedCandidate.avatar)
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
                  <button 
                    onClick={() => { setEditCandidate({ ...selectedCandidate }); setEditMode(true); }}
                    className="w-full h-14 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#153D80] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <User size={18} />
                    Update Profile
                  </button>
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
        </>
      )}

      {/* Add Candidate Modal Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Register New Candidate</h3>
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">Sourcing & Pipeline Integration</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                
                {/* Section: Personal Details */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6">
                    <User size={14} /> Personal Details
                  </h4>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2 pl-1">
                      Full Name *
                   </label>
                   <input 
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50" 
                    placeholder="e.g. Alex Rivera"
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({...candidateForm, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2">
                      <Mail size={12} className="text-[#1B4DA0]" /> Email Address *
                   </label>
                   <input 
                    type="email"
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" 
                    placeholder="alex@example.com"
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({...candidateForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2">
                      <Phone size={12} className="text-[#1B4DA0]" /> Phone Number
                   </label>
                   <input 
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" 
                    placeholder="+91 00000 00000"
                    value={candidateForm.phone}
                    onChange={(e) => setCandidateForm({...candidateForm, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Location
                   </label>
                   <div className="relative group">
                     <input 
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" 
                      placeholder="City, State"
                      value={candidateForm.location}
                      onChange={(e) => setCandidateForm({...candidateForm, location: e.target.value})}
                    />
                    <MapPin size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50" />
                   </div>
                </div>

                {/* Section: Job Details */}
                <div className="md:col-span-2 mt-8">
                  <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6">
                    <Briefcase size={14} /> Job Details
                  </h4>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center gap-2">
                      <Briefcase size={12} className="text-[#1B4DA0]" /> Target Position *
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

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Role Type (Core Matching) *
                   </label>
                   <div className="relative group">
                      <select 
                       className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                       value={candidateForm.roleType}
                       onChange={(e) => setCandidateForm({...candidateForm, roleType: e.target.value})}
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

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Display Job Title *
                   </label>
                   <input 
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]" 
                    placeholder="e.g. Senior Software Engineer"
                    value={candidateForm.displayJobTitle}
                    onChange={(e) => setCandidateForm({...candidateForm, displayJobTitle: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Client
                   </label>
                   <div className="relative group">
                      <input 
                       className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]" 
                       placeholder="Company Name"
                       value={candidateForm.clientName}
                       onChange={(e) => setCandidateForm({...candidateForm, clientName: e.target.value})}
                     />
                     <Tag size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50" />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Experience
                   </label>
                   <input 
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]" 
                    placeholder="e.g. 5 Years"
                    value={candidateForm.experience}
                    onChange={(e) => setCandidateForm({...candidateForm, experience: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Notice Period
                   </label>
                   <div className="relative group">
                      <select 
                       className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                       value={candidateForm.noticePeriod}
                       onChange={(e) => setCandidateForm({...candidateForm, noticePeriod: e.target.value})}
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

                {/* Section: Compensation */}
                <div className="md:col-span-2 mt-8">
                  <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6">
                    <DollarSign size={14} /> Compensation
                  </h4>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Current CTC
                   </label>
                   <input 
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]" 
                    placeholder="e.g. 15 LPA"
                    value={candidateForm.currentSalary}
                    onChange={(e) => setCandidateForm({...candidateForm, currentSalary: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Expected CTC
                   </label>
                   <input 
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]" 
                    placeholder="e.g. 20 LPA"
                    value={candidateForm.expectedSalary}
                    onChange={(e) => setCandidateForm({...candidateForm, expectedSalary: e.target.value})}
                  />
                </div>

                {/* Section: Skills & Resume */}
                <div className="md:col-span-2 mt-8">
                  <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[2px] flex items-center gap-2 mb-6">
                    <Award size={14} /> Skills & Resume
                  </h4>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Skills (comma separated)
                   </label>
                   <input 
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB]" 
                    placeholder="React, Node.js, MongoDB"
                    value={candidateForm.skills}
                    onChange={(e) => setCandidateForm({...candidateForm, skills: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">
                      Source
                   </label>
                   <div className="relative group">
                      <select 
                       className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                       value={candidateForm.source}
                       onChange={(e) => setCandidateForm({...candidateForm, source: e.target.value})}
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
                          <button type="button" onClick={() => setCandidateForm({...candidateForm, resume: null})} className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1">
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
                            onChange={(e) => setCandidateForm({...candidateForm, resume: e.target.files[0]})}
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
        </div>
      )}
    </div>
  );
}
