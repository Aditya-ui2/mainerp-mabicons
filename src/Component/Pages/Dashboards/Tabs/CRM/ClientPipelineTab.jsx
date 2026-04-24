import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiX, FiMail, FiPhone, FiCalendar, FiChevronRight, FiChevronDown, FiPlus, FiRefreshCw, FiSearch, FiFilter,
  FiUser, FiBriefcase, FiTag, FiAlignLeft, FiGrid, FiList, FiAlertCircle,
  FiCheckSquare, FiSquare, FiTrash, FiSend, FiMapPin, FiDollarSign, FiClock, FiAward,
  FiFileText, FiUpload, FiEye, FiVideo, FiStar, FiZap, FiDatabase, FiActivity, FiEdit3, FiEdit2,
  FiMoreHorizontal, FiTarget, FiExternalLink
} from 'react-icons/fi';
import ClientOnboardingForm from "./ClientOnboardingForm";
import { toast } from "react-hot-toast";

const PIPELINE_STAGES = ["All Clients", "Finalize", "Generate Password"];

const STAGE_COLORS = {
  "All Clients": {
    columnBg: "bg-[#F3F4F6]",
    dot: "bg-[#9CA3AF]",
    badge: "bg-[#E5E7EB] text-[#4B5563]",
    progress: "bg-[#9CA3AF]"
  },
  "Finalize": {
    columnBg: "bg-[#FFFBEB]",
    dot: "bg-[#FBBF24]",
    badge: "bg-[#FEF3C7] text-[#92400E]",
    progress: "bg-[#FBBF24]"
  },
  "Generate Password": {
    columnBg: "bg-[#EFF6FF]",
    dot: "bg-[#60A5FA]",
    badge: "bg-[#DBEAFE] text-[#1E40AF]",
    progress: "bg-[#60A5FA]"
  }
};

