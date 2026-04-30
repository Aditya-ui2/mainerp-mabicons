import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX, FiMail, FiPhone, FiPlus, FiSearch, FiChevronDown,
  FiChevronRight, FiUser, FiGrid, FiList, FiRefreshCw,
  FiEye, FiTrash, FiMapPin, FiActivity, FiLock, FiEdit2, FiSave, FiCheckSquare, FiCheck, FiDatabase
} from 'react-icons/fi';
import { LayoutGrid, List, Plus } from 'lucide-react';
import ClientOnboardingForm from "./ClientOnboardingForm";
import { toast } from "react-hot-toast";
import { getAllClients, createClient, editClient } from "../../../service/api";

const PIPELINE_STAGES = ["Lead Stage", "Finalize", "Onboarding Complete"];

const STAGE_STYLE = {
  "Lead Stage": {
    dot: "bg-[#F59E0B]",
    badge: "bg-[#FFF9EB] text-[#B45309]",
    label: "Lead Stage",
    bar: "bg-[#F59E0B]",
    columnBg: "bg-[#FFF9EB]",
    columnBorder: "border-[#FDE68A]"
  },
  "Finalize": {
    dot: "bg-[#3B82F6]",
    badge: "bg-[#EFF6FF] text-[#1D4ED8]",
    label: "Finalize",
    bar: "bg-[#3B82F6]",
    columnBg: "bg-[#EFF6FF]",
    columnBorder: "border-[#BFDBFE]"
  },
  "Onboarding Complete": {
    dot: "bg-[#8B5CF6]",
    badge: "bg-[#F5F3FF] text-[#6D28D9]",
    label: "Onboarding",
    icon: true,
    bar: "bg-[#8B5CF6]",
    columnBg: "bg-[#F5F3FF]",
    columnBorder: "border-[#DDD6FE]"
  },
};

const AVATAR_BG = '#EEF2FB';
const AVATAR_TEXT = '#1B4DA0';

const DetailCard = ({ label, value }) => (
  <div className="p-4 bg-[#FAFAF9] rounded-2xl border border-[#F4F3EF] space-y-1">
    <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider">{label}</p>
    <p className="text-[13px] font-bold text-[#1A1A2E] truncate">{value || '—'}</p>
  </div>
);

