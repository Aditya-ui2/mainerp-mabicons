import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X, Mail, Phone, Calendar, ChevronRight, ChevronDown, Plus, Download, Search, Filter,
  User, Briefcase, Tag, AlignLeft, LayoutGrid, List, AlertCircle,
  CheckSquare, Square, Trash2, Send, MapPin, DollarSign, Clock, Award,
  FileText, Upload, Eye, Video, Star, Zap, Sparkles, Wand2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as pdfjsLib from 'pdfjs-dist';
import { parseResumeWithAI, rankCandidatesWithAI } from "../../Utilities/geminiService";

import { PIPELINE_STAGES, AVATAR_COLORS, getAvatarColor } from "./candidatesConfig";
import {
  getAllCandidates,
  updateCandidateStatus,
  updateCandidate,
  rejectPipelineCandidate,
  addCandidate,
  getAllRecruitmentPositions,
  getAllClients,
  scheduleNewInterview,
  generateCandidateCredentials,
  getSharePointCandidates,
  updateSharePointCandidate,
  syncSharePointAll,
  getResumeBankResumes,
  getDepartmentTeamMembers,
  getAllKAMMembers,
  getAllAdmins,
  BASE_URL
} from "../service/api";
import {
  FiDatabase, FiRefreshCw, FiUser, FiMail, FiBriefcase, FiCalendar, FiClock,
  FiVideo, FiCopy, FiCheckCircle, FiX, FiRefreshCcw
} from 'react-icons/fi';



const STAGE_COLORS = {
  Screening: {
    bg: "bg-white-50",
    border: "border-white-200",
    dot: "bg-white-400",
    count: "bg-white-100 text-white-600",
  },
  Interview: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    count: "bg-amber-100 text-amber-600",
  },
  Shortlisted: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
    count: "bg-blue-100 text-blue-600",
  },
  Offer: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-400",
    count: "bg-purple-100 text-purple-600",
  },
};

const Edit2 = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

const Pencil = Edit2;