export default function ClientPipelineTab({ clients = [], setClients }) {
  const [viewMode, setViewMode] = useState("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const filteredClients = useMemo(() => {
    return (clients || []).filter(c => 
      c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  const getAvatarColor = (name) => {
    const colors = ['bg-[#60A5FA]', 'bg-[#A78BFA]', 'bg-[#34D399]', 'bg-[#FBBF24]', 'bg-[#F87171]'];
    const index = (name || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const handleDragEnd = (event, info, client) => {
    const x = info.point.x;
    const windowWidth = window.innerWidth;
    const boardWidth = windowWidth - 280; // Account for sidebar
    const colWidth = boardWidth / 3;
    
    let newStage = client.stage;
    if (x < 280 + colWidth) newStage = PIPELINE_STAGES[0];
    else if (x < 280 + colWidth * 2) newStage = PIPELINE_STAGES[1];
    else newStage = PIPELINE_STAGES[2];

    if (newStage !== client.stage) {
      const updatedClients = clients.map(c => 
        c.id === client.id ? { ...c, stage: newStage } : c
      );
      setClients(updatedClients);
      toast.success(`Moved to ${newStage}`);
    }
  };

  const PipelineCard = ({ client }) => {
    const stageInfo = STAGE_COLORS[client.stage] || STAGE_COLORS["All Clients"];
    
    return (
      <motion.div
        layoutId={client.id}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={(e, info) => handleDragEnd(e, info, client)}
        whileDrag={{ scale: 1.05, rotate: 2, zIndex: 100, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
        whileHover={{ y: -4 }}
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col group transition-all cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(client.companyName)}`}>
              {client.companyName.substring(0, 1).toUpperCase()}
            </div>
            <FiEdit2 size={14} className="text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
          </div>

          <div className="space-y-1 mb-6 text-left">
            <h4 className="text-[15px] font-bold text-[#111827] line-clamp-1">{client.companyName}</h4>
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">{client.industry || "Information Technology"}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-medium text-[#9CA3AF]">{client.contactPerson}</span>
              <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
              <span className="text-[10px] font-medium text-[#9CA3AF]">ERP</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest">Pipeline Progress</span>
              <span className="text-[9px] font-bold text-[#9CA3AF]">{client.probability || 25}%</span>
            </div>
            <div className="h-1 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${client.probability || 25}%` }}
                className={`h-full ${stageInfo.progress}`}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={() => setSelectedClient(client)}
          className="w-full py-3 bg-white border-t border-[#F3F4F6] text-[11px] font-bold text-[#1B4DA0] hover:bg-[#F9FAFB] transition-colors flex items-center justify-center gap-2 pointer-events-auto"
        >
          <FiEye size={12} /> View Details
        </button>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="text-left">
          <h2 className="text-[28px] font-bold text-[#111827] tracking-tight">Client Pipeline</h2>
          <p className="text-[13px] font-medium text-[#6B7280] mt-1">{clients.length} Total Clients in Pipeline</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F9F8F6] border border-[#E5E7EB] rounded-[18px] p-1.5 flex gap-1 shadow-sm">
            <button 
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${viewMode === "kanban" ? "bg-white text-[#1B4DA0] shadow-sm" : "text-[#6B7280] hover:bg-white/50"}`}
            >
              <FiGrid size={16} /> Kanban
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${viewMode === "list" ? "bg-white text-[#1B4DA0] shadow-sm" : "text-[#6B7280] hover:bg-white/50"}`}
            >
              <FiList size={16} /> List
            </button>
          </div>
          
          <button className="h-[52px] px-6 bg-white border border-[#E5E7EB] text-[#1B4DA0] text-[13px] font-bold rounded-2xl flex items-center gap-2.5 shadow-sm hover:bg-[#F9FAFB] transition-all">
            <FiDatabase size={18} /> Sync Data
          </button>

          <button 
            onClick={() => setIsAddClientOpen(true)}
            className="h-[52px] px-8 bg-[#1B4DA0] text-white text-[13px] font-bold rounded-2xl flex items-center gap-2.5 shadow-lg shadow-blue-500/25 hover:bg-[#153D80] transition-all"
          >
            <FiPlus size={20} /> Add Client
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 px-2">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
          <input 
            type="text"
            placeholder="Search by company, role, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FDFCF8] border border-[#E5E7EB] rounded-2xl py-4 pl-14 pr-6 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-[#1B4DA0]/10 focus:border-[#1B4DA0] transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          {["ALL DATE", "ALL OPENINGS", "ALL CLIENTS"].map(filter => (
            <button key={filter} className="h-14 px-6 bg-white border border-[#E5E7EB] rounded-2xl text-[10px] font-bold text-[#111827] tracking-[1px] flex items-center justify-between gap-8 hover:bg-[#F9FAFB] transition-all shadow-sm min-w-[160px]">
              {filter}
              <FiChevronDown size={14} className="text-[#9CA3AF]" />
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Area */}
      {viewMode === "kanban" ? (
        <div className="flex gap-6 overflow-x-auto pb-10 px-2 min-h-[600px]">
          {PIPELINE_STAGES.map(stage => {
            const stageInfo = STAGE_COLORS[stage];
            const stageClients = filteredClients.filter(c => c.stage === stage);
            
            return (
              <div key={stage} className={`flex-1 min-w-[320px] rounded-[24px] ${stageInfo.columnBg} border border-[#E5E7EB]/50 flex flex-col`}>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${stageInfo.dot}`} />
                    <h3 className="text-[14px] font-bold text-[#374151]">{stage}</h3>
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${stageInfo.badge}`}>
                    {stageClients.length}
                  </div>
                </div>
                
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {stageClients.map(client => (
                      <PipelineCard key={client.id} client={client} />
                    ))}
                  </AnimatePresence>
                  
                  {stageClients.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-[#9CA3AF] space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Clients</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden mx-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {["Company", "Industry", "Value", "Stage", "Progress", ""].map((h, i) => (
                  <th key={i} className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filteredClients.map(client => (
                <tr key={client.id} className="group hover:bg-[#F9FAFB] transition-all cursor-pointer" onClick={() => setSelectedClient(client)}>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(client.companyName)}`}>
                        {client.companyName.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-bold text-[#111827]">{client.companyName}</p>
                        <p className="text-[11px] text-[#6B7280]">{client.contactPerson}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-left">
                    <span className="text-[12px] text-[#4B5563]">{client.industry}</span>
                  </td>
                  <td className="px-8 py-4 text-left">
                    <span className="text-[13px] font-bold text-[#059669]">{client.value}</span>
                  </td>
                  <td className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${STAGE_COLORS[client.stage]?.dot || 'bg-slate-400'}`} />
                      <span className="text-[12px] font-medium text-[#4B5563]">{client.stage}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 w-[160px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div className={`h-full ${STAGE_COLORS[client.stage]?.progress || 'bg-slate-400'}`} style={{ width: `${client.probability || 25}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-[#6B7280]">{client.probability || 25}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <FiChevronRight className="text-[#9CA3AF] group-hover:text-[#1B4DA0] transition-all" size={18} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientOnboardingForm 
        isOpen={isAddClientOpen} 
        onClose={() => setIsAddClientOpen(false)} 
        onComplete={(newClientData) => {
          const id = (clients.length + 1).toString();
          setClients([...clients, {
            id,
            companyName: newClientData.companyName,
            contactPerson: newClientData.contactPerson,
            email: newClientData.contactEmail,
            phone: newClientData.contactPhone || "N/A",
            industry: newClientData.industry || "General",
            value: newClientData.valuation || "TBD",
            stage: 'All Clients',
            location: newClientData.location || "Remote",
            lastContact: new Date().toISOString().split('T')[0],
            avatar: (newClientData.companyName || "C").substring(0, 2).toUpperCase(),
            owner: newClientData.assignedKAM || "Current User",
            probability: 10
          }]);
          setIsAddClientOpen(false);
          toast.success("New client workflow initiated!");
        }}
      />

      <AnimatePresence>
        {selectedClient && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
              onClick={() => setSelectedClient(null)}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[500px] bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-[#F3F4F6] flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#111827]">Client Details</h2>
                <button onClick={() => setSelectedClient(null)} className="w-10 h-10 rounded-lg bg-[#F9FAFB] text-[#6B7280] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 text-left">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ${getAvatarColor(selectedClient.companyName)}`}>
                    {selectedClient.companyName.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-[#111827]">{selectedClient.companyName}</h3>
                    <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">{selectedClient.industry}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#F3F4F6]">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Contact Person</p>
                    <p className="text-[14px] font-bold text-[#374151]">{selectedClient.contactPerson}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Pipeline Stage</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[selectedClient.stage]?.dot || 'bg-slate-400'}`} />
                      <p className="text-[14px] font-bold text-[#374151]">{selectedClient.stage}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Deal Value</p>
                    <p className="text-[14px] font-bold text-[#059669]">{selectedClient.value}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Last Contact</p>
                    <p className="text-[14px] font-bold text-[#374151]">{selectedClient.lastContact}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#F3F4F6]">
                  <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Contact Information</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                      <FiMail className="text-[#1B4DA0]" size={18} />
                      <p className="text-[14px] font-medium text-[#374151]">{selectedClient.email}</p>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                      <FiPhone className="text-[#1B4DA0]" size={18} />
                      <p className="text-[14px] font-medium text-[#374151]">{selectedClient.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-[#F3F4F6] bg-[#F9FAFB]">
                <button className="w-full py-4 bg-[#1B4DA0] text-white rounded-xl font-bold text-[14px] shadow-lg shadow-blue-500/20 hover:bg-[#153D80] transition-all">
                  Edit Client Profile
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}