export default function ClientPipelineTab({ clients: propClients = [], setClients: setPropClients }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
  const [finalizingClient, setFinalizingClient] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const dragItem = useRef(null);
  const dragOverStage = useRef(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await getAllClients();
      const raw = res?.data?.clients || res?.clients || res || [];
      const mapped = (Array.isArray(raw) ? raw : []).map(c => {
        const stage = c.stage || (c.status === 'Requested' ? 'Lead Stage' : 'Onboarding Complete');
        return {
          ...c,
          id: c._id || c.id,
          companyName: c.companyName || c.name || 'Unknown',
          contactPerson: c.spocName || c.contactPerson || c.name || '',
          email: c.spocEmail || c.email || '',
          phone: c.contactNumber || c.phone || '',
          industry: c.category?.[0] || c.industry || 'General',
          location: c.corporateAddress || c.location || '',
          stage: stage,
          assignKAM: c.assignKAM || c.owner || 'Not Assigned',
          probability: stage === 'Onboarding Complete' ? 100 : (stage === 'Finalize' ? 50 : 25),
          lastContact: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '',
        };
      });
      setClients(mapped);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      // Fall back to prop clients if API fails
      if (propClients.length) setClients(propClients);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  useEffect(() => {
    if (selectedClient) {
      setEditForm({
        ...selectedClient,
        clientId: selectedClient.id
      });
      setIsEditing(false);
    }
  }, [selectedClient]);

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map frontend fields back to database fields
      const payload = {
        ...editForm,
        spocName: editForm.contactPerson,
        spocEmail: editForm.email,
        contactNumber: editForm.phone,
        corporateAddress: editForm.location,
        category: [editForm.industry]
      };

      const res = await editClient(payload);
      if (res.success) {
        toast.success("Client updated successfully!");
        // Update local state with the mapped fields
        const updatedClient = {
          ...selectedClient,
          ...editForm
        };
        setClients(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
        setSelectedClient(updatedClient);
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update client");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch =
        c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStage = stageFilter === 'All' || c.stage === stageFilter;
      return matchSearch && matchStage;
    });
  }, [clients, searchQuery, stageFilter]);

  const uniqueStages = ['All', ...Array.from(new Set(clients.map(c => c.stage).filter(Boolean)))];

  const handleDragStart = (clientId) => { dragItem.current = clientId; };
  const handleDragOver = (e, stage) => { e.preventDefault(); dragOverStage.current = stage; };
  const handleDrop = (e, stage) => {
    e.preventDefault();
    const clientId = dragItem.current;
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client && client.stage !== stage) {
        if (stage === 'Onboarding Complete') {
          setFinalizingClient(client);
          setIsFinalizeOpen(true);
        } else {
          const newProb = stage === 'Finalize' ? 50 : 25;

          // Optimistically update local state
          setClients(prev => prev.map(c =>
            c.id === clientId ? { ...c, stage: stage, probability: newProb } : c
          ));

          // Persist to backend
          editClient({ clientId: clientId, stage: stage, probability: newProb })
            .then(() => toast.success(`Moved to ${stage}`))
            .catch(() => {
              toast.error(`Failed to update stage`);
              // Rollback on failure
              fetchClients();
            });
        }
      }
    }
    dragItem.current = null;
    dragOverStage.current = null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <div className="flex flex-col text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Client Pipeline
          </h1>
          <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mt-1">
            {clients.length} Total Clients in Pipeline
          </p>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          {/* View toggle — matching standardized format */}
          <div className="bg-[#F4F3EF] rounded-2xl p-1.5 flex gap-1.5 border border-[#F4F3EF] shadow-sm">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${viewMode === 'kanban' ? 'bg-white text-[#1B4DA0] shadow-md' : 'text-[#9B9BAD] hover:text-[#1B4DA0]'}`}
            >
              <LayoutGrid size={16} className={viewMode === 'kanban' ? 'text-[#1B4DA0]' : 'text-[#9B9BAD]'} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-[#1B4DA0] shadow-md' : 'text-[#9B9BAD] hover:text-[#1B4DA0]'}`}
            >
              <List size={16} className={viewMode === 'list' ? 'text-[#1B4DA0]' : 'text-[#9B9BAD]'} /> List
            </button>
          </div>

          <button
            onClick={fetchClients}
            className="group flex items-center gap-2.5 px-7 py-4 bg-white text-[#1B4DA0] border border-[#F4F3EF] rounded-2xl text-[13px] font-bold hover:bg-[#F8FAFF] hover:border-blue-100 transition-all duration-300 shadow-sm active:scale-95"
            disabled={loading}
          >
            <FiDatabase size={18} className={`text-[#1B4DA0] transition-transform group-hover:scale-110 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2.5 px-8 py-4 bg-[#1B4DA0] text-white rounded-2xl text-[14px] font-bold hover:bg-[#153e82] transition-all duration-300 shadow-[0_10px_25px_rgba(27,77,160,0.25)] hover:shadow-[0_15px_35px_rgba(27,77,160,0.35)] active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Add Client
          </button>
        </div>
      </div>

      {/* Ultra-Premium Standardized Search & Filter Bar */}
      <div className="bg-white border border-[#F4F3EF] rounded-[40px] p-2 shadow-sm mb-10 flex items-center gap-3">
        {/* Search Field */}
        <div className="relative flex-[2.5] group">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, contact, or email..."
            className="w-full bg-[#F4F3EF] border-none rounded-full py-4 pl-16 pr-6 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/5 outline-none transition-all placeholder:text-[#9B9BAD] placeholder:font-bold"
          />
        </div>

        {/* Date Filter (Standardized UI) */}
        <div className="relative flex-1 group">
          <select
            className="w-full bg-[#F4F3EF] text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-full pl-6 pr-12 py-4 outline-none border-0 cursor-pointer appearance-none hover:bg-[#EEF2FB] transition-all"
          >
            <option value="all">All Date</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
        </div>

        {/* Stage Filter */}
        <div className="relative flex-1 group">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full bg-[#F4F3EF] text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-full pl-6 pr-12 py-4 outline-none border-0 cursor-pointer appearance-none hover:bg-[#EEF2FB] transition-all"
          >
            {uniqueStages.map(s => <option key={s} value={s}>{s === 'All' ? 'ALL STAGES' : s.toUpperCase()}</option>)}
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
        </div>
      </div>

      {/* List View — same style as My Team */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[40px_2fr_1fr_1.5fr_1fr_1.2fr_40px] gap-4 px-8 py-5 border-b border-[#F4F3EF] bg-[#FAFAFA]/30">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedRowIds.length === filteredClients.length && filteredClients.length > 0}
                onChange={() => setSelectedRowIds(selectedRowIds.length === filteredClients.length ? [] : filteredClients.map(c => c.id))}
                className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer"
              />
            </div>
            <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left pl-[56px]">Company</div>
            <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Industry</div>
            <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Contact</div>
            <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Stage</div>
            <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Progress</div>
            <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left"></div>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-24 text-center">
              <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">No clients found</p>
            </div>
          ) : filteredClients.map((c) => {
            const isSelected = selectedRowIds.includes(c.id);
            const initials = (c.companyName || '?').slice(0, 2).toUpperCase();
            const stageStyle = STAGE_STYLE[c.stage] || STAGE_STYLE["Onboarding Complete"];
            return (
              <div
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`grid grid-cols-[40px_2fr_1fr_1.5fr_1fr_1.2fr_40px] gap-4 items-center px-8 py-4 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group ${isSelected ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => setSelectedRowIds(prev =>
                      prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                    )}
                    className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 group-hover:scale-105 transition-transform border border-[#DBEAFE]"
                    style={{ backgroundColor: AVATAR_BG, color: AVATAR_TEXT }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#1B4DA0] transition-colors">{c.companyName}</p>
                    {c.location && <p className="text-[11px] text-[#9B9BAD] flex items-center gap-1 truncate"><FiMapPin size={10} />{c.location}</p>}
                  </div>
                </div>
                <div className="text-[13px] font-medium text-[#64748b] truncate text-left">{c.industry}</div>
                <div className="min-w-0 text-left">
                  <p className="text-[13px] font-medium text-[#64748b] truncate">{c.contactPerson}</p>
                  <p className="text-[11px] text-[#9B9BAD] truncate">{c.email}</p>
                </div>
                <div className="text-left min-w-[140px] space-y-1">
                  {(() => {
                    const sName = c.stage === 'All Clients' ? 'Onboarding Complete' : c.stage;
                    const stageStyle = STAGE_STYLE[sName] || STAGE_STYLE["Onboarding Complete"];
                    const isLead = sName === 'Lead Stage';
                    const isFinalize = sName === 'Finalize';
                    return (
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${(isLead || isFinalize) ? (isLead ? 'text-amber-600' : 'text-blue-600') + ' bg-transparent border-none' : stageStyle.badge} !pl-0`}>
                          {stageStyle.label || sName}
                          {stageStyle.icon && <FiCheck size={12} className="shrink-0" />}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#F4F3EF] rounded-full overflow-hidden">
                    <div className={`h-full ${stageStyle.bar}`} style={{ width: `${c.probability}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#9B9BAD] w-8 text-right">{c.probability}%</span>
                </div>
                <div className="flex justify-end">
                  <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#1B4DA0] transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-6 overflow-x-auto pb-10 min-h-[500px]">
          {PIPELINE_STAGES.map(stage => {
            const stageStyle = STAGE_STYLE[stage];
            const stageClients = filteredClients.filter(c => c.stage === stage);
            return (
              <div
                key={stage}
                className={`flex-1 min-w-[300px] ${stageStyle.columnBg} rounded-[24px] border ${stageStyle.columnBorder} flex flex-col shadow-sm`}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className={`p-5 flex items-center justify-between border-b ${stageStyle.columnBorder}/50`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${stageStyle.dot} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                    <h3 className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-[1.2px] flex items-center gap-2">
                      {stageStyle.label || stage}
                      {stageStyle.icon && <FiCheck size={14} className="text-[#8B5CF6] shrink-0" />}
                    </h3>
                  </div>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${stageStyle.badge} shadow-sm border ${stageStyle.columnBorder}/30`}>
                    {stageClients.length}
                  </div>
                </div>
                <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                  {stageClients.map(c => {
                    const initials = (c.companyName || '?').slice(0, 2).toUpperCase();
                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={() => handleDragStart(c.id)}
                        onClick={() => setSelectedClient(c)}
                        className="bg-white rounded-[20px] border border-[#F4F3EF] shadow-sm p-5 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border border-[#DBEAFE]"
                            style={{ backgroundColor: AVATAR_BG, color: AVATAR_TEXT }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-[13px] font-bold text-[#0f172a] truncate group-hover:text-[#1B4DA0]">{c.companyName}</p>
                            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">{c.industry}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-left">
                          <div className="flex flex-col">
                            <span className="text-[11px] text-[#9B9BAD]">{c.contactPerson}</span>
                          </div>
                          <FiChevronRight size={14} className="text-[#C5C5D2] group-hover:text-[#1B4DA0]" />
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest">Progress</span>
                            <span className="text-[9px] font-bold text-[#9B9BAD]">{c.probability || 25}%</span>
                          </div>
                          <div className="h-1 bg-[#F4F3EF] rounded-full overflow-hidden">
                            <div className={`h-full ${stageStyle.bar}`} style={{ width: `${c.probability || 25}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stageClients.length === 0 && (
                    <div className="py-10 text-center border-2 border-dashed border-[#F4F3EF] rounded-2xl">
                      <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest opacity-50">Drop clients here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating bulk action bar */}
      {createPortal(
        <AnimatePresence>
          {selectedRowIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 100, x: '-50%' }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1500] flex items-center gap-6 px-10 py-5 bg-[#1A1A2E] rounded-[32px] shadow-2xl min-w-[480px] border border-white/5 active:cursor-grabbing"
            >
              <div className="flex items-center gap-4 pr-8 border-r border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-[#0D47A1] flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {selectedRowIds.length}
                </div>
                <div>
                  <p className="text-[14px] font-black text-white">Client{selectedRowIds.length > 1 ? 's' : ''} Selected</p>
                  <button onClick={() => setSelectedRowIds([])} className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors">Deselect All</button>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-1 justify-center text-white">
                <button
                  onClick={() => {
                    const emails = clients.filter(c => selectedRowIds.includes(c.id)).map(c => c.email).join(',');
                    window.location.href = `mailto:${emails}`;
                  }}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl hover:bg-white/5 active:scale-95 transition-all"
                >
                  <FiMail size={16} className="text-blue-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Email</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedRowIds.length === 1) {
                      const c = clients.find(x => x.id === selectedRowIds[0]);
                      if (c) setSelectedClient(c);
                    }
                  }}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl hover:bg-white/5 active:scale-95 transition-all"
                >
                  <FiEye size={16} className="text-emerald-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">View</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Remove ${selectedRowIds.length} client(s)?`)) {
                      setClients(prev => prev.filter(c => !selectedRowIds.includes(c.id)));
                      toast.success(`${selectedRowIds.length} client(s) removed`);
                      setSelectedRowIds([]);
                    }
                  }}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl hover:bg-white/5 active:scale-95 transition-all"
                >
                  <FiTrash size={16} className="text-red-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Remove</span>
                </button>
              </div>
              <button
                onClick={() => setSelectedRowIds([])}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all text-[#9B9BAD]"
              >
                <FiX size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Client Modal (Minimal) */}
      <ClientOnboardingForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        mode="minimal"
        onComplete={async (newClientData) => {
          try {
            // Map the minimal data to what the API expects
            const payload = {
              companyName: newClientData.companyName,
              spocName: newClientData.spocName,
              ownerEmail: newClientData.spocEmail, // Use SPOC email as base email
              spocPhone: newClientData.spocPhone,
              industry: newClientData.industry,
              stage: 'Lead Stage',
              status: 'Requested',
              probability: 25
            };

            const res = await createClient(payload);
            if (res.success) {
              setClients(prev => [{
                ...res.data,
                stage: 'Lead Stage', // Set to Lead Stage stage immediately
                probability: 10
              }, ...prev]);
              setIsAddOpen(false);
              toast.success("Client added to pipeline for finalization!");
            }
          } catch (error) {
            toast.error(error.message || "Failed to add client");
          }
        }}
      />

      {/* Finalize Onboarding Modal (Full) */}
      <ClientOnboardingForm
        isOpen={isFinalizeOpen}
        onClose={() => setIsFinalizeOpen(false)}
        mode="full"
        initialData={finalizingClient}
        onComplete={async (completeData) => {
          try {
            const payload = {
              ...completeData,
              clientId: finalizingClient.id,
              stage: 'Onboarding Complete',
              status: 'Accepted',
              probability: 100
            };

            const res = await editClient(payload);
            if (res.success) {
              const updated = {
                ...res.data,
                stage: 'Onboarding Complete',
                status: 'Accepted',
                probability: 100
              };
              setClients(prev => prev.map(c => c.id === finalizingClient.id ? { ...c, ...updated } : c));
              setIsFinalizeOpen(false);
              setFinalizingClient(null);
              toast.success("Client onboarding completed!");
            }
          } catch (error) {
            toast.error(error.message || "Failed to complete onboarding");
          }
        }}
      />

      {/* Client Detail Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedClient && (
            <div key="client-drawer-portal" className="fixed inset-0 z-[1100]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedClient(null)}
                className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute inset-y-0 right-0 w-full max-w-[520px] bg-white shadow-2xl flex flex-col border-l border-[#F4F3EF]"
              >
                {/* Header */}
                <div className="px-10 py-10 border-b border-[#F4F3EF] flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: '"Syne", sans-serif' }}>Client Detail</h2>
                    {isEditing && <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Editing Mode</p>}
                  </div>
                  <div className="flex gap-4">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-12 h-12 rounded-xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center hover:bg-blue-100 transition-all shadow-sm"
                      >
                        <FiEdit2 size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all shadow-sm"
                      >
                        {isSaving ? <FiRefreshCw className="animate-spin" size={20} /> : <FiSave size={20} />}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedClient(null);
                        setIsEditing(false);
                      }}
                      className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-24 h-24 rounded-[40px] flex items-center justify-center text-3xl font-black shadow-xl mb-6 border-2 border-white ring-4 ring-[#EEF2FB]"
                      style={{ backgroundColor: '#EEF2FB', color: '#1B4DA0' }}
                    >
                      {(editForm.companyName || selectedClient.companyName || '?').slice(0, 2).toUpperCase()}
                    </div>
                    {isEditing ? (
                      <div className="w-full max-w-[300px] space-y-4">
                        <input
                          className="w-full text-center text-2xl font-black text-[#1A1A2E] bg-slate-50 rounded-xl py-2 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-syne"
                          value={editForm.companyName || ''}
                          onChange={(e) => handleEditChange('companyName', e.target.value)}
                          placeholder="Company Name"
                        />
                        <input
                          className="w-full text-center text-[11px] font-black text-[#1B4DA0] uppercase tracking-[3px] bg-white border-b border-dashed border-slate-200 outline-none hover:border-blue-300 transition-colors"
                          value={editForm.industry || ''}
                          onChange={(e) => handleEditChange('industry', e.target.value)}
                          placeholder="Industry"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-black text-[#1A1A2E]">{selectedClient.companyName}</h3>
                        <p className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[3px] mt-1">{selectedClient.industry}</p>
                      </>
                    )}
                    <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${(STAGE_STYLE[selectedClient.stage] || STAGE_STYLE['Onboarding Complete']).badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${(STAGE_STYLE[selectedClient.stage] || STAGE_STYLE['Onboarding Complete']).dot}`} />
                      {(STAGE_STYLE[selectedClient.stage] || STAGE_STYLE['Onboarding Complete']).label || selectedClient.stage}
                      {(STAGE_STYLE[selectedClient.stage] || STAGE_STYLE['Onboarding Complete']).icon && <FiCheck size={14} className="shrink-0" />}
                    </span>
                  </div>

                  {/* Info Table */}
                  <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-10 space-y-8">
                    {[
                      { label: 'Contact Person', key: 'contactPerson', val: selectedClient.contactPerson, icon: <FiUser size={14} /> },
                      { label: 'Assigned KAM', key: 'assignKAM', val: selectedClient.assignKAM || 'Not Assigned', icon: <FiUser size={14} />, highlight: true },
                      { label: 'Location', key: 'location', val: selectedClient.location || '—', icon: <FiMapPin size={14} /> },
                      { label: 'GST Number', key: 'gstNumber', val: selectedClient.gstNumber || '—', icon: <FiActivity size={14} /> },
                      { label: 'CIN Number', key: 'cinNumber', val: selectedClient.cinNumber || '—', icon: <FiActivity size={14} /> },
                    ].map(({ label, key, val, icon, highlight }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${highlight ? 'bg-[#1B4DA0]/10 text-[#1B4DA0]' : 'bg-white text-[#9B9BAD] shadow-sm'}`}>
                            {icon}
                          </div>
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">{label}</span>
                        </div>
                        {isEditing ? (
                          <input
                            className={`text-[13px] font-black text-right bg-white px-3 py-1 rounded-lg border border-slate-100 outline-none focus:ring-2 focus:ring-blue-50 transition-all ${highlight ? 'text-[#1B4DA0]' : 'text-[#1A1A2E]'}`}
                            value={editForm[key] || ''}
                            onChange={(e) => handleEditChange(key, e.target.value)}
                          />
                        ) : (
                          <span className={`text-[13px] font-black ${highlight ? 'text-[#1B4DA0]' : 'text-[#1A1A2E]'}`}>{val}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Additional Sections */}
                  <div className="space-y-8">
                    {/* Agreement & Compliance */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] ml-4">Agreement & Compliance</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Agreement', key: 'agreementType' },
                          { label: 'Effective', key: 'agreementEffectiveDate' },
                          { label: 'Fee', key: 'feeAmount' },
                          { label: 'Payment', key: 'paymentTerms' },
                          { label: 'MSME', key: 'msmeRegistered' },
                          { label: 'Shops', key: 'shopsLicense' },
                        ].map(field => (
                          isEditing ? (
                            <div key={field.key} className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-100 space-y-1 hover:border-blue-200 transition-all group/field">
                              <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider group-hover/field:text-blue-400 transition-colors">{field.label}</p>
                              <input
                                className="w-full text-[13px] font-bold text-[#1A1A2E] bg-transparent outline-none"
                                value={editForm[field.key] || ''}
                                onChange={(e) => handleEditChange(field.key, e.target.value)}
                              />
                            </div>
                          ) : (
                            <DetailCard key={field.key} label={field.label} value={selectedClient[field.key]} />
                          )
                        ))}
                      </div>
                    </div>

                    {/* Payroll & Workforce */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] ml-4">Payroll & Workforce</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Employees', key: 'totalEmployees' },
                          { label: 'Cycle', key: 'payrollCycle' },
                          { label: 'PF', key: 'pfApplicable' },
                          { label: 'ESIC', key: 'esicApplicable' },
                        ].map(field => (
                          isEditing ? (
                            <div key={field.key} className="p-4 bg-[#FAFAF9] rounded-2xl border border-[#F4F3EF] space-y-1">
                              <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider">{field.label}</p>
                              <input
                                className="w-full text-[13px] font-bold text-[#1A1A2E] bg-transparent outline-none"
                                value={editForm[field.key] || ''}
                                onChange={(e) => handleEditChange(field.key, e.target.value)}
                              />
                            </div>
                          ) : (
                            <DetailCard key={field.key} label={field.label} value={selectedClient[field.key]} />
                          )
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {(selectedClient.onboardingNotes || isEditing) && (
                      <div className="p-6 bg-[#FAFAF9] rounded-3xl border border-[#F4F3EF] space-y-2">
                        <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Onboarding Notes</h4>
                        {isEditing ? (
                          <textarea
                            className="w-full text-sm text-[#4B4B5E] leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-50 min-h-[100px] transition-all"
                            value={editForm.onboardingNotes || ''}
                            onChange={(e) => handleEditChange('onboardingNotes', e.target.value)}
                            placeholder="Add internal notes about this client..."
                          />
                        ) : (
                          <p className="text-sm text-[#4B4B5E] leading-relaxed italic">"{selectedClient.onboardingNotes}"</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-10 border-t border-[#F4F3EF]">
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      setIsEditing(false);
                    }}
                    className="w-full py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-2xl text-[11px] font-black uppercase tracking-[3px] hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95"
                  >
                    Close Details
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
