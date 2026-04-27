import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX, FiMail, FiPhone, FiPlus, FiSearch, FiChevronDown,
  FiChevronRight, FiUser, FiGrid, FiList, FiRefreshCw,
  FiEye, FiTrash, FiMapPin, FiActivity, FiLock
} from 'react-icons/fi';
import ClientOnboardingForm from "./ClientOnboardingForm";
import { toast } from "react-hot-toast";
import { getAllClients, createClient } from "../../../service/api";

const PIPELINE_STAGES = ["All Clients", "Finalize", "Generate Password"];

const STAGE_STYLE = {
  "All Clients":       { dot: "bg-slate-400",   badge: "bg-slate-100 text-slate-600",   bar: "bg-slate-400" },
  "Finalize":          { dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700",   bar: "bg-amber-400" },
  "Generate Password": { dot: "bg-blue-400",    badge: "bg-blue-100 text-blue-700",     bar: "bg-blue-400"  },
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const dragItem = useRef(null);
  const dragOverStage = useRef(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await getAllClients();
      const raw = res?.data?.clients || res?.clients || res || [];
      const mapped = (Array.isArray(raw) ? raw : []).map(c => ({
        ...c,
        id: c._id || c.id,
        companyName: c.companyName || c.name || 'Unknown',
        contactPerson: c.spocName || c.contactPerson || c.name || '',
        email: c.spocEmail || c.email || '',
        phone: c.contactNumber || c.phone || '',
        industry: c.category?.[0] || c.industry || 'General',
        location: c.corporateAddress || c.location || '',
        stage: c.stage || 'All Clients',
        assignKAM: c.assignKAM || c.owner || 'Not Assigned',
        probability: c.probability || 25,
        lastContact: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : '',
      }));
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
    if (dragItem.current && dragOverStage.current && dragItem.current !== stage) {
      setClients(prev => prev.map(c =>
        c.id === dragItem.current ? { ...c, stage: dragOverStage.current } : c
      ));
      toast.success(`Moved to ${dragOverStage.current}`);
    }
    dragItem.current = null;
    dragOverStage.current = null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Client Pipeline
          </h1>
          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] text-left">
            {clients.length} clients • MANAGE YOUR PIPELINE
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          {/* View toggle */}
          <div className="bg-[#F4F3EF] rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-[#1B4DA0] shadow-sm' : 'text-[#9B9BAD]'}`}
            >
              <FiList size={14} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-white text-[#1B4DA0] shadow-sm' : 'text-[#9B9BAD]'}`}
            >
              <FiGrid size={14} />
            </button>
          </div>
          <button
            onClick={fetchClients}
            className="flex items-center gap-2 px-5 py-3 bg-white text-[#6B6B7E] border border-[#F4F3EF] rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <FiRefreshCw size={14} className={`text-[#1B4DA0] ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FiPlus size={18} /> Add Client
          </button>
        </div>
      </div>

      {/* Filter Bar — same as My Team */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, contact, email..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>
        <div className="relative">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
          >
            {uniqueStages.map(s => <option key={s} value={s}>{s === 'All' ? 'All Stages' : s}</option>)}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
        </div>
      </div>

      {/* List View — same style as My Team */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[40px_2.5fr_1.5fr_2fr_1.5fr_1fr_40px] gap-4 px-8 py-5 border-b border-[#F4F3EF]">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedRowIds.length === filteredClients.length && filteredClients.length > 0}
                onChange={() => setSelectedRowIds(selectedRowIds.length === filteredClients.length ? [] : filteredClients.map(c => c.id))}
                className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer"
              />
            </div>
            {["Company", "Industry", "Contact", "Stage", "Progress", ""].map((h, i) => (
              <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">{h}</div>
            ))}
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
            const stageStyle = STAGE_STYLE[c.stage] || STAGE_STYLE["All Clients"];
            return (
              <div
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`grid grid-cols-[40px_2.5fr_1.5fr_2fr_1.5fr_1fr_40px] gap-4 items-center px-8 py-4 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group ${isSelected ? 'bg-blue-50/30' : ''}`}
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
                <div className="text-left">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stageStyle.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${stageStyle.dot}`} />
                    {c.stage}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#F4F3EF] rounded-full overflow-hidden">
                    <div className={`h-full ${stageStyle.bar}`} style={{ width: `${c.probability || 25}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#9B9BAD] w-8 text-right">{c.probability || 25}%</span>
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
                className="flex-1 min-w-[300px] bg-[#F8FAFF] rounded-[24px] border border-[#F4F3EF] flex flex-col"
                onDragOver={(e) => handleDragOver(e, stage)}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="p-5 flex items-center justify-between border-b border-[#F4F3EF]">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stageStyle.dot}`} />
                    <h3 className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-[1px]">{stage}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${stageStyle.badge}`}>{stageClients.length}</span>
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
                          <span className="text-[11px] text-[#9B9BAD]">{c.contactPerson}</span>
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

      {/* Add Client Modal */}
      <ClientOnboardingForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onComplete={async (newClientData) => {
          try {
            const res = await createClient(newClientData);
            if (res.success) {
              setClients(prev => [{
                ...res.data,
                stage: 'All Clients',
                probability: 10
              }, ...prev]);
              setIsAddOpen(false);
              toast.success("Client added successfully!");
            }
          } catch (error) {
            toast.error(error.message || "Failed to add client");
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
                  <h2 className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: '"Syne", sans-serif' }}>Client Detail</h2>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-24 h-24 rounded-[40px] flex items-center justify-center text-3xl font-black shadow-xl mb-6 border-2 border-white ring-4 ring-[#EEF2FB]"
                      style={{ backgroundColor: '#EEF2FB', color: '#1B4DA0' }}
                    >
                      {(selectedClient.companyName || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1A2E]">{selectedClient.companyName}</h3>
                    <p className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[3px] mt-1">{selectedClient.industry}</p>
                    <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${(STAGE_STYLE[selectedClient.stage] || STAGE_STYLE['All Clients']).badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${(STAGE_STYLE[selectedClient.stage] || STAGE_STYLE['All Clients']).dot}`} />
                      {selectedClient.stage}
                    </span>
                  </div>

                  {/* Info Table */}
                  <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-10 space-y-8">
                    {[
                      { label: 'Contact Person', val: selectedClient.contactPerson, icon: <FiUser size={14} /> },
                      { label: 'Assigned KAM', val: selectedClient.assignKAM || 'Not Assigned', icon: <FiUser size={14} />, highlight: true },
                      { label: 'Location', val: selectedClient.location || '—', icon: <FiMapPin size={14} /> },
                      { label: 'GST Number', val: selectedClient.gstNumber || '—', icon: <FiActivity size={14} /> },
                      { label: 'CIN Number', val: selectedClient.cinNumber || '—', icon: <FiActivity size={14} /> },
                    ].map(({ label, val, icon, highlight }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${highlight ? 'bg-[#1B4DA0]/10 text-[#1B4DA0]' : 'bg-white text-[#9B9BAD] shadow-sm'}`}>
                            {icon}
                          </div>
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">{label}</span>
                        </div>
                        <span className={`text-[13px] font-black ${highlight ? 'text-[#1B4DA0]' : 'text-[#1A1A2E]'}`}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Additional Sections */}
                  <div className="space-y-8">
                    {/* Agreement & Compliance */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] ml-4">Agreement & Compliance</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailCard label="Agreement" value={selectedClient.agreementType} />
                        <DetailCard label="Effective" value={selectedClient.agreementEffectiveDate} />
                        <DetailCard label="Fee" value={selectedClient.feeAmount} />
                        <DetailCard label="Payment" value={selectedClient.paymentTerms} />
                        <DetailCard label="MSME" value={selectedClient.msmeRegistered} />
                        <DetailCard label="Shops" value={selectedClient.shopsLicense || 'NA'} />
                      </div>
                    </div>

                    {/* Payroll & Workforce */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] ml-4">Payroll & Workforce</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailCard label="Employees" value={selectedClient.totalEmployees} />
                        <DetailCard label="Cycle" value={selectedClient.payrollCycle} />
                        <DetailCard label="PF" value={selectedClient.pfApplicable} />
                        <DetailCard label="ESIC" value={selectedClient.esicApplicable} />
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {selectedClient.onboardingNotes && (
                      <div className="p-6 bg-[#FAFAF9] rounded-3xl border border-[#F4F3EF] space-y-2">
                         <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Onboarding Notes</h4>
                         <p className="text-sm text-[#4B4B5E] leading-relaxed italic">"{selectedClient.onboardingNotes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-10 border-t border-[#F4F3EF]">
                  <button
                    onClick={() => setSelectedClient(null)}
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