export default function CandidatesPage({ setActiveTab }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
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

  // Schedule Interview Modal state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    candidateId: '',
    candidateName: '',
    candidateEmail: '',
    positionTitle: '',
    clientName: '',
    date: '',
    time: '',
    duration: '60 mins',
    mode: 'Online',
    subMode: 'with-client',
    meetingLink: '',
    locationLink: '',
    round: 'Technical Round',
    interviewerName: '',
    interviewerRole: '',
    interviewerId: '',
    interviewerType: 'DepartmentTeam'
  });
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [showCvPreview, setShowCvPreview] = useState(false);

  // Credential Modal State
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [credsCandidate, setCredsCandidate] = useState(null);
  const [credsLoading, setCredsLoading] = useState(false);

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

  const [isParsing, setIsParsing] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [suggestedCandidates, setSuggestedCandidates] = useState([]);
  const [availableInterviewers, setAvailableInterviewers] = useState([]);
  const [showInterviewerSuggestions, setShowInterviewerSuggestions] = useState(false);

  useEffect(() => {
    // Set worker source for pdfjsLib safely inside useEffect
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
    fetchSupportData();
  }, []);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSharePointSync = async () => {
    try {
      setIsSyncing(true);
      const res = await syncSharePointAll();
      if (res.success) {
        toast.success("SharePoint data synced successfully!");
        fetchCandidates();
      }
    } catch (error) {
      toast.error("Failed to sync with SharePoint");
    } finally {
      setIsSyncing(false);
    }
  };

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
          clientId: p.clientId || p.client?.id,
          description: p.description || p.jobDescription || '',
          skills: p.skills || p.requiredSkills || []
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

    // 3. Fetch Recruitment Team for Interviewer Suggestions
    try {
      const [hrRecRes, hrOpsRes, kamRes, adminRes] = await Promise.allSettled([
        getDepartmentTeamMembers('HR Recruitment'),
        getDepartmentTeamMembers('HR Operations'),
        getAllKAMMembers(),
        getAllAdmins()
      ]);

      let allMembers = [];
      const seenIds = new Set();

      [hrRecRes, hrOpsRes, kamRes, adminRes].forEach(res => {
        if (res.status === 'fulfilled' && res.value) {
          const data = res.value.members || res.value.data || res.value.admins || (Array.isArray(res.value) ? res.value : []);
          data.forEach(m => {
            if (m && m.id && !seenIds.has(m.id)) {
              seenIds.add(m.id);
              allMembers.push({
                id: m.id,
                name: m.name || m.fullName || 'Unknown',
                role: m.role || 'Member',
                department: m.department || 'Recruitment',
                email: m.email || '',
                type: res.value.tableName === 'TeamLeaders' ? 'TeamLeader' : 'DepartmentTeam'
              });
            }
          });
        }
      });

      setAvailableInterviewers(allMembers);
    } catch (err) {
      console.error('Failed to fetch recruitment team:', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      if (candidates.length === 0) setLoading(true);

      // Fetch all sources in parallel
      const [erpRes, spRes, bankRes] = await Promise.all([
        getAllCandidates(),
        getSharePointCandidates().catch(() => ({ success: true, data: [] })),
        getResumeBankResumes().catch(() => ({ success: true, data: [] }))
      ]);

      let mappedERP = [];
      if (erpRes && erpRes.success && Array.isArray(erpRes.data)) {
        mappedERP = erpRes.data.map(c => {
          if (!c) return null;
          return {
            id: c.id,
            name: c.name || "Unknown Candidate",
            email: c.email || "N/A",
            phone: c.phone || "N/A",
            role: c.position?.title || c.role || "Unknown Position",
            positionId: c.positionId,
            clientId: c.client || c.clientId || c.position?.client || c.position?.clientId,
            clientName: c.client?.companyName || c.client?.name || c.clientName || c.position?.client?.companyName || c.position?.client?.name || "N/A",
            stage: mapBackendToFrontendStage(c.stage, c.status),
            appliedDate: c.createdAt,
            location: c.location || "Remote",
            currentSalary: c.currentSalary,
            expectedSalary: c.expectedSalary,
            noticePeriod: c.noticePeriod,
            experience: c.experience,
            skills: c.skills ? (Array.isArray(c.skills) ? c.skills : String(c.skills).split(',')) : ["General"],
            avatar: (c.name || "U").split(" ").map(n => n ? n[0] : "").join("").toUpperCase().slice(0, 2) || "U",
            lastMovedDate: c.updatedAt,
            cvUrl: c.cvUrl || null,
            cvFileName: c.cvFileName || null,
            stageHistory: c.stageHistory || [{ stage: mapBackendToFrontendStage(c.stage, c.status), date: c.createdAt }],
            source: 'erp',
            raw: c
          };
        }).filter(Boolean);
      } else {
        console.warn("ERP candidates fetch failed or returned invalid data:", erpRes);
      }

      let mappedSP = [];
      if (spRes && spRes.success && Array.isArray(spRes.data)) {
        mappedSP = spRes.data.map(c => {
          if (!c) return null;
          return {
            id: c.sharePointId || `sp_${Math.random()}`,
            name: c.name || "SP Candidate",
            email: c.email || "",
            phone: c.phone || "N/A",
            role: c.position || "Unknown Role",
            positionId: null,
            clientId: null,
            clientName: c.client || "SharePoint Client",
            stage: c.stage || "Screening",
            appliedDate: c.sharePointCreatedAt,
            location: "Sync from SP",
            experience: "N/A",
            skills: ["SharePoint Sync"],
            avatar: (c.name || 'SP').split(" ").map(n => n ? n[0] : "").join("").toUpperCase().slice(0, 2) || "SP",
            lastMovedDate: c.updatedAt,
            source: 'sharepoint',
            raw: c
          };
        }).filter(Boolean);
      }

      const bankData = bankRes?.data || bankRes || [];
      const mappedBank = (Array.isArray(bankData) ? bankData : []).map(c => {
        if (!c) return null;
        return {
          id: c.userId || c.id || `bank_${Math.random()}`,
          name: c.candidateName || c.name || "Unknown Bank",
          email: c.email || "",
          phone: c.contactNo || c.phone || "N/A",
          role: c.position || c.role || "Resume Bank",
          stage: "Resume Bank",
          location: c.location || "Remote",
          experience: c.experience || "N/A",
          skills: Array.isArray(c.skills) ? c.skills : (c.skills ? String(c.skills).split(',') : []),
          avatar: (c.candidateName || c.name || "U")[0]?.toUpperCase() || "U"
        };
      }).filter(Boolean);

      const allMerged = [...mappedERP, ...mappedSP, ...mappedBank];
      console.log(`[DEBUG] Final Merged Candidates Count: ${allMerged.length}`, {
        erp: mappedERP.length,
        sp: mappedSP.length,
        bank: mappedBank.length
      });
      setCandidates(allMerged);
    } catch (error) {
      console.error("fetchCandidates CRASH:", error);
      toast.error("Failed to load candidates checklist");
    } finally {
      setLoading(false);
    }
  };

  const mapBackendToFrontendStage = (stage, status) => {
    if (stage === 'Joined' || status === 'Selected' || stage === 'Offer Sent' || status === 'Offer') return "Offer";
    if (stage === 'Offer Sent' || status === 'Offer') return "Offer";
    if (status === 'Shortlisted') return "Shortlisted";
    if (['Technical Round', 'HR Round', 'Client Interview'].includes(stage) || status === 'Interview') return "Interview";
    return "Screening";
  };

  const mapFrontendToBackendStage = (uiStage) => {
    switch (uiStage) {
      case "Offer":
        return { stage: "Offer Sent", status: "Shortlisted" };
      case "Shortlisted":
        return { stage: "Technical Round", status: "Shortlisted" };
      case "Interview":
        return { stage: "Technical Round", status: "Interview" };
      case "Screening":
      default:
        return { stage: "Screening", status: "Submitted" };
    }
  };

  const handleAiAutofill = async (file) => {
    // If no file, perform candidate discovery instead
    if (!file && candidateForm.positionId) {
      handleDiscoverCandidates();
      return;
    }

    if (!file) {
      toast.error("Please upload a resume first");
      return;
    }

    setIsParsing(true);
    try {
      // ... (existing text extraction logic)
      let text = "";
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const maxPages = Math.min(pdf.numPages, 3);
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(" ");
        }
      } else {
        text = await file.text();
      }

      if (!text) throw new Error("Could not extract text from file");

      const parsedData = await parseResumeWithAI(text);
      if (parsedData) {
        setCandidateForm(prev => ({
          ...prev,
          name: parsedData.name || prev.name,
          email: parsedData.email || prev.email,
          phone: parsedData.phone || prev.phone,
          location: parsedData.location || prev.location,
          experience: parsedData.experience || prev.experience,
          skills: parsedData.skills || prev.skills,
          currentSalary: parsedData.currentSalary || prev.currentSalary,
          expectedSalary: parsedData.expectedSalary || prev.expectedSalary,
          noticePeriod: parsedData.noticePeriod || prev.noticePeriod,
        }));
        toast.success("Form autofilled with AI!");
        
        // After parsing, automatically discover similar candidates from bank
        handleDiscoverCandidates(parsedData.skills);
      }
    } catch (err) {
      console.error("AI Autofill Error:", err);
      toast.error("Failed to parse resume with AI");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDiscoverCandidates = async (searchSkills = "") => {
    setIsDiscovering(true);
    try {
      const selectedJob = positions.find(p => p.id === candidateForm.positionId);
      if (!selectedJob) {
        toast.error("Please select a job opening first");
        return;
      }

      // If candidates list is empty, try to fetch them first
      if (candidates.length === 0) {
        await fetchCandidates();
      }

      const jobTitle = selectedJob.title;
      const jobDescription = selectedJob.description || "";
      const jobSkills = selectedJob.skills ? (Array.isArray(selectedJob.skills) ? selectedJob.skills.join(" ") : selectedJob.skills) : "";
      
      // Combine everything for deep AI matching
      const jobContext = `
        POSITION: ${jobTitle}
        REQUIRED SKILLS: ${jobSkills}
        JOB DESCRIPTION: ${jobDescription}
        EXTRA SEARCH CONTEXT: ${searchSkills}
      `;
      
      const pool = candidates.filter(c => String(c.id) !== String(candidateForm.id));
      console.log(`AI Discovery: Searching pool of ${pool.length} candidates for "${jobTitle}"`);
      
      if (pool.length === 0) {
        toast.info("No candidates found in the bank to match against.");
        return;
      }

      // Use AI to rank them with full JD context
      const rankings = await rankCandidatesWithAI(pool, jobContext);
      
      if (rankings && rankings.length > 0) {
        // Map the rankings back to our candidate objects
        const matches = rankings.map(rank => {
          const candidate = pool.find(c => String(c.id) === String(rank.id));
          if (candidate) {
            return {
              ...candidate,
              matchScore: rank.score,
              matchReason: rank.reason
            };
          }
          return null;
        }).filter(Boolean);

        setSuggestedCandidates(matches);
        if (matches.length > 0) {
            toast.success(`AI found ${matches.length} matching candidates from the Resume Bank!`);
        }
      } else {
        // Fallback to basic search
        console.log("AI Discovery returned no rankings, using fallback search...");
        const jobKeywords = (jobTitle + " " + searchSkills).toLowerCase();
        const matches = pool
          .filter(c => {
            const candidateData = ((c.name || "") + " " + (c.role || "") + " " + (Array.isArray(c.skills) ? c.skills.join(" ") : (c.skills || ""))).toLowerCase();
            return jobKeywords.split(" ").some(word => word.length > 3 && candidateData.includes(word));
          })
          .slice(0, 3);
        
        setSuggestedCandidates(matches);
        if (matches.length === 0) {
          toast.info("No close matches found in the bank.");
        } else {
          toast.success(`Found ${matches.length} candidates via smart search!`);
        }
      }
    } catch (err) {
      console.error("Discovery Error:", err);
      toast.error("AI Discovery failed");
    } finally {
      setIsDiscovering(false);
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

      if (candidate.source === 'sharepoint') {
        await updateSharePointCandidate(dragId, {
          stage: backendMapping.stage,
          status: backendMapping.status,
          notes: `Moved to ${stage} via Pipeline View`
        });
      } else {
        await updateCandidateStatus(dragId, {
          status: backendMapping.status,
          stage: backendMapping.stage,
          notes: `Moved to ${stage} via Pipeline View`
        });
      }

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
          round: 'Technical Round',
          duration: '60 mins',
          mode: 'Online',
          subMode: 'with-client',
          date: '',
          time: '',
          meetingLink: '',
          locationLink: '',
          interviewerName: '',
          interviewerRole: ''
        });
        setIsScheduleOpen(true);
      }

      // Offer stage transition - just update status, no popup as requested
      if (stage === 'Offer') {
        // No action needed here, updateCandidateStatus already called above
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
      setIsCreating(true);
      const formData = new FormData();
      Object.keys(candidateForm).forEach(key => {
        if (key === 'resume') {
          if (candidateForm.resume) formData.append("resume", candidateForm.resume);
        } else if (key === 'skills') {
          // Send as comma-separated string that the backend now parses robustly
          const skillsArray = candidateForm.skills ? (typeof candidateForm.skills === 'string' ? candidateForm.skills.split(',').map(s => s.trim()).filter(Boolean) : []) : [];
          formData.append("skills", skillsArray.join(', '));
        } else {
          formData.append(key, candidateForm[key] || "");
        }
      });

      // Default metadata
      formData.append("stage", "Screening");
      const response = await addCandidate(formData);
      if (response && response.success) {
        toast.success(`${candidateForm.name} added successfully!`);
        setIsCreateModalOpen(false);
        setCandidateForm({
          name: "", email: "", phone: "", location: "",
          positionId: "", roleType: "", displayJobTitle: "",
          clientId: "", clientName: "", experience: "", noticePeriod: "",
          currentSalary: "", expectedSalary: "", skills: "", source: "",
          resume: null
        });
        fetchCandidates();
      } else {
        toast.error(response?.message || "Failed to add candidate");
      }
    } catch (error) {
      console.error('Add candidate error:', error);
      toast.error(error?.message || "Network synchronization failure");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateCredentials = async () => {
    if (!credsCandidate) return;
    try {
      setCredsLoading(true);
      const res = await generateCandidateCredentials(credsCandidate.id);
      if (res && res.success && res.data) {
        const { email: finalEmail, username: finalUsername, password: finalPass } = res.data;

        toast.success(`Credentials generated for ${finalUsername || finalEmail}`);

        // Construct mailto link for manual sending
        const subject = encodeURIComponent("Your Mabicons ERP Access Credentials");
        const body = encodeURIComponent(`Dear ${credsCandidate.name},

Your ERP access for the Mabicons project has been activated.

Username: ${finalUsername}
Email: ${finalEmail}
Secret Key: ${finalPass}

Login URL: https://erp.mabicons.com/candidate-login

Please use these credentials to complete your document verification.

Best Regards,
Mabicons Recruitment Team`);

        window.location.href = `mailto:${finalEmail}?subject=${subject}&body=${body}`;

        setIsCredsModalOpen(false);
        setCredsCandidate(null);

        // Optionally refresh candidates to show updated status/tags
        fetchCandidates();
      } else {
        toast.error(res?.message || "Failed to generate credentials");
      }
    } catch (error) {
      toast.error(error.message || "Failed to generate credentials");
    } finally {
      setCredsLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    let result = candidates;
    if (selectedClientFilter !== "All Clients") {
      result = result.filter(c => (c.clientName?.trim() || "Internal Team") === selectedClientFilter);
    }
    if (targetRoleFilter) {
      result = result.filter(c => c.positionId === targetRoleFilter || c.role === targetRoleFilter);
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

  // Read interview feedback from localStorage to show ratings and notes
  const [candidateFeedbacks, setCandidateFeedbacks] = useState({});
  useEffect(() => {
    const loadFeedback = () => {
      try {
        const fb = JSON.parse(localStorage.getItem("interviewFeedback") || "{}");
        const feedbackMap = {};
        Object.values(fb).forEach((entry) => {
          if (entry.candidateName) {
            let rating = entry.rating;
            // Backward compatibility for old feedback format (0-10 categories)
            if (rating === undefined) {
              const vals = [
                entry.skills,
                entry.communication,
                entry.behaviour,
                entry.knowledge,
                entry.attitude,
              ].map((v) => parseInt(v) || 0);
              rating = Math.round(vals.reduce((a, b) => a + b, 0) / 10); // scale 10 to 5
            }
            feedbackMap[entry.candidateName.toLowerCase().trim()] = {
              rating,
              note: entry.note || "",
            };
          }
        });
        setCandidateFeedbacks(feedbackMap);
      } catch (e) {
        setCandidateFeedbacks({});
      }
    };
    loadFeedback();
    window.addEventListener("storage", loadFeedback);
    window.addEventListener("focus", loadFeedback);
    return () => {
      window.removeEventListener("storage", loadFeedback);
      window.removeEventListener("focus", loadFeedback);
    };
  }, []);

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-8 relative" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Candidate Pipeline</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1 text-left">{candidates.length} Total Candidates In Pipeline</p>
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
            onClick={handleSharePointSync}
            disabled={isSyncing}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#1B4DA0] border border-[#E8E7E2] rounded-2xl text-[13px] font-bold hover:bg-blue-50/30 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? (
              <FiRefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FiDatabase className="w-4 h-4 text-emerald-500 transition-transform group-hover:scale-110" />
            )}
            <span className="tracking-tight">{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg active:scale-95 text-center"
          >
            <Plus size={18} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Search Bar + Filters */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-8">
        {/* Search Bar */}
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, role, or skill..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        {/* Global Registry Date Filter - Integrated Look */}
        <div className="relative group">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px] hover:bg-[#EEF2FB] transition-all"
          >
            <option value="all">All Date</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#F4F3EF] rounded-xl border border-[#E8E7E2]">
            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-[#1A1A2E] outline-none border-0 cursor-pointer" />
            <span className="text-[10px] text-[#9B9BAD] font-bold">to</span>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-[#1A1A2E] outline-none border-0 cursor-pointer" />
          </div>
        )}

        <div className="relative group">
          <select
            value={targetRoleFilter}
            onChange={(e) => setTargetRoleFilter(e.target.value)}
            className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[170px] hover:bg-[#EEF2FB] transition-all"
          >
            <option value="">All Openings</option>
            {positions.map(p => (
              <option key={p.id} value={p.id}>{p.title} {p.clientName ? `(${p.clientName})` : ''}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
        </div>

        <div className="relative group">
          <select
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
            className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[160px] hover:bg-[#EEF2FB] transition-all"
          >
            <option value="All Clients">All Clients</option>
            {activeClientNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
        </div>
      </div>

      {/* Kanban / Table Content Area */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-4 gap-4 min-h-[500px]">
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
                                <p className="text-sm font-bold text-[#1A1A2E] truncate group-hover:text-[#1B4DA0] transition-colors pb-0.5">
                                  {candidate.name}
                                </p>
                                <CheckSquare size={12} className="text-emerald-500 flex-shrink-0" />
                                {candidate.source === 'sharepoint' && (
                                  <div className="flex items-center justify-center p-1 rounded-md bg-emerald-50 text-emerald-600" title="Source: SharePoint">
                                    <FiDatabase size={10} />
                                  </div>
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
                            <div className="flex items-center gap-2 mt-1 opacity-70">
                              <p className="text-[9px] font-black text-[#1B4DA0] uppercase tracking-wider">{candidate.clientName || 'Direct'}</p>
                              <span className="w-1 h-1 rounded-full bg-[#C5C5D2]" />
                              <p className="text-[9px] font-bold text-[#6B6B7E] uppercase">{candidate.source || 'Portal'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-[#9B9BAD]">
                            <span className="flex items-center gap-1.5 opacity-70">
                              <Briefcase size={10} />
                              Pipeline Progress
                            </span>
                            <span>{Math.round(((Math.max(0, PIPELINE_STAGES.indexOf(candidate.stage)) + 1) / PIPELINE_STAGES.length) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-[#F4F3EF] rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-slate-500 transition-all duration-700 rounded-full shadow-sm"
                              style={{ width: `${((Math.max(0, PIPELINE_STAGES.indexOf(candidate.stage)) + 1) / PIPELINE_STAGES.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2.5 items-center">
                          {(candidate.skills || []).slice(0, 2).map((skill) => (
                            <span
                              key={skill}
                              className="text-[9px] bg-[#F8FAFF] text-[#1B4DA0] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wide border border-[#1B4DA0]/5"
                            >
                              {skill}
                            </span>
                          ))}
                          <div className="flex items-center gap-2 mt-2.5 w-full">
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
                              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[#1B4DA0]/10 text-[#1B4DA0] rounded-lg text-[9px] font-bold hover:bg-[#1B4DA0] hover:text-white transition-all active:scale-95"
                            >
                              <Eye size={10} /> View CV
                            </button>

                            {candidate.stage === 'Hired' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCredsCandidate({
                                    id: candidate.id,
                                    name: candidate.name,
                                    email: candidate.email,
                                    role: candidate.role
                                  });
                                  setIsCredsModalOpen(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10 active:scale-95 whitespace-nowrap"
                              >
                                <Zap size={10} fill="currentColor" /> Gen Credentials
                              </button>
                            )}
                          </div>
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
                <tr className="border-b border-[#F4F3EF] dark:border-slate-800 text-left bg-transparent">
                  <th className="py-3 pl-6 pr-2 w-12">
                    <button
                      onClick={() => selectedIds.length === candidates.length ? setSelectedIds([]) : setSelectedIds(candidates.map(c => c.id))}
                      className={`p-1 rounded-md transition-all ${selectedIds.length === candidates.length ? 'text-[#1B4DA0]' : 'text-[#C5C5D2]'}`}
                    >
                      {selectedIds.length === candidates.length ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  {["Candidate", "Job Title", "Client", "Source", "Skills", "Role Type", "Stage", "Actions"].map((h) => (
                    <th key={h} className={`py-3 text-[10px] font-black uppercase tracking-[2px] text-[#9B9BAD] text-center`}>{h}</th>
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
                    <td className="pl-6 pr-2 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelect(candidate.id)}
                        className={`p-1 rounded-md transition-all ${selectedIds.includes(candidate.id) ? 'text-[#1B4DA0]' : 'text-[#C5C5D2] hover:text-[#1A1A2E]'}`}
                      >
                        {selectedIds.includes(candidate.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-start gap-3 pl-4">
                        <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-[11px] font-bold relative border border-white/30 shadow-sm ${getAvatarColor(candidate.name, candidate.avatar)}`}>
                          {candidate.avatar}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{candidate.name}</span>
                          </div>
                          <p className="text-[9px] text-[#9B9BAD] font-bold uppercase tracking-[1px]">{candidate.location || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className="text-[12px] font-bold text-[#1A1A2E]">{candidate.role || candidate.displayJobTitle || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="px-3 py-1.5 bg-[#F4F3EF] rounded-xl inline-block">
                        <p className="text-[11px] font-black text-[#6B6B7E] uppercase tracking-wider">{candidate.clientName || 'Direct'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {candidate.source === 'sharepoint' ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                            <FiDatabase size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">SharePoint</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-[#6B6B7E] uppercase tracking-widest">{candidate.source || 'Direct'}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto text-left">
                        {(candidate.skills || []).slice(0, 3).map((skill) => (
                          <span key={skill} className="text-[9px] bg-blue-50/50 text-[#1B4DA0] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wide border border-[#1B4DA0]/5">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[10px] font-black text-[#1A1A2E] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 uppercase tracking-widest">
                        {candidate.roleType || 'Direct Hire'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${STAGE_COLORS[candidate.stage]?.dot || 'bg-slate-400'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${STAGE_COLORS[candidate.stage]?.count?.split(' ')[1] || 'text-[#1A1A2E]'}`}>
                          {candidate.stage}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (candidate.cvUrl) {
                              const url = candidate.cvUrl.startsWith('http') ? candidate.cvUrl : `${BASE_URL}${candidate.cvUrl.startsWith('/') ? '' : '/'}${candidate.cvUrl}`;
                              window.open(url, '_blank');
                            } else {
                              toast.error('No CV uploaded');
                            }
                          }}
                          className="p-2.5 bg-white text-[#6B6B7E] rounded-xl hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm border border-[#F4F3EF]"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
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
                  {PIPELINE_STAGES.filter(s => s !== "Screening").slice(0, 3).map((stage) => (
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
                  onClick={async () => {
                    const count = selectedIds.length;
                    if (window.confirm(`Are you sure you want to reject and remove ${count} selected candidates?`)) {
                      try {
                        // Optimistic local state update
                        const idsToRemove = [...selectedIds];
                        setCandidates(prev => prev.filter(c => !idsToRemove.includes(c.id)));
                        setSelectedIds([]);

                        const promises = idsToRemove.map(id =>
                          rejectPipelineCandidate(id, 'Batch Rejected')
                        );
                        await Promise.all(promises);
                        toast.success(`${count} candidates rejected successfully`);
                      } catch (error) {
                        toast.error("Failed to reject some candidates");
                        console.error(error);
                        fetchCandidates(); // Revert on failure
                      }
                    }
                  }}
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

                    if (withCV.length > 3 && !window.confirm(`You are about to open ${withCV.length} CVs. Your browser might block these popups. Continue?`)) {
                      return;
                    }

                    withCV.forEach((c, index) => {
                      // Small delay to bypass some simple popup blockers
                      setTimeout(() => {
                        const url = c.cvUrl.startsWith('http') ? c.cvUrl : `${BASE_URL}${c.cvUrl.startsWith('/') ? '' : '/'}${c.cvUrl}`;
                        window.open(url, '_blank');
                      }, index * 300);
                    });

                    toast.success(`Opening ${withCV.length} CV(s)...`);
                    // We don't clear selection here so user can do other actions after viewing
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
            className="fixed right-0 top-0 h-full w-full sm:w-[698px] bg-white z-[99999] overflow-y-auto shadow-[-16px_0_64px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-300 transform translate-x-0"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-10 py-10 flex items-center justify-between z-20">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#1A1A2E] leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {editMode ? "Refine Profile" : "Candidate Dossier"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditCandidate(selectedCandidate); setEditMode(true); }}
                  className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-blue-50 hover:text-[#1B4DA0] transition-all border border-[#E8E7E2] shadow-sm"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => { setSelectedCandidate(null); setEditMode(false); }}
                  className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm"
                >
                  <X size={24} />
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
                </div>
              ) : (
                <>
                  <div className="space-y-10">
                    {/* Hero Profile Section */}
                    <div className="flex flex-col items-center justify-center text-center py-4">
                      <div className="relative group">
                        <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-white text-4xl font-black shadow-2xl transform transition-transform duration-500 border-4 border-white ${getAvatarColor(selectedCandidate.name, selectedCandidate.avatar)}`}>
                          {selectedCandidate.avatar}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-[#E8E7E2] shadow-lg flex items-center justify-center text-emerald-500">
                          <CheckSquare size={20} fill="currentColor" className="text-white" />
                          <div className="absolute inset-0 bg-emerald-500 rounded-2xl flex items-center justify-center">
                            <CheckSquare size={18} className="text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 space-y-1 w-full">
                        <h3
                          onClick={() => { setEditCandidate(selectedCandidate); setEditMode(true); }}
                          className="text-3xl font-black text-[#1A1A2E] tracking-tight cursor-pointer hover:text-[#1B4DA0] transition-colors group flex items-center justify-center gap-3"
                        >
                          {selectedCandidate.name}
                          <Pencil size={14} className="opacity-0 group-hover:opacity-100 text-[#9B9BAD]" />
                        </h3>
                        <div className="flex items-center justify-center gap-3 mt-1.5 overflow-hidden">
                          <span className="text-[12px] font-black text-[#1B4DA0] uppercase tracking-[4px]">{selectedCandidate.role}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8E7E2]" />
                          <span className={`text-[11px] font-black uppercase tracking-[4px] ${STAGE_COLORS[selectedCandidate.stage]?.count?.split(' ')[1] || 'text-slate-600'}`}>
                            {selectedCandidate.stage}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-8">
                        {selectedCandidate.cvUrl && (
                          <button
                            onClick={() => {
                              const url = selectedCandidate.cvUrl.startsWith('http') ? selectedCandidate.cvUrl : `${BASE_URL}${selectedCandidate.cvUrl.startsWith('/') ? '' : '/'}${selectedCandidate.cvUrl}`;
                              window.open(url, '_blank');
                            }}
                            className="flex items-center gap-2 px-8 py-4 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold hover:bg-[#0D47A1] transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                          >
                            <Eye size={16} /> View Resume
                          </button>
                        )}
                        {(selectedCandidate.stage === 'Selected' || selectedCandidate.stage === 'Hired' || selectedCandidate.stage === 'Joined') && (
                          <button
                            onClick={() => {
                              setCredsCandidate({
                                id: selectedCandidate.id,
                                name: selectedCandidate.name,
                                email: selectedCandidate.email
                              });
                              setIsCredsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 whitespace-nowrap"
                          >
                            <Zap size={16} /> Generate Access
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Information Grid Container */}
                    <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-12 space-y-12 shadow-sm">
                      {/* Professional Info Column */}
                      <div className="grid grid-cols-2 gap-x-16 gap-y-10">
                        <div className="space-y-2 cursor-pointer group" onClick={() => { setEditCandidate(selectedCandidate); setEditMode(true); }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block text-left">Location</span>
                            <Pencil size={10} className="opacity-0 group-hover:opacity-100 text-[#9B9BAD]" />
                          </div>
                          <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2 text-left">
                            <MapPin size={16} className="text-[#1B4DA0] shrink-0" /> {selectedCandidate.location || "Not specified"}
                          </p>
                        </div>
                        <div className="space-y-2 cursor-pointer group" onClick={() => { setEditCandidate(selectedCandidate); setEditMode(true); }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block text-left">Experience</span>
                            <Pencil size={10} className="opacity-0 group-hover:opacity-100 text-[#9B9BAD]" />
                          </div>
                          <p className="text-base font-black text-[#1A1A2E] text-left">{selectedCandidate.experience || "0"} Years Total</p>
                        </div>
                        <div className="space-y-2 text-left cursor-pointer group" onClick={() => { setEditCandidate(selectedCandidate); setEditMode(true); }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Notice Period</span>
                            <Pencil size={10} className="opacity-0 group-hover:opacity-100 text-[#9B9BAD]" />
                          </div>
                          <p className="text-base font-black text-[#1A1A2E]">{selectedCandidate.noticePeriod || "N/A"}</p>
                        </div>
                        <div className="space-y-2 text-left cursor-pointer group" onClick={() => { setEditCandidate(selectedCandidate); setEditMode(true); }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Source</span>
                            <Pencil size={10} className="opacity-0 group-hover:opacity-100 text-[#9B9BAD]" />
                          </div>
                          <p className="text-base font-black text-[#1A1A2E]">{selectedCandidate.source || "Direct"}</p>
                        </div>
                      </div>

                      <div className="h-px bg-[#F4F3EF]" />

                      {/* Financial Context */}
                      <div className="grid grid-cols-2 gap-10">
                        <div className="bg-white p-6 rounded-[32px] border border-[#F4F3EF] shadow-sm flex flex-col items-center cursor-pointer group hover:border-[#1B4DA0]/30 transition-all" onClick={() => { setEditCandidate(selectedCandidate); setEditMode(true); }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Current CTC</span>
                            <Pencil size={10} className="opacity-0 group-hover:opacity-100 text-[#9B9BAD]" />
                          </div>
                          <p className="text-xl font-black text-[#1A1A2E]">{selectedCandidate.currentSalary || "N/A"}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-[#F4F3EF] shadow-sm ring-4 ring-[#1B4DA0]/5 flex flex-col items-center cursor-pointer group hover:ring-[#1B4DA0]/10 transition-all" onClick={() => { setEditCandidate(selectedCandidate); setEditMode(true); }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-[3px] block">Expected CTC</span>
                            <Pencil size={10} className="opacity-0 group-hover:opacity-100 text-[#1B4DA0]" />
                          </div>
                          <p className="text-xl font-black text-[#1B4DA0]">{selectedCandidate.expectedSalary || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="px-4 text-left cursor-pointer group" onClick={() => { setEditCandidate(selectedCandidate); setEditMode(true); }}>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Candidate Skill-set</span>
                        <Pencil size={10} className="opacity-0 group-hover:opacity-100 text-[#9B9BAD]" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedCandidate.skills) ? selectedCandidate.skills.map(s => (
                          <span key={s} className="px-5 py-2.5 bg-white border border-[#F4F3EF] rounded-xl text-xs font-bold text-[#1A1A2E] hover:border-[#1B4DA0] transition-colors cursor-pointer">
                            {s}
                          </span>
                        )) : (selectedCandidate.skills?.split(',').map(s => (
                          <span key={s} className="px-5 py-2.5 bg-white border border-[#F4F3EF] rounded-xl text-xs font-bold text-[#1A1A2E] hover:border-[#1B4DA0] transition-colors cursor-pointer">
                            {s.trim()}
                          </span>
                        )) || <span className="text-[#9B9BAD] font-bold text-sm italic">No skills listed</span>)}
                      </div>
                    </div>

                    {/* Communication Footnote */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-8 bg-[#FAFAF9] rounded-[32px] border border-[#F4F3EF] gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0]">
                          <Mail size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email Identity</p>
                          <p className="text-sm font-black text-[#1A1A2E]">{selectedCandidate.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0]">
                          <Phone size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Contact Verified</p>
                          <p className="text-sm font-black text-[#1A1A2E]">{selectedCandidate.phone}</p>
                        </div>
                      </div>
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

                  {/* Interview Feedback Section */}
                  {candidateFeedbacks[selectedCandidate.name?.toLowerCase().trim()] && (
                    <div className="space-y-4 pt-4 border-t border-[#F4F3EF]">
                      <h4 className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-[3px] border-b border-[#F4F3EF] pb-3 flex items-center justify-between">
                        Interviewer Feedback
                        <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100 uppercase tracking-widest">
                          {candidateFeedbacks[selectedCandidate.name?.toLowerCase().trim()].rating} / 5 STARS
                        </span>
                      </h4>
                      <div className="bg-[#FFF9EE] border border-[#FFE4B5]/30 p-5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                          <AlertCircle size={48} className="text-amber-900" />
                        </div>
                        <p className="text-sm font-medium text-[#1A1A2E] leading-relaxed relative z-10 italic">
                          "{candidateFeedbacks[selectedCandidate.name?.toLowerCase().trim()].note || "No detailed notes provided."}"
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-8 border-t border-[#F4F3EF] bg-white sticky bottom-0 z-20">
              {!editMode ? (
                <div className="flex gap-4">

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
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl transition-all duration-300 cursor-pointer"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div 
            className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-500 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E] text-left" style={{ fontFamily: "'Syne', sans-serif" }}>Add New Candidate</h3>

              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

                {/* Form fields start directly */}
                <div className="space-y-1.5 md:col-span-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest flex items-center justify-start gap-2 w-full">
                    Job Opening *
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-10"
                      value={candidateForm.positionId}
                      onChange={(e) => handlePositionChange(e.target.value)}
                      required
                    >
                      <option value="">Select Opening</option>
                      {positions.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} {p.clientName ? `(${p.clientName})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                  </div>
                  {candidateForm.positionId && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Matching</span>
                        <span className="text-[11px] font-bold text-indigo-800">Ready to match with this JD</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAiAutofill(candidateForm.resume)}
                        disabled={isParsing || isDiscovering}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg group ${
                          isParsing || isDiscovering
                            ? 'bg-indigo-100 text-indigo-600 animate-pulse' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-indigo-200'
                        }`}
                      >
                        <Sparkles size={14} className={`${isParsing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                        {isParsing || isDiscovering ? 'Discovery...' : 'Magic Match'}
                      </button>
                    </motion.div>
                  )}

                  {/* AI Suggested Candidates from Bank */}
                  <AnimatePresence>
                    {suggestedCandidates.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3"
                      >
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[2px]">Resume Bank Matches</span>
                          <button type="button" onClick={() => setSuggestedCandidates([])} className="text-[9px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest">Clear</button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {suggestedCandidates.map(c => (
                            <div key={c.id} className="group relative flex items-center gap-3 p-4 bg-white border border-[#F4F3EF] rounded-[24px] hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                              onClick={() => {
                                setCandidateForm({
                                  ...candidateForm,
                                  name: c.name,
                                  email: c.email,
                                  phone: c.phone,
                                  experience: c.experience,
                                  location: c.location,
                                  skills: Array.isArray(c.skills) ? c.skills.join(", ") : c.skills
                                });
                                setSuggestedCandidates([]);
                                toast.success(`Selected ${c.name} with AI Match!`);
                              }}
                            >
                              {/* Match Score Badge */}
                              <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-bl-xl shadow-lg">
                                {c.matchScore}% MATCH
                              </div>

                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md ${getAvatarColor(c.name, c.avatar)}`}>
                                {c.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-[#1A1A2E] truncate">{c.name}</p>
                                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mb-0.5">{c.matchReason || c.role}</p>
                                <p className="text-[9px] text-[#9B9BAD] font-bold uppercase truncate opacity-70">{c.experience} Exp • {c.location}</p>
                              </div>
                              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                <Plus size={18} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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
                  disabled={isCreating}
                  className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                >
                  {isCreating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Plus size={18} /> Add Candidate</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Schedule Interview Dialog */}
      {isScheduleOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl transition-all duration-300"
          onClick={() => setIsScheduleOpen(false)}>
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Schedule New Interview</h3>

              </div>
              <button onClick={() => setIsScheduleOpen(false)}
                className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSchedulingLoading(true);
              try {
                const durationValue = parseInt(scheduleForm.duration) || 60;
                await scheduleNewInterview({
                  candidateId: scheduleForm.candidateId,
                  candidateName: scheduleForm.candidateName,
                  candidateEmail: scheduleForm.candidateEmail,
                  positionTitle: scheduleForm.positionTitle,
                  clientName: scheduleForm.clientName,
                  interviewType: scheduleForm.round || scheduleForm.interviewType,
                  interviewDate: scheduleForm.date,
                  startTime: scheduleForm.time,
                  duration: durationValue,
                  meetingType: scheduleForm.mode === "Online" ? "Video" : (scheduleForm.mode === "Offline" ? "In-Person" : "Phone"),
                  meetingLink: scheduleForm.meetingLink || scheduleForm.locationLink,
                  interviewerName: scheduleForm.interviewerName,
                  interviewerRole: scheduleForm.interviewerRole,
                  interviewerId: scheduleForm.interviewerId || null,
                  interviewerType: scheduleForm.interviewerType || 'DepartmentTeam',
                  notes: scheduleForm.notes || ''
                });
                toast.success('Interview scheduled successfully!');
                setIsScheduleOpen(false);
                fetchCandidates();
              } catch (err) {
                toast.error(err.message || 'Failed to schedule interview');
              } finally {
                setSchedulingLoading(false);
              }
            }} className="p-10 max-h-[75vh] overflow-y-auto dialog-scrollbar space-y-8 text-left">

              {/* Section: Candidate Details */}
              <div className="space-y-6">


                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Candidate Name *</label>
                  <input className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none" value={scheduleForm.candidateName} readOnly />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Candidate Email</label>
                  <input type="email" value={scheduleForm.candidateEmail}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, candidateEmail: e.target.value }))}
                    placeholder="Enter email"
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                  />
                </div>
              </div>


              {/* Section: Interview Details */}
              <div className="space-y-6 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Date *</label>
                  <input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Time *</label>
                  <input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] pl-1">Interview Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setScheduleForm({ ...scheduleForm, mode: 'Online', subMode: 'with-client' })}
                      className={`py-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${scheduleForm.mode === 'Online' ? 'bg-[#EEF2FB] border-[#1B4DA0] text-[#1B4DA0] shadow-sm' : 'bg-[#FAFAFA] border-transparent text-gray-400 hover:border-gray-200'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${scheduleForm.mode === 'Online' ? 'bg-[#1B4DA0]' : 'bg-gray-300'}`} />
                      Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleForm({ ...scheduleForm, mode: 'Offline', subMode: 'at-client' })}
                      className={`py-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${scheduleForm.mode === 'Offline' ? 'bg-[#EEF2FB] border-[#1B4DA0] text-[#1B4DA0] shadow-sm' : 'bg-[#FAFAFA] border-transparent text-gray-400 hover:border-gray-200'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${scheduleForm.mode === 'Offline' ? 'bg-[#1B4DA0]' : 'bg-gray-300'}`} />
                      Offline
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] pl-1">
                    {scheduleForm.mode === 'Online' ? 'Online Setup' : 'Offline Venue'}
                  </label>
                  <div className="relative group">
                    <select
                      value={scheduleForm.subMode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setScheduleForm({
                          ...scheduleForm,
                          subMode: val,
                          locationLink: val === 'at-mabicons' ? 'https://maps.app.goo.gl/LrNdJKxqwQb35D88A' : ''
                        });
                      }}
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none cursor-pointer transition-all focus:bg-[#EEF2FB] appearance-none pr-12"
                    >
                      {scheduleForm.mode === 'Online' ? (
                        <>
                          <option value="with-client">Online (candidate with client)</option>
                          <option value="without-client">Online (candidate without client)</option>
                        </>
                      ) : (
                        <>
                          <option value="at-client">Offline (at client location)</option>
                          <option value="at-mabicons">Offline (at Mabicons)</option>
                        </>
                      )}
                    </select>
                    <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] rotate-90 pointer-events-none opacity-50" />
                  </div>
                </div>

                <AnimatePresence>
                  {scheduleForm.mode === 'Online' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] flex items-center gap-2 pl-1">
                        <FiVideo size={12} className="text-[#1B4DA0]" /> Google Meet Link
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input value={scheduleForm.meetingLink} onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                            className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50 font-bold"
                            placeholder="https://meet.google.com/xxx-xxxx-xxx" />
                          {scheduleForm.meetingLink && (
                            <button type="button" onClick={() => { navigator.clipboard.writeText(scheduleForm.meetingLink); toast.success('Copied to clipboard'); }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100">
                              <FiCopy className="w-4 h-4 text-[#9B9BAD]" />
                            </button>
                          )}
                        </div>
                        <button type="button"
                          onClick={() => setScheduleForm({ ...scheduleForm, meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}` })}
                          className="flex items-center gap-2 px-5 py-4 text-white text-sm font-bold rounded-2xl shadow-[0_10px_25px_rgba(27,77,160,0.3)] shadow-[#1B4DA0]/20 active:scale-95 transition-all outline-none"
                          style={{ background: 'linear-gradient(135deg, #1B4DA0, #3FA9F5)' }}>
                          Generate
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {scheduleForm.mode === 'Offline' && scheduleForm.subMode === 'at-client' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] flex items-center gap-2 pl-1">
                        <MapPin size={12} className="text-emerald-500" /> Location Link (Google Maps)
                      </label>
                      <input value={scheduleForm.locationLink} onChange={(e) => setScheduleForm({ ...scheduleForm, locationLink: e.target.value })}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] placeholder:text-[#9B9BAD]/50"
                        placeholder="https://maps.google.com/..." />
                    </motion.div>
                  )}

                  {scheduleForm.mode === 'Offline' && scheduleForm.subMode === 'at-mabicons' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden text-left">
                      <a href="https://maps.app.goo.gl/LrNdJKxqwQb35D88A" target="_blank" rel="noopener noreferrer"
                        className="block p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 hover:bg-emerald-100/50 transition-all cursor-pointer group">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <MapPin size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Office Location Attached</p>
                          <p className="text-[11px] font-bold text-[#1A1A2E] group-hover:text-emerald-700 transition-colors">Vasant Kunj, New Delhi</p>
                        </div>
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5 relative text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interviewer Name *</label>
                  <input value={scheduleForm.interviewerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setScheduleForm({ ...scheduleForm, interviewerName: val });
                      setShowInterviewerSuggestions(val.length > 0);
                    }}
                    onFocus={() => setShowInterviewerSuggestions(scheduleForm.interviewerName.length > 0)}
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                    placeholder="Assign member" />

                  <AnimatePresence>
                    {showInterviewerSuggestions && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute z-30 w-full mt-2 bg-white border border-[#F4F3EF] rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {availableInterviewers
                          .filter(hr => (hr.name || '').toLowerCase().includes((scheduleForm.interviewerName || '').toLowerCase().trim()))
                          .map((hr) => (
                            <button key={hr.id} type="button" className="w-full text-left px-4 py-3 flex flex-col transition-colors hover:bg-blue-50 border-b border-slate-100 last:border-0"
                              onClick={() => {
                                setScheduleForm(prev => ({
                                  ...prev,
                                  interviewerName: hr.name,
                                  interviewerRole: hr.role || 'HR recruitment',
                                  interviewerId: hr.id,
                                  interviewerType: hr.type || 'DepartmentTeam'
                                }));
                                setShowInterviewerSuggestions(false);
                              }}>
                              <span className="font-semibold text-sm text-[#1A1A2E]">{hr.name}</span>
                              <span className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-wider">{hr.role} • {hr.department}</span>
                            </button>
                          ))}
                        {availableInterviewers.filter(hr => (hr.name || '').toLowerCase().includes((scheduleForm.interviewerName || '').toLowerCase().trim())).length === 0 && (
                          <div className="p-4 text-center text-xs text-[#9B9BAD] font-bold tracking-widest uppercase py-6">No members found</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Interviewer Role</label>
                  <input value={scheduleForm.interviewerRole} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerRole: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                    placeholder="e.g. Tech Lead" />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setIsScheduleOpen(false)}
                  className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={schedulingLoading}
                  className="flex-[2] bg-[#1B4DA0] text-white py-5 rounded-3xl text-sm font-bold shadow-[0_10px_25px_rgba(27,77,160,0.3)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {schedulingLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCalendar size={18} /> Schedule Interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
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

      {/* Credential Generation Modal */}
      {isCredsModalOpen && credsCandidate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
          onClick={() => { if (!credsLoading) setIsCredsModalOpen(false); }}>
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#EEF2FB]">
              <div>
                <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Success! Candidate Hired</h3>
                <p className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-[3px] mt-1">Portal Provisioning</p>
              </div>
              <button onClick={() => { if (!credsLoading) setIsCredsModalOpen(false); }}
                className="w-10 h-10 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <X size={18} />
              </button>
            </div>

            <div className="p-10 space-y-6 text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-inner border border-emerald-100/50">
                <Award size={40} className="animate-bounce" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#1A1A2E]">{credsCandidate.name}</h4>
                <p className="text-sm text-[#9B9BAD] font-medium">{credsCandidate.email}</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#F8FAFF] border border-[#EEF2FB] text-left">
                <p className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Mail size={12} /> Email Notification
                </p>
                <p className="text-[11px] font-medium text-[#6B6B7E] leading-relaxed">
                  We'll generate a random password and send it to the candidate's email so they can log in to the ERP portal immediately.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setIsCredsModalOpen(false)}
                  disabled={credsLoading}
                  className="flex-1 py-4 rounded-2xl border-2 border-[#F4F3EF] text-[11px] font-bold text-[#6B6B7E] uppercase tracking-wider hover:bg-[#F4F3EF] transition-all disabled:opacity-50"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleGenerateCredentials}
                  disabled={credsLoading}
                  className="flex-[2] bg-[#1B4DA0] text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#1B4DA0]/20 hover:shadow-[#1B4DA0]/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-center"
                >
                  {credsLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Zap size={14} /> Create & Send account</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
